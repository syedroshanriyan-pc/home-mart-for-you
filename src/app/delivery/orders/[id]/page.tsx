"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Phone,
  MapPin,
  Navigation,
  DollarSign,
  Package,
  CheckCircle2,
  Bike,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import { formatCurrency } from "@/lib/delivery";
import { Modal } from "@/components/ui/Modal";

export default function DeliveryOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [assignment, setAssignment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDeliverModalOpen, setIsDeliverModalOpen] = useState(false);
  const [codCollectedVerified, setCodCollectedVerified] = useState(false);

  const fetchAssignment = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/delivery/assignments/${id}`);
      if (!res.ok) {
        throw new Error("Failed to load delivery assignment");
      }
      const data = await res.json();
      setAssignment(data.assignment);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchAssignment();
  }, [id]);

  const handleStartDelivery = async () => {
    setActionLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/delivery/assignments/${id}/start`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to start delivery run");
      }
      fetchAssignment();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCompleteDelivery = async () => {
    setActionLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/delivery/assignments/${id}/deliver`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to mark order as delivered");
      }
      setIsDeliverModalOpen(false);
      fetchAssignment();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="py-16 text-center text-xs text-charcoal-400 font-mono">
        Loading delivery run sheet...
      </div>
    );
  }

  if (!assignment) {
    return (
      <div className="bg-white p-8 rounded-2xl border border-cream-300 text-center space-y-4">
        <AlertCircle className="w-8 h-8 text-crimson-600 mx-auto" />
        <p className="text-sm font-semibold text-charcoal-700">Delivery Assignment Not Found</p>
        <Link
          href="/delivery"
          className="inline-flex items-center gap-2 px-4 py-2 bg-cream-200 text-charcoal-700 rounded-xl text-xs font-semibold"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>
      </div>
    );
  }

  const ord = assignment.order;
  const addr = ord.deliveryAddress || {};
  const isCod = ord.paymentMethod === "COD";

  const primaryAddressLine = addr.addressLine || addr.line1 || (typeof addr === "string" ? addr : "Delivery Address");
  const secondaryAddressLine = addr.locality || addr.line2 || "";
  const addressCity = addr.city || "Mulbagal";
  const addressPostal = addr.postalCode || "563131";

  // Google Maps navigation link
  const mapsUrl =
    addr.latitude && addr.longitude
      ? `https://www.google.com/maps/dir/?api=1&destination=${addr.latitude},${addr.longitude}`
      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
          `${primaryAddressLine} ${secondaryAddressLine} ${addressCity} ${addressPostal}`
        )}`;

  return (
    <div className="space-y-5 pb-12">
      {/* Back button & Status */}
      <div className="flex items-center justify-between">
        <Link
          href="/delivery"
          className="flex items-center gap-1.5 text-xs font-semibold text-charcoal-600 hover:text-charcoal-900"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Runs
        </Link>

        <span
          className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
            assignment.status === "STARTED"
              ? "bg-amberGold-100 text-amberGold-800 border border-amberGold-300 animate-pulse"
              : assignment.status === "DELIVERED"
              ? "bg-forest-100 text-forest-800 border border-forest-300"
              : "bg-blue-100 text-blue-800 border border-blue-300"
          }`}
        >
          {assignment.status === "STARTED"
            ? "Out for Delivery"
            : assignment.status === "ASSIGNED"
            ? "Assigned (At Hub)"
            : "Delivered"}
        </span>
      </div>

      {error && (
        <div className="p-3 bg-crimson-50 border border-crimson-200 text-crimson-700 text-xs rounded-xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Primary Customer Card */}
      <div className="bg-white p-5 rounded-2xl border border-cream-300 shadow-subtle space-y-4">
        <div className="flex items-center justify-between border-b border-cream-200 pb-3">
          <div>
            <span className="text-[10px] text-charcoal-400 uppercase font-mono block">
              Customer Name
            </span>
            <span className="text-base font-bold text-charcoal-800">
              {ord.user?.name || "Customer"}
            </span>
          </div>

          {ord.user?.mobile && (
            <a
              href={`tel:${ord.user.mobile}`}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-subtle"
            >
              <Phone className="w-4 h-4" />
              Call Customer
            </a>
          )}
        </div>

        {/* Address & Navigation */}
        <div className="space-y-2">
          <div className="flex items-start gap-2 text-xs text-charcoal-700">
            <MapPin className="w-4 h-4 text-crimson-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-charcoal-800">
                {primaryAddressLine}
                {secondaryAddressLine ? `, ${secondaryAddressLine}` : ""}
              </p>
              {addr.landmark && (
                <p className="text-[11px] text-amberGold-700 font-medium mt-0.5">
                  Landmark: {addr.landmark}
                </p>
              )}
              <p className="text-[11px] text-charcoal-500 mt-0.5">
                {addressCity}{addr.state ? `, ${addr.state}` : ""} - {addressPostal}
              </p>
            </div>
          </div>

          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-cream-200 hover:bg-cream-300 text-charcoal-800 rounded-xl text-xs font-bold transition"
          >
            <Navigation className="w-4 h-4 text-blue-600" />
            Open Turn-by-Turn GPS in Google Maps
            <ExternalLink className="w-3.5 h-3.5 text-charcoal-400" />
          </a>
        </div>
      </div>

      {/* Payment Box */}
      <div
        className={`p-4 rounded-2xl border ${
          isCod
            ? "bg-amberGold-50 border-amberGold-300 text-charcoal-800"
            : "bg-forest-50 border-forest-200 text-forest-800"
        }`}
      >
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider block opacity-75">
              Payment Settlement
            </span>
            <span className="font-bold text-sm">
              {isCod ? "Cash On Delivery (COD)" : "Prepaid Online (Razorpay/UPI)"}
            </span>
          </div>

          <div className="text-right">
            <span className="text-[10px] uppercase font-mono block opacity-75">
              {isCod ? "Collect From Customer" : "Balance Due"}
            </span>
            <span className="text-xl font-mono font-bold">
              {isCod ? formatCurrency(ord.totalMinor) : "₹0 (Paid)"}
            </span>
          </div>
        </div>
      </div>

      {/* Order Package Checklist */}
      <div className="bg-white p-5 rounded-2xl border border-cream-300 shadow-subtle space-y-3">
        <div className="flex items-center gap-2 pb-2 border-b border-cream-200">
          <Package className="w-4 h-4 text-charcoal-500" />
          <h3 className="font-bold text-xs text-charcoal-800">
            Packaged Cuts Checklist ({ord.items.length} item{ord.items.length > 1 ? "s" : ""})
          </h3>
        </div>

        <div className="divide-y divide-cream-100">
          {ord.items.map((item: any) => {
            const prodName = item.productNameSnapshot || item.productName || item.product?.name || "Fresh Item";
            const varName = item.variantNameSnapshot || item.variantName || item.variant?.name || "Standard";
            const price = item.lineTotalMinor ?? (item.unitPriceMinor ? item.unitPriceMinor * item.quantity : (item.priceMinor ? item.priceMinor * item.quantity : 0));
            return (
              <div key={item.id} className="py-2.5 flex items-center justify-between text-xs">
                <div>
                  <span className="font-semibold text-charcoal-800 block">
                    {prodName}
                  </span>
                  <span className="text-[11px] text-charcoal-500">
                    {varName} &bull; Qty: {item.quantity} {item.weightGrams ? `(${item.weightGrams}g each)` : ""}
                  </span>
                </div>
                <span className="font-mono font-semibold text-charcoal-700">
                  {formatCurrency(price)}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Action Buttons Footer */}
      <div className="space-y-3 pt-2">
        {assignment.status === "ASSIGNED" && (
          <button
            onClick={handleStartDelivery}
            disabled={actionLoading}
            className="w-full flex items-center justify-center gap-2 py-4 bg-amberGold-500 hover:bg-amberGold-600 text-charcoal-900 rounded-2xl text-sm font-black shadow-md transition active:scale-[0.99] disabled:opacity-50 uppercase tracking-wider"
          >
            <Bike className="w-5 h-5 text-charcoal-900" />
            {actionLoading ? "Updating..." : "Start Delivery Run (Leave Hub)"}
          </button>
        )}

        {assignment.status === "STARTED" && (
          <button
            onClick={() => setIsDeliverModalOpen(true)}
            disabled={actionLoading}
            className="w-full flex items-center justify-center gap-2.5 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-sm font-black shadow-md transition active:scale-[0.99] disabled:opacity-50 uppercase tracking-wider cursor-pointer"
          >
            <CheckCircle2 className="w-5 h-5 text-white" />
            Confirm Handover & Deliver
          </button>
        )}

        {assignment.status === "DELIVERED" && (
          <div className="p-4 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-2xl text-center text-xs font-bold flex items-center justify-center gap-2 shadow-subtle">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            Order delivered successfully on {new Date(assignment.deliveredAt).toLocaleTimeString()}
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      <Modal
        isOpen={isDeliverModalOpen}
        onClose={() => setIsDeliverModalOpen(false)}
        title="Confirm Order Handover & Settlement"
      >
        <div className="space-y-4">
          <p className="text-xs text-charcoal-600 leading-relaxed">
            Please confirm that the fresh cuts package has been delivered to the customer in hygienic condition.
          </p>

          {isCod && (
            <div className="p-3 bg-amberGold-50 border border-amberGold-300 rounded-xl text-xs text-charcoal-800 space-y-2">
              <div className="flex items-center gap-1.5 text-crimson-800 font-bold">
                <DollarSign className="w-4 h-4" />
                <span>CASH COLLECTION MANDATORY</span>
              </div>
              <p className="text-xs">
                You must collect exactly <strong>{formatCurrency(ord.totalMinor)}</strong> in cash from the customer.
              </p>
              <label className="flex items-center gap-2 pt-1 font-semibold text-charcoal-800 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={codCollectedVerified}
                  onChange={(e) => setCodCollectedVerified(e.target.checked)}
                  className="w-4 h-4 rounded text-forest-600 focus:ring-forest-500 accent-forest-600"
                />
                <span>I confirm I received {formatCurrency(ord.totalMinor)} cash</span>
              </label>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsDeliverModalOpen(false)}
              className="px-4 py-2 border border-cream-300 text-charcoal-600 rounded-xl text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleCompleteDelivery}
              disabled={actionLoading || (isCod && !codCollectedVerified)}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition disabled:opacity-50 shadow-md cursor-pointer"
            >
              {actionLoading
                ? "Completing..."
                : isCod
                ? "Confirm COD Received & Handover Complete"
                : "Confirm Delivery Handover"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
