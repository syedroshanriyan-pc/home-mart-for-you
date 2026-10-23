import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

test("Admin Data Leak Prevention & Privacy", async (t) => {
  await t.test("README.md must not expose plaintext admin password or credentials", () => {
    const readmeContent = fs.readFileSync(path.join(rootDir, "README.md"), "utf8");
    assert.ok(
      !readmeContent.includes("admin@freshchicken.com | `AdminPassword123!`"),
      "README.md still contains plaintext admin login table row!"
    );
    assert.ok(
      !readmeContent.includes("`9845000001` / `admin@freshchicken.com` | `AdminPassword123!`"),
      "README.md must not leak admin credentials"
    );
  });

  await t.test("IMPLEMENTATION_PROGRESS.md must not expose plaintext admin password", () => {
    const progressFile = path.join(rootDir, "IMPLEMENTATION_PROGRESS.md");
    if (fs.existsSync(progressFile)) {
      const progressContent = fs.readFileSync(progressFile, "utf8");
      assert.ok(
        !progressContent.includes("`admin@freshchicken.com` / `9845000001` | `AdminPassword123!`"),
        "IMPLEMENTATION_PROGRESS.md still contains plaintext admin credentials"
      );
    }
  });

  await t.test("prisma/seed.js must not output admin password to console logs", () => {
    const seedJsContent = fs.readFileSync(path.join(rootDir, "prisma", "seed.js"), "utf8");
    assert.ok(
      !seedJsContent.includes('console.log("  Admin:          admin@freshchicken.com / 9845000001 / AdminPassword123!");'),
      "prisma/seed.js logs plaintext admin credentials"
    );
    assert.ok(
      seedJsContent.includes("[Protected"),
      "prisma/seed.js should hide admin credentials in console output"
    );
  });

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

  await t.test("Form input placeholders must not leak admin phone numbers 7975137618 or 7022461700", () => {
    const registerContent = fs.readFileSync(path.join(rootDir, "src", "app", "register", "page.tsx"), "utf8");
    const loginContent = fs.readFileSync(path.join(rootDir, "src", "app", "login", "page.tsx"), "utf8");
    const contactContent = fs.readFileSync(path.join(rootDir, "src", "app", "contact", "page.tsx"), "utf8");
    const deliveryContent = fs.readFileSync(path.join(rootDir, "src", "app", "admin", "delivery", "page.tsx"), "utf8");

    assert.ok(!registerContent.includes("7975137618") && !registerContent.includes("7022461700"), "Register placeholder leaks admin phone");
    assert.ok(!loginContent.includes("7975137618") && !loginContent.includes("7022461700"), "Login placeholder leaks admin phone");
    assert.ok(!contactContent.includes("7975137618") && !contactContent.includes("7022461700"), "Contact placeholder leaks admin phone");
    assert.ok(!deliveryContent.includes("7975137618") && !deliveryContent.includes("7022461700"), "Delivery placeholder leaks admin phone");
  });

  await t.test("Store public contact number must be single number 9035526638", () => {
    const settingsContent = fs.readFileSync(path.join(rootDir, "src", "app", "api", "settings", "route.ts"), "utf8");
    const navbarContent = fs.readFileSync(path.join(rootDir, "src", "components", "layout", "Navbar.tsx"), "utf8");
    const footerContent = fs.readFileSync(path.join(rootDir, "src", "components", "layout", "Footer.tsx"), "utf8");

    assert.ok(settingsContent.includes("90355 26638") || settingsContent.includes("9035526638"), "Settings route must contain 9035526638");
    assert.ok(navbarContent.includes("90355 26638") || navbarContent.includes("9035526638"), "Navbar must contain 9035526638");
    assert.ok(footerContent.includes("90355 26638") || footerContent.includes("9035526638"), "Footer must contain 9035526638");
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

  await t.test("AuthContext must provide deleteAccount function", () => {
    const authContextPath = path.join(rootDir, "src", "context", "AuthContext.tsx");
    const content = fs.readFileSync(authContextPath, "utf8");
    assert.ok(content.includes("deleteAccount: () => Promise"), "AuthContext must define deleteAccount in type");
    assert.ok(content.includes("/api/auth/delete-account"), "deleteAccount must call delete endpoint");
  });

  await t.test("Account page must render Delete Account button and confirmation modal", () => {
    const accountPagePath = path.join(rootDir, "src", "app", "account", "page.tsx");
    const content = fs.readFileSync(accountPagePath, "utf8");
    assert.ok(content.includes("Delete Account"), "Account page must have Delete Account button");
    assert.ok(content.includes("handleDeleteAccount"), "Account page must handle account deletion");
    assert.ok(content.includes("isDeleteModalOpen"), "Account page must have confirmation modal state");
    assert.ok(content.includes("Modal"), "Account page must use Modal for confirmation");
  });
});
