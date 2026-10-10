import React from "react";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ProductDetailClient } from "./ProductDetailClient";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await prisma.product.findUnique({
    where: { slug },
    include: { variants: true },
  });

  if (!product) return { title: "Product Not Found | Fresh Chicken" };

  const minPrice = product.variants[0]?.priceMinor ? product.variants[0].priceMinor / 100 : 0;

  return {
    title: `${product.name} | Fresh Chicken Delivery Mulbagal`,
    description:
      product.description ||
      `Order fresh ${product.name} online in Mulbagal starting at ₹${minPrice}. Precision cuts and ~20-minute delivery.`,
    openGraph: {
      title: `${product.name} | Fresh Chicken Mulbagal`,
      description: product.description || `Order ${product.name} in Mulbagal.`,
      images: product.imageUrl ? [product.imageUrl] : [],
    },
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      category: true,
      variants: { orderBy: { priceMinor: "asc" } },
      customizationGroups: {
        orderBy: { displayOrder: "asc" },
        include: {
          options: {
            where: { isActive: true },
            orderBy: { displayOrder: "asc" },
          },
        },
      },
    },
  });

  if (!product || !product.isActive) {
    notFound();
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <ProductDetailClient product={product as any} />
    </div>
  );
}
