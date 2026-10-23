"use client";

import React, { useEffect } from "react";
import { AlertOctagon, RefreshCw, PhoneCall } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global critical application error:", error);
  }, [error]);

  return (
    <html lang="en">
      <body className="bg-stone-50 font-sans antialiased text-stone-900 m-0 min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center space-y-6 bg-white p-8 rounded-3xl border border-stone-200 shadow-xl">
          <div className="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto shadow-sm">
            <AlertOctagon className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h1 className="text-xl font-black text-stone-900">Application Error</h1>
            <p className="text-xs text-stone-600 leading-relaxed">
              A critical issue occurred while rendering the page. You can safely retry or return to the main store.
            </p>
          </div>

          <div className="flex gap-3 justify-center">
            <button
              onClick={() => reset()}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold transition"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry</span>
            </button>
            <a
              href="/"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold transition"
            >
              <span>Reload Store</span>
            </a>
          </div>

          <div className="pt-4 border-t border-stone-100 text-[11px] text-stone-500">
            <span>Store Support: </span>
            <a href="tel:+919035526638" className="font-bold text-stone-800 hover:underline">
              +91 90355 26638
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
