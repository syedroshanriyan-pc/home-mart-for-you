import test from "node:test";
import assert from "node:assert/strict";
import { escapeHtml, sanitizeText, sanitizeMobile, sanitizeEmail } from "../src/lib/security.ts";
import { checkRateLimit } from "../src/lib/rate-limiter.ts";

test("Security & Sanitization Rules", async (t) => {
  await t.test("should escape malicious HTML and script tags for XSS protection", () => {
    const malicious = '<script>alert("xss")</script>';
    const escaped = escapeHtml(malicious);
    assert.ok(!escaped.includes("<script>"));
    assert.strictEqual(escaped, '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;');
  });

  await t.test("should strip harmful tags and dangerous URI schemes from text input", () => {
    const dirty = '<b onclick="malicious()">Special Cut Instructions</b><iframe src="javascript:evil()"></iframe>';
    const cleaned = sanitizeText(dirty);
    assert.ok(!cleaned.includes("<b"));
    assert.ok(!cleaned.includes("javascript:"));
    assert.strictEqual(cleaned, "Special Cut Instructions");
  });

  await t.test("should validate standard 10-digit Indian mobile numbers", () => {
    assert.strictEqual(sanitizeMobile("+91 98450 12345"), "9845012345");
    assert.strictEqual(sanitizeMobile("9845012345"), "9845012345");
    assert.strictEqual(sanitizeMobile("12345"), null);
    assert.strictEqual(sanitizeMobile("abcdefghij"), null);
  });

  await t.test("should validate email format cleanly", () => {
    assert.strictEqual(sanitizeEmail("customer@freshchicken.com"), "customer@freshchicken.com");
    assert.strictEqual(sanitizeEmail("invalid-email"), null);
    assert.strictEqual(sanitizeEmail("test@domain"), null);
  });
});

test("Rate Limiter Rules", async (t) => {
  await t.test("should enforce sliding window rate limits", () => {
    const testKey = `test_ip_${Date.now()}`;
    const config = { maxRequests: 3, windowMs: 1000 };

    // Request 1: Allowed
    const res1 = checkRateLimit(testKey, config);
    assert.strictEqual(res1.allowed, true);
    assert.strictEqual(res1.remaining, 2);

    // Request 2: Allowed
    const res2 = checkRateLimit(testKey, config);
    assert.strictEqual(res2.allowed, true);
    assert.strictEqual(res2.remaining, 1);

    // Request 3: Allowed
    const res3 = checkRateLimit(testKey, config);
    assert.strictEqual(res3.allowed, true);
    assert.strictEqual(res3.remaining, 0);

    // Request 4: Blocked (429)
    const res4 = checkRateLimit(testKey, config);
    assert.strictEqual(res4.allowed, false);
    assert.strictEqual(res4.remaining, 0);
    assert.ok(res4.resetSeconds > 0);
  });
});
