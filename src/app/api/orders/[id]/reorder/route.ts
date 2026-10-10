import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

export async function POST(
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
      where: { OR: [{ id }, { orderNumber: id }], userId: session.id },
      include: {
        items: true,
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const reorderCartItems: any[] = [];
    const unavailableItems: string[] = [];

    for (const item of order.items) {
      const variant = await prisma.productVariant.findUnique({
        where: { id: item.variantId },
        include: {
          product: { include: { category: true } },
        },
      });

      if (!variant || !variant.product.isActive || !variant.isAvailable || !variant.product.isAvailable) {
        unavailableItems.push(item.productNameSnapshot);
        continue;
      }

      // Parse saved customizations if any
      let customizations: any[] = [];
      if (item.customizationSnapshotJson) {
        try {
          customizations = JSON.parse(item.customizationSnapshotJson);
        } catch {}
      }

      reorderCartItems.push({
        productId: variant.productId,
        variantId: variant.id,
        productName: variant.product.name,
        variantName: variant.name,
        quantity: item.quantity,
        currentUnitPriceMinor: variant.priceMinor, // STRICTLY CURRENT PRICE!
        isAvailable: true,
        customizations,
      });
    }

    return NextResponse.json({
      success: true,
      items: reorderCartItems,
      unavailableItems,
      message:
        unavailableItems.length > 0
          ? `Some previous items (${unavailableItems.join(", ")}) are currently out of stock.`
          : "Cart prepared with current store pricing.",
    });
  } catch (error) {
    console.error("Reorder error:", error);
    return NextResponse.json({ error: "Failed to process reorder" }, { status: 500 });
  }
}
