"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  RefreshCw,
  Clock,
  ArrowRight,
  ChevronRight,
  X,
  ShieldCheck,
  XCircle,
  CheckCircle2,
  PhoneCall,
  Banknote,
  Sparkles,
  QrCode,
  HelpCircle,
  Copy,
  Check,
  Smartphone,
  ExternalLink,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Button } from "@/components/ui/Button";

// ============================================================================
// AUTHENTIC BRAND SVG LOGOS (OFFICIAL FINTECH ASSETS)
// ============================================================================

const GooglePayLogo = () => (
  <svg viewBox="0 0 48 48" className="w-6 h-6" aria-hidden="true">
    <path fill="#4285F4" d="M44.5 20H24v8.5h11.8C34.7 33.9 30.1 37 24 37c-7.2 0-13-5.8-13-13s5.8-13 13-13c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.6 4.1 29.6 2 24 2 11.8 2 2 11.8 2 24s9.8 22 22 22c11 0 21-8 21-22 0-1.3-.2-2.7-.5-4z"/>
    <path fill="#34A853" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.6 4.1 29.6 2 24 2 16.3 2 9.7 7.3 6.3 14.7z"/>
    <path fill="#FBBC05" d="M24 46c5.5 0 10.4-1.9 14.2-5.2l-6.6-5.4c-2.1 1.4-4.7 2.2-7.6 2.2-6 0-10.7-3.1-11.8-8.5l-6.6 5.1C9 40.4 15.9 46 24 46z"/>
    <path fill="#EA4335" d="M44.5 20H24v8.5h11.8c-.8 3.3-2.7 5.9-5.2 7.6l6.6 5.4c3.9-3.6 6.8-9 6.8-17.5 0-1.3-.2-2.7-.5-4z"/>
  </svg>
);

const PhonePeLogo = () => (
  <svg viewBox="0 0 48 48" className="w-6 h-6" aria-hidden="true">
    <rect width="48" height="48" rx="12" fill="#5f259f" />
    <path
      fill="#ffffff"
      d="M32.8 19.5c0-.9-.7-1.6-1.6-1.6h-5.4v-4.1c0-.9-.7-1.6-1.6-1.6s-1.6.7-1.6 1.6v4.1h-2.1c-.8 0-1.5.7-1.5 1.5 0 .8.7 1.5 1.5 1.5h2.1v4.8h-2.1c-.8 0-1.5.7-1.5 1.5s.7 1.5 1.5 1.5h2.1v6.7c0 3.7 2.5 6.4 6.2 6.4 1.7 0 3.1-.4 4.1-1.1.7-.5.9-1.4.4-2.1-.5-.7-1.4-.9-2.1-.4-.6.4-1.5.6-2.4.6-1.9 0-3.1-1.2-3.1-3.3v-6.8h5.4c.9 0 1.6-.7 1.6-1.5 0-.8-.7-1.5-1.6-1.5h-5.4v-4.8h5.4c.9 0 1.6-.7 1.6-1.5z"
    />
  </svg>
);

const PaytmLogo = () => (
  <svg viewBox="0 0 52 48" className="w-7 h-6" aria-hidden="true">
    <rect width="52" height="48" rx="12" fill="#002970" />
    <path
      fill="#00BAF2"
      d="M14 16h6c3.3 0 5 1.7 5 4.3 0 2.5-1.7 4.2-5 4.2h-3v7.5h-3V16zm3 6h3c1.4 0 2.2-.7 2.2-1.7s-.8-1.7-2.2-1.7h-3v3.4zm10.5-6h3.2l4.8 11.2L40.3 16h3.2L37 28.5c-1 2.4-2.2 3.5-4.5 3.5h-2.2v-2.5h1.7c1.1 0 1.7-.5 2.2-1.6l.4-1-7.1-10.9z"
    />
  </svg>
);

const UpiLogo = () => (
  <svg viewBox="0 0 48 48" className="w-6 h-6" aria-hidden="true">
    <rect width="48" height="48" rx="12" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="1.5" />
    <path fill="#097939" d="M14 29l7-14h7l-7 14h-7z" />
    <path fill="#F47920" d="M24 29l7-14h7l-7 14h-7z" />
  </svg>
);

