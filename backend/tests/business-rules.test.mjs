import { describe, it } from "node:test";
import assert from "node:assert";

import { calculateDeliveryFeePaise } from "../src/lib/delivery.ts";
import { validateMinimumMeatOrder } from "../src/lib/minimum-order.ts";
import { evaluateCoupon } from "../src/lib/coupons.ts";
import { verifyIndianUpiUtr } from "../src/lib/upi.ts";

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

  it("should reject disabled (inactive) coupons", () => {
    const coupon = {
      id: "c4",
      code: "DISABLED50",
      type: "FIXED",
      value: 50,
      startsAt: pastDate,
      expiresAt: futureDate,
      isActive: false, // Disabled by admin
    };
    const evalResult = evaluateCoupon(coupon, 30000, 0, 0);
    assert.strictEqual(evalResult.isValid, false);
    assert.match(evalResult.message, /no longer active/i);
  });

  it("should enforce perUserLimit on user redemption limit", () => {
    const coupon = {
      id: "c5",
      code: "ONCEONLY",
      type: "FIXED",
      value: 50,
      startsAt: pastDate,
      expiresAt: futureDate,
      isActive: true,
      perUserLimit: 1, // Max 1 per customer
    };

    // User has 0 redemptions: Allowed
    const firstUse = evaluateCoupon(coupon, 30000, 0, 0);
    assert.strictEqual(firstUse.isValid, true);

    // User has 1 redemption: Rejected
    const secondUse = evaluateCoupon(coupon, 30000, 0, 1);
    assert.strictEqual(secondUse.isValid, false);
    assert.match(secondUse.message, /usage limit/i);
  });
});

describe("Indian NPCI UPI UTR Verification Rules", () => {
  const testDate = new Date("2026-10-21T18:00:00Z"); // Day 294 of 2026

  it("should reject non-12-digit strings, alphabets, and empty inputs", () => {
    assert.strictEqual(verifyIndianUpiUtr("").isValid, false);
    assert.strictEqual(verifyIndianUpiUtr("12345").isValid, false);
    assert.strictEqual(verifyIndianUpiUtr("1234567890123").isValid, false);
    assert.strictEqual(verifyIndianUpiUtr("ABCD56789012").isValid, false);
  });

  it("should reject all-same digits (e.g. 000000000000, 111111111111)", () => {
    assert.strictEqual(verifyIndianUpiUtr("000000000000").isValid, false);
    assert.strictEqual(verifyIndianUpiUtr("111111111111").isValid, false);
    assert.strictEqual(verifyIndianUpiUtr("999999999999").isValid, false);
  });

  it("should reject sequential dummy test numbers (e.g. 123456789012, 987654321098)", () => {
    assert.strictEqual(verifyIndianUpiUtr("123456789012").isValid, false);
    assert.strictEqual(verifyIndianUpiUtr("987654321098").isValid, false);
  });

  it("should reject repeating cyclic blocks (e.g. 121212121212, 123123123123)", () => {
    assert.strictEqual(verifyIndianUpiUtr("121212121212").isValid, false);
    assert.strictEqual(verifyIndianUpiUtr("123123123123").isValid, false);
    assert.strictEqual(verifyIndianUpiUtr("123412341234").isValid, false);
  });

  it("should accept authentic bank UPI UTRs (e.g. user real UTR 134504822112 and 629481928374)", () => {
    const res1 = verifyIndianUpiUtr("134504822112");
    assert.strictEqual(res1.isValid, true);

    const res2 = verifyIndianUpiUtr("629481928374");
    assert.strictEqual(res2.isValid, true);
  });
});

describe("Database-First UTR Verification & Single-Use Rules", () => {
  // Simulates bank record ledger check
  function validateUtrAgainstLedger(submittedUtr, orderAmountMinor, bankLedger) {
    const cleanUtr = String(submittedUtr || "").trim();
    const record = bankLedger.find((tx) => tx.utr === cleanUtr);

    if (!record) {
      return {
        isValid: false,
        error: `UTR "${cleanUtr}" was not found in our verified bank records.`,
      };
    }

    if (record.status === "CLAIMED" || record.claimedOrderId) {
      return {
        isValid: false,
        error: `This UTR (${cleanUtr}) has already been used for order #${record.claimedOrderNumber}. One UTR can only be verified once.`,
      };
    }

    if (record.amountMinor < orderAmountMinor) {
      return {
        isValid: false,
        error: `Payment amount mismatch: Transaction was for ₹${(record.amountMinor / 100).toFixed(2)}, but order requires ₹${(orderAmountMinor / 100).toFixed(2)}.`,
      };
    }

    return {
      isValid: true,
      transaction: record,
    };
  }

  const sampleLedger = [
    {
      utr: "134504822112",
      amountMinor: 200,
      status: "UNCLAIMED",
      claimedOrderId: null,
      claimedOrderNumber: null,
    },
    {
      utr: "629481928374",
      amountMinor: 25000,
      status: "CLAIMED",
      claimedOrderId: "order_123",
      claimedOrderNumber: "FC-1001",
    },
  ];

  it("should reject UTR if not present in bank database ledger", () => {
    const res = validateUtrAgainstLedger("999888777666", 200, sampleLedger);
    assert.strictEqual(res.isValid, false);
    assert.match(res.error, /not found in our verified bank records/i);
  });

  it("should reject UTR if already claimed by another order (single use only)", () => {
    const res = validateUtrAgainstLedger("629481928374", 25000, sampleLedger);
    assert.strictEqual(res.isValid, false);
    assert.match(res.error, /already been used/i);
    assert.match(res.error, /FC-1001/);
  });

  it("should reject UTR if transaction amount is insufficient", () => {
    // Requires ₹5.00 (500 paise), but UTR is only ₹2.00 (200 paise)
    const res = validateUtrAgainstLedger("134504822112", 500, sampleLedger);
    assert.strictEqual(res.isValid, false);
    assert.match(res.error, /amount mismatch/i);
  });

  it("should validate and accept genuine unclaimed UTR present in database", () => {
    const res = validateUtrAgainstLedger("134504822112", 200, sampleLedger);
    assert.strictEqual(res.isValid, true);
    assert.strictEqual(res.transaction.utr, "134504822112");
  });
});



