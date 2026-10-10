import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionUser(req);
    if (!session) {
      return NextResponse.json({ user: null });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.id },
      include: {
        addresses: { orderBy: { isDefault: "desc" } },
        deliveryProfile: true,
      },
    });

    if (!user || user.status !== "ACTIVE") {
      return NextResponse.json({ user: null });
    }

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        mobile: user.mobile,
        email: user.email,
        role: user.role,
        addresses: user.addresses,
        deliveryProfile: user.deliveryProfile,
      },
    });
  } catch (error) {
    console.error("Auth check error:", error);
    return NextResponse.json({ user: null });
  }
}
