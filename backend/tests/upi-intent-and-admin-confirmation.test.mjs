import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

describe("Backend Admin Orders Verification", () => {
  it("admin orders route must only show orders once paid or if COD", () => {
    const adminOrdersPath = path.join(rootDir, "src", "app", "api", "admin", "orders", "route.ts");
    assert.ok(fs.existsSync(adminOrdersPath), "Admin orders API route must exist");
    const content = fs.readFileSync(adminOrdersPath, "utf-8");
    assert.ok(content.includes("payment: { method: \"COD\" }"), "Must show COD orders");
    assert.ok(content.includes("payment: { status: \"COMPLETED\" }"), "Must show completed payments only");
  });
});
