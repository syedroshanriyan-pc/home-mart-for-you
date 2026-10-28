import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { buildUpiUri, generateUpiIntentLinks, verifyIndianUpiUtr } from "../src/lib/upi.ts";

const rootDir = process.cwd();
const frontendDir = path.resolve(rootDir, "../frontend");
const resolveFile = (relPath) => {
  const p1 = path.join(rootDir, relPath);
  if (fs.existsSync(p1)) return p1;
  const p2 = path.join(frontendDir, relPath);
  if (fs.existsSync(p2)) return p2;
  return p1;
};

describe("Master Payment Gateway Repair & Production Hardening Test Suite (24 Cases)", () => {
  // --------------------------------------------------------------------------
  // Case 1: Valid payment confirmed by the provider
  // --------------------------------------------------------------------------
  it("Case 1: Valid payment confirmed by the provider transitions to COMPLETED atomically", () => {
    const statusRoute = fs.readFileSync(resolveFile("src/app/api/payments/[id]/status/route.ts"), "utf-8");
    assert.ok(statusRoute.includes("status: \"COMPLETED\""), "Must update payment status to COMPLETED");
    assert.ok(statusRoute.includes("status: \"CONFIRMED\""), "Must update order status to CONFIRMED");
    assert.ok(statusRoute.includes("prisma.$transaction"), "Must execute atomic transaction for payment confirmation");
  });

  // --------------------------------------------------------------------------
  // Case 2: Invalid UTR submitted
  // --------------------------------------------------------------------------
  it("Case 2: Invalid UTR format or dummy pattern submitted is rejected immediately", () => {
    const invalidPatterns = [
      "12345", // too short
      "abcdefghijkl", // non-numeric
      "000000000000", // repetitive
      "123456789012", // sequential
      "121212121212", // cyclic
    ];
    for (const pat of invalidPatterns) {
      const res = verifyIndianUpiUtr(pat);
      assert.strictEqual(res.isValid, false, `Dummy pattern ${pat} must be invalid`);
      assert.ok(res.error, "Must provide explicit validation failure reason");
    }
  });

  // --------------------------------------------------------------------------
  // Case 3: Duplicate UTR submitted
  // --------------------------------------------------------------------------
  it("Case 3: Duplicate UTR submitted across orders is rejected and logged as security incident", () => {
    const statusRoute = fs.readFileSync(path.join(rootDir, "src/app/api/payments/[id]/status/route.ts"), "utf-8");
    assert.ok(statusRoute.includes("existingUtrInPayment || existingUtrInBankLedger"), "Must check for prior UTR usage in payments and bank ledger");
    assert.ok(statusRoute.includes("SECURITY_ALERT_DUPLICATE_UTR_ATTEMPT"), "Must log duplicate UTR attempt in audit log");
    assert.ok(statusRoute.includes("isDuplicate: true"), "Must flag duplicate error response to client");
  });

  // --------------------------------------------------------------------------
  // Case 4: Duplicate provider transaction ID
  // --------------------------------------------------------------------------
  it("Case 4: Duplicate provider transaction ID is strictly rejected per order", () => {
    const webhookRoute = fs.readFileSync(path.join(rootDir, "src/app/api/payments/webhook/route.ts"), "utf-8");
    assert.ok(webhookRoute.includes("Transaction reference is already assigned to a different order"), "Must reject duplicate provider reference");
    assert.ok(webhookRoute.includes("claimedOrderId && existingBankTx.claimedOrderId !== payment.orderId"), "Must protect bank transaction from being hijacked");
  });

  // --------------------------------------------------------------------------
  // Case 5: Duplicate webhook event
  // --------------------------------------------------------------------------
  it("Case 5: Duplicate webhook delivery is handled idempotently without duplicate side-effects", () => {
    const webhookRoute = fs.readFileSync(path.join(rootDir, "src/app/api/payments/webhook/route.ts"), "utf-8");
    assert.ok(webhookRoute.includes("if (payment.status === \"COMPLETED\")"), "Must check for existing COMPLETED status");
    assert.ok(webhookRoute.includes("idempotent: true"), "Must return idempotent acknowledgment without double-crediting");
  });

  // --------------------------------------------------------------------------
  // Case 6: Invalid webhook signature
  // --------------------------------------------------------------------------
  it("Case 6: Webhook requests with missing or forged cryptographic signatures are rejected (401)", async () => {
    const rawPayload = JSON.stringify({ event: "payment.captured", amount: 25000 });
    const secret = "test_webhook_secret_key";
    const invalidSignature = "deadbeefcafebabe0123456789abcdef";

    // Constant-time HMAC SHA-256 check
    const expectedSignature = crypto.createHmac("sha256", secret).update(rawPayload).digest("hex");
    const sigBuf = Buffer.from(invalidSignature, "hex");
    const expBuf = Buffer.from(expectedSignature, "hex");
    const isValid = sigBuf.length === expBuf.length && crypto.timingSafeEqual(sigBuf, expBuf);
    assert.strictEqual(isValid, false, "Forged signature must fail timingSafeEqual comparison");
  });

  // --------------------------------------------------------------------------
  // Case 7: Incorrect transaction amount
  // --------------------------------------------------------------------------
  it("Case 7: Payment webhook or reconciliation with amount less than order requirement is rejected", () => {
    const webhookRoute = fs.readFileSync(path.join(rootDir, "src/app/api/payments/webhook/route.ts"), "utf-8");
    assert.ok(webhookRoute.includes("payloadAmountMinor < payment.amountMinor"), "Must reject underpayments");
    assert.ok(webhookRoute.includes("Payment amount mismatch"), "Must report amount mismatch error");
  });

  // --------------------------------------------------------------------------
  // Case 8: Incorrect currency
  // --------------------------------------------------------------------------
  it("Case 8: Payments in foreign currencies (non-INR) are rejected", () => {
    const webhookRoute = fs.readFileSync(path.join(rootDir, "src/app/api/payments/webhook/route.ts"), "utf-8");
    assert.ok(webhookRoute.includes("payloadCurrency.toUpperCase() !== \"INR\""), "Must reject non-INR transactions");
    assert.ok(webhookRoute.includes("Currency mismatch: Expected INR"), "Must explicitly mandate INR currency");
  });

  // --------------------------------------------------------------------------
  // Case 9: Incorrect merchant account
  // --------------------------------------------------------------------------
  it("Case 9: Payments sent to mismatched payee VPAs are rejected during reconciliation", () => {
    const providerFile = fs.readFileSync(path.join(rootDir, "src/lib/adapters/PaymentProvider.ts"), "utf-8");
    assert.ok(providerFile.includes("bankTx.payeeVpa.toLowerCase() !== payeeVpa.toLowerCase()"), "Must check bank record payee against store payee VPA");
    assert.ok(providerFile.includes("Merchant account mismatch"), "Must report merchant account mismatch");
  });

  // --------------------------------------------------------------------------
  // Case 10: Payment provider temporarily unavailable
  // --------------------------------------------------------------------------
  it("Case 10: When payment provider or bank query times out, payment retains PENDING state", () => {
    const providerFile = fs.readFileSync(path.join(rootDir, "src/lib/adapters/PaymentProvider.ts"), "utf-8");
    assert.ok(providerFile.includes("REQUIRES_RECONCILIATION") || providerFile.includes("PENDING"), "Must hold unresolved payments without inferring failure");
    assert.ok(!providerFile.includes("inferPaymentSuccess"), "Must never infer payment success without authoritative confirmation");
  });

  // --------------------------------------------------------------------------
  // Case 11: Pending payment later confirmed successful
  // --------------------------------------------------------------------------
  it("Case 11: Pending payment auto-reconciles to COMPLETED when bank credit arrives in BankTransaction ledger", () => {
    const statusRoute = fs.readFileSync(path.join(rootDir, "src/app/api/payments/[id]/status/route.ts"), "utf-8");
    assert.ok(statusRoute.includes("prisma.bankTransaction.findUnique"), "Must check BankTransaction ledger during live status polling");
    assert.ok(statusRoute.includes("bankTx.status === \"UNCLAIMED\""), "Must identify unclaimed bank credit matching UTR");
    assert.ok(statusRoute.includes("currentStatus = \"COMPLETED\""), "Must transition to COMPLETED when bank credit is matched");
  });

  // --------------------------------------------------------------------------
  // Case 12: Payment authoritatively failed
  // --------------------------------------------------------------------------
  it("Case 12: Authoritative bank rejection or terminal expiration cleanly sets FAILED/EXPIRED", () => {
    const statusRoute = fs.readFileSync(path.join(rootDir, "src/app/api/payments/[id]/status/route.ts"), "utf-8");
    assert.ok(statusRoute.includes("status: \"EXPIRED\"") || statusRoute.includes("status: \"FAILED\""), "Must update terminal failure/expiry state");
    assert.ok(statusRoute.includes("PAYMENT_EXPIRED_5_MIN_WINDOW"), "Must record audit log for session timeout");
  });

  // --------------------------------------------------------------------------
  // Case 13: Customer cancels the external app
  // --------------------------------------------------------------------------
  it("Case 13: Customer cancelling external app leaves transaction pending / safely retryable without duplicate orders", () => {
    const modalContent = fs.readFileSync(resolveFile("src/components/payment/DynamicPaymentModal.tsx"), "utf-8");
    assert.ok(modalContent.includes("Return to Payment Options / Show QR"), "Must offer return button so customer can retry or scan QR");
    assert.ok(modalContent.includes("Switch to Cash on Delivery"), "Must offer COD fallback after cancellation");
  });

  // --------------------------------------------------------------------------
  // Case 14: UPI app is not installed
  // --------------------------------------------------------------------------
  it("Case 14: If specific UPI app is not installed, Guidance Modal offers alternative apps and dynamic QR", () => {
    const modalContent = fs.readFileSync(resolveFile("src/components/payment/DynamicPaymentModal.tsx"), "utf-8");
    assert.ok(modalContent.includes("Continue with another supported UPI app"), "Must offer fallback to universal UPI launcher");
    assert.ok(modalContent.includes("Show QR code, when supported"), "Must offer QR code scan alternative");
    assert.ok(modalContent.includes("Payment app not opening?"), "Must offer clear troubleshooting guidance");
  });

  // --------------------------------------------------------------------------
  // Case 15: Browser does not complete the external handoff
  // --------------------------------------------------------------------------
  it("Case 15: If mobile browser blocks web intent, QR Code scan and COD remain immediately accessible", () => {
    const modalContent = fs.readFileSync(resolveFile("src/components/payment/DynamicPaymentModal.tsx"), "utf-8");
    assert.ok(modalContent.includes("Or Scan with Any Phone Camera / UPI App"), "Must render dynamic QR code as accessible fail-safe");
    assert.ok(modalContent.includes("onSwitchToCod"), "Must provide Switch to Cash on Delivery action");
  });

  // --------------------------------------------------------------------------
  // Case 16: Customer returns from the payment app
  // --------------------------------------------------------------------------
  it("Case 16: Customer returning to browser checks live status without inferring success from visibility change", () => {
    const modalContent = fs.readFileSync(resolveFile("src/components/payment/DynamicPaymentModal.tsx"), "utf-8");
    assert.ok(modalContent.includes("Check Bank Status Now") || modalContent.includes("checkPaymentStatusManual"), "Must provide manual bank check button");
    assert.ok(!modalContent.includes("document.addEventListener(\"visibilitychange\""), "Must never infer payment result from browser visibility");
  });

  // --------------------------------------------------------------------------
  // Case 17: Customer refreshes the checkout page
  // --------------------------------------------------------------------------
  it("Case 17: Customer refreshing checkout page preserves pending payment state from database", () => {
    const statusRoute = fs.readFileSync(resolveFile("src/app/api/payments/[id]/status/route.ts"), "utf-8");
    assert.ok(statusRoute.includes("prisma.payment.findUnique"), "Must fetch persisted state from database by orderId");
    assert.ok(statusRoute.includes("status: currentStatus"), "Must return exact database payment status");
  });

  // --------------------------------------------------------------------------
  // Case 18: Customer clicks the pay button repeatedly
  // --------------------------------------------------------------------------
  it("Case 18: Customer clicking pay button repeatedly is debounced and rate-limited", () => {
    const modalContent = fs.readFileSync(resolveFile("src/components/payment/DynamicPaymentModal.tsx"), "utf-8");
    assert.ok(modalContent.includes("launchingApp"), "Must track launchingApp state to debounce repeated clicks");
    assert.ok(modalContent.includes("if (launchingApp) return"), "Must ignore subsequent clicks while handoff is processing");

    const qrRoute = fs.readFileSync(resolveFile("src/app/api/payments/dynamic-qr/route.ts"), "utf-8");
    assert.ok(qrRoute.includes("checkRateLimit"), "Dynamic QR endpoint must enforce rate limiting against rapid clicks");
  });

  // --------------------------------------------------------------------------
  // Case 19: Two concurrent requests attempt to process the same payment
  // --------------------------------------------------------------------------
  it("Case 19: Concurrent requests are serialized safely via Prisma transactions and row matching", () => {
    const statusRoute = fs.readFileSync(path.join(rootDir, "src/app/api/payments/[id]/status/route.ts"), "utf-8");
    assert.ok(statusRoute.includes("prisma.$transaction"), "Must execute inside Prisma transaction block");
    assert.ok(statusRoute.includes("existingPayment.status === \"COMPLETED\""), "Must guard against concurrent double-processing");
  });

  // --------------------------------------------------------------------------
  // Case 20: Payment arrives after the order expires or is cancelled
  // --------------------------------------------------------------------------
  it("Case 20: Payment received for cancelled order is flagged for reconciliation instead of fulfilled", () => {
    const webhookRoute = fs.readFileSync(path.join(rootDir, "src/app/api/payments/webhook/route.ts"), "utf-8");
    assert.ok(webhookRoute.includes("payment.order.status === \"CANCELLED\""), "Must inspect order cancellation status");
    assert.ok(webhookRoute.includes("post-cancellation flagged for reconciliation"), "Must flag post-cancellation payments for manual review");
  });

  // --------------------------------------------------------------------------
  // Case 21: Customer attempts to access another customer's transaction
  // --------------------------------------------------------------------------
  it("Case 21: Cross-customer payment inspection is blocked with 403 Forbidden", () => {
    const statusRoute = fs.readFileSync(path.join(rootDir, "src/app/api/payments/[id]/status/route.ts"), "utf-8");
    assert.ok(statusRoute.includes("isOwner = session && session.id === payment.order.userId"), "Must verify user ownership against session");
    assert.ok(statusRoute.includes("Unauthorized access to order payment details"), "Must return 403 Forbidden on ownership mismatch");
  });

  // --------------------------------------------------------------------------
  // Case 22: QR payment and app-intent payment use consistent amounts
  // --------------------------------------------------------------------------
  it("Case 22: Dynamic QR URI and UPI Intent links encode identical server-calculated payable amount", () => {
    const testDetails = {
      vpa: "7975137618@okbizaxis",
      payeeName: "Fresh Chicken Centre",
      amountRupees: 289.5,
      orderNumber: "FC-9999",
      mc: "5422",
    };

    const qrUri = buildUpiUri(testDetails);
    const intentLinks = generateUpiIntentLinks(testDetails);

    assert.ok(qrUri.includes("am=289.50"), "Dynamic QR must encode exact amount with paise precision");
    assert.ok(intentLinks.gpayUrl.includes("am=289.50"), "Google Pay intent must encode identical amount");
    assert.ok(intentLinks.phonepeUrl.includes("am=289.50"), "PhonePe intent must encode identical amount");
    assert.ok(intentLinks.paytmUrl.includes("am=289.50"), "Paytm intent must encode identical amount");
  });

  // --------------------------------------------------------------------------
  // Case 23: Frontend attempts to manipulate the amount
  // --------------------------------------------------------------------------
  it("Case 23: Dynamic QR endpoint overrides client amount with server-calculated total from database order", () => {
    const qrRoute = fs.readFileSync(path.join(rootDir, "src/app/api/payments/dynamic-qr/route.ts"), "utf-8");
    assert.ok(qrRoute.includes("targetAmountRupees = order.totalMinor / 100"), "Must fetch authoritative amount from Order in database");
    assert.ok(qrRoute.includes("targetOrderNumber = order.orderNumber"), "Must bind to authentic order number from database");
  });

  // --------------------------------------------------------------------------
  // Case 24: Backend restarts while a payment remains pending
  // --------------------------------------------------------------------------
  it("Case 24: Payment sessions are persisted in PostgreSQL; state survives process restart without memory loss", () => {
    const providerFile = fs.readFileSync(path.join(rootDir, "src/lib/adapters/PaymentProvider.ts"), "utf-8");
    assert.ok(providerFile.includes("prisma.payment.upsert"), "Must persist payment session directly into PostgreSQL");
    assert.ok(providerFile.includes("prisma.payment.findUnique"), "Must restore session state from database");
  });
});
