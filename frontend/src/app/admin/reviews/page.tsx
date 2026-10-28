"use client";

import React, { useState, useEffect } from "react";
import { Star, RefreshCw, CheckCircle2, EyeOff, Check, X, MessageSquare } from "lucide-react";

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  status: "PUBLISHED" | "HIDDEN" | "PENDING";
  createdAt: string;
  user: {
    name: string;
    mobile: string;
  };
  order: {
    orderNumber: string;
    totalMinor: number;
  };
}

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/reviews");
      if (res.ok) {
        const data = await res.json();
        setReviews(data.reviews || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const updateStatus = async (id: string, newStatus: "PUBLISHED" | "HIDDEN") => {
    setActionLoading(id);
    try {
      const res = await fetch(`/api/admin/reviews/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setReviews((prev) =>
          prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r))
        );
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-charcoal-700">Review Moderation</h1>
          <p className="text-xs text-charcoal-400 mt-1">
            Review and moderate customer feedback, ratings, and culinary reviews.
          </p>
        </div>
        <button
          onClick={fetchReviews}
          className="flex items-center gap-2 px-3 py-2 bg-cream-200 hover:bg-cream-300 text-charcoal-700 text-xs font-semibold rounded-xl transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Reviews Table */}
      <div className="bg-white rounded-2xl border border-cream-300 overflow-hidden shadow-subtle">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-cream-100 text-charcoal-500 font-semibold border-b border-cream-200">
              <tr>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Rating</th>
                <th className="px-6 py-4">Customer Comment</th>
                <th className="px-6 py-4">Order Ref</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Moderation Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cream-200">
              {reviews.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-charcoal-400">
                    {loading ? "Loading customer reviews..." : "No reviews submitted yet."}
                  </td>
                </tr>
              ) : (
                reviews.map((r) => (
                  <tr key={r.id} className="hover:bg-cream-50/60 transition">
                    <td className="px-6 py-4">
                      <div>
                        <span className="font-semibold text-charcoal-800 block">
                          {r.user?.name || "Customer"}
                        </span>
                        <span className="text-[10px] text-charcoal-400 font-mono">
                          {r.user?.mobile}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 text-amberGold-500">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3.5 h-3.5 ${
                              i < r.rating ? "fill-current" : "text-cream-300"
                            }`}
                          />
                        ))}
                        <span className="font-bold font-mono ml-1 text-charcoal-700">
                          {r.rating}.0
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 max-w-sm">
                      <p className="text-charcoal-700 italic">
                        {r.comment ? `"${r.comment}"` : <span className="text-charcoal-400 not-italic">No comment provided</span>}
                      </p>
                    </td>
                    <td className="px-6 py-4 font-mono font-semibold text-charcoal-600">
                      #{r.order?.orderNumber}
                    </td>
                    <td className="px-6 py-4 font-mono text-charcoal-500 text-[11px]">
                      {new Date(r.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          r.status === "PUBLISHED"
                            ? "bg-forest-50 text-forest-700 border border-forest-200"
                            : r.status === "HIDDEN"
                            ? "bg-charcoal-100 text-charcoal-600 border border-charcoal-200"
                            : "bg-amberGold-50 text-amberGold-700 border border-amberGold-200"
                        }`}
                      >
                        {r.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {r.status !== "PUBLISHED" && (
                          <button
                            onClick={() => updateStatus(r.id, "PUBLISHED")}
                            disabled={actionLoading === r.id}
                            className="flex items-center gap-1 px-2.5 py-1 bg-forest-100 hover:bg-forest-200 text-forest-700 rounded-lg text-[11px] font-semibold transition"
                          >
                            <Check className="w-3 h-3" /> Publish
                          </button>
                        )}
                        {r.status !== "HIDDEN" && (
                          <button
                            onClick={() => updateStatus(r.id, "HIDDEN")}
                            disabled={actionLoading === r.id}
                            className="flex items-center gap-1 px-2.5 py-1 bg-charcoal-100 hover:bg-charcoal-200 text-charcoal-600 rounded-lg text-[11px] font-semibold transition"
                          >
                            <EyeOff className="w-3 h-3" /> Hide
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
