import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSessionUser(req);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const order = await prisma.order.findFirst({
      where: {
        OR: [{ id }, { orderNumber: id }],
      },
      include: {
        user: { select: { id: true, name: true, mobile: true, email: true } },
        items: {
          include: {
            product: { select: { id: true, name: true, slug: true, imageUrl: true } },
            variant: { select: { id: true, name: true, pricingType: true } },
          },
        },
        payment: true,
        deliveryAssignment: {
          include: {
            agent: { select: { id: true, name: true, mobile: true } },
          },
        },
        review: true,
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Role-based authorization
    const isOwner = order.userId === session.id;
    const isAdmin = session.role === "ADMIN" || session.role === "SUPER_ADMIN";
    const isAssignedAgent = order.deliveryAssignment?.agentUserId === session.id;

    if (!isOwner && !isAdmin && !isAssignedAgent) {
      return NextResponse.json({ error: "Forbidden: You cannot access this order" }, { status: 403 });
    }

    let parsedAddress = null;
    try {
      parsedAddress = JSON.parse(order.deliveryAddressSnapshot);
    } catch {
      parsedAddress = { addressLine: order.deliveryAddressSnapshot };
    }

    return NextResponse.json({
      order: {
        ...order,
        deliveryAddress: parsedAddress,
      },
    });
  } catch (error) {
    console.error("Error fetching order:", error);
    return NextResponse.json({ error: "Failed to load order" }, { status: 500 });
  }
}
