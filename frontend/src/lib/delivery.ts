/**
 * Delivery calculation module for Fresh Chicken
 * Business Rules:
 * - Service area: Mulbagal city
 * - First 3 km (3000 meters) = FREE
 * - Beyond 3 km: ₹1.50 per 100 metres (150 paise per 100 metres)
 * - All calculations in integer minor units (paise and metres)
 */

export const DEFAULT_SHOP_COORDINATES = {
  lat: 13.1645,
  lng: 78.3952,
};

export const FREE_DELIVERY_METERS = 3000;
export const RATE_PER_100M_PAISE = 150; // ₹1.50 = 150 paise
export const COD_SURCHARGE_PAISE = 700;  // ₹7 = 700 paise

/**
 * Calculates the great-circle distance between two points in meters using the Haversine formula.
 */
export function calculateDistanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // Earth radius in meters
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
}

/**
 * Calculates delivery fee in paise for a given distance in meters.
 * First 3000m free, then 150 paise per 100m.
 */
export function calculateDeliveryFeePaise(
  distanceMeters: number,
  freeThresholdMeters = FREE_DELIVERY_METERS,
  ratePer100mPaise = RATE_PER_100M_PAISE
): number {
  if (distanceMeters <= freeThresholdMeters) {
    return 0;
  }
  const chargeableMeters = distanceMeters - freeThresholdMeters;
  // Chargeable distance in 100m units * 150 paise
  const fee = (chargeableMeters / 100) * ratePer100mPaise;
  return Math.round(fee);
}

/**
 * Formats minor units (paise) into INR currency string with ₹ symbol.
 * Guards against undefined, null, or NaN inputs to guarantee zero display exceptions.
 */
export function formatCurrency(paise: number | undefined | null): string {
  if (typeof paise !== "number" || isNaN(paise) || !isFinite(paise)) {
    return "₹0";
  }
  const rupees = paise / 100;
  return `₹${rupees.toLocaleString("en-IN", {
    minimumFractionDigits: paise % 100 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  })}`;
}

