"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Badge } from "@/components/ui/Badge";
import { Check, X, Search, CheckCircle2, AlertCircle } from "lucide-react";

export default function AdminInventoryPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/products");
      if (res.ok) {
        const d = await res.json();
        setProducts(d.products || []);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const handleToggleStock = async (productId: string) => {
    setTogglingId(productId);
    try {
      const res = await fetch(`/api/admin/products/${productId}/toggle-availability`, {
        method: "POST",
      });
      if (res.ok) {
        await fetchInventory();
      }
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-bold text-charcoal-800">
          Manual Inventory Stock Control
        </h1>
        <p className="text-xs text-charcoal-500 mt-0.5">
          One-click instant stock toggling. Out-of-stock items are automatically disabled for customers across web and mobile.
        </p>
      </div>

      <div className="bg-cream-50 rounded-2xl border border-cream-200 shadow-subtle overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-charcoal-400">Loading stock status...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-cream-200 bg-cream-100/50 text-[11px] uppercase text-charcoal-500 font-semibold">
                  <th className="py-3 px-4">Product Name</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Available Portions</th>
                  <th className="py-3 px-4">Current Status</th>
                  <th className="py-3 px-4 text-right">Instant Switch</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cream-100">
                {products.map((p) => (
                  <tr key={p.id} className="hover:bg-cream-100/50 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-charcoal-800">
                      {p.name}
                    </td>
                    <td className="py-3.5 px-4 text-charcoal-600 font-medium">
                      {p.category?.name}
                    </td>
                    <td className="py-3.5 px-4 text-charcoal-500">
                      {p.variants.map((v: any) => v.name).join(", ")}
                    </td>
                    <td className="py-3.5 px-4">
                      {p.isAvailable ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-emerald-50 text-emerald-800 border border-emerald-300">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          IN STOCK
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-stone-200 text-stone-700 border border-stone-300">
                          OUT OF STOCK
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleToggleStock(p.id)}
                        disabled={togglingId === p.id}
                        className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all shadow-subtle disabled:opacity-50 ${
                          p.isAvailable
                            ? "bg-stone-200 hover:bg-stone-300 text-stone-800 border border-stone-300"
                            : "bg-emerald-600 hover:bg-emerald-700 text-cream-50"
                        }`}
                      >
                        {p.isAvailable ? "Set to OUT OF STOCK" : "Set to IN STOCK"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
