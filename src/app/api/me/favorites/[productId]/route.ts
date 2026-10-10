import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    const session = await getSessionUser(req);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { productId } = await params;

    const favorite = await prisma.favorite.upsert({
      where: {
        userId_productId: {
          userId: session.id,
          productId,
        },
      },
      create: {
        userId: session.id,
        productId,
      },
      update: {},
    });

    return NextResponse.json({ success: true, favorite });
  } catch (error) {
    console.error("Error adding favorite:", error);
    return NextResponse.json({ error: "Failed to add favorite" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    const session = await getSessionUser(req);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { productId } = await params;

    await prisma.favorite.deleteMany({
      where: {
        userId: session.id,
        productId,
      },
    });

    return NextResponse.json({ success: true, message: "Removed from favorites" });
  } catch (error) {
    console.error("Error removing favorite:", error);
    return NextResponse.json({ error: "Failed to remove favorite" }, { status: 500 });
  }
}
