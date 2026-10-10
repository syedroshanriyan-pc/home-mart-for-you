import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const search = searchParams.get("search");
    const available = searchParams.get("available");

    const where: any = {
      isActive: true,
    };

    if (category) {
      where.category = {
        OR: [{ slug: category }, { id: category }],
      };
    }

    if (available === "true") {
      where.isAvailable = true;
    }

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
      ];
    }

    const products = await prisma.product.findMany({
      where,
      orderBy: { displayOrder: "asc" },
      include: {
        category: {
          select: { id: true, name: true, slug: true },
        },
        variants: {
          where: { isAvailable: true },
          orderBy: { priceMinor: "asc" },
        },
        customizationGroups: {
          orderBy: { displayOrder: "asc" },
          include: {
            options: {
              where: { isActive: true },
              orderBy: { displayOrder: "asc" },
            },
          },
        },
      },
    });

    return NextResponse.json({ products });
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { error: "Failed to load products." },
      { status: 500 }
    );
  }
}
