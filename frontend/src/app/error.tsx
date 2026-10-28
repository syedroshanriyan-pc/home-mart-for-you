"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw, Home, PhoneCall, ShieldAlert } from "lucide-react";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an analytics or error tracking service
    console.error("Application runtime error:", error);
  }, [error]);

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-16 bg-gradient-to-b from-stone-50 via-white to-stone-50">
      <div className="max-w-md w-full text-center space-y-6 bg-white p-8 sm:p-10 rounded-3xl border border-stone-200 shadow-xl shadow-stone-200/50">
        {/* Animated Warning Emblem */}
        <div className="relative mx-auto w-20 h-20 flex items-center justify-center">
          <div className="absolute inset-0 rounded-3xl bg-rose-500/10 animate-ping opacity-75" />
          <div className="relative w-20 h-20 rounded-3xl bg-gradient-to-br from-rose-50 to-rose-100 border border-rose-200 flex items-center justify-center text-rose-600 shadow-sm">
            <AlertTriangle className="w-10 h-10 stroke-[1.75]" />
          </div>
        </div>

        {/* Heading & Context */}
        <div className="space-y-2">
          <span className="text-[11px] font-mono font-bold tracking-widest uppercase text-rose-600 bg-rose-50 px-3 py-1 rounded-full border border-rose-200">
            System Notice
          </span>
          <h1 className="text-2xl font-black text-stone-900 tracking-tight">
            Something Went Wrong
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed max-w-sm mx-auto">
            We encountered an unexpected issue while processing your request. Our system security guardrails have preserved your session.
          </p>
        </div>

        {/* Technical Digest (Non-sensitive) */}
        {error?.digest && (
          <div className="text-[10px] font-mono text-stone-400 bg-stone-50 py-1.5 px-3 rounded-lg border border-stone-200 max-w-xs mx-auto truncate">
            Incident ID: {error.digest}
          </div>
        )}

        {/* Action Controls */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            onClick={() => reset()}
            className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold shadow-md shadow-stone-900/10 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Try Again</span>
          </button>

          <Link
            href="/"
            className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white border border-stone-200 hover:bg-stone-50 text-stone-800 text-xs font-bold shadow-2xs transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Home className="w-3.5 h-3.5 text-stone-500" />
            <span>Back to Store</span>
          </Link>
        </div>

        {/* Customer Support Footer */}
        <div className="pt-6 border-t border-stone-100 flex flex-col items-center gap-2">
          <span className="text-[11px] text-stone-500">Need immediate help with your order?</span>
          <a
            href="tel:+919035526638"
            className="inline-flex items-center gap-2 text-xs font-bold text-amber-700 hover:text-amber-800 transition"
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span>Call Support: +91 90355 26638</span>
          </a>
        </div>
      </div>
    </div>
  );
}
