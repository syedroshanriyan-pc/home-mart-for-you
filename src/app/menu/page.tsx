import React from "react";
import { prisma } from "@/lib/prisma";
import { MenuClient } from "./MenuClient";

export const revalidate = 60;

export const metadata = {
  title: "Fresh Meat & Poultry Menu | 100% Halal Cuts Mulbagal",
  description: "Browse farm fresh tender chicken, curry cuts, biryani cuts, boneless breasts, desi eggs, and fresh fish. Custom cutting, 100% Halal certified, delivered in 20 minutes in Mulbagal.",
};

export default async function MenuPage() {
  const categories = await prisma.category.findMany({
    where: { isActive: true },
    orderBy: { displayOrder: "asc" },
  });

  const products = await prisma.product.findMany({
    where: { isActive: true },
    orderBy: { displayOrder: "asc" },
    include: {
      category: { select: { name: true, slug: true } },
      variants: { where: { isAvailable: true }, orderBy: { priceMinor: "asc" } },
      customizationGroups: {
        include: { options: { where: { isActive: true } } },
      },
    },
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="mb-8">
        <span className="text-xs uppercase font-semibold text-amberGold-600 tracking-wider">
          Daily Farm Fresh Cuts
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-medium text-charcoal-700 mt-1">
          Our Fresh Meat Menu
        </h1>
        <p className="text-xs text-charcoal-500 mt-1 max-w-xl">
          All cuts are dressed fresh to order in Mulbagal. Daily market-tested pricing and custom cutting options available.
        </p>
      </div>

      <MenuClient
        initialCategories={categories}
        initialProducts={products as any}
      />
    </div>
  );
}
