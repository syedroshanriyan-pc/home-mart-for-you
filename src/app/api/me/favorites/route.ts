import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionUser(req);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const favorites = await prisma.favorite.findMany({
      where: { userId: session.id },
      include: {
        product: {
          include: {
            category: true,
            variants: { where: { isAvailable: true }, orderBy: { priceMinor: "asc" } },
          },
        },
      },
    });

    return NextResponse.json({
      favorites: favorites.map((f) => f.product),
    });
  } catch (error) {
    console.error("Error fetching favorites:", error);
    return NextResponse.json({ error: "Failed to load favorites" }, { status: 500 });
  }
}
