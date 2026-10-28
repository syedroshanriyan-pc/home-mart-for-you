import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

test("Admin Data Leak Prevention & Privacy (Backend)", async (t) => {
  await t.test("prisma/seed.cjs must not output admin password to console logs", () => {
    const seedCjsContent = fs.readFileSync(path.join(rootDir, "prisma", "seed.cjs"), "utf8");
    assert.ok(
      !seedCjsContent.includes('console.log("  Admin:          admin@freshchicken.com / 9845000001 / AdminPassword123!");'),
      "prisma/seed.cjs logs plaintext admin credentials"
    );
    assert.ok(
      seedCjsContent.includes("[Protected"),
      "prisma/seed.cjs should hide admin credentials in console output"
    );
  });

  await t.test("src/app/api/admin/audit/route.ts should not select actor mobile number", () => {
    const auditRouteContent = fs.readFileSync(
      path.join(rootDir, "src", "app", "api", "admin", "audit", "route.ts"),
      "utf8"
    );
    assert.ok(
      !auditRouteContent.includes("actor: { select: { id: true, name: true, role: true, mobile: true } }"),
      "Audit route must not leak actor mobile"
    );
  });

  await t.test("Store public contact number in settings route must be single number 9035526638", () => {
    const settingsContent = fs.readFileSync(path.join(rootDir, "src", "app", "api", "settings", "route.ts"), "utf8");
    assert.ok(settingsContent.includes("90355 26638") || settingsContent.includes("9035526638"), "Settings route must contain 9035526638");
  });
});

test("Account Deletion & Database Cleanup API Route", async (t) => {
  await t.test("delete-account route file must exist and handle DELETE request", () => {
    const routePath = path.join(rootDir, "src", "app", "api", "auth", "delete-account", "route.ts");
    assert.ok(fs.existsSync(routePath), "delete-account route file does not exist");
    const content = fs.readFileSync(routePath, "utf8");
    assert.ok(content.includes("export async function DELETE"), "Must export DELETE handler");
    assert.ok(content.includes("prisma.$transaction"), "Must execute in atomic transaction");
    assert.ok(content.includes("tx.user.delete"), "Must delete user record from database");
    assert.ok(content.includes("tx.order.deleteMany"), "Must delete user orders");
    assert.ok(content.includes("tx.address.deleteMany"), "Must delete user addresses");
    assert.ok(content.includes("tx.favorite.deleteMany"), "Must delete user favorites");
    assert.ok(content.includes("tx.review.deleteMany"), "Must delete user reviews");
    assert.ok(content.includes("tx.couponRedemption.deleteMany"), "Must delete user coupon redemptions");
  });
});
