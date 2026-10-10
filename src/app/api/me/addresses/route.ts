import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionUser(req);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const addresses = await prisma.address.findMany({
      where: { userId: session.id },
      orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
    });

    return NextResponse.json({ addresses });
  } catch (error) {
    console.error("Error fetching addresses:", error);
    return NextResponse.json(
      { error: "Failed to load addresses" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionUser(req);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { label, addressLine, locality, city, postalCode, latitude, longitude, isDefault } = body;

    if (!addressLine || latitude === undefined || longitude === undefined) {
      return NextResponse.json(
        { error: "Address line, latitude, and longitude are required." },
        { status: 400 }
      );
    }

    if (isDefault) {
      // Unset previous defaults
      await prisma.address.updateMany({
        where: { userId: session.id },
        data: { isDefault: false },
      });
    }

    const count = await prisma.address.count({ where: { userId: session.id } });

    const address = await prisma.address.create({
      data: {
        userId: session.id,
        label: label || "Home",
        addressLine,
        locality: locality || "Mulbagal",
        city: city || "Mulbagal",
        postalCode: postalCode || "563131",
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        isDefault: isDefault || count === 0,
      },
    });

    return NextResponse.json({ address });
  } catch (error) {
    console.error("Error creating address:", error);
    return NextResponse.json(
      { error: "Failed to save address" },
      { status: 500 }
    );
  }
}
