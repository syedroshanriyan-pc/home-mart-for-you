import React from "react";
import { getActiveCategories, getActiveProducts } from "@/lib/catalog";
import { HomePageClientController } from "@/components/home/HomePageClientController";

export const revalidate = 60; // Revalidate every minute for live daily pricing & stock

export default async function HomePage() {
  const [categories, products] = await Promise.all([
    getActiveCategories(),
    getActiveProducts(),
  ]);

  return (
    <HomePageClientController
      products={products}
      categories={categories}
    />
  );
}
