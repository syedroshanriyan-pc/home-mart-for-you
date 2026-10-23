import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { DEFAULT_SHOP_COORDINATES } from "@/lib/delivery";

export async function GET() {
  try {
    const rawSettings = await prisma.systemSetting.findMany();
    const settingsMap: Record<string, string> = {
      shop_name: "homemart4u",
      shop_phone: "+91 90355 26638",
      shop_address: "Srinivaspur Road, Mulbagal 563131",
      shop_email: "support.homemart4u@gmail.com",
      shop_latitude: String(DEFAULT_SHOP_COORDINATES.lat),
      shop_longitude: String(DEFAULT_SHOP_COORDINATES.lng),
      store_open_status: "OPEN",
      free_delivery_radius_meters: "3000",
      delivery_rate_per_100m_paise: "150",
      cod_surcharge_paise: "700",
      minimum_order_meat_grams: "1000",
    };

    rawSettings.forEach((s) => {
      settingsMap[s.key] = s.value;
    });

    return NextResponse.json({ settings: settingsMap });
  } catch (error) {
    console.error("Public settings error:", error);
    return NextResponse.json(
      {
        settings: {
          shop_name: "homemart4u",
          shop_phone: "+91 90355 26638",
          shop_address: "Srinivaspur Road, Mulbagal 563131",
          shop_email: "support.homemart4u@gmail.com",
          store_open_status: "OPEN",
        },
      },
      { status: 200 }
    );
  }
}
