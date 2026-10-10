"use client";

import React, { useState, useEffect } from "react";
import { Users, RefreshCw, Phone, Mail, ShoppingBag, Calendar, CheckCircle2 } from "lucide-react";
import { formatCurrency } from "@/lib/delivery";

interface Customer {
  id: string;
  name: string;
  mobile: string;
  email: string | null;
  status: string;
  createdAt: string;
  lastLoginAt: string | null;
  _count?: { orders: number };
  orders?: {
    id: string;
    orderNumber: string;
    status: string;
    totalMinor: number;
    createdAt: string;
  }[];
}

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/customers");
      if (res.ok) {
        const data = await res.json();
        setCustomers(data.customers || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const filtered = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.mobile.includes(search) ||
      (c.email && c.email.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-charcoal-700">Customer Directory</h1>
          <p className="text-xs text-charcoal-400 mt-1">
            Registered customer accounts, order history counts, and contact records.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="text"
            placeholder="Search by name, phone or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-3.5 py-2 bg-white border border-cream-300 rounded-xl text-xs w-64 focus:outline-none focus:border-amberGold-500 shadow-subtle"
          />
          <button
            onClick={fetchCustomers}
            className="flex items-center gap-2 px-3 py-2 bg-cream-200 hover:bg-cream-300 text-charcoal-700 text-xs font-semibold rounded-xl transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-2xl border border-cream-300 overflow-hidden shadow-subtle">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-cream-100 text-charcoal-500 font-semibold border-b border-cream-200">
              <tr>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Contact</th>
                <th className="px-6 py-4 text-center">Total Orders</th>
                <th className="px-6 py-4">Latest Order</th>
                <th className="px-6 py-4">Joined Date</th>
                <th className="px-6 py-4 text-right">Account Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cream-200">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-charcoal-400">
                    {loading ? "Loading customer directory..." : "No customers found."}
                  </td>
                </tr>
              ) : (
                filtered.map((cust) => {
                  const lastOrder = cust.orders?.[0];

                  return (
                    <tr key={cust.id} className="hover:bg-cream-50/60 transition">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-crimson-100 text-crimson-700 flex items-center justify-center font-bold">
                            {cust.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <span className="font-semibold text-charcoal-800 block">
                              {cust.name}
                            </span>
                            <span className="text-[10px] text-charcoal-400 font-mono">
                              ID: {cust.id.slice(-6)}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-0.5">
                          <a
                            href={`tel:${cust.mobile}`}
                            className="font-mono text-crimson-600 hover:underline flex items-center gap-1 font-semibold"
                          >
                            <Phone className="w-3 h-3" />
                            {cust.mobile}
                          </a>
                          {cust.email && (
                            <span className="text-[11px] text-charcoal-400 flex items-center gap-1">
                              <Mail className="w-3 h-3" />
                              {cust.email}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-cream-100 text-charcoal-700 rounded-full font-mono font-bold text-xs">
                          <ShoppingBag className="w-3 h-3 text-amberGold-600" />
                          {cust._count?.orders || 0}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {lastOrder ? (
                          <div>
                            <span className="font-mono font-semibold text-charcoal-800 block">
                              #{lastOrder.orderNumber}
                            </span>
                            <span className="text-[10px] text-charcoal-500 font-mono">
                              {formatCurrency(lastOrder.totalMinor)} &bull; {new Date(lastOrder.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        ) : (
                          <span className="text-charcoal-400 text-[11px]">No orders yet</span>
                        )}
                      </td>
                      <td className="px-6 py-4 font-mono text-charcoal-500 text-[11px]">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-charcoal-400" />
                          {new Date(cust.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-forest-50 text-forest-700 border border-forest-200">
                          <CheckCircle2 className="w-3 h-3 text-forest-600" />
                          {cust.status}
                        </span>
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
