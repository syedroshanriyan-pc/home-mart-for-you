import React from "react";
import Link from "next/link";
import { FileText, ShieldAlert, Truck, Scale } from "lucide-react";

export const metadata = {
  title: "Terms and Conditions | homemart4u Mulbagal",
  description:
    "Official terms and conditions governing the purchase of fresh halal meats, groceries, and delivery services through homemart4u in Mulbagal, Karnataka.",
};

export default function TermsAndConditionsPage() {
  const lastUpdated = "October 2026";

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-10">
      {/* Header */}
      <div className="space-y-3 border-b border-cream-200 pb-8 text-center sm:text-left">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cream-100 border border-cream-300 text-charcoal-700 text-xs font-semibold">
          <FileText className="w-3.5 h-3.5 text-amberGold-600" />
          <span>Consumer Protection (E-Commerce) Rules, 2020 Aligned</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl font-medium text-charcoal-700">
          Terms &amp; Conditions
        </h1>
        <p className="text-xs text-charcoal-500 font-mono">
          Last Updated: {lastUpdated} &bull; Applicable to all orders placed on homemart4u
        </p>
      </div>

      <div className="prose prose-sm max-w-none text-charcoal-600 space-y-8 text-xs sm:text-sm leading-relaxed">
        <section className="space-y-3">
          <h2 className="font-serif text-lg font-bold text-charcoal-800 flex items-center gap-2">
            <span className="text-amberGold-600">1.</span> Platform Agreement &amp; Eligibility
          </h2>
          <p>
            These Terms and Conditions (&ldquo;Terms&rdquo;) govern your access to and use of <strong>homemart4u</strong>, operated from our central dispatch hub on Srinivaspur Road, Mulbagal, Karnataka &ndash; 563131.
          </p>
          <p>
            By accessing our website, registering an account, or placing an order for fresh meats, cuts, or groceries, you agree to be bound by these Terms and our <Link href="/privacy-policy" className="text-amberGold-600 underline">Privacy Policy</Link>. You must be at least 18 years of age or supervised by a legal guardian to transact.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif text-lg font-bold text-charcoal-800 flex items-center gap-2">
            <span className="text-amberGold-600">2.</span> Perishable Goods &amp; Weight Tolerance
          </h2>
          <p>
            Our fresh chicken, curry cuts, and specialty meats are prepared freshly dressed to order each morning. Because butchering is an artisanal process:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-xs text-charcoal-600">
            <li>
              <strong>Weight Variation:</strong> Fresh meat products may have an acceptable natural butchering variance of &plusmn;5% in gross weight.
            </li>
            <li>
              <strong>100% Halal Guarantee:</strong> All poultry is ethically sourced from certified biosecure farms and dressed in strict conformity with authentic Halal culinary standards.
            </li>
            <li>
              <strong>Zero Stagnant Freezing:</strong> Meats are dispatched fresh and never treated with chemical tenderizers or artificial preservatives.
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif text-lg font-bold text-charcoal-800 flex items-center gap-2">
            <span className="text-amberGold-600">3.</span> Pricing, Delivery Fees &amp; Payments
          </h2>
          <p>
            All prices displayed on the storefront are in Indian Rupees (₹) inclusive of applicable taxes.
          </p>
          <ul className="list-disc pl-5 space-y-1 text-xs text-charcoal-600">
            <li><strong>Delivery Fees:</strong> Orders with delivery distance up to 3,000 metres (3km) from our hub are delivered with <strong>₹0 delivery charge</strong>. Deliveries beyond 3km are billed at ₹1.50 per 100 metres.</li>
            <li><strong>Cash on Delivery (COD):</strong> An administrative COD handling surcharge of ₹7 applies on cash orders. Online payments via UPI QR, GPay, PhonePe, and Paytm incur ₹0 surcharge.</li>
            <li><strong>Price Accuracy:</strong> In the rare event of a typographical pricing error, we reserve the right to cancel the order and provide a full refund.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif text-lg font-bold text-charcoal-800 flex items-center gap-2">
            <span className="text-amberGold-600">4.</span> Order Cancellation &amp; Immediate Preparation
          </h2>
          <p>
            Because fresh meat cuts commence kitchen preparation immediately after placement, customer-initiated cancellations are accepted only within <strong>3 minutes</strong> of order placement via the digital order tracking portal. Please review our <Link href="/cancellation-refund-policy" className="text-amberGold-600 underline">Cancellation &amp; Refund Policy</Link> for damaged or unsatisfactory item remedies.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif text-lg font-bold text-charcoal-800 flex items-center gap-2">
            <span className="text-amberGold-600">5.</span> Delivery Partner SLA &amp; Customer Obligations
          </h2>
          <p>
            Our riders aim to deliver within 20&ndash;45 minutes across all Mulbagal town localities. Customers must ensure an authorized recipient is reachable at the provided mobile number upon rider arrival.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif text-lg font-bold text-charcoal-800 flex items-center gap-2">
            <span className="text-amberGold-600">6.</span> Governing Law &amp; Dispute Resolution
          </h2>
          <p>
            These Terms are governed by and construed in accordance with the laws of India. Any legal dispute, claim, or controversy arising out of your purchases shall be subject to the exclusive jurisdiction of the competent courts in <strong>Mulbagal / Kolar District, Karnataka</strong>.
          </p>
        </section>
      </div>

      <div className="pt-6 border-t border-cream-200 flex flex-wrap gap-4 text-xs text-charcoal-500 justify-between items-center">
        <span>Questions about these terms? Contact <a href="mailto:support.homemart4u@gmail.com" className="text-amberGold-600 underline">support.homemart4u@gmail.com</a></span>
        <div className="flex gap-4">
          <Link href="/privacy-policy" className="hover:text-charcoal-800 underline">Privacy Policy</Link>
          <Link href="/shipping-policy" className="hover:text-charcoal-800 underline">Shipping Policy</Link>
          <Link href="/cancellation-refund-policy" className="hover:text-charcoal-800 underline">Refunds</Link>
        </div>
      </div>
    </div>
  );
}
