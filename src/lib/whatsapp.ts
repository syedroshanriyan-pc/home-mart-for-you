/**
 * WhatsApp Business Platform Cloud API Service
 * Official Meta Graph API integration for Homemart4u
 *
 * Strict Security Principles:
 * - Never log access tokens or full customer PII
 * - WhatsApp message delivery/read events NEVER mark orders as PAID
 * - Failures are logged and persisted in WhatsAppMessage without breaking order flow
 * - Signatures verified using HMAC-SHA256 with WHATSAPP_APP_SECRET
 */

import crypto from "crypto";
import { prisma } from "./prisma";

export interface WhatsAppConfig {
  accessToken: string;
  phoneNumberId: string;
  businessAccountId?: string;
  verifyToken: string;
  appSecret?: string;
  apiVersion: string;
  isEnabled: boolean;
}

export function getWhatsAppConfig(): WhatsAppConfig {
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN?.trim() || "";
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID?.trim() || "";
  const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN?.trim() || "";
  const appSecret = process.env.WHATSAPP_APP_SECRET?.trim() || "";
  const apiVersion = process.env.WHATSAPP_API_VERSION?.trim() || "v21.0";
  const businessAccountId = process.env.WHATSAPP_BUSINESS_ACCOUNT_ID?.trim();

  const isEnabled = Boolean(accessToken && phoneNumberId);

  return {
    accessToken,
    phoneNumberId,
    businessAccountId,
    verifyToken,
    appSecret,
    apiVersion,
    isEnabled,
  };
}

/**
 * Standardize recipient phone number to E.164 without '+' (e.g. 919876543210)
 */
export function formatWhatsAppPhone(phone: string): string {
  const cleaned = phone.replace(/[^0-9]/g, "");
  if (cleaned.length === 10) {
    return `91${cleaned}`;
  }
  if (cleaned.length === 11 && cleaned.startsWith("0")) {
    return `91${cleaned.slice(1)}`;
  }
  return cleaned;
}

/**
 * Verify Meta Webhook HMAC-SHA256 Signature
 */
export function verifyWhatsAppSignature(rawBody: string, signatureHeader?: string | null): boolean {
  const config = getWhatsAppConfig();
  if (!config.appSecret) {
    // If no app secret configured in dev/test, warn but require in prod
    if (process.env.NODE_ENV === "production") {
      console.error("[WHATSAPP_SECURITY] Missing WHATSAPP_APP_SECRET in production");
      return false;
    }
    return true;
  }

  if (!signatureHeader) return false;

  const parts = signatureHeader.split("=");
  if (parts.length !== 2 || parts[0] !== "sha256") return false;

  const expectedHash = parts[1];
  const hmac = crypto.createHmac("sha256", config.appSecret);
  hmac.update(rawBody, "utf8");
  const calculatedHash = hmac.digest("hex");

  try {
    return crypto.timingSafeEqual(Buffer.from(expectedHash, "hex"), Buffer.from(calculatedHash, "hex"));
  } catch {
    return false;
  }
}

/**
 * Dispatch message via Meta WhatsApp Cloud API
 */
async function sendRawWhatsAppPayload(
  to: string,
  payload: Record<string, unknown>,
  messageType: string,
  orderId?: string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const config = getWhatsAppConfig();
  const formattedPhone = formatWhatsAppPhone(to);

  // If WhatsApp credentials not configured, record skipped message for audit
  if (!config.isEnabled) {
    console.info(`[WHATSAPP_UNCONFIGURED] Skipped ${messageType} to ${formattedPhone} (Set WHATSAPP_ACCESS_TOKEN and WHATSAPP_PHONE_NUMBER_ID to activate)`);
    try {
      await (prisma as any).whatsAppMessage.create({
        data: {
          orderId: orderId || null,
          recipientPhone: formattedPhone,
          messageType,
          status: "QUEUED",
          errorDetails: "WhatsApp Cloud API credentials unconfigured in environment",
        },
      });
    } catch (e) {
      // Non-blocking
    }
    return { success: false, error: "WhatsApp credentials unconfigured" };
  }

  const url = `https://graph.facebook.com/${config.apiVersion}/${config.phoneNumberId}/messages`;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${config.accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: formattedPhone,
        ...payload,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      const errMsg = data?.error?.message || `HTTP ${res.status}`;
      console.error(`[WHATSAPP_SEND_ERROR] ${errMsg}`);

      await (prisma as any).whatsAppMessage.create({
        data: {
          orderId: orderId || null,
          recipientPhone: formattedPhone,
          messageType,
          status: "FAILED",
          errorDetails: errMsg,
        },
      });

      return { success: false, error: errMsg };
    }

    const providerMessageId = data?.messages?.[0]?.id;

    await (prisma as any).whatsAppMessage.create({
      data: {
        orderId: orderId || null,
        recipientPhone: formattedPhone,
        messageType,
        status: "SENT",
        providerMessageId: providerMessageId || null,
        sentAt: new Date(),
      },
    });

    return { success: true, messageId: providerMessageId };
  } catch (err: any) {
    console.error(`[WHATSAPP_DISPATCH_EXCEPTION]`, err.message);
    try {
      await (prisma as any).whatsAppMessage.create({
        data: {
          orderId: orderId || null,
          recipientPhone: formattedPhone,
          messageType,
          status: "FAILED",
          errorDetails: err.message,
        },
      });
    } catch {
      // Non-blocking
    }
    return { success: false, error: err.message };
  }
}

