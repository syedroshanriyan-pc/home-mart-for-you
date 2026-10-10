import Link from "next/link";
import { ArrowLeft, Home, ShoppingBag, PhoneCall, HelpCircle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-16 bg-gradient-to-b from-stone-50 to-white">
      <div className="max-w-lg w-full text-center">
        {/* Animated Badge */}
        <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-rose-50 border-4 border-rose-100 text-rose-600 mb-6 shadow-sm">
          <HelpCircle className="w-12 h-12 stroke-[1.5]" />
        </div>

        <h1 className="text-6xl font-black text-stone-900 tracking-tight mb-2">404</h1>
        <h2 className="text-2xl font-bold text-stone-800 mb-3">Fresh Cut Not Found</h2>
        <p className="text-stone-600 text-sm md:text-base leading-relaxed mb-8">
          The page or product cut you are searching for might have been moved, renamed, or is currently unavailable in Mulbagal.
        </p>

        {/* Quick Action Navigation */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-8">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold shadow-md shadow-rose-600/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Home className="w-4 h-4" />
            Back to Home
          </Link>
          <Link
            href="/menu"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white border border-stone-200 hover:border-rose-300 text-stone-800 font-semibold shadow-sm hover:bg-rose-50/50 transition-all"
          >
            <ShoppingBag className="w-4 h-4 text-rose-600" />
            Browse Fresh Cuts
          </Link>
        </div>

        {/* Support contact info */}
        <div className="pt-6 border-t border-stone-200">
          <p className="text-xs text-stone-500 mb-2">Need immediate assistance with an order?</p>
          <a
            href="tel:+919845012345"
            className="inline-flex items-center gap-2 text-sm font-semibold text-rose-600 hover:text-rose-700 transition-colors"
          >
            <PhoneCall className="w-4 h-4" />
            Call Store: +91 98450 12345
          </a>
        </div>
      </div>
    </div>
  );
}
