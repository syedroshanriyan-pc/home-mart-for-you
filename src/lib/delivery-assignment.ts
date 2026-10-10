import { prisma } from "@/lib/prisma";
import { notificationProvider } from "@/lib/adapters/NotificationProvider";

/**
 * Automatically assigns a delivery partner sequence-wise (Round-Robin)
 * to an order from the active delivery agents pool.
 */
export async function autoAssignDeliveryPartner(orderId: string, customPrisma?: any) {
  const db = customPrisma || prisma;

  // 1. Fetch all active delivery agents ordered deterministically by creation date
  const activeAgents = await db.user.findMany({
    where: {
      role: "DELIVERY_AGENT",
      status: "ACTIVE",
    },
    include: {
      deliveryProfile: true,
      assignedDeliveries: {
        where: {
          status: { in: ["ASSIGNED", "STARTED"] },
        },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  if (!activeAgents || activeAgents.length === 0) {
    console.warn("No active delivery agents available for auto-assignment.");
    return null;
  }

  // 2. Read or initialize the round-robin sequence pointer from SystemSetting
  const seqSetting = await db.systemSetting.findUnique({
    where: { key: "DELIVERY_ROUND_ROBIN_INDEX" },
  });

  const lastIndex = seqSetting ? parseInt(seqSetting.value, 10) : -1;
  const nextIndex = (lastIndex + 1) % activeAgents.length;
  const chosenAgent = activeAgents[nextIndex];

  // 3. Update the sequence pointer in system settings
  await db.systemSetting.upsert({
    where: { key: "DELIVERY_ROUND_ROBIN_INDEX" },
    create: {
      key: "DELIVERY_ROUND_ROBIN_INDEX",
      value: String(nextIndex),
      description: "Round-robin sequence pointer for automated delivery partner assignment",
    },
    update: {
      value: String(nextIndex),
      updatedAt: new Date(),
    },
  });

  // 4. Create or update the delivery assignment for this order
  const now = new Date();
  const assignment = await db.deliveryAssignment.upsert({
    where: { orderId },
    create: {
      orderId,
      agentUserId: chosenAgent.id,
      status: "ASSIGNED",
      assignedAt: now,
    },
    update: {
      agentUserId: chosenAgent.id,
      status: "ASSIGNED",
      assignedAt: now,
    },
    include: {
      agent: { select: { id: true, name: true, mobile: true } },
      order: { select: { id: true, orderNumber: true, totalMinor: true } },
    },
  });

  // 5. Update agent's availability status to BUSY
  await db.deliveryAgentProfile.upsert({
    where: { userId: chosenAgent.id },
    create: {
      userId: chosenAgent.id,
      availabilityStatus: "BUSY",
    },
    update: {
      availabilityStatus: "BUSY",
    },
  });

  // 6. Record audit log entry
  try {
    await db.auditLog.create({
      data: {
        actorUserId: chosenAgent.id,
        action: "AUTO_DELIVERY_ASSIGNED",
        entityType: "ORDER",
        entityId: orderId,
        metadataJson: JSON.stringify({
          agentId: chosenAgent.id,
          agentName: chosenAgent.name,
          sequenceIndex: nextIndex,
          totalAgentsInPool: activeAgents.length,
        }),
      },
    });
  } catch (err) {
    console.warn("Audit log error on auto-assign:", err);
  }

  // 7. Dispatch notification to delivery partner
  try {
    await notificationProvider.sendTransactional({
      userId: chosenAgent.id,
      orderNumber: assignment.order?.orderNumber || "Order",
      type: "ORDER_CONFIRMED",
      recipientPhone: chosenAgent.mobile,
      recipientName: chosenAgent.name,
      metadata: {
        message: `New Order Assigned #${assignment.order?.orderNumber}. Please proceed to hub for pickup.`,
      },
    });
  } catch (notifErr) {
    console.warn("Rider assignment notification error:", notifErr);
  }

  return assignment;
}
