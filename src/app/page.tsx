import React from "react";
import { prisma } from "@/lib/prisma";
import { HomePageClientController } from "@/components/home/HomePageClientController";

export const revalidate = 60; // Revalidate every minute for live daily pricing & stock

export default async function HomePage() {
  let categories: any[] = [];
  let products: any[] = [];

  try {
    // 1. Fetch active categories
    categories = await prisma.category.findMany({
      where: { isActive: true },
      orderBy: { displayOrder: "asc" },
    });

    // 2. Fetch active products with categories and variants
    products = await prisma.product.findMany({
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
  } catch (err) {
    console.warn("Build-time home page catalog query fallback:", err);
  }

  return (
    <HomePageClientController
      products={products as any}
      categories={categories}
    />
  );
}
