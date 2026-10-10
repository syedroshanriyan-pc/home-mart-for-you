import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionUser(req);
    if (!session || (session.role !== "ADMIN" && session.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
    }

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    // 1. Orders today
    const ordersToday = await prisma.order.findMany({
      where: { createdAt: { gte: startOfToday } },
      select: { totalMinor: true, status: true, placedAt: true, id: true, orderNumber: true },
    });

    const todayOrderCount = ordersToday.length;
    const todaySalesMinor = ordersToday
      .filter((o) => o.status !== "CANCELLED")
      .reduce((sum, o) => sum + o.totalMinor, 0);

    const aovMinor = todayOrderCount > 0 ? Math.round(todaySalesMinor / todayOrderCount) : 0;

    // 2. Global Status Breakdown
    const statusCounts = await prisma.order.groupBy({
      by: ["status"],
      _count: { id: true },
    });

    const statusMap: Record<string, number> = {
      PLACED: 0,
      CONFIRMED: 0,
      PREPARING: 0,
      OUT_FOR_DELIVERY: 0,
      DELIVERED: 0,
      CANCELLED: 0,
    };

    statusCounts.forEach((s) => {
      statusMap[s.status] = s._count.id;
    });

    // 3. Operational Alerts
    // Unassigned deliveries: status in CONFIRMED or PREPARING and no delivery assignment
    const unassignedOrders = await prisma.order.findMany({
      where: {
        status: { in: ["CONFIRMED", "PREPARING"] },
        deliveryAssignment: null,
      },
      include: { user: { select: { name: true, mobile: true } } },
      take: 5,
    });

    // Out of stock products
    const outOfStockProducts = await prisma.product.findMany({
      where: { isAvailable: false, isActive: true },
      select: { id: true, name: true, slug: true, category: { select: { name: true } } },
    });

    // Orders approaching 20-minute delivery target (placed > 15 mins ago and not delivered/cancelled)
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
    const targetAtRiskOrders = await prisma.order.findMany({
      where: {
        status: { in: ["PLACED", "CONFIRMED", "PREPARING", "OUT_FOR_DELIVERY"] },
        placedAt: { lte: fifteenMinutesAgo },
      },
      select: { id: true, orderNumber: true, status: true, placedAt: true, totalMinor: true },
      take: 5,
    });

    // Recent 10 orders for dashboard table
    const recentOrders = await prisma.order.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { name: true, mobile: true } },
        items: true,
        deliveryAssignment: {
          include: { agent: { select: { name: true } } },
        },
      },
    });

    return NextResponse.json({
      metrics: {
        todaySalesMinor,
        todayOrderCount,
        aovMinor,
        statusMap,
      },
      alerts: {
        unassignedOrders,
        outOfStockProducts,
        targetAtRiskOrders,
      },
      recentOrders,
    });
  } catch (error) {
    console.error("Dashboard data error:", error);
    return NextResponse.json({ error: "Failed to load dashboard data" }, { status: 500 });
  }
}
