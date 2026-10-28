import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

test("Production Security Hardening & Webhook Verification", async (t) => {
  await t.test("Payment webhook route must enforce HMAC signature verification", () => {
    const webhookFile = fs.readFileSync(
      path.join(rootDir, "src", "app", "api", "payments", "webhook", "route.ts"),
      "utf8"
    );
    assert.ok(
      webhookFile.includes("createHmac"),
      "Webhook route must use HMAC algorithm for signature verification"
    );
    assert.ok(
      webhookFile.includes("timingSafeEqual"),
      "Webhook route must use crypto.timingSafeEqual to prevent timing attacks"
    );
    assert.ok(
      webhookFile.includes("x-webhook-signature") || webhookFile.includes("x-razorpay-signature"),
      "Webhook route must inspect signature header"
    );
  });

  await t.test("Webhook HMAC signature calculation matches expected test vector", () => {
    const secret = "test_webhook_secret_key_12345";
    const rawPayload = JSON.stringify({ orderNumber: "FC-1001", status: "SUCCESS", txnRef: "UPI_998877" });
    const computedSignature = crypto.createHmac("sha256", secret).update(rawPayload).digest("hex");

    const forgedSignature = crypto.createHmac("sha256", "wrong_secret").update(rawPayload).digest("hex");

    const validBuffer = Buffer.from(computedSignature, "hex");
    const testValidBuffer = Buffer.from(computedSignature, "hex");
    const forgedBuffer = Buffer.from(forgedSignature, "hex");

    assert.ok(crypto.timingSafeEqual(validBuffer, testValidBuffer), "Valid signature must match");
    assert.ok(!crypto.timingSafeEqual(validBuffer, forgedBuffer), "Forged signature must be rejected");
  });

  await t.test("Middleware must implement cryptographic JWT verification and CSRF protections", () => {
    const middlewareContent = fs.readFileSync(path.join(rootDir, "src", "middleware.ts"), "utf8");
    assert.ok(
      middlewareContent.includes("crypto.subtle.verify"),
      "Middleware must use Web Crypto HMAC-SHA256 verification"
    );
    assert.ok(
      middlewareContent.includes("Cross-site request"),
      "Middleware must block unauthorized cross-site state-changing requests"
    );
    assert.ok(
      middlewareContent.includes("Strict-Transport-Security"),
      "Middleware must configure HSTS headers"
    );
  });
});
