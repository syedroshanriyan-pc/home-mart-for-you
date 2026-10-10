import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  console.log("Adding Fresh Fish & Seafood category and multi-month tracking data...");

  // 1. Upsert Fish Category
  const catFish = await prisma.category.upsert({
    where: { slug: "fish-seafood" },
    create: {
      name: "Fresh Fish & Seafood",
      slug: "fish-seafood",
      description: "Daily caught, fresh river & sea fish cleaned and sliced to perfection.",
      imageUrl: "https://images.unsplash.com/photo-1534483509719-3feaee7c30da?auto=format&fit=crop&w=600&q=80",
      displayOrder: 3,
      isActive: true,
    },
    update: {
      name: "Fresh Fish & Seafood",
      isActive: true,
    },
  });

  console.log("Fish category created/updated:", catFish.id);

  // 2. Upsert Fish Products & Variants
  const fishProducts = [
    {
      name: "Fresh Rohu Fish Curry Cut",
      slug: "rohu-fish-curry-cut",
      description: "Sweet freshwater Rohu fish cut into uniform curry pieces with head & tail portions.",
      imageUrl: "https://images.unsplash.com/photo-1534483509719-3feaee7c30da?auto=format&fit=crop&w=600&q=80",
      variants: [
        { name: "500g", quantityValue: 500, priceMinor: 16000 },
        { name: "1kg", quantityValue: 1000, priceMinor: 30000 },
      ],
    },
    {
      name: "Fresh Catla Fish Steaks",
      slug: "catla-fish-steaks",
      description: "Center-cut juicy Catla fish steaks, ideal for shallow fry and traditional curry.",
      imageUrl: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=600&q=80",
      variants: [
        { name: "500g", quantityValue: 500, priceMinor: 18000 },
        { name: "1kg", quantityValue: 1000, priceMinor: 34000 },
      ],
    },
    {
      name: "Fresh Cleaned Prawns (Deveined)",
      slug: "cleaned-prawns-deveined",
      description: "Tender, succulent medium-sized sea prawns, thoroughly peeled, cleaned, and deveined.",
      imageUrl: "https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?auto=format&fit=crop&w=600&q=80",
      variants: [
        { name: "250g", quantityValue: 250, priceMinor: 22000 },
        { name: "500g", quantityValue: 500, priceMinor: 42000 },
      ],
    },
    {
      name: "Seer Fish / Vanjaram Slices",
      slug: "vanjaram-seer-fish-slices",
      description: "King fish steaks cut into clean, tender slices perfect for tawa fry.",
      imageUrl: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=600&q=80",
      variants: [
        { name: "500g", quantityValue: 500, priceMinor: 49000 },
        { name: "1kg", quantityValue: 1000, priceMinor: 95000 },
      ],
    },
  ];

  for (const p of fishProducts) {
    let product = await prisma.product.findUnique({ where: { slug: p.slug } });
    if (!product) {
      product = await prisma.product.create({
        data: {
          categoryId: catFish.id,
          name: p.name,
          slug: p.slug,
          description: p.description,
          imageUrl: p.imageUrl,
          productType: "WEIGHT",
          isAvailable: true,
          isActive: true,
        },
      });
    }

    for (const v of p.variants) {
      let variant = await prisma.productVariant.findFirst({
        where: { productId: product.id, name: v.name },
      });
      if (!variant) {
        variant = await prisma.productVariant.create({
          data: {
            productId: product.id,
            name: v.name,
            pricingType: "WEIGHT",
            quantityValue: v.quantityValue,
            quantityUnit: "g",
            priceMinor: v.priceMinor,
            isAvailable: true,
          },
        });
      }
    }
  }

  // 3. Find customer user
  const customer = await prisma.user.findFirst({ where: { role: "CUSTOMER" } });
  if (!customer) {
    console.log("No customer found to attach orders to!");
    return;
  }

  // Find products for all categories
  const allProducts = await prisma.product.findMany({
    include: { category: true, variants: true },
  });

  const getProductVariant = (catSlug) => {
    const prods = allProducts.filter((p) => p.category.slug === catSlug && p.variants.length > 0);
    if (prods.length === 0) return null;
    const prod = prods[Math.floor(Math.random() * prods.length)];
    const variant = prod.variants[0];
    return { product: prod, variant };
  };

  // Generate historical orders for recent months (August 2026, September 2026, October 2026)
  const monthsData = [
    { year: 2026, month: 7, count: 8, label: "Aug 2026" }, // August (0-indexed month 7)
    { year: 2026, month: 8, count: 12, label: "Sep 2026" }, // September (0-indexed month 8)
    { year: 2026, month: 9, count: 15, label: "Oct 2026" }, // October (0-indexed month 9)
  ];

  let orderSeq = 2001;

  for (const m of monthsData) {
    for (let i = 0; i < m.count; i++) {
      const orderNum = `FC-CAT-${m.year}${m.month + 1}-${i + 1}`;
      const existing = await prisma.order.findUnique({ where: { orderNumber: orderNum } });
      if (existing) continue;

      const day = Math.min(28, 1 + i * 2);
      const orderDate = new Date(m.year, m.month, day, 10 + (i % 8), 15, 0);

      // Select 1 to 3 items spanning chicken, fish, eggs, beverages, or masala
      const candidateCats = ["fresh-chicken", "fish-seafood", "masala-special", "eggs", "beverages"];
      const selectedCats = candidateCats
        .sort(() => 0.5 - Math.random())
        .slice(0, (i % 3) + 1);

      const itemsData = [];
      let subtotal = 0;

      for (const catSlug of selectedCats) {
        const itemInfo = getProductVariant(catSlug);
        if (!itemInfo) continue;
        const qty = 1 + (i % 2);
        const lineTotal = itemInfo.variant.priceMinor * qty;
        subtotal += lineTotal;

        itemsData.push({
          productId: itemInfo.product.id,
          variantId: itemInfo.variant.id,
          productNameSnapshot: itemInfo.product.name,
          variantNameSnapshot: itemInfo.variant.name,
          quantity: qty,
          weightGrams: itemInfo.variant.quantityValue || 500,
          unitPriceMinor: itemInfo.variant.priceMinor,
          lineTotalMinor: lineTotal,
          createdAt: orderDate,
        });
      }

      if (itemsData.length === 0) continue;

      await prisma.order.create({
        data: {
          orderNumber: orderNum,
          userId: customer.id,
          status: "DELIVERED",
          subtotalMinor: subtotal,
          discountMinor: 0,
          deliveryFeeMinor: 0,
          codFeeMinor: 0,
          totalMinor: subtotal,
          deliveryLatitude: 13.1611,
          deliveryLongitude: 78.3952,
          deliveryAddressSnapshot: JSON.stringify({
            addressLine: "Bazaar Street, Main Road",
            locality: "Mulbagal Town",
            city: "Mulbagal",
          }),
          placedAt: orderDate,
          confirmedAt: new Date(orderDate.getTime() + 5 * 60000),
          preparingAt: new Date(orderDate.getTime() + 10 * 60000),
          outForDeliveryAt: new Date(orderDate.getTime() + 20 * 60000),
          deliveredAt: new Date(orderDate.getTime() + 35 * 60000),
          createdAt: orderDate,
          updatedAt: orderDate,
          items: {
            create: itemsData,
          },
        },
      });
    }
  }

  console.log("Seeding fish & multi-month category orders complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
