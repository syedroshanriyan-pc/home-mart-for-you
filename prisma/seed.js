const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding Fresh Chicken database...");

  // 1. Clean existing records if any
  await prisma.review.deleteMany();
  await prisma.couponRedemption.deleteMany();
  await prisma.deliveryAssignment.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.favorite.deleteMany();
  await prisma.address.deleteMany();
  await prisma.deliveryAgentProfile.deleteMany();
  await prisma.customizationOption.deleteMany();
  await prisma.customizationGroup.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.coupon.deleteMany();
  await prisma.systemSetting.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.notificationBroadcast.deleteMany();
  await prisma.notificationSubscription.deleteMany();
  await prisma.user.deleteMany();

  // 2. Hash default passwords
  const adminPass = await bcrypt.hash("AdminPassword123!", 10);
  const deliveryPass = await bcrypt.hash("Delivery123!", 10);
  const customerPass = await bcrypt.hash("Customer123!", 10);

  // 3. Create Users
  const adminUser = await prisma.user.create({
    data: {
      name: "Shop Manager (Admin)",
      mobile: "9845000001",
      email: "admin@freshchicken.com",
      passwordHash: adminPass,
      role: "ADMIN",
      status: "ACTIVE",
    },
  });

  const deliveryUser = await prisma.user.create({
    data: {
      name: "Ramesh Kumar (Delivery)",
      mobile: "9845000002",
      email: "delivery@freshchicken.com",
      passwordHash: deliveryPass,
      role: "DELIVERY_AGENT",
      status: "ACTIVE",
      deliveryProfile: {
        create: {
          availabilityStatus: "AVAILABLE",
          lastKnownLat: 13.1645,
          lastKnownLng: 78.3952,
          isActive: true,
        },
      },
    },
  });

  const customerUser = await prisma.user.create({
    data: {
      name: "Ananya Sharma",
      mobile: "9845000003",
      email: "customer@freshchicken.com",
      passwordHash: customerPass,
      role: "CUSTOMER",
      status: "ACTIVE",
      addresses: {
        create: [
          {
            label: "Home",
            addressLine: "#42, Gandhi Road, Near Someshwara Temple",
            locality: "Temple Street",
            city: "Mulbagal",
            postalCode: "563131",
            latitude: 13.1672,
            longitude: 78.3985,
            isDefault: true,
          },
          {
            label: "Work",
            addressLine: "Bazaar Complex, 1st Floor, Shop #8",
            locality: "Clock Tower",
            city: "Mulbagal",
            postalCode: "563131",
            latitude: 13.165,
            longitude: 78.396,
            isDefault: false,
          },
        ],
      },
    },
  });

  console.log("Seeded Users: Admin, Delivery Agent, Customer");

  // 4. Create System Settings
  const settings = [
    { key: "SHOP_NAME", value: "Fresh Chicken", description: "Official Business Name" },
    { key: "SHOP_PHONE", value: "+91 98450 12345", description: "Customer Support Contact" },
    { key: "SHOP_ADDRESS", value: "Main Bazaar Road, Near Clock Tower, Mulbagal, Karnataka 563131", description: "Storefront Address" },
    { key: "SHOP_LAT", value: "13.1645", description: "Latitude coordinates of shop" },
    { key: "SHOP_LNG", value: "78.3952", description: "Longitude coordinates of shop" },
    { key: "FREE_DELIVERY_METERS", value: "3000", description: "First 3km free threshold" },
    { key: "DELIVERY_RATE_PER_100M_PAISE", value: "150", description: "₹1.50 per 100m beyond 3km" },
    { key: "COD_FEE_PAISE", value: "700", description: "COD Surcharge: ₹7.00" },
    { key: "MIN_QUALIFYING_MEAT_GRAMS", value: "1000", description: "Minimum order: 1kg qualifying meat" },
    { key: "TARGET_DELIVERY_MINUTES", value: "20", description: "Approximate delivery target window" },
    { key: "ORDER_SIMULATION_ENABLED", value: "false", description: "Development order lifecycle simulation flag" },
  ];

  for (const s of settings) {
    await prisma.systemSetting.create({ data: s });
  }

  // 5. Create Categories
  const catChicken = await prisma.category.create({
    data: {
      name: "Fresh Chicken",
      slug: "fresh-chicken",
      description: "Farm fresh, hygienic, tender chicken cut to your preference daily.",
      imageUrl: "https://images.unsplash.com/photo-1587593810167-a84920ea0781?auto=format&fit=crop&w=600&q=80",
      displayOrder: 1,
    },
  });

  const catMasala = await prisma.category.create({
    data: {
      name: "Masala & Special Cuts",
      slug: "masala-special",
      description: "Chef-curated marinated chicken, fresh kebab cuts, and signature masala preparations.",
      imageUrl: "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=600&q=80",
      displayOrder: 2,
    },
  });

  const catEggs = await prisma.category.create({
    data: {
      name: "Farm & Desi Eggs",
      slug: "eggs",
      description: "Nutritious, naturally raised country desi eggs and daily fresh farm eggs.",
      imageUrl: "https://images.unsplash.com/photo-1516467508483-a7212febe31a?auto=format&fit=crop&w=600&q=80",
      displayOrder: 3,
    },
  });

  const catBeverages = await prisma.category.create({
    data: {
      name: "Chilled Beverages",
      slug: "beverages",
      description: "Refreshing cold beverages to complete your dining experience.",
      imageUrl: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=600&q=80",
      displayOrder: 4,
    },
  });

  console.log("Seeded Categories");

  // Helper for Chicken Customizations
  const chickenCustomizationGroups = [
    {
      name: "Cutting Preference",
      selectionType: "SINGLE",
      isRequired: true,
      displayOrder: 1,
      options: [
        { name: "Curry Cut (Medium)", priceDeltaMinor: 0, displayOrder: 1 },
        { name: "Small Pieces (Biryani Cut)", priceDeltaMinor: 0, displayOrder: 2 },
        { name: "Large Pieces", priceDeltaMinor: 0, displayOrder: 3 },
        { name: "Boneless Cubes", priceDeltaMinor: 1000, displayOrder: 4 }, // +₹10
        { name: "Whole (No Cut)", priceDeltaMinor: 0, displayOrder: 5 },
      ],
    },
    {
      name: "Cleaning & Skin Option",
      selectionType: "SINGLE",
      isRequired: true,
      displayOrder: 2,
      options: [
        { name: "Skin Removed & Thoroughly Washed", priceDeltaMinor: 0, displayOrder: 1 },
        { name: "With Skin Cleaned", priceDeltaMinor: 0, displayOrder: 2 },
        { name: "Skinless & Fat Trimmed", priceDeltaMinor: 0, displayOrder: 3 },
      ],
    },
  ];

  // 6. Create Products
  // 6.1 Chicken 1kg
  const prodChicken1kg = await prisma.product.create({
    data: {
      categoryId: catChicken.id,
      name: "Fresh Chicken 1kg",
      slug: "fresh-chicken-1kg",
      description: "Farm-fresh whole chicken portioned to exactly 1 kilogram. Perfect for family curries, roasts, and biryanis.",
      productType: "WEIGHT",
      isAvailable: true,
      imageUrl: "https://images.unsplash.com/photo-1587593810167-a84920ea0781?auto=format&fit=crop&w=600&q=80",
      seoTitle: "Fresh Chicken 1kg Delivery in Mulbagal | Daily Market Price",
      seoDescription: "Order 1kg fresh tender chicken in Mulbagal with free fast home delivery up to 3km. Customizable cutting and cleaning.",
      displayOrder: 1,
      variants: {
        create: [
          {
            name: "1 kg Pack",
            pricingType: "WEIGHT",
            quantityValue: 1000,
            quantityUnit: "g",
            priceMinor: 25000, // ₹250.00
            isAvailable: true,
          },
        ],
      },
      customizationGroups: {
        create: chickenCustomizationGroups.map((g) => ({
          name: g.name,
          selectionType: g.selectionType,
          isRequired: g.isRequired,
          displayOrder: g.displayOrder,
          options: {
            create: g.options,
          },
        })),
      },
    },
    include: { variants: true },
  });

  // 6.2 Chicken 500g
  const prodChicken500g = await prisma.product.create({
    data: {
      categoryId: catChicken.id,
      name: "Fresh Chicken 500g",
      slug: "fresh-chicken-500g",
      description: "Freshly cut, tender 500g portion of quality chicken. Ideal for quick meals and couple servings.",
      productType: "WEIGHT",
      isAvailable: true,
      imageUrl: "https://images.unsplash.com/photo-1604503468506-a8da13d82791?auto=format&fit=crop&w=600&q=80",
      seoTitle: "Fresh Chicken 500g Online in Mulbagal | Fresh Chicken Shop",
      seoDescription: "Buy 500g fresh chicken online. Combine with other cuts to meet the 1kg minimum meat delivery requirement.",
      displayOrder: 2,
      variants: {
        create: [
          {
            name: "500g Pack",
            pricingType: "WEIGHT",
            quantityValue: 500,
            quantityUnit: "g",
            priceMinor: 13000, // ₹130.00
            isAvailable: true,
          },
        ],
      },
      customizationGroups: {
        create: chickenCustomizationGroups.map((g) => ({
          name: g.name,
          selectionType: g.selectionType,
          isRequired: g.isRequired,
          displayOrder: g.displayOrder,
          options: {
            create: g.options,
          },
        })),
      },
    },
    include: { variants: true },
  });

  // 6.3 Leg Pieces
  const prodLegPieces = await prisma.product.create({
    data: {
      categoryId: catChicken.id,
      name: "Tender Chicken Leg Pieces (4 pcs)",
      slug: "chicken-leg-pieces",
      description: "Juicy, succulent drumsticks selected for grilling, tandoor, and rich curries. Pack of 4 drumsticks.",
      productType: "PIECE",
      isAvailable: true,
      imageUrl: "https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?auto=format&fit=crop&w=600&q=80",
      displayOrder: 3,
      variants: {
        create: [
          {
            name: "Pack of 4 Legs (~600g)",
            pricingType: "PIECE",
            quantityValue: 600, // 600g meat weight
            quantityUnit: "g",
            priceMinor: 28000, // ₹280.00
            isAvailable: true,
          },
        ],
      },
      customizationGroups: {
        create: [
          {
            name: "Cleaning & Cuts",
            selectionType: "SINGLE",
            isRequired: true,
            options: {
              create: [
                { name: "Deep Slits for Marination", priceDeltaMinor: 0 },
                { name: "Cleaned Skinless", priceDeltaMinor: 0 },
              ],
            },
          },
        ],
      },
    },
    include: { variants: true },
  });

  // 6.4 Chicken Wings
  const prodWings = await prisma.product.create({
    data: {
      categoryId: catChicken.id,
      name: "Chicken Wings (500g)",
      slug: "chicken-wings",
      description: "Crispy-ready fresh chicken wings. High in flavor, perfect for deep frying or smoky barbecues.",
      productType: "WEIGHT",
      isAvailable: true,
      imageUrl: "https://images.unsplash.com/photo-1567620832903-9fc6debc209f?auto=format&fit=crop&w=600&q=80",
      displayOrder: 4,
      variants: {
        create: [
          {
            name: "500g Wings",
            pricingType: "WEIGHT",
            quantityValue: 500,
            quantityUnit: "g",
            priceMinor: 14000, // ₹140.00
            isAvailable: true,
          },
        ],
      },
    },
    include: { variants: true },
  });

  // 6.5 Chicken Breast Boneless
  const prodBreast = await prisma.product.create({
    data: {
      categoryId: catChicken.id,
      name: "Chicken Breast Boneless (500g)",
      slug: "chicken-breast-boneless",
      description: "Lean, pure protein chicken breast fillets with zero bone and trimmed excess fat.",
      productType: "WEIGHT",
      isAvailable: true,
      imageUrl: "https://images.unsplash.com/photo-1604503468506-a8da13d82791?auto=format&fit=crop&w=600&q=80",
      displayOrder: 5,
      variants: {
        create: [
          {
            name: "500g Boneless Breast",
            pricingType: "WEIGHT",
            quantityValue: 500,
            quantityUnit: "g",
            priceMinor: 19000, // ₹190.00
            isAvailable: true,
          },
        ],
      },
    },
    include: { variants: true },
  });

  // 6.6 Chicken 65 Marinated
  const prodChicken65 = await prisma.product.create({
    data: {
      categoryId: catMasala.id,
      name: "Signature Chicken 65 (500g Marinated)",
      slug: "chicken-65-marinated",
      description: "Authentic Andhra-style spicy marinated boneless chicken bites ready to drop straight into hot oil.",
      productType: "WEIGHT",
      isAvailable: true,
      imageUrl: "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=600&q=80",
      displayOrder: 6,
      variants: {
        create: [
          {
            name: "500g Marinated Pack",
            pricingType: "WEIGHT",
            quantityValue: 500,
            quantityUnit: "g",
            priceMinor: 18000, // ₹180.00
            isAvailable: true,
          },
        ],
      },
    },
    include: { variants: true },
  });

  // 6.7 Eggs
  const prodFarmEggs = await prisma.product.create({
    data: {
      categoryId: catEggs.id,
      name: "Fresh Farm White Eggs (Pack of 6)",
      slug: "farm-white-eggs-6",
      description: "Farm-fresh Grade A white eggs packed with essential nutrients, clean-graded and unbroken.",
      productType: "PIECE",
      isAvailable: true,
      imageUrl: "https://images.unsplash.com/photo-1516467508483-a7212febe31a?auto=format&fit=crop&w=600&q=80",
      displayOrder: 7,
      variants: {
        create: [
          {
            name: "Pack of 6 Eggs",
            pricingType: "PIECE",
            quantityValue: 6,
            quantityUnit: "pc",
            priceMinor: 4500, // ₹45.00
            isAvailable: true,
          },
        ],
      },
    },
    include: { variants: true },
  });

  const prodDesiEggs = await prisma.product.create({
    data: {
      categoryId: catEggs.id,
      name: "Organic Country Desi Eggs (Pack of 6)",
      slug: "desi-eggs-6",
      description: "Naturally reared free-range country desi chicken eggs with deep golden yolks.",
      productType: "PIECE",
      isAvailable: true,
      imageUrl: "https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?auto=format&fit=crop&w=600&q=80",
      displayOrder: 8,
      variants: {
        create: [
          {
            name: "Pack of 6 Desi Eggs",
            pricingType: "PIECE",
            quantityValue: 6,
            quantityUnit: "pc",
            priceMinor: 8000, // ₹80.00
            isAvailable: true,
          },
        ],
      },
    },
    include: { variants: true },
  });

  // 6.8 Beverages
  const prodPepsi = await prisma.product.create({
    data: {
      categoryId: catBeverages.id,
      name: "Pepsi Chilled (750ml)",
      slug: "pepsi-750ml",
      description: "Chilled 750ml bottle of Pepsi cola.",
      productType: "FIXED",
      isAvailable: true,
      imageUrl: "https://images.unsplash.com/photo-1629203851122-3726ecdf080e?auto=format&fit=crop&w=600&q=80",
      displayOrder: 9,
      variants: {
        create: [
          {
            name: "750ml Bottle",
            pricingType: "FIXED",
            quantityValue: 1,
            quantityUnit: "pack",
            priceMinor: 4000, // ₹40.00
            isAvailable: true,
          },
        ],
      },
    },
    include: { variants: true },
  });

  const prodCoke = await prisma.product.create({
    data: {
      categoryId: catBeverages.id,
      name: "Coca-Cola Chilled (750ml)",
      slug: "coke-750ml",
      description: "Chilled 750ml bottle of Coca-Cola.",
      productType: "FIXED",
      isAvailable: true,
      imageUrl: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=600&q=80",
      displayOrder: 10,
      variants: {
        create: [
          {
            name: "750ml Bottle",
            pricingType: "FIXED",
            quantityValue: 1,
            quantityUnit: "pack",
            priceMinor: 4000, // ₹40.00
            isAvailable: true,
          },
        ],
      },
    },
    include: { variants: true },
  });

  console.log("Seeded Products and Variants");

  // 7. Create Coupons
  const now = new Date();
  const nextMonth = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  const coupon100 = await prisma.coupon.create({
    data: {
      code: "FRESH100",
      type: "FIXED",
      value: 100, // ₹100 OFF
      minimumOrderMinor: 49900, // Above ₹499
      startsAt: now,
      expiresAt: nextMonth,
      isActive: true,
      usageLimit: 500,
      perUserLimit: 2,
    },
  });

  const coupon10 = await prisma.coupon.create({
    data: {
      code: "WELCOME10",
      type: "PERCENTAGE",
      value: 10, // 10% OFF
      maximumDiscountMinor: 10000, // Max ₹100
      startsAt: now,
      expiresAt: nextMonth,
      isActive: true,
      perUserLimit: 1,
    },
  });

  const couponFreeDel = await prisma.coupon.create({
    data: {
      code: "FREEDEL",
      type: "FREE_DELIVERY",
      value: 0,
      freeDelivery: true,
      startsAt: now,
      expiresAt: nextMonth,
      isActive: true,
    },
  });

  const couponSave50 = await prisma.coupon.create({
    data: {
      code: "SAVE50",
      type: "MIN_ORDER_FIXED",
      value: 50, // ₹50 OFF
      minimumOrderMinor: 39900, // Above ₹399
      startsAt: now,
      expiresAt: nextMonth,
      isActive: true,
    },
  });

  console.log("Seeded Coupons: FRESH100, WELCOME10, FREEDEL, SAVE50");

  // 8. Create Sample Orders in each lifecycle state
  const customerAddress = JSON.stringify({
    label: "Home",
    addressLine: "#42, Gandhi Road, Near Someshwara Temple",
    locality: "Temple Street",
    city: "Mulbagal",
    postalCode: "563131",
    latitude: 13.1672,
    longitude: 78.3985,
  });

  // Order 1: DELIVERED (with customer review)
  const orderDelivered = await prisma.order.create({
    data: {
      orderNumber: "FC-1001",
      userId: customerUser.id,
      status: "DELIVERED",
      subtotalMinor: 29000,
      discountMinor: 0,
      deliveryFeeMinor: 0,
      codFeeMinor: 700, // ₹7 COD
      totalMinor: 29700,
      deliveryDistanceMeters: 1800,
      deliveryLatitude: 13.1672,
      deliveryLongitude: 78.3985,
      deliveryAddressSnapshot: customerAddress,
      notes: "Please call on arrival",
      placedAt: new Date(Date.now() - 60 * 60 * 1000),
      confirmedAt: new Date(Date.now() - 55 * 60 * 1000),
      preparingAt: new Date(Date.now() - 50 * 60 * 1000),
      outForDeliveryAt: new Date(Date.now() - 30 * 60 * 1000),
      deliveredAt: new Date(Date.now() - 10 * 60 * 1000),
      items: {
        create: [
          {
            productId: prodChicken1kg.id,
            variantId: prodChicken1kg.variants[0].id,
            productNameSnapshot: "Fresh Chicken 1kg",
            variantNameSnapshot: "1 kg Pack",
            quantity: 1,
            weightGrams: 1000,
            unitPriceMinor: 25000,
            lineTotalMinor: 25000,
            customizationSnapshotJson: JSON.stringify([
              { group: "Cutting Preference", option: "Curry Cut (Medium)" },
              { group: "Cleaning & Skin Option", option: "Skin Removed & Thoroughly Washed" },
            ]),
          },
          {
            productId: prodPepsi.id,
            variantId: prodPepsi.variants[0].id,
            productNameSnapshot: "Pepsi Chilled (750ml)",
            variantNameSnapshot: "750ml Bottle",
            quantity: 1,
            weightGrams: 0,
            unitPriceMinor: 4000,
            lineTotalMinor: 4000,
          },
        ],
      },
      payment: {
        create: {
          method: "COD",
          status: "COMPLETED",
          amountMinor: 29700,
          provider: "CASH_ON_DELIVERY",
          providerReference: "COD_FC-1001_PAID",
        },
      },
      deliveryAssignment: {
        create: {
          agentUserId: deliveryUser.id,
          status: "DELIVERED",
          startedAt: new Date(Date.now() - 30 * 60 * 1000),
          deliveredAt: new Date(Date.now() - 10 * 60 * 1000),
        },
      },
      review: {
        create: {
          userId: customerUser.id,
          rating: 5,
          comment: "Super fresh chicken! Cut exactly as requested and delivered within 18 minutes in Mulbagal.",
          status: "PUBLISHED",
        },
      },
    },
  });

  // Order 2: OUT_FOR_DELIVERY (Assigned to Delivery Partner)
  const orderOut = await prisma.order.create({
    data: {
      orderNumber: "FC-1002",
      userId: customerUser.id,
      status: "OUT_FOR_DELIVERY",
      subtotalMinor: 43000,
      discountMinor: 0,
      deliveryFeeMinor: 1500, // 4km distance (1km over 3km = 1000m / 100 * 1.50 = ₹15)
      codFeeMinor: 700,
      totalMinor: 45200,
      deliveryDistanceMeters: 4000,
      deliveryLatitude: 13.1672,
      deliveryLongitude: 78.3985,
      deliveryAddressSnapshot: customerAddress,
      placedAt: new Date(Date.now() - 25 * 60 * 1000),
      confirmedAt: new Date(Date.now() - 20 * 60 * 1000),
      preparingAt: new Date(Date.now() - 15 * 60 * 1000),
      outForDeliveryAt: new Date(Date.now() - 5 * 60 * 1000),
      items: {
        create: [
          {
            productId: prodChicken1kg.id,
            variantId: prodChicken1kg.variants[0].id,
            productNameSnapshot: "Fresh Chicken 1kg",
            variantNameSnapshot: "1 kg Pack",
            quantity: 1,
            weightGrams: 1000,
            unitPriceMinor: 25000,
            lineTotalMinor: 25000,
            customizationSnapshotJson: JSON.stringify([
              { group: "Cutting Preference", option: "Small Pieces (Biryani Cut)" },
            ]),
          },
          {
            productId: prodChicken65.id,
            variantId: prodChicken65.variants[0].id,
            productNameSnapshot: "Signature Chicken 65 (500g Marinated)",
            variantNameSnapshot: "500g Marinated Pack",
            quantity: 1,
            weightGrams: 500,
            unitPriceMinor: 18000,
            lineTotalMinor: 18000,
          },
        ],
      },
      payment: {
        create: {
          method: "COD",
          status: "PENDING",
          amountMinor: 45200,
          provider: "CASH_ON_DELIVERY",
        },
      },
      deliveryAssignment: {
        create: {
          agentUserId: deliveryUser.id,
          status: "STARTED",
          startedAt: new Date(Date.now() - 5 * 60 * 1000),
        },
      },
    },
  });

  // Order 3: PLACED (New incoming order)
  const orderPlaced = await prisma.order.create({
    data: {
      orderNumber: "FC-1003",
      userId: customerUser.id,
      status: "PLACED",
      subtotalMinor: 26000, // 2x 500g = 1000g
      discountMinor: 0,
      deliveryFeeMinor: 0,
      codFeeMinor: 700,
      totalMinor: 26700,
      deliveryDistanceMeters: 2200,
      deliveryLatitude: 13.1672,
      deliveryLongitude: 78.3985,
      deliveryAddressSnapshot: customerAddress,
      placedAt: new Date(Date.now() - 3 * 60 * 1000),
      items: {
        create: [
          {
            productId: prodChicken500g.id,
            variantId: prodChicken500g.variants[0].id,
            productNameSnapshot: "Fresh Chicken 500g",
            variantNameSnapshot: "500g Pack",
            quantity: 2,
            weightGrams: 500,
            unitPriceMinor: 13000,
            lineTotalMinor: 26000,
            customizationSnapshotJson: JSON.stringify([
              { group: "Cutting Preference", option: "Curry Cut (Medium)" },
            ]),
          },
        ],
      },
      payment: {
        create: {
          method: "COD",
          status: "PENDING",
          amountMinor: 26700,
          provider: "CASH_ON_DELIVERY",
        },
      },
    },
  });

  console.log("Seeded sample orders: FC-1001 (Delivered), FC-1002 (Out for delivery), FC-1003 (Placed)");

  // 9. Add Customer Favorites
  await prisma.favorite.create({
    data: {
      userId: customerUser.id,
      productId: prodChicken1kg.id,
    },
  });

  console.log("\n==================================================");
  console.log("FRESH CHICKEN SEED DATA SUCCESSFULLY INSTALLED!");
  console.log("==================================================");
  console.log("Credentials (Development only):");
  console.log("  Admin:          admin@freshchicken.com / 9845000001 / AdminPassword123!");
  console.log("  Delivery Agent: delivery@freshchicken.com / 9845000002 / Delivery123!");
  console.log("  Customer:       customer@freshchicken.com / 9845000003 / Customer123!");
  console.log("==================================================\n");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
