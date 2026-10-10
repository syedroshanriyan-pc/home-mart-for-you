"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/ui/Logo";
import { MapPin, Phone, Clock, ShieldCheck, Truck, Sparkles } from "lucide-react";

export const Footer: React.FC = () => {
  const pathname = usePathname();

  // Hide on admin or delivery sub-surfaces
  if (pathname.startsWith("/admin") || pathname.startsWith("/delivery")) {
    return null;
  }

  return (
    <footer className="bg-charcoal-600 text-cream-100 pt-16 pb-12 border-t border-charcoal-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Core Value Props Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-12 border-b border-charcoal-400">
          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-charcoal-500 text-amberGold-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-serif text-sm font-semibold text-cream-50">
                100% Farm Fresh Daily
              </h4>
              <p className="text-xs text-charcoal-50 mt-1">
                Zero frozen storage. Freshly portioned and customized upon your order.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-charcoal-500 text-amberGold-400">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-serif text-sm font-semibold text-cream-50">
                Express Mulbagal Delivery
              </h4>
              <p className="text-xs text-charcoal-50 mt-1">
                First 3 km free. Target delivery in approximately 20 minutes across town.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-charcoal-500 text-amberGold-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-serif text-sm font-semibold text-cream-50 flex items-center gap-1.5">
                <span>100% Halal Custom Cuts</span>
              </h4>
              <p className="text-xs text-charcoal-50 mt-1">
                Hand-slaughtered strictly per Islamic dietary standards. Prepared in sanitised clean rooms.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-charcoal-500 text-amberGold-400">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-serif text-sm font-semibold text-cream-50">
                Open All 7 Days
              </h4>
              <p className="text-xs text-charcoal-50 mt-1">
                6:30 AM to 9:00 PM. Serving breakfast, lunch, and dinner deliveries.
              </p>
            </div>
          </div>
        </div>

        {/* Main Links & AEO Factual Quick Directory */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 py-12 border-b border-charcoal-400">
          {/* Brand Info */}
          <div className="space-y-4">
            <Logo variant="light" size="md" />
            <p className="text-xs text-charcoal-50 leading-relaxed">
              Mulbagal&apos;s premier fresh meat boutique. Supplying premium grade tender chicken,
              traditional country desi eggs, and artisanal masala cuts directly to your doorstep.
            </p>
            <div className="space-y-1.5 text-xs text-cream-200">
              <p className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-amberGold-400 flex-shrink-0" />
                Main Bazaar Road, Near Clock Tower, Mulbagal
              </p>
              <p className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-amberGold-400 flex-shrink-0" />
                <a href="tel:+919845012345" className="hover:text-amberGold-300 transition-colors">
                  +91 98450 12345
                </a>
              </p>
              <p className="flex items-center gap-2">
                <span className="text-amberGold-400 text-xs">✉</span>
                <a href="mailto:support@freshchicken.com" className="hover:text-amberGold-300 transition-colors">
                  support@freshchicken.com
                </a>
              </p>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-serif text-sm font-semibold text-cream-50 mb-3 tracking-wide">
              Navigation
            </h4>
            <ul className="space-y-2 text-xs text-charcoal-50">
              <li>
                <Link href="/menu" className="hover:text-cream-50 transition-colors">
                  Complete Menu & Pricing
                </Link>
              </li>
              <li>
                <Link href="/offers" className="hover:text-cream-50 transition-colors">
                  Today&apos;s Offers & Coupons
                </Link>
              </li>
              <li>
                <Link href="/location" className="hover:text-cream-50 transition-colors">
                  Mulbagal Delivery Zones
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-cream-50 transition-colors">
                  Our Quality & Hygiene Standard
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-cream-50 transition-colors">
                  Help & Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Factual Answer Guide (AEO) */}
          <div className="md:col-span-2">
            <h4 className="font-serif text-sm font-semibold text-cream-50 mb-3 tracking-wide">
              Ordering & Delivery Policies (Quick Reference)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-charcoal-50">
              <div className="bg-charcoal-500/50 p-3 rounded-xl border border-charcoal-400">
                <strong className="text-cream-50 block mb-1">No Minimum Order:</strong>
                Order any quantity you need—from 500g chicken cuts, fresh fish, and desi eggs to chilled drinks.
              </div>
              <div className="bg-charcoal-500/50 p-3 rounded-xl border border-charcoal-400">
                <strong className="text-cream-50 block mb-1">Delivery Charges:</strong>
                First 3 km from Mulbagal store is <strong>FREE</strong>. Beyond 3 km: ₹1.50 per 100 metres.
              </div>
              <div className="bg-charcoal-500/50 p-3 rounded-xl border border-charcoal-400">
                <strong className="text-cream-50 block mb-1">Delivery Speed:</strong>
                Operational target is ~20 minutes for orders placed within Mulbagal town.
              </div>
              <div className="bg-charcoal-500/50 p-3 rounded-xl border border-charcoal-400">
                <strong className="text-cream-50 block mb-1">Payment Options:</strong>
                UPI (Google Pay, PhonePe, Paytm) and Cash on Delivery (COD +₹7 surcharge).
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Copyright & Sub-surfaces */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-charcoal-50 gap-4">
          <p>&copy; {new Date().getFullYear()} Fresh Chicken. All rights reserved. Mulbagal, Karnataka.</p>
          <div className="flex items-center gap-6">
            <Link href="/location" className="hover:text-cream-50 transition-colors">
              Delivery Coverage
            </Link>
            <Link href="/about" className="hover:text-cream-50 transition-colors">
              Freshness Standard
            </Link>
            <Link href="/contact" className="hover:text-cream-50 transition-colors">
              Support & Inquiries
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
