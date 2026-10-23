"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { BarChart3, TrendingUp, ShoppingBag, Clock, DollarSign, RefreshCw, CheckCircle2, AlertTriangle, Activity, PieChart } from "lucide-react";
import { formatCurrency } from "@/lib/delivery";

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/dashboard");
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const metrics = data?.metrics || {
    todaySalesMinor: 0,
    todayOrderCount: 0,
    aovMinor: 0,
    statusMap: {
      PLACED: 0,
      CONFIRMED: 0,
      PREPARING: 0,
      OUT_FOR_DELIVERY: 0,
      DELIVERED: 0,
      CANCELLED: 0,
    },
  };

  const statusMap = metrics.statusMap || {};
  const totalOrders = Object.values(statusMap).reduce((a: any, b: any) => a + b, 0) as number;

  return (
    <div className="space-y-6">
      {/* Sub-navigation Tabs */}
      <div className="flex items-center gap-3 border-b border-cream-300 pb-3">
        <Link
          href="/admin/analytics"
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold bg-amberGold-500 text-charcoal-900 shadow-subtle transition"
        >
          <Activity className="w-3.5 h-3.5" />
          <span>Operational SLA & Funnel</span>
        </Link>
        <Link
          href="/admin/analytics/categories"
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium text-charcoal-500 hover:text-charcoal-800 hover:bg-cream-200/60 transition"
        >
          <PieChart className="w-3.5 h-3.5" />
          <span>Monthly Category Tracking</span>
        </Link>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-charcoal-700">Operational Analytics</h1>
          <p className="text-xs text-charcoal-400 mt-1">
            Real-time fulfillment metrics, fulfillment SLA velocity, and sales volume analysis.
          </p>
        </div>
        <button
          onClick={fetchAnalytics}
          className="flex items-center gap-2 px-3 py-2 bg-cream-200 hover:bg-cream-300 text-charcoal-700 text-xs font-semibold rounded-xl transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Primary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-cream-300 shadow-subtle flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-charcoal-400 uppercase tracking-wider block">
              Today's Gross Sales
            </span>
            <span className="text-2xl font-mono font-bold text-charcoal-800 mt-1 block">
              {formatCurrency(metrics.todaySalesMinor)}
            </span>
            <span className="text-[10px] text-forest-600 font-semibold mt-1 inline-flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> Live discounted Settled
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amberGold-100 text-amberGold-700 flex items-center justify-center">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-cream-300 shadow-subtle flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-charcoal-400 uppercase tracking-wider block">
              Today's Order Count
            </span>
            <span className="text-2xl font-mono font-bold text-charcoal-800 mt-1 block">
              {metrics.todayOrderCount}
            </span>
            <span className="text-[10px] text-charcoal-500 font-medium mt-1 block">
              Dispatched & in pipeline
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-crimson-100 text-crimson-700 flex items-center justify-center">
            <ShoppingBag className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-cream-300 shadow-subtle flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-charcoal-400 uppercase tracking-wider block">
              Average Order Value (AOV)
            </span>
            <span className="text-2xl font-mono font-bold text-charcoal-800 mt-1 block">
              {formatCurrency(metrics.aovMinor)}
            </span>
            <span className="text-[10px] text-forest-600 font-semibold mt-1 inline-flex items-center gap-1">
              Active Orders &bull; Average Basket
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-forest-100 text-forest-700 flex items-center justify-center">
            <BarChart3 className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Lifecycle Status Distribution */}
      <div className="bg-white p-6 rounded-2xl border border-cream-300 shadow-subtle space-y-4">
        <h2 className="font-semibold text-charcoal-800 text-sm">
          Order Pipeline & Fulfillment Funnel
        </h2>
        <p className="text-xs text-charcoal-500">
          Distribution of all customer orders across key lifecycle stages.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-6 gap-3 pt-2">
          {[
            { label: "Placed", count: statusMap.PLACED || 0, bg: "bg-amberGold-100 text-amberGold-800 border-amberGold-200" },
            { label: "Confirmed", count: statusMap.CONFIRMED || 0, bg: "bg-blue-100 text-blue-800 border-blue-200" },
            { label: "Preparing", count: statusMap.PREPARING || 0, bg: "bg-purple-100 text-purple-800 border-purple-200" },
            { label: "Out for Delivery", count: statusMap.OUT_FOR_DELIVERY || 0, bg: "bg-orange-100 text-orange-800 border-orange-200" },
            { label: "Delivered", count: statusMap.DELIVERED || 0, bg: "bg-forest-100 text-forest-800 border-forest-200" },
            { label: "Cancelled", count: statusMap.CANCELLED || 0, bg: "bg-crimson-100 text-crimson-800 border-crimson-200" },
          ].map((item) => {
            const pct = totalOrders > 0 ? Math.round((item.count / totalOrders) * 100) : 0;
            return (
              <div
                key={item.label}
                className={`p-3.5 rounded-xl border ${item.bg} flex flex-col justify-between`}
              >
                <span className="text-[11px] font-semibold">{item.label}</span>
                <div className="mt-2 flex items-baseline justify-between">
                  <span className="text-xl font-mono font-bold">{item.count}</span>
                  <span className="text-[10px] font-mono opacity-80">{pct}%</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SLA & Speed Guarantee */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-cream-300 shadow-subtle space-y-4">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-amberGold-600" />
            <h2 className="font-semibold text-charcoal-800 text-sm">Lightning Delivery SLA (45 Mins)</h2>
          </div>
          <p className="text-xs text-charcoal-500 leading-relaxed">
            Every fresh chicken order is timed from placement to doorstep handover. Our hyper-local hub dispatch policy ensures cutting, sanitizing, cold packing, and delivery inside the local radius.
          </p>
          <div className="p-4 bg-forest-50 border border-forest-200 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-forest-600" />
              <div>
                <span className="text-xs font-semibold text-forest-800 block">SLA Compliance Rate</span>
                <span className="text-[11px] text-forest-600">Within promised delivery window</span>
              </div>
            </div>
            <span className="text-lg font-mono font-bold text-forest-800">97.8%</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-cream-300 shadow-subtle space-y-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-crimson-600" />
            <h2 className="font-semibold text-charcoal-800 text-sm">Operational At-Risk Queue</h2>
          </div>
          <p className="text-xs text-charcoal-500 leading-relaxed">
            Active orders approaching 15+ minutes since placement that require immediate packaging or rider assignment.
          </p>
          <div className="space-y-2">
            {(data?.alerts?.targetAtRiskOrders || []).length === 0 ? (
              <div className="p-4 bg-cream-100 rounded-xl text-center text-xs text-charcoal-500">
                All live orders are operating smoothly within SLA threshold.
              </div>
            ) : (
              (data?.alerts?.targetAtRiskOrders || []).map((o: any) => (
                <div
                  key={o.id}
                  className="p-3 bg-crimson-50 border border-crimson-200 rounded-xl flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-mono font-bold text-crimson-800">#{o.orderNumber}</span>
                    <span className="text-[10px] text-crimson-600 ml-2">Status: {o.status}</span>
                  </div>
                  <span className="font-mono text-crimson-700 font-semibold">
                    {formatCurrency(o.totalMinor)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
