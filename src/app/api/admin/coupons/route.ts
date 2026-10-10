import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionUser(req);
    if (!session || (session.role !== "ADMIN" && session.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const coupons = await prisma.coupon.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: { select: { redemptions: true } },
      },
    });

    return NextResponse.json({ coupons });
  } catch (error) {
    console.error("Admin coupons error:", error);
    return NextResponse.json({ error: "Failed to load coupons" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionUser(req);
    if (!session || (session.role !== "ADMIN" && session.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
    }

    const body = await req.json();
    const {
      code,
      type, // FIXED, PERCENTAGE, FREE_DELIVERY, MIN_ORDER_FIXED
      value = 0,
      minimumOrderRupees,
      maximumDiscountRupees,
      freeDelivery = false,
      usageLimit,
      perUserLimit = 1,
      expiresInDays = 30,
    } = body;

    if (!code || !type) {
      return NextResponse.json({ error: "Coupon code and type are required." }, { status: 400 });
    }

    const now = new Date();
    const expiresAt = new Date(now.getTime() + parseInt(expiresInDays, 10) * 24 * 60 * 60 * 1000);

    const coupon = await prisma.coupon.create({
      data: {
        code: code.trim().toUpperCase(),
        type,
        value: parseInt(value, 10) || 0,
        minimumOrderMinor: minimumOrderRupees ? Math.round(parseFloat(minimumOrderRupees) * 100) : null,
        maximumDiscountMinor: maximumDiscountRupees ? Math.round(parseFloat(maximumDiscountRupees) * 100) : null,
        freeDelivery: freeDelivery || type === "FREE_DELIVERY",
        usageLimit: usageLimit ? parseInt(usageLimit, 10) : null,
        perUserLimit: perUserLimit ? parseInt(perUserLimit, 10) : 1,
        startsAt: now,
        expiresAt,
        isActive: true,
      },
    });

    await prisma.auditLog.create({
      data: {
        actorUserId: session.id,
        action: "COUPON_CREATED",
        entityType: "COUPON",
        entityId: coupon.id,
        metadataJson: JSON.stringify({ code: coupon.code, type: coupon.type, value: coupon.value }),
      },
    });

    return NextResponse.json({ success: true, coupon });
  } catch (error: any) {
    console.error("Coupon creation error:", error);
    return NextResponse.json({ error: "Failed to create coupon. " + (error?.message || "") }, { status: 500 });
  }
}
