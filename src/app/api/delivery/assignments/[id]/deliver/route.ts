import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notificationProvider } from "@/lib/adapters/NotificationProvider";

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

    const assignment = await prisma.deliveryAssignment.findFirst({
      where: {
        OR: [{ id }, { orderId: id }],
        ...(session.role === "DELIVERY_AGENT" ? { agentUserId: session.id } : {}),
      },
      include: {
        order: { include: { user: true, payment: true } },
      },
    });

    if (!assignment) {
      return NextResponse.json(
        { error: "Delivery assignment not found or access denied." },
        { status: 404 }
      );
    }

    const now = new Date();

    const result = await prisma.$transaction(async (tx) => {
      // 1. Mark assignment delivered
      const a = await tx.deliveryAssignment.update({
        where: { id: assignment.id },
        data: {
          status: "DELIVERED",
          deliveredAt: now,
        },
      });

      // 2. Mark order delivered (terminal state)
      const ord = await tx.order.update({
        where: { id: assignment.orderId },
        data: {
          status: "DELIVERED",
          deliveredAt: now,
        },
      });

      // 3. Mark payment completed if COD
      if (assignment.order.payment && assignment.order.payment.status !== "COMPLETED") {
        await tx.payment.update({
          where: { orderId: assignment.orderId },
          data: { status: "COMPLETED" },
        });
      }

      // 4. Update agent status back to AVAILABLE
      await tx.deliveryAgentProfile.updateMany({
        where: { userId: assignment.agentUserId },
        data: { availabilityStatus: "AVAILABLE" },
      });

      // 5. Audit record
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
          }),
        },
      });

      return { assignment: a, order: ord };
    });

    // 6. Trigger Delivered Notification and Rating Prompt to customer
    try {
      await notificationProvider.sendTransactional({
        userId: assignment.order.userId,
        orderNumber: assignment.order.orderNumber,
        type: "ORDER_DELIVERED",
        recipientPhone: assignment.order.user.mobile,
        recipientName: assignment.order.user.name,
        metadata: {
          ratingPrompt: true,
          deliveredAt: now,
        },
      });
    } catch (notifErr) {
      console.warn("Delivered notification dispatch failed (delivery preserved):", notifErr);
    }

    return NextResponse.json({
      success: true,
      message: "Order successfully marked as DELIVERED.",
      order: result.order,
      assignment: result.assignment,
    });
  } catch (error) {
    console.error("Mark delivered error:", error);
    return NextResponse.json({ error: "Failed to mark order as delivered" }, { status: 500 });
  }
}
