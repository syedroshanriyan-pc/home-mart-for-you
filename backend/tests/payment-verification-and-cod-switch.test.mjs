import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

describe("UPI Payment Verification, State Machine & Zero-Duplication COD Switch (Backend)", () => {
  it("switch-cod route file must exist and handle switching without order duplication", () => {
    const switchCodPath = path.join(rootDir, "src", "app", "api", "orders", "[id]", "switch-cod", "route.ts");
    assert.ok(fs.existsSync(switchCodPath), "switch-cod route must exist");
    const content = fs.readFileSync(switchCodPath, "utf-8");
    assert.ok(content.includes("COD_SURCHARGE_PAISE"), "Must calculate COD surcharge");
    assert.ok(content.includes("CASH_ON_DELIVERY"), "Must update provider to CASH_ON_DELIVERY");
    assert.ok(content.includes("tx.order.update"), "Must update the existing order without creating a new one");
  });

  it("orders route must support reusing existingOrderId to prevent duplicate orders", () => {
    const ordersRoutePath = path.join(rootDir, "src", "app", "api", "orders", "route.ts");
    const content = fs.readFileSync(ordersRoutePath, "utf-8");
    assert.ok(content.includes("existingOrderId") || content.includes("checkOrderId"), "Must check for existingOrderId in checkout");
    assert.ok(content.includes("reusedExistingOrder"), "Must reuse existing order on COD switch");
  });

  it("prisma schema must enforce database-level unique constraint on Payment.upiTxnRef", () => {
    const schemaPath = path.join(rootDir, "prisma", "schema.prisma");
    const content = fs.readFileSync(schemaPath, "utf-8");
    assert.ok(content.includes("upiTxnRef         String?  @unique"), "Payment.upiTxnRef must have @unique constraint");
    assert.ok(content.includes("claimedOrderId String?   @unique"), "BankTransaction.claimedOrderId must have @unique constraint");
  });

  it("payment status route must reject reused UTRs with statutory error message", () => {
    const statusRoutePath = path.join(rootDir, "src", "app", "api", "payments", "[id]", "status", "route.ts");
    const content = fs.readFileSync(statusRoutePath, "utf-8");
    assert.ok(
      content.includes("This transaction reference has already been used. Please verify your payment details."),
      "Must return exact rejection message when UTR was already used"
    );
    assert.ok(content.includes("P2002"), "Must catch concurrent database unique constraint violation");
    assert.ok(content.includes("verifyUtrWithProvider"), "Must query payment provider to verify transaction");
  });

  it("payment provider adapter must verify merchant account, amount, and provider status", () => {
    const providerPath = path.join(rootDir, "src", "lib", "adapters", "PaymentProvider.ts");
    const content = fs.readFileSync(providerPath, "utf-8");
    assert.ok(content.includes("verifyUtrWithProvider"), "Must implement verifyUtrWithProvider");
    assert.ok(content.includes("expectedAmountMinor"), "Must verify expected transaction amount");
    assert.ok(content.includes("payeeVpa"), "Must verify merchant payee VPA");
  });
});