/**
 * Send standard text message
 */
export async function sendWhatsAppText(
  to: string,
  bodyText: string,
  orderId?: string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  return sendRawWhatsAppPayload(
    to,
    {
      type: "text",
      text: { preview_url: true, body: bodyText },
    },
    "TEXT",
    orderId
  );
}

/**
 * Send Order Summary to Customer
 */
export async function sendWhatsAppOrderSummary(order: {
  id: string;
  orderNumber: string;
  user?: { mobile?: string; name?: string } | null;
  items?: Array<{
    productNameSnapshot?: string;
    variantNameSnapshot?: string;
    quantity: number;
    unitPriceMinor?: number;
    lineTotalMinor?: number;
  }>;
  subtotalMinor?: number;
  discountMinor?: number;
  deliveryFeeMinor?: number;
  totalMinor: number;
  paymentMethod?: string;
  payment?: { status?: string } | null;
}): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const phone = order.user?.mobile;
  if (!phone) return { success: false, error: "Recipient mobile missing" };

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://homemart4u.in";
  const trackingUrl = `${baseUrl}/account/orders/${order.id}`;

  const itemsList = (order.items || [])
    .map(
      (it) =>
        `• ${it.productNameSnapshot || "Item"} (${it.variantNameSnapshot || "Qty"} x${it.quantity}) - ₹${(
          (it.lineTotalMinor || 0) / 100
        ).toFixed(2)}`
    )
    .join("\n");

  const totalRupees = (order.totalMinor / 100).toFixed(2);
  const paymentState =
    order.payment?.status === "COMPLETED"
      ? "Paid (Online)"
      : order.paymentMethod === "COD"
      ? "Cash on Delivery (Pending)"
      : "Pending Online Payment";

  const message = [
    `🍗 *Homemart4u — Order Confirmation*`,
    `Order *#${order.orderNumber}* placed successfully!`,
    ``,
    `*Items Ordered:*`,
    itemsList || "• Fresh meat selection",
    ``,
    `*Payable Total:* ₹${totalRupees}`,
    `*Payment Mode:* ${paymentState}`,
    ``,
    `📍 Track your delivery in real-time:`,
    `${trackingUrl}`,
    ``,
    `Thank you for choosing Homemart4u — Fresh Chicken & Meats!`,
  ].join("\n");

  return sendRawWhatsAppPayload(
    phone,
    {
      type: "text",
      text: { preview_url: true, body: message },
    },
    "ORDER_SUMMARY",
    order.id
  );
}

/**
 * Send Dynamic Payment Request via WhatsApp
 */
export async function sendWhatsAppPaymentRequest(
  order: {
    id: string;
    orderNumber: string;
    user?: { mobile?: string; name?: string } | null;
    totalMinor: number;
  },
  paymentDetails: {
    amountRupees: number;
    upiUri: string;
    merchantVpa?: string;
    payeeName?: string;
    expiresAt?: string;
  }
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const phone = order.user?.mobile;
  if (!phone) return { success: false, error: "Recipient mobile missing" };

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://homemart4u.in";
  const orderPayUrl = `${baseUrl}/account/orders/${order.id}`;

  const message = [
    `💳 *Homemart4u — Secure Payment Request*`,
    `Order Reference: *#${order.orderNumber}*`,
    `Amount Due: *₹${paymentDetails.amountRupees.toFixed(2)}*`,
    `Payee: *${paymentDetails.payeeName || "Fresh Chicken Centre"}* (${paymentDetails.merchantVpa || "7975137618@okbizaxis"})`,
    ``,
    `To complete your payment securely, click the link below:`,
    `${orderPayUrl}`,
    ``,
    `⚠️ *Security Advisory:*`,
    `• Pay only the exact amount shown (₹${paymentDetails.amountRupees.toFixed(2)}).`,
    `• Never share your UPI PIN or OTP with anyone, including delivery partners.`,
  ].join("\n");

  return sendRawWhatsAppPayload(
    phone,
    {
      type: "text",
      text: { preview_url: true, body: message },
    },
    "PAYMENT_REQUEST",
    order.id
  );
}

/**
 * Send Payment Confirmation via WhatsApp
 */
