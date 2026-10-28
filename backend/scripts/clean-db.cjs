const { PrismaClient } = require("@prisma/client");
const fs = require("fs");
const path = require("path");

const prisma = new PrismaClient();

async function cleanDatabase() {
  console.log("=== STARTING CONTROLLED DATABASE CLEANUP ===");

  try {
    // 1. Delete audit logs, notifications, reviews, favorites
    const auditLogs = await prisma.auditLog.deleteMany();
    console.log(`✓ Deleted ${auditLogs.count} AuditLog records`);

    const broadcasts = await prisma.notificationBroadcast.deleteMany();
    console.log(`✓ Deleted ${broadcasts.count} NotificationBroadcast records`);

    const subs = await prisma.notificationSubscription.deleteMany();
    console.log(`✓ Deleted ${subs.count} NotificationSubscription records`);

    const reviews = await prisma.review.deleteMany();
    console.log(`✓ Deleted ${reviews.count} Review records`);

    const favorites = await prisma.favorite.deleteMany();
    console.log(`✓ Deleted ${favorites.count} Favorite records`);

    const couponRedemptions = await prisma.couponRedemption.deleteMany();
    console.log(`✓ Deleted ${couponRedemptions.count} CouponRedemption records`);

    // 2. Disconnect bank transactions from orders and reset to UNCLAIMED
    const resetBankTx = await prisma.bankTransaction.updateMany({
      data: {
        status: "UNCLAIMED",
        claimedOrderId: null,
        claimedAt: null,
      },
    });
    console.log(`✓ Reset ${resetBankTx.count} BankTransaction records to UNCLAIMED`);

    // 3. Delete delivery assignments & agent profiles
    const deliveryAssignments = await prisma.deliveryAssignment.deleteMany();
    console.log(`✓ Deleted ${deliveryAssignments.count} DeliveryAssignment records`);

    const agentProfiles = await prisma.deliveryAgentProfile.deleteMany();
    console.log(`✓ Deleted ${agentProfiles.count} DeliveryAgentProfile records`);

    // 4. Delete payments, order items, and orders
    const payments = await prisma.payment.deleteMany();
    console.log(`✓ Deleted ${payments.count} Payment records`);

    const orderItems = await prisma.orderItem.deleteMany();
    console.log(`✓ Deleted ${orderItems.count} OrderItem records`);

    const orders = await prisma.order.deleteMany();
    console.log(`✓ Deleted ${orders.count} Order records`);

    // 5. Delete non-admin addresses and non-admin users
    const nonAdminUsers = await prisma.user.findMany({
      where: {
        role: { notIn: ["ADMIN", "SUPER_ADMIN"] },
      },
      select: { id: true, name: true, mobile: true, role: true },
    });

    const nonAdminUserIds = nonAdminUsers.map((u) => u.id);

    const deletedAddresses = await prisma.address.deleteMany({
      where: {
        userId: { in: nonAdminUserIds },
      },
    });
    console.log(`✓ Deleted ${deletedAddresses.count} customer Address records`);

    const deletedUsers = await prisma.user.deleteMany({
      where: {
        id: { in: nonAdminUserIds },
      },
    });
    console.log(`✓ Deleted ${deletedUsers.count} non-admin User records`);

    // 6. Verify Preserved Records
    const remainingAdmins = await prisma.user.findMany({
      select: { id: true, name: true, email: true, mobile: true, role: true },
    });
    const categoryCount = await prisma.category.count();
    const productCount = await prisma.product.count();
    const variantCount = await prisma.productVariant.count();
    const customGroupCount = await prisma.customizationGroup.count();
    const customOptionCount = await prisma.customizationOption.count();
    const settingCount = await prisma.systemSetting.count();
    const couponCount = await prisma.coupon.count();
    const bankTxCount = await prisma.bankTransaction.count();

    console.log("\n=== PRESERVED RECORDS SUMMARY ===");
    console.log(`✓ Admin Users Preserved: ${remainingAdmins.length}`, remainingAdmins);
    console.log(`✓ Categories Preserved: ${categoryCount}`);
    console.log(`✓ Products Preserved: ${productCount}`);
    console.log(`✓ Product Variants Preserved: ${variantCount}`);
    console.log(`✓ Customization Groups: ${customGroupCount}`);
    console.log(`✓ Customization Options: ${customOptionCount}`);
    console.log(`✓ System Settings Preserved: ${settingCount}`);
    console.log(`✓ Coupons Preserved: ${couponCount}`);
    console.log(`✓ Bank Transaction Ledger Preserved: ${bankTxCount} (All UNCLAIMED)`);

    // 7. Clear Next.js cache directory
    const nextCacheDir = path.join(process.cwd(), ".next", "cache");
    if (fs.existsSync(nextCacheDir)) {
      try {
        fs.rmSync(nextCacheDir, { recursive: true, force: true });
        console.log("✓ Successfully cleared .next/cache directory");
      } catch (cacheErr) {
        console.warn("Could not remove .next/cache (in use by running dev server)");
      }
    }

    console.log("\n=== DATABASE CLEANUP COMPLETED SUCCESSFULLY ===");
  } catch (error) {
    console.error("Cleanup error:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

cleanDatabase();
