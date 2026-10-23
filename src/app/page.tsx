import React from "react";
import { prisma } from "@/lib/prisma";
import { HomePageClientController } from "@/components/home/HomePageClientController";

export const revalidate = 60; // Revalidate every minute for live daily pricing & stock

export default async function HomePage() {
  // 1. Fetch active categories
  const categories = await prisma.category.findMany({
    where: { isActive: true },
    orderBy: { displayOrder: "asc" },
  });

  // 2. Fetch active products with categories and variants
  const products = await prisma.product.findMany({
    where: { isActive: true },
    orderBy: { displayOrder: "asc" },
    include: {
      category: {
        select: {
          id: true,
          name: true,
          slug: true,
          department: true,
        },
      },
      variants: {
        where: { isAvailable: true },
        orderBy: { priceMinor: "asc" },
      },
      customizationGroups: {
        include: {
          options: {
            where: { isActive: true },
          },
        },
      },
    },
  });

  return (
    <HomePageClientController
      products={products as any}
      categories={categories}
    />
  );
}
