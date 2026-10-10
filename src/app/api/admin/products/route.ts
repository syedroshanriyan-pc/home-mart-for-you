import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionUser(req);
    if (!session || (session.role !== "ADMIN" && session.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const products = await prisma.product.findMany({
      orderBy: { displayOrder: "asc" },
      include: {
        category: true,
        variants: { orderBy: { priceMinor: "asc" } },
        customizationGroups: {
          include: { options: true },
        },
      },
    });

    return NextResponse.json({ products });
  } catch (error) {
    console.error("Admin products error:", error);
    return NextResponse.json({ error: "Failed to load products" }, { status: 500 });
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
      name,
      slug,
      categoryId,
      description,
      productType = "WEIGHT",
      imageUrl,
      priceMinor,
      variantName,
      quantityValue = 1000,
      quantityUnit = "g",
    } = body;

    if (!name || !slug || !categoryId || priceMinor === undefined) {
      return NextResponse.json(
        { error: "Name, slug, category, and price are required." },
        { status: 400 }
      );
    }

    const product = await prisma.product.create({
      data: {
        name,
        slug: slug.trim().toLowerCase(),
        categoryId,
        description,
        productType,
        imageUrl: imageUrl || "https://images.unsplash.com/photo-1587593810167-a84920ea0781?auto=format&fit=crop&w=600&q=80",
        isAvailable: true,
        variants: {
          create: {
            name: variantName || "Standard Pack",
            pricingType: productType,
            quantityValue: parseInt(quantityValue, 10),
            quantityUnit,
            priceMinor: parseInt(priceMinor, 10),
            isAvailable: true,
          },
        },
      },
      include: {
        category: true,
        variants: true,
      },
    });

    await prisma.auditLog.create({
      data: {
        actorUserId: session.id,
        action: "PRODUCT_CREATED",
        entityType: "PRODUCT",
        entityId: product.id,
        metadataJson: JSON.stringify({ name: product.name, slug: product.slug }),
      },
    });

    return NextResponse.json({ success: true, product });
  } catch (error: any) {
    console.error("Product create error:", error);
    return NextResponse.json(
      { error: "Failed to create product. " + (error?.message || "") },
      { status: 500 }
    );
  }
}
