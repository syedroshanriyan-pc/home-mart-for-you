"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/Button";
import { Tag, Copy, Check, ArrowRight } from "lucide-react";

interface OfferCoupon {
  id: string;
  code: string;
  type: string;
  value: number;
  minimumOrderMinor?: number | null;
  maximumDiscountMinor?: number | null;
  freeDelivery?: boolean;
  expiresAt: string;
}

export const OffersClient: React.FC<{ coupons: OfferCoupon[] }> = ({ coupons }) => {
  const router = useRouter();
  const { applyCoupon } = useCart();
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleApplyAndGoToCart = async (code: string) => {
    await applyCoupon(code);
    router.push("/cart");
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {coupons.map((coupon) => {
        let offerTitle = "";
        let offerDescription = "";

        if (coupon.type === "FIXED" || coupon.type === "MIN_ORDER_FIXED") {
          offerTitle = `Flat ₹${coupon.value} OFF`;
          offerDescription = coupon.minimumOrderMinor
            ? `Valid on orders above ₹${coupon.minimumOrderMinor / 100}`
            : "Valid on all orders";
        } else if (coupon.type === "PERCENTAGE") {
          offerTitle = `Get ${coupon.value}% OFF`;
          offerDescription = coupon.maximumDiscountMinor
            ? `Up to ₹${coupon.maximumDiscountMinor / 100} discount`
            : "No upper cap";
        } else if (coupon.type === "FREE_DELIVERY" || coupon.freeDelivery) {
          offerTitle = "100% Free Doorstep Delivery";
          offerDescription = "Waives all delivery distance charges across Mulbagal";
        }

        const isCopied = copiedCode === coupon.code;

        return (
          <div
            key={coupon.id}
            className="bg-cream-50 rounded-2xl border border-cream-200 p-6 shadow-subtle flex flex-col justify-between space-y-4 hover:border-amberGold-300 transition-all"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="p-2 rounded-xl bg-amberGold-50 text-amberGold-600">
                  <Tag className="w-5 h-5" />
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full bg-cream-100 text-charcoal-600">
                  Active
                </span>
              </div>

              <div>
                <h3 className="font-serif text-lg font-semibold text-charcoal-700">
                  {offerTitle}
                </h3>
                <p className="text-xs text-charcoal-500 mt-0.5">
                  {offerDescription}
                </p>
              </div>

              {/* Code Box */}
              <div className="p-3 rounded-xl bg-cream-100/70 border border-dashed border-amberGold-300 flex items-center justify-between">
                <span className="font-mono text-sm font-bold text-charcoal-700 tracking-wider">
                  {coupon.code}
                </span>
                <button
                  onClick={() => handleCopy(coupon.code)}
                  className="p-1.5 rounded-lg hover:bg-cream-200 text-charcoal-500 hover:text-charcoal-700 transition-colors flex items-center gap-1 text-[11px]"
                >
                  {isCopied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700 font-medium">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="pt-2 border-t border-cream-200">
              <Button
                variant="primary"
                size="sm"
                onClick={() => handleApplyAndGoToCart(coupon.code)}
                className="w-full"
              >
                Apply Coupon & Go to Cart
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
};
