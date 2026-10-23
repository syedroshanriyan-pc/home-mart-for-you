import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sanitizeAddress } from "@/lib/security";

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

    const latNum = parseFloat(latitude);
    const lngNum = parseFloat(longitude);

    if (!addressLine || isNaN(latNum) || isNaN(lngNum)) {
      return NextResponse.json(
        { error: "Address line, latitude, and longitude are required and must be valid numbers." },
        { status: 400 }
      );
    }

    const sanitized = sanitizeAddress({
      label,
      addressLine,
      locality,
      city,
      postalCode,
      latitude: latNum,
      longitude: lngNum,
    });

    if (!sanitized || !sanitized.addressLine) {
      return NextResponse.json(
        { error: "Valid address line is required." },
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
        label: sanitized.label || "Home",
        addressLine: sanitized.addressLine,
        locality: sanitized.locality || "Mulbagal",
        city: sanitized.city || "Mulbagal",
        postalCode: sanitized.postalCode || "563131",
        latitude: sanitized.latitude,
        longitude: sanitized.longitude,
        isDefault: Boolean(isDefault) || count === 0,
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
