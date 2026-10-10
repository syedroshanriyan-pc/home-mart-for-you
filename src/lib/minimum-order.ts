/**
 * Minimum Order Validation
 * Business Rule:
 * Minimum order requirement of 1kg has been removed.
 * Customers can now purchase any quantity (e.g. 500g, 250g, or individual items).
 * When minThresholdGrams is 0 (default), all orders qualify.
 */

export const MIN_QUALIFYING_MEAT_GRAMS = 0;

export interface QualifyingItem {
  isQualifyingMeat: boolean;
  weightGrams?: number | null;
  quantity: number;
}

export function calculateTotalMeatGrams(items: QualifyingItem[]): number {
  return items.reduce((acc, item) => {
    if (item.isQualifyingMeat && item.weightGrams) {
      return acc + item.weightGrams * item.quantity;
    }
    return acc;
  }, 0);
}

export function validateMinimumMeatOrder(items: QualifyingItem[], minThresholdGrams = MIN_QUALIFYING_MEAT_GRAMS): {
  isValid: boolean;
  totalGrams: number;
  requiredGrams: number;
  shortfallGrams: number;
  message?: string;
} {
  const totalGrams = calculateTotalMeatGrams(items);

  // If no minimum threshold is configured (0 or less), any cart is valid
  if (minThresholdGrams <= 0) {
    return {
      isValid: true,
      totalGrams,
      requiredGrams: 0,
      shortfallGrams: 0,
      message: undefined,
    };
  }

  const isValid = totalGrams >= minThresholdGrams;
  const shortfallGrams = Math.max(0, minThresholdGrams - totalGrams);

  return {
    isValid,
    totalGrams,
    requiredGrams: minThresholdGrams,
    shortfallGrams,
    message: isValid
      ? undefined
      : `Minimum order requirement is ${minThresholdGrams}g of fresh meat. Current cart has ${totalGrams}g (need ${shortfallGrams}g more).`,
  };
}
