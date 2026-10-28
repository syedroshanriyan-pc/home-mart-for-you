"use client";

import React, { useState, useEffect } from "react";
import { Bell, Send, RefreshCw, AlertCircle, CheckCircle2, Users, Radio } from "lucide-react";

interface Broadcast {
  id: string;
  title: string;
  message: string;
  targetUrl: string | null;
  recipientCount: number;
  status: string;
  createdAt: string;
}

export default function AdminNotificationsPage() {
  const [broadcasts, setBroadcasts] = useState<Broadcast[]>([]);
  const [subscriberCount, setSubscriberCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  const [form, setForm] = useState({
    title: "",
    message: "",
    targetUrl: "/menu",
  });

  const fetchBroadcasts = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/notifications/broadcast");
      if (res.ok) {
        const data = await res.json();
        setBroadcasts(data.broadcasts || []);
        setSubscriberCount(data.activeSubscriberCount || 0);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBroadcasts();
  }, []);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setFeedback(null);
    try {
      const res = await fetch("/api/admin/notifications/broadcast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to send broadcast");
      }

      setFeedback({
        type: "success",
        msg: `Broadcast dispatched successfully to ${data.recipientCount || 0} active customers!`,
      });
      setForm({ title: "", message: "", targetUrl: "/menu" });
      fetchBroadcasts();
    } catch (err: any) {
      setFeedback({ type: "error", msg: err.message });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-charcoal-700">Broadcast Notifications</h1>
          <p className="text-xs text-charcoal-400 mt-1">
            Dispatch instant marketing announcements, morning fresh arrival alerts, and flash discount updates.
          </p>
        </div>
        <button
          onClick={fetchBroadcasts}
          className="flex items-center gap-2 px-3 py-2 bg-cream-200 hover:bg-cream-300 text-charcoal-700 text-xs font-semibold rounded-xl transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Compose Form */}
        <div className="lg:col-span-1 bg-white p-6 rounded-2xl border border-cream-300 shadow-subtle space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-cream-200">
            <Radio className="w-5 h-5 text-crimson-600 animate-pulse" />
            <h2 className="font-semibold text-charcoal-800 text-sm">Compose Live Broadcast</h2>
          </div>

          {feedback && (
            <div
              className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                feedback.type === "success"
                  ? "bg-forest-50 border border-forest-200 text-forest-700"
                  : "bg-crimson-50 border border-crimson-200 text-crimson-700"
              }`}
            >
              {feedback.type === "success" ? (
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
              )}
              {feedback.msg}
            </div>
          )}

          <form onSubmit={handleSend} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                Headline / Title *
              </label>
              <input
                type="text"
                required
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Fresh Morning Chicken Arrived!"
                className="w-full px-3.5 py-2.5 bg-cream-50 border border-cream-300 rounded-xl text-xs text-charcoal-800 focus:outline-none focus:border-amberGold-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                Message Body *
              </label>
              <textarea
                rows={4}
                required
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                placeholder="Order before 11 AM for guaranteed 45-minute lightning delivery. Use code MORNING10 for extra savings!"
                className="w-full px-3.5 py-2.5 bg-cream-50 border border-cream-300 rounded-xl text-xs text-charcoal-800 focus:outline-none focus:border-amberGold-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                Target App Route
              </label>
              <input
                type="text"
                value={form.targetUrl}
                onChange={(e) => setForm({ ...form, targetUrl: e.target.value })}
                placeholder="/menu or /offers"
                className="w-full px-3.5 py-2.5 bg-cream-50 border border-cream-300 rounded-xl text-xs font-mono text-charcoal-800 focus:outline-none focus:border-amberGold-500"
              />
            </div>

            <div className="p-3 bg-cream-100 rounded-xl text-[11px] text-charcoal-600 flex items-center justify-between">
              <span className="flex items-center gap-1.5 font-medium">
                <Users className="w-3.5 h-3.5 text-charcoal-400" /> Web Push Subscribers:
              </span>
              <span className="font-mono font-bold text-charcoal-800">{subscriberCount} active</span>
            </div>

            <button
              type="submit"
              disabled={sending}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-crimson-600 hover:bg-crimson-700 text-white text-xs font-semibold rounded-xl shadow-subtle transition disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              {sending ? "Transmitting..." : "Send Broadcast Now"}
            </button>
          </form>
        </div>

        {/* Right: Broadcast History */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-cream-300 overflow-hidden shadow-subtle">
          <div className="p-4 border-b border-cream-200">
            <h2 className="font-semibold text-charcoal-800 text-sm">Dispatched Broadcast History</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-cream-100 text-charcoal-500 font-semibold border-b border-cream-200">
                <tr>
                  <th className="px-6 py-4">Title & Content</th>
                  <th className="px-6 py-4">Target Route</th>
                  <th className="px-6 py-4 text-center">Recipients</th>
                  <th className="px-6 py-4">Sent At</th>
                  <th className="px-6 py-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cream-200">
                {broadcasts.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-charcoal-400">
                      {loading ? "Loading broadcast history..." : "No broadcasts dispatched yet."}
                    </td>
                  </tr>
                ) : (
                  broadcasts.map((b) => (
                    <tr key={b.id} className="hover:bg-cream-50/60 transition">
                      <td className="px-6 py-4">
                        <span className="font-semibold text-charcoal-800 block">{b.title}</span>
                        <span className="text-[11px] text-charcoal-500 line-clamp-1">
                          {b.message}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-mono text-charcoal-600">
                        {b.targetUrl || "Default"}
                      </td>
                      <td className="px-6 py-4 text-center font-mono font-bold text-charcoal-700">
                        {b.recipientCount}
                      </td>
                      <td className="px-6 py-4 font-mono text-charcoal-500 text-[11px]">
                        {new Date(b.createdAt).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-forest-50 text-forest-700 border border-forest-200">
                          <CheckCircle2 className="w-3 h-3 text-forest-600" />
                          {b.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
