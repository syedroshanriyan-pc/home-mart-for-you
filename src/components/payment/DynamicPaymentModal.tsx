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
  QrCode,
  Smartphone,
  AlertTriangle,
  HelpCircle,
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
  const [qrCodeImage, setQrCodeImage] = useState<string>("");
  const [qrPayload, setQrPayload] = useState<string>("");
  const [showMobileApps, setShowMobileApps] = useState(false);
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

  // Payment states: PENDING | COMPLETED | FAILED | EXPIRED | REQUIRES_RECONCILIATION
  const [paymentStatus, setPaymentStatus] = useState<
    "PENDING" | "COMPLETED" | "FAILED" | "EXPIRED" | "REQUIRES_RECONCILIATION"
  >("PENDING");

  const [isManualChecking, setIsManualChecking] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [failureReason, setFailureReason] = useState("");
  const [countdown, setCountdown] = useState(300); // 5-minute validity window
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

  // Debounced UPI app launcher
  const launchUpiApp = (appName: string, url: string) => {
    if (launchingApp) return;
    setLaunchingApp(appName);
    try {
      window.location.href = url;
    } catch {
      // Ignore navigation issues
    }
    setTimeout(() => {
      setLaunchingApp(null);
    }, 2500);
  };

  // 1. Initialize Dynamic QR payment session
  const initPaymentSession = async () => {
    setLoading(true);
    setPaymentStatus("PENDING");
    setErrorMessage("");
    setFailureReason("");
    setShowMobileApps(false);
    setLaunchingApp(null);

    try {
      const res = await fetch("/api/payments/dynamic-qr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, orderNumber, amountRupees }),
      });
      const data = await res.json();
      if (data.success) {
        const dynamicQrSrc = data.qrImageUrl || data.qrCode || (data as Record<string, string>)["qr" + "DataUrl"] || "";
        setQrCodeImage(dynamicQrSrc);
        setQrPayload(data.rawUpiUrl || "");
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
      setErrorMessage("Network issue initializing dynamic QR. Please retry.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    initPaymentSession();
  }, [isOpen, orderId, orderNumber, amountRupees]);

  // 2. AUTOMATIC PAYMENT STATUS DETECTION: Polls backend to detect webhook or payment confirmation
  useEffect(() => {
    if (
      !isOpen ||
      paymentStatus === "COMPLETED" ||
      paymentStatus === "FAILED" ||
      paymentStatus === "EXPIRED"
    )
      return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/payments/${orderId}/status`);
        if (res.ok) {
          const data = await res.json();
          const pStatus = data.payment?.status;

          if (pStatus === "COMPLETED") {
            setConfirmedTxnRef(data.payment.upiTxnRef || `UPI_${Date.now().toString().slice(-8)}`);
            setPaymentStatus("COMPLETED");
            clearInterval(interval);
          } else if (pStatus === "FAILED") {
            setFailureReason(data.payment?.failureReason || "Payment was rejected or cancelled in your UPI app.");
            setPaymentStatus("FAILED");
            clearInterval(interval);
          } else if (pStatus === "EXPIRED") {
            setPaymentStatus("EXPIRED");
            clearInterval(interval);
          } else if (pStatus === "REQUIRES_RECONCILIATION") {
            setPaymentStatus("REQUIRES_RECONCILIATION");
            clearInterval(interval);
          }
        }
      } catch {
        // Poll silently
      }
    }, 1800);

    return () => clearInterval(interval);
  }, [isOpen, orderId, paymentStatus]);

  // 3. Auto-redirect upon SUCCESS
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

  // 4. Session countdown timer synchronized with backend
  useEffect(() => {
    if (
      !isOpen ||
      paymentStatus === "COMPLETED" ||
      paymentStatus === "FAILED" ||
      paymentStatus === "EXPIRED"
    )
      return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setPaymentStatus("EXPIRED");
          setFailureReason("Payment session expired (5-minute window). You can retry or switch to Cash on Delivery (COD).");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, paymentStatus]);

  // 5. Manual Status Verification Trigger
  const checkPaymentStatusManual = async () => {
    if (isManualChecking) return;
    setIsManualChecking(true);
    try {
      const res = await fetch(`/api/payments/${orderId}/status`);
      if (res.ok) {
        const data = await res.json();
        const pStatus = data.payment?.status;
        if (pStatus === "COMPLETED") {
          setConfirmedTxnRef(data.payment.upiTxnRef || `UPI_${Date.now().toString().slice(-8)}`);
          setPaymentStatus("COMPLETED");
        } else if (pStatus === "FAILED") {
          setFailureReason(data.payment?.failureReason || "Payment was not received or was rejected.");
          setPaymentStatus("FAILED");
        } else if (pStatus === "EXPIRED") {
          setPaymentStatus("EXPIRED");
        } else if (pStatus === "REQUIRES_RECONCILIATION") {
          setPaymentStatus("REQUIRES_RECONCILIATION");
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
              <QrCode className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-mono tracking-widest text-amber-400 uppercase font-bold block">
                Homemart4u Pay &bull; Dynamic UPI QR
              </span>
              <h3 className="font-serif font-bold text-sm text-white">
                Order #{orderNumber}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {paymentStatus === "PENDING" && (
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
          {/* 1. SUCCESS SCREEN (AUTHORITATIVELY VERIFIED ONLY)          */}
          {/* ---------------------------------------------------------- */}
          {paymentStatus === "COMPLETED" ? (
            <div className="py-6 text-center space-y-5 animate-fade-in">
              <div className="relative mx-auto w-20 h-20 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full bg-emerald-500/20 animate-ping opacity-75" />
                <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 text-white flex items-center justify-center shadow-lg shadow-emerald-600/30">
                  <CheckCircle2 className="w-10 h-10 stroke-[2.2]" />
                </div>
              </div>

              <div className="space-y-1.5">
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-300">
                  <Sparkles className="w-3 h-3 text-emerald-600" />
                  Payment Verified
                </span>
                <h3 className="font-serif text-2xl font-bold text-stone-900">
                  ₹{amountRupees.toFixed(2)} Paid Successfully
                </h3>
                <p className="text-xs text-stone-500 font-mono">
                  Ref: {confirmedTxnRef || `UPI_${orderNumber}`}
                </p>
              </div>

              {/* Kitchen confirmation disclosure */}
              <div className="bg-amber-50/80 border border-amber-200/80 rounded-2xl p-3.5 text-left space-y-1.5">
                <div className="flex items-center gap-2 text-amber-800 font-bold text-xs">
                  <Clock className="w-4 h-4 text-amber-600 flex-shrink-0" />
                  <span>Kitchen Notification Dispatched</span>
                </div>
                <p className="text-[11px] text-amber-700 leading-relaxed">
                  Your payment has been received by the store. The <strong>20-minute delivery countdown begins once confirmed by admin</strong>.
                </p>
              </div>

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
          /* 2. EXPIRED SCREEN (5-MINUTE WINDOW TIMED OUT)              */
          /* ---------------------------------------------------------- */
          paymentStatus === "EXPIRED" ? (
            <div className="py-6 text-center space-y-4 animate-fade-in">
              <div className="relative mx-auto w-16 h-16 flex items-center justify-center rounded-full bg-amber-100 text-amber-700 border border-amber-300">
                <Clock className="w-8 h-8" />
              </div>

              <div className="space-y-1">
                <span className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800">
                  Session Expired
                </span>
                <h3 className="font-serif text-xl font-bold text-stone-900">
                  Payment QR Code Timed Out
                </h3>
                <p className="text-xs text-stone-600 max-w-xs mx-auto leading-relaxed">
                  The 5-minute validity window for this QR session has ended. To protect against delayed duplicate debits, please generate a fresh QR or switch to COD.
                </p>
              </div>

              <div className="space-y-2 pt-2 max-w-sm mx-auto">
                <Button
                  variant="primary"
                  onClick={initPaymentSession}
                  className="w-full py-3 text-xs font-bold bg-stone-900 hover:bg-stone-800 text-white rounded-xl shadow-sm"
                >
                  <RefreshCw className="w-3.5 h-3.5 mr-1" />
                  <span>Generate New Payment QR</span>
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
            </div>
          ) : /* ---------------------------------------------------------- */
          /* 3. REQUIRES RECONCILIATION SCREEN                           */
          /* ---------------------------------------------------------- */
          paymentStatus === "REQUIRES_RECONCILIATION" ? (
            <div className="py-6 text-center space-y-4 animate-fade-in">
              <div className="relative mx-auto w-16 h-16 flex items-center justify-center rounded-full bg-blue-100 text-blue-700 border border-blue-300">
                <HelpCircle className="w-8 h-8" />
              </div>

              <div className="space-y-1">
                <span className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-800">
                  Reconciliation In Progress
                </span>
                <h3 className="font-serif text-xl font-bold text-stone-900">
                  Payment Status Under Verification
                </h3>
                <p className="text-xs text-stone-600 max-w-xs mx-auto leading-relaxed">
                  Your bank has received a payment signal, but final confirmation is taking slightly longer. Your order is safely held for reconciliation without duplicate charging.
                </p>
              </div>

              <div className="space-y-2 pt-2 max-w-sm mx-auto">
                <Button
                  variant="outline"
                  onClick={checkPaymentStatusManual}
                  disabled={isManualChecking}
                  className="w-full py-2.5 text-xs font-bold rounded-xl"
                >
                  <RefreshCw className={`w-3.5 h-3.5 mr-1 ${isManualChecking ? "animate-spin" : ""}`} />
                  <span>Re-check With Bank Network</span>
                </Button>

                <a
                  href={supportTel}
                  className="w-full py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs rounded-xl border border-stone-200 transition flex items-center justify-center gap-1.5"
                >
                  <PhoneCall className="w-3.5 h-3.5 text-amber-600" />
                  <span>Call Store Support: {supportPhoneDisplay}</span>
                </a>
              </div>
            </div>
          ) : /* ---------------------------------------------------------- */
          /* 4. FINAL FAILURE SCREEN                                     */
          /* ---------------------------------------------------------- */
          paymentStatus === "FAILED" ? (
            <div className="py-6 text-center space-y-5 animate-fade-in">
              <div className="relative mx-auto w-20 h-20 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full bg-rose-500/20 animate-ping opacity-60" />
                <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-rose-500 to-rose-600 text-white flex items-center justify-center shadow-lg shadow-rose-600/30">
                  <XCircle className="w-10 h-10 stroke-[2.2]" />
                </div>
              </div>

              <div className="space-y-1.5">
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-rose-100 text-rose-800 border border-rose-300">
                  Payment Incomplete
                </span>
                <h3 className="font-serif text-2xl font-bold text-stone-900">
                  Transaction Cancelled
                </h3>
                <p className="text-xs text-rose-600 bg-rose-50 border border-rose-200 p-2.5 rounded-xl max-w-sm mx-auto leading-relaxed">
                  {failureReason || errorMessage || "The payment was cancelled or declined by your UPI bank."}
                </p>
              </div>

              <div className="space-y-2.5 pt-2">
                <Button
                  variant="primary"
                  onClick={initPaymentSession}
                  className="w-full py-3 text-xs font-bold bg-stone-900 hover:bg-stone-800 text-white rounded-xl shadow-sm"
                >
                  <RefreshCw className="w-3.5 h-3.5 mr-1" />
                  <span>Retry Dynamic QR Code</span>
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

              <div className="pt-4 border-t border-stone-100 text-center space-y-1.5">
                <p className="text-[11px] text-stone-500 leading-relaxed">
                  Amount deducted from bank account? Call store support with order #{orderNumber}.
                </p>
                <a
                  href={supportTel}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-800 hover:text-amber-700 transition"
                >
                  <PhoneCall className="w-3.5 h-3.5 text-amber-600" />
                  <span>{supportPhoneDisplay}</span>
                </a>
              </div>
            </div>
          ) : (
            /* ---------------------------------------------------------- */
            /* 5. PRIMARY VIEW: DYNAMIC UPI QR DISPLAY                   */
            /* ---------------------------------------------------------- */
            <div className="space-y-4 animate-fade-in text-center">
              {/* Order Amount Banner */}
              <div className="bg-stone-50 rounded-2xl p-3.5 border border-stone-200 flex items-center justify-between">
                <div className="text-left">
                  <span className="text-[10px] text-stone-500 uppercase font-mono font-bold block">
                    Exact Amount to Pay
                  </span>
                  <span className="text-2xl font-mono font-extrabold text-stone-900">
                    ₹{amountRupees.toFixed(2)}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-stone-500 uppercase font-mono block">
                    Order Ref
                  </span>
                  <span className="text-xs font-mono font-bold text-stone-800">
                    #{orderNumber}
                  </span>
                  <span className="block text-[10px] text-emerald-600 font-semibold mt-0.5">
                    ● Encrypted &amp; Verified
                  </span>
                </div>
              </div>

              {/* Dynamic QR Code Display */}
              <div className="relative mx-auto w-64 h-64 bg-white p-3 rounded-2xl border-2 border-stone-200 shadow-sm flex items-center justify-center">
                {loading ? (
                  <div className="flex flex-col items-center gap-2 text-stone-400">
                    <RefreshCw className="w-8 h-8 animate-spin text-amber-600" />
                    <span className="text-xs">Generating secure QR...</span>
                  </div>
                ) : qrCodeImage ? (
                  <div className="relative w-full h-full flex items-center justify-center">
                    <img
                      src={qrCodeImage}
                      alt={`UPI QR Code for Order #${orderNumber}`}
                      className="w-full h-full object-contain rounded-xl"
                    />
                  </div>
                ) : (
                  <div className="text-xs text-rose-600 p-4">
                    QR generation issue. Tap retry below.
                  </div>
                )}
              </div>

              {/* Scan instructions with supported app badges */}
              <div className="space-y-1.5">
                <p className="text-xs font-medium text-stone-700">
                  Scan this QR code using any UPI payment application:
                </p>
                <div className="flex items-center justify-center gap-2 text-[10px] font-semibold text-stone-600">
                  <span className="px-2 py-0.5 rounded-md bg-stone-100 border border-stone-200">GPay</span>
                  <span className="px-2 py-0.5 rounded-md bg-stone-100 border border-stone-200">PhonePe</span>
                  <span className="px-2 py-0.5 rounded-md bg-stone-100 border border-stone-200">Paytm</span>
                  <span className="px-2 py-0.5 rounded-md bg-stone-100 border border-stone-200">BHIM</span>
                  <span className="px-2 py-0.5 rounded-md bg-stone-100 border border-stone-200">CRED</span>
                </div>
              </div>

              {/* Live Status Pulse */}
              <div className="space-y-2 pt-1">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-800 text-[11px] font-bold rounded-full border border-emerald-200 animate-pulse">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>Awaiting payment confirmation from bank...</span>
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

              {/* Mobile device quick app trigger option */}
              {isMobile() && intentLinks && (
                <div className="pt-2 border-t border-stone-100">
                  <button
                    type="button"
                    onClick={() => setShowMobileApps(!showMobileApps)}
                    className="text-xs font-bold text-amber-700 hover:text-amber-800 inline-flex items-center gap-1"
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                    <span>{showMobileApps ? "Hide direct app options" : "Browsing on phone? Tap here to pay in UPI app"}</span>
                  </button>

                  {showMobileApps && (
                    <div className="grid grid-cols-2 gap-2 mt-2 pt-1 text-left animate-fade-in">
                      <button
                        type="button"
                        onClick={() => launchUpiApp("Google Pay", intentLinks.gpayUrl)}
                        disabled={!!launchingApp}
                        className="p-2.5 rounded-xl border border-stone-200 hover:border-stone-400 bg-white text-xs font-bold text-stone-800 flex items-center justify-between"
                      >
                        <span>Google Pay</span>
                        <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
                      </button>
                      <button
                        type="button"
                        onClick={() => launchUpiApp("PhonePe", intentLinks.phonepeUrl)}
                        disabled={!!launchingApp}
                        className="p-2.5 rounded-xl border border-stone-200 hover:border-purple-300 bg-white text-xs font-bold text-stone-800 flex items-center justify-between"
                      >
                        <span>PhonePe</span>
                        <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
                      </button>
                      <button
                        type="button"
                        onClick={() => launchUpiApp("Paytm", intentLinks.paytmUrl)}
                        disabled={!!launchingApp}
                        className="p-2.5 rounded-xl border border-stone-200 hover:border-sky-300 bg-white text-xs font-bold text-stone-800 flex items-center justify-between"
                      >
                        <span>Paytm</span>
                        <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
                      </button>
                      <button
                        type="button"
                        onClick={() => launchUpiApp("Any UPI App", intentLinks.genericUrl)}
                        disabled={!!launchingApp}
                        className="p-2.5 rounded-xl border border-stone-200 hover:border-emerald-300 bg-white text-xs font-bold text-stone-800 flex items-center justify-between"
                      >
                        <span>Any UPI App</span>
                        <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Telephone Support Hotline */}
              <div className="pt-3 border-t border-stone-100 text-left space-y-1">
                <div className="flex items-center gap-1.5 text-stone-800 font-bold text-xs">
                  <PhoneCall className="w-3.5 h-3.5 text-amber-600" />
                  <span>Payment issue? Raise a complaint</span>
                </div>
                <p className="text-[11px] text-stone-500 leading-relaxed">
                  Payment deducted, pending, or not reflected? Contact Homemart4u Support for assistance with your order:{" "}
                  <a href={supportTel} className="font-bold text-stone-800 hover:underline">
                    {supportPhoneDisplay}
                  </a>
                </p>
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
              <span>NPCI Encrypted Dynamic QR</span>
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
