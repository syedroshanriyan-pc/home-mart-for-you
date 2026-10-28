"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Layers,
  Calendar,
  Download,
  RefreshCw,
  ShoppingBag,
  ArrowUpRight,
  ArrowDownRight,
  Package,
  Sparkles,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  DollarSign,
  Scale,
  PieChart,
  Activity,
  ArrowRight,
} from "lucide-react";
import { formatCurrency } from "@/lib/delivery";

interface TopProduct {
  id: string;
  name: string;
  imageUrl: string | null;
  units: number;
  revenueMinor: number;
  revenueRs: number;
  weightKg: number;
}

interface CategoryRow {
  categoryId: string;
  categoryName: string;
  categorySlug: string;
  imageUrl: string | null;
  revenueMinor: number;
  revenueRs: number;
  unitsSold: number;
  weightKg: number;
  orderCount: number;
  averageUnitPriceRs: number;
  sharePercent: number;
  prevMonthRevenueRs: number;
  prevMonthUnits: number;
  momRevenueGrowthPercent: number | null;
  topProducts: TopProduct[];
}

interface HistoricalMonth {
  year: number;
  month: number;
  label: string;
  monthName: string;
  totalRevenueRs: number;
  totalUnits: number;
  categories: Array<{
    slug: string;
    name: string;
    revenueRs: number;
    units: number;
  }>;
}

interface AnalyticsData {
  period: {
    year: number;
    month: number;
    monthName: string;
    fullLabel: string;
    daysInMonth: number;
  };
  summary: {
    totalRevenueMinor: number;
    totalRevenueRs: number;
    prevTotalRevenueRs: number;
    overallMomGrowthPercent: number | null;
    totalUnitsSold: number;
    totalWeightKg: number;
    totalOrdersCount: number;
    leaderCategory: {
      name: string;
      slug: string;
      revenueRs: number;
      sharePercent: number;
    } | null;
    fastestGrowingCategory: {
      name: string;
      growthPercent: number | null;
    } | null;
  };
  categories: CategoryRow[];
  historicalTrend: HistoricalMonth[];
  dailyTrend: Array<{
    day: number;
    date: string;
    totalRs: number;
    byCategoryRs: Record<string, number>;
  }>;
  allAvailableCategories: Array<{
    id: string;
    name: string;
    slug: string;
  }>;
}

const MONTHS = [
  { num: 1, label: "Jan", full: "January" },
  { num: 2, label: "Feb", full: "February" },
  { num: 3, label: "Mar", full: "March" },
  { num: 4, label: "Apr", full: "April" },
  { num: 5, label: "May", full: "May" },
  { num: 6, label: "Jun", full: "June" },
  { num: 7, label: "Jul", full: "July" },
  { num: 8, label: "Aug", full: "August" },
  { num: 9, label: "Sep", full: "September" },
  { num: 10, label: "Oct", full: "October" },
  { num: 11, label: "Nov", full: "November" },
  { num: 12, label: "Dec", full: "December" },
];

const CATEGORY_COLORS: Record<string, { bg: string; text: string; bar: string; border: string }> = {
  "fresh-chicken": { bg: "bg-amberGold-100", text: "text-amberGold-900", bar: "bg-amberGold-500", border: "border-amberGold-300" },
  "fish-seafood": { bg: "bg-cyan-100", text: "text-cyan-900", bar: "bg-cyan-500", border: "border-cyan-300" },
  "masala-special": { bg: "bg-crimson-100", text: "text-crimson-900", bar: "bg-crimson-500", border: "border-crimson-300" },
  "eggs": { bg: "bg-amber-100", text: "text-amber-900", bar: "bg-amber-400", border: "border-amber-300" },
  "beverages": { bg: "bg-blue-100", text: "text-blue-900", bar: "bg-blue-500", border: "border-blue-300" },
  "default": { bg: "bg-forest-100", text: "text-forest-900", bar: "bg-forest-500", border: "border-forest-300" },
};

function getCategoryColor(slug: string) {
  return CATEGORY_COLORS[slug] || CATEGORY_COLORS["default"];
}

