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
      existingOrderId,
      orderId,
    } = body;

    const sanitizedNotes = notes ? sanitizeText(notes, 300) : null;

    // Check if an existing order was already created in this checkout session
    const checkOrderId = existingOrderId || orderId;
    if (checkOrderId) {
      const existingOrder = await prisma.order.findFirst({
        where: { id: checkOrderId, userId: session.id },
        include: { payment: true },
      });

      if (
        existingOrder &&
        existingOrder.status === "PLACED" &&
        existingOrder.payment?.status !== "COMPLETED"
      ) {
        if (paymentMethod === "COD") {
          const codFeeMinor = COD_SURCHARGE_PAISE;
          const newTotalMinor = Math.max(
            0,
            existingOrder.subtotalMinor - existingOrder.discountMinor + existingOrder.deliveryFeeMinor + codFeeMinor
          );

          const updated = await prisma.$transaction(async (tx) => {
            const o = await tx.order.update({
              where: { id: existingOrder.id },
              data: {
                codFeeMinor,
                totalMinor: newTotalMinor,
                updatedAt: new Date(),
              },
            });

            const p = await tx.payment.upsert({
              where: { orderId: existingOrder.id },
              update: {
                method: "COD",
                provider: "CASH_ON_DELIVERY",
                status: "PENDING",
                amountMinor: newTotalMinor,
                providerReference: `COD_${existingOrder.orderNumber}_${Date.now()}`,
                updatedAt: new Date(),
              },
              create: {
                orderId: existingOrder.id,
                method: "COD",
                provider: "CASH_ON_DELIVERY",
                status: "PENDING",
                amountMinor: newTotalMinor,
                providerReference: `COD_${existingOrder.orderNumber}_${Date.now()}`,
              },
            });

            await tx.auditLog.create({
              data: {
                actorUserId: session.id,
                action: "ORDER_SWITCHED_TO_COD_FROM_CHECKOUT",
                entityType: "ORDER",
                entityId: existingOrder.id,
                metadataJson: JSON.stringify({
                  orderNumber: existingOrder.orderNumber,
                  reusedExistingOrder: true,
                  newTotalMinor,
                }),
              },
            });

            return { ...o, payment: p };
          });

          return NextResponse.json({
            success: true,
            order: updated,
            reusedExistingOrder: true,
            message: "Existing order updated to COD without duplication.",
          });
        }
      }
    }

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
      deliveryAddressObj = sanitizeAddress(customAddress);
    }

    if (!deliveryAddressObj || deliveryAddressObj.latitude == null || deliveryAddressObj.longitude == null) {
      return NextResponse.json(
        { error: "A valid delivery address in Mulbagal is required." },
        { status: 400 }
      );
    }

    const destLat = parseFloat(String(deliveryAddressObj.latitude));
    const destLng = parseFloat(String(deliveryAddressObj.longitude));
    if (isNaN(destLat) || isNaN(destLng)) {
      return NextResponse.json(
        { error: "Invalid delivery coordinates." },
        { status: 400 }
      );
    }

    // 1. Transactionally validate and build items
    let subtotalMinor = 0;
    const qualifyingMeatItems: any[] = [];
    const preparedOrderItems: any[] = [];

    for (const item of items) {
      const parsedQty = typeof item.quantity === "number" ? item.quantity : parseInt(String(item.quantity || ""), 10);
      if (!Number.isInteger(parsedQty) || parsedQty < 1 || parsedQty > 50) {
        return NextResponse.json(
          { error: `Invalid quantity for item "${item.variantId || 'cart item'}". Quantity must be a whole number between 1 and 50.` },
          { status: 400 }
        );
      }
      const itemQuantity = parsedQty;

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
      const lineTotalMinor = unitPriceMinor * itemQuantity;
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
        quantity: itemQuantity,
      });

      preparedOrderItems.push({
        productId: variant.productId,
        variantId: variant.id,
        productNameSnapshot: variant.product.name,
        variantNameSnapshot: variant.name,
        quantity: itemQuantity,
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
      destLat,
      destLng
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
          deliveryLatitude: destLat,
          deliveryLongitude: destLng,
          deliveryAddressSnapshot: JSON.stringify(deliveryAddressObj),
          couponId: validCouponId,
          couponCodeSnapshot,
          notes: sanitizedNotes,
          items: {
            create: preparedOrderItems,
          },
          payment: {
            create: {
              method: paymentMethod,
              status: "PENDING",
              amountMinor: totalMinor,
              provider: paymentMethod === "COD" ? "CASH_ON_DELIVERY" : "UPI_DYNAMIC_QR",
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
