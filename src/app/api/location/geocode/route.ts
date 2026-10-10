import { NextRequest, NextResponse } from "next/server";
import { mapProvider } from "@/lib/adapters/MapProvider";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { lat, lng } = body;

    if (lat === undefined || lng === undefined) {
      return NextResponse.json(
        { error: "Latitude and longitude are required." },
        { status: 400 }
      );
    }

    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);

    if (isNaN(latitude) || isNaN(longitude)) {
      return NextResponse.json({ error: "Invalid coordinates format." }, { status: 400 });
    }

    const result = await mapProvider.reverseGeocode({ lat: latitude, lng: longitude });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Geocoding error:", error);
    return NextResponse.json({ error: "Failed to reverse geocode" }, { status: 500 });
  }
}
