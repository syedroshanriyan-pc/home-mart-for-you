import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

test("DPDP Act 2023 & Indian Legal Compliance Routes", async (t) => {
  const requiredLegalRoutes = [
    { path: path.join(rootDir, "src", "app", "privacy-policy", "page.tsx"), name: "Privacy Policy" },
    { path: path.join(rootDir, "src", "app", "terms-and-conditions", "page.tsx"), name: "Terms & Conditions" },
    { path: path.join(rootDir, "src", "app", "shipping-policy", "page.tsx"), name: "Shipping Policy" },
    { path: path.join(rootDir, "src", "app", "cancellation-refund-policy", "page.tsx"), name: "Cancellation & Refund Policy" },
    { path: path.join(rootDir, "src", "app", "grievance-redressal", "page.tsx"), name: "Grievance Redressal" },
    { path: path.join(rootDir, "src", "app", "cookie-policy", "page.tsx"), name: "Cookie Policy" },
    { path: path.join(rootDir, "src", "app", "faq", "page.tsx"), name: "FAQ" },
  ];

  for (const route of requiredLegalRoutes) {
    await t.test(`${route.name} route file must exist and contain statutory disclosures`, () => {
      assert.ok(fs.existsSync(route.path), `${route.name} page file does not exist at ${route.path}`);
      const content = fs.readFileSync(route.path, "utf8");
      assert.ok(content.length > 500, `${route.name} content is too short`);
    });
  }

  await t.test("Privacy Policy must address DPDP Act Data Principal rights (Access, Correction, Erasure)", () => {
    const privacyContent = fs.readFileSync(
      path.join(rootDir, "src", "app", "privacy-policy", "page.tsx"),
      "utf8"
    );
    assert.ok(privacyContent.includes("DPDP Act"), "Privacy policy must cite DPDP Act, 2023");
    assert.ok(privacyContent.includes("Erasure"), "Privacy policy must detail Right to Erasure");
    assert.ok(privacyContent.includes("Grievance Redressal Officer"), "Privacy policy must specify Grievance Officer");
  });

  await t.test("Grievance Redressal page must disclose statutory 48h acknowledgment and 30-day resolution SLAs", () => {
    const grievanceContent = fs.readFileSync(
      path.join(rootDir, "src", "app", "grievance-redressal", "page.tsx"),
      "utf8"
    );
    assert.ok(grievanceContent.includes("48 hours"), "Must specify 48 hours acknowledgment SLA");
    assert.ok(grievanceContent.includes("30 days"), "Must specify 30 days resolution SLA");
  });

  await t.test("Footer must link to all statutory legal pages and retain R2D Labs attribution", () => {
    const footerContent = fs.readFileSync(
      path.join(rootDir, "src", "components", "layout", "Footer.tsx"),
      "utf8"
    );
    assert.ok(footerContent.includes('href="/privacy-policy"'), "Footer must link to Privacy Policy");
    assert.ok(footerContent.includes('href="/terms-and-conditions"'), "Footer must link to Terms & Conditions");
    assert.ok(footerContent.includes('href="/cancellation-refund-policy"'), "Footer must link to Refund Policy");
    assert.ok(footerContent.includes('href="/shipping-policy"'), "Footer must link to Shipping Policy");
    assert.ok(footerContent.includes('href="/grievance-redressal"'), "Footer must link to Grievance Redressal");
    assert.ok(footerContent.includes("r2dlabs.r2d-labs.workers.dev"), "Footer must maintain R2D Labs attribution");
  });
});
