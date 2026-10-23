"use client";

import React, { useState, useEffect } from "react";
import { Bike, Plus, RefreshCw, AlertCircle, Phone, CheckCircle2, Clock } from "lucide-react";
import { Modal } from "@/components/ui/Modal";

interface Agent {
  id: string;
  name: string;
  mobile: string;
  email: string | null;
  status: string;
  createdAt: string;
  deliveryProfile: {
    isAvailable: boolean;
    vehicleType: string | null;
    vehicleNumber: string | null;
  } | null;
  assignedDeliveries: {
    status: string;
    order: {
      id: string;
      orderNumber: string;
      totalMinor: number;
      status: string;
    };
  }[];
}

export default function AdminDeliveryAgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "",
    mobile: "",
    email: "",
    password: "",
    vehicleType: "BIKE",
    vehicleNumber: "",
  });

  const fetchAgents = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/delivery-agents");
      if (res.ok) {
        const data = await res.json();
        setAgents(data.agents || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgents();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/delivery-agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to create delivery agent");
      }

      setIsModalOpen(false);
      setForm({ name: "", mobile: "", email: "", password: "", vehicleType: "BIKE", vehicleNumber: "" });
      fetchAgents();
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
          <h1 className="text-2xl font-serif font-bold text-charcoal-700">Delivery Fleet</h1>
          <p className="text-xs text-charcoal-400 mt-1">
            Manage field delivery executives, check live availability, and assign active routes.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchAgents}
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
            Add Delivery Executive
          </button>
        </div>
      </div>

      {/* Agents Table */}
      <div className="bg-white rounded-2xl border border-cream-300 overflow-hidden shadow-subtle">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-cream-100 text-charcoal-500 font-semibold border-b border-cream-200">
              <tr>
                <th className="px-6 py-4">Executive Name</th>
                <th className="px-6 py-4">Mobile / Contact</th>
                <th className="px-6 py-4">Vehicle Details</th>
                <th className="px-6 py-4">Status / Shift</th>
                <th className="px-6 py-4">Active Deliveries</th>
                <th className="px-6 py-4">Joined On</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cream-200">
              {agents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-charcoal-400">
                    {loading ? "Loading delivery fleet..." : "No delivery executives registered."}
                  </td>
                </tr>
              ) : (
                agents.map((agent) => {
                  const isAvailable = agent.deliveryProfile?.isAvailable ?? false;
                  const activeOrders = agent.assignedDeliveries || [];

                  return (
                    <tr key={agent.id} className="hover:bg-cream-50/60 transition">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-cream-200 flex items-center justify-center font-bold text-charcoal-700">
                            <Bike className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="font-semibold text-charcoal-800 block">
                              {agent.name}
                            </span>
                            <span className="text-[10px] text-charcoal-400 font-mono">
                              ID: {agent.id.slice(-6)}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-0.5">
                          <a
                            href={`tel:${agent.mobile}`}
                            className="font-mono text-crimson-600 hover:underline flex items-center gap-1 font-semibold"
                          >
                            <Phone className="w-3 h-3" />
                            {agent.mobile}
                          </a>
                          {agent.email && (
                            <span className="text-[11px] text-charcoal-400 block">
                              {agent.email}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-mono text-charcoal-700 bg-cream-100 px-2 py-0.5 rounded text-[11px]">
                          {agent.deliveryProfile?.vehicleNumber || "Not registered"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            isAvailable
                              ? "bg-forest-50 text-forest-700 border border-forest-200"
                              : "bg-charcoal-100 text-charcoal-500 border border-charcoal-200"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isAvailable ? "bg-forest-500" : "bg-charcoal-400"
                            }`}
                          />
                          {isAvailable ? "ON DUTY (ONLINE)" : "OFFLINE"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {activeOrders.length === 0 ? (
                          <span className="text-charcoal-400 text-[11px]">No active runs</span>
                        ) : (
                          <div className="space-y-1">
                            {activeOrders.map((d, i) => (
                              <span
                                key={i}
                                className="inline-block px-2 py-0.5 bg-amberGold-100 text-amberGold-800 border border-amberGold-200 rounded font-mono text-[10px] font-bold mr-1"
                              >
                                #{d.order?.orderNumber} ({d.status})
                              </span>
                            ))}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 font-mono text-charcoal-500 text-[11px]">
                        {new Date(agent.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Executive Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Register Delivery Executive"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-crimson-50 border border-crimson-200 text-crimson-700 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-charcoal-700 mb-1">
              Full Name *
            </label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Ramesh Kumar"
              className="w-full px-3.5 py-2.5 bg-cream-50 border border-cream-300 rounded-xl text-xs text-charcoal-800 focus:outline-none focus:border-amberGold-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                Mobile Number (10 Digits) *
              </label>
              <input
                type="tel"
                required
                maxLength={10}
                value={form.mobile}
                onChange={(e) => setForm({ ...form, mobile: e.target.value.replace(/\D/g, "") })}
                placeholder="9876543210"
                className="w-full px-3.5 py-2.5 bg-cream-50 border border-cream-300 rounded-xl text-xs font-mono text-charcoal-800 focus:outline-none focus:border-amberGold-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                Email Address (Optional)
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="ramesh@freshchicken.com"
                className="w-full px-3.5 py-2.5 bg-cream-50 border border-cream-300 rounded-xl text-xs text-charcoal-800 focus:outline-none focus:border-amberGold-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                Vehicle Registration No.
              </label>
              <input
                type="text"
                value={form.vehicleNumber}
                onChange={(e) => setForm({ ...form, vehicleNumber: e.target.value.toUpperCase() })}
                placeholder="KA-05-EX-4321"
                className="w-full px-3.5 py-2.5 bg-cream-50 border border-cream-300 rounded-xl text-xs font-mono uppercase text-charcoal-800 focus:outline-none focus:border-amberGold-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                Portal Login Password *
              </label>
              <input
                type="password"
                required
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 bg-cream-50 border border-cream-300 rounded-xl text-xs text-charcoal-800 focus:outline-none focus:border-amberGold-500"
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
              {submitting ? "Registering..." : "Register Executive"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
