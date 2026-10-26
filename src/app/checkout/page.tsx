"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { useAuth, UserAddress } from "@/context/AuthContext";
import { Button } from "@/components/ui/Button";
import { LocationModal } from "@/components/ui/LocationModal";
import { DynamicPaymentModal } from "@/components/payment/DynamicPaymentModal";
import {
  MapPin,
  CreditCard,
  Banknote,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Clock,
  Sparkles,
} from "lucide-react";

export default function CheckoutPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const {
    items,
    couponCode,
    validation,
    previewCalculation,
    clearCart,
    paymentMethod,
    setPaymentMethod,
  } = useCart();

  const { selectedAddress } = useAuth();
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [upiOrderData, setUpiOrderData] = useState<{
    orderId: string;
    orderNumber: string;
    amountRupees: number;
  } | null>(null);
  const [activeOrderId, setActiveOrderId] = useState<string | null>(null);
  const idempotencyKeyRef = useRef<string>("");

  useEffect(() => {
    if (!idempotencyKeyRef.current) {
      idempotencyKeyRef.current =
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : `idemp_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    }
  }, []);

  // Redirect if cart is empty
  useEffect(() => {
    if (items.length === 0) {
      router.push("/cart");
    }
  }, [items, router]);

  // Wait for session verification before rendering prompt
  if (authLoading) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cream-100 text-charcoal-500 text-xs font-medium animate-pulse">
          <ShieldCheck className="w-4 h-4 text-amberGold-500" />
          <span>Verifying account status...</span>
        </div>
      </div>
    );
  }

  // If user is not logged in, prompt or redirect to login/register with callbackUrl
  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-14 h-14 rounded-full bg-cream-200 text-charcoal-500 flex items-center justify-center mx-auto">
          <ShieldCheck className="w-7 h-7" />
        </div>
        <h1 className="font-serif text-2xl font-medium text-charcoal-700">
          Sign In to Place Your Order
        </h1>
        <p className="text-xs text-charcoal-500">
          Please log in with your mobile number or create an account to finalize your order with live delivery tracking.
        </p>
        <div className="pt-2 flex flex-col gap-2">
          <Link href="/login?redirect=/checkout">
            <Button variant="primary" size="lg" className="w-full">
              Login with Mobile
            </Button>
          </Link>
          <Link href="/register?redirect=/checkout">
            <Button variant="outline" size="lg" className="w-full">
              New Customer? Register Here
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const subtotalRs =
    (validation ? validation.subtotalMinor : previewCalculation.subtotalMinor) / 100;
  const discountRs =
    (validation ? validation.discountMinor : previewCalculation.discountMinor) / 100;
  const deliveryRs =
    (validation ? validation.deliveryFeeMinor : previewCalculation.deliveryFeeMinor) / 100;
  const codFeeRs =
    (paymentMethod === "COD"
      ? validation
        ? validation.codFeeMinor
        : previewCalculation.codFeeMinor
      : 0) / 100;
  const totalRs =
    (validation
      ? validation.totalMinor
      : paymentMethod === "COD"
      ? previewCalculation.totalMinor + previewCalculation.codFeeMinor
      : previewCalculation.totalMinor) / 100;

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAddress) {
      setErrorMessage("Please select or enter your delivery address in Mulbagal.");
      return;
    }

    if (validation && !validation.isMinMeatMet && validation.meatShortfallGrams > 0) {
      setErrorMessage("Minimum order requirement of meat is not met.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");

    // If an unpaid order already exists from this checkout session and user switched to COD,
    // update that existing order rather than creating a duplicate order!
    if (activeOrderId && paymentMethod === "COD") {
      try {
        const switchRes = await fetch(`/api/orders/${activeOrderId}/switch-cod`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        });

        const switchData = await switchRes.json().catch(() => ({}));

        if (switchRes.ok && switchData.success) {
          clearCart();
          router.push(`/order-success?orderId=${activeOrderId}&method=COD`);
          return;
        }
      } catch {
        // Continue to standard handler if switch fails
      }
    }

    try {
      const payload = {
        existingOrderId: activeOrderId || undefined,
        idempotencyKey: idempotencyKeyRef.current || undefined,
        items: items.map((i) => ({
          productId: i.productId,
          variantId: i.variantId,
          quantity: i.quantity,
          customizations: i.customizations,
        })),
        addressId: selectedAddress.id && !selectedAddress.id.startsWith("guest_") ? selectedAddress.id : undefined,
        customAddress: (!selectedAddress.id || selectedAddress.id.startsWith("guest_"))
          ? {
              label: selectedAddress.label || "Home",
              addressLine: selectedAddress.addressLine,
              locality: selectedAddress.locality || "Mulbagal",
              city: "Mulbagal",
              latitude: selectedAddress.latitude,
              longitude: selectedAddress.longitude,
            }
          : undefined,
        couponCode: couponCode || undefined,
        paymentMethod,
        notes: notes.trim() || undefined,
      };

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setErrorMessage(data.error || "Failed to place order. Please review your cart.");
        setIsSubmitting(false);
        return;
      }

      // Track the created order ID so switching to COD never creates a duplicate
      setActiveOrderId(data.order.id);

      // If user selected Online Payment (Prepaid), prompt dynamic UPI payment modal
      if (paymentMethod !== "COD") {
        setIsSubmitting(false);
        setUpiOrderData({
          orderId: data.order.id,
          orderNumber: data.order.orderNumber,
          amountRupees: data.order.totalMinor / 100,
        });
        return;
      }

      // COD: clear cart and redirect to dedicated order success page
      clearCart();
      router.push(`/order-success?orderId=${data.order.id}&method=COD`);
    } catch {
      setErrorMessage("Network error placing order. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="mb-8">
        <span className="text-xs uppercase font-semibold text-amberGold-600 tracking-wider">
          Final Step
        </span>
        <h1 className="font-serif text-2xl sm:text-3xl font-medium text-charcoal-700 mt-1">
          Review & Place Order
        </h1>
        <p className="text-xs text-charcoal-500 mt-0.5">
          Delivery target: ~20 minutes in Mulbagal. Zero prep until you confirm.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Address & Payment Selection */}
        <div className="lg:col-span-8 space-y-6">
          {/* 1. Delivery Address Card */}
          <div className="bg-cream-50 rounded-2xl border border-cream-200 p-5 sm:p-6 shadow-subtle space-y-4">
            <div className="flex items-center justify-between border-b border-cream-200 pb-3">
              <h2 className="font-serif text-base font-semibold text-charcoal-700 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-amberGold-600" />
                <span>1. Delivery Address (Mulbagal)</span>
              </h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsLocationModalOpen(true)}
              >
                {selectedAddress ? "Change Address" : "Add Address"}
              </Button>
            </div>

            {selectedAddress ? (
              <div className="p-4 rounded-xl bg-cream-100/70 border border-cream-200 flex items-start gap-3">
                <div className="p-2 rounded-lg bg-cream-200 text-charcoal-600 mt-0.5">
                  <MapPin className="w-4 h-4 text-amberGold-600" />
                </div>
                <div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-charcoal-500 text-cream-50">
                    {selectedAddress.label}
                  </span>
                  <p className="text-sm font-medium text-charcoal-700 mt-1">
                    {selectedAddress.addressLine}
                  </p>
                  <p className="text-xs text-charcoal-500">
                    {selectedAddress.locality}, {selectedAddress.city} - {selectedAddress.postalCode || "563131"}
                  </p>
                  <p className="text-[11px] text-amberGold-600 mt-1 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> Target ~20 min delivery from Mulbagal Store
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-6 border border-dashed border-cream-300 rounded-xl space-y-2">
                <p className="text-xs text-charcoal-500">
                  No delivery address selected. Please confirm your location.
                </p>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setIsLocationModalOpen(true)}
                >
                  Set Delivery Location
                </Button>
              </div>
            )}
          </div>

          {/* 2. Payment Method Card */}
          <div className="bg-cream-50 rounded-2xl border border-cream-200 p-5 sm:p-6 shadow-subtle space-y-4">
            <h2 className="font-serif text-base font-semibold text-charcoal-700 flex items-center gap-2 border-b border-cream-200 pb-3">
              <CreditCard className="w-4 h-4 text-amberGold-600" />
              <span>2. Choose Payment Method</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Cash on Delivery option */}
              <button
                type="button"
                onClick={() => setPaymentMethod("COD")}
                className={`p-4 rounded-xl border text-left transition-all flex items-start gap-3 ${
                  paymentMethod === "COD"
                    ? "border-amberGold-400 bg-amberGold-50/50 ring-1 ring-amberGold-400"
                    : "border-cream-300 bg-cream-50 hover:bg-cream-100"
                }`}
              >
                <Banknote className="w-5 h-5 text-amberGold-600 mt-0.5" />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-charcoal-700">
                      Cash on Delivery (COD)
                    </span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] bg-amberGold-100 text-amberGold-800 font-bold">
                      +₹7 Fee
                    </span>
                  </div>
                  <p className="text-[11px] text-charcoal-500 mt-1">
                    Pay cash upon arrival of your package.
                  </p>
                </div>
              </button>

              {/* Online Payment (Prepaid) option */}
              <button
                type="button"
                onClick={() => setPaymentMethod("ONLINE")}
                className={`p-4 rounded-xl border text-left transition-all flex items-start gap-3 ${
                  paymentMethod !== "COD"
                    ? "border-amberGold-400 bg-amberGold-50/50 ring-1 ring-amberGold-400"
                    : "border-cream-300 bg-cream-50 hover:bg-cream-100"
                }`}
              >
                <CreditCard className="w-5 h-5 text-emerald-600 mt-0.5" />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-charcoal-700">
                      Homemart4u Pay (Dynamic UPI QR)
                    </span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-100 text-emerald-800 font-bold">
                      FREE &bull; FASTEST
                    </span>
                  </div>
                  <p className="text-[11px] text-charcoal-500 mt-1">
                    Homemart4u Pay: Scan Dynamic UPI QR with Google Pay, PhonePe, Paytm, BHIM (Zero fees &amp; instant verification).
                  </p>
                </div>
              </button>
            </div>
          </div>

          {/* 3. Delivery Instructions */}
          <div className="bg-cream-50 rounded-2xl border border-cream-200 p-5 shadow-subtle space-y-2">
            <label className="block text-xs font-semibold text-charcoal-700">
              Delivery Instructions (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Leave with security, call on arrival, near clock tower"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs bg-cream-100 border border-cream-300 rounded-xl text-charcoal-700 focus:outline-none focus:ring-2 focus:ring-amberGold-400"
            />
          </div>
        </div>

        {/* Right: Order Summary & Confirmation Button */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-cream-50 p-5 sm:p-6 rounded-2xl border border-cream-200 shadow-subtle space-y-4">
            <h3 className="font-serif text-base font-medium text-charcoal-700 border-b border-cream-200 pb-3">
              Order Items ({items.length})
            </h3>

            {/* Itemized List */}
            <div className="space-y-3 max-h-60 overflow-y-auto pr-1 text-xs">
              {items.map((i) => (
                <div key={i.id} className="flex justify-between items-start gap-2">
                  <div>
                    <span className="font-semibold text-charcoal-700">{i.productName}</span>
                    <span className="text-charcoal-400 block text-[11px]">
                      {i.quantity}x {i.variantName}
                    </span>
                  </div>
                  <span className="font-mono font-medium text-charcoal-700">
                    ₹{((i.unitPriceMinor * i.quantity) / 100).toFixed(0)}
                  </span>
                </div>
              ))}
            </div>

            {/* Bill Breakdown */}
            <div className="pt-3 border-t border-cream-200 space-y-2 text-xs">
              <div className="flex justify-between text-charcoal-600">
                <span>Subtotal</span>
                <span className="font-mono">₹{subtotalRs.toFixed(2)}</span>
              </div>

              {discountRs > 0 && (
                <div className="flex justify-between text-emerald-700 font-medium">
                  <span>Coupon ({couponCode})</span>
                  <span className="font-mono">-₹{discountRs.toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between text-charcoal-600">
                <span>Delivery</span>
                <span className="font-mono">
                  {deliveryRs === 0 ? "FREE" : `₹${deliveryRs.toFixed(2)}`}
                </span>
              </div>

              {paymentMethod === "COD" && (
                <div className="flex justify-between text-charcoal-600">
                  <span>COD Surcharge</span>
                  <span className="font-mono">₹{codFeeRs.toFixed(2)}</span>
                </div>
              )}

              <div className="pt-3 border-t border-cream-200 flex justify-between items-baseline text-sm">
                <span className="font-serif font-bold text-charcoal-800">
                  Final Payable Amount
                </span>
                <span className="font-serif text-xl font-bold text-charcoal-800 font-mono">
                  ₹{totalRs.toFixed(2)}
                </span>
              </div>
            </div>

            {errorMessage && (
              <p className="text-xs text-red-600 bg-red-50 p-3 rounded-xl border border-red-200">
                {errorMessage}
              </p>
            )}

            <div className="pt-2">
              <Button
                variant="primary"
                size="lg"
                onClick={handlePlaceOrder}
                isLoading={isSubmitting}
                disabled={!selectedAddress}
                className="w-full shadow-card"
              >
                <span>Confirm & Place Order &bull; ₹{totalRs.toFixed(0)}</span>
              </Button>
            </div>

            <p className="text-[10px] text-charcoal-500 text-center leading-relaxed">
              By placing this order, you agree to our{" "}
              <Link href="/terms-and-conditions" className="underline font-medium text-amberGold-600" target="_blank">
                Terms
              </Link>{" "}
              and acknowledge our{" "}
              <Link href="/cancellation-refund-policy" className="underline font-medium text-amberGold-600" target="_blank">
                Cancellation &amp; Refund Policy
              </Link>.
            </p>
          </div>
        </div>
      </div>

      <LocationModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
      />

      {upiOrderData && (
        <DynamicPaymentModal
          isOpen={true}
          orderId={upiOrderData.orderId}
          orderNumber={upiOrderData.orderNumber}
          amountRupees={upiOrderData.amountRupees}
          onClose={() => setUpiOrderData(null)}
          onSwitchToCod={async (orderIdToSwitch) => {
            try {
              const switchRes = await fetch(`/api/orders/${orderIdToSwitch}/switch-cod`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
              });
              const switchData = await switchRes.json().catch(() => ({}));
              if (switchRes.ok && switchData.success) {
                clearCart();
                setUpiOrderData(null);
                router.push(`/order-success?orderId=${orderIdToSwitch}&method=COD`);
              } else {
                setErrorMessage(switchData.error || "Failed to switch to COD.");
              }
            } catch {
              setErrorMessage("Network issue switching to COD.");
            }
          }}
          onSuccess={(finalOrderId) => {
            clearCart();
            setUpiOrderData(null);
            router.push(`/order-success?orderId=${finalOrderId}&method=ONLINE`);
          }}
        />
      )}
    </div>
  );
}
