import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionUser(req);
    if (!session || (session.role !== "DELIVERY_AGENT" && session.role !== "ADMIN" && session.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "Unauthorized: Delivery agent access required" }, { status: 403 });
    }

    const profile = await prisma.deliveryAgentProfile.findUnique({
      where: { userId: session.id },
      include: {
        user: { select: { id: true, name: true, mobile: true, email: true, status: true } },
      },
    });

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const completedToday = await prisma.deliveryAssignment.count({
      where: {
        agentUserId: session.id,
        status: "DELIVERED",
        deliveredAt: { gte: startOfToday },
      },
    });

    const activeAssignment = await prisma.deliveryAssignment.findFirst({
      where: {
        agentUserId: session.id,
        status: { in: ["ASSIGNED", "STARTED"] },
      },
      include: {
        order: {
          include: {
            items: true,
            payment: true,
            user: { select: { name: true, mobile: true } },
          },
        },
      },
    });

    return NextResponse.json({
      agent: {
        id: session.id,
        name: session.name,
        mobile: session.mobile,
        availabilityStatus: profile?.availabilityStatus || "AVAILABLE",
        isActive: profile?.isActive ?? true,
      },
      completedToday,
      activeAssignment,
    });
  } catch (error) {
    console.error("Delivery me error:", error);
    return NextResponse.json({ error: "Failed to load agent profile" }, { status: 500 });
  }
}
