import React from "react";
import Link from "next/link";
import { Truck, Clock, MapPin, ShieldCheck, ThermometerSnowflake } from "lucide-react";

export const metadata = {
  title: "Shipping & Delivery Policy | homemart4u Mulbagal",
  description:
    "Official shipping and delivery policy for homemart4u in Mulbagal, Karnataka. Details on 20-45 min delivery, free delivery threshold, cold-chain safety and charges.",
};

export default function ShippingPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-10">
      {/* Header */}
      <div className="space-y-3 border-b border-cream-200 pb-8 text-center sm:text-left">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cream-100 border border-cream-300 text-charcoal-700 text-xs font-semibold">
          <Truck className="w-3.5 h-3.5 text-amberGold-600" />
          <span>Hyperlocal Mulbagal Delivery Fleet</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl font-medium text-charcoal-700">
          Shipping &amp; Delivery Policy
        </h1>
        <p className="text-xs text-charcoal-500 font-mono">
          Last Updated: October 2026 &bull; Dedicated Cold-Chain Express Logistics
        </p>
      </div>

      <div className="prose prose-sm max-w-none text-charcoal-600 space-y-8 text-xs sm:text-sm leading-relaxed">
        <section className="space-y-3">
          <h2 className="font-serif text-lg font-bold text-charcoal-800 flex items-center gap-2">
            <span className="text-amberGold-600">1.</span> Hyperlocal Delivery Zones in Mulbagal
          </h2>
          <p>
            HomeMart4U provides rapid, dedicated delivery service directly from our central butchering and grocery dispatch hub located on <strong>Srinivaspur Road, Mulbagal 563131</strong>.
          </p>
          <p>
            We deliver to all principal residential and commercial areas across Mulbagal including:
          </p>
          <div className="p-3.5 bg-cream-50 border border-cream-200 rounded-xl text-xs text-charcoal-700 grid grid-cols-2 sm:grid-cols-3 gap-2">
            <span>&bull; Someshwara Temple Area</span>
            <span>&bull; Fort &amp; Main Bazaar</span>
            <span>&bull; Byrakur Road Localities</span>
            <span>&bull; Srinivaspur Road Extension</span>
            <span>&bull; Kolar Road Approaches</span>
            <span>&bull; New Bus Stand Area</span>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif text-lg font-bold text-charcoal-800 flex items-center gap-2">
            <span className="text-amberGold-600">2.</span> Delivery Charges &amp; Free Tier
          </h2>
          <p>
            Our delivery fee algorithm calculates exact road distances dynamically using GPS geocoding:
          </p>
          <div className="space-y-2 pt-1">
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs">
              <strong className="text-emerald-900 block font-bold">Within 3,000 Metres (3.0 km): FREE DELIVERY (₹0)</strong>
              <span className="text-emerald-700 text-[11px]">All orders within 3km of our Srinivaspur Road Hub enjoy completely free delivery.</span>
            </div>
            <div className="p-3 rounded-xl bg-cream-50 border border-cream-200 text-xs">
              <strong className="text-charcoal-800 block font-bold">Beyond 3,000 Metres: ₹1.50 per 100 Metres</strong>
              <span className="text-charcoal-500 text-[11px]">Example: 4.0 km = ₹15.00 delivery fee; 5.0 km = ₹30.00 delivery fee.</span>
            </div>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif text-lg font-bold text-charcoal-800 flex items-center gap-2">
            <span className="text-amberGold-600">3.</span> Delivery Timeframes &amp; Express SLA
          </h2>
          <p>
            We operate our daily delivery fleet between <strong>8:30 AM and 7:00 PM</strong>, seven days a week.
          </p>
          <ul className="list-disc pl-5 space-y-1 text-xs text-charcoal-600">
            <li><strong>Standard Target SLA:</strong> 20 to 45 minutes from the time your order is confirmed.</li>
            <li><strong>Live Tracking:</strong> Real-time status progression (Preparing &rarr; Out for Delivery &rarr; Handover) is visible on your tracking portal.</li>
            <li><strong>Inclement Weather / Road Conditions:</strong> In the event of extreme weather or road closures, dispatch notifications will update you via SMS/phone call.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif text-lg font-bold text-charcoal-800 flex items-center gap-2">
            <span className="text-amberGold-600">4.</span> Food-Grade Packaging &amp; Hygiene Standards
          </h2>
          <p>
            To preserve tenderness and biosecurity:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-xs text-charcoal-600">
            <li>Fresh meats are dressed and immediately packed in leakproof, food-grade thermal containers.</li>
            <li>Separate packaging compartments for grocery items (atta, oils, spices, dairy) prevent cross-contact.</li>
            <li>Delivery executives follow contact-safe hygiene protocols.</li>
          </ul>
        </section>
      </div>

      <div className="pt-6 border-t border-cream-200 flex flex-wrap gap-4 text-xs text-charcoal-500 justify-between items-center">
        <span>Delivery questions? Call our Hub at <a href="tel:+919035526638" className="text-amberGold-600 underline font-medium">+91 90355 26638</a></span>
        <div className="flex gap-4">
          <Link href="/terms-and-conditions" className="hover:text-charcoal-800 underline">Terms</Link>
          <Link href="/cancellation-refund-policy" className="hover:text-charcoal-800 underline">Refund Policy</Link>
          <Link href="/contact" className="hover:text-charcoal-800 underline">Contact Us</Link>
        </div>
      </div>
    </div>
  );
}
