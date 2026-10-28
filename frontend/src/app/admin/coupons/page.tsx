"use client";

import React, { useState, useEffect } from "react";
import { Tag, Plus, RefreshCw, AlertCircle, CheckCircle2, XCircle, Trash2, Edit3, Users } from "lucide-react";
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
  perUserLimit: number | null;
  isActive: boolean;
  expiresAt: string | null;
  createdAt: string;
  _count?: { redemptions: number };
}

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Coupon | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const defaultForm = {
    code: "",
    type: "FIXED",
    value: 50,
    minimumOrderRupees: "",
    maximumDiscountRupees: "",
    freeDelivery: false,
    usageLimit: "",
    perUserLimit: 1,
    expiresInDays: 30,
    isActive: true,
  };

  const [form, setForm] = useState(defaultForm);

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/coupons");
      if (res.ok) {
        const data = await res.json();
        setCoupons(data.coupons || []);
      }
    } catch (err) {
      console.error("Failed to load coupons:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const openCreateModal = () => {
    setEditingCoupon(null);
    setForm(defaultForm);
    setError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    setForm({
      code: coupon.code,
      type: coupon.type,
      value: coupon.value,
      minimumOrderRupees: coupon.minimumOrderMinor ? String(coupon.minimumOrderMinor / 100) : "",
      maximumDiscountRupees: coupon.maximumDiscountMinor ? String(coupon.maximumDiscountMinor / 100) : "",
      freeDelivery: coupon.freeDelivery,
      usageLimit: coupon.usageLimit ? String(coupon.usageLimit) : "",
      perUserLimit: coupon.perUserLimit ?? 1,
      expiresInDays: coupon.expiresAt
        ? Math.max(1, Math.round((new Date(coupon.expiresAt).getTime() - Date.now()) / (24 * 60 * 60 * 1000)))
        : 30,
      isActive: coupon.isActive,
    });
    setError(null);
    setIsModalOpen(true);
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/admin/coupons/${id}/toggle`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !currentStatus }),
      });
      if (res.ok) {
        setSuccessMessage(`Coupon status updated successfully.`);
        setTimeout(() => setSuccessMessage(null), 3000);
        fetchCoupons();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to toggle status");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteCoupon = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/coupons/${deleteTarget.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to delete coupon");
      }
      setSuccessMessage(`Coupon "${deleteTarget.code}" has been permanently deleted.`);
      setTimeout(() => setSuccessMessage(null), 3500);
      setDeleteTarget(null);
      fetchCoupons();
    } catch (err: any) {
      alert(err.message || "Failed to delete coupon");
    } finally {
      setDeleting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const url = editingCoupon
        ? `/api/admin/coupons/${editingCoupon.id}`
        : "/api/admin/coupons";
      const method = editingCoupon ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to save coupon");
      }

      setIsModalOpen(false);
      setForm(defaultForm);
      setSuccessMessage(
        editingCoupon
          ? `Coupon "${form.code}" updated successfully.`
          : `Coupon "${form.code}" created successfully.`
      );
      setTimeout(() => setSuccessMessage(null), 3500);
      setEditingCoupon(null);
      fetchCoupons();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {successMessage && (
        <div className="p-3 bg-forest-50 border border-forest-200 text-forest-800 text-xs rounded-xl flex items-center gap-2 shadow-subtle animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-forest-600 flex-shrink-0" />
          <span className="font-medium">{successMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-serif font-bold text-charcoal-700">Coupons & Offers</h1>
          <p className="text-xs text-charcoal-400 mt-1">
            Create, disable, delete promotional vouchers and configure user redemption limits.
          </p>
        </div>
        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <button
            onClick={fetchCoupons}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-3.5 py-2.5 sm:py-2 bg-cream-200 hover:bg-cream-300 text-charcoal-700 text-xs font-semibold rounded-xl transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
          <button
            onClick={openCreateModal}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 sm:py-2 bg-crimson-600 hover:bg-crimson-700 text-white text-xs font-semibold rounded-xl shadow-subtle transition"
          >
            <Plus className="w-4 h-4" />
            Add Coupon
          </button>
        </div>
      </div>

      {/* MOBILE VIEW: Touch-friendly Card Layout (< md screens) */}
      <div className="block md:hidden space-y-3">
        {coupons.length === 0 ? (
          <div className="bg-white rounded-2xl border border-cream-300 p-8 text-center text-charcoal-400 text-xs shadow-subtle">
            {loading ? "Loading coupons..." : "No coupons created yet."}
          </div>
        ) : (
          coupons.map((c) => (
            <div
              key={c.id}
              className="bg-white rounded-2xl border border-cream-300 p-4 shadow-subtle space-y-3"
            >
              {/* Header: Code & Status */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Tag className="w-4 h-4 text-amberGold-600 flex-shrink-0" />
                  <span className="font-mono font-bold text-sm text-charcoal-800 bg-cream-100 px-2.5 py-1 rounded-lg border border-cream-300 tracking-wider">
                    {c.code}
                  </span>
                </div>
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
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
                      <XCircle className="w-3 h-3 text-charcoal-400" /> DISABLED
                    </>
                  )}
                </span>
              </div>

              {/* Benefit & Type */}
              <div className="flex items-baseline justify-between border-b border-cream-200 pb-2.5">
                <div>
                  <div className="text-base font-bold text-charcoal-800">
                    {c.type === "PERCENTAGE"
                      ? `${c.value}% OFF`
                      : c.type === "FREE_DELIVERY"
                      ? "FREE DELIVERY"
                      : `₹${c.value} OFF`}
                  </div>
                  <div className="text-[11px] text-charcoal-400 font-medium">{c.type}</div>
                </div>
                <div className="text-right text-[11px] text-charcoal-500 font-mono">
                  Min:{" "}
                  <span className="font-semibold text-charcoal-700">
                    {c.minimumOrderMinor ? formatCurrency(c.minimumOrderMinor) : "None"}
                  </span>
                </div>
              </div>

              {/* Limits and Expiry Grid */}
              <div className="grid grid-cols-2 gap-2 text-xs bg-cream-50/80 p-2.5 rounded-xl border border-cream-200">
                <div>
                  <div className="text-[10px] text-charcoal-400 font-medium">Per Customer</div>
                  <div className="text-xs font-semibold text-charcoal-700 flex items-center gap-1 mt-0.5">
                    <Users className="w-3 h-3 text-charcoal-400" />
                    {c.perUserLimit ? `${c.perUserLimit} use/user` : "1 use/user"}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-charcoal-400 font-medium">Redemptions</div>
                  <div className="text-xs font-mono font-semibold text-charcoal-700 mt-0.5">
                    {c._count?.redemptions || 0} / {c.usageLimit ? c.usageLimit : "∞"}
                  </div>
                </div>
                <div className="col-span-2 pt-1 border-t border-cream-200/60 flex items-center justify-between text-[11px] text-charcoal-500">
                  <span>Expires:</span>
                  <span className="font-mono font-medium text-charcoal-700">
                    {c.expiresAt ? new Date(c.expiresAt).toLocaleDateString() : "Never"}
                  </span>
                </div>
              </div>

              {/* Actions Toolbar */}
              <div className="grid grid-cols-3 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => openEditModal(c)}
                  className="py-2 px-2 bg-cream-100 hover:bg-cream-200 active:bg-cream-300 text-charcoal-700 border border-cream-300 rounded-xl font-semibold text-xs flex items-center justify-center gap-1.5 transition active:scale-95 shadow-xs"
                >
                  <Edit3 className="w-3.5 h-3.5 text-charcoal-600 flex-shrink-0" />
                  <span>Edit</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleToggleActive(c.id, c.isActive)}
                  className={`py-2 px-2 rounded-xl font-semibold text-xs flex items-center justify-center gap-1.5 transition border active:scale-95 shadow-xs ${
                    c.isActive
                      ? "bg-amberGold-50 text-amberGold-800 border-amberGold-300 hover:bg-amberGold-100"
                      : "bg-forest-50 text-forest-800 border-forest-300 hover:bg-forest-100"
                  }`}
                >
                  {c.isActive ? (
                    <>
                      <XCircle className="w-3.5 h-3.5 text-amberGold-600 flex-shrink-0" />
                      <span>Disable</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-forest-600 flex-shrink-0" />
                      <span>Enable</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteTarget(c)}
                  className="py-2 px-2 bg-crimson-50 hover:bg-crimson-100 active:bg-crimson-200 text-crimson-700 border border-crimson-200 rounded-xl font-semibold text-xs flex items-center justify-center gap-1.5 transition active:scale-95 shadow-xs"
                >
                  <Trash2 className="w-3.5 h-3.5 text-crimson-600 flex-shrink-0" />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* DESKTOP VIEW: Full Data Table (>= md screens) */}
      <div className="hidden md:block bg-white rounded-2xl border border-cream-300 overflow-hidden shadow-subtle">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[760px]">
            <thead className="bg-cream-100 text-charcoal-500 font-semibold border-b border-cream-200 whitespace-nowrap">
              <tr>
                <th className="px-5 py-4">Coupon Code</th>
                <th className="px-5 py-4">Type & Benefit</th>
                <th className="px-5 py-4">Min Order</th>
                <th className="px-5 py-4">Redemption Limits</th>
                <th className="px-5 py-4">Expires</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cream-200">
              {coupons.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-charcoal-400">
                    {loading ? "Loading coupons..." : "No coupons created yet."}
                  </td>
                </tr>
              ) : (
                coupons.map((c) => (
                  <tr key={c.id} className="hover:bg-cream-50/60 transition">
                    {/* Code */}
                    <td className="px-5 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Tag className="w-3.5 h-3.5 text-amberGold-600 flex-shrink-0" />
                        <span className="font-mono font-bold text-charcoal-800 bg-cream-200/80 px-2.5 py-1 rounded-lg border border-cream-300 tracking-wider">
                          {c.code}
                        </span>
                      </div>
                    </td>

                    {/* Benefit */}
                    <td className="px-5 py-4 whitespace-nowrap">
                      <div className="font-semibold text-charcoal-700">
                        {c.type === "PERCENTAGE"
                          ? `${c.value}% OFF`
                          : c.type === "FREE_DELIVERY"
                          ? "FREE DELIVERY"
                          : `₹${c.value} OFF`}
                      </div>
                      <div className="text-[10px] text-charcoal-400">{c.type}</div>
                    </td>

                    {/* Min Order */}
                    <td className="px-5 py-4 font-mono text-charcoal-600 whitespace-nowrap">
                      {c.minimumOrderMinor ? formatCurrency(c.minimumOrderMinor) : "None"}
                    </td>

                    {/* Limits */}
                    <td className="px-5 py-4 whitespace-nowrap">
                      <div className="flex flex-col gap-0.5">
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-charcoal-700">
                          <Users className="w-3 h-3 text-charcoal-400 flex-shrink-0" />
                          <span className="font-semibold">{c.perUserLimit ? `${c.perUserLimit} use/user` : "1 use/user"}</span>
                        </span>
                        <span className="text-[10px] font-mono text-charcoal-400">
                          Total: {c._count?.redemptions || 0} / {c.usageLimit ? c.usageLimit : "Unlimited"}
                        </span>
                      </div>
                    </td>

                    {/* Expires */}
                    <td className="px-5 py-4 text-charcoal-500 font-mono text-[11px] whitespace-nowrap">
                      {c.expiresAt ? new Date(c.expiresAt).toLocaleDateString() : "Never"}
                    </td>

                    {/* Status */}
                    <td className="px-5 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          c.isActive
                            ? "bg-forest-50 text-forest-700 border border-forest-200"
                            : "bg-charcoal-100 text-charcoal-500 border border-charcoal-200"
                        }`}
                      >
                        {c.isActive ? (
                          <>
                            <CheckCircle2 className="w-3 h-3 text-forest-600 flex-shrink-0" /> ACTIVE
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3 h-3 text-charcoal-400 flex-shrink-0" /> DISABLED
                          </>
                        )}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2 flex-nowrap">
                        {/* Edit Button */}
                        <button
                          type="button"
                          onClick={() => openEditModal(c)}
                          title="Edit coupon and redemption limits"
                          className="w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-lg border border-cream-300 text-charcoal-600 hover:bg-cream-200 hover:text-charcoal-800 transition shadow-xs"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>

                        {/* Toggle Disable/Enable */}
                        <button
                          type="button"
                          onClick={() => handleToggleActive(c.id, c.isActive)}
                          className={`h-8 px-3 flex-shrink-0 rounded-lg text-[11px] font-semibold transition border flex items-center gap-1 shadow-xs ${
                            c.isActive
                              ? "bg-amberGold-50 text-amberGold-700 border-amberGold-200 hover:bg-amberGold-100"
                              : "bg-forest-50 text-forest-700 border-forest-200 hover:bg-forest-100"
                          }`}
                        >
                          {c.isActive ? "Disable" : "Enable"}
                        </button>

                        {/* Delete Button */}
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(c)}
                          title="Delete coupon"
                          className="w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-lg border border-crimson-200 text-crimson-600 hover:bg-crimson-50 hover:border-crimson-300 transition shadow-xs"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Coupon Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCoupon ? `Edit Coupon: ${editingCoupon.code}` : "Create Promotional Coupon"}
      >
        <form onSubmit={handleSubmit} className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
          {error && (
            <div className="p-3 bg-crimson-50 border border-crimson-200 text-crimson-700 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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

          {/* Redemption Limits Section */}
          <div className="p-3 bg-cream-100/60 rounded-xl border border-cream-200 space-y-3">
            <div className="text-xs font-bold text-charcoal-800 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-amberGold-600" />
              Redemption Limits
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-charcoal-700 mb-1">
                  User Redemption Limit *
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={form.perUserLimit}
                  onChange={(e) => setForm({ ...form, perUserLimit: parseInt(e.target.value, 10) || 1 })}
                  placeholder="e.g. 1"
                  className="w-full px-3 py-2 bg-white border border-cream-300 rounded-xl text-xs font-mono text-charcoal-800 focus:outline-none focus:border-amberGold-500"
                />
                <p className="text-[10px] text-charcoal-400 mt-1">
                  Max times a single customer can redeem this code.
                </p>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-charcoal-700 mb-1">
                  Total Overall Usage Limit
                </label>
                <input
                  type="number"
                  min="1"
                  value={form.usageLimit}
                  onChange={(e) => setForm({ ...form, usageLimit: e.target.value })}
                  placeholder="Leave empty for unlimited"
                  className="w-full px-3 py-2 bg-white border border-cream-300 rounded-xl text-xs font-mono text-charcoal-800 focus:outline-none focus:border-amberGold-500"
                />
                <p className="text-[10px] text-charcoal-400 mt-1">
                  Total overall uses across the entire store.
                </p>
              </div>
            </div>
          </div>

          {/* Active status checkbox in edit mode */}
          {editingCoupon && (
            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="isActiveCheckbox"
                checked={form.isActive}
                onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                className="w-4 h-4 text-forest-600 rounded border-cream-300 focus:ring-amberGold-500"
              />
              <label htmlFor="isActiveCheckbox" className="text-xs font-semibold text-charcoal-700 cursor-pointer">
                Coupon is Active (uncheck to disable)
              </label>
            </div>
          )}

          <div className="pt-2 flex flex-col-reverse sm:flex-row sm:justify-end gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="w-full sm:w-auto px-4 py-2.5 sm:py-2 border border-cream-300 text-charcoal-600 rounded-xl text-xs font-semibold hover:bg-cream-100 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="w-full sm:w-auto px-5 py-2.5 sm:py-2 bg-crimson-600 hover:bg-crimson-700 text-white rounded-xl text-xs font-semibold transition disabled:opacity-50"
            >
              {submitting
                ? "Saving..."
                : editingCoupon
                ? "Save Changes"
                : "Create Coupon"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title="Confirm Delete Coupon"
      >
        <div className="space-y-4">
          <div className="p-3 bg-crimson-50 border border-crimson-200 text-crimson-800 text-xs rounded-xl flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-crimson-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">
                Are you sure you want to permanently delete coupon{" "}
                <span className="font-mono underline">{deleteTarget?.code}</span>?
              </p>
              <p className="text-[11px] text-crimson-700 mt-1">
                Past customer orders referencing this coupon will be safely preserved, but new orders will not be able to apply it. This action cannot be reversed.
              </p>
            </div>
          </div>

          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 sm:gap-3 pt-2">
            <button
              type="button"
              disabled={deleting}
              onClick={() => setDeleteTarget(null)}
              className="w-full sm:w-auto px-4 py-2.5 sm:py-2 border border-cream-300 text-charcoal-600 rounded-xl text-xs font-semibold hover:bg-cream-100 transition"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={deleting}
              onClick={handleDeleteCoupon}
              className="w-full sm:w-auto px-4 py-2.5 sm:py-2 bg-crimson-600 hover:bg-crimson-700 text-white rounded-xl text-xs font-semibold transition disabled:opacity-50 flex items-center justify-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              {deleting ? "Deleting..." : "Delete Coupon"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}


