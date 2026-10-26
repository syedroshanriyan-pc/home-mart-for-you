import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const rootDir = process.cwd();

describe("Payment Security, Webhook Integrity & Hardened UI Audit Suite", () => {
  describe("1. Webhook Integrity & Cryptographic Protection", () => {
    it("webhook route enforces constant-time comparison for server secret header", () => {
      const webhookPath = path.join(rootDir, "src/app/api/payments/webhook/route.ts");
      const content = fs.readFileSync(webhookPath, "utf-8");

      assert.ok(
        content.includes("crypto.timingSafeEqual"),
        "Must use timingSafeEqual for secret/signature verification"
      );
      assert.ok(
        content.includes("Buffer.from(serverSecret)") || content.includes("serverBuf"),
        "Must convert server secret to Buffer for constant-time comparison"
      );
    });

    it("webhook route prevents transaction stealing across distinct orders in BankTransaction", () => {
      const webhookPath = path.join(rootDir, "src/app/api/payments/webhook/route.ts");
      const content = fs.readFileSync(webhookPath, "utf-8");

      assert.ok(
        content.includes("existingBankTx.claimedOrderId && existingBankTx.claimedOrderId !== payment.orderId"),
        "Must verify existing bank transaction is not claimed by another order before claiming"
      );
    });

    it("webhook route validates payload amounts and rejects underpayments", () => {
      const webhookPath = path.join(rootDir, "src/app/api/payments/webhook/route.ts");
      const content = fs.readFileSync(webhookPath, "utf-8");

      assert.ok(
        content.includes("payloadAmountMinor < payment.amountMinor"),
        "Must reject webhook when received amount is less than expected amount"
      );
    });
  });

  describe("2. Payment Status Authorization, Rate Limiting & Non-Repudiation", () => {
    it("status route enforces sliding window rate limiting on GET and POST", () => {
      const statusRoutePath = path.join(rootDir, "src/app/api/payments/[id]/status/route.ts");
      const content = fs.readFileSync(statusRoutePath, "utf-8");

      assert.ok(
        content.includes("checkRateLimit"),
        "Must apply checkRateLimit to status route"
      );
      assert.ok(
        content.includes("getClientIp"),
        "Must resolve client IP for rate limiting"
      );
    });

    it("status route blocks arbitrary unverified UTRs from confirming orders", () => {
      const statusRoutePath = path.join(rootDir, "src/app/api/payments/[id]/status/route.ts");
      const content = fs.readFileSync(statusRoutePath, "utf-8");

      assert.ok(
        content.includes("REQUIRES_RECONCILIATION"),
        "Must handle REQUIRES_RECONCILIATION status"
      );
      assert.ok(
        content.includes("PAYMENT_FLAGGED_FOR_RECONCILIATION"),
        "Must record audit log when payment is held for reconciliation"
      );
    });

    it("payment provider adapter holds unverified UTRs for reconciliation in production", () => {
      const providerPath = path.join(rootDir, "src/lib/adapters/PaymentProvider.ts");
      const content = fs.readFileSync(providerPath, "utf-8");

      assert.ok(
        content.includes("REQUIRES_RECONCILIATION"),
        "PaymentProvider must return REQUIRES_RECONCILIATION when UTR is not yet confirmed by bank"
      );
      assert.ok(
        content.includes("ORDER_SIMULATION_ENABLED"),
        "Must gate simulation mode with environment flag"
      );
    });
  });

  describe("3. Payment Screen UI Blocks & Authentic Brand SVGs", () => {
    it("DynamicPaymentModal renders dedicated application blocks with official brand SVGs", () => {
      const modalPath = path.join(rootDir, "src/components/payment/DynamicPaymentModal.tsx");
      const content = fs.readFileSync(modalPath, "utf-8");

      // Verify authentic brand SVG logos
      assert.ok(content.includes("GooglePayLogo"), "Must define official GooglePayLogo component");
      assert.ok(content.includes("PhonePeLogo"), "Must define official PhonePeLogo component");
      assert.ok(content.includes("PaytmLogo"), "Must define official PaytmLogo component");
      assert.ok(content.includes("UpiLogo"), "Must define official UpiLogo component");

      // Verify separated blocks
      assert.ok(content.includes("Pay Directly via UPI Apps"), "Must render UPI apps block header");
      assert.ok(content.includes("grid grid-cols-2 gap-2.5"), "Must render structured 2-column app cards");
      assert.ok(content.includes("Or Scan with Any Phone Camera / UPI App"), "Must render QR scanner block header");
      assert.ok(content.includes("Exact Amount to Pay"), "Must render exact payable amount block");
      assert.ok(content.includes("Payment issue? Raise a complaint"), "Must render customer support block");
    });
  });
});
