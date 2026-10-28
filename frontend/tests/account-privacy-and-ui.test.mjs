import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

test("Admin Data Leak Prevention & Privacy (Frontend UI)", async (t) => {
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
    const navbarContent = fs.readFileSync(path.join(rootDir, "src", "components", "layout", "Navbar.tsx"), "utf8");
    const footerContent = fs.readFileSync(path.join(rootDir, "src", "components", "layout", "Footer.tsx"), "utf8");

    assert.ok(navbarContent.includes("90355 26638") || navbarContent.includes("9035526638"), "Navbar must contain 9035526638");
    assert.ok(footerContent.includes("90355 26638") || footerContent.includes("9035526638"), "Footer must contain 9035526638");
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
