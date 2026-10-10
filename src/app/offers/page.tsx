import React from "react";
import { prisma } from "@/lib/prisma";
import { OffersClient } from "./OffersClient";

export const revalidate = 60;

export const metadata = {
  title: "Special Offers & Coupons | Fresh Chicken Mulbagal",
  description: "Exclusive discount vouchers, promo codes, and free delivery offers on farm fresh tender chicken and seafood in Mulbagal.",
};

export default async function OffersPage() {
  const coupons = await prisma.coupon.findMany({
    where: { isActive: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="mb-8">
        <span className="text-xs uppercase font-semibold text-amberGold-600 tracking-wider">
          Special Promotions
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-medium text-charcoal-700 mt-1">
          Active Offers & Coupons
        </h1>
        <p className="text-xs text-charcoal-500 mt-1 max-w-xl">
          Apply these verified discount codes during checkout to save on your fresh chicken delivery in Mulbagal.
        </p>
      </div>

      <OffersClient coupons={coupons as any} />
    </div>
  );
}
