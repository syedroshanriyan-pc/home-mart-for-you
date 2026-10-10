/**
 * Coupon calculation and validation module
 * Supports:
 * - FIXED: e.g. ₹100 OFF
 * - PERCENTAGE: e.g. 10% OFF (with optional max discount)
 * - FREE_DELIVERY: Waives delivery fee
 * - MIN_ORDER_FIXED: e.g. ₹50 OFF on orders above ₹499
 * - BUY_X_GET_Y: Buy X Get Y discount
 */

export interface CouponData {
  id: string;
  code: string;
  type: string;
  value: number; // In rupees for FIXED, in percent for PERCENTAGE
  minimumOrderMinor?: number | null; // In paise
  maximumDiscountMinor?: number | null; // In paise
  freeDelivery?: boolean;
  startsAt: Date;
  expiresAt: Date;
  isActive: boolean;
  usageLimit?: number | null;
  perUserLimit?: number | null;
}

export interface CouponEvaluation {
  isValid: boolean;
  discountMinor: number;
  isFreeDelivery: boolean;
  message?: string;
}

export function evaluateCoupon(
  coupon: CouponData,
  subtotalMinor: number,
  deliveryFeeMinor: number,
  userUsageCount = 0
): CouponEvaluation {
  const now = new Date();

  if (!coupon.isActive) {
    return { isValid: false, discountMinor: 0, isFreeDelivery: false, message: "Coupon is no longer active" };
  }

  if (now < new Date(coupon.startsAt)) {
    return { isValid: false, discountMinor: 0, isFreeDelivery: false, message: "Coupon offer has not started yet" };
  }

  if (now > new Date(coupon.expiresAt)) {
    return { isValid: false, discountMinor: 0, isFreeDelivery: false, message: "Coupon has expired" };
  }

  if (coupon.perUserLimit && userUsageCount >= coupon.perUserLimit) {
    return { isValid: false, discountMinor: 0, isFreeDelivery: false, message: "You have reached the usage limit for this coupon" };
  }

  if (coupon.minimumOrderMinor && subtotalMinor < coupon.minimumOrderMinor) {
    const minRs = Math.round(coupon.minimumOrderMinor / 100);
    return {
      isValid: false,
      discountMinor: 0,
      isFreeDelivery: false,
      message: `Minimum order amount of ₹${minRs} is required for this coupon`,
    };
  }

  let discountMinor = 0;
  let isFreeDelivery = coupon.freeDelivery || coupon.type === "FREE_DELIVERY";

  if (isFreeDelivery) {
    discountMinor += deliveryFeeMinor;
  }

  if (coupon.type === "FIXED" || coupon.type === "MIN_ORDER_FIXED") {
    // value in rupees, convert to paise
    const valuePaise = coupon.value * 100;
    discountMinor += Math.min(valuePaise, subtotalMinor);
  } else if (coupon.type === "PERCENTAGE") {
    let calc = Math.round((subtotalMinor * coupon.value) / 100);
    if (coupon.maximumDiscountMinor && calc > coupon.maximumDiscountMinor) {
      calc = coupon.maximumDiscountMinor;
    }
    discountMinor += calc;
  }

  return {
    isValid: true,
    discountMinor,
    isFreeDelivery,
    message: "Coupon applied successfully",
  };
}
