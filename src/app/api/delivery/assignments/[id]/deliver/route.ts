import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendWhatsAppDeliveryStatus } from "@/lib/whatsapp";

/**
 * POST /api/delivery/assignments/[id]/deliver
 * Marks an order as delivered, records physical or online collection, and triggers customer delivery notification.
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSessionUser(req);
    if (!session || (session.role !== "DELIVERY_AGENT" && session.role !== "ADMIN" && session.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "Forbidden: Delivery agent only" }, { status: 403 });
    }

    const { id } = await params;

    let body: any = {};
    try {
      body = await req.json();
    } catch {
      // Body is optional if default cash / prepaid is used
    }

    const assignment = await prisma.deliveryAssignment.findFirst({
      where: {
        OR: [{ id }, { orderId: id }],
        ...(session.role === "DELIVERY_AGENT" ? { agentUserId: session.id } : {}),
      },
      include: {
        order: {
          include: {
            user: { select: { id: true, name: true, mobile: true } },
            payment: true,
            deliveryCollection: true,
          },
        },
      },
    });

    if (!assignment) {
      return NextResponse.json(
        { error: "Delivery assignment not found or access denied." },
        { status: 404 }
      );
    }

    // Prevent duplicate delivery completion
    if (assignment.status === "DELIVERED" || assignment.order.status === "DELIVERED") {
      return NextResponse.json(
        { error: "Order is already delivered. Duplicate completion rejected." },
        { status: 400 }
      );
    }

    const isOriginallyCod =
      assignment.order.payment?.method === "COD" || assignment.order.codFeeMinor > 0;
    const requestedMethod = body.collectionMethod || (isOriginallyCod ? "CASH" : "PREPAID");

    // Authoritative verification check for doorstep online payment
    if (requestedMethod === "ONLINE_DOORSTEP") {
      if (assignment.order.payment?.status !== "COMPLETED") {
        return NextResponse.json(
          {
            error:
              "Doorstep online payment is not confirmed yet. Wait for bank confirmation or collect cash.",
          },
          { status: 400 }
        );
      }
    }

    const now = new Date();

    const result = await prisma.$transaction(async (tx) => {
      // 1. Mark assignment DELIVERED
      const a = await tx.deliveryAssignment.update({
        where: { id: assignment.id },
        data: {
          status: "DELIVERED",
          deliveredAt: now,
        },
      });

      // 2. Mark order DELIVERED
      const ord = await tx.order.update({
        where: { id: assignment.orderId },
        data: {
          status: "DELIVERED",
          deliveredAt: now,
        },
      });

      // 3. Mark payment completed if collected via Cash
      if (requestedMethod === "CASH" && assignment.order.payment && assignment.order.payment.status !== "COMPLETED") {
        await tx.payment.update({
          where: { orderId: assignment.orderId },
          data: { status: "COMPLETED" },
        });
      }

      // 4. Create or update DeliveryCollection record (idempotent, strictly one per order)
      const collectionRecord = await tx.deliveryCollection.upsert({
        where: { orderId: assignment.orderId },
        update: {
          collectionMethod: requestedMethod,
          amountMinor: assignment.order.totalMinor,
          verificationStatus: requestedMethod === "CASH" ? "COLLECTED_PENDING_RECONCILIATION" : "VERIFIED",
          collectedAt: now,
          notes: body.notes || null,
        },
        create: {
          orderId: assignment.orderId,
          agentUserId: assignment.agentUserId,
          collectionMethod: requestedMethod,
          amountMinor: assignment.order.totalMinor,
          verificationStatus: requestedMethod === "CASH" ? "COLLECTED_PENDING_RECONCILIATION" : "VERIFIED",
          collectedAt: now,
          notes: body.notes || null,
        },
      });

      // 5. Update agent status back to AVAILABLE
      await tx.deliveryAgentProfile.updateMany({
        where: { userId: assignment.agentUserId },
        data: { availabilityStatus: "AVAILABLE" },
      });

      // 6. Audit record
      await tx.auditLog.create({
        data: {
          actorUserId: session.id,
          action: "ORDER_DELIVERED",
          entityType: "ORDER",
          entityId: assignment.orderId,
          metadataJson: JSON.stringify({
            assignmentId: assignment.id,
            deliveredAt: now,
            agentUserId: assignment.agentUserId,
            originalPaymentMethod: assignment.order.payment?.method || (assignment.order.codFeeMinor > 0 ? "COD" : "ONLINE"),
            actualCollectionMethod: requestedMethod,
            amountMinor: assignment.order.totalMinor,
          }),
        },
      });

      return { assignment: a, order: ord, collection: collectionRecord };
    });

    // 7. Dispatch WhatsApp Delivered Notification
    if (assignment.order.user?.mobile) {
      try {
        await sendWhatsAppDeliveryStatus(
          {
            id: assignment.order.id,
            orderNumber: assignment.order.orderNumber,
            user: assignment.order.user,
          },
          "DELIVERED"
        );
      } catch (notifErr) {
        console.warn("[DELIVERED_WHATSAPP_NOTICE_SKIPPED]", notifErr);
      }
    }

    return NextResponse.json({
      success: true,
      message: "Order successfully marked as DELIVERED.",
      order: result.order,
      assignment: result.assignment,
      collection: result.collection,
    });
  } catch (error: any) {
    console.error("Mark delivered error:", error);
    return NextResponse.json({ error: "Failed to mark order as delivered" }, { status: 500 });
  }
}
