"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Logo } from "@/components/ui/Logo";
import { Bike, Power, LogOut, CheckCircle2, ShieldCheck, MapPin } from "lucide-react";

export default function DeliveryLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [toggling, setToggling] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login?redirect=/delivery");
    }
  }, [user, loading, router]);

  const toggleAvailability = async () => {
    try {
      setToggling(true);
      const res = await fetch("/api/delivery/availability", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isAvailable: !isOnline }),
      });
      if (res.ok) {
        setIsOnline(!isOnline);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setToggling(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-charcoal-800 text-cream-100 text-xs font-mono">
        Authenticating Delivery Executive...
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (user.role !== "DELIVERY_AGENT" && user.role !== "ADMIN" && user.role !== "SUPER_ADMIN") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-cream-100 px-4 text-center">
        <div className="max-w-md bg-white p-8 rounded-3xl border border-cream-300 shadow-card space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-amberGold-100 text-amberGold-700 flex items-center justify-center mx-auto">
            <Bike className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-serif font-bold text-charcoal-800">
            Delivery Fleet Clearance Required
          </h2>
          <p className="text-xs text-charcoal-500 leading-relaxed">
            This portal is exclusively for registered delivery riders. Your current account ({user.mobile}) is registered as a customer.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row gap-2 justify-center">
            <Link
              href="/"
              className="px-5 py-2.5 bg-charcoal-700 hover:bg-charcoal-800 text-cream-50 text-xs font-semibold rounded-xl transition"
            >
              Back to Storefront
            </Link>
            <button
              onClick={() => logout()}
              className="px-5 py-2.5 bg-cream-200 hover:bg-cream-300 text-charcoal-700 text-xs font-semibold rounded-xl transition"
            >
              Sign In as Rider
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream-100 flex flex-col">
      {/* Top Header */}
      <header className="bg-charcoal-700 text-cream-50 sticky top-0 z-40 border-b border-charcoal-600 shadow-subtle">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/delivery" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-crimson-600 flex items-center justify-center text-white">
                <Bike className="w-5 h-5" />
              </div>
              <div>
                <span className="font-serif font-bold text-sm text-cream-50 block leading-tight">
                  Fresh Chicken
                </span>
                <span className="text-[10px] text-amberGold-300 font-mono tracking-wider block">
                  Rider Portal
                </span>
              </div>
            </Link>
          </div>

          {/* Right: Duty Switch & Profile */}
          <div className="flex items-center gap-3">
            <button
              onClick={toggleAvailability}
              disabled={toggling}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition shadow-subtle ${
                isOnline
                  ? "bg-forest-600 text-white hover:bg-forest-700"
                  : "bg-charcoal-600 text-cream-300 hover:bg-charcoal-500"
              }`}
            >
              <Power className="w-3.5 h-3.5" />
              <span>{isOnline ? "ON DUTY" : "OFF DUTY"}</span>
            </button>

            <button
              onClick={() => logout()}
              title="Logout"
              className="p-2 text-cream-300 hover:text-white rounded-xl hover:bg-charcoal-600 transition"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Rider Status Bar */}
        <div className="bg-charcoal-800 px-4 py-1.5 border-t border-charcoal-600/50">
          <div className="max-w-2xl mx-auto flex items-center justify-between text-[11px] text-cream-300">
            <span>
              Executive: <strong className="text-white font-medium">{user.name}</strong> ({user.mobile})
            </span>
            <span className="flex items-center gap-1">
              <span className={`w-2 h-2 rounded-full ${isOnline ? "bg-forest-400 animate-pulse" : "bg-charcoal-400"}`} />
              {isOnline ? "Ready for assignments" : "Not receiving runs"}
            </span>
          </div>
        </div>
      </header>

      {/* Main Body */}
      <main className="flex-1 max-w-2xl w-full mx-auto px-4 py-5">
        {children}
      </main>
    </div>
  );
}
