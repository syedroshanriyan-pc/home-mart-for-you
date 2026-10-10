import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSessionUser(req);
    if (!session || (session.role !== "ADMIN" && session.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();

    const product = await prisma.product.update({
      where: { id },
      data: {
        name: body.name,
        slug: body.slug ? body.slug.trim().toLowerCase() : undefined,
        description: body.description,
        categoryId: body.categoryId,
        imageUrl: body.imageUrl,
        isAvailable: body.isAvailable,
        isActive: body.isActive,
      },
      include: { variants: true, category: true },
    });

    await prisma.auditLog.create({
      data: {
        actorUserId: session.id,
        action: "PRODUCT_UPDATED",
        entityType: "PRODUCT",
        entityId: id,
        metadataJson: JSON.stringify(body),
      },
    });

    return NextResponse.json({ success: true, product });
  } catch (error) {
    console.error("Update product error:", error);
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSessionUser(req);
    if (!session || (session.role !== "ADMIN" && session.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
    }

    const { id } = await params;

    // Soft delete product by setting isActive to false to preserve historical order snapshots
    const product = await prisma.product.update({
      where: { id },
      data: { isActive: false, isAvailable: false },
    });

    await prisma.auditLog.create({
      data: {
        actorUserId: session.id,
        action: "PRODUCT_DEACTIVATED",
        entityType: "PRODUCT",
        entityId: id,
      },
    });

    return NextResponse.json({ success: true, message: "Product deactivated", product });
  } catch (error) {
    console.error("Delete product error:", error);
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 });
  }
}
