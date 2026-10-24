import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import jwt from "jsonwebtoken";
import { generateUpiIntentLinks } from "../src/lib/upi.ts";

describe("HOMEMART4U — Production Authentication, UPI Payment, Webhook and Support Repair Suite", () => {
  const rootDir = process.cwd();

  describe("1. Authentication Reload Resilience & Hydration State", () => {
    it("AuthContext must provide hydration loading state and handle network retry", () => {
      const authContextPath = path.join(rootDir, "src", "context", "AuthContext.tsx");
      const content = fs.readFileSync(authContextPath, "utf-8");

      assert.ok(content.includes("isNetworkError"), "AuthContext must expose isNetworkError state");
      assert.ok(content.includes("inFlightPromiseRef"), "AuthContext must deduplicate concurrent session checks");
      assert.ok(content.includes("res.status === 401"), "AuthContext must explicitly check 401 for unauthenticated sessions");
      assert.ok(content.includes("deleteAccount"), "AuthContext must retain deleteAccount function");
    });

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

    it("Service worker must never cache dynamic HTML, auth, or account pages", () => {
      const swPath = path.join(rootDir, "public", "sw.js");
      const content = fs.readFileSync(swPath, "utf-8");

      assert.ok(content.includes("/account"), "Service worker must bypass /account requests");
      assert.ok(content.includes("/api/"), "Service worker must bypass /api/ requests");
      assert.ok(content.includes("/checkout"), "Service worker must bypass /checkout requests");
      assert.ok(!content.includes("caches.match(\"/\")"), "Service worker must not fallback to cached homepage for all navigations");
    });

    it("Protected pages and Navbar must respect authLoading state", () => {
      const checkoutContent = fs.readFileSync(path.join(rootDir, "src", "app", "checkout", "page.tsx"), "utf-8");
      const homeControllerContent = fs.readFileSync(path.join(rootDir, "src", "components", "home", "HomePageClientController.tsx"), "utf-8");
      const navbarContent = fs.readFileSync(path.join(rootDir, "src", "components", "layout", "Navbar.tsx"), "utf-8");

      assert.ok(checkoutContent.includes("authLoading"), "Checkout page must check authLoading before prompt");
      assert.ok(homeControllerContent.includes("if (loading)"), "HomePageClientController must check loading before blog view");
      assert.ok(navbarContent.includes("loading ?"), "Navbar must handle loading state smoothly");
    });
  });

  describe("2. UPI Payment Options & Deep Link Generation", () => {
    it("generateUpiIntentLinks must generate deep links for all options with correct parameters", () => {
      const links = generateUpiIntentLinks({
        vpa: "9844797374@mbk",
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
      assert.ok(links.genericUrl.includes("pa=9844797374%40mbk"), "VPA must be properly encoded");
    });

    it("DynamicPaymentModal must provide platform-aware handling and debouncing", () => {
      const modalContent = fs.readFileSync(path.join(rootDir, "src", "components", "payment", "DynamicPaymentModal.tsx"), "utf-8");

      assert.ok(modalContent.includes("isAndroid"), "Modal must detect Android platform");
      assert.ok(modalContent.includes("isIos"), "Modal must detect iOS platform");
      assert.ok(modalContent.includes("launchingApp"), "Modal must debounce clicks to prevent duplicate initiation");
    });
  });

  describe("3. Hide UPI ID from Customer-Facing UI", () => {
    it("DynamicPaymentModal must not display raw merchant UPI ID text or standalone copy control", () => {
      const modalContent = fs.readFileSync(path.join(rootDir, "src", "components", "payment", "DynamicPaymentModal.tsx"), "utf-8");

      assert.ok(!modalContent.includes("Verified Merchant"), "Must remove 'Verified Merchant' header showing raw UPI ID");
      assert.ok(!modalContent.includes("copyUpiId"), "Must remove standalone copy UPI ID function");
      assert.ok(!modalContent.includes("copiedUpi"), "Must remove copiedUpi state");
    });
  });

  describe("4. Manual UTR Entry Removal & Payment Support Hotline", () => {
    it("DynamicPaymentModal must completely remove manual UTR submission", () => {
      const modalContent = fs.readFileSync(path.join(rootDir, "src", "components", "payment", "DynamicPaymentModal.tsx"), "utf-8");

      assert.ok(!modalContent.includes("handleVerifyUtr"), "Must remove handleVerifyUtr function");
      assert.ok(!modalContent.includes("showManualUtr"), "Must remove showManualUtr state");
      assert.ok(!modalContent.includes("Enter 12-digit UTR"), "Must remove manual UTR input prompt");
    });

    it("DynamicPaymentModal must provide accessible telephone support section", () => {
      const modalContent = fs.readFileSync(path.join(rootDir, "src", "components", "payment", "DynamicPaymentModal.tsx"), "utf-8");

      assert.ok(modalContent.includes("Payment issue? Raise a complaint"), "Must render exact heading 'Payment issue? Raise a complaint'");
      assert.ok(modalContent.includes("Payment deducted, pending, or not reflected? Contact Homemart4u Support for assistance with your order"), "Must render statutory explanatory text");
      assert.ok(modalContent.includes("tel:"), "Must create accessible tel: link");
      assert.ok(modalContent.includes("supportPhoneDisplay") || modalContent.includes("supportTel"), "Must use dynamic support telephone configuration");
    });

    it("Status route GET must enforce ownership checks to prevent IDOR", () => {
      const statusContent = fs.readFileSync(path.join(rootDir, "src", "app", "api", "payments", "[id]", "status", "route.ts"), "utf-8");

      assert.ok(statusContent.includes("Unauthorized access to order payment details"), "Must reject unauthorized caller inspecting payment details");
      assert.ok(statusContent.includes("payment.order.userId"), "Must check against order userId owner");
    });
  });

  describe("5. Payment Webhook Reconciliation & Idempotency", () => {
    it("Webhook route must reconcile amount, currency, and avoid cancelled orders", () => {
      const webhookContent = fs.readFileSync(path.join(rootDir, "src", "app", "api", "payments", "webhook", "route.ts"), "utf-8");

      assert.ok(webhookContent.includes("payloadAmountMinor"), "Must reconcile transaction amount");
      assert.ok(webhookContent.includes("payloadCurrency"), "Must reconcile currency");
      assert.ok(webhookContent.includes("CANCELLED"), "Must check for cancelled order");
      assert.ok(webhookContent.includes("duplicateTxn"), "Must prevent crediting transaction reference to another order");
      assert.ok(webhookContent.includes("idempotent: true"), "Must return idempotent response on duplicate success events");
    });
  });

  describe("6. Split Vercel Frontend & Render Backend Support", () => {
    it("render.yaml and vercel.json configurations must exist and define proper builds", () => {
      const renderPath = path.join(rootDir, "render.yaml");
      const vercelPath = path.join(rootDir, "vercel.json");

      assert.ok(fs.existsSync(renderPath), "render.yaml must exist");
      assert.ok(fs.existsSync(vercelPath), "vercel.json must exist");

      const renderContent = fs.readFileSync(renderPath, "utf-8");
      assert.ok(renderContent.includes("homemart4u-backend"), "render.yaml must name backend service");
      assert.ok(renderContent.includes("DATABASE_URL"), "render.yaml must declare DATABASE_URL");
      assert.ok(renderContent.includes("AUTH_SECRET"), "render.yaml must declare AUTH_SECRET");
    });

    it("next.config.mjs must support proxying /api/ to Render backend via rewrites", () => {
      const nextConfigContent = fs.readFileSync(path.join(rootDir, "next.config.mjs"), "utf-8");

      assert.ok(nextConfigContent.includes("RENDER_BACKEND_URL"), "next.config.mjs must support RENDER_BACKEND_URL");
      assert.ok(nextConfigContent.includes("rewrites"), "next.config.mjs must implement rewrites");
    });

    it("middleware.ts must allow Vercel and Render domains in CORS and CSRF checks", () => {
      const middlewareContent = fs.readFileSync(path.join(rootDir, "src", "middleware.ts"), "utf-8");

      assert.ok(middlewareContent.includes(".vercel.app"), "middleware.ts must support *.vercel.app");
      assert.ok(middlewareContent.includes(".onrender.com"), "middleware.ts must support *.onrender.com");
      assert.ok(middlewareContent.includes("FRONTEND_URL"), "middleware.ts must support FRONTEND_URL");
    });
  });
});
