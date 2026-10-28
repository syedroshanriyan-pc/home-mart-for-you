"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  CheckCircle2,
  Package,
  MapPin,
  Clock,
  Banknote,
  CreditCard,
  ArrowRight,
  ShoppingBag,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  Truck,
} from "lucide-react";
import { Button } from "@/components/ui/Button";

function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get("orderId");
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!orderId) {
      setError("No order identifier provided.");
      setLoading(false);
      return;
    }

    const fetchOrder = async () => {
      try {
        const res = await fetch(`/api/orders/${orderId}`);
        if (!res.ok) {
          throw new Error("Unable to load order details.");
        }
        const data = await res.json();
        setOrder(data.order);
      } catch (err: any) {
        setError(err.message || "Failed to load order confirmation.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-forest-50 border-2 border-forest-500/20 border-t-forest-600 animate-spin mx-auto" />
        <h2 className="font-serif text-xl font-bold text-charcoal-700">Verifying Order Placement...</h2>
        <p className="text-xs text-charcoal-400">Loading authoritative confirmation details from store hub.</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-14 h-14 rounded-full bg-crimson-50 text-crimson-600 flex items-center justify-center mx-auto">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h1 className="font-serif text-2xl font-bold text-charcoal-800">Order Information Unavailable</h1>
        <p className="text-xs text-charcoal-500 leading-relaxed">
          {error || "We could not find the confirmed order record."}
        </p>
        <div className="pt-2 flex flex-col sm:flex-row gap-2 justify-center">
          <Link href="/account/orders">
            <Button variant="primary" size="md">View My Orders</Button>
          </Link>
          <Link href="/menu">
            <Button variant="outline" size="md">Return to Menu</Button>
          </Link>
        </div>
      </div>
    );
  }

  let parsedAddress: any = null;
  try {
    parsedAddress = order.deliveryAddressSnapshot ? JSON.parse(order.deliveryAddressSnapshot) : null;
  } catch {}

  const isCod = order.payment?.method === "COD";
  const totalRupees = (order.totalMinor / 100).toFixed(2);
  const subtotalRupees = (order.subtotalMinor / 100).toFixed(2);
  const discountRupees = (order.discountMinor / 100).toFixed(2);
  const deliveryRupees = (order.deliveryFeeMinor / 100).toFixed(2);
  const codFeeRupees = (order.codFeeMinor / 100).toFixed(2);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-8 animate-fade-in">
      {/* Success Hero Header */}
      <div className="text-center space-y-3">
        <div className="relative mx-auto w-20 h-20 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-forest-500/20 animate-ping opacity-50" />
          <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-forest-500 to-forest-700 text-white flex items-center justify-center shadow-lg shadow-forest-600/30">
            <CheckCircle2 className="w-10 h-10 stroke-[2.2]" />
          </div>
        </div>

        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-forest-100 text-forest-800 border border-forest-300">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Order Confirmed &amp; Queued</span>
        </span>

        <h1 className="font-serif text-3xl sm:text-4xl font-extrabold text-charcoal-800">
          Order Placed Successfully!
        </h1>

        <p className="text-xs sm:text-sm text-charcoal-500 max-w-md mx-auto">
          Thank you for choosing Homemart4u. Your fresh order has been received at our local hub and is being prepared for express delivery.
        </p>

        <div className="inline-block mt-2 px-4 py-1.5 bg-cream-200/80 border border-cream-300 rounded-xl font-mono text-xs font-bold text-charcoal-700">
          Order Reference: <span className="text-forest-700 text-sm font-black">{order.orderNumber}</span>
        </div>
      </div>

      {/* Main Order Confirmation Card */}
      <div className="bg-white rounded-3xl border border-cream-300 shadow-subtle overflow-hidden">
        {/* Header Status Bar */}
        <div className="bg-cream-100/70 p-4 sm:p-6 border-b border-cream-200 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            {isCod ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amberGold-100 text-amberGold-900 border border-amberGold-300 text-xs font-bold">
                <Banknote className="w-4 h-4 text-amberGold-700" />
                <span>Payment Method: Cash on Delivery</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-forest-100 text-forest-900 border border-forest-300 text-xs font-bold">
                <CreditCard className="w-4 h-4 text-forest-700" />
                <span>Payment Method: Verified Online Prepaid</span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5 text-xs text-charcoal-500 font-medium">
            <Clock className="w-3.5 h-3.5 text-amberGold-600" />
            <span>Target Delivery: ~20 mins from store confirmation</span>
          </div>
        </div>

        <div className="p-4 sm:p-6 space-y-6">
          {/* Order Items Summary */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-charcoal-400 mb-3 flex items-center gap-1.5">
              <Package className="w-4 h-4 text-forest-600" />
              <span>Purchased Items ({order.items?.length || 0})</span>
            </h3>

            <div className="divide-y divide-cream-200 border-y border-cream-200">
              {order.items?.map((item: any) => {
                let customizationsList: any[] = [];
                try {
                  if (item.customizationSnapshotJson) {
                    customizationsList = JSON.parse(item.customizationSnapshotJson);
                  }
                } catch {}

                return (
                  <div key={item.id} className="py-3 flex items-start justify-between gap-4 text-xs">
                    <div className="space-y-0.5">
                      <div className="font-bold text-charcoal-800">
                        {item.productNameSnapshot}
                        {item.variantNameSnapshot && (
                          <span className="text-charcoal-500 font-normal"> &bull; {item.variantNameSnapshot}</span>
                        )}
                      </div>
                      <div className="text-[11px] text-charcoal-400">
                        Qty: <span className="font-semibold text-charcoal-700">{item.quantity}</span>
                        {item.weightGrams ? ` &bull; ${item.weightGrams}g` : ""}
                      </div>
                      {customizationsList.length > 0 && (
                        <div className="text-[10px] text-forest-600 font-medium">
                          Customized: {customizationsList.map((c) => c.option).join(", ")}
                        </div>
                      )}
                    </div>
                    <div className="font-mono font-bold text-charcoal-800 text-right">
                      ₹{(item.lineTotalMinor / 100).toFixed(2)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Delivery Address Details */}
          {parsedAddress && (
            <div className="bg-cream-50 p-4 rounded-2xl border border-cream-200 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-charcoal-400 block flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-crimson-600" />
                <span>Delivery Destination</span>
              </span>
              <div className="text-xs font-bold text-charcoal-800">{parsedAddress.label || "Home"}</div>
              <p className="text-xs text-charcoal-600 leading-relaxed">
                {parsedAddress.addressLine}, {parsedAddress.locality || "Mulbagal"}, {parsedAddress.city || "Mulbagal"}
              </p>
            </div>
          )}

          {/* Authoritative Price Breakdown */}
          <div className="bg-cream-50 p-4 rounded-2xl border border-cream-200 space-y-2 text-xs font-mono">
            <div className="flex justify-between text-charcoal-600">
              <span className="font-sans">Items Subtotal</span>
              <span>₹{subtotalRupees}</span>
            </div>

            {order.discountMinor > 0 && (
              <div className="flex justify-between text-forest-700 font-semibold">
                <span className="font-sans">Coupon Discount ({order.couponCodeSnapshot || "PROMO"})</span>
                <span>-₹{discountRupees}</span>
              </div>
            )}

            <div className="flex justify-between text-charcoal-600">
              <span className="font-sans">Delivery Fee</span>
              <span>{order.deliveryFeeMinor === 0 ? "FREE" : `₹${deliveryRupees}`}</span>
            </div>

            {order.codFeeMinor > 0 && (
              <div className="flex justify-between text-amberGold-800 font-medium">
                <span className="font-sans">Cash on Delivery Convenience Surcharge</span>
                <span>₹{codFeeRupees}</span>
              </div>
            )}

            <div className="pt-2 border-t border-cream-200 flex justify-between items-center text-sm font-bold text-charcoal-900">
              <span className="font-sans font-bold">Total Payable Amount</span>
              <span className="text-base font-extrabold text-forest-700">₹{totalRupees}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-4 sm:p-6 bg-cream-100/50 border-t border-cream-200 flex flex-col sm:flex-row gap-3 justify-end">
          <Link href="/menu" className="w-full sm:w-auto">
            <Button variant="outline" size="md" className="w-full flex items-center justify-center gap-2">
              <ShoppingBag className="w-4 h-4" />
              <span>Continue Shopping</span>
            </Button>
          </Link>
          <Link href={`/account/orders/${order.id}`} className="w-full sm:w-auto">
            <Button variant="primary" size="md" className="w-full flex items-center justify-center gap-2">
              <Truck className="w-4 h-4" />
              <span>View Order Details &amp; Track Status &rarr;</span>
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
          <div className="w-12 h-12 rounded-full border-4 border-forest-600 border-t-transparent animate-spin mx-auto" />
          <p className="text-xs text-charcoal-500">Loading confirmed order...</p>
        </div>
      }
    >
      <OrderSuccessContent />
    </Suspense>
  );
}
