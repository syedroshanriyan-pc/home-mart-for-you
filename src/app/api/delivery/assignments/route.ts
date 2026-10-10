import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionUser(req);
    if (!session || (session.role !== "DELIVERY_AGENT" && session.role !== "ADMIN" && session.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "Forbidden: Delivery agent only" }, { status: 403 });
    }

    // Return assignments scoped strictly to this agent
    const assignments = await prisma.deliveryAssignment.findMany({
      where: {
        agentUserId: session.id,
      },
      orderBy: { assignedAt: "desc" },
      include: {
        order: {
          include: {
            user: { select: { name: true, mobile: true } },
            items: true,
            payment: true,
          },
        },
      },
    });

    return NextResponse.json({ assignments });
  } catch (error) {
    console.error("Delivery assignments error:", error);
    return NextResponse.json({ error: "Failed to load assignments" }, { status: 500 });
  }
}
