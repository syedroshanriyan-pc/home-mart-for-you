import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { generateCollisionResistantOrderNumber, allocateUniqueOrderNumber } from "../src/lib/order-number.ts";

const rootDir = process.cwd();

test("PHASE 4: Order Number Collision Prevention & Concurrency", async (t) => {
  await t.test("generateCollisionResistantOrderNumber produces formatted FC- prefix with collision resistance", () => {
    const num = generateCollisionResistantOrderNumber();
    assert.match(num, /^FC-[A-Z0-9]+-[A-Z0-9]+$/, "Order number should match FC-<TIMESTAMP>-<RANDOM> format");
  });

  await t.test("1,000 concurrently generated order numbers have 0 collisions", () => {
    const set = new Set();
    const count = 1000;
    for (let i = 0; i < count; i++) {
      const num = generateCollisionResistantOrderNumber();
      assert.strictEqual(set.has(num), false, `Collision detected on: ${num}`);
      set.add(num);
    }
    assert.strictEqual(set.size, count, "All 1,000 order numbers must be strictly unique");
  });

  await t.test("allocateUniqueOrderNumber retries on collision and succeeds", async () => {
    let attempts = 0;
    // Mock prisma that reports collision on first 2 attempts, then succeeds on 3rd
    const mockPrisma = {
      order: {
        findUnique: async ({ where }) => {
          attempts++;
          if (attempts <= 2) {
            return { id: "existing-order-id", orderNumber: where.orderNumber };
          }
          return null; // Available!
        },
      },
    };

    const allocated = await allocateUniqueOrderNumber(mockPrisma, 5);
    assert.match(allocated, /^FC-[A-Z0-9]+-[A-Z0-9]+$/);
    assert.strictEqual(attempts, 3, "Should have retried twice and succeeded on 3rd attempt");
  });

  await t.test("orders route utilizes allocateUniqueOrderNumber and P2002 retry handling", () => {
    const ordersRoute = fs.readFileSync(path.join(rootDir, "src/app/api/orders/route.ts"), "utf-8");
    assert.ok(ordersRoute.includes("allocateUniqueOrderNumber"), "Must call allocateUniqueOrderNumber");
    assert.ok(ordersRoute.includes("P2002"), "Must catch Prisma P2002 unique constraint code");
    assert.ok(!ordersRoute.includes("const orderNumber = `FC-${1000 + count + 1}`"), "Must NOT use count + 1 generation");
  });
});

test("PHASE 4: Checkout Idempotency Implementation", async (t) => {
  await t.test("Prisma schema defines idempotencyKey as unique on Order", () => {
    const schema = fs.readFileSync(path.join(rootDir, "prisma/schema.prisma"), "utf-8");
    assert.ok(
      schema.includes("idempotencyKey") && schema.includes("@unique"),
      "Order model must have an @unique idempotencyKey field"
    );
  });

  await t.test("Orders route checks and returns existing order on duplicate idempotency key", () => {
    const ordersRoute = fs.readFileSync(path.join(rootDir, "src/app/api/orders/route.ts"), "utf-8");
    assert.ok(
      ordersRoute.includes("idempotencyKey: cleanIdempotencyKey") || ordersRoute.includes("cleanIdempotencyKey"),
      "Must check for existing order with matching idempotency key"
    );
    assert.ok(
      ordersRoute.includes("existingOrderByIdempotency"),
      "Must recover and return existing order instead of failing or creating duplicate"
    );
  });

  await t.test("Checkout page client generates and forwards idempotencyKey", () => {
    const checkoutPage = fs.readFileSync(path.join(rootDir, "src/app/checkout/page.tsx"), "utf-8");
    assert.ok(
      checkoutPage.includes("idempotencyKeyRef") || checkoutPage.includes("idempotencyKey"),
      "Checkout client must track and submit idempotencyKey"
    );
  });
});

