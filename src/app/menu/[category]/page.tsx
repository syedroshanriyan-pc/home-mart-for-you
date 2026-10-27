import React from "react";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { MenuClient } from "../MenuClient";

export const revalidate = 60;

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category: categorySlug } = await params;

  let currentCategory = null;
  let categories: any[] = [];
  let products: any[] = [];

  try {
    currentCategory = await prisma.category.findUnique({
      where: { slug: categorySlug },
    });

    if (currentCategory) {
      categories = await prisma.category.findMany({
        where: { isActive: true },
        orderBy: { displayOrder: "asc" },
      });

      products = await prisma.product.findMany({
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
    }
  } catch (err) {
    console.warn("Build-time category page query fallback:", err);
  }

  if (!currentCategory) {
    notFound();
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="mb-8">
        <span className="text-xs uppercase font-semibold text-amberGold-600 tracking-wider">
          Category
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-medium text-charcoal-700 mt-1">
          {currentCategory.name}
        </h1>
        {currentCategory.description && (
          <p className="text-xs text-charcoal-500 mt-1 max-w-xl">
            {currentCategory.description}
          </p>
        )}
      </div>

      <MenuClient
        initialCategories={categories}
        initialProducts={products as any}
        defaultCategorySlug={categorySlug}
      />
    </div>
  );
}
