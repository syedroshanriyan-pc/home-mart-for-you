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
    const body = await req.json();
    const { rating, comment } = body;

    const parsedRating = parseInt(rating, 10);
    if (isNaN(parsedRating) || parsedRating < 1 || parsedRating > 5) {
      return NextResponse.json(
        { error: "Rating must be a whole number between 1 and 5 stars." },
        { status: 400 }
      );
    }

    const order = await prisma.order.findFirst({
      where: {
        OR: [{ id }, { orderNumber: id }],
        userId: session.id,
      },
      include: { review: true },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (order.status !== "DELIVERED") {
      return NextResponse.json(
        { error: "You can only rate an order after it has been delivered." },
        { status: 400 }
      );
    }

    if (order.review) {
      // Update existing review
      const updated = await prisma.review.update({
        where: { id: order.review.id },
        data: {
          rating: parsedRating,
          comment: comment ? comment.trim() : null,
        },
      });
      return NextResponse.json({ success: true, review: updated });
    }

    const review = await prisma.review.create({
      data: {
        userId: session.id,
        orderId: order.id,
        rating: parsedRating,
        comment: comment ? comment.trim() : null,
        status: "PUBLISHED",
      },
    });

    return NextResponse.json({ success: true, review });
  } catch (error) {
    console.error("Review creation error:", error);
    return NextResponse.json({ error: "Failed to submit review" }, { status: 500 });
  }
}
