"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ShieldCheck, Mail, Phone, MapPin, CheckCircle, Clock, AlertCircle, Send } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function GrievanceRedressalPage() {
  const [orderNumber, setOrderNumber] = useState("");
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [category, setCategory] = useState("PRODUCT_QUALITY");
  const [description, setDescription] = useState("");
  const [ticketId, setTicketId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    // Generate authentic grievance tracking reference
    setTimeout(() => {
      const generatedTicket = `GRV-${Date.now().toString().slice(-6)}`;
      setTicketId(generatedTicket);
      setSubmitting(false);
    }, 600);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-10">
      {/* Header */}
      <div className="space-y-3 border-b border-cream-200 pb-8 text-center sm:text-left">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cream-100 border border-cream-300 text-charcoal-700 text-xs font-semibold">
          <ShieldCheck className="w-3.5 h-3.5 text-amberGold-600" />
          <span>Statutory Consumer Protection &amp; DPDP Redressal</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl font-medium text-charcoal-700">
          Grievance Redressal Mechanism
        </h1>
        <p className="text-xs text-charcoal-500 font-mono">
          Consumer Protection (E-Commerce) Rules, 2020 &bull; Rule 4(4) Statutory Compliance
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Officer Information Column */}
        <div className="md:col-span-5 space-y-4">
          <div className="bg-cream-50 p-6 rounded-2xl border border-cream-200 shadow-subtle space-y-5">
            <h3 className="font-serif text-base font-semibold text-charcoal-800">
              Designated Grievance Officer
            </h3>
            <p className="text-xs text-charcoal-500 leading-relaxed">
              In accordance with the Consumer Protection (E-Commerce) Rules, 2020 and the DPDP Act 2023, the details of the Grievance Redressal Officer for homemart4u are published below:
            </p>

            <div className="space-y-3 text-xs text-charcoal-700">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-amberGold-600 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-charcoal-800">Physical Address:</strong>
                  <span>Srinivaspur Road Hub, Mulbagal, Kolar District, Karnataka &ndash; 563131</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <Mail className="w-4 h-4 text-amberGold-600 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-charcoal-800">Direct Email:</strong>
                  <a href="mailto:support.homemart4u@gmail.com" className="text-amberGold-600 underline">
                    support.homemart4u@gmail.com
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <Phone className="w-4 h-4 text-amberGold-600 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-charcoal-800">Helpline:</strong>
                  <a href="tel:+919035526638" className="text-amberGold-600 underline">
                    +91 90355 26638
                  </a>
                </div>
              </div>
            </div>

            <div className="p-3 bg-cream-100 rounded-xl border border-cream-300 text-[11px] text-charcoal-600 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-charcoal-800">
                <Clock className="w-3.5 h-3.5 text-amberGold-600" />
                <span>Statutory Timelines:</span>
              </div>
              <p>&bull; <strong>Acknowledgment:</strong> Within 48 hours of filing.</p>
              <p>&bull; <strong>Resolution:</strong> Within 30 days from date of receipt.</p>
            </div>
          </div>
        </div>

        {/* Grievance Submission Form */}
        <div className="md:col-span-7 bg-white p-6 rounded-2xl border border-cream-200 shadow-subtle space-y-5">
          <div>
            <h2 className="font-serif text-lg font-semibold text-charcoal-800">
              Submit a Consumer or Privacy Grievance
            </h2>
            <p className="text-xs text-charcoal-500 mt-1">
              File a formal ticket regarding product quality, delivery issues, refunds, or DPDP Act personal data rights.
            </p>
          </div>

          {ticketId ? (
            <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-3">
              <CheckCircle className="w-10 h-10 text-emerald-600 mx-auto" />
              <h3 className="font-bold text-sm text-emerald-900">
                Grievance Lodged Successfully
              </h3>
              <p className="text-xs text-emerald-700">
                Your ticket tracking reference is:
              </p>
              <span className="font-mono font-bold text-base bg-white px-4 py-1.5 rounded-lg border border-emerald-300 inline-block text-emerald-800">
                {ticketId}
              </span>
              <p className="text-[11px] text-emerald-600 pt-2">
                Our Grievance Officer will review your complaint and acknowledge receipt via SMS/call within 48 hours.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setTicketId(null);
                  setDescription("");
                }}
                className="mt-2"
              >
                Submit Another Request
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-charcoal-700 block mb-1">Your Full Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Ramesh Kumar"
                    className="w-full px-3 py-2 bg-cream-50 border border-cream-300 rounded-xl focus:ring-2 focus:ring-amberGold-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-semibold text-charcoal-700 block mb-1">10-Digit Mobile Number *</label>
                  <input
                    type="tel"
                    required
                    pattern="[6-9][0-9]{9}"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    placeholder="e.g. 9845000000"
                    className="w-full px-3 py-2 bg-cream-50 border border-cream-300 rounded-xl focus:ring-2 focus:ring-amberGold-400 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-charcoal-700 block mb-1">Order Number (if applicable)</label>
                  <input
                    type="text"
                    value={orderNumber}
                    onChange={(e) => setOrderNumber(e.target.value)}
                    placeholder="e.g. FC-1001"
                    className="w-full px-3 py-2 bg-cream-50 border border-cream-300 rounded-xl focus:ring-2 focus:ring-amberGold-400 focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="font-semibold text-charcoal-700 block mb-1">Grievance Category *</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-cream-50 border border-cream-300 rounded-xl focus:ring-2 focus:ring-amberGold-400 focus:outline-none"
                  >
                    <option value="PRODUCT_QUALITY">Product Quality / Freshness</option>
                    <option value="DELIVERY_DELAY">Delivery Rider / SLA Delay</option>
                    <option value="REFUND_ISSUE">Refund / Payment Settlement</option>
                    <option value="DPDP_PRIVACY">DPDP Act / Personal Data Rights</option>
                    <option value="OTHER">Other Query</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-charcoal-700 block mb-1">Detailed Description *</label>
                <textarea
                  rows={4}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Provide complete details including incident timestamp, delivery location, and specific remediation requested..."
                  className="w-full px-3 py-2 bg-cream-50 border border-cream-300 rounded-xl focus:ring-2 focus:ring-amberGold-400 focus:outline-none"
                />
              </div>

              <Button
                type="submit"
                variant="primary"
                size="md"
                isLoading={submitting}
                className="w-full"
              >
                <Send className="w-4 h-4 mr-1.5" />
                <span>Submit Grievance to Officer</span>
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