export async function sendWhatsAppPaymentConfirmation(
  order: {
    id: string;
    orderNumber: string;
    user?: { mobile?: string; name?: string } | null;
  },
  confirmation: {
    amountRupees: number;
    upiTxnRef?: string;
    confirmedAt?: Date;
  }
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const phone = order.user?.mobile;
  if (!phone) return { success: false, error: "Recipient mobile missing" };

  const timeStr = (confirmation.confirmedAt || new Date()).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const message = [
    `✅ *Homemart4u — Payment Confirmed!*`,
    `Order Reference: *#${order.orderNumber}*`,
    `Amount Confirmed: *₹${confirmation.amountRupees.toFixed(2)}*`,
    `Status: *PAID & VERIFIED*`,
    confirmation.upiTxnRef ? `Bank UTR / Ref: *${confirmation.upiTxnRef}*` : "",
    `Time: ${timeStr}`,
    ``,
    `Our kitchen hub is preparing your fresh hygienic cuts now!`,
  ]
    .filter(Boolean)
    .join("\n");

  return sendRawWhatsAppPayload(
    phone,
    {
      type: "text",
      text: { preview_url: false, body: message },
    },
    "PAYMENT_CONFIRMATION",
    order.id
  );
}

/**
 * Send Delivery Status Update via WhatsApp
 */
export async function sendWhatsAppDeliveryStatus(
  order: {
    id: string;
    orderNumber: string;
    user?: { mobile?: string; name?: string } | null;
  },
  status: "OUT_FOR_DELIVERY" | "DELIVERED",
  extra?: { agentName?: string; agentPhone?: string }
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const phone = order.user?.mobile;
  if (!phone) return { success: false, error: "Recipient mobile missing" };

  let message = "";
  if (status === "OUT_FOR_DELIVERY") {
    message = [
      `🛵 *Homemart4u — Out for Delivery!*`,
      `Order *#${order.orderNumber}* is on its way to your doorstep.`,
      extra?.agentName ? `Delivery Partner: *${extra.agentName}*` : "",
      extra?.agentPhone ? `Contact: ${extra.agentPhone}` : "",
      ``,
      `Please keep exact cash ready if paying by COD, or request an instant doorstep QR from our agent.`,
    ]
      .filter(Boolean)
      .join("\n");
  } else {
    message = [
      `🎉 *Homemart4u — Order Delivered!*`,
      `Order *#${order.orderNumber}* has been successfully delivered.`,
      ``,
      `We hope you enjoy your tender, freshly cut meats. Thank you for choosing Homemart4u!`,
    ].join("\n");
  }

  return sendRawWhatsAppPayload(
    phone,
    {
      type: "text",
      text: { preview_url: false, body: message },
    },
    "DELIVERY_STATUS",
    order.id
  );
}

/**
 * Process inbound WhatsApp Webhook Event
 */
export async function processWhatsAppWebhookEvent(body: any): Promise<{ handled: boolean; eventCount: number }> {
  const entries = body?.entry || [];
  let count = 0;

  for (const entry of entries) {
    const changes = entry?.changes || [];
    for (const change of changes) {
      if (change.field !== "messages") continue;
      const value = change.value;

      // Status updates (sent, delivered, read, failed)
      const statuses = value?.statuses || [];
      for (const st of statuses) {
        count++;
        const messageId = st.id;
        const statusStr = (st.status || "").toUpperCase(); // SENT, DELIVERED, READ, FAILED
        const timestamp = st.timestamp ? new Date(parseInt(st.timestamp, 10) * 1000) : new Date();

        try {
          const updateData: Record<string, any> = {
            status: statusStr,
          };
          if (statusStr === "DELIVERED") updateData.deliveredAt = timestamp;
          if (statusStr === "READ") updateData.readAt = timestamp;
          if (statusStr === "FAILED") {
            const errDetail = st.errors?.[0]?.message || "Delivery failed";
            updateData.errorDetails = errDetail;
          }

          await (prisma as any).whatsAppMessage.updateMany({
            where: { providerMessageId: messageId },
            data: updateData,
          });

          // Also record deduplicated webhook event
          await (prisma as any).paymentWebhookEvent.create({
            data: {
              eventId: `wa_status_${messageId}_${statusStr}`,
              provider: "WHATSAPP",
              eventType: `STATUS_${statusStr}`,
              providerTxnRef: messageId,
              processingState: "PROCESSED",
              processingOutcome: `WhatsApp message ${messageId} marked ${statusStr}`,
              deduplicationKey: `wa_${messageId}_${statusStr}`,
              payloadJson: JSON.stringify(st),
            },
          });
        } catch (e: any) {
          // If unique constraint error, duplicate event ignored
          console.warn("[WHATSAPP_WEBHOOK_DUPLICATE_OR_ERROR]", e.message);
        }
      }
    }
  }

  return { handled: true, eventCount: count };
}
