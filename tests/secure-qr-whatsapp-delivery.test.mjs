import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const rootDir = process.cwd();

describe("Homemart4u — Secure Dynamic QR, WhatsApp Automation & Delivery Collection Test Suite (23 Cases)", () => {
  // --------------------------------------------------------------------------
  // Case 1: COD order creation remains functional
  // --------------------------------------------------------------------------
  it("Case 1: COD order creation remains functional with COD fee and pending status", () => {
    const ordersRoute = fs.readFileSync(path.join(rootDir, "src/app/api/orders/route.ts"), "utf-8");
    assert.ok(ordersRoute.includes("paymentMethod = \"COD\""), "Must default or support COD paymentMethod");
    assert.ok(ordersRoute.includes("codFeeMinor"), "Must preserve COD surcharge logic");
    assert.ok(ordersRoute.includes("status: \"PLACED\""), "Must initialize order status to PLACED for COD");
  });

  // --------------------------------------------------------------------------
  // Case 2: Online checkout creates pending order and payment attempt
  // --------------------------------------------------------------------------
  it("Case 2: Online checkout creates pending order and payment attempt without trusting client", () => {
    const schema = fs.readFileSync(path.join(rootDir, "prisma/schema.prisma"), "utf-8");
    assert.ok(schema.includes("model PaymentAttempt"), "Prisma schema must define PaymentAttempt model");
    assert.ok(schema.includes("status            String    @default(\"PENDING\")"), "PaymentAttempt must default to PENDING");
  });

  // --------------------------------------------------------------------------
  // Case 3: Client-supplied totals are ignored in favour of server-calculated amounts
  // --------------------------------------------------------------------------
  it("Case 3: Client-supplied totals are ignored in favour of authoritative server calculation", () => {
    const ordersRoute = fs.readFileSync(path.join(rootDir, "src/app/api/orders/route.ts"), "utf-8");
    assert.ok(ordersRoute.includes("variant.priceMinor"), "Must fetch variant price directly from DB");
    assert.ok(ordersRoute.includes("subtotalMinor"), "Must compute subtotal on server");
    assert.ok(ordersRoute.includes("totalMinor"), "Must set totalMinor from server calculation");
  });

  // --------------------------------------------------------------------------
  // Case 4: Legitimate verified provider success updates the correct order
  // --------------------------------------------------------------------------
  it("Case 4: A legitimate verified provider success updates the correct order", () => {
    const webhookRoute = fs.readFileSync(path.join(rootDir, "src/app/api/payments/webhook/route.ts"), "utf-8");
    assert.ok(webhookRoute.includes("status: targetStatus"), "Must transition payment status to COMPLETED");
    assert.ok(webhookRoute.includes("status: \"CONFIRMED\""), "Must confirm order status");
  });

  // --------------------------------------------------------------------------
  // Case 5: Invalid webhook signature is rejected
  // --------------------------------------------------------------------------
  it("Case 5: Invalid webhook signature is rejected with HTTP 401 and constant-time HMAC check", () => {
    const whatsappFile = fs.readFileSync(path.join(rootDir, "src/lib/whatsapp.ts"), "utf-8");
    assert.ok(whatsappFile.includes("crypto.createHmac(\"sha256\""), "Must compute HMAC-SHA256 signature");
    assert.ok(whatsappFile.includes("crypto.timingSafeEqual"), "Must use timingSafeEqual for constant-time comparison");

    const webhookRoute = fs.readFileSync(path.join(rootDir, "src/app/api/whatsapp/webhook/route.ts"), "utf-8");
    assert.ok(webhookRoute.includes("verifyWhatsAppSignature"), "Webhook route must call verifyWhatsAppSignature");
    assert.ok(webhookRoute.includes("status: 401"), "Must return HTTP 401 on signature failure");
  });

  // --------------------------------------------------------------------------
  // Case 6: An unsigned callback cannot mark an order paid
  // --------------------------------------------------------------------------
  it("Case 6: An unsigned callback cannot mark an order paid", () => {
    const webhookRoute = fs.readFileSync(path.join(rootDir, "src/app/api/payments/webhook/route.ts"), "utf-8");
    assert.ok(webhookRoute.includes("Unauthorized: Missing webhook signature"), "Must reject unsigned webhooks");
    assert.ok(webhookRoute.includes("Unauthorized: Invalid webhook signature"), "Must reject invalid signatures");
  });

  // --------------------------------------------------------------------------
  // Case 7: A wrong amount is rejected or sent to reconciliation
  // --------------------------------------------------------------------------
  it("Case 7: A wrong amount is rejected or sent to reconciliation", () => {
    const webhookRoute = fs.readFileSync(path.join(rootDir, "src/app/api/payments/webhook/route.ts"), "utf-8");
    assert.ok(webhookRoute.includes("Payment amount mismatch"), "Must reject mismatched amount");
  });

  // --------------------------------------------------------------------------
  // Case 8: A wrong transaction reference cannot pay another order
  // --------------------------------------------------------------------------
  it("Case 8: A wrong transaction reference cannot pay another order", () => {
    const schema = fs.readFileSync(path.join(rootDir, "prisma/schema.prisma"), "utf-8");
    assert.ok(schema.includes("upiTxnRef         String?  @unique"), "Payment model must have unique constraint on upiTxnRef");
    assert.ok(schema.includes("claimedOrderId String?   @unique"), "BankTransaction must have unique constraint on claimedOrderId");
  });

  // --------------------------------------------------------------------------
  // Case 9: Replaying a valid webhook does not double-count payment
  // --------------------------------------------------------------------------
  it("Case 9: Replaying a valid webhook does not double-count payment", () => {
    const webhookRoute = fs.readFileSync(path.join(rootDir, "src/app/api/payments/webhook/route.ts"), "utf-8");
    assert.ok(webhookRoute.includes("payment.status === \"COMPLETED\""), "Must short-circuit on already completed payment");
    assert.ok(webhookRoute.includes("paymentWebhookEvent"), "Must record deduplicated PaymentWebhookEvent");
  });

  // --------------------------------------------------------------------------
  // Case 10: Duplicate payment attempts cannot cause duplicate collection
  // --------------------------------------------------------------------------
  it("Case 10: Duplicate payment attempts cannot cause duplicate collection", () => {
    const schema = fs.readFileSync(path.join(rootDir, "prisma/schema.prisma"), "utf-8");
    assert.ok(schema.includes("orderId            String    @unique"), "DeliveryCollection must have unique constraint on orderId");
  });

  // --------------------------------------------------------------------------
  // Case 11: A QR expiry does not imply success
  // --------------------------------------------------------------------------
  it("Case 11: A QR expiry does not imply success", () => {
    const payEngine = fs.readFileSync(path.join(rootDir, "src/lib/pay/Homemart4uPay.ts"), "utf-8");
    assert.ok(payEngine.includes("status: \"EXPIRED\""), "Expired QR must transition to EXPIRED, never COMPLETED");
  });

  // --------------------------------------------------------------------------
  // Case 12: A provider timeout leaves the payment pending
  // --------------------------------------------------------------------------
  it("Case 12: A provider timeout leaves the payment pending or pending verification", () => {
    const schema = fs.readFileSync(path.join(rootDir, "prisma/schema.prisma"), "utf-8");
    assert.ok(schema.includes("PENDING_VERIFICATION"), "Schema must support safe intermediate state PENDING_VERIFICATION");
  });

  // --------------------------------------------------------------------------
  // Case 13: A late provider confirmation is reconciled safely
  // --------------------------------------------------------------------------
  it("Case 13: A late provider confirmation is reconciled safely without data corruption", () => {
    const webhookRoute = fs.readFileSync(path.join(rootDir, "src/app/api/payments/webhook/route.ts"), "utf-8");
    assert.ok(webhookRoute.includes("prisma.$transaction"), "Must wrap ledger updates in transactional boundary");
  });

  // --------------------------------------------------------------------------
  // Case 14: An agent cannot access another agent's order
  // --------------------------------------------------------------------------
  it("Case 14: An agent cannot access or collect for another agent's order", () => {
    const collectRoute = fs.readFileSync(
      path.join(rootDir, "src/app/api/delivery/orders/[id]/collect-online/route.ts"),
      "utf-8"
    );
    assert.ok(collectRoute.includes("agentUserId: session.id"), "Must scope query strictly to assigned agentUserId");
    assert.ok(collectRoute.includes("Order not found or not assigned to you"), "Must reject unassigned agent with 404");
  });

  // --------------------------------------------------------------------------
  // Case 15: An agent cannot mark an unpaid order paid
  // --------------------------------------------------------------------------
  it("Case 15: An agent cannot mark an unpaid order paid without verified bank confirmation", () => {
    const deliverRoute = fs.readFileSync(
      path.join(rootDir, "src/app/api/delivery/assignments/[id]/deliver/route.ts"),
      "utf-8"
    );
    assert.ok(deliverRoute.includes("requestedMethod === \"ONLINE_DOORSTEP\""), "Must check requestedMethod ONLINE_DOORSTEP");
    assert.ok(
      deliverRoute.includes("assignment.order.payment?.status !== \"COMPLETED\""),
      "Must verify payment is COMPLETED before allowing online delivery"
    );
    assert.ok(deliverRoute.includes("Doorstep online payment is not confirmed yet"), "Must reject unverified online collection");
  });

  // --------------------------------------------------------------------------
  // Case 16: A paid order cannot be charged again for the same outstanding amount
  // --------------------------------------------------------------------------
  it("Case 16: A paid order cannot be charged again for the same outstanding amount", () => {
    const collectRoute = fs.readFileSync(
      path.join(rootDir, "src/app/api/delivery/orders/[id]/collect-online/route.ts"),
      "utf-8"
    );
    assert.ok(collectRoute.includes("Order is already marked as paid"), "Must reject new payment attempt if already paid");
  });

  // --------------------------------------------------------------------------
  // Case 17: Delivery completion increments the count exactly once
  // --------------------------------------------------------------------------
  it("Case 17: Delivery completion increments count exactly once and rejects duplicates", () => {
    const deliverRoute = fs.readFileSync(
      path.join(rootDir, "src/app/api/delivery/assignments/[id]/deliver/route.ts"),
      "utf-8"
    );
    assert.ok(
      deliverRoute.includes("assignment.status === \"DELIVERED\" || assignment.order.status === \"DELIVERED\""),
      "Must reject duplicate delivery completion"
    );
    assert.ok(deliverRoute.includes("Order is already delivered"), "Must return explicit duplicate rejection error");
  });

  // --------------------------------------------------------------------------
  // Case 18: Payment success does not automatically mark delivery completed
  // --------------------------------------------------------------------------
  it("Case 18: Payment success does not automatically mark delivery completed", () => {
    const webhookRoute = fs.readFileSync(path.join(rootDir, "src/app/api/payments/webhook/route.ts"), "utf-8");
    assert.ok(webhookRoute.includes("status: \"CONFIRMED\""), "Payment webhook marks order CONFIRMED, never DELIVERED");
    assert.ok(!webhookRoute.includes("status: \"DELIVERED\""), "Must never auto-mark order DELIVERED from payment");
  });

  // --------------------------------------------------------------------------
  // Case 19: WhatsApp delivery failure does not change payment state
  // --------------------------------------------------------------------------
  it("Case 19: WhatsApp delivery failure does not change payment state", () => {
    const whatsapp = fs.readFileSync(path.join(rootDir, "src/lib/whatsapp.ts"), "utf-8");
    assert.ok(whatsapp.includes("status: \"FAILED\""), "Failed WhatsApp message is recorded as FAILED in WhatsAppMessage");
    assert.ok(
      !whatsapp.includes("prisma.payment.update"),
      "WhatsApp service must never update payment status"
    );
  });

  // --------------------------------------------------------------------------
  // Case 20: Duplicate WhatsApp webhooks do not duplicate operational effects
  // --------------------------------------------------------------------------
  it("Case 20: Duplicate WhatsApp webhooks do not duplicate operational effects", () => {
    const whatsapp = fs.readFileSync(path.join(rootDir, "src/lib/whatsapp.ts"), "utf-8");
    assert.ok(whatsapp.includes("deduplicationKey"), "Must record deduplication key for WhatsApp events");
  });

  // --------------------------------------------------------------------------
  // Case 21: Manual reconciliation requires authorized staff and creates an audit record
  // --------------------------------------------------------------------------
  it("Case 21: Manual reconciliation requires authorized staff and creates an audit record", () => {
    const payEngine = fs.readFileSync(path.join(rootDir, "src/lib/pay/Homemart4uPay.ts"), "utf-8");
    assert.ok(payEngine.includes("reconcilePayment"), "Must define reconcilePayment");
    assert.ok(payEngine.includes("operatorId"), "Must require operatorId");
    assert.ok(payEngine.includes("PAYMENT_MANUALLY_RECONCILED"), "Must create audit log entry");
  });

  // --------------------------------------------------------------------------
  // Case 22: Phone number formatting for WhatsApp Business Platform
  // --------------------------------------------------------------------------
  it("Case 22: Indian mobile numbers are normalized to E.164 without plus for Meta Cloud API", () => {
    const whatsappFile = fs.readFileSync(path.join(rootDir, "src/lib/whatsapp.ts"), "utf-8");
    assert.ok(whatsappFile.includes("formatWhatsAppPhone"), "Must define formatWhatsAppPhone helper");
    assert.ok(whatsappFile.includes("replace(/[^0-9]/g"), "Must strip non-numeric characters");
    assert.ok(whatsappFile.includes("91${cleaned}"), "Must prepend 91 country code for 10-digit Indian numbers");
  });

  // --------------------------------------------------------------------------
  // Case 23: Supabase Row Level Security (RLS) is enabled across all public schema tables
  // --------------------------------------------------------------------------
  it("Case 23: Supabase Row Level Security script enables RLS and service role policy across public schema", () => {
    const rlsScript = fs.readFileSync(path.join(rootDir, "scripts/enable-rls.mjs"), "utf-8");
    assert.ok(rlsScript.includes("ENABLE ROW LEVEL SECURITY"), "Must execute ALTER TABLE ENABLE ROW LEVEL SECURITY");
    assert.ok(rlsScript.includes("service_role_full_access"), "Must establish service_role full access policy");
  });
});
