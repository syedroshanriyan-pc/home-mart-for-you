import Link from "next/link";
import { ShieldAlert, Home, LogIn, PhoneCall } from "lucide-react";

export const metadata = {
  title: "403 - Access Denied | homemart4u Mulbagal",
  description: "You do not have administrative permission to view this restricted area.",
};

export default function ForbiddenPage() {
  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-16 bg-gradient-to-b from-stone-50 via-white to-stone-50">
      <div className="max-w-md w-full text-center space-y-6 bg-white p-8 sm:p-10 rounded-3xl border border-stone-200 shadow-xl shadow-stone-200/50">
        {/* Shield Icon Emblem */}
        <div className="relative mx-auto w-20 h-20 flex items-center justify-center">
          <div className="absolute inset-0 rounded-3xl bg-amber-500/10 animate-pulse" />
          <div className="relative w-20 h-20 rounded-3xl bg-gradient-to-br from-amber-50 to-amber-100 border border-amber-200 flex items-center justify-center text-amber-700 shadow-sm">
            <ShieldAlert className="w-10 h-10 stroke-[1.75]" />
          </div>
        </div>

        {/* Heading & Details */}
        <div className="space-y-2">
          <span className="text-[11px] font-mono font-bold tracking-widest uppercase text-amber-800 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
            HTTP 403 &bull; Protected Area
          </span>
          <h1 className="text-2xl font-black text-stone-900 tracking-tight">
            Access Restricted
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed max-w-sm mx-auto">
            You do not have the required administrative clearance to access this resource. If you believe this is a mistake, please sign in with an authorized administrator account.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Link
            href="/login?redirect=/admin"
            className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold shadow-md shadow-stone-900/10 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Admin Sign In</span>
          </Link>

          <Link
            href="/"
            className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold border border-stone-200 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Return Home</span>
          </Link>
        </div>

        {/* Support Help */}
        <div className="pt-6 border-t border-stone-100">
          <p className="text-xs text-stone-400 mb-1">Store Operations Hotline</p>
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
