import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

describe("Frontend UI & Hydration Resilience Suite", () => {
  describe("1. Authentication Reload Resilience & Hydration State", () => {
    it("AuthContext must provide hydration loading state and handle network retry", () => {
      const authContextPath = path.join(rootDir, "src", "context", "AuthContext.tsx");
      const content = fs.readFileSync(authContextPath, "utf-8");

      assert.ok(content.includes("isNetworkError"), "AuthContext must expose isNetworkError state");
      assert.ok(content.includes("inFlightPromiseRef"), "AuthContext must deduplicate concurrent session checks");
      assert.ok(content.includes("401"), "AuthContext must explicitly check 401 for unauthenticated sessions");
      assert.ok(content.includes("deleteAccount"), "AuthContext must retain deleteAccount function");
    });
  });

  describe("2. Service Worker Caching Hygiene", () => {
    it("Service worker must never cache dynamic HTML, auth, or account pages", () => {
      const swPath = path.join(rootDir, "public", "sw.js");
      assert.ok(fs.existsSync(swPath), "public/sw.js must exist");
      const content = fs.readFileSync(swPath, "utf-8");

      assert.ok(content.includes("DO_NOT_CACHE_PATHS"), "Must declare DO_NOT_CACHE_PATHS blacklist");
      assert.ok(content.includes("/account"), "Must blacklist /account");
      assert.ok(content.includes("/login"), "Must blacklist /login");
      assert.ok(content.includes("/register"), "Must blacklist /register");
      assert.ok(content.includes("/admin"), "Must blacklist /admin");
      assert.ok(content.includes("isIgnoredPath"), "Must check isIgnoredPath before caching");
    });

    it("Protected pages and Navbar must respect authLoading state", () => {
      const checkoutContent = fs.readFileSync(path.join(rootDir, "src", "app", "checkout", "page.tsx"), "utf-8");
      const accountContent = fs.readFileSync(path.join(rootDir, "src", "app", "account", "page.tsx"), "utf-8");
      const navbarContent = fs.readFileSync(path.join(rootDir, "src", "components", "layout", "Navbar.tsx"), "utf-8");

      assert.ok(checkoutContent.includes("loading") || checkoutContent.includes("authLoading"), "Checkout page must check loading state");
      assert.ok(accountContent.includes("loading") || accountContent.includes("authLoading"), "Account page must check loading state");
      assert.ok(navbarContent.includes("loading") || navbarContent.includes("authLoading"), "Navbar must check loading state");
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
  });

  describe("5. Frontend Next.js Rewrites to Backend", () => {
    it("next.config.mjs must support proxying /api/ to Render backend via rewrites", () => {
      const nextConfigContent = fs.readFileSync(path.join(rootDir, "next.config.mjs"), "utf-8");

      assert.ok(nextConfigContent.includes("RENDER_BACKEND_URL"), "next.config.mjs must support RENDER_BACKEND_URL");
      assert.ok(nextConfigContent.includes("rewrites"), "next.config.mjs must implement rewrites");
      assert.ok(nextConfigContent.includes("/api/:path*"), "next.config.mjs must proxy /api/:path*");
    });

    it("vercel.json configuration must exist and define nextjs framework", () => {
      const vercelPath = path.join(rootDir, "vercel.json");
      assert.ok(fs.existsSync(vercelPath), "vercel.json must exist");
      const vercelContent = fs.readFileSync(vercelPath, "utf-8");
      assert.ok(vercelContent.includes("nextjs"), "vercel.json must declare nextjs framework");
    });
  });
});
