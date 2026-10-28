import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

describe("Frontend Payment UI, COD Switching & Animations", () => {
  it("checkout page must track activeOrderId and pass onSwitchToCod to modal", () => {
    const checkoutPagePath = path.join(rootDir, "src", "app", "checkout", "page.tsx");
    assert.ok(fs.existsSync(checkoutPagePath), "Checkout page must exist");
    const content = fs.readFileSync(checkoutPagePath, "utf-8");
    assert.ok(content.includes("activeOrderId"), "Checkout page must track activeOrderId");
    assert.ok(content.includes("switch-cod"), "Checkout page must call switch-cod when switching to COD");
    assert.ok(content.includes("onSwitchToCod"), "DynamicPaymentModal must receive onSwitchToCod prop");
  });

  it("globals.css must define fintech checkmark, crossmark, and reduced-motion animations", () => {
    const cssPath = path.join(rootDir, "src", "app", "globals.css");
    assert.ok(fs.existsSync(cssPath), "globals.css must exist");
    const content = fs.readFileSync(cssPath, "utf-8");
    assert.ok(content.includes("animate-checkmark-circle"), "Must define checkmark circle animation");
    assert.ok(content.includes("animate-checkmark-check"), "Must define checkmark draw animation");
    assert.ok(content.includes("animate-crossmark-circle"), "Must define crossmark animation");
    assert.ok(content.includes("prefers-reduced-motion"), "Must support prefers-reduced-motion accessibility");
  });
});