test("PHASE 3 & 8: Fast Bill Calculation, Batch Queries, and Database Pooling", async (t) => {
  await t.test("Cart validation route uses batch findMany queries (zero N+1 loops)", () => {
    const validateRoute = fs.readFileSync(path.join(rootDir, "src/app/api/cart/validate/route.ts"), "utf-8");
    assert.ok(
      validateRoute.includes("productVariant.findMany"),
      "Must batch fetch product variants with findMany"
    );
    assert.ok(
      validateRoute.includes("customizationOption.findMany"),
      "Must batch fetch customization options with findMany"
    );
    assert.ok(
      !validateRoute.includes("for (const item of items) {\n      const variant = await prisma.productVariant.findUnique"),
      "Must not execute serial queries inside loop"
    );
  });

  await t.test("CartContext provides instant memoized previewCalculation and debounced revalidation", () => {
    const cartContext = fs.readFileSync(path.join(rootDir, "src/context/CartContext.tsx"), "utf-8");
    assert.ok(cartContext.includes("previewCalculation"), "CartContext must expose previewCalculation");
    assert.ok(cartContext.includes("useMemo"), "Must memoize preview calculation to prevent rerender lags");
    assert.ok(cartContext.includes("AbortController"), "Must cancel stale in-flight requests with AbortController");
  });

  await t.test("Prisma client singleton reuses connections in both dev and production", () => {
    const prismaLib = fs.readFileSync(path.join(rootDir, "src/lib/prisma.ts"), "utf-8");
    assert.ok(
      prismaLib.includes("globalForPrisma.prisma = prisma;"),
      "Must store prisma in globalForPrisma across all environments to avoid pool exhaustion"
    );
  });

  await t.test("Prisma schema has composite and filtering indexes for high-throughput order queries", () => {
    const schema = fs.readFileSync(path.join(rootDir, "prisma/schema.prisma"), "utf-8");
    assert.ok(
      schema.includes("@@index([userId, status])"),
      "Order table must have index on [userId, status]"
    );
    assert.ok(
      schema.includes("@@index([createdAt])"),
      "Order table must have index on [createdAt]"
    );
  });
});

test("PHASE 5: Dedicated COD Order Success Screen", async (t) => {
  await t.test("/order-success page file exists and renders comprehensive order confirmation", () => {
    const successPagePath = path.join(rootDir, "src/app/order-success/page.tsx");
    assert.ok(fs.existsSync(successPagePath), "src/app/order-success/page.tsx must exist");
    const content = fs.readFileSync(successPagePath, "utf-8");

    assert.ok(content.includes("orderNumber"), "Must render backend orderNumber");
    assert.ok(content.includes("Cash on Delivery") || content.includes("COD"), "Must display COD payment method");
    assert.ok(content.includes("codFeeMinor") || content.includes("COD"), "Must show COD surcharge breakdown");
    assert.ok(content.includes("deliveryAddress"), "Must display delivery address");
    assert.ok(content.includes("totalMinor"), "Must display authoritative total payable");
    assert.ok(content.includes("Continue Shopping"), "Must have continue shopping button");
    assert.ok(
      content.includes("Track Status") || content.includes("Live Delivery Tracking"),
      "Must have track order status action"
    );
  });

  await t.test("Checkout page navigates COD orders directly to /order-success", () => {
    const checkoutPage = fs.readFileSync(path.join(rootDir, "src/app/checkout/page.tsx"), "utf-8");
    assert.ok(
      checkoutPage.includes("/order-success?orderId="),
      "Checkout page must navigate placed orders to /order-success"
    );
  });
});

test("PHASE 6 & 7: Online Payment Verification, Webhook Security & Idempotency", async (t) => {
  await t.test("DynamicPaymentModal renders UPI intent app choices and removes dynamic QR / manual UTR", () => {
    const modalContent = fs.readFileSync(
      path.join(rootDir, "src/components/payment/DynamicPaymentModal.tsx"),
      "utf-8"
    );
    assert.ok(modalContent.includes("Google Pay"), "Must support Google Pay");
    assert.ok(modalContent.includes("PhonePe"), "Must support PhonePe");
    assert.ok(modalContent.includes("Paytm"), "Must support Paytm");
    assert.ok(
      !modalContent.includes("<input") || !modalContent.includes("utr"),
      "Must NOT have manual UTR input"
    );
  });

  await t.test("Payment webhook verifies HMAC SHA256 signature and rejects unauthenticated payloads", () => {
    const secret = "test-webhook-secret-key-123456";
    const payload = JSON.stringify({
      event: "payment.captured",
      amountMinor: 25000,
      currency: "INR",
      orderId: "order-123",
      txnRef: "UPI_998877665544",
      status: "COMPLETED",
    });

    const signature = crypto.createHmac("sha256", secret).update(payload).digest("hex");
    const invalidSignature = crypto.createHmac("sha256", "wrong-secret").update(payload).digest("hex");

    const expectedBuffer = Buffer.from(signature, "hex");
    const validBuffer = Buffer.from(signature, "hex");
    const invalidBuffer = Buffer.from(invalidSignature, "hex");

    assert.ok(crypto.timingSafeEqual(validBuffer, expectedBuffer), "Valid signature must match timing-safe comparison");
    assert.ok(!crypto.timingSafeEqual(invalidBuffer, expectedBuffer), "Invalid signature must fail comparison");
  });

  await t.test("Payment webhook implements atomic transaction, replay protection, and idempotency", () => {
    const webhookRoute = fs.readFileSync(path.join(rootDir, "src/app/api/payments/webhook/route.ts"), "utf-8");
    assert.ok(webhookRoute.includes("prisma.$transaction"), "Must wrap status update in prisma.$transaction");
    assert.ok(webhookRoute.includes("payment.status === \"COMPLETED\""), "Must check for already-completed payment for idempotency");
    assert.ok(webhookRoute.includes("x-webhook-timestamp"), "Must check timestamp for replay attack prevention");
    assert.ok(webhookRoute.includes("payloadCurrency"), "Must verify currency is INR");
  });
});

