import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { buildUpiUri, generateUpiIntentLinks, generateUpiQrDataUrl } from "@/lib/upi";

import { getSessionUser } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionUser(req);
    const body = await req.json();
    const { orderId, amountRupees, orderNumber: bodyOrderNumber } = body;

    let targetOrderNumber = bodyOrderNumber;
    let targetAmountRupees = amountRupees;

    if (orderId) {
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: { payment: true },
      });

      if (!order) {
        return NextResponse.json({ error: "Order not found" }, { status: 404 });
      }

      // Verify user ownership if order belongs to a user
      if (order.userId && (!session || (order.userId !== session.id && session.role !== "ADMIN" && session.role !== "SUPER_ADMIN"))) {
        return NextResponse.json({ error: "Unauthorized access to order" }, { status: 403 });
      }

      targetOrderNumber = order.orderNumber;
      targetAmountRupees = order.totalMinor / 100;
    }

    if (!targetAmountRupees || targetAmountRupees <= 0) {
      return NextResponse.json({ error: "Invalid payment amount" }, { status: 400 });
    }

    // Fetch UPI settings or defaults
    const vpaSetting = await prisma.systemSetting.findUnique({ where: { key: "UPI_VPA" } });
    const nameSetting = await prisma.systemSetting.findUnique({ where: { key: "UPI_MERCHANT_NAME" } });

    const vpa = vpaSetting?.value?.trim() || process.env.UPI_VPA || process.env.NEXT_PUBLIC_UPI_VPA || "merchant@upi";
    const payeeName = nameSetting?.value?.trim() || process.env.NEXT_PUBLIC_UPI_MERCHANT_NAME || "homemart4u";
    const orderNumber = targetOrderNumber || `FC-${Date.now().toString().slice(-4)}`;
    const transactionRef = `TXN_${orderNumber}_${Date.now()}`;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.FRONTEND_URL || "https://homemart4u.vercel.app";
    const callbackUrl = `${appUrl}/checkout?orderId=${orderId || orderNumber}`;

    const upiDetails = {
      vpa,
      payeeName,
      amountRupees: parseFloat(targetAmountRupees),
      orderNumber,
      transactionRef,
      note: `Payment for Order ${orderNumber}`,
      callbackUrl,
    };

    const upiUri = buildUpiUri(upiDetails);
    const intentLinks = generateUpiIntentLinks(upiDetails);
    const qrDataUrl = await generateUpiQrDataUrl(upiUri);

    const now = new Date();
    // Save qrPayload and reference on order payment if orderId provided, and stamp active session time
    if (orderId) {
      await prisma.payment.updateMany({
        where: { orderId, status: { in: ["PENDING", "FAILED"] } },
        data: {
          status: "PENDING",
          qrPayload: upiUri,
          providerReference: transactionRef,
          updatedAt: new Date(),
        },
      });
    }

    return NextResponse.json({
      success: true,
      payeeName,
      amountRupees: upiDetails.amountRupees,
      orderNumber,
      transactionRef,
      rawUpiUrl: upiUri,
      qrDataUrl,
      expiresInSeconds: 300,
      sessionTimestamp: now.toISOString(),
      intentLinks: {
        ...intentLinks,
        qrDataUrl,
      },
    });
  } catch (error: any) {
    console.error("Dynamic QR generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate dynamic payment QR: " + (error?.message || "") },
      { status: 500 }
    );
  }
}