interface DynamicPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  orderNumber: string;
  amountRupees: number;
  onSuccess: (orderId: string) => void;
  onSwitchToCod?: (orderId: string) => Promise<void> | void;
}

interface GuidanceAppDetails {
  id: string;
  name: string;
  url: string;
  iosUrl?: string;
  androidUrl?: string;
  logo: React.ReactNode;
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
  const [payeeName, setPayeeName] = useState<string>("Fresh Chicken Centre");
  const [launchingApp, setLaunchingApp] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Section 9: Guidance Modal State & Troubleshooting Accordion
  const [guidanceApp, setGuidanceApp] = useState<GuidanceAppDetails | null>(null);
  const [showTroubleshooting, setShowTroubleshooting] = useState(false);
  const [isVerifyingScreen, setIsVerifyingScreen] = useState(false);

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

  // Device detection helpers (Section 4 platform-awareness)
  const isAndroid = () =>
    typeof navigator !== "undefined" && /Android/i.test(navigator.userAgent);
  const isIos = () =>
    typeof navigator !== "undefined" && /iPhone|iPad|iPod/i.test(navigator.userAgent);

  // Platform-aware URI resolution
  const resolveAppUrl = (app: GuidanceAppDetails): string => {
    if (isIos() && app.iosUrl) {
      return app.iosUrl;
    }
    if (isAndroid() && app.androidUrl) {
      return app.androidUrl;
    }
    return app.url;
  };

  // Launch external app directly from explicit user action (button click)
  const handleExecuteHandoff = (app: GuidanceAppDetails) => {
    if (launchingApp) return;
    setLaunchingApp(app.name);

    const targetUrl = resolveAppUrl(app);

    try {
      window.location.href = targetUrl;
    } catch {
      // Browser navigation fallback
    }

    // Move to Section 11 Verifying screen
    setIsVerifyingScreen(true);
    setGuidanceApp(null);

    setTimeout(() => {
      setLaunchingApp(null);
    }, 2000);
  };

  // Safe clipboard copy for payment URI
  const handleCopyPaymentLink = async () => {
    if (!qrPayload) return;
    try {
      await navigator.clipboard.writeText(qrPayload);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    } catch {
      // Clipboard fallback
    }
  };

  // 1. Initialize Dynamic QR payment session
  const initPaymentSession = async () => {
    setLoading(true);
    setPaymentStatus("PENDING");
    setIsVerifyingScreen(false);
    setGuidanceApp(null);
    setShowTroubleshooting(false);
    setErrorMessage("");
    setFailureReason("");
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
        if (data.payeeName) {
          setPayeeName(data.payeeName);
        }
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
      setErrorMessage("Network issue initializing dynamic payment session. Please retry.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    initPaymentSession();
  }, [isOpen, orderId, orderNumber, amountRupees]);

