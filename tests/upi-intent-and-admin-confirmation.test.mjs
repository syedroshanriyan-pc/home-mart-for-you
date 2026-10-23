import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

describe("UPI Intent Apps, Auto-Webhook Status Detection, Custom Error Pages & Admin Confirmation Timer", () => {
  const rootDir = process.cwd();

  it("DynamicPaymentModal must remove dynamic QR and offer direct UPI Intent Apps", () => {
    const modalPath = path.join(rootDir, "src", "components", "payment", "DynamicPaymentModal.tsx");
    assert.ok(fs.existsSync(modalPath), "DynamicPaymentModal must exist");
    const content = fs.readFileSync(modalPath, "utf-8");

    // Dynamic QR image elements must be removed
    assert.ok(!content.includes("alt=\"Dynamic UPI QR Code\""), "Must remove QR Code image from modal");
    assert.ok(!content.includes("qrDataUrl"), "Must remove qrDataUrl state and rendering from modal");

    // Must offer Google Pay, PhonePe, and Paytm UPI Intent direct launches
    assert.ok(content.includes("Google Pay"), "Must include Google Pay app intent");
    assert.ok(content.includes("PhonePe"), "Must include PhonePe app intent");
    assert.ok(content.includes("Paytm"), "Must include Paytm app intent");
    assert.ok(content.includes("gpayUrl"), "Must bind gpayUrl intent");
    assert.ok(content.includes("phonepeUrl"), "Must bind phonepeUrl intent");
  });

  it("DynamicPaymentModal must automatically check payment status live from backend", () => {
    const modalPath = path.join(rootDir, "src", "components", "payment", "DynamicPaymentModal.tsx");
    const content = fs.readFileSync(modalPath, "utf-8");
    assert.ok(content.includes("api/payments/${orderId}/status"), "Must poll payment status endpoint");
    assert.ok(content.includes("COMPLETED"), "Must check for COMPLETED status automatically");
    assert.ok(content.includes("FAILED"), "Must check for FAILED status automatically");
  });

  it("DynamicPaymentModal must render a custom Success screen and a custom Failure screen", () => {
    const modalPath = path.join(rootDir, "src", "components", "payment", "DynamicPaymentModal.tsx");
    const content = fs.readFileSync(modalPath, "utf-8");
    assert.ok(content.includes("Payment Confirmed") || content.includes("Paid Successfully"), "Must render custom success screen");
    assert.ok(content.includes("Payment Incomplete") || content.includes("Payment Unsuccessful"), "Must render custom failure screen");
    assert.ok(content.includes("Switch to Cash on Delivery"), "Must render Switch to COD action");
  });

  it("custom error boundary pages error.tsx and global-error.tsx must exist with support contacts", () => {
    const errorPagePath = path.join(rootDir, "src", "app", "error.tsx");
    const globalErrorPath = path.join(rootDir, "src", "app", "global-error.tsx");
    const notFoundPath = path.join(rootDir, "src", "app", "not-found.tsx");

    assert.ok(fs.existsSync(errorPagePath), "src/app/error.tsx must exist");
    assert.ok(fs.existsSync(globalErrorPath), "src/app/global-error.tsx must exist");
    assert.ok(fs.existsSync(notFoundPath), "src/app/not-found.tsx must exist");

    const errorContent = fs.readFileSync(errorPagePath, "utf-8");
    assert.ok(errorContent.includes("reset"), "error.tsx must provide reset/retry callback");
    assert.ok(errorContent.includes("9035526638"), "error.tsx must provide store support hotline");

    const notFoundContent = fs.readFileSync(notFoundPath, "utf-8");
    assert.ok(notFoundContent.includes("404"), "not-found.tsx must display 404");
  });

  it("customer order screen delivery timer must start ONLY after order is confirmed by admin", () => {
    const orderDetailsPath = path.join(rootDir, "src", "app", "account", "orders", "[id]", "page.tsx");
    const content = fs.readFileSync(orderDetailsPath, "utf-8");

    assert.ok(
      content.includes("order.confirmedAt"),
      "Must check for order.confirmedAt before starting countdown timer"
    );
    assert.ok(
      content.includes("Order Received — Awaiting Store Confirmation") || content.includes("Awaiting Store Confirmation"),
      "Must inform user that countdown begins once confirmed by store admin"
    );
    assert.ok(
      content.includes("confirmedTime + 20 * 60 * 1000"),
      "Countdown target delivery time must be calculated from admin confirmation time"
    );
  });

  it("admin orders route must only show orders once paid or if COD", () => {
    const adminOrdersPath = path.join(rootDir, "src", "app", "api", "admin", "orders", "route.ts");
    const content = fs.readFileSync(adminOrdersPath, "utf-8");
    assert.ok(content.includes("payment: { method: \"COD\" }"), "Must show COD orders");
    assert.ok(content.includes("payment: { status: \"COMPLETED\" }"), "Must show completed payments only");
  });
});
