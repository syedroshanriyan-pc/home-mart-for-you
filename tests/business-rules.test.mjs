import { describe, it } from "node:test";
import assert from "node:assert";

import { calculateDeliveryFeePaise } from "../src/lib/delivery.ts";
import { validateMinimumMeatOrder } from "../src/lib/minimum-order.ts";
import { evaluateCoupon } from "../src/lib/coupons.ts";

describe("Delivery Fee Calculation Rules", () => {
  it("should charge ₹0 (0 paise) for delivery within 3000m (3km)", () => {
    assert.strictEqual(calculateDeliveryFeePaise(0), 0);
    assert.strictEqual(calculateDeliveryFeePaise(1500), 0);
    assert.strictEqual(calculateDeliveryFeePaise(2500), 0);
    assert.strictEqual(calculateDeliveryFeePaise(3000), 0);
  });

  it("should charge ₹1.50 (150 paise) for 3.1km (100m chargeable)", () => {
    // 3100m - 3000m = 100m -> (100/100) * 150 = 150 paise (₹1.50)
    assert.strictEqual(calculateDeliveryFeePaise(3100), 150);
  });

  it("should charge ₹15.00 (1500 paise) for 4km (1000m chargeable)", () => {
    // 4000m - 3000m = 1000m -> (1000/100) * 150 = 1500 paise (₹15.00)
    assert.strictEqual(calculateDeliveryFeePaise(4000), 1500);
  });

  it("should charge ₹30.00 (3000 paise) for 5km (2000m chargeable)", () => {
    // 5000m - 3000m = 2000m -> (2000/100) * 150 = 3000 paise (₹30.00)
    assert.strictEqual(calculateDeliveryFeePaise(5000), 3000);
  });
});

describe("Order Meat Quantity Validation Rules", () => {
  it("should accept 500g chicken alone (minimum 1kg restriction removed)", () => {
    const items = [
      { isQualifyingMeat: true, weightGrams: 500, quantity: 1 },
    ];
    const result = validateMinimumMeatOrder(items);
    assert.strictEqual(result.isValid, true);
    assert.strictEqual(result.totalGrams, 500);
    assert.strictEqual(result.shortfallGrams, 0);
  });

  it("should accept 1000g (1kg) chicken", () => {
    const items = [
      { isQualifyingMeat: true, weightGrams: 1000, quantity: 1 },
    ];
    const result = validateMinimumMeatOrder(items);
    assert.strictEqual(result.isValid, true);
    assert.strictEqual(result.totalGrams, 1000);
    assert.strictEqual(result.shortfallGrams, 0);
  });

  it("should accept 500g + 500g chicken combinations", () => {
    const items = [
      { isQualifyingMeat: true, weightGrams: 500, quantity: 2 },
    ];
    const result = validateMinimumMeatOrder(items);
    assert.strictEqual(result.isValid, true);
    assert.strictEqual(result.totalGrams, 1000);
  });

  it("should accept 500g chicken + drinks / non-meat without 1kg restriction", () => {
    const items = [
      { isQualifyingMeat: true, weightGrams: 500, quantity: 1 },
      { isQualifyingMeat: false, weightGrams: null, quantity: 2 }, // Drinks
    ];
    const result = validateMinimumMeatOrder(items);
    assert.strictEqual(result.isValid, true);
    assert.strictEqual(result.totalGrams, 500);
    assert.strictEqual(result.shortfallGrams, 0);
  });

  it("should respect explicit custom threshold if configured by admin", () => {
    const items = [
      { isQualifyingMeat: true, weightGrams: 500, quantity: 1 },
    ];
    // Passing 1000g threshold explicitly
    const result = validateMinimumMeatOrder(items, 1000);
    assert.strictEqual(result.isValid, false);
    assert.strictEqual(result.totalGrams, 500);
    assert.strictEqual(result.shortfallGrams, 500);
  });
});

describe("COD Surcharge Rules", () => {
  it("should add exactly ₹7 (700 paise) for COD payment method", () => {
    const getCodFee = (method) => (method === "COD" ? 700 : 0);
    assert.strictEqual(getCodFee("COD"), 700);
    assert.strictEqual(getCodFee("UPI"), 0);
    assert.strictEqual(getCodFee("GPAY"), 0);
  });
});

describe("Coupons Calculation Rules", () => {
  const futureDate = new Date(Date.now() + 86400000);
  const pastDate = new Date(Date.now() - 86400000);

  it("should apply ₹100 OFF when subtotal >= ₹499 (49900 paise)", () => {
    const coupon = {
      id: "c1",
      code: "FRESH100",
      type: "FIXED",
      value: 100,
      minimumOrderMinor: 49900,
      startsAt: pastDate,
      expiresAt: futureDate,
      isActive: true,
    };
    const validEval = evaluateCoupon(coupon, 50000, 0);
    assert.strictEqual(validEval.isValid, true);
    assert.strictEqual(validEval.discountMinor, 10000); // ₹100 = 10000 paise

    const invalidEval = evaluateCoupon(coupon, 40000, 0);
    assert.strictEqual(invalidEval.isValid, false);
    assert.strictEqual(invalidEval.discountMinor, 0);
  });

  it("should apply 10% OFF with percentage type", () => {
    const coupon = {
      id: "c2",
      code: "WELCOME10",
      type: "PERCENTAGE",
      value: 10,
      startsAt: pastDate,
      expiresAt: futureDate,
      isActive: true,
    };
    const evalResult = evaluateCoupon(coupon, 40000, 0); // ₹400 subtotal
    assert.strictEqual(evalResult.isValid, true);
    assert.strictEqual(evalResult.discountMinor, 4000); // 10% of 40000 = 4000 paise (₹40)
  });

  it("should waive delivery fee for FREE_DELIVERY coupon", () => {
    const coupon = {
      id: "c3",
      code: "FREEDEL",
      type: "FREE_DELIVERY",
      value: 0,
      freeDelivery: true,
      startsAt: pastDate,
      expiresAt: futureDate,
      isActive: true,
    };
    const evalResult = evaluateCoupon(coupon, 30000, 1500); // ₹15 delivery fee
    assert.strictEqual(evalResult.isValid, true);
    assert.strictEqual(evalResult.discountMinor, 1500);
  });
});
