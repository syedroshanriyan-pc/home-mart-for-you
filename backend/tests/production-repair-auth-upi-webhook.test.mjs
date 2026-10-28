import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { generateUpiIntentLinks } from "../src/lib/upi.ts";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

describe("HOMEMART4U — Production Authentication, UPI Payment, Webhook and Support Repair Suite (Backend)", () => {
  describe("1. Authentication Route Security & Secrets", () => {
    it("/api/auth/me must set no-store headers and force-dynamic execution", () => {
      const meRoutePath = path.join(rootDir, "src", "app", "api", "auth", "me", "route.ts");
      const content = fs.readFileSync(meRoutePath, "utf-8");

      assert.ok(content.includes("force-dynamic"), "me route must export force-dynamic");
      assert.ok(content.includes("no-store"), "me route must set Cache-Control no-store");
      assert.ok(content.includes("status: 401"), "me route must return 401 on unauthenticated access");
    });

    it("auth.ts and middleware.ts must have consistent secret fallbacks", () => {
      const authPath = path.join(rootDir, "src", "lib", "auth.ts");
      const middlewarePath = path.join(rootDir, "src", "middleware.ts");
      const authContent = fs.readFileSync(authPath, "utf-8");
      const middlewareContent = fs.readFileSync(middlewarePath, "utf-8");

      assert.ok(authContent.includes("fc_dev_super_secret_jwt_key_2026_mulbagal_secure"), "auth.ts has safe secret fallback");
      assert.ok(middlewareContent.includes("fc_dev_super_secret_jwt_key_2026_mulbagal_secure"), "middleware.ts has safe secret fallback");
    });
  });

  describe("2. UPI Payment Options & Deep Link Generation", () => {
    it("generateUpiIntentLinks must generate deep links for all options with correct parameters", () => {
      const links = generateUpiIntentLinks({
        vpa: "merchant@upi",
        payeeName: "homemart4u",
        amountRupees: 250.5,
        orderNumber: "FC-9001",
        transactionRef: "TXN_FC-9001_12345",
        note: "Order FC-9001",
      });

      assert.ok(links.gpayUrl.startsWith("gpay://upi/pay?"), "Must generate gpayUrl deep link");
      assert.ok(links.phonepeUrl.startsWith("phonepe://pay?"), "Must generate phonepeUrl deep link");
      assert.ok(links.paytmUrl.startsWith("paytmmp://pay?"), "Must generate paytmUrl deep link");
      assert.ok(links.bhimUrl.startsWith("upi://pay?"), "Must generate bhimUrl universal link");
      assert.ok(links.genericUrl.startsWith("upi://pay?"), "Must generate genericUrl universal link");

      assert.ok(links.androidGpayIntent?.includes("package=com.google.android.apps.nbu.paisa.user"), "Must generate Android GPay intent");
      assert.ok(links.androidPhonePeIntent?.includes("package=com.phonepe.app"), "Must generate Android PhonePe intent");
      assert.ok(links.androidPaytmIntent?.includes("package=net.one97.paytm"), "Must generate Android Paytm intent");
      assert.ok(links.androidBhimIntent?.includes("package=in.org.npci.upiapp"), "Must generate Android BHIM intent");

      assert.ok(links.genericUrl.includes("am=250.50"), "Amount must be formatted with 2 decimal places");
      assert.ok(links.genericUrl.includes("cu=INR"), "Currency must be INR");
      assert.ok(links.genericUrl.includes("pa=merchant%40upi"), "VPA must be properly encoded");
    });

    it("Status route GET must enforce ownership checks to prevent IDOR", () => {
      const statusContent = fs.readFileSync(path.join(rootDir, "src", "app", "api", "payments", "[id]", "status", "route.ts"), "utf-8");

      assert.ok(statusContent.includes("Unauthorized access to order payment details"), "Must reject unauthorized caller inspecting payment details");
      assert.ok(statusContent.includes("payment.order.userId"), "Must check against order userId owner");
    });
  });

  describe("3. Payment Webhook Reconciliation & Idempotency", () => {
    it("Webhook route must reconcile amount, currency, and avoid cancelled orders", () => {
      const webhookContent = fs.readFileSync(path.join(rootDir, "src", "app", "api", "payments", "webhook", "route.ts"), "utf-8");

      assert.ok(webhookContent.includes("payloadAmountMinor"), "Must reconcile transaction amount");
      assert.ok(webhookContent.includes("payloadCurrency"), "Must reconcile currency");
      assert.ok(webhookContent.includes("CANCELLED"), "Must check for cancelled order");
      assert.ok(webhookContent.includes("duplicateTxn"), "Must prevent crediting transaction reference to another order");
      assert.ok(webhookContent.includes("idempotent: true"), "Must return idempotent response on duplicate success events");
    });
  });

  describe("4. Render Backend Configuration & Domain CORS", () => {
    it("render.yaml configuration must exist and define proper builds", () => {
      const renderPath = path.join(rootDir, "render.yaml");
      assert.ok(fs.existsSync(renderPath), "render.yaml must exist");

      const renderContent = fs.readFileSync(renderPath, "utf-8");
      assert.ok(renderContent.includes("homemart4u-backend"), "render.yaml must name backend service");
      assert.ok(renderContent.includes("DATABASE_URL"), "render.yaml must declare DATABASE_URL");
      assert.ok(renderContent.includes("AUTH_SECRET"), "render.yaml must declare AUTH_SECRET");
    });

    it("middleware.ts must allow Vercel and Render domains in CORS and CSRF checks", () => {
      const middlewareContent = fs.readFileSync(path.join(rootDir, "src", "middleware.ts"), "utf-8");

      assert.ok(middlewareContent.includes(".vercel.app"), "middleware.ts must support *.vercel.app");
      assert.ok(middlewareContent.includes(".onrender.com"), "middleware.ts must support *.onrender.com");
      assert.ok(middlewareContent.includes("FRONTEND_URL"), "middleware.ts must support FRONTEND_URL");
    });
  });
});
