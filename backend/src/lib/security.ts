/**
 * Security & Sanitization Utilities
 * Protects against XSS, script injection, HTML injection, and malformed inputs.
 */

/**
 * Escapes characters with HTML entities to prevent Cross-Site Scripting (XSS).
 */
export function escapeHtml(str: string): string {
  if (!str || typeof str !== "string") return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Strips HTML tags and harmful characters completely.
 */
export function stripHtmlTags(str: string): string {
  if (!str || typeof str !== "string") return "";
  return str.replace(/<[^>]*>?/gm, "").trim();
}

/**
 * Sanitizes generic user text (e.g. customer name, instructions, reviews, address notes).
 * Strips potential HTML, JavaScript URLs, script blocks, and limits max length.
 */
export function sanitizeText(input: unknown, maxLength = 500): string {
  if (input === null || input === undefined) return "";
  let val = String(input);
  // Remove control characters except newline and tab
  val = val.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "");
  // Strip HTML tags
  val = stripHtmlTags(val);
  // Disallow javascript: or data: URI schemes in text
  val = val.replace(/(javascript|vbscript|data):/gi, "");
  return val.slice(0, maxLength);
}

/**
 * Validates and normalizes 10-digit Indian mobile numbers.
 */
export function sanitizeMobile(input: unknown): string | null {
  if (!input) return null;
  const cleaned = String(input).replace(/[^\d+]/g, "").replace(/^\+91/, "");
  const digitsOnly = cleaned.replace(/\D/g, "");
  if (digitsOnly.length === 10 && /^[6-9]\d{9}$/.test(digitsOnly)) {
    return digitsOnly;
  }
  return null;
}

/**
 * Sanitizes and validates standard email addresses.
 */
export function sanitizeEmail(input: unknown): string | null {
  if (!input) return null;
  const email = String(input).trim().toLowerCase().slice(0, 255);
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (emailRegex.test(email)) {
    return email;
  }
  return null;
}

/**
 * Sanitizes address input objects
 */
export function sanitizeAddress(addr: any) {
  if (!addr || typeof addr !== "object") return null;
  return {
    label: sanitizeText(addr.label || "Home", 50),
    addressLine: sanitizeText(addr.addressLine, 250),
    locality: sanitizeText(addr.locality || "Mulbagal", 100),
    city: sanitizeText(addr.city || "Mulbagal", 80),
    postalCode: sanitizeText(addr.postalCode || "563131", 10).replace(/[^\d]/g, ""),
    latitude: typeof addr.latitude === "number" ? addr.latitude : 13.1645,
    longitude: typeof addr.longitude === "number" ? addr.longitude : 78.3952,
  };
}
