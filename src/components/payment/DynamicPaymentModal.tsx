"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import {
  RefreshCw,
  Clock,
  ArrowRight,
  ChevronRight,
  X,
  ArrowLeft,
  ShieldCheck,
  XCircle,
  CheckCircle2,
  PhoneCall,
  Banknote,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/Button";

interface DynamicPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  orderNumber: string;
  amountRupees: number;
  onSuccess: (orderId: string) => void;
  onSwitchToCod?: (orderId: string) => Promise<void> | void;
}

export const DynamicPaymentModal: React.FC<DynamicPaymentModalProps> = ({
  isOpen,
  onClose,
  orderId,
  orderNumber,
  amountRupees,
  onSuccess,
  onSwitchToCod,
}) => {
  const [loading, setLoading] = useState(true);
  const [isSwitchingCod, setIsSwitchingCod] = useState(false);
  const [launchingApp, setLaunchingApp] = useState<string | null>(null);

  // Intent links state
  const [intentLinks, setIntentLinks] = useState<{
    gpayUrl: string;
    phonepeUrl: string;
    paytmUrl: string;
    bhimUrl?: string;
    genericUrl: string;
    androidGpayIntent?: string;
    androidPhonePeIntent?: string;
    androidPaytmIntent?: string;
    androidBhimIntent?: string;
  } | null>(null);

  // Payment states: PENDING | AWAITING_APP | COMPLETED | FAILED
  const [paymentStatus, setPaymentStatus] = useState<
    "PENDING" | "AWAITING_APP" | "COMPLETED" | "FAILED"
  >("PENDING");

  const [activeApp, setActiveApp] = useState<string | null>(null);
  const [activeTargetUrl, setActiveTargetUrl] = useState<string>("");
  const [isManualChecking, setIsManualChecking] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [failureReason, setFailureReason] = useState("");
  const [countdown, setCountdown] = useState(300); // 5-minute validity synchronized from backend
  const [redirectCountdown, setRedirectCountdown] = useState(3);
  const [confirmedTxnRef, setConfirmedTxnRef] = useState<string>("");

  // Customer support phone number configuration
  const rawSupportPhone =
    process.env.NEXT_PUBLIC_SUPPORT_PHONE_NUMBER ||
    process.env.NEXT_PUBLIC_SHOP_PHONE ||
    "+91 90355 26638";
  const cleanDigits = rawSupportPhone.replace(/[^\d+]/g, "");
  const supportTel = cleanDigits ? `tel:${cleanDigits}` : "tel:+919035526638";
  const supportPhoneDisplay = rawSupportPhone || "+91 90355 26638";

  // Device detection helper
  const isAndroid = () =>
    typeof navigator !== "undefined" && /Android/i.test(navigator.userAgent);
  const isIos = () =>
    typeof navigator !== "undefined" && /iPhone|iPad|iPod/i.test(navigator.userAgent);
  const isMobile = () => isAndroid() || isIos();

  // Initialize payment session on modal open
  const initPaymentSession = async () => {
    setLoading(true);
    setPaymentStatus("PENDING");
    setErrorMessage("");
    setFailureReason("");
    setActiveApp(null);
    setLaunchingApp(null);

    try {
      const res = await fetch("/api/payments/dynamic-qr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, orderNumber, amountRupees }),
      });
      const data = await res.json();
      if (data.success) {
        setIntentLinks({
          gpayUrl: data.intentLinks?.gpayUrl || data.rawUpiUrl,
          phonepeUrl: data.intentLinks?.phonepeUrl || data.rawUpiUrl,
          paytmUrl: data.intentLinks?.paytmUrl || data.rawUpiUrl,
          bhimUrl: data.intentLinks?.bhimUrl || data.rawUpiUrl,
          genericUrl: data.rawUpiUrl,
          androidGpayIntent: data.intentLinks?.androidGpayIntent,
          androidPhonePeIntent: data.intentLinks?.androidPhonePeIntent,
          androidPaytmIntent: data.intentLinks?.androidPaytmIntent,
          androidBhimIntent: data.intentLinks?.androidBhimIntent,
        });

        if (typeof data.expiresInSeconds === "number" && data.expiresInSeconds > 0) {
          setCountdown(data.expiresInSeconds);
        } else {
          setCountdown(300);
        }
      } else {
        setErrorMessage(data.error || "Failed to initialize payment gateway.");
      }
    } catch {
      setErrorMessage("Network issue initializing payment options. Please retry.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    initPaymentSession();
  }, [isOpen, orderId, orderNumber, amountRupees]);

  // AUTOMATIC PAYMENT STATUS DETECTION: Polls backend to detect webhook or payment confirmation
  useEffect(() => {
    if (!isOpen || paymentStatus === "COMPLETED" || paymentStatus === "FAILED") return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/payments/${orderId}/status`);
        if (res.ok) {
          const data = await res.json();
          if (data.payment?.status === "COMPLETED") {
            setConfirmedTxnRef(data.payment.upiTxnRef || `UPI_${Date.now().toString().slice(-8)}`);
            setPaymentStatus("COMPLETED");
            clearInterval(interval);
          } else if (data.payment?.status === "FAILED") {
            setFailureReason(data.payment?.failureReason || "Payment was rejected or cancelled in your UPI app.");
            setPaymentStatus("FAILED");
            clearInterval(interval);
          }
        }
      } catch {
        // Poll silently
      }
    }, 1800);

    return () => clearInterval(interval);
  }, [isOpen, orderId, paymentStatus]);

  // Auto-redirect upon SUCCESS
  useEffect(() => {
    if (paymentStatus !== "COMPLETED") return;

    const redTimer = setInterval(() => {
      setRedirectCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(redTimer);
          onSuccess(orderId);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(redTimer);
  }, [paymentStatus, orderId, onSuccess]);

  // Session countdown timer synchronized with backend session
  useEffect(() => {
    if (!isOpen || paymentStatus === "COMPLETED" || paymentStatus === "FAILED") return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setPaymentStatus("FAILED");
          setFailureReason("Payment session timed out (5-minute window). You can retry or switch to Cash on Delivery (COD).");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, paymentStatus]);

  // Helper to determine accurate launch URL per platform
  const getAppTargetUrl = (appName: string, primaryUrl: string, androidIntentUrl?: string): string => {
    if (isAndroid() && androidIntentUrl) {
      return androidIntentUrl;
    }
    return primaryUrl || intentLinks?.genericUrl || "#";
  };

  // Launch UPI App with device-appropriate intent handling
  const handleLaunchApp = (appName: string, primaryUrl: string, androidIntentUrl?: string) => {
    if (launchingApp) return; // Prevent duplicate rapid initiation

    const targetUrl = getAppTargetUrl(appName, primaryUrl, androidIntentUrl);
    setActiveApp(appName);
    setActiveTargetUrl(targetUrl);
    setLaunchingApp(appName);
    setPaymentStatus("AWAITING_APP");
    setErrorMessage("");

    if (!isMobile()) {
      // Desktop helper notice
      setErrorMessage("Opening UPI app link. If on desktop, please open this link on your mobile phone or use Cash on Delivery.");
    }

    try {
      // Dispatch via anchor click to ensure browser treats it as direct user navigation
      const a = document.createElement("a");
      a.href = targetUrl;
      a.target = "_top";
      a.rel = "noopener noreferrer";
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        if (document.body.contains(a)) document.body.removeChild(a);
      }, 500);
    } catch {
      window.location.href = targetUrl;
    } finally {
      setTimeout(() => {
        setLaunchingApp(null);
      }, 1500);
    }
  };

  const checkPaymentStatusManual = async () => {
    if (isManualChecking) return;
    setIsManualChecking(true);
    try {
      const res = await fetch(`/api/payments/${orderId}/status`);
      if (res.ok) {
        const data = await res.json();
        if (data.payment?.status === "COMPLETED") {
          setConfirmedTxnRef(data.payment.upiTxnRef || `UPI_${Date.now().toString().slice(-8)}`);
          setPaymentStatus("COMPLETED");
        } else if (data.payment?.status === "FAILED") {
          setFailureReason(data.payment?.failureReason || "Payment was rejected or cancelled in your UPI app.");
          setPaymentStatus("FAILED");
        }
      }
    } catch {
      // Silent error on manual poll
    } finally {
      setTimeout(() => setIsManualChecking(false), 800);
    }
  };

  const handleSwitchToCodDirect = async () => {
    if (!onSwitchToCod) {
      onClose();
      return;
    }
    setIsSwitchingCod(true);
    try {
      await onSwitchToCod(orderId);
    } finally {
      setIsSwitchingCod(false);
    }
  };

  const formatCountdown = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-charcoal-900/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[94vh]">
        {/* ============================================================ */}
        {/* MODAL HEADER                                                */}
        {/* ============================================================ */}
        <div className="px-5 py-4 bg-gradient-to-r from-stone-900 to-stone-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-400/30 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-mono tracking-widest text-amber-400 uppercase font-bold block">
                Instant UPI Payment
              </span>
              <h3 className="font-serif font-bold text-sm text-white">
                Order #{orderNumber}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {paymentStatus !== "COMPLETED" && (
              <div className="flex items-center gap-1 bg-stone-800/80 px-2.5 py-1 rounded-full border border-stone-700 text-[11px] font-mono text-amber-300">
                <Clock className="w-3 h-3 text-amber-400" />
                <span>{formatCountdown(countdown)}</span>
              </div>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-white/10 text-stone-300 hover:text-white transition"
              aria-label="Close payment modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ============================================================ */}
        {/* MODAL BODY (SWITCHABLE VIEWS)                                */}
        {/* ============================================================ */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4">
          {/* ---------------------------------------------------------- */}
          {/* 1. CUSTOM SUCCESS SCREEN                                   */}
          {/* ---------------------------------------------------------- */}
          {paymentStatus === "COMPLETED" ? (
            <div className="py-6 text-center space-y-5 animate-fade-in">
              {/* Celebratory Checkmark Icon */}
              <div className="relative mx-auto w-20 h-20 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full bg-emerald-500/20 animate-ping opacity-75" />
                <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 text-white flex items-center justify-center shadow-lg shadow-emerald-600/30">
                  <CheckCircle2 className="w-10 h-10 stroke-[2.2]" />
                </div>
              </div>

              <div className="space-y-1.5">
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-300">
                  <Sparkles className="w-3 h-3 text-emerald-600" />
                  Payment Confirmed
                </span>
                <h3 className="font-serif text-2xl font-bold text-stone-900">
                  ₹{amountRupees.toFixed(2)} Paid Successfully
                </h3>
                <p className="text-xs text-stone-500 font-mono">
                  Ref: {confirmedTxnRef || `UPI_${orderNumber}`}
                </p>
              </div>

              {/* Statutory Notice: Timer starts when confirmed by admin */}
              <div className="bg-amber-50/80 border border-amber-200/80 rounded-2xl p-3.5 text-left space-y-1.5">
                <div className="flex items-center gap-2 text-amber-800 font-bold text-xs">
                  <Clock className="w-4 h-4 text-amber-600 flex-shrink-0" />
                  <span>Kitchen Notification Dispatched</span>
                </div>
                <p className="text-[11px] text-amber-700 leading-relaxed">
                  Your order is now placed with the kitchen. The <strong>20-minute delivery countdown timer will begin automatically once the store admin confirms your order</strong>.
                </p>
              </div>

              {/* Action Button */}
              <div className="pt-2">
                <Button
                  variant="primary"
                  onClick={() => onSuccess(orderId)}
                  className="w-full py-3 text-sm font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-md"
                >
                  <span>Track Order Status ({redirectCountdown}s)</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          ) : /* ---------------------------------------------------------- */
          /* 2. CUSTOM FAILURE SCREEN                                   */
          /* ---------------------------------------------------------- */
          paymentStatus === "FAILED" ? (
            <div className="py-6 text-center space-y-5 animate-fade-in">
              {/* Failure Emblem */}
              <div className="relative mx-auto w-20 h-20 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full bg-rose-500/20 animate-ping opacity-60" />
                <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-rose-500 to-rose-600 text-white flex items-center justify-center shadow-lg shadow-rose-600/30">
                  <XCircle className="w-10 h-10 stroke-[2.2]" />
                </div>
              </div>

              <div className="space-y-1.5">
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-rose-100 text-rose-800 border border-rose-300">
                  Payment Unsuccessful
                </span>
                <h3 className="font-serif text-2xl font-bold text-stone-900">
                  Payment Incomplete
                </h3>
                <p className="text-xs text-rose-600 bg-rose-50 border border-rose-200 p-2.5 rounded-xl max-w-sm mx-auto leading-relaxed">
                  {failureReason || errorMessage || "The payment was cancelled or timed out. No amount was deducted for this order."}
                </p>
              </div>

              {/* Actions */}
              <div className="space-y-2.5 pt-2">
                <Button
                  variant="primary"
                  onClick={initPaymentSession}
                  className="w-full py-3 text-xs font-bold bg-stone-900 hover:bg-stone-800 text-white rounded-xl shadow-sm"
                >
                  <RefreshCw className="w-3.5 h-3.5 mr-1" />
                  <span>Try Again via UPI App</span>
                </Button>

                {onSwitchToCod && (
                  <button
                    onClick={handleSwitchToCodDirect}
                    disabled={isSwitchingCod}
                    className="w-full py-2.5 bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold text-xs rounded-xl border border-amber-300 transition flex items-center justify-center gap-1.5"
                  >
                    <Banknote className="w-4 h-4 text-amber-700" />
                    <span>Switch to Cash on Delivery (COD)</span>
                  </button>
                )}
              </div>

              {/* Customer Support Section */}
              <div className="pt-4 border-t border-stone-100 text-center space-y-1.5">
                <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-stone-800">
                  <PhoneCall className="w-3.5 h-3.5 text-amber-600" />
                  <span>Payment issue? Raise a complaint</span>
                </div>
                <p className="text-[11px] text-stone-500 leading-relaxed">
                  Payment deducted, pending, or not reflected? Contact Homemart4u Support for assistance with your order.
                </p>
                <a
                  href={supportTel}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-800 hover:text-amber-700 transition"
                >
                  <span>Call Store Support: {supportPhoneDisplay}</span>
                </a>
              </div>
            </div>
          ) : /* ---------------------------------------------------------- */
          /* 3. AWAITING PAYMENT IN APP (LIVE DETECTION RUNNING)        */
          /* ---------------------------------------------------------- */
          paymentStatus === "AWAITING_APP" ? (
            <div className="py-6 space-y-5 text-center animate-fade-in">
              {/* Spinner & Live Status */}
              <div className="relative mx-auto w-16 h-16 flex items-center justify-center">
                <div className="w-16 h-16 rounded-full border-4 border-stone-200 border-t-emerald-600 animate-spin" />
                <Clock className="w-6 h-6 text-emerald-600 absolute" />
              </div>

              <div className="space-y-1">
                <h4 className="font-serif text-lg font-bold text-stone-900">
                  Awaiting Confirmation from {activeApp}
                </h4>
                <p className="text-xs text-stone-500 max-w-xs mx-auto leading-relaxed">
                  Approve the payment of <strong>₹{amountRupees.toFixed(2)}</strong> in your UPI application. This screen updates automatically the moment payment is verified.
                </p>
              </div>

              {/* Direct One-Tap Re-Launch Action Button */}
              <div className="pt-1 space-y-2 max-w-sm mx-auto">
                <a
                  href={activeTargetUrl || intentLinks?.genericUrl || "#"}
                  target="_top"
                  rel="noopener noreferrer"
                  className="w-full py-3 px-4 rounded-xl font-bold text-xs sm:text-sm bg-stone-900 hover:bg-stone-800 active:scale-[0.98] text-white shadow-md flex items-center justify-center gap-2 transition"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Open {activeApp} to Pay</span>
                </a>

                {activeApp !== "BHIM / Other UPI App" && intentLinks?.genericUrl && (
                  <a
                    href={intentLinks.genericUrl}
                    target="_top"
                    rel="noopener noreferrer"
                    className="w-full py-2 px-3 rounded-lg font-semibold text-[11px] text-stone-700 bg-stone-100 hover:bg-stone-200 flex items-center justify-center gap-1.5 transition"
                  >
                    <span>Pay with any other UPI app</span>
                  </a>
                )}
              </div>

              {/* Live Webhook / Provider Pulse with Manual Refresh Button */}
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-800 text-[11px] font-bold rounded-full border border-emerald-200 animate-pulse">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>Checking payment status live with bank network...</span>
                </div>
                <div>
                  <button
                    type="button"
                    disabled={isManualChecking}
                    onClick={checkPaymentStatusManual}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-stone-700 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 border border-stone-200 transition"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isManualChecking ? "animate-spin" : ""}`} />
                    <span>Check Bank Status Now</span>
                  </button>
                </div>
              </div>

              {/* Navigation options */}
              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setPaymentStatus("PENDING")}
                  className="text-xs text-stone-500 hover:text-stone-800 flex items-center gap-1"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Select another app
                </button>

                {onSwitchToCod && (
                  <button
                    type="button"
                    onClick={handleSwitchToCodDirect}
                    disabled={isSwitchingCod}
                    className="text-xs text-amber-700 font-bold hover:underline"
                  >
                    Switch to COD &rarr;
                  </button>
                )}
              </div>

              {/* Customer Support Telephone Section (Replacing manual UTR entry) */}
              <div className="pt-4 border-t border-stone-100 text-left space-y-2">
                <div className="flex items-center gap-1.5 text-stone-800 font-bold text-xs">
                  <PhoneCall className="w-3.5 h-3.5 text-amber-600" />
                  <span>Payment issue? Raise a complaint</span>
                </div>
                <p className="text-[11px] text-stone-500 leading-relaxed">
                  Payment deducted, pending, or not reflected? Contact Homemart4u Support for assistance with your order #{orderNumber}.
                </p>
                <a
                  href={supportTel}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-800 hover:text-amber-900 bg-amber-50 hover:bg-amber-100 px-3 py-2 rounded-xl border border-amber-200 transition"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>Call Store Support: {supportPhoneDisplay}</span>
                </a>
              </div>
            </div>
          ) : (
            /* ---------------------------------------------------------- */
            /* 4. DEFAULT UPI INTENT APP SELECTION (UPI ID HIDDEN)         */
            /* ---------------------------------------------------------- */
            <div className="space-y-4 animate-fade-in">
              {/* Payment Summary Box (UPI ID Hidden from customer-facing UI) */}
              <div className="bg-stone-50 rounded-2xl p-4 border border-stone-200 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-stone-500 uppercase font-mono font-bold block">
                    Amount to Pay
                  </span>
                  <span className="text-2xl font-mono font-extrabold text-stone-900">
                    ₹{amountRupees.toFixed(2)}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-stone-500 uppercase font-mono block">
                    Order Number
                  </span>
                  <span className="text-xs font-mono font-bold text-stone-800">
                    #{orderNumber}
                  </span>
                  <span className="block text-[10px] text-emerald-600 font-semibold mt-0.5">
                    ● Encrypted &amp; Verified
                  </span>
                </div>
              </div>

              {/* Instructions */}
              <p className="text-xs text-stone-600 text-center">
                Select your preferred UPI app below to complete payment instantly:
              </p>

              {/* UPI INTENT APPS LIST */}
              <div className="space-y-2">
                {/* Google Pay */}
                <a
                  href={getAppTargetUrl(
                    "Google Pay",
                    intentLinks?.gpayUrl || intentLinks?.genericUrl || "#",
                    intentLinks?.androidGpayIntent
                  )}
                  target="_top"
                  rel="noopener noreferrer"
                  onClick={() =>
                    handleLaunchApp(
                      "Google Pay",
                      intentLinks?.gpayUrl || intentLinks?.genericUrl || "#",
                      intentLinks?.androidGpayIntent
                    )
                  }
                  className="w-full p-3.5 rounded-2xl border border-stone-200 hover:border-stone-400 bg-white hover:bg-stone-50 transition-all flex items-center justify-between shadow-xs group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-8 relative flex items-center justify-center bg-stone-50 rounded-lg p-1 border border-stone-100">
                      <Image
                        src="/images/payment/gpay.webp"
                        alt="Google Pay"
                        width={48}
                        height={24}
                        className="object-contain max-h-6"
                      />
                    </div>
                    <div className="text-left">
                      <span className="text-xs font-bold text-stone-900 block">Google Pay</span>
                      <span className="text-[10px] text-stone-400">Pay directly in Google Pay</span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-stone-400 group-hover:text-stone-800 transition" />
                </a>

                {/* PhonePe */}
                <a
                  href={getAppTargetUrl(
                    "PhonePe",
                    intentLinks?.phonepeUrl || intentLinks?.genericUrl || "#",
                    intentLinks?.androidPhonePeIntent
                  )}
                  target="_top"
                  rel="noopener noreferrer"
                  onClick={() =>
                    handleLaunchApp(
                      "PhonePe",
                      intentLinks?.phonepeUrl || intentLinks?.genericUrl || "#",
                      intentLinks?.androidPhonePeIntent
                    )
                  }
                  className="w-full p-3.5 rounded-2xl border border-stone-200 hover:border-purple-300 bg-white hover:bg-purple-50/20 transition-all flex items-center justify-between shadow-xs group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-8 relative flex items-center justify-center bg-stone-50 rounded-lg p-1 border border-stone-100">
                      <Image
                        src="/images/payment/phonepe.webp"
                        alt="PhonePe"
                        width={48}
                        height={24}
                        className="object-contain max-h-6"
                      />
                    </div>
                    <div className="text-left">
                      <span className="text-xs font-bold text-stone-900 block">PhonePe</span>
                      <span className="text-[10px] text-stone-400">Pay directly in PhonePe</span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-stone-400 group-hover:text-purple-700 transition" />
                </a>

                {/* Paytm */}
                <a
                  href={getAppTargetUrl(
                    "Paytm",
                    intentLinks?.paytmUrl || intentLinks?.genericUrl || "#",
                    intentLinks?.androidPaytmIntent
                  )}
                  target="_top"
                  rel="noopener noreferrer"
                  onClick={() =>
                    handleLaunchApp(
                      "Paytm",
                      intentLinks?.paytmUrl || intentLinks?.genericUrl || "#",
                      intentLinks?.androidPaytmIntent
                    )
                  }
                  className="w-full p-3.5 rounded-2xl border border-stone-200 hover:border-sky-300 bg-white hover:bg-sky-50/20 transition-all flex items-center justify-between shadow-xs group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-8 relative flex items-center justify-center bg-stone-50 rounded-lg p-1 border border-stone-100">
                      <Image
                        src="/images/payment/paytm.webp"
                        alt="Paytm"
                        width={48}
                        height={24}
                        className="object-contain max-h-6"
                      />
                    </div>
                    <div className="text-left">
                      <span className="text-xs font-bold text-stone-900 block">Paytm UPI</span>
                      <span className="text-[10px] text-stone-400">Pay directly in Paytm</span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-stone-400 group-hover:text-sky-700 transition" />
                </a>

                {/* Other UPI / BHIM App */}
                <a
                  href={getAppTargetUrl(
                    "BHIM / Other UPI App",
                    intentLinks?.bhimUrl || intentLinks?.genericUrl || "#",
                    intentLinks?.androidBhimIntent
                  )}
                  target="_top"
                  rel="noopener noreferrer"
                  onClick={() =>
                    handleLaunchApp(
                      "BHIM / Other UPI App",
                      intentLinks?.bhimUrl || intentLinks?.genericUrl || "#",
                      intentLinks?.androidBhimIntent
                    )
                  }
                  className="w-full p-3.5 rounded-2xl border border-stone-200 hover:border-emerald-300 bg-white hover:bg-emerald-50/20 transition-all flex items-center justify-between shadow-xs group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-8 relative flex items-center justify-center bg-emerald-50 rounded-lg p-1 border border-emerald-100 text-emerald-700 font-black text-xs font-mono">
                      UPI
                    </div>
                    <div className="text-left">
                      <span className="text-xs font-bold text-stone-900 block">BHIM / Any Other UPI App</span>
                      <span className="text-[10px] text-stone-400">Choose from all UPI apps on your device</span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-stone-400 group-hover:text-emerald-700 transition" />
                </a>
              </div>

              {/* Customer Support Complaint Section (Replacing manual UTR entry) */}
              <div className="pt-3 border-t border-stone-100 text-left space-y-1.5">
                <div className="flex items-center gap-1.5 text-stone-800 font-bold text-xs">
                  <PhoneCall className="w-3.5 h-3.5 text-amber-600" />
                  <span>Payment issue? Raise a complaint</span>
                </div>
                <p className="text-[11px] text-stone-500 leading-relaxed">
                  Payment deducted, pending, or not reflected? Contact Homemart4u Support for assistance with your order.
                </p>
                <a
                  href={supportTel}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-800 hover:text-amber-900 bg-amber-50 hover:bg-amber-100 px-3 py-1.5 rounded-xl border border-amber-200 transition"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>Call Support: {supportPhoneDisplay}</span>
                </a>
              </div>

              {errorMessage && (
                <p className="text-xs text-rose-600 bg-rose-50 p-2.5 rounded-xl border border-rose-200 text-center animate-fade-in">
                  {errorMessage}
                </p>
              )}
            </div>
          )}
        </div>

        {/* ============================================================ */}
        {/* MODAL FOOTER                                                */}
        {/* ============================================================ */}
        {paymentStatus !== "COMPLETED" && (
          <div className="px-5 py-3.5 bg-stone-50 border-t border-stone-200 flex items-center justify-between text-xs">
            <span className="text-[11px] text-stone-500 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>NPCI Encrypted</span>
            </span>

            {onSwitchToCod && (
              <button
                type="button"
                onClick={handleSwitchToCodDirect}
                disabled={isSwitchingCod}
                className="font-bold text-amber-800 hover:text-amber-900 transition flex items-center gap-1 hover:underline text-[11px]"
              >
                <Banknote className="w-3.5 h-3.5 text-amber-600" />
                <span>Switch to Cash on Delivery</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
