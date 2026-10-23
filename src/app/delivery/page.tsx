"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Bike, Navigation, Phone, CheckCircle2, Clock, DollarSign, ChevronRight, Package, RefreshCw } from "lucide-react";
import { formatCurrency } from "@/lib/delivery";

interface Assignment {
  id: string;
  status: "ASSIGNED" | "STARTED" | "DELIVERED" | "CANCELLED";
  assignedAt: string;
  startedAt: string | null;
  deliveredAt: string | null;
  order: {
    id: string;
    orderNumber: string;
    status: string;
    totalMinor: number;
    deliveryAddressSnapshot: string;
    paymentMethod: "COD" | "ONLINE";
    paymentStatus: string;
    placedAt: string;
    user: {
      name: string;
      mobile: string;
    };
    items: {
      id: string;
      productName: string;
      variantName: string;
      quantity: number;
      weightGrams: number;
    }[];
  };
}

export default function DeliveryDashboardPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"ACTIVE" | "COMPLETED">("ACTIVE");

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/delivery/assignments");
      if (res.ok) {
        const data = await res.json();
        setAssignments(data.assignments || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, []);

  const activeRuns = assignments.filter((a) => a.status === "ASSIGNED" || a.status === "STARTED");
  const completedRuns = assignments.filter((a) => a.status === "DELIVERED");

  // Calculate COD cash collected today that needs remittance
  const codCollectedMinor = completedRuns
    .filter((a) => a.order?.paymentMethod === "COD")
    .reduce((sum, a) => sum + (a.order?.totalMinor || 0), 0);

  return (
    <div className="space-y-5">
      {/* Metric Cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white p-3.5 rounded-2xl border border-cream-300 shadow-subtle text-center">
          <span className="text-[10px] uppercase font-bold text-charcoal-400 block tracking-wider">
            Active Runs
          </span>
          <span className="text-xl font-mono font-bold text-crimson-600 mt-1 block">
            {activeRuns.length}
          </span>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-cream-300 shadow-subtle text-center">
          <span className="text-[10px] uppercase font-bold text-charcoal-400 block tracking-wider">
            Delivered Today
          </span>
          <span className="text-xl font-mono font-bold text-forest-600 mt-1 block">
            {completedRuns.length}
          </span>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-cream-300 shadow-subtle text-center">
          <span className="text-[10px] uppercase font-bold text-charcoal-400 block tracking-wider">
            Cash Remittance
          </span>
          <span className="text-xl font-mono font-bold text-amberGold-600 mt-1 block">
            {formatCurrency(codCollectedMinor)}
          </span>
        </div>
      </div>

      {/* Tabs & Refresh */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <button
            onClick={() => setTab("ACTIVE")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              tab === "ACTIVE"
                ? "bg-charcoal-700 text-cream-50 shadow-subtle"
                : "bg-cream-200 text-charcoal-600 hover:bg-cream-300"
            }`}
          >
            Active Runs ({activeRuns.length})
          </button>
          <button
            onClick={() => setTab("COMPLETED")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              tab === "COMPLETED"
                ? "bg-charcoal-700 text-cream-50 shadow-subtle"
                : "bg-cream-200 text-charcoal-600 hover:bg-cream-300"
            }`}
          >
            History ({completedRuns.length})
          </button>
        </div>

        <button
          onClick={fetchAssignments}
          className="p-2 bg-cream-200 hover:bg-cream-300 rounded-xl text-charcoal-600 transition"
          title="Refresh assignments"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* List */}
      <div className="space-y-4">
        {(tab === "ACTIVE" ? activeRuns : completedRuns).length === 0 ? (
          <div className="bg-white p-12 rounded-2xl border border-cream-300 text-center shadow-subtle space-y-2">
            <Bike className="w-10 h-10 text-charcoal-300 mx-auto" />
            <p className="text-xs font-semibold text-charcoal-600">
              {tab === "ACTIVE"
                ? "No delivery assignments currently active."
                : "No completed runs recorded today."}
            </p>
            <p className="text-[11px] text-charcoal-400">
              {tab === "ACTIVE"
                ? "Stay on duty to receive incoming orders assigned by the hub dispatcher."
                : "Completed delivery records will appear here after customer handover."}
            </p>
          </div>
        ) : (
          (tab === "ACTIVE" ? activeRuns : completedRuns).map((assignment) => {
            const ord = assignment.order;
            if (!ord) return null;

            let parsedAddr: any = null;
            try {
              parsedAddr = typeof ord.deliveryAddressSnapshot === "string" ? JSON.parse(ord.deliveryAddressSnapshot) : ord.deliveryAddressSnapshot;
            } catch (e) {
              parsedAddr = { addressLine: ord.deliveryAddressSnapshot };
            }

            const isCod = ord.paymentMethod === "COD";
            const displayAddress = parsedAddr?.addressLine || parsedAddr?.line1 || (typeof parsedAddr === "string" ? parsedAddr : "Delivery Address");
            const displayLocality = parsedAddr?.locality || parsedAddr?.line2 || "";
            const displayLandmark = parsedAddr?.landmark ? ` (Near: ${parsedAddr.landmark})` : "";
            const totalWeightGrams = (ord.items || []).reduce((sum, item) => sum + ((item.weightGrams || 0) * (item.quantity || 1)), 0);
            const totalWeightKg = totalWeightGrams / 1000;

            return (
              <div
                key={assignment.id}
                className="bg-white rounded-2xl border border-cream-300 shadow-subtle overflow-hidden"
              >
                {/* Header status bar */}
                <div className="p-4 bg-cream-50 border-b border-cream-200 flex items-center justify-between">
                  <div>
                    <span className="font-mono font-bold text-sm text-charcoal-800">
                      Order #{ord.orderNumber}
                    </span>
                    <span className="text-[10px] text-charcoal-400 block font-mono">
                      Placed: {new Date(ord.placedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>

                  <span
                    className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase ${
                      assignment.status === "STARTED"
                        ? "bg-amberGold-100 text-amberGold-800 border border-amberGold-300 animate-pulse"
                        : assignment.status === "DELIVERED"
                        ? "bg-forest-100 text-forest-800 border border-forest-300"
                        : "bg-blue-100 text-blue-800 border border-blue-300"
                    }`}
                  >
                    {assignment.status === "STARTED"
                      ? "OUT FOR DELIVERY"
                      : assignment.status === "ASSIGNED"
                      ? "READY FOR PICKUP"
                      : "DELIVERED"}
                  </span>
                </div>

                {/* Card Content */}
                <div className="p-4 space-y-3">
                  {/* Customer info */}
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-xs font-bold text-charcoal-800 block">
                        {ord.user?.name || "Customer"}
                      </span>
                      <p className="text-[11px] text-charcoal-500 line-clamp-2 mt-0.5">
                        {displayAddress}
                        {displayLocality ? `, ${displayLocality}` : ""}
                        {displayLandmark}
                      </p>
                    </div>

                    {ord.user?.mobile && (
                      <a
                        href={`tel:${ord.user.mobile}`}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-forest-50 hover:bg-forest-100 border border-forest-200 text-forest-700 text-xs font-bold rounded-xl transition"
                      >
                        <Phone className="w-3.5 h-3.5" /> Call
                      </a>
                    )}
                  </div>

                  {/* Payment Callout */}
                  <div
                    className={`p-3 rounded-xl flex items-center justify-between text-xs ${
                      isCod
                        ? "bg-crimson-50 border border-crimson-200 text-crimson-800"
                        : "bg-forest-50 border border-forest-200 text-forest-800"
                    }`}
                  >
                    <span className="font-semibold flex items-center gap-1.5">
                      <DollarSign className="w-4 h-4" />
                      {isCod ? "COLLECT CASH ON DELIVERY" : "ONLINE PREPAID"}
                    </span>
                    <span className="font-mono font-bold text-sm">
                      {isCod ? formatCurrency(ord.totalMinor) : "PAID ₹0"}
                    </span>
                  </div>

                  {/* Items summary */}
                  <div className="pt-2 border-t border-cream-200 flex items-center justify-between text-xs text-charcoal-500">
                    <span className="flex items-center gap-1">
                      <Package className="w-3.5 h-3.5 text-charcoal-400" />
                      {(ord.items || []).length} item(s){totalWeightKg > 0 ? ` • ${totalWeightKg.toFixed(2)} kg` : ""}
                    </span>

                    <Link
                      href={`/delivery/orders/${assignment.id}`}
                      className="flex items-center gap-1 font-semibold text-crimson-600 hover:text-crimson-700 hover:underline"
                    >
                      View Details & Action <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