  // 2. AUTOMATIC PAYMENT STATUS DETECTION: Polls backend authoritatively
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
    }, 2500);

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-900/75 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl border border-stone-200 overflow-hidden flex flex-col max-h-[94vh]">
        
        {/* ============================================================ */}
        {/* MODAL HEADER                                                */}
        {/* ============================================================ */}
        <div className="px-5 py-3.5 bg-stone-900 text-white flex items-center justify-between border-b border-stone-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-stone-800 text-stone-200 border border-stone-700 flex items-center justify-center">
              <QrCode className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <span className="text-[10px] font-mono tracking-widest text-emerald-400 uppercase font-semibold block">
                Homemart4u Pay &bull; Dynamic UPI QR
              </span>
              <h3 className="font-serif font-bold text-sm text-stone-100">
                Order #{orderNumber}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {paymentStatus === "PENDING" && (
              <div className="flex items-center gap-1 bg-stone-800 px-2.5 py-1 rounded-full border border-stone-700 text-[11px] font-mono text-stone-300">
                <Clock className="w-3 h-3 text-emerald-400" />
                <span>{formatCountdown(countdown)}</span>
              </div>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-stone-800 text-stone-400 hover:text-white transition cursor-pointer"
              aria-label="Close payment modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ============================================================ */}
        {/* MODAL BODY                                                  */}
        {/* ============================================================ */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4">
          
          {/* ---------------------------------------------------------- */}
          {/* 1. SUCCESS SCREEN (AUTHORITATIVELY VERIFIED ONLY)          */}
          {/* ---------------------------------------------------------- */}
          {paymentStatus === "COMPLETED" ? (
            <div className="py-6 text-center space-y-5 animate-fade-in">
              <div className="relative mx-auto w-16 h-16 flex items-center justify-center rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                <CheckCircle2 className="w-9 h-9 stroke-[2.2] text-emerald-600" />
              </div>

              <div className="space-y-1.5">
                <span className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-300">
                  <Sparkles className="w-3 h-3 text-emerald-700" />
                  Payment Verified
                </span>
                <h3 className="font-serif text-2xl font-bold text-stone-900">
                  Payment successful
                </h3>
                <p className="text-sm font-semibold text-emerald-800">
                  ₹{amountRupees.toFixed(2)} Paid Successfully
                </p>
                <p className="text-xs text-stone-500 font-mono">
                  Ref: {confirmedTxnRef || `UPI_${orderNumber}`}
                </p>
              </div>

              {/* Kitchen confirmation disclosure */}
              <div className="bg-stone-50 border border-stone-200 rounded-xl p-3.5 text-left space-y-1">
                <div className="flex items-center gap-2 text-stone-800 font-semibold text-xs">
                  <Clock className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>Order Transferred to Kitchen</span>
                </div>
                <p className="text-[11px] text-stone-600 leading-relaxed">
                  Your payment has been received by the store. The <strong>20-minute delivery countdown begins once confirmed by admin</strong>.
                </p>
              </div>

              <div className="pt-2">
                <Button
                  variant="primary"
                  onClick={() => onSuccess(orderId)}
                  className="w-full py-2.5 text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl shadow-xs cursor-pointer"
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
              <div className="relative mx-auto w-14 h-14 flex items-center justify-center rounded-full bg-stone-100 text-stone-600 border border-stone-300">
                <Clock className="w-7 h-7" />
              </div>

              <div className="space-y-1">
                <span className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-stone-100 text-stone-700 border border-stone-300">
                  Session Expired
                </span>
                <h3 className="font-serif text-xl font-bold text-stone-900">
                  Payment QR Code Timed Out
                </h3>
                <p className="text-xs text-stone-600 max-w-xs mx-auto leading-relaxed">
                  The 5-minute validity window for this session has ended. To prevent duplicate charges, please generate a fresh QR or switch to Cash on Delivery.
                </p>
              </div>

              <div className="space-y-2 pt-2 max-w-sm mx-auto">
                <Button
                  variant="primary"
                  onClick={initPaymentSession}
                  className="w-full py-2.5 text-xs font-bold bg-stone-900 hover:bg-stone-800 text-white rounded-xl shadow-xs cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5 mr-1" />
                  <span>Generate New Payment QR</span>
                </Button>

                {onSwitchToCod && (
                  <button
                    onClick={handleSwitchToCodDirect}
                    disabled={isSwitchingCod}
                    className="w-full py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-800 font-semibold text-xs rounded-xl border border-stone-300 transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Banknote className="w-4 h-4 text-emerald-700" />
                    <span>Switch to Cash on Delivery</span>
                  </button>
                )}
              </div>
            </div>
          ) : /* ---------------------------------------------------------- */
          /* 3. REQUIRES RECONCILIATION SCREEN                           */
          /* ---------------------------------------------------------- */
          paymentStatus === "REQUIRES_RECONCILIATION" ? (
            <div className="py-6 text-center space-y-4 animate-fade-in">
              <div className="relative mx-auto w-14 h-14 flex items-center justify-center rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                <HelpCircle className="w-7 h-7 text-amber-600" />
              </div>

              <div className="space-y-1">
                <span className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800 border border-amber-300">
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
                  className="w-full py-2 text-xs font-semibold rounded-xl cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 mr-1 ${isManualChecking ? "animate-spin" : ""}`} />
                  <span>Re-check With Bank Network</span>
                </Button>

                <a
                  href={supportTel}
                  className="w-full py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 font-semibold text-xs rounded-xl border border-stone-200 transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <PhoneCall className="w-3.5 h-3.5 text-stone-600" />
                  <span>Call Store Support: {supportPhoneDisplay}</span>
                </a>
              </div>
            </div>
          ) : /* ---------------------------------------------------------- */
          /* 4. FINAL FAILURE SCREEN (TERMINAL STATE ONLY)               */
          /* ---------------------------------------------------------- */
          paymentStatus === "FAILED" ? (
            <div className="py-6 text-center space-y-4 animate-fade-in">
              <div className="relative mx-auto w-14 h-14 flex items-center justify-center rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                <XCircle className="w-7 h-7 stroke-[2.2] text-rose-600" />
              </div>

              <div className="space-y-1">
                <span className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-100 text-rose-800 border border-rose-200">
                  Payment Incomplete
                </span>
                <h3 className="font-serif text-xl font-bold text-stone-900">
                  Payment could not be completed
                </h3>
                <p className="text-xs text-stone-600">
                  Transaction Cancelled or Declined by Bank
                </p>
                <p className="text-xs text-rose-700 bg-rose-50 border border-rose-200 p-2.5 rounded-xl max-w-sm mx-auto leading-relaxed">
                  {failureReason || errorMessage || "The payment was cancelled or declined by your UPI bank."}
                </p>
              </div>

              <div className="space-y-2 pt-2 max-w-sm mx-auto">
                <Button
                  variant="primary"
                  onClick={initPaymentSession}
                  className="w-full py-2.5 text-xs font-bold bg-stone-900 hover:bg-stone-800 text-white rounded-xl shadow-xs cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5 mr-1" />
                  <span>Retry Dynamic QR Code</span>
                </Button>

                {onSwitchToCod && (
                  <button
                    onClick={handleSwitchToCodDirect}
                    disabled={isSwitchingCod}
                    className="w-full py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-800 font-semibold text-xs rounded-xl border border-stone-300 transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Banknote className="w-4 h-4 text-emerald-700" />
                    <span>Switch to Cash on Delivery</span>
                  </button>
                )}
              </div>

              <div className="pt-3 border-t border-stone-200 text-center space-y-1">
                <p className="text-[11px] text-stone-500">
                  Amount deducted? Contact store support with order #{orderNumber}.
                </p>
                <a
                  href={supportTel}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-800 hover:underline cursor-pointer"
                >
                  <PhoneCall className="w-3 h-3 text-stone-600" />
                  <span>{supportPhoneDisplay}</span>
                </a>
              </div>
            </div>
          ) : /* ---------------------------------------------------------- */
          /* 5. SECTION 9: PAYMENT-APP GUIDANCE MODAL                   */
          /* ---------------------------------------------------------- */
          guidanceApp ? (
            <div className="space-y-4 animate-fade-in text-left">
              <div className="flex items-center gap-3 pb-3 border-b border-stone-100">
                <div className="w-10 h-10 rounded-xl bg-stone-50 border border-stone-200 flex items-center justify-center p-1.5">
                  {guidanceApp.logo}
                </div>
                <div>
                  <h3 className="font-serif font-bold text-base text-stone-900">
                    Continue with your UPI app
                  </h3>
                  <span className="text-[11px] text-stone-500 block">
                    Selected application: <strong>{guidanceApp.name}</strong>
                  </span>
                </div>
              </div>

              <div className="bg-stone-50 rounded-xl p-3.5 border border-stone-200 space-y-2">
                <p className="text-xs text-stone-700 leading-relaxed font-medium">
                  Homemart4u will attempt to open your selected payment application. Your browser or device may ask you to confirm before opening it.
                </p>
              </div>

              {/* Numbered Instructions per Section 9 */}
              <div className="space-y-2 py-1">
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-stone-500 font-mono">
                  Instructions
                </h4>
                <ol className="space-y-2 text-xs text-stone-700 list-decimal list-inside pl-1 leading-relaxed">
                  <li className="pl-1">Choose your preferred UPI application.</li>
                  <li className="pl-1">Select <strong>Continue to payment</strong>.</li>
                  <li className="pl-1">Approve the open-app prompt if your device displays one.</li>
                  <li className="pl-1">Complete the transaction in your payment application.</li>
                  <li className="pl-1">Return to Homemart4u to check your verified payment status.</li>
                </ol>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-2">
                <Button
                  variant="primary"
                  onClick={() => handleExecuteHandoff(guidanceApp)}
                  disabled={!!launchingApp}
                  className="w-full py-2.5 text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Smartphone className="w-4 h-4" />
                  <span>
                    {launchingApp ? "Opening..." : `Continue to ${guidanceApp.name}, when supported`}
                  </span>
                </Button>

                <button
                  type="button"
                  onClick={() => {
                    if (intentLinks?.genericUrl) {
                      handleExecuteHandoff({
                        id: "universal",
                        name: "Any UPI App",
                        url: intentLinks.genericUrl,
                        logo: <UpiLogo />,
                      });
                    }
                  }}
                  className="w-full py-2 text-xs font-semibold text-stone-700 hover:text-stone-900 bg-stone-50 hover:bg-stone-100 rounded-xl border border-stone-200 transition cursor-pointer"
                >
                  Continue with another supported UPI app
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setGuidanceApp(null);
                    setIsVerifyingScreen(false);
                  }}
                  className="w-full py-2 text-xs font-semibold text-stone-700 hover:text-stone-900 bg-stone-50 hover:bg-stone-100 rounded-xl border border-stone-200 transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <QrCode className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Show QR code, when supported</span>
                </button>

                {/* Troubleshooting Accordion */}
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={() => setShowTroubleshooting((prev) => !prev)}
                    className="w-full py-1.5 text-[11px] font-medium text-stone-500 hover:text-stone-800 flex items-center justify-between transition cursor-pointer"
                  >
                    <span>Payment app not opening?</span>
                    {showTroubleshooting ? (
                      <ChevronUp className="w-3.5 h-3.5" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5" />
                    )}
                  </button>

                  {showTroubleshooting && (
                    <div className="mt-1 p-3 bg-stone-50 rounded-xl border border-stone-200 text-[11px] text-stone-600 space-y-1.5 animate-fade-in leading-relaxed">
                      <p>
                        &bull; Some mobile browsers or bank apps restrict direct browser-initiated payments for security.
                      </p>
                      <p>
                        &bull; If your app doesn&apos;t open or shows a security notice, return to the modal and <strong>scan the QR code with your phone camera</strong>, or switch to <strong>Cash on Delivery</strong>.
                      </p>
                    </div>
                  )}
                </div>

                <div className="pt-1">
                  <button
                    type="button"
                    onClick={() => setGuidanceApp(null)}
                    className="w-full py-2 text-xs text-stone-500 hover:text-stone-800 transition text-center cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          ) : /* ---------------------------------------------------------- */
          /* 6. SECTION 11: PENDING VERIFICATION SCREEN                */
          /* ---------------------------------------------------------- */
          isVerifyingScreen ? (
            <div className="py-6 text-center space-y-4 animate-fade-in">
              <div className="relative mx-auto w-16 h-16 flex items-center justify-center rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                <RefreshCw className="w-8 h-8 animate-spin text-emerald-600" />
              </div>

              <div className="space-y-1.5">
                <span className="inline-flex items-center gap-1.5 px-3 py-0.5 bg-emerald-50 text-emerald-800 text-[10px] font-bold uppercase tracking-wider rounded-full border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                  Live Bank Check
                </span>
                <h3 className="font-serif text-2xl font-bold text-stone-900">
                  Verifying your payment
                </h3>
                <p className="text-xs text-stone-600 max-w-xs mx-auto leading-relaxed">
                  Homemart4u is checking with the bank network. Please complete the transaction in your payment app and return here. Do not refresh or pay again.
                </p>
              </div>

              <div className="space-y-2 pt-2 max-w-sm mx-auto">
                <Button
                  variant="primary"
                  onClick={checkPaymentStatusManual}
                  disabled={isManualChecking}
                  className="w-full py-2.5 text-xs font-bold bg-stone-900 hover:bg-stone-800 text-white rounded-xl shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isManualChecking ? "animate-spin" : ""}`} />
                  <span>Check Bank Status Now</span>
                </Button>

                <button
                  type="button"
                  onClick={() => setIsVerifyingScreen(false)}
                  className="w-full py-2 text-xs font-semibold text-stone-700 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 rounded-xl border border-stone-200 transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <QrCode className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Return to Payment Options / Show QR</span>
                </button>

                {onSwitchToCod && (
                  <button
                    onClick={handleSwitchToCodDirect}
                    disabled={isSwitchingCod}
                    className="w-full py-2 text-stone-600 hover:text-stone-800 text-xs transition cursor-pointer"
                  >
                    Switch to Cash on Delivery
                  </button>
                )}
              </div>
            </div>
          ) : (
            /* ---------------------------------------------------------- */
            /* 7. PRIMARY VIEW: REFINED FINTECH EXPERIENCE                */
            /* ---------------------------------------------------------- */
            <div className="space-y-4 animate-fade-in">
              
              {/* BLOCK 1: ORDER AMOUNT BANNER */}
              <div className="bg-stone-50 rounded-xl p-3.5 border border-stone-200 flex items-center justify-between">
                <div className="text-left">
                  <span className="text-[10px] text-stone-500 uppercase font-mono font-semibold tracking-wider block">
                    Exact Amount to Pay
                  </span>
                  <span className="text-2xl font-mono font-bold text-stone-900 tracking-tight">
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
                  <span className="inline-flex items-center gap-1 text-[10px] text-emerald-800 font-medium mt-0.5 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    ● Encrypted &amp; Verified
                  </span>
                </div>
              </div>

              {/* BLOCK 2: DYNAMIC UPI QR SCANNER (PRIMARY / FAIL-SAFE METHOD) */}
              <div className="bg-stone-50/70 rounded-xl p-4 border border-stone-200 space-y-3 text-center">
                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center gap-1.5 text-stone-800 text-xs font-bold">
                    <QrCode className="w-4 h-4 text-emerald-700" />
                    <span>Or Scan with Any Phone Camera / UPI App</span>
                  </div>
                  <span className="text-[10px] text-stone-500 font-mono">
                    Payee: {payeeName}
                  </span>
                </div>

                <div className="relative mx-auto w-48 h-48 bg-white p-2.5 rounded-xl border border-stone-300 shadow-xs flex items-center justify-center">
                  {loading ? (
                    <div className="flex flex-col items-center gap-2 text-stone-400">
                      <RefreshCw className="w-7 h-7 animate-spin text-stone-600" />
                      <span className="text-[11px]">Generating secure QR...</span>
                    </div>
                  ) : qrCodeImage ? (
                    <div className="relative w-full h-full flex items-center justify-center">
                      <img
                        src={qrCodeImage}
                        alt={`UPI Payment QR for Order #${orderNumber}`}
                        className="w-full h-full object-contain rounded-lg"
                      />
                    </div>
                  ) : (
                    <div className="text-xs text-rose-600 p-4">
                      QR generation issue. Tap retry below.
                    </div>
                  )}
                </div>

                <p className="text-[11px] text-stone-600 max-w-xs mx-auto leading-relaxed">
                  Open Google Pay, PhonePe, Paytm, or your bank app camera to scan and pay.
                </p>

                {/* Copy Payment Link Option */}
                {qrPayload && (
                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={handleCopyPaymentLink}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[11px] font-medium text-stone-700 bg-white hover:bg-stone-100 border border-stone-200 transition cursor-pointer"
                    >
                      {copiedLink ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-700 font-semibold">Payment Link Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-stone-500" />
                          <span>Copy Payment Link</span>
                        </>
                      )}
                    </button>
                  </div>
                )}

                {/* Live Status Pulse & Manual Verification Trigger */}
                <div className="space-y-2 pt-2 border-t border-stone-200/80">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-emerald-50 text-emerald-800 text-[10px] font-semibold rounded-full border border-emerald-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                    <span>Awaiting payment confirmation from bank...</span>
                  </div>

                  <div>
                    <button
                      type="button"
                      disabled={isManualChecking}
                      onClick={checkPaymentStatusManual}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium text-stone-700 hover:text-stone-900 bg-white hover:bg-stone-100 border border-stone-200 transition shadow-xs cursor-pointer"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isManualChecking ? "animate-spin" : ""}`} />
                      <span>Check Bank Status Now</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* BLOCK 3: 1-TAP UPI PAYMENT APPLICATIONS (SEPARATED CARDS) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between px-1">
                  <span className="text-xs font-bold text-stone-800 tracking-tight">
                    Pay Directly via UPI Apps
                  </span>
                  <span className="text-[10px] text-stone-600 bg-stone-100 px-2 py-0.5 rounded-md border border-stone-200">
                    Mobile 1-Tap
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  {/* Google Pay Block */}
                  <button
                    type="button"
                    onClick={() => {
                      if (intentLinks?.gpayUrl) {
                        setGuidanceApp({
                          id: "gpay",
                          name: "Google Pay",
                          url: intentLinks.gpayUrl,
                          iosUrl: intentLinks.gpayUrl,
                          androidUrl: intentLinks.androidGpayIntent || intentLinks.gpayUrl,
                          logo: <GooglePayLogo />,
                        });
                      }
                    }}
                    disabled={!intentLinks?.gpayUrl}
                    className="p-3 rounded-xl border border-stone-200 hover:border-stone-400 bg-white text-left transition shadow-xs active:scale-[0.99] group flex flex-col justify-between h-20 disabled:opacity-60 cursor-pointer"
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="w-8 h-8 rounded-lg bg-stone-50 border border-stone-200 flex items-center justify-center p-1">
                        <GooglePayLogo />
                      </div>
                      <ChevronRight className="w-4 h-4 text-stone-400 group-hover:text-stone-700 transition" />
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-stone-900 block leading-none">
                        Google Pay
                      </span>
                      <span className="text-[10px] text-stone-500 mt-0.5 block">
                        Direct Transfer
                      </span>
                    </div>
                  </button>

                  {/* PhonePe Block */}
                  <button
                    type="button"
                    onClick={() => {
                      if (intentLinks?.phonepeUrl) {
                        setGuidanceApp({
                          id: "phonepe",
                          name: "PhonePe",
                          url: intentLinks.phonepeUrl,
                          iosUrl: intentLinks.phonepeUrl,
                          androidUrl: intentLinks.androidPhonePeIntent || intentLinks.phonepeUrl,
                          logo: <PhonePeLogo />,
                        });
                      }
                    }}
                    disabled={!intentLinks?.phonepeUrl}
                    className="p-3 rounded-xl border border-stone-200 hover:border-stone-400 bg-white text-left transition shadow-xs active:scale-[0.99] group flex flex-col justify-between h-20 disabled:opacity-60 cursor-pointer"
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="w-8 h-8 rounded-lg bg-stone-50 border border-stone-200 flex items-center justify-center p-0.5">
                        <PhonePeLogo />
                      </div>
                      <ChevronRight className="w-4 h-4 text-stone-400 group-hover:text-stone-700 transition" />
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-stone-900 block leading-none">
                        PhonePe
                      </span>
                      <span className="text-[10px] text-stone-500 mt-0.5 block">
                        Bank Direct
                      </span>
                    </div>
                  </button>

                  {/* Paytm Block */}
                  <button
                    type="button"
                    onClick={() => {
                      if (intentLinks?.paytmUrl) {
                        setGuidanceApp({
                          id: "paytm",
                          name: "Paytm",
                          url: intentLinks.paytmUrl,
                          iosUrl: intentLinks.paytmUrl,
                          androidUrl: intentLinks.androidPaytmIntent || intentLinks.paytmUrl,
                          logo: <PaytmLogo />,
                        });
                      }
                    }}
                    disabled={!intentLinks?.paytmUrl}
                    className="p-3 rounded-xl border border-stone-200 hover:border-stone-400 bg-white text-left transition shadow-xs active:scale-[0.99] group flex flex-col justify-between h-20 disabled:opacity-60 cursor-pointer"
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="w-8 h-8 rounded-lg bg-stone-50 border border-stone-200 flex items-center justify-center p-0.5">
                        <PaytmLogo />
                      </div>
                      <ChevronRight className="w-4 h-4 text-stone-400 group-hover:text-stone-700 transition" />
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-stone-900 block leading-none">
                        Paytm
                      </span>
                      <span className="text-[10px] text-stone-500 mt-0.5 block">
                        UPI &amp; Wallet
                      </span>
                    </div>
                  </button>

                  {/* Any UPI / BHIM Block */}
                  <button
                    type="button"
                    onClick={() => {
                      if (intentLinks?.genericUrl) {
                        setGuidanceApp({
                          id: "universal",
                          name: "Any UPI App",
                          url: intentLinks.genericUrl,
                          iosUrl: intentLinks.genericUrl,
                          androidUrl: intentLinks.genericUrl,
                          logo: <UpiLogo />,
                        });
                      }
                    }}
                    disabled={!intentLinks?.genericUrl}
                    className="p-3 rounded-xl border border-stone-200 hover:border-stone-400 bg-white text-left transition shadow-xs active:scale-[0.99] group flex flex-col justify-between h-20 disabled:opacity-60 cursor-pointer"
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="w-8 h-8 rounded-lg bg-stone-50 border border-stone-200 flex items-center justify-center p-0.5">
                        <UpiLogo />
                      </div>
                      <ChevronRight className="w-4 h-4 text-stone-400 group-hover:text-stone-700 transition" />
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-stone-900 block leading-none">
                        Any UPI App
                      </span>
                      <span className="text-[10px] text-stone-500 mt-0.5 block">
                        CRED, BHIM &amp; more
                      </span>
                    </div>
                  </button>
                </div>

                <p className="text-[10px] text-stone-500 leading-normal px-1">
                  Note: If your payment app displays a bank security alert during direct 1-tap intent, please use the QR Code scan above or select Cash on Delivery.
                </p>
              </div>

              {/* BLOCK 4: TELEPHONE SUPPORT HELP DESK */}
              <div className="bg-stone-50 rounded-xl p-3 border border-stone-200 text-left space-y-1">
                <div className="flex items-center gap-1.5 text-stone-800 font-semibold text-xs">
                  <PhoneCall className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Payment issue? Raise a complaint</span>
                </div>
                <p className="text-[11px] text-stone-500 leading-relaxed">
                  Payment deducted, pending, or not reflected? Contact Homemart4u Support for assistance with your order:{" "}
                  <a href={supportTel} className="font-semibold text-stone-800 hover:underline cursor-pointer">
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
          <div className="px-5 py-3 bg-stone-50 border-t border-stone-200 flex items-center justify-between text-xs">
            <span className="text-[11px] text-stone-500 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
              <span>NPCI Encrypted Dynamic QR</span>
            </span>

            {onSwitchToCod && (
              <button
                type="button"
                onClick={handleSwitchToCodDirect}
                disabled={isSwitchingCod}
                className="font-semibold text-stone-700 hover:text-stone-900 transition flex items-center gap-1 hover:underline text-[11px] cursor-pointer"
              >
                <Banknote className="w-3.5 h-3.5 text-emerald-700" />
                <span>Switch to Cash on Delivery</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
