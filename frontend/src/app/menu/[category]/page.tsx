import React from "react";
import { notFound } from "next/navigation";
import { getActiveCategories, getActiveProducts } from "@/lib/catalog";
import { MenuClient } from "../MenuClient";

export const revalidate = 60;

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category: categorySlug } = await params;

  const [categories, products] = await Promise.all([
    getActiveCategories(),
    getActiveProducts(categorySlug),
  ]);

  const currentCategory = categories.find((c: any) => c.slug === categorySlug);

  if (!currentCategory && categories.length > 0) {
    notFound();
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="mb-8">
        <span className="text-xs uppercase font-semibold text-amberGold-600 tracking-wider">
          Category
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-medium text-charcoal-700 mt-1">
          {currentCategory?.name || categorySlug}
        </h1>
        {currentCategory?.description && (
          <p className="text-xs text-charcoal-500 mt-1 max-w-xl">
            {currentCategory.description}
          </p>
        )}
      </div>

      <MenuClient
        initialCategories={categories}
        initialProducts={products}
        defaultCategorySlug={categorySlug}
      />
    </div>
  );
}
