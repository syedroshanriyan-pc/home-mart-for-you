"use client";

import React, { useEffect, useState } from "react";
import { DollarSign, Plus, CheckCircle2, AlertCircle, RefreshCw, Clock, ArrowRight } from "lucide-react";

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

export default function AdminBankTransactionsPage() {
  const [transactions, setTransactions] = useState<BankTx[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formUtr, setFormUtr] = useState("");
  const [formAmount, setFormAmount] = useState("");
  const [formNote, setFormNote] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/bank-transactions");
      const data = await res.json();
      if (res.ok && data.transactions) {
        setTransactions(data.transactions);
      }
    } catch (err) {
      console.error("Failed to load bank transactions:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
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
        fetchTransactions();
      } else {
        setErrorMsg(data.error || "Failed to record transaction.");
      }
    } catch {
      setErrorMsg("Network error recording bank transaction.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-serif font-bold text-charcoal-800 flex items-center gap-2">
            <DollarSign className="w-6 h-6 text-emerald-600" />
            <span>Bank UTR Verification Records</span>
          </h1>
          <p className="text-xs text-charcoal-500 mt-1">
            Bank credit ledger. Customers can only confirm payments for UTR numbers pre-recorded here. Each UTR is valid for one order only.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchTransactions}
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

      {successMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Transaction Table */}
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

      {/* Modal to Add Bank UTR */}
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

            {errorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

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
