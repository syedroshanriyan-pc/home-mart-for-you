import { test, describe } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

describe("Backend Catalog Seeding", () => {
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
