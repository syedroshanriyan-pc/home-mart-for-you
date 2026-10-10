"use client";

import React, { useState, useEffect } from "react";
import { Tag, Plus, RefreshCw, AlertCircle, CheckCircle2, XCircle } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { formatCurrency } from "@/lib/delivery";

interface Coupon {
  id: string;
  code: string;
  type: string;
  value: number;
  minimumOrderMinor: number | null;
  maximumDiscountMinor: number | null;
  freeDelivery: boolean;
  usageLimit: number | null;
  isActive: boolean;
  expiresAt: string | null;
  createdAt: string;
  _count?: { redemptions: number };
}

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    code: "",
    type: "FIXED",
    value: 50,
    minimumOrderRupees: "",
    maximumDiscountRupees: "",
    freeDelivery: false,
    usageLimit: "",
    perUserLimit: 1,
    expiresInDays: 30,
  });

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/coupons");
      if (res.ok) {
        const data = await res.json();
        setCoupons(data.coupons || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/admin/coupons/${id}/toggle`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !currentStatus }),
      });
      if (res.ok) {
        fetchCoupons();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to create coupon");
      }

      setIsModalOpen(false);
      setForm({
        code: "",
        type: "FIXED",
        value: 50,
        minimumOrderRupees: "",
        maximumDiscountRupees: "",
        freeDelivery: false,
        usageLimit: "",
        perUserLimit: 1,
        expiresInDays: 30,
      });
      fetchCoupons();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-charcoal-700">Coupons & Offers</h1>
          <p className="text-xs text-charcoal-400 mt-1">
            Create and monitor promotional vouchers, first-order discounts, and festival coupons.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchCoupons}
            className="flex items-center gap-2 px-3 py-2 bg-cream-200 hover:bg-cream-300 text-charcoal-700 text-xs font-semibold rounded-xl transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-crimson-600 hover:bg-crimson-700 text-white text-xs font-semibold rounded-xl shadow-subtle transition"
          >
            <Plus className="w-4 h-4" />
            Create Coupon
          </button>
        </div>
      </div>

      {/* Coupons Table */}
      <div className="bg-white rounded-2xl border border-cream-300 overflow-hidden shadow-subtle">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-cream-100 text-charcoal-500 font-semibold border-b border-cream-200">
              <tr>
                <th className="px-6 py-4">Coupon Code</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Benefit</th>
                <th className="px-6 py-4">Min Order</th>
                <th className="px-6 py-4">Redemptions</th>
                <th className="px-6 py-4">Expires</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cream-200">
              {coupons.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-charcoal-400">
                    {loading ? "Loading coupons..." : "No coupons created yet."}
                  </td>
                </tr>
              ) : (
                coupons.map((c) => (
                  <tr key={c.id} className="hover:bg-cream-50/60 transition">
                    <td className="px-6 py-4">
                      <span className="font-mono font-bold text-charcoal-800 bg-cream-200/80 px-2.5 py-1 rounded-lg border border-cream-300 tracking-wider">
                        {c.code}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-charcoal-500 font-medium">
                      {c.type}
                    </td>
                    <td className="px-6 py-4 font-semibold text-charcoal-700">
                      {c.type === "PERCENTAGE"
                        ? `${c.value}% OFF`
                        : c.type === "FREE_DELIVERY"
                        ? "FREE DELIVERY"
                        : `₹${c.value} OFF`}
                    </td>
                    <td className="px-6 py-4 font-mono text-charcoal-600">
                      {c.minimumOrderMinor ? formatCurrency(c.minimumOrderMinor) : "None"}
                    </td>
                    <td className="px-6 py-4 font-mono text-charcoal-600">
                      {c._count?.redemptions || 0} {c.usageLimit ? `/ ${c.usageLimit}` : ""}
                    </td>
                    <td className="px-6 py-4 text-charcoal-500 font-mono text-[11px]">
                      {c.expiresAt ? new Date(c.expiresAt).toLocaleDateString() : "Never"}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          c.isActive
                            ? "bg-forest-50 text-forest-700 border border-forest-200"
                            : "bg-charcoal-100 text-charcoal-500 border border-charcoal-200"
                        }`}
                      >
                        {c.isActive ? (
                          <>
                            <CheckCircle2 className="w-3 h-3 text-forest-600" /> ACTIVE
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3 h-3 text-charcoal-400" /> INACTIVE
                          </>
                        )}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleToggleActive(c.id, c.isActive)}
                        className={`px-3 py-1 rounded-xl text-[11px] font-semibold transition ${
                          c.isActive
                            ? "bg-cream-200 text-charcoal-600 hover:bg-cream-300"
                            : "bg-forest-100 text-forest-700 hover:bg-forest-200"
                        }`}
                      >
                        {c.isActive ? "Deactivate" : "Activate"}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Coupon Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create Promotional Coupon"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-crimson-50 border border-crimson-200 text-crimson-700 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                Coupon Code *
              </label>
              <input
                type="text"
                required
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                placeholder="e.g. WELCOME50"
                className="w-full px-3.5 py-2.5 bg-cream-50 border border-cream-300 rounded-xl text-xs font-mono font-bold tracking-wider text-charcoal-800 focus:outline-none focus:border-amberGold-500 uppercase"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                Discount Type *
              </label>
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-cream-50 border border-cream-300 rounded-xl text-xs text-charcoal-800 focus:outline-none focus:border-amberGold-500"
              >
                <option value="FIXED">Fixed Amount (₹)</option>
                <option value="PERCENTAGE">Percentage (%)</option>
                <option value="FREE_DELIVERY">Free Delivery</option>
                <option value="MIN_ORDER_FIXED">Min Order Fixed (₹)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                Discount Value ({form.type === "PERCENTAGE" ? "%" : "₹"}) *
              </label>
              <input
                type="number"
                min="0"
                required
                value={form.value}
                onChange={(e) => setForm({ ...form, value: parseInt(e.target.value, 10) || 0 })}
                className="w-full px-3.5 py-2.5 bg-cream-50 border border-cream-300 rounded-xl text-xs font-mono text-charcoal-800 focus:outline-none focus:border-amberGold-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                Min Order Amount (₹)
              </label>
              <input
                type="number"
                min="0"
                value={form.minimumOrderRupees}
                onChange={(e) => setForm({ ...form, minimumOrderRupees: e.target.value })}
                placeholder="Optional"
                className="w-full px-3.5 py-2.5 bg-cream-50 border border-cream-300 rounded-xl text-xs font-mono text-charcoal-800 focus:outline-none focus:border-amberGold-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                Max Discount Cap (₹)
              </label>
              <input
                type="number"
                min="0"
                value={form.maximumDiscountRupees}
                onChange={(e) => setForm({ ...form, maximumDiscountRupees: e.target.value })}
                placeholder="Optional (e.g. 100)"
                className="w-full px-3.5 py-2.5 bg-cream-50 border border-cream-300 rounded-xl text-xs font-mono text-charcoal-800 focus:outline-none focus:border-amberGold-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                Validity (Days)
              </label>
              <input
                type="number"
                min="1"
                value={form.expiresInDays}
                onChange={(e) => setForm({ ...form, expiresInDays: parseInt(e.target.value, 10) || 30 })}
                className="w-full px-3.5 py-2.5 bg-cream-50 border border-cream-300 rounded-xl text-xs font-mono text-charcoal-800 focus:outline-none focus:border-amberGold-500"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 border border-cream-300 text-charcoal-600 rounded-xl text-xs font-semibold hover:bg-cream-100 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 bg-crimson-600 hover:bg-crimson-700 text-white rounded-xl text-xs font-semibold transition disabled:opacity-50"
            >
              {submitting ? "Saving..." : "Create Coupon"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
