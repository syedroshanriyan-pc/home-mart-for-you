import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import {
  calculateDeliveryFeePaise,
  calculateDistanceMeters,
  DEFAULT_SHOP_COORDINATES,
} from "@/lib/delivery";
import { validateMinimumMeatOrder } from "@/lib/minimum-order";
import { evaluateCoupon } from "@/lib/coupons";
import { COD_SURCHARGE_PAISE } from "@/lib/delivery";

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionUser(req);
    const body = await req.json();
    const { items = [], addressId, coordinates, couponCode, paymentMethod = "ONLINE" } = body;

    const errors: string[] = [];
    const itemDetails: any[] = [];
    let subtotalMinor = 0;
    const qualifyingItems: any[] = [];

    // 1. Revalidate every item against database current prices and stock
    for (const item of items) {
      const parsedQty = typeof item.quantity === "number" ? item.quantity : parseInt(String(item.quantity || ""), 10);
      if (!Number.isInteger(parsedQty) || parsedQty < 1 || parsedQty > 50) {
        errors.push(`Invalid quantity for requested item. Quantity must be between 1 and 50.`);
        continue;
      }
      const itemQuantity = parsedQty;

      const variant = await prisma.productVariant.findUnique({
        where: { id: item.variantId },
        include: {
          product: {
            include: { category: true },
          },
        },
      });

      if (!variant || !variant.product.isActive) {
        errors.push(`A requested product is no longer available in the store.`);
        continue;
      }

      if (!variant.isAvailable || !variant.product.isAvailable) {
        errors.push(`"${variant.product.name} (${variant.name})" is currently OUT OF STOCK.`);
      }

      // Check customizations if any
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
                optionId: opt.id,
                name: opt.name,
                priceDeltaMinor: opt.priceDeltaMinor,
              });
            }
          }
        }
      }

      const unitPriceMinor = variant.priceMinor + customizationTotalDelta;
      const lineTotalMinor = unitPriceMinor * itemQuantity;
      subtotalMinor += lineTotalMinor;

      // Check if product is qualifying meat (category is Fresh Chicken or Masala & Special)
      const isChickenCategory =
        variant.product.category.slug === "fresh-chicken" ||
        variant.product.category.slug === "masala-special";

      const weightGrams = variant.pricingType === "WEIGHT" || variant.quantityUnit === "g"
        ? variant.quantityValue
        : null;

      qualifyingItems.push({
        isQualifyingMeat: isChickenCategory,
        weightGrams,
        quantity: itemQuantity,
      });

      itemDetails.push({
        productId: variant.productId,
        variantId: variant.id,
        productName: variant.product.name,
        variantName: variant.name,
        quantity: itemQuantity,
        unitPriceMinor,
        lineTotalMinor,
        isQualifyingMeat: isChickenCategory,
        weightGrams,
        customizations: verifiedCustomizations,
      });
    }

    // 2. Validate Minimum Meat Rule (No 1kg restriction; 0 default)
    const meatSetting = await prisma.systemSetting.findFirst({
      where: { key: { in: ["MIN_QUALIFYING_MEAT_GRAMS", "minimum_order_meat_grams"] } },
    });
    const minMeatThreshold = meatSetting ? parseInt(meatSetting.value, 10) : 0;
    const meatValidation = validateMinimumMeatOrder(qualifyingItems, minMeatThreshold);
    if (!meatValidation.isValid && items.length > 0) {
      errors.push(meatValidation.message || "Minimum meat requirement not met.");
    }

    // 3. Determine delivery location & calculate distance
    let deliveryDistanceMeters = 0;
    let deliveryFeeMinor = 0;
    let targetCoords = coordinates;

    if (addressId) {
      const address = await prisma.address.findUnique({
        where: { id: addressId },
      });
      if (address) {
        targetCoords = { lat: address.latitude, lng: address.longitude };
      }
    }

    if (targetCoords?.lat != null && targetCoords?.lng != null) {
      // Get shop coordinates from settings or default
      const shopLatSetting = await prisma.systemSetting.findUnique({ where: { key: "SHOP_LAT" } });
      const shopLngSetting = await prisma.systemSetting.findUnique({ where: { key: "SHOP_LNG" } });

      const shopCoords = {
        lat: shopLatSetting ? parseFloat(shopLatSetting.value) : DEFAULT_SHOP_COORDINATES.lat,
        lng: shopLngSetting ? parseFloat(shopLngSetting.value) : DEFAULT_SHOP_COORDINATES.lng,
      };

      const targetLat = parseFloat(String(targetCoords.lat));
      const targetLng = parseFloat(String(targetCoords.lng));

      if (!isNaN(targetLat) && !isNaN(targetLng)) {
        deliveryDistanceMeters = calculateDistanceMeters(
          shopCoords.lat,
          shopCoords.lng,
          targetLat,
          targetLng
        );

        deliveryFeeMinor = calculateDeliveryFeePaise(deliveryDistanceMeters);
      }
    }

    // 4. Validate Coupon
    let discountMinor = 0;
    let couponResult: any = null;

    if (couponCode) {
      const coupon = await prisma.coupon.findUnique({
        where: { code: couponCode.trim().toUpperCase() },
      });

      if (!coupon) {
        errors.push(`Coupon code "${couponCode}" is invalid.`);
      } else {
        let userUsageCount = 0;
        if (session) {
          userUsageCount = await prisma.couponRedemption.count({
            where: { couponId: coupon.id, userId: session.id },
          });
        }

        const evaluation = evaluateCoupon(coupon, subtotalMinor, deliveryFeeMinor, userUsageCount);
        if (!evaluation.isValid) {
          errors.push(evaluation.message || "Coupon cannot be applied to this order.");
        } else {
          discountMinor = evaluation.discountMinor;
          couponResult = {
            id: coupon.id,
            code: coupon.code,
            discountMinor: evaluation.discountMinor,
            isFreeDelivery: evaluation.isFreeDelivery,
          };
        }
      }
    }

    // 5. COD Surcharge
    const codFeeMinor = paymentMethod === "COD" && items.length > 0 ? COD_SURCHARGE_PAISE : 0;

    // 6. Final Total
    const totalMinor = Math.max(0, subtotalMinor - discountMinor + deliveryFeeMinor + codFeeMinor);

    return NextResponse.json({
      isValid: errors.length === 0 && items.length > 0,
      subtotalMinor,
      discountMinor,
      deliveryDistanceMeters,
      deliveryFeeMinor,
      codFeeMinor,
      totalMinor,
      qualifyingMeatGrams: meatValidation.totalGrams,
      isMinMeatMet: meatValidation.isValid,
      meatShortfallGrams: meatValidation.shortfallGrams,
      coupon: couponResult,
      items: itemDetails,
      errors,
    });
  } catch (error) {
    console.error("Cart validation error:", error);
    return NextResponse.json(
      { error: "Failed to validate cart. Please try again." },
      { status: 500 }
    );
  }
}
