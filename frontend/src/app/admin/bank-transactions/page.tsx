"use client";

import React, { useEffect, useState } from "react";
import {
  DollarSign,
  Plus,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Clock,
  ArrowRight,
  ShieldCheck,
  FileCheck2,
  HelpCircle,
  XCircle,
  ExternalLink,
} from "lucide-react";

interface BankTx {
  id: string;
  utr: string;
  amountMinor: number;
  payeeVpa: string;
  source: string;
  status: "UNCLAIMED" | "CLAIMED" | "EXPIRED";
  claimedOrderId?: string | null;
  claimedOrder?: {
    orderNumber: string;
    totalMinor: number;
    status: string;
    user?: { name: string; mobile: string };
  } | null;
  receivedAt: string;
  claimedAt?: string | null;
}

interface UnresolvedPayment {
  id: string;
  orderId: string;
  method: string;
  status: string;
  amountMinor: number;
  providerReference?: string | null;
  upiTxnRef?: string | null;
  createdAt: string;
  updatedAt: string;
  order: {
    id: string;
    orderNumber: string;
    totalMinor: number;
    status: string;
    placedAt: string;
    user?: { name: string; mobile: string; email?: string } | null;
  };
}

export default function AdminBankTransactionsPage() {
  const [activeTab, setActiveTab] = useState<"LEDGER" | "RECONCILIATION">("RECONCILIATION");
  const [transactions, setTransactions] = useState<BankTx[]>([]);
  const [unresolvedPayments, setUnresolvedPayments] = useState<UnresolvedPayment[]>([]);
  const [loading, setLoading] = useState(true);

  // Add UTR modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formUtr, setFormUtr] = useState("");
  const [formAmount, setFormAmount] = useState("");
  const [formNote, setFormNote] = useState("");

  // Audited Reconciliation Modal State
  const [reconTarget, setReconTarget] = useState<UnresolvedPayment | null>(null);
  const [reconUtr, setReconUtr] = useState("");
  const [reconAmount, setReconAmount] = useState("");
  const [reconEvidence, setReconEvidence] = useState("");
  const [reconReason, setReconReason] = useState("");
  const [isReconciling, setIsReconciling] = useState(false);

  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const [txRes, unresRes] = await Promise.all([
        fetch("/api/admin/bank-transactions").then((r) => r.json()).catch(() => ({ transactions: [] })),
        fetch("/api/admin/bank-transactions/unresolved").then((r) => r.json()).catch(() => ({ payments: [] })),
      ]);

      if (txRes.transactions) setTransactions(txRes.transactions);
      if (unresRes.payments) setUnresolvedPayments(unresRes.payments);
    } catch (err) {
      console.error("Failed to load payment data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const res = await fetch("/api/admin/bank-transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          utr: formUtr.trim(),
          amountRupees: formAmount.trim(),
          note: formNote.trim(),
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSuccessMsg(`UTR ${data.transaction.utr} successfully recorded in database.`);
        setFormUtr("");
        setFormAmount("");
        setFormNote("");
        setIsModalOpen(false);
        fetchData();
      } else {
        setErrorMsg(data.error || "Failed to record transaction.");
      }
    } catch {
      setErrorMsg("Network error recording bank transaction.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReconcileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reconTarget) return;

    setIsReconciling(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const res = await fetch("/api/admin/bank-transactions/reconcile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: reconTarget.orderId,
          utr: reconUtr.trim(),
          amountRupees: reconAmount.trim(),
          evidenceRef: reconEvidence.trim(),
          reason: reconReason.trim(),
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSuccessMsg(data.message || `Order #${reconTarget.order.orderNumber} successfully reconciled.`);
        setReconTarget(null);
        setReconUtr("");
        setReconAmount("");
        setReconEvidence("");
        setReconReason("");
        fetchData();
      } else {
        setErrorMsg(data.error || "Failed to reconcile payment.");
      }
    } catch {
      setErrorMsg("Network error submitting reconciliation.");
    } finally {
      setIsReconciling(false);
    }
  };

  const openReconciliationModal = (payment: UnresolvedPayment) => {
    setReconTarget(payment);
    setReconAmount((payment.amountMinor / 100).toFixed(2));
    setReconUtr(payment.upiTxnRef || "");
    setReconEvidence("");
    setReconReason("");
    setErrorMsg("");
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-serif font-bold text-charcoal-800 flex items-center gap-2">
            <DollarSign className="w-6 h-6 text-emerald-600" />
            <span>Homemart4u Pay — Self-Hosted Reconciliation Desk</span>
          </h1>
          <p className="text-xs text-charcoal-500 mt-1">
            Owned payment engine: Dynamic QR sessions, authentic bank credit ledger, and audited manual operator reconciliation.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchData}
            className="p-2 border border-cream-300 rounded-xl bg-white hover:bg-cream-100 text-charcoal-600 transition"
            title="Refresh Ledger"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            <span>Add Bank UTR</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-cream-200 pb-2">
        <button
          onClick={() => setActiveTab("RECONCILIATION")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === "RECONCILIATION"
              ? "bg-amber-600 text-white shadow-sm"
              : "bg-cream-100 text-charcoal-600 hover:bg-cream-200"
          }`}
        >
          <FileCheck2 className="w-4 h-4" />
          <span>Payment Reconciliation Desk ({unresolvedPayments.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("LEDGER")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === "LEDGER"
              ? "bg-emerald-700 text-white shadow-sm"
              : "bg-cream-100 text-charcoal-600 hover:bg-cream-200"
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Bank Credit Ledger ({transactions.length})</span>
        </button>
      </div>

      {successMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2 animate-fade-in">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* TAB 1: RECONCILIATION DESK */}
      {activeTab === "RECONCILIATION" && (
        <div className="bg-white rounded-2xl border border-cream-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-cream-200 bg-cream-50/50 flex justify-between items-center">
            <div>
              <h2 className="text-xs font-bold uppercase text-charcoal-700 tracking-wider">
                Unresolved Online Payments
              </h2>
              <p className="text-[11px] text-charcoal-500">
                Orders requiring verification against incoming bank credits. Operators must provide evidence references.
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full">
              {unresolvedPayments.length} Active Sessions
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-cream-50 text-charcoal-500 uppercase tracking-wider text-[10px] border-b border-cream-200 font-medium">
                <tr>
                  <th className="py-3 px-4">Order #</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Expected Amount</th>
                  <th className="py-3 px-4">Session Status</th>
                  <th className="py-3 px-4">Session Ref / UTR</th>
                  <th className="py-3 px-4">Created At</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cream-100 font-sans">
                {loading && unresolvedPayments.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-charcoal-400">
                      Loading unresolved payment sessions...
                    </td>
                  </tr>
                ) : unresolvedPayments.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-charcoal-400">
                      All online payments are reconciled! No unresolved sessions.
                    </td>
                  </tr>
                ) : (
                  unresolvedPayments.map((p) => (
                    <tr key={p.id} className="hover:bg-cream-50/50 transition">
                      <td className="py-3 px-4 font-bold text-stone-800 font-mono">
                        #{p.order.orderNumber}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-charcoal-800">
                          {p.order.user?.name || "Guest Checkout"}
                        </div>
                        <div className="text-[11px] text-charcoal-500 font-mono">
                          {p.order.user?.mobile || "N/A"}
                        </div>
                      </td>
                      <td className="py-3 px-4 font-bold text-emerald-700 font-mono">
                        ₹{(p.amountMinor / 100).toFixed(2)}
                      </td>
                      <td className="py-3 px-4">
                        {p.status === "PENDING" ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                            <Clock className="w-3 h-3 text-amber-600" />
                            PENDING
                          </span>
                        ) : p.status === "EXPIRED" ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-stone-100 text-stone-700">
                            <XCircle className="w-3 h-3 text-stone-500" />
                            EXPIRED
                          </span>
                        ) : p.status === "REQUIRES_RECONCILIATION" ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
                            <HelpCircle className="w-3 h-3 text-blue-600" />
                            RECONCILING
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-cream-200 text-charcoal-700">
                            {p.status}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] text-charcoal-600">
                        {p.upiTxnRef ? (
                          <span className="font-bold text-stone-800">{p.upiTxnRef}</span>
                        ) : (
                          <span className="text-charcoal-400">{p.providerReference || "Awaiting scan"}</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-[11px] text-charcoal-500">
                        {new Date(p.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => openReconciliationModal(p)}
                          className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-1 ml-auto"
                        >
                          <span>Reconcile</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: BANK CREDIT LEDGER */}
      {activeTab === "LEDGER" && (
        <div className="bg-white rounded-2xl border border-cream-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-cream-50 text-charcoal-500 uppercase tracking-wider text-[10px] border-b border-cream-200 font-medium">
                <tr>
                  <th className="py-3 px-4">12-Digit UTR</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Claimed Order</th>
                  <th className="py-3 px-4">Source / Received</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cream-100 font-mono">
                {loading && transactions.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-charcoal-400 font-sans">
                      Loading bank transactions...
                    </td>
                  </tr>
                ) : transactions.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-charcoal-400 font-sans">
                      No bank credit records found. Click &ldquo;Add Bank UTR&rdquo; to add transactions.
                    </td>
                  </tr>
                ) : (
                  transactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-cream-50/50 transition">
                      <td className="py-3 px-4 font-bold text-stone-800 font-mono tracking-wider">
                        {tx.utr}
                      </td>
                      <td className="py-3 px-4 font-bold text-emerald-700">
                        ₹{(tx.amountMinor / 100).toFixed(2)}
                      </td>
                      <td className="py-3 px-4">
                        {tx.status === "CLAIMED" ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                            <CheckCircle2 className="w-3 h-3 text-amber-700" />
                            CLAIMED (USED)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            <Clock className="w-3 h-3 text-emerald-600" />
                            UNCLAIMED (READY)
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 font-sans text-xs">
                        {tx.claimedOrder ? (
                          <div className="space-y-0.5">
                            <span className="font-bold text-charcoal-700">
                              Order #{tx.claimedOrder.orderNumber}
                            </span>
                            <span className="block text-[11px] text-charcoal-400">
                              {tx.claimedOrder.user?.name || "Guest"} ({tx.claimedOrder.user?.mobile || "N/A"})
                            </span>
                          </div>
                        ) : (
                          <span className="text-charcoal-400 italic">Not claimed yet</span>
                        )}
                      </td>
                      <td className="py-3 px-4 font-sans text-[11px] text-charcoal-500">
                        <div>{tx.source}</div>
                        <div className="text-[10px] text-charcoal-400">
                          {new Date(tx.receivedAt).toLocaleDateString()} {new Date(tx.receivedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal: Audited Manual Reconciliation */}
      {reconTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl border border-cream-200 max-w-md w-full p-6 space-y-4 animate-scale-in">
            <div className="flex justify-between items-center border-b border-cream-200 pb-3">
              <div>
                <h3 className="font-serif font-bold text-base text-charcoal-800">
                  Audited Payment Reconciliation
                </h3>
                <span className="text-xs text-amber-700 font-mono font-semibold">
                  Order #{reconTarget.order.orderNumber} &bull; Expected ₹{(reconTarget.amountMinor / 100).toFixed(2)}
                </span>
              </div>
              <button
                onClick={() => setReconTarget(null)}
                className="text-charcoal-400 hover:text-charcoal-600 text-sm font-bold"
              >
                &times;
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleReconcileSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                  12-Digit Bank UTR / Transaction Reference *
                </label>
                <input
                  type="text"
                  required
                  maxLength={12}
                  placeholder="e.g. 629918239012"
                  value={reconUtr}
                  onChange={(e) => setReconUtr(e.target.value.replace(/\D/g, "").slice(0, 12))}
                  className="w-full px-3 py-2 text-xs border border-cream-300 rounded-xl font-mono text-center tracking-wider focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                  Verified Paid Amount (₹) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={reconAmount}
                  onChange={(e) => setReconAmount(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-cream-300 rounded-xl font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                  Bank Evidence Reference *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Bank statement line #142 / Netbanking credit reference"
                  value={reconEvidence}
                  onChange={(e) => setReconEvidence(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-cream-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                  Reconciliation Reason / Note *
                </label>
                <textarea
                  required
                  rows={2}
                  placeholder="e.g. Customer paid via PhonePe to store VPA; verified in HDFC account statement"
                  value={reconReason}
                  onChange={(e) => setReconReason(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-cream-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setReconTarget(null)}
                  className="px-4 py-2 border border-cream-300 text-charcoal-600 rounded-xl text-xs font-semibold hover:bg-cream-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isReconciling || reconUtr.length !== 12 || !reconEvidence || !reconReason}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold flex items-center gap-1 shadow-sm"
                >
                  <span>{isReconciling ? "Reconciling..." : "Authorize & Confirm Payment"}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Bank UTR */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl border border-cream-200 max-w-md w-full p-6 space-y-4 animate-scale-in">
            <div className="flex justify-between items-center border-b border-cream-200 pb-3">
              <h3 className="font-serif font-bold text-base text-charcoal-800">
                Add Verified Bank UTR Record
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-charcoal-400 hover:text-charcoal-600 text-sm font-bold"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                  12-Digit Bank UTR / RRN *
                </label>
                <input
                  type="text"
                  required
                  maxLength={12}
                  placeholder="e.g. 134504822112"
                  value={formUtr}
                  onChange={(e) => setFormUtr(e.target.value.replace(/\D/g, "").slice(0, 12))}
                  className="w-full px-3 py-2 text-xs border border-cream-300 rounded-xl font-mono text-center tracking-wider focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                  Credit Amount (₹) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="e.g. 2.00 or 250.00"
                  value={formAmount}
                  onChange={(e) => setFormAmount(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-cream-300 rounded-xl font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                  Notes (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. From ICICI Bank SMS credit"
                  value={formNote}
                  onChange={(e) => setFormNote(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-cream-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-cream-300 text-charcoal-600 rounded-xl text-xs font-semibold hover:bg-cream-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || formUtr.length !== 12 || !formAmount}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold flex items-center gap-1"
                >
                  <span>{isSubmitting ? "Recording..." : "Record Bank Transaction"}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
