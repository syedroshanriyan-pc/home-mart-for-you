"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Wrench, RefreshCw, PhoneCall, Clock, ShieldCheck } from "lucide-react";

export default function MaintenancePage() {
  const [checking, setChecking] = useState(false);

  const handleRefresh = () => {
    setChecking(true);
    setTimeout(() => {
      window.location.href = "/";
    }, 800);
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-16 bg-gradient-to-b from-stone-50 via-white to-stone-50">
      <div className="max-w-md w-full text-center space-y-6 bg-white p-8 sm:p-10 rounded-3xl border border-stone-200 shadow-xl shadow-stone-200/50">
        {/* Wrench Emblem */}
        <div className="relative mx-auto w-20 h-20 flex items-center justify-center">
          <div className="absolute inset-0 rounded-3xl bg-amber-500/15 animate-ping opacity-75" />
          <div className="relative w-20 h-20 rounded-3xl bg-gradient-to-br from-amber-50 to-amber-100 border border-amber-300 flex items-center justify-center text-amber-700 shadow-sm">
            <Wrench className="w-10 h-10 stroke-[1.75]" />
          </div>
        </div>

        {/* Heading & Details */}
        <div className="space-y-2">
          <span className="text-[11px] font-mono font-bold tracking-widest uppercase text-amber-900 bg-amber-100 px-3 py-1 rounded-full border border-amber-300">
            HTTP 503 &bull; Scheduled Maintenance
          </span>
          <h1 className="text-2xl font-black text-stone-900 tracking-tight">
            Store Systems Upgrading
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed max-w-sm mx-auto">
            We are currently optimizing our cloud order dispatch and live delivery systems to serve Mulbagal faster. All placed orders remain securely recorded.
          </p>
        </div>

        {/* Live Status Pill */}
        <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200 text-left space-y-2 text-xs">
          <div className="flex items-center justify-between text-stone-700">
            <span className="flex items-center gap-1.5 font-medium">
              <Clock className="w-3.5 h-3.5 text-amber-600" />
              <span>Estimated Downtime</span>
            </span>
            <span className="font-bold text-stone-900">~5-10 minutes</span>
          </div>
          <div className="flex items-center justify-between text-stone-700">
            <span className="flex items-center gap-1.5 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Database Integrity</span>
            </span>
            <span className="font-bold text-emerald-600">100% Protected</span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="space-y-3 pt-2">
          <button
            onClick={handleRefresh}
            disabled={checking}
            className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold shadow-md shadow-stone-900/10 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-75"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${checking ? "animate-spin" : ""}`} />
            <span>{checking ? "Checking System Status..." : "Refresh Store Status"}</span>
          </button>
        </div>

        {/* Direct Phone Order Hotline */}
        <div className="pt-6 border-t border-stone-100">
          <p className="text-xs text-stone-500 mb-1">Need to place an urgent meat order immediately?</p>
          <a
            href="tel:+919035526638"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-600 hover:text-rose-700 transition-colors"
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span>Call Store Direct: +91 90355 26638</span>
          </a>
        </div>
      </div>
    </div>
  );
}
