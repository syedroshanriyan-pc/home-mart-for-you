"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { OrderStatusBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Search, ShoppingBag, Eye, Clock, Check } from "lucide-react";

export default function AdminOrdersListPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const fetchOrders = async () => {
    try {
      setLoading(true);
      let url = "/api/admin/orders";
      const params = new URLSearchParams();
      if (selectedStatus !== "ALL") params.append("status", selectedStatus);
      if (searchQuery.trim()) params.append("search", searchQuery.trim());
      if (params.toString()) url += `?${params.toString()}`;

      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders || []);
      }
    } catch {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [selectedStatus]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchOrders();
  };

  const statusFilters = [
    { label: "All Orders", key: "ALL" },
    { label: "Placed / New", key: "PLACED" },
    { label: "Confirmed", key: "CONFIRMED" },
    { label: "Preparing", key: "PREPARING" },
    { label: "Out for Delivery", key: "OUT_FOR_DELIVERY" },
    { label: "Delivered", key: "DELIVERED" },
    { label: "Cancelled", key: "CANCELLED" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-bold text-charcoal-800">
          Order Management
        </h1>
        <p className="text-xs text-charcoal-500 mt-0.5">
          Process incoming orders, manage kitchen preparation, assign deliveries, and monitor fulfillment.
        </p>
      </div>

      {/* Filter Tabs & Search Controls */}
      <div className="space-y-3">
        {/* Status Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {statusFilters.map((f) => (
            <button
              key={f.key}
              onClick={() => setSelectedStatus(f.key)}
              className={`px-3.5 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                selectedStatus === f.key
                  ? "bg-charcoal-500 text-cream-50 font-semibold shadow-subtle"
                  : "bg-cream-50 text-charcoal-600 hover:bg-cream-100 border border-cream-200"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="flex gap-2 max-w-md">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-charcoal-400" />
            <input
              type="text"
              placeholder="Search by order number (e.g. 1001), customer, phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs bg-cream-50 border border-cream-300 rounded-xl text-charcoal-700 placeholder-charcoal-400 focus:outline-none focus:ring-2 focus:ring-amberGold-400"
            />
          </div>
          <Button type="submit" variant="primary" size="sm">
            Search
          </Button>
        </form>
      </div>

      {/* Orders Table */}
      <div className="bg-cream-50 rounded-2xl border border-cream-200 shadow-subtle overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-charcoal-400">
            Loading orders...
          </div>
        ) : orders.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <ShoppingBag className="w-8 h-8 text-charcoal-400 mx-auto" />
            <p className="text-xs text-charcoal-500 font-medium">No orders found matching the filter.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-cream-200 bg-cream-100/50 text-[11px] uppercase text-charcoal-500 font-semibold">
                  <th className="py-3 px-4">Order #</th>
                  <th className="py-3 px-4">Date / Time</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Items Summary</th>
                  <th className="py-3 px-4">Total & Payment</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Delivery Partner</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cream-100">
                {orders.map((ord) => {
                  const placedStr = new Date(ord.placedAt).toLocaleString("en-IN", {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                    timeZone: "Asia/Kolkata",
                  });

                  return (
                    <tr key={ord.id} className="hover:bg-cream-100/60 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-charcoal-800">
                        #{ord.orderNumber}
                      </td>
                      <td className="py-3 px-4 text-charcoal-500 text-[11px]">
                        {placedStr}
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-semibold text-charcoal-800 block">{ord.user?.name}</span>
                        <span className="text-[10px] text-charcoal-400">{ord.user?.mobile}</span>
                      </td>
                      <td className="py-3 px-4 text-charcoal-600 max-w-xs truncate">
                        {ord.items.map((i: any) => `${i.quantity}x ${i.productNameSnapshot}`).join(", ")}
                      </td>
                      <td className="py-3 px-4 font-mono">
                        <span className="font-bold text-charcoal-800 block">
                          ₹{(ord.totalMinor / 100).toFixed(0)}
                        </span>
                        <span className="text-[10px] text-charcoal-400 uppercase">
                          {ord.payment?.method || "COD"} &bull; {ord.payment?.status}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <OrderStatusBadge status={ord.status} />
                      </td>
                      <td className="py-3 px-4 text-charcoal-600">
                        {ord.deliveryAssignment?.agent?.name ? (
                          <span className="font-medium text-charcoal-700">
                            {ord.deliveryAssignment.agent.name}
                          </span>
                        ) : (
                          <span className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded text-[10px] font-bold">
                            Unassigned
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Link href={`/admin/orders/${ord.id}`}>
                          <Button variant="primary" size="sm" className="text-xs px-3 py-1">
                            <span>Open Details</span>
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