export default function AdminMonthlyCategoriesPage() {
  const now = new Date();
  const [selectedYear, setSelectedYear] = useState<number>(now.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(now.getMonth() + 1);
  const [statusFilter, setStatusFilter] = useState<string>("ACTIVE");
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [expandedCat, setExpandedCat] = useState<string | null>(null);
  const [filterQuery, setFilterQuery] = useState<string>("");

  const fetchCategoryAnalytics = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        `/api/admin/analytics/categories?year=${selectedYear}&month=${selectedMonth}&status=${statusFilter}`
      );
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (err) {
      console.error("Failed to load category analytics:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategoryAnalytics();
  }, [selectedYear, selectedMonth, statusFilter]);

  const toggleExpand = (catId: string) => {
    setExpandedCat((prev) => (prev === catId ? null : catId));
  };

  // Filtered categories by search
  const filteredCategories = useMemo(() => {
    if (!data?.categories) return [];
    if (!filterQuery.trim()) return data.categories;
    const q = filterQuery.toLowerCase();
    return data.categories.filter(
      (c) =>
        c.categoryName.toLowerCase().includes(q) ||
        c.topProducts.some((p) => p.name.toLowerCase().includes(q))
    );
  }, [data, filterQuery]);

  // Export CSV
  const handleExportCSV = () => {
    if (!data) return;
    const headers = [
      "Category Name",
      "Slug",
      "Month",
      "Year",
      "Gross Revenue (INR)",
      "Basket Share (%)",
      "Units Sold",
      "Weight (kg)",
      "Unique Orders",
      "Average Item Price (INR)",
      "MoM Growth (%)",
    ];

    const rows = data.categories.map((c) => [
      `"${c.categoryName}"`,
      `"${c.categorySlug}"`,
      `"${data.period.monthName}"`,
      data.period.year,
      c.revenueRs,
      `${c.sharePercent}%`,
      c.unitsSold,
      c.weightKg,
      c.orderCount,
      c.averageUnitPriceRs,
      c.momRevenueGrowthPercent !== null ? `${c.momRevenueGrowthPercent}%` : "N/A",
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      `category-monthly-tracking-${data.period.year}-${String(data.period.month).padStart(2, "0")}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const summary = data?.summary;
  const period = data?.period;

  return (
    <div className="space-y-6">
      {/* Sub-navigation Tabs */}
      <div className="flex items-center gap-3 border-b border-cream-300 pb-3">
        <Link
          href="/admin/analytics"
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium text-charcoal-500 hover:text-charcoal-800 hover:bg-cream-200/60 transition"
        >
          <Activity className="w-3.5 h-3.5" />
          <span>Operational SLA & Funnel</span>
        </Link>
        <Link
          href="/admin/analytics/categories"
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold bg-amberGold-500 text-charcoal-900 shadow-subtle transition"
        >
          <PieChart className="w-3.5 h-3.5" />
          <span>Monthly Category Tracking</span>
        </Link>
      </div>

      {/* Header & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-serif font-bold text-charcoal-800">
              Monthly Category Tracking
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-forest-100 text-forest-800 border border-forest-200">
              Multi-Category Analytics
            </span>
          </div>
          <p className="text-xs text-charcoal-500 mt-1">
            Tracking sales, volume (kg/units), basket contribution, and MoM growth for Chicken, Fish & Seafood, Masala, Eggs, and Beverages.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Year Selector */}
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value, 10))}
            className="px-3 py-2 bg-white border border-cream-300 rounded-xl text-xs font-semibold text-charcoal-700 shadow-sm focus:outline-none focus:border-amberGold-500"
          >
            <option value={2026}>2026</option>
            <option value={2025}>2025</option>
            <option value={2024}>2024</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-white border border-cream-300 rounded-xl text-xs font-semibold text-charcoal-700 shadow-sm focus:outline-none focus:border-amberGold-500"
          >
            <option value="ACTIVE">Active & Delivered</option>
            <option value="DELIVERED">Delivered Only</option>
            <option value="ALL">All Placed Orders</option>
          </select>

          {/* CSV Export Button */}
          <button
            onClick={handleExportCSV}
            disabled={!data || loading}
            className="flex items-center gap-1.5 px-3 py-2 bg-charcoal-700 hover:bg-charcoal-800 text-cream-50 text-xs font-semibold rounded-xl shadow-sm transition disabled:opacity-50"
            title="Download CSV breakdown"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>

          {/* Refresh */}
          <button
            onClick={fetchCategoryAnalytics}
            className="flex items-center gap-1.5 px-3 py-2 bg-cream-200 hover:bg-cream-300 text-charcoal-700 text-xs font-semibold rounded-xl transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* Month Selector Pills */}
      <div className="bg-white p-2 rounded-2xl border border-cream-300 shadow-subtle overflow-x-auto">
        <div className="flex items-center gap-1 min-w-max">
          {MONTHS.map((m) => {
            const isSelected = selectedMonth === m.num;
            return (
              <button
                key={m.num}
                onClick={() => setSelectedMonth(m.num)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all ${
                  isSelected
                    ? "bg-charcoal-700 text-cream-50 font-bold shadow-subtle"
                    : "text-charcoal-500 hover:bg-cream-100 hover:text-charcoal-800"
                }`}
              >
                <span>{m.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* KPI Cards Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Monthly Category Revenue */}
        <div className="bg-white p-5 rounded-2xl border border-cream-300 shadow-subtle flex flex-col justify-between">
          <div className="flex items-center justify-between text-charcoal-400">
            <span className="text-[11px] uppercase font-bold tracking-wider">
              {period?.monthName} Revenue
            </span>
            <div className="w-8 h-8 rounded-xl bg-forest-100 text-forest-700 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-mono font-bold text-charcoal-800 block">
              ₹{(summary?.totalRevenueRs || 0).toLocaleString()}
            </span>
            <div className="mt-1 flex items-center gap-1.5 text-xs">
              {summary?.overallMomGrowthPercent !== null ? (
                summary?.overallMomGrowthPercent! >= 0 ? (
                  <span className="inline-flex items-center gap-0.5 text-emerald-600 font-semibold text-[11px]">
                    <ArrowUpRight className="w-3 h-3" />
                    +{summary?.overallMomGrowthPercent}% MoM
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-0.5 text-red-600 font-semibold text-[11px]">
                    <ArrowDownRight className="w-3 h-3" />
                    {summary?.overallMomGrowthPercent}% MoM
                  </span>
                )
              ) : (
                <span className="text-[11px] text-charcoal-400">Base period</span>
              )}
              <span className="text-[10px] text-charcoal-400">
                vs ₹{(summary?.prevTotalRevenueRs || 0).toLocaleString()} last month
              </span>
            </div>
          </div>
        </div>

        {/* Volume & Weight Dispatched */}
        <div className="bg-white p-5 rounded-2xl border border-cream-300 shadow-subtle flex flex-col justify-between">
          <div className="flex items-center justify-between text-charcoal-400">
            <span className="text-[11px] uppercase font-bold tracking-wider">
              Volume & Weight
            </span>
            <div className="w-8 h-8 rounded-xl bg-amberGold-100 text-amberGold-800 flex items-center justify-center">
              <Scale className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-mono font-bold text-charcoal-800">
                {summary?.totalWeightKg || 0} kg
              </span>
              <span className="text-xs text-charcoal-500 font-medium">
                ({summary?.totalUnitsSold || 0} packs/items)
              </span>
            </div>
            <span className="text-[10px] text-charcoal-400 mt-1 block">
              Fulfilled across {summary?.totalOrdersCount || 0} customer orders
            </span>
          </div>
        </div>

        {/* Top Category Leader */}
        <div className="bg-white p-5 rounded-2xl border border-cream-300 shadow-subtle flex flex-col justify-between">
          <div className="flex items-center justify-between text-charcoal-400">
            <span className="text-[11px] uppercase font-bold tracking-wider">
              Category Leader
            </span>
            <div className="w-8 h-8 rounded-xl bg-crimson-100 text-crimson-700 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-lg font-serif font-bold text-charcoal-800 truncate block">
              {summary?.leaderCategory?.name || "None"}
            </span>
            <div className="mt-1 flex items-center gap-1.5 text-xs text-charcoal-600">
              <span className="font-mono font-semibold text-charcoal-800">
                ₹{(summary?.leaderCategory?.revenueRs || 0).toLocaleString()}
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-amberGold-100 text-amberGold-800 font-bold">
                {summary?.leaderCategory?.sharePercent || 0}% share
              </span>
            </div>
          </div>
        </div>

        {/* Fastest Growing Category */}
        <div className="bg-white p-5 rounded-2xl border border-cream-300 shadow-subtle flex flex-col justify-between">
          <div className="flex items-center justify-between text-charcoal-400">
            <span className="text-[11px] uppercase font-bold tracking-wider">
              Fastest MoM Growth
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-lg font-serif font-bold text-charcoal-800 truncate block">
              {summary?.fastestGrowingCategory?.name || "All steady"}
            </span>
            <div className="mt-1 text-xs">
              {summary?.fastestGrowingCategory?.growthPercent !== null ? (
                <span className="text-emerald-600 font-semibold text-xs inline-flex items-center gap-1">
                  <ArrowUpRight className="w-3.5 h-3.5" />
                  +{summary?.fastestGrowingCategory?.growthPercent}% month-on-month
                </span>
              ) : (
                <span className="text-xs text-charcoal-400">Steady volume</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Visual Category Revenue Share Bar */}
      <div className="bg-white p-6 rounded-2xl border border-cream-300 shadow-subtle space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h2 className="font-semibold text-charcoal-800 text-sm">
              Monthly Category Revenue Mix ({period?.fullLabel})
            </h2>
            <p className="text-xs text-charcoal-400 mt-0.5">
              Proportional revenue contribution across Chicken, Fish & Seafood, Masala, Eggs, and Beverages.
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-charcoal-700">
            Total: ₹{(summary?.totalRevenueRs || 0).toLocaleString()}
          </span>
        </div>

        {/* Multi-segmented Progress Bar */}
        <div className="h-4 w-full bg-cream-100 rounded-full overflow-hidden flex shadow-inner">
          {(data?.categories || []).map((cat) => {
            if (cat.sharePercent <= 0) return null;
            const style = getCategoryColor(cat.categorySlug);
            return (
              <div
                key={cat.categoryId}
                style={{ width: `${Math.max(1, cat.sharePercent)}%` }}
                className={`${style.bar} h-full transition-all duration-500`}
                title={`${cat.categoryName}: ₹${cat.revenueRs.toLocaleString()} (${cat.sharePercent}%)`}
              />
            );
          })}
        </div>

        {/* Color Legend & Share Badges */}
        <div className="flex flex-wrap items-center gap-3 pt-1">
          {(data?.categories || []).map((cat) => {
            const style = getCategoryColor(cat.categorySlug);
            return (
              <div
                key={cat.categoryId}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-cream-50 border border-cream-200 text-xs"
              >
                <div className={`w-3 h-3 rounded-full ${style.bar}`} />
                <span className="font-semibold text-charcoal-700">{cat.categoryName}</span>
                <span className="font-mono text-charcoal-500 font-medium">
                  ₹{cat.revenueRs.toLocaleString()} ({cat.sharePercent}%)
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Category Performance Cards Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-charcoal-800 text-sm">
            Category Breakdown Cards & Top Products
          </h2>
          <span className="text-xs text-charcoal-400">
            Click any card to expand top-selling cuts
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {(data?.categories || []).map((cat) => {
            const style = getCategoryColor(cat.categorySlug);
            const isExpanded = expandedCat === cat.categoryId;

            return (
              <div
                key={cat.categoryId}
                className={`bg-white rounded-2xl border transition-all duration-200 shadow-subtle overflow-hidden ${
                  isExpanded ? "border-amberGold-400 ring-1 ring-amberGold-400" : "border-cream-300"
                }`}
              >
                <div
                  onClick={() => toggleExpand(cat.categoryId)}
                  className="p-5 cursor-pointer hover:bg-cream-50/50 transition flex flex-col justify-between space-y-4"
                >
                  {/* Top line: Name & Growth badge */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-lg border ${style.bg} ${style.text} ${style.border}`}>
                        {cat.categoryName}
                      </span>
                      <h3 className="font-serif text-lg font-bold text-charcoal-800 mt-2">
                        ₹{cat.revenueRs.toLocaleString()}
                      </h3>
                    </div>

                    <div className="text-right">
                      {cat.momRevenueGrowthPercent !== null ? (
                        cat.momRevenueGrowthPercent >= 0 ? (
                          <span className="inline-flex items-center gap-0.5 text-emerald-700 font-semibold text-xs px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200">
                            <ArrowUpRight className="w-3 h-3" />
                            +{cat.momRevenueGrowthPercent}% MoM
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-0.5 text-red-700 font-semibold text-xs px-2 py-0.5 rounded-full bg-red-50 border border-red-200">
                            <ArrowDownRight className="w-3 h-3" />
                            {cat.momRevenueGrowthPercent}% MoM
                          </span>
                        )
                      ) : (
                        <span className="text-[10px] text-charcoal-400 px-2 py-0.5 rounded-full bg-cream-100">
                          First Month
                        </span>
                      )}
                      <span className="block text-[11px] font-mono text-charcoal-400 mt-1">
                        {cat.sharePercent}% of total
                      </span>
                    </div>
                  </div>

                  {/* Volume Metrics */}
                  <div className="grid grid-cols-3 gap-2 py-2 border-y border-cream-200 text-center">
                    <div>
                      <span className="text-[10px] text-charcoal-400 block uppercase font-medium">
                        Units Sold
                      </span>
                      <span className="font-mono font-bold text-charcoal-800 text-sm">
                        {cat.unitsSold}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-charcoal-400 block uppercase font-medium">
                        Weight
                      </span>
                      <span className="font-mono font-bold text-charcoal-800 text-sm">
                        {cat.weightKg > 0 ? `${cat.weightKg} kg` : "—"}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-charcoal-400 block uppercase font-medium">
                        Orders
                      </span>
                      <span className="font-mono font-bold text-charcoal-800 text-sm">
                        {cat.orderCount}
                      </span>
                    </div>
                  </div>

                  {/* Drawer toggle action */}
                  <div className="flex items-center justify-between text-xs text-charcoal-500 pt-1">
                    <span className="text-[11px]">
                      {cat.topProducts.length} Top Products Available
                    </span>
                    <button className="flex items-center gap-1 font-semibold text-amberGold-700 hover:underline">
                      <span>{isExpanded ? "Hide Details" : "View Details"}</span>
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Expanded Products Drawer */}
                {isExpanded && (
                  <div className="p-4 bg-cream-50 border-t border-cream-200 space-y-2">
                    <h4 className="text-[11px] uppercase tracking-wider font-bold text-charcoal-500">
                      Top Selling Products in {cat.categoryName}
                    </h4>

                    {cat.topProducts.length === 0 ? (
                      <p className="text-xs text-charcoal-400 py-2">
                        No orders recorded for this category in {period?.monthName} {period?.year}.
                      </p>
                    ) : (
                      <div className="divide-y divide-cream-200">
                        {cat.topProducts.map((p, idx) => (
                          <div
                            key={p.id}
                            className="py-2 flex items-center justify-between text-xs"
                          >
                            <div className="flex items-center gap-2">
                              <span className="w-4 h-4 rounded-full bg-cream-200 text-charcoal-600 text-[10px] font-mono font-bold flex items-center justify-center">
                                {idx + 1}
                              </span>
                              <div>
                                <span className="font-medium text-charcoal-800 block">
                                  {p.name}
                                </span>
                                <span className="text-[10px] text-charcoal-400">
                                  {p.units} units sold {p.weightKg > 0 && `• ${p.weightKg} kg`}
                                </span>
                              </div>
                            </div>
                            <span className="font-mono font-bold text-charcoal-800">
                              ₹{p.revenueRs.toLocaleString()}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 6-Month Category Comparison Trend */}
      <div className="bg-white p-6 rounded-2xl border border-cream-300 shadow-subtle space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h2 className="font-semibold text-charcoal-800 text-sm">
              6-Month Historical Category Performance Trend
            </h2>
            <p className="text-xs text-charcoal-400 mt-0.5">
              Month-over-month sales progression comparing Chicken, Fish, Eggs, and specialty categories.
            </p>
          </div>
          <span className="text-xs text-charcoal-500 font-mono">
            Trailing 6 Months
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-cream-200 text-charcoal-400 font-semibold uppercase text-[10px]">
                <th className="py-2.5 px-3">Month</th>
                <th className="py-2.5 px-3">Total Sales</th>
                {(data?.allAvailableCategories || []).map((c) => (
                  <th key={c.id} className="py-2.5 px-3">
                    {c.name}
                  </th>
                ))}
                <th className="py-2.5 px-3 text-right">Units</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cream-100">
              {(data?.historicalTrend || []).map((m) => {
                const isSelected = m.month === selectedMonth && m.year === selectedYear;
                return (
                  <tr
                    key={m.label}
                    onClick={() => {
                      setSelectedYear(m.year);
                      setSelectedMonth(m.month);
                    }}
                    className={`cursor-pointer transition-colors ${
                      isSelected
                        ? "bg-amberGold-50 font-semibold"
                        : "hover:bg-cream-50"
                    }`}
                  >
                    <td className="py-3 px-3 font-semibold text-charcoal-800 flex items-center gap-1.5">
                      {isSelected && (
                        <div className="w-1.5 h-1.5 rounded-full bg-amberGold-600" />
                      )}
                      <span>{m.label}</span>
                    </td>
                    <td className="py-3 px-3 font-mono font-bold text-charcoal-800">
                      ₹{m.totalRevenueRs.toLocaleString()}
                    </td>
                    {(data?.allAvailableCategories || []).map((c) => {
                      const catData = m.categories.find((x) => x.slug === c.slug);
                      const rev = catData ? catData.revenueRs : 0;
                      return (
                        <td key={c.id} className="py-3 px-3 font-mono text-charcoal-600">
                          {rev > 0 ? `₹${rev.toLocaleString()}` : "—"}
                        </td>
                      );
                    })}
                    <td className="py-3 px-3 text-right font-mono text-charcoal-600">
                      {m.totalUnits}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Comprehensive Category Intelligence Table */}
      <div className="bg-white p-6 rounded-2xl border border-cream-300 shadow-subtle space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="font-semibold text-charcoal-800 text-sm">
              Detailed Monthly Category Ledger ({period?.fullLabel})
            </h2>
            <p className="text-xs text-charcoal-400 mt-0.5">
              Comprehensive operational summary for bookkeeping, stock ordering, and supply chain planning.
            </p>
          </div>

          <div className="w-full sm:w-64">
            <input
              type="text"
              placeholder="Search category or cut..."
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              className="w-full px-3 py-1.5 bg-cream-50 border border-cream-300 rounded-xl text-xs text-charcoal-800 focus:outline-none focus:border-amberGold-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-cream-200 text-charcoal-400 font-semibold uppercase text-[10px]">
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-3">Revenue (₹)</th>
                <th className="py-3 px-3">Share (%)</th>
                <th className="py-3 px-3">Units</th>
                <th className="py-3 px-3">Weight (kg)</th>
                <th className="py-3 px-3">Orders</th>
                <th className="py-3 px-3">Avg Unit Price</th>
                <th className="py-3 px-3">MoM Growth</th>
                <th className="py-3 px-4 text-right">Top Seller</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cream-100">
              {filteredCategories.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-xs text-charcoal-400">
                    No matching categories found for {period?.fullLabel}.
                  </td>
                </tr>
              ) : (
                filteredCategories.map((c) => {
                  const style = getCategoryColor(c.categorySlug);
                  const topProduct = c.topProducts[0];

                  return (
                    <tr key={c.categoryId} className="hover:bg-cream-50 transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-charcoal-800 flex items-center gap-2">
                        <span className={`w-2.5 h-2.5 rounded-full ${style.bar}`} />
                        <span>{c.categoryName}</span>
                      </td>
                      <td className="py-3.5 px-3 font-mono font-bold text-charcoal-800">
                        ₹{c.revenueRs.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-3">
                        <span className="font-mono px-2 py-0.5 rounded-lg bg-cream-100 text-charcoal-700 font-semibold text-[11px]">
                          {c.sharePercent}%
                        </span>
                      </td>
                      <td className="py-3.5 px-3 font-mono text-charcoal-700">
                        {c.unitsSold}
                      </td>
                      <td className="py-3.5 px-3 font-mono text-charcoal-700">
                        {c.weightKg > 0 ? `${c.weightKg} kg` : "—"}
                      </td>
                      <td className="py-3.5 px-3 font-mono text-charcoal-700">
                        {c.orderCount}
                      </td>
                      <td className="py-3.5 px-3 font-mono text-charcoal-700">
                        ₹{c.averageUnitPriceRs}
                      </td>
                      <td className="py-3.5 px-3">
                        {c.momRevenueGrowthPercent !== null ? (
                          c.momRevenueGrowthPercent >= 0 ? (
                            <span className="inline-flex items-center gap-0.5 text-emerald-700 font-semibold text-[11px]">
                              <ArrowUpRight className="w-3 h-3" />
                              +{c.momRevenueGrowthPercent}%
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-0.5 text-red-600 font-semibold text-[11px]">
                              <ArrowDownRight className="w-3 h-3" />
                              {c.momRevenueGrowthPercent}%
                            </span>
                          )
                        ) : (
                          <span className="text-charcoal-400 text-[11px]">—</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right font-medium text-charcoal-600 truncate max-w-[180px]">
                        {topProduct ? topProduct.name : "—"}
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
