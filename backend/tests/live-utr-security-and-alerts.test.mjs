import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

describe("Live UTR Verification, 5-Minute Window & Security Alert Guardrails", () => {
  const rootDir = process.cwd();

  it("payment status route must enforce 5-minute validity window on UTR submission", () => {
    const statusRoutePath = path.join(rootDir, "src", "app", "api", "payments", "[id]", "status", "route.ts");
    const content = fs.readFileSync(statusRoutePath, "utf-8");
    assert.ok(content.includes("FIVE_MINUTES_MS = 5 * 60 * 1000"), "Must define 5-minute window constant (300,000ms)");
    assert.ok(content.includes("sessionTime"), "Must calculate session time based on updatedAt or createdAt");
    assert.ok(content.includes("Payment session expired"), "Must return clear expiration error when outside 5-minute window");
    assert.ok(content.includes("PAYMENT_REJECTED_WINDOW_EXPIRED"), "Must log audit event for expired payment window");
  });

  it("payment status route must detect duplicate UTRs across Payment and BankTransaction", () => {
    const statusRoutePath = path.join(rootDir, "src", "app", "api", "payments", "[id]", "status", "route.ts");
    const content = fs.readFileSync(statusRoutePath, "utf-8");
    assert.ok(content.includes("existingUtrInPayment"), "Must check for duplicate UTR in Payment table");
    assert.ok(content.includes("existingUtrInBankLedger"), "Must check for duplicate UTR in BankTransaction table");
  });

  it("payment status route must trigger critical system alert and admin notification upon duplicate UTR attempt", () => {
    const statusRoutePath = path.join(rootDir, "src", "app", "api", "payments", "[id]", "status", "route.ts");
    const content = fs.readFileSync(statusRoutePath, "utf-8");
    assert.ok(content.includes("SECURITY_ALERT_DUPLICATE_UTR_ATTEMPT"), "Must log critical security audit for duplicate attempt");
    assert.ok(content.includes("CRITICAL_DUPLICATE_UTR_DETECTED"), "Must attach high-severity metadata");
    assert.ok(content.includes("notificationBroadcast.create"), "Must create alert notification broadcast for store admin");
    assert.ok(content.includes("isDuplicate: true"), "Must flag duplicate to client response");
  });

  it("dynamic QR route must refresh payment session time so 5-minute timer is accurately synchronized", () => {
    const dynamicQrPath = path.join(rootDir, "src", "app", "api", "payments", "dynamic-qr", "route.ts");
    const content = fs.readFileSync(dynamicQrPath, "utf-8");
    assert.ok(content.includes("updatedAt: new Date()"), "Must update session timestamp when QR is generated");
    assert.ok(content.includes("status: \"PENDING\""), "Must ensure payment is in PENDING state for new QR session");
  });

  it("database must atomically record live transaction details with timestamp, IP, and UTR", () => {
    const statusRoutePath = path.join(rootDir, "src", "app", "api", "payments", "[id]", "status", "route.ts");
    const content = fs.readFileSync(statusRoutePath, "utf-8");
    assert.ok(content.includes("bankTransaction.upsert"), "Must upsert into BankTransaction table");
    assert.ok(content.includes("USER_LIVE_PAYMENT"), "Must assign USER_LIVE_PAYMENT source");
    assert.ok(content.includes("transactionTimestamp"), "Must record exact transaction timestamp");
    assert.ok(content.includes("clientIp"), "Must record client IP for transaction audit");
    assert.ok(content.includes("status: \"CONFIRMED\""), "Must confirm order atomically upon valid payment");
  });
});
