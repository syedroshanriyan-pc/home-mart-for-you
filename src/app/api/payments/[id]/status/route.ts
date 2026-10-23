import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { verifyIndianUpiUtr } from "@/lib/upi";
import { paymentProvider } from "@/lib/adapters/PaymentProvider";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Search by orderId or payment id or orderNumber
    const payment = await prisma.payment.findFirst({
      where: {
        OR: [
          { orderId: id },
          { id },
          { order: { orderNumber: id } },
        ],
      },
      include: {
        order: {
          select: {
            id: true,
            userId: true,
            orderNumber: true,
            totalMinor: true,
            status: true,
            placedAt: true,
          },
        },
      },
    });

    if (!payment) {
      return NextResponse.json({ error: "Payment record not found" }, { status: 404 });
    }

    let currentStatus = payment.status;
    let upiTxnRef = payment.upiTxnRef;
    let providerReference = payment.providerReference;
    let orderStatus = payment.order.status;

    // Real status from database. Status is updated live by webhook or gateway verification.
    if (currentStatus === "PENDING") {
      // Check if a customer-submitted UTR can now be auto-reconciled against bank transactions
      if (payment.upiTxnRef && /^\d{12}$/.test(payment.upiTxnRef)) {
        const bankTx = await prisma.bankTransaction.findUnique({
          where: { utr: payment.upiTxnRef },
        });

        if (
          bankTx &&
          (bankTx.status === "UNCLAIMED" || bankTx.claimedOrderId === payment.orderId) &&
          bankTx.amountMinor >= payment.amountMinor
        ) {
          // Auto-reconcile and confirm!
          await prisma.$transaction(async (tx) => {
            await tx.bankTransaction.update({
              where: { id: bankTx.id },
              data: {
                status: "CLAIMED",
                claimedOrderId: payment.orderId,
                claimedAt: new Date(),
              },
            });

            await tx.payment.update({
              where: { id: payment.id },
              data: {
                status: "COMPLETED",
                providerReference: bankTx.utr,
                updatedAt: new Date(),
              },
            });

            if (payment.order.status === "PLACED") {
              await tx.order.update({
                where: { id: payment.orderId },
                data: {
                  status: "CONFIRMED",
                  confirmedAt: new Date(),
                },
              });
            }

            if (payment.order?.userId) {
              await tx.auditLog.create({
                data: {
                  actorUserId: payment.order.userId,
                  action: "PAYMENT_RECONCILED_ON_STATUS_POLL",
                  entityType: "PAYMENT",
                  entityId: payment.id,
                  metadataJson: JSON.stringify({
                    orderNumber: payment.order.orderNumber,
                    utr: bankTx.utr,
                    amountMinor: bankTx.amountMinor,
                    reconciledAt: new Date().toISOString(),
                  }),
                },
              });
            }
          });

          currentStatus = "COMPLETED";
          orderStatus = "CONFIRMED";
        }
      }

      const elapsedMs = Date.now() - new Date(payment.createdAt).getTime();

      // If validity expired (5 minutes = 300,000ms as requested), auto-mark as FAILED
      if (currentStatus === "PENDING" && elapsedMs > 300000) {
        currentStatus = "FAILED";
        await prisma.$transaction(async (tx) => {
          await tx.payment.update({
            where: { id: payment.id },
            data: { status: "FAILED", updatedAt: new Date() },
          });
          if (payment.order?.userId) {
            await tx.auditLog.create({
              data: {
                actorUserId: payment.order.userId,
                action: "PAYMENT_EXPIRED_5_MIN_WINDOW",
                entityType: "PAYMENT",
                entityId: payment.id,
                metadataJson: JSON.stringify({ reason: "Payment session validity expired (5 minutes)" }),
              },
            });
          }
        });
      }
    }

    const secret = process.env.AUTH_SECRET || "fc_secure_hmac_secret_2026";
    const verificationReceipt = crypto
      .createHmac("sha256", secret)
      .update(`${payment.order.orderNumber}:${payment.id}:${currentStatus}:${payment.amountMinor}`)
      .digest("hex");

    return NextResponse.json({
      success: true,
      payment: {
        id: payment.id,
        orderId: payment.orderId,
        orderNumber: payment.order.orderNumber,
        method: payment.method,
        status: currentStatus, // PENDING, COMPLETED, FAILED
        amountMinor: payment.amountMinor,
        amountRupees: payment.amountMinor / 100,
        upiApp: payment.upiApp,
        upiTxnRef,
        providerReference,
        qrPayload: payment.qrPayload,
        orderStatus,
        verificationReceipt,
        verifiedAt: new Date().toISOString(),
        updatedAt: payment.updatedAt,
      },
    });
  } catch (error: any) {
    console.error("Payment status fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch payment status" }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getSessionUser(req);

    const existingPayment = await prisma.payment.findFirst({
      where: {
        OR: [
          { orderId: id },
          { id },
          { order: { orderNumber: id } },
        ],
      },
      include: { order: true },
    });

    if (!existingPayment) {
      return NextResponse.json({ error: "Payment record not found" }, { status: 404 });
    }

    const isAdmin = session && (session.role === "ADMIN" || session.role === "SUPER_ADMIN" || session.role === "DELIVERY_AGENT");
    const isOwner = session && session.id === existingPayment.order.userId;
    const isGuestOrder = !existingPayment.order.userId;

    if (!isAdmin && !isOwner && !isGuestOrder) {
      return NextResponse.json({ error: "Unauthorized to update payment status" }, { status: 403 });
    }

    const body = await req.json();
    const { status, upiApp, upiTxnRef, failureReason } = body;

    if (!status || !["PENDING", "COMPLETED", "FAILED", "REFUNDED"].includes(status)) {
      return NextResponse.json({ error: "Invalid payment status" }, { status: 400 });
    }

    // Security Guard: Non-admin users can ONLY submit COMPLETED (requiring strict UTR verification) or FAILED (aborted session)
    if (!isAdmin && status !== "COMPLETED" && status !== "FAILED") {
      return NextResponse.json(
        { error: "Forbidden: You are not authorized to set payment to this status." },
        { status: 403 }
      );
    }

    if (existingPayment.status === "COMPLETED") {
      return NextResponse.json({
        success: true,
        message: "Payment is already completed",
        payment: existingPayment,
      });
    }

    let cleanUtr = String(upiTxnRef || "").trim();

    if (status === "COMPLETED" && !isAdmin) {
      if (!cleanUtr) {
        return NextResponse.json(
          { error: "Please enter the 12-digit transaction reference (UTR) from your payment receipt." },
          { status: 400 }
        );
      }

      // 1. Verify 5-minute recent payment window (300,000ms)
      const sessionTime = new Date(existingPayment.updatedAt || existingPayment.createdAt).getTime();
      const elapsedMs = Date.now() - sessionTime;
      const FIVE_MINUTES_MS = 5 * 60 * 1000;
      if (elapsedMs > FIVE_MINUTES_MS) {
        await prisma.payment.update({
          where: { id: existingPayment.id },
          data: { status: "FAILED", updatedAt: new Date() },
        });

        if (existingPayment.order?.userId) {
          await prisma.auditLog.create({
            data: {
              actorUserId: existingPayment.order.userId,
              action: "PAYMENT_REJECTED_WINDOW_EXPIRED",
              entityType: "PAYMENT",
              entityId: existingPayment.id,
              metadataJson: JSON.stringify({
                orderNumber: existingPayment.order.orderNumber,
                attemptedUtr: cleanUtr,
                elapsedSeconds: Math.round(elapsedMs / 1000),
                allowedSeconds: 300,
                timestamp: new Date().toISOString(),
              }),
            },
          });
        }

        return NextResponse.json(
          {
            error: "Payment session expired. The 12-digit UTR must be submitted within 5 minutes of payment initiation. Please place a new order or switch to Cash on Delivery.",
            rejectedUtr: cleanUtr,
            paymentStatus: "FAILED",
            isExpired: true,
          },
          { status: 400 }
        );
      }

      // 2. Format & NPCI Authenticity Validation: must be 12 numeric digits with no dummy patterns
      const validation = verifyIndianUpiUtr(cleanUtr);
      if (!validation.isValid) {
        return NextResponse.json(
          {
            error: validation.error || "Payment verification failed: The UTR entered has an invalid format.",
            rejectedUtr: cleanUtr,
          },
          { status: 400 }
        );
      }

      // 3. STRICT DATABASE UNIQUENESS & CRITICAL SECURITY ALERT
      // Each UTR can be used ONLY ONCE across the entire database!
      const existingUtrInPayment = await prisma.payment.findFirst({
        where: {
          upiTxnRef: cleanUtr,
          orderId: { not: existingPayment.orderId },
        },
        include: { order: true },
      });

      const existingUtrInBankLedger = await prisma.bankTransaction.findFirst({
        where: {
          utr: cleanUtr,
          status: "CLAIMED",
          claimedOrderId: { not: existingPayment.orderId },
        },
        include: { claimedOrder: true },
      });

      if (existingUtrInPayment || existingUtrInBankLedger) {
        const priorOrderNum =
          existingUtrInPayment?.order?.orderNumber ||
          existingUtrInBankLedger?.claimedOrder?.orderNumber ||
          "another order";

        const clientIp =
          req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
          req.headers.get("x-real-ip") ||
          "unknown";
        const userAgent = req.headers.get("user-agent") || "unknown";

        // Alert 1: Create Critical Security Audit Log in the database
        await prisma.auditLog.create({
          data: {
            actorUserId: existingPayment.order.userId || "GUEST",
            action: "SECURITY_ALERT_DUPLICATE_UTR_ATTEMPT",
            entityType: "PAYMENT",
            entityId: existingPayment.id,
            metadataJson: JSON.stringify({
              alert: "CRITICAL_DUPLICATE_UTR_DETECTED",
              attemptedUtr: cleanUtr,
              attemptedOrderNumber: existingPayment.order.orderNumber,
              priorClaimedOrderNumber: priorOrderNum,
              clientIp,
              userAgent,
              timestamp: new Date().toISOString(),
            }),
          },
        });

        // Alert 2: Create System Notification Broadcast for store administrator
        await prisma.notificationBroadcast.create({
          data: {
            createdByUserId: existingPayment.order.userId || "SYSTEM",
            title: "🚨 CRITICAL SECURITY ALERT: Duplicate UTR Replay Detected",
            message: `Order #${existingPayment.order.orderNumber} attempted to reuse UTR "${cleanUtr}" already claimed by Order #${priorOrderNum}. The system blocked this transaction immediately.`,
            targetUrl: `/admin/orders/${existingPayment.orderId}`,
            status: "SENT",
          },
        });

        // Mark the current payment as FAILED
        await prisma.payment.update({
          where: { id: existingPayment.id },
          data: {
            status: "FAILED",
            updatedAt: new Date(),
          },
        });

        return NextResponse.json(
          {
            error: `Security Alert: Transaction reference (UTR: ${cleanUtr}) has already been used for order #${priorOrderNum}. Every UTR can only be used once. This incident has been logged and reported to the system administrator.`,
            rejectedUtr: cleanUtr,
            isDuplicate: true,
            paymentStatus: "FAILED",
          },
          { status: 400 }
        );
      }

      // 3. QUERY PAYMENT GATEWAY / ACQUIRING BANK PROVIDER: Authoritatively verify transaction
      const providerRes = await paymentProvider.verifyUtrWithProvider({
        utr: cleanUtr,
        orderId: existingPayment.orderId,
        orderNumber: existingPayment.order.orderNumber,
        expectedAmountMinor: existingPayment.amountMinor,
        expectedCurrency: "INR",
        payeeVpa: "9844797374@mbk",
      });

      if (!providerRes.verified) {
        // Log verification failure
        if (existingPayment.order?.userId) {
          await prisma.auditLog.create({
            data: {
              actorUserId: existingPayment.order.userId,
              action: "PAYMENT_VERIFICATION_REJECTED",
              entityType: "PAYMENT",
              entityId: existingPayment.id,
              metadataJson: JSON.stringify({
                orderNumber: existingPayment.order.orderNumber,
                attemptedUtr: cleanUtr,
                failureReason: providerRes.failureReason,
                status: providerRes.status,
                timestamp: new Date().toISOString(),
              }),
            },
          });
        }

        return NextResponse.json(
          {
            error:
              providerRes.failureReason ||
              "Payment verification failed: The transaction reference could not be authoritatively verified by the acquiring bank or payment gateway.",
            rejectedUtr: cleanUtr,
          },
          { status: 400 }
        );
      }

      // 4. ATOMIC DATABASE TRANSACTION: Claim UTR with database-level uniqueness constraint
      try {
        const updatedPayment = await prisma.$transaction(async (tx) => {
          // Store and claim transaction in BankTransaction ledger
          await tx.bankTransaction.upsert({
            where: { utr: cleanUtr },
            update: {
              status: "CLAIMED",
              claimedOrderId: existingPayment.orderId,
              claimedAt: new Date(),
            },
            create: {
              utr: cleanUtr,
              amountMinor: existingPayment.amountMinor,
              payeeVpa: process.env.UPI_VPA || "9844797374@mbk",
              source: providerRes.source || "USER_LIVE_PAYMENT",
              status: "CLAIMED",
              claimedOrderId: existingPayment.orderId,
              claimedAt: new Date(),
              rawPayload: JSON.stringify({
                orderNumber: existingPayment.order.orderNumber,
                orderId: existingPayment.orderId,
                amountMinor: existingPayment.amountMinor,
                amountRupees: existingPayment.amountMinor / 100,
                utr: cleanUtr,
                upiApp: upiApp || "UPI_SCAN",
                source: providerRes.source || "USER_LIVE_PAYMENT",
                clientIp:
                  req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
                  req.headers.get("x-real-ip") ||
                  "unknown",
                userAgent: req.headers.get("user-agent") || "unknown",
                transactionTimestamp: new Date().toISOString(),
                verifiedAt: new Date().toISOString(),
              }),
            },
          });

          // Atomically update Payment with @unique upiTxnRef
          const p = await tx.payment.update({
            where: { id: existingPayment.id },
            data: {
              status: "COMPLETED",
              upiApp: upiApp || existingPayment.upiApp || "UPI_SCAN",
              upiTxnRef: cleanUtr,
              providerReference: providerRes.providerReference || cleanUtr,
              updatedAt: new Date(),
            },
            include: { order: true },
          });

          // Confirm Order if it was PLACED
          if (existingPayment.order.status === "PLACED") {
            await tx.order.update({
              where: { id: existingPayment.orderId },
              data: {
                status: "CONFIRMED",
                confirmedAt: new Date(),
              },
            });
          }

          if (existingPayment.order?.userId) {
            await tx.auditLog.create({
              data: {
                actorUserId: existingPayment.order.userId,
                action: "PAYMENT_CONFIRMED_FROM_AUTHORITATIVE_PROVIDER",
                entityType: "PAYMENT",
                entityId: existingPayment.id,
                metadataJson: JSON.stringify({
                  orderNumber: existingPayment.order.orderNumber,
                  amountMinor: existingPayment.amountMinor,
                  upiTxnRef: cleanUtr,
                  source: providerRes.source,
                  verifiedAt: new Date().toISOString(),
                }),
              },
            });
          }

          return p;
        });

        const secret = process.env.AUTH_SECRET || "fc_secure_hmac_secret_2026";
        const verificationReceipt = crypto
          .createHmac("sha256", secret)
          .update(`${existingPayment.order.orderNumber}:${existingPayment.id}:COMPLETED:${existingPayment.amountMinor}`)
          .digest("hex");

        return NextResponse.json({
          success: true,
          paymentStatus: "COMPLETED",
          payment: {
            ...updatedPayment,
            verificationReceipt,
            verifiedAt: new Date().toISOString(),
          },
          message: "Payment authoritatively verified and confirmed.",
        });
      } catch (dbError: any) {
        if (dbError?.code === "P2002") {
          return NextResponse.json(
            {
              error: "This transaction reference has already been used. Please verify your payment details.",
              rejectedUtr: cleanUtr,
            },
            { status: 400 }
          );
        }
        throw dbError;
      }
    }

    // Non-admins can only mark payment as FAILED here (user aborted/failed flow)
    if (!isAdmin && status !== "FAILED") {
      return NextResponse.json({ error: "Forbidden: Administrator privileges required." }, { status: 403 });
    }

    // Admin manual or system status update
    const txnRef = cleanUtr || (isAdmin ? `ADMIN_${Date.now()}` : `USER_ABORT_${Date.now()}`);
    const updatedPayment = await prisma.payment.update({
      where: { id: existingPayment.id },
      data: {
        status,
        providerReference: txnRef,
        updatedAt: new Date(),
      },
      include: { order: true },
    });

    return NextResponse.json({
      success: true,
      payment: updatedPayment,
    });
  } catch (error: any) {
    if (error?.code === "P2002") {
      return NextResponse.json(
        { error: "This transaction reference has already been used. Please verify your payment details." },
        { status: 400 }
      );
    }
    console.error("Payment status update error:", error);
    return NextResponse.json({ error: "Failed to update payment status: " + error.message }, { status: 500 });
  }
}
