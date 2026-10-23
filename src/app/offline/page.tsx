"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { WifiOff, RefreshCw, ShoppingBag, PhoneCall } from "lucide-react";

export default function OfflinePage() {
  const [isOnline, setIsOnline] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);

  useEffect(() => {
    setIsOnline(navigator.onLine);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const handleRetry = () => {
    setIsRetrying(true);
    setTimeout(() => {
      if (navigator.onLine) {
        window.location.href = "/";
      } else {
        setIsRetrying(false);
      }
    }, 1000);
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-16 bg-gradient-to-b from-stone-50 via-white to-stone-50">
      <div className="max-w-md w-full text-center space-y-6 bg-white p-8 sm:p-10 rounded-3xl border border-stone-200 shadow-xl shadow-stone-200/50">
        {/* WifiOff Emblem */}
        <div className="relative mx-auto w-20 h-20 flex items-center justify-center">
          <div className="absolute inset-0 rounded-3xl bg-stone-500/10 animate-pulse" />
          <div className="relative w-20 h-20 rounded-3xl bg-gradient-to-br from-stone-100 to-stone-200 border border-stone-300 flex items-center justify-center text-stone-600 shadow-sm">
            <WifiOff className="w-10 h-10 stroke-[1.75]" />
          </div>
        </div>

        {/* Heading & Details */}
        <div className="space-y-2">
          <span className="text-[11px] font-mono font-bold tracking-widest uppercase text-stone-700 bg-stone-100 px-3 py-1 rounded-full border border-stone-200">
            {isOnline ? "Connection Restored" : "Connection Lost"}
          </span>
          <h1 className="text-2xl font-black text-stone-900 tracking-tight">
            You Are Currently Offline
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed max-w-sm mx-auto">
            We couldn&apos;t reach the server. Please check your Wi-Fi or mobile data network. Any items added to your cart remain safely stored in your browser.
          </p>
        </div>

        {/* Action Controls */}
        <div className="space-y-3 pt-2">
          <button
            onClick={handleRetry}
            disabled={isRetrying}
            className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold shadow-md shadow-stone-900/10 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-75"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRetrying ? "animate-spin" : ""}`} />
            <span>{isRetrying ? "Testing Network..." : "Try Reconnecting"}</span>
          </button>

          <Link
            href="/cart"
            className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold border border-stone-200 transition-all"
          >
            <ShoppingBag className="w-3.5 h-3.5 text-stone-600" />
            <span>View Offline Cart</span>
          </Link>
        </div>

        {/* Support Help */}
        <div className="pt-6 border-t border-stone-100">
          <p className="text-xs text-stone-400 mb-1">Having persistent connectivity issues?</p>
          <a
            href="tel:+919035526638"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-700 hover:text-rose-600 transition-colors"
          >
            <PhoneCall className="w-3.5 h-3.5 text-rose-600" />
            <span>+91 90355 26638</span>
          </a>
        </div>
      </div>
    </div>
  );
}
