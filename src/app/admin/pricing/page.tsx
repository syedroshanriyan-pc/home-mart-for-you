"use client";

import React, { useState, useEffect } from "react";
import { DollarSign, Save, RefreshCw, TrendingUp, AlertCircle, CheckCircle2 } from "lucide-react";
import { formatCurrency } from "@/lib/delivery";

interface Variant {
  id: string;
  name: string;
  priceMinor: number;
  weightGrams?: number;
  quantityValue?: number;
  quantityUnit?: string;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  category: { name: string };
  variants: Variant[];
  updatedAt: string;
}

export default function AdminPricingPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [prices, setPrices] = useState<Record<string, number>>({}); // variantId -> rupees
  const [savingId, setSavingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ id: string; type: "success" | "error"; msg: string } | null>(null);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/products");
      if (res.ok) {
        const data = await res.json();
        setProducts(data.products || []);
        // Initialize prices in rupees
        const initialPrices: Record<string, number> = {};
        (data.products || []).forEach((p: Product) => {
          p.variants.forEach((v) => {
            initialPrices[v.id] = Math.round(v.priceMinor / 100);
          });
        });
        setPrices(initialPrices);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handlePriceChange = (variantId: string, val: number) => {
    setPrices((prev) => ({ ...prev, [variantId]: Math.max(0, val) }));
  };

  const adjustPrice = (variantId: string, delta: number) => {
    setPrices((prev) => ({
      ...prev,
      [variantId]: Math.max(0, (prev[variantId] || 0) + delta),
    }));
  };

  const savePrice = async (productId: string, variantId: string) => {
    setSavingId(variantId);
    setFeedback(null);
    try {
      const rupees = prices[variantId];
      const res = await fetch(`/api/admin/products/${productId}/price`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          variantId,
          newPriceRupees: rupees,
          newPriceMinor: rupees * 100,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to update price");
      }

      setFeedback({ id: variantId, type: "success", msg: "Price updated" });
      setTimeout(() => setFeedback(null), 3000);
    } catch (err: any) {
      setFeedback({ id: variantId, type: "error", msg: err.message });
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-charcoal-700">Daily Pricing Board</h1>
          <p className="text-xs text-charcoal-400 mt-1">
            Update fresh market chicken prices per cut/variant. Updates apply instantly to new orders.
          </p>
        </div>
        <button
          onClick={fetchProducts}
          className="flex items-center gap-2 px-4 py-2 bg-cream-200 hover:bg-cream-300 text-charcoal-700 text-xs font-semibold rounded-xl transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          Refresh Catalog
        </button>
      </div>

      {/* Info Callout */}
      <div className="p-4 bg-amberGold-50 border border-amberGold-200 rounded-2xl flex items-start gap-3">
        <TrendingUp className="w-5 h-5 text-amberGold-600 flex-shrink-0 mt-0.5" />
        <div className="text-xs text-charcoal-600">
          <p className="font-semibold text-charcoal-800">Mandi Price Index Management</p>
          <p className="mt-0.5">
            Use the +/- buttons to adjust morning daily fluctuations across chicken cuts. All price changes are logged to the compliance audit trail.
          </p>
        </div>
      </div>

      {/* Products Pricing Table */}
      <div className="bg-white rounded-2xl border border-cream-300 overflow-hidden shadow-subtle">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-cream-100 text-charcoal-500 font-semibold border-b border-cream-200">
              <tr>
                <th className="px-6 py-4">Product Cut</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Variant Weight</th>
                <th className="px-6 py-4">Current Price</th>
                <th className="px-6 py-4">Quick Adjust</th>
                <th className="px-6 py-4">New Price (₹)</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cream-200">
              {products.flatMap((prod) =>
                prod.variants.map((variant) => {
                  const currentRupees = Math.round(variant.priceMinor / 100);
                  const editedRupees = prices[variant.id] ?? currentRupees;
                  const isModified = editedRupees !== currentRupees;
                  const itemFeedback = feedback?.id === variant.id ? feedback : null;

                  return (
                    <tr key={variant.id} className="hover:bg-cream-50/60 transition">
                      <td className="px-6 py-4 font-semibold text-charcoal-800">
                        {prod.name}
                      </td>
                      <td className="px-6 py-4 text-charcoal-500">
                        {prod.category?.name || "General"}
                      </td>
                      <td className="px-6 py-4 text-charcoal-600 font-mono">
                        {variant.name} {variant.quantityValue ? `(${variant.quantityValue}${variant.quantityUnit || "g"})` : ""}
                      </td>
                      <td className="px-6 py-4 font-mono font-semibold text-charcoal-700">
                        {formatCurrency(variant.priceMinor)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => adjustPrice(variant.id, -10)}
                            className="px-2 py-1 bg-cream-200 hover:bg-cream-300 text-[10px] font-bold rounded-lg text-charcoal-700"
                            title="-₹10"
                          >
                            -10
                          </button>
                          <button
                            type="button"
                            onClick={() => adjustPrice(variant.id, -5)}
                            className="px-2 py-1 bg-cream-200 hover:bg-cream-300 text-[10px] font-bold rounded-lg text-charcoal-700"
                            title="-₹5"
                          >
                            -5
                          </button>
                          <button
                            type="button"
                            onClick={() => adjustPrice(variant.id, 5)}
                            className="px-2 py-1 bg-cream-200 hover:bg-cream-300 text-[10px] font-bold rounded-lg text-charcoal-700"
                            title="+₹5"
                          >
                            +5
                          </button>
                          <button
                            type="button"
                            onClick={() => adjustPrice(variant.id, 10)}
                            className="px-2 py-1 bg-cream-200 hover:bg-cream-300 text-[10px] font-bold rounded-lg text-charcoal-700"
                            title="+₹10"
                          >
                            +10
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="relative w-28">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-charcoal-400 font-mono">
                            ₹
                          </span>
                          <input
                            type="number"
                            min="0"
                            step="1"
                            value={editedRupees}
                            onChange={(e) =>
                              handlePriceChange(variant.id, parseInt(e.target.value, 10) || 0)
                            }
                            className={`w-full pl-7 pr-3 py-1.5 rounded-xl border text-xs font-mono font-bold outline-none transition ${
                              isModified
                                ? "border-amberGold-500 bg-amberGold-50 text-charcoal-800"
                                : "border-cream-300 bg-white text-charcoal-700"
                            }`}
                          />
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {itemFeedback && (
                            <span
                              className={`text-[10px] flex items-center gap-1 font-semibold ${
                                itemFeedback.type === "success"
                                  ? "text-forest-600"
                                  : "text-crimson-600"
                              }`}
                            >
                              {itemFeedback.type === "success" ? (
                                <CheckCircle2 className="w-3.5 h-3.5" />
                              ) : (
                                <AlertCircle className="w-3.5 h-3.5" />
                              )}
                              {itemFeedback.msg}
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={() => savePrice(prod.id, variant.id)}
                            disabled={savingId === variant.id || !isModified}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                              isModified
                                ? "bg-forest-600 hover:bg-forest-700 text-white shadow-subtle"
                                : "bg-cream-200 text-charcoal-400 cursor-not-allowed"
                            }`}
                          >
                            <Save className="w-3.5 h-3.5" />
                            {savingId === variant.id ? "Saving..." : "Save"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
