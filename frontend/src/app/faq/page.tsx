import React from "react";
import Link from "next/link";
import { HelpCircle, ChevronRight, Phone, MessageSquare } from "lucide-react";

export const metadata = {
  title: "Frequently Asked Questions (FAQ) | homemart4u Mulbagal",
  description:
    "Common questions about fresh chicken cuts, halal certification, delivery timelines in Mulbagal, payment modes, and cutting styles at homemart4u.",
};

export default function FAQPage() {
  const faqs = [
    {
      category: "Meat Quality & Halal Sourcing",
      items: [
        {
          q: "How fresh is your chicken?",
          a: "Our chicken is sourced directly from certified biosecure farms around Kolar and Mulbagal. We dress and butcher poultry each morning to order, strictly guaranteeing zero standing frozen meat.",
        },
        {
          q: "Is the meat 100% Halal?",
          a: "Yes. All our chicken is 100% hand-slaughtered by trained Muslim slaughtermen in accordance with strict Halal culinary and hygiene protocols. No mechanical slaughter or chemical water chilling is ever used.",
        },
        {
          q: "What cutting styles can I choose from?",
          a: "We offer tailored cuts for all traditional recipes: Small Curry Cut (ideal for gravies), Medium Biryani Cut (succulent pieces with bone), Boneless Breast Fillets (lean high-protein), Drumsticks, Lollipop wings, and Liver/Gizzard.",
        },
      ],
    },
    {
      category: "Delivery & Areas Covered",
      items: [
        {
          q: "How fast is delivery in Mulbagal?",
          a: "Our target delivery time is 20 to 45 minutes across Mulbagal town from our central Srinivaspur Road Hub.",
        },
        {
          q: "Is delivery free?",
          a: "Delivery is completely FREE (₹0) for all orders within 3,000 metres (3 km) of our Srinivaspur Road Hub. Deliveries beyond 3km are billed at an affordable ₹1.50 per 100 metres.",
        },
        {
          q: "What are your operating hours?",
          a: "We are open and delivering all 7 days a week from 8:30 AM to 7:00 PM.",
        },
      ],
    },
    {
      category: "Payments, COD & Cancellations",
      items: [
        {
          q: "What payment options are available?",
          a: "We accept Cash on Delivery (COD) as well as instant zero-contact online payments via dynamic UPI QR code compatible with Google Pay, PhonePe, Paytm, BHIM, and all banking apps.",
        },
        {
          q: "Why is there a ₹7 COD surcharge?",
          a: "A nominal ₹7 surcharge is applied on Cash on Delivery orders to offset cash management and rider currency transit insurance. Paying online via UPI is 100% free of surcharge.",
        },
        {
          q: "Can I cancel my order after placing it?",
          a: "Yes, you can cancel within 3 minutes of order placement directly from your Order Tracking page before butchering preparation begins. After this grace window, preparation has commenced.",
        },
        {
          q: "What if an item is damaged or substandard?",
          a: "We offer a 100% replacement or refund guarantee for any defective or damaged items reported within 2 hours of handover with photo proof to our customer desk.",
        },
      ],
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-12">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cream-100 border border-cream-300 text-charcoal-700 text-xs font-semibold">
          <HelpCircle className="w-3.5 h-3.5 text-amberGold-600" />
          <span>Customer Help Center</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl font-medium text-charcoal-700">
          Frequently Asked Questions
        </h1>
        <p className="text-xs sm:text-sm text-charcoal-500">
          Quick answers to common questions about our fresh cuts, daily groceries, and delivery service in Mulbagal.
        </p>
      </div>

      {/* FAQ Sections */}
      <div className="space-y-10">
        {faqs.map((cat, idx) => (
          <div key={idx} className="space-y-4">
            <h2 className="font-serif text-lg font-bold text-charcoal-800 border-b border-cream-200 pb-2">
              {cat.category}
            </h2>
            <div className="space-y-3">
              {cat.items.map((item, i) => (
                <div
                  key={i}
                  className="bg-cream-50 p-4 sm:p-5 rounded-2xl border border-cream-200 space-y-1.5"
                >
                  <h3 className="font-semibold text-xs sm:text-sm text-charcoal-800 flex items-start gap-2">
                    <span className="text-amberGold-600 font-bold">Q:</span>
                    <span>{item.q}</span>
                  </h3>
                  <p className="text-xs text-charcoal-600 pl-5 leading-relaxed font-light">
                    {item.a}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Need more help card */}
      <div className="p-6 rounded-2xl bg-amberGold-50 border border-amberGold-200 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="font-serif text-base font-semibold text-charcoal-800">
            Have a different question?
          </h3>
          <p className="text-xs text-charcoal-600 mt-0.5">
            Our hub customer support team is available daily from 8:30 AM to 7:00 PM.
          </p>
        </div>
        <div className="flex gap-3">
          <a
            href="tel:+919035526638"
            className="flex items-center gap-1.5 px-4 py-2 bg-charcoal-800 text-white rounded-xl text-xs font-bold hover:bg-charcoal-700 transition"
          >
            <Phone className="w-3.5 h-3.5 text-amberGold-400" />
            <span>Call Hub</span>
          </a>
          <Link
            href="/contact"
            className="flex items-center gap-1.5 px-4 py-2 bg-amberGold-500 text-charcoal-900 rounded-xl text-xs font-bold hover:bg-amberGold-600 transition"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Contact Us</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
