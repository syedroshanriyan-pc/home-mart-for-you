import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import {
  calculateDeliveryFeePaise,
  calculateDistanceMeters,
  DEFAULT_SHOP_COORDINATES,
  COD_SURCHARGE_PAISE,
} from "@/lib/delivery";
import { validateMinimumMeatOrder } from "@/lib/minimum-order";
import { evaluateCoupon } from "@/lib/coupons";
import { notificationProvider } from "@/lib/adapters/NotificationProvider";
import { autoAssignDeliveryPartner } from "@/lib/delivery-assignment";
import { checkRateLimit, getClientIp } from "@/lib/rate-limiter";
import { sanitizeText, sanitizeAddress } from "@/lib/security";

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionUser(req);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const orders = await prisma.order.findMany({
      where: { userId: session.id },
      orderBy: { createdAt: "desc" },
      include: {
        items: true,
        payment: true,
        deliveryAssignment: {
          include: {
            agent: { select: { id: true, name: true, mobile: true } },
          },
        },
        review: true,
      },
    });

    return NextResponse.json({ orders });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json({ error: "Failed to load orders." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionUser(req);
    if (!session) {
      return NextResponse.json(
        { error: "Please log in or register to place your order." },
        { status: 401 }
      );
    }

    const ip = getClientIp(req);
    const rateLimit = checkRateLimit(`order:${session.id}:${ip}`, { maxRequests: 15, windowMs: 60 * 1000 });
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "Too many order requests. Please wait a moment before trying again." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const {
      items = [],
      addressId,
      customAddress,
      couponCode,
      paymentMethod = "COD",
      notes,
    } = body;

    const sanitizedNotes = notes ? sanitizeText(notes, 300) : null;

    if (!items || items.length === 0) {
      return NextResponse.json({ error: "Your cart is empty." }, { status: 400 });
    }

    // Determine delivery address
    let deliveryAddressObj: any = null;
    if (addressId) {
      deliveryAddressObj = await prisma.address.findFirst({
        where: { id: addressId, userId: session.id },
      });
    } else if (customAddress && customAddress.addressLine) {
      deliveryAddressObj = customAddress;
    }

    if (!deliveryAddressObj || !deliveryAddressObj.latitude || !deliveryAddressObj.longitude) {
      return NextResponse.json(
        { error: "A valid delivery address in Mulbagal is required." },
        { status: 400 }
      );
    }

    // 1. Transactionally validate and build items
    let subtotalMinor = 0;
    const qualifyingMeatItems: any[] = [];
    const preparedOrderItems: any[] = [];

    for (const item of items) {
      const variant = await prisma.productVariant.findUnique({
        where: { id: item.variantId },
        include: {
          product: { include: { category: true } },
        },
      });

      if (!variant || !variant.product.isActive) {
        return NextResponse.json(
          { error: `Item is no longer available in the store.` },
          { status: 400 }
        );
      }

      if (!variant.isAvailable || !variant.product.isAvailable) {
        return NextResponse.json(
          { error: `"${variant.product.name} (${variant.name})" is currently OUT OF STOCK.` },
          { status: 400 }
        );
      }

      let customizationTotalDelta = 0;
      const verifiedCustomizations: any[] = [];
      if (item.customizations && Array.isArray(item.customizations)) {
        for (const c of item.customizations) {
          if (c.optionId) {
            const opt = await prisma.customizationOption.findUnique({
              where: { id: c.optionId },
            });
            if (opt && opt.isActive) {
              customizationTotalDelta += opt.priceDeltaMinor;
              verifiedCustomizations.push({
                group: c.group || "Customization",
                option: opt.name,
                priceDeltaMinor: opt.priceDeltaMinor,
              });
            }
          }
        }
      }

      const unitPriceMinor = variant.priceMinor + customizationTotalDelta;
      const lineTotalMinor = unitPriceMinor * item.quantity;
      subtotalMinor += lineTotalMinor;

      const isChickenCategory =
        variant.product.category.slug === "fresh-chicken" ||
        variant.product.category.slug === "masala-special";

      const weightGrams =
        variant.pricingType === "WEIGHT" || variant.quantityUnit === "g"
          ? variant.quantityValue
          : null;

      qualifyingMeatItems.push({
        isQualifyingMeat: isChickenCategory,
        weightGrams,
        quantity: item.quantity,
      });

      preparedOrderItems.push({
        productId: variant.productId,
        variantId: variant.id,
        productNameSnapshot: variant.product.name,
        variantNameSnapshot: variant.name,
        quantity: item.quantity,
        weightGrams,
        unitPriceMinor,
        lineTotalMinor,
        customizationSnapshotJson:
          verifiedCustomizations.length > 0
            ? JSON.stringify(verifiedCustomizations)
            : null,
      });
    }

    // 2. Validate Minimum Meat Rule (No 1kg restriction; 0 default)
    const meatSetting = await prisma.systemSetting.findFirst({
      where: { key: { in: ["MIN_QUALIFYING_MEAT_GRAMS", "minimum_order_meat_grams"] } },
    });
    const minMeatThreshold = meatSetting ? parseInt(meatSetting.value, 10) : 0;
    const meatValidation = validateMinimumMeatOrder(qualifyingMeatItems, minMeatThreshold);
    if (!meatValidation.isValid) {
      return NextResponse.json(
        { error: meatValidation.message || "Minimum meat requirement not met." },
        { status: 400 }
      );
    }

    // 3. Calculate distance and delivery fee
    const shopLatSetting = await prisma.systemSetting.findUnique({ where: { key: "SHOP_LAT" } });
    const shopLngSetting = await prisma.systemSetting.findUnique({ where: { key: "SHOP_LNG" } });
    const shopCoords = {
      lat: shopLatSetting ? parseFloat(shopLatSetting.value) : DEFAULT_SHOP_COORDINATES.lat,
      lng: shopLngSetting ? parseFloat(shopLngSetting.value) : DEFAULT_SHOP_COORDINATES.lng,
    };

    const deliveryDistanceMeters = calculateDistanceMeters(
      shopCoords.lat,
      shopCoords.lng,
      parseFloat(deliveryAddressObj.latitude),
      parseFloat(deliveryAddressObj.longitude)
    );

    const deliveryFeeMinor = calculateDeliveryFeePaise(deliveryDistanceMeters);

    // 4. Validate Coupon
    let discountMinor = 0;
    let validCouponId: string | null = null;
    let couponCodeSnapshot: string | null = null;

    if (couponCode) {
      const coupon = await prisma.coupon.findUnique({
        where: { code: couponCode.trim().toUpperCase() },
      });

      if (coupon) {
        const userUsageCount = await prisma.couponRedemption.count({
          where: { couponId: coupon.id, userId: session.id },
        });

        const evaluation = evaluateCoupon(coupon, subtotalMinor, deliveryFeeMinor, userUsageCount);
        if (evaluation.isValid) {
          discountMinor = evaluation.discountMinor;
          validCouponId = coupon.id;
          couponCodeSnapshot = coupon.code;
        }
      }
    }

    // 5. COD Surcharge
    const codFeeMinor = paymentMethod === "COD" ? COD_SURCHARGE_PAISE : 0;

    // 6. Final Total
    const totalMinor = Math.max(0, subtotalMinor - discountMinor + deliveryFeeMinor + codFeeMinor);

    // 7. Generate Sequential Order Number
    const count = await prisma.order.count();
    const orderNumber = `FC-${1000 + count + 1}`;

    // 8. Create Order in atomic database transaction
    const newOrder = await prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: {
          orderNumber,
          userId: session.id,
          status: "PLACED",
          subtotalMinor,
          discountMinor,
          deliveryFeeMinor,
          codFeeMinor,
          totalMinor,
          deliveryDistanceMeters,
          deliveryLatitude: parseFloat(deliveryAddressObj.latitude),
          deliveryLongitude: parseFloat(deliveryAddressObj.longitude),
          deliveryAddressSnapshot: JSON.stringify(deliveryAddressObj),
          couponId: validCouponId,
          couponCodeSnapshot,
          notes: notes || null,
          items: {
            create: preparedOrderItems,
          },
          payment: {
            create: {
              method: paymentMethod,
              status: paymentMethod === "COD" ? "PENDING" : "COMPLETED",
              amountMinor: totalMinor,
              provider: paymentMethod === "COD" ? "CASH_ON_DELIVERY" : "UPI_PAYMENT",
              providerReference: `${paymentMethod}_${orderNumber}_${Date.now()}`,
            },
          },
        },
        include: {
          items: true,
          payment: true,
        },
      });

      if (validCouponId) {
        await tx.couponRedemption.create({
          data: {
            couponId: validCouponId,
            userId: session.id,
            orderId: order.id,
            discountMinor,
          },
        });
      }

      await tx.auditLog.create({
        data: {
          actorUserId: session.id,
          action: "ORDER_CREATED",
          entityType: "ORDER",
          entityId: order.id,
          metadataJson: JSON.stringify({
            orderNumber,
            totalMinor,
            itemCount: items.length,
            paymentMethod,
          }),
        },
      });

      return order;
    });

    // 9. Dispatch transactional notification
    await notificationProvider.sendTransactional({
      userId: session.id,
      orderNumber: newOrder.orderNumber,
      type: "ORDER_PLACED",
      recipientName: session.name,
      recipientPhone: session.mobile,
      metadata: { totalMinor },
    });

    // 10. Automated sequence-wise delivery partner assignment
    try {
      await autoAssignDeliveryPartner(newOrder.id);
    } catch (assignErr) {
      console.warn("Automated sequence assignment notice:", assignErr);
    }

    return NextResponse.json({
      success: true,
      order: newOrder,
    });
  } catch (error: any) {
    console.error("Order creation error:", error);
    return NextResponse.json(
      { error: "Failed to place order. " + (error?.message || "") },
      { status: 500 }
    );
  }
}
