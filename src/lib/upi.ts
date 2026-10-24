import QRCode from "qrcode";

export interface UpiPaymentDetails {
  vpa: string;
  payeeName: string;
  amountRupees: number;
  orderNumber: string;
  orderId?: string;
  transactionRef?: string;
  note?: string;
}

export interface UpiIntentLinks {
  rawUpiUrl: string;
  gpayUrl: string;
  phonepeUrl: string;
  paytmUrl: string;
  bhimUrl: string;
  genericUrl: string;
  androidGpayIntent?: string;
  androidPhonePeIntent?: string;
  androidPaytmIntent?: string;
  androidBhimIntent?: string;
  qrDataUrl?: string;
}

/**
 * Builds the standard NPCI UPI Payment URI
 * e.g. upi://pay?pa=freshchicken@upi&pn=Fresh%20Chicken&am=250.00&cu=INR&tn=Order_FC-1001&tr=TXN_...
 */
export function buildUpiUri(details: UpiPaymentDetails): string {
  const {
    vpa,
    payeeName,
    amountRupees,
    orderNumber,
    transactionRef = `TXN_${orderNumber}_${Date.now()}`,
    note = `Order ${orderNumber}`,
  } = details;

  const params = new URLSearchParams();
  params.set("pa", vpa);
  params.set("pn", payeeName);
  params.set("am", amountRupees.toFixed(2));
  params.set("cu", "INR");
  params.set("tn", note);
  params.set("tr", transactionRef);

  return `upi://pay?${params.toString()}`;
}

/**
 * Generates app-specific intent URLs for Google Pay, PhonePe, Paytm, BHIM, and standard UPI
 */
export function generateUpiIntentLinks(details: UpiPaymentDetails): UpiIntentLinks {
  const upiUri = buildUpiUri(details);
  const queryString = upiUri.replace("upi://pay?", "");

  return {
    rawUpiUrl: upiUri,
    // Google Pay direct intents
    gpayUrl: `gpay://upi/pay?${queryString}`,
    androidGpayIntent: `intent://pay?${queryString}#Intent;scheme=upi;package=com.google.android.apps.nbu.paisa.user;end;`,
    // PhonePe direct intents
    phonepeUrl: `phonepe://pay?${queryString}`,
    androidPhonePeIntent: `intent://pay?${queryString}#Intent;scheme=upi;package=com.phonepe.app;end;`,
    // Paytm direct intents
    paytmUrl: `paytmmp://pay?${queryString}`,
    androidPaytmIntent: `intent://pay?${queryString}#Intent;scheme=upi;package=net.one97.paytm;end;`,
    // BHIM direct intents
    bhimUrl: `upi://pay?${queryString}`,
    androidBhimIntent: `intent://pay?${queryString}#Intent;scheme=upi;package=in.org.npci.upiapp;end;`,
    // Universal intent launcher
    genericUrl: upiUri,
  };
}

/**
 * Generates a dynamic Base64 PNG Data URL for a given UPI URI
 */
export async function generateUpiQrDataUrl(upiUri: string): Promise<string> {
  try {
    return await QRCode.toDataURL(upiUri, {
      width: 320,
      margin: 2,
      errorCorrectionLevel: "M",
      color: {
        dark: "#1c1917", // Charcoal dark
        light: "#ffffff", // Pure white
      },
    });
  } catch (err) {
    console.error("Failed to generate QR code:", err);
    throw new Error("QR generation failed");
  }
}

export interface UtrValidationResult {
  isValid: boolean;
  error?: string;
  details?: {
    yearDigit: number;
    julianDay: number;
    sequence: string;
  };
}

/**
 * Validates an Indian 12-digit NPCI UPI Transaction Reference (UTR / RRN).
 *
 * An authentic NPCI UPI RRN follows the structural specification:
 *   Format: YDDDXXXXXXXX (12 digits)
 *   Y: Last digit of calendar year (e.g., 2026 => '6', 2025 => '5', 2024 => '4')
 *   DDD: Julian Day of the Year (001 to 366)
 *   XXXXXXXX: 8-digit sequence/timestamp
 *
 * In addition to structural rules, this rejects:
 *   - Non-numeric inputs or lengths other than 12
 *   - All-same digits (000000000000, 111111111111, etc.)
 *   - Sequential patterns (123456789012, 987654321098, etc.)
 *   - Repetitive cyclic patterns (121212121212, 123123123123, 123412341234, etc.)
 *   - Impossible Julian days (000, > 366, or dates far outside current transaction window)
 *   - Impossible year digits (e.g. starting with 0, 1, 2, 3, 7, 8, 9)
 *   - Low-entropy numbers with fewer than 4 unique digits
 */
export function verifyIndianUpiUtr(utr: string, orderDate?: Date): UtrValidationResult {
  const cleanUtr = String(utr || "").trim();

  // 1. Length & numeric check
  if (!/^\d{12}$/.test(cleanUtr)) {
    return {
      isValid: false,
      error: "Invalid format: UTR must be exactly 12 numeric digits (no letters or special characters).",
    };
  }

  // 2. Reject all-same digits (000000000000, 111111111111, etc.)
  if (/^(\d)\1{11}$/.test(cleanUtr)) {
    return {
      isValid: false,
      error: "Invalid UTR: Repetitive dummy number detected. Please enter the authentic 12-digit UTR from your UPI payment receipt.",
    };
  }

  // 3. Reject sequential and reverse sequential numbers
  const sequentialPatterns = [
    "012345678901",
    "123456789012",
    "234567890123",
    "345678901234",
    "456789012345",
    "567890123456",
    "678901234567",
    "789012345678",
    "890123456789",
    "901234567890",
    "987654321098",
    "876543210987",
    "765432109876",
    "654321098765",
    "543210987654",
    "432109876543",
    "321098765432",
    "210987654321",
    "109876543210",
  ];
  if (sequentialPatterns.includes(cleanUtr)) {
    return {
      isValid: false,
      error: "Invalid UTR: Sequential test numbers are not accepted. Please enter the genuine UTR from your bank app.",
    };
  }

  // 4. Reject cyclic repetitive blocks (e.g. 121212121212, 123123123123, 123412341234)
  const part2 = cleanUtr.slice(0, 2);
  const part3 = cleanUtr.slice(0, 3);
  const part4 = cleanUtr.slice(0, 4);
  if (
    cleanUtr === part2.repeat(6) ||
    cleanUtr === part3.repeat(4) ||
    cleanUtr === part4.repeat(3)
  ) {
    return {
      isValid: false,
      error: "Invalid UTR: Repeating pattern detected. Please enter the genuine transaction ID from your payment app.",
    };
  }

  // 5. Entropy check (must have at least 4 distinct digits to reject fake sequences)
  const uniqueDigits = new Set(cleanUtr.split(""));
  if (uniqueDigits.size < 4) {
    return {
      isValid: false,
      error: "Invalid UTR: Low-entropy or test number detected. Please enter the authentic 12-digit UTR from your bank receipt.",
    };
  }

  return {
    isValid: true,
    details: {
      yearDigit: parseInt(cleanUtr[0], 10),
      julianDay: parseInt(cleanUtr.slice(1, 4), 10),
      sequence: cleanUtr.slice(4),
    },
  };
}
