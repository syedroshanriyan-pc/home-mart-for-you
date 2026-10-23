import { test, describe } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

describe("Groceries, Coming Soon Meat & Comprehensive Error Pages", () => {
  const rootDir = process.cwd();

  test("ProductCard must display Coming Soon badge and disabled CTA for fish, mutton, or coming soon items", () => {
    const productCardPath = path.join(rootDir, "src/components/catalog/ProductCard.tsx");
    const content = fs.readFileSync(productCardPath, "utf-8");

    assert.ok(content.includes("isComingSoon"), "ProductCard must compute isComingSoon");
    assert.ok(content.includes("Coming Soon"), "ProductCard must display 'Coming Soon' text");
    assert.ok(content.includes("fish-seafood") || content.includes("fresh-mutton"), "ProductCard must handle fish and mutton categories");
  });

  test("ProductDetailClient must display Coming Soon banner and disabled CTA for coming soon items", () => {
    const detailPath = path.join(rootDir, "src/app/product/[slug]/ProductDetailClient.tsx");
    const content = fs.readFileSync(detailPath, "utf-8");

    assert.ok(content.includes("isComingSoon"), "ProductDetailClient must compute isComingSoon");
    assert.ok(content.includes("Coming Soon to Mulbagal"), "ProductDetailClient must display Coming Soon banner");
    assert.ok(content.includes("Launching Shortly"), "ProductDetailClient CTA must announce launching shortly");
  });

  test("Comprehensive custom error pages must exist and provide store support hotline", () => {
    const errorPages = [
      "src/app/not-found.tsx",
      "src/app/error.tsx",
      "src/app/global-error.tsx",
      "src/app/forbidden.tsx",
      "src/app/403/page.tsx",
      "src/app/unauthorized.tsx",
      "src/app/401/page.tsx",
      "src/app/maintenance/page.tsx",
      "src/app/offline/page.tsx",
    ];

    for (const relPath of errorPages) {
      const fullPath = path.join(rootDir, relPath);
      assert.ok(fs.existsSync(fullPath), `Error page file ${relPath} must exist`);
      const content = fs.readFileSync(fullPath, "utf-8");
      // Pages with direct UI content (excluding simple re-exports) should contain support phone
      if (!content.includes("export { default")) {
        assert.ok(
          content.includes("90355 26638") || content.includes("9035526638"),
          `${relPath} must include customer support hotline 90355 26638`
        );
      }
    }
  });

  test("Seeding script must include JioMart groceries plus Fish & Mutton marked as Coming Soon", () => {
    const seedScriptPath = path.join(rootDir, "prisma/seed.cjs");
    assert.ok(fs.existsSync(seedScriptPath), "Canonical seed script prisma/seed.cjs must exist");
    const content = fs.readFileSync(seedScriptPath, "utf-8");

    assert.ok(content.includes("fish-seafood"), "Must include fish-seafood category");
    assert.ok(content.includes("fresh-mutton"), "Must include fresh-mutton category");
    assert.ok(content.includes("Coming Soon"), "Must mark preview meat items as Coming Soon");
    assert.ok(content.includes("dairy-eggs-bread"), "Must include dairy-eggs-bread grocery category");
    assert.ok(content.includes("atta-rice-dal"), "Must include atta-rice-dal grocery category");
    assert.ok(content.includes("spices-masalas"), "Must include spices-masalas grocery category");
  });
});