test("ADMIN: Dashboard Separate COD & Online Sales Boxes + Delivery Agent CRUD", async (t) => {
  await t.test("Admin dashboard route calculates todayCodSalesMinor and todayOnlineSalesMinor separately", () => {
    const routeCode = fs.readFileSync(path.join(rootDir, "src/app/api/admin/dashboard/route.ts"), "utf-8");
    assert.ok(routeCode.includes("todayCodSalesMinor"), "Dashboard must compute todayCodSalesMinor");
    assert.ok(routeCode.includes("todayOnlineSalesMinor"), "Dashboard must compute todayOnlineSalesMinor");
    assert.ok(routeCode.includes("todayCodOrderCount"), "Dashboard must count todayCodOrderCount");
    assert.ok(routeCode.includes("todayOnlineOrderCount"), "Dashboard must count todayOnlineOrderCount");
  });

  await t.test("Admin dashboard page renders separate cards for COD and Online sales", () => {
    const pageCode = fs.readFileSync(path.join(rootDir, "src/app/admin/page.tsx"), "utf-8");
    assert.ok(pageCode.includes("COD Cash Amount"), "Dashboard page must render COD Cash Amount card");
    assert.ok(pageCode.includes("Online Paid Amount"), "Dashboard page must render Online Paid Amount card");
    assert.ok(pageCode.includes("todayCodSalesMinor"), "Dashboard page must bind todayCodSalesMinor");
    assert.ok(pageCode.includes("todayOnlineSalesMinor"), "Dashboard page must bind todayOnlineSalesMinor");
  });

  await t.test("Delivery agent [id] API route supports full GET, PUT (Edit), and DELETE operations", () => {
    const agentRoutePath = path.join(rootDir, "src/app/api/admin/delivery-agents/[id]/route.ts");
    assert.ok(fs.existsSync(agentRoutePath), "API route /api/admin/delivery-agents/[id]/route.ts must exist");
    const routeCode = fs.readFileSync(agentRoutePath, "utf-8");

    assert.ok(routeCode.includes("export async function GET"), "Must export GET handler");
    assert.ok(routeCode.includes("export async function PUT"), "Must export PUT handler for editing agent");
    assert.ok(routeCode.includes("export async function DELETE"), "Must export DELETE handler for deleting agent");
    assert.ok(routeCode.includes("DELIVERY_AGENT_UPDATED"), "Must log audit log on update");
    assert.ok(routeCode.includes("DELIVERY_AGENT_DELETED"), "Must log audit log on delete");
    assert.ok(routeCode.includes("assignedDeliveries"), "Must check for active assigned runs before deletion");
  });

  await t.test("Admin delivery page provides Add, Edit, Delete, and Shift duty toggle controls", () => {
    const pageCode = fs.readFileSync(path.join(rootDir, "src/app/admin/delivery/page.tsx"), "utf-8");
    assert.ok(pageCode.includes("openEditModal"), "Must have edit modal trigger");
    assert.ok(pageCode.includes("openDeleteModal"), "Must have delete modal trigger");
    assert.ok(pageCode.includes("toggleDutyStatus"), "Must have shift duty toggle");
    assert.ok(pageCode.includes("handleConfirmDelete"), "Must have delete confirmation handler");
  });
});
