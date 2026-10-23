import React from "react";
import Link from "next/link";
import { RefreshCw, Clock, AlertTriangle, CheckCircle, ShieldCheck } from "lucide-react";

export const metadata = {
  title: "Cancellation & Refund Policy | homemart4u Mulbagal",
  description:
    "Cancellation and refund policy for homemart4u. Balanced consumer protection terms for perishable meats and groceries in accordance with Indian e-commerce consumer laws.",
};

export default function CancellationRefundPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-10">
      {/* Header */}
      <div className="space-y-3 border-b border-cream-200 pb-8 text-center sm:text-left">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cream-100 border border-cream-300 text-charcoal-700 text-xs font-semibold">
          <RefreshCw className="w-3.5 h-3.5 text-amberGold-600" />
          <span>Consumer Protection Act &amp; Food Safety Aligned</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl font-medium text-charcoal-700">
          Cancellation &amp; Refund Policy
        </h1>
        <p className="text-xs text-charcoal-500 font-mono">
          Last Updated: October 2026 &bull; HomeMart4U Customer Assurance Guarantee
        </p>
      </div>

      <div className="prose prose-sm max-w-none text-charcoal-600 space-y-8 text-xs sm:text-sm leading-relaxed">
        <section className="space-y-3">
          <h2 className="font-serif text-lg font-bold text-charcoal-800 flex items-center gap-2">
            <span className="text-amberGold-600">1.</span> Order Cancellation Window
          </h2>
          <p>
            Because our fresh poultry cuts are dressed to individual customer specifications immediately after order placement to ensure zero chiller standing time:
          </p>
          <div className="p-4 rounded-2xl bg-cream-50 border border-cream-200 text-xs space-y-2">
            <div className="flex items-center gap-2 text-charcoal-800 font-bold">
              <Clock className="w-4 h-4 text-amberGold-600" />
              <span>3-Minute Grace Cancellation Period</span>
            </div>
            <p className="text-charcoal-600">
              You may cancel any placed order directly from the order details screen within <strong>3 minutes</strong> of order placement without any penalty or deduction. Any prepaid online amount will be refunded immediately.
            </p>
            <p className="text-charcoal-500 text-[11px]">
              Once kitchen butchering and packaging have commenced (status: <em>PREPARING</em> or <em>OUT_FOR_DELIVERY</em>), routine change-of-mind cancellations cannot be accommodated due to the perishable nature of butchered meat.
            </p>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif text-lg font-bold text-charcoal-800 flex items-center gap-2">
            <span className="text-amberGold-600">2.</span> Damaged, Defective, or Incorrect Goods Guarantee
          </h2>
          <p>
            In compliance with the <strong>Consumer Protection (E-Commerce) Rules, 2020</strong>, we do <strong>not</strong> operate a blanket &ldquo;no-returns/no-refunds&rdquo; policy. You are fully entitled to a prompt 100% refund or free priority replacement in any of the following circumstances:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-xs text-charcoal-600">
            <li>
              <strong>Quality / Freshness Defect:</strong> The meat or grocery item received is spoiled, malodorous, broken in transit, or visibly substandard upon delivery handover.
            </li>
            <li>
              <strong>Incorrect Product or Variant:</strong> You received a different cut or product from what was ordered (e.g., curry cut instead of boneless breast, or wrong grocery item).
            </li>
            <li>
              <strong>Missing Items:</strong> An item billed on your invoice was omitted from the delivery package.
            </li>
            <li>
              <strong>Packaging Seal Compromise:</strong> Meat package seal arrived torn or compromised.
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif text-lg font-bold text-charcoal-800 flex items-center gap-2">
            <span className="text-amberGold-600">3.</span> How to Report a Quality Claim
          </h2>
          <p>
            Due to the rapid perishability of fresh meats, claims must be reported within <strong>2 hours</strong> of handover:
          </p>
          <div className="p-3.5 bg-cream-100 rounded-xl border border-cream-300 text-xs space-y-1.5 text-charcoal-700">
            <p>1. Take a clear photograph or video showing the affected item and invoice label.</p>
            <p>2. Send it via WhatsApp or email to: <a href="mailto:support.homemart4u@gmail.com" className="text-amberGold-600 underline font-semibold">support.homemart4u@gmail.com</a> or phone <strong>+91 79751 37618</strong>.</p>
            <p>3. Our Hub manager will inspect and approve the claim within 30 minutes during operating hours.</p>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif text-lg font-bold text-charcoal-800 flex items-center gap-2">
            <span className="text-amberGold-600">4.</span> Refund Timelines &amp; Settlement
          </h2>
          <ul className="list-disc pl-5 space-y-1 text-xs text-charcoal-600">
            <li><strong>UPI &amp; Online Payments:</strong> Refunds are initiated through the gateway within 24 hours and credited to the original source bank account within 2 to 5 business days.</li>
            <li><strong>Cash on Delivery (COD):</strong> For cash-settled orders, approved refunds are disbursed instantly via UPI transfer to the customer&apos;s verified VPA or mobile number.</li>
          </ul>
        </section>
      </div>

      <div className="pt-6 border-t border-cream-200 flex flex-wrap gap-4 text-xs text-charcoal-500 justify-between items-center">
        <span>Need assistance with a past order? Visit <Link href="/account" className="text-amberGold-600 underline font-medium">My Orders</Link></span>
        <div className="flex gap-4">
          <Link href="/terms-and-conditions" className="hover:text-charcoal-800 underline">Terms &amp; Conditions</Link>
          <Link href="/grievance-redressal" className="hover:text-charcoal-800 underline">Grievance Desk</Link>
          <Link href="/contact" className="hover:text-charcoal-800 underline">Contact Support</Link>
        </div>
      </div>
    </div>
  );
}
