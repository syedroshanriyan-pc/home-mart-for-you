"use client";

import React, { useState, useEffect } from "react";
import { Download, X, Smartphone, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";

export const InstallPromptBanner: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Check if dismissed previously
    const dismissed = sessionStorage.getItem("pwa_install_dismissed");
    if (dismissed) return;

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowBanner(true);
    };

    window.addEventListener("beforeinstallprompt", handler);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setShowBanner(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowBanner(false);
    sessionStorage.setItem("pwa_install_dismissed", "true");
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-40 bg-stone-900/95 backdrop-blur-md text-white p-4 rounded-3xl border border-stone-700 shadow-float animate-slide-up">
      <div className="flex items-start gap-3">
        <div className="p-2.5 rounded-2xl bg-rose-600 text-white flex-shrink-0 shadow-md">
          <Smartphone className="w-5 h-5" />
        </div>

        <div className="flex-1 space-y-1">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold font-serif text-white">Install homemart4u App</span>
            <span className="px-1.5 py-0.2 rounded bg-amber-400 text-stone-950 text-[9px] font-extrabold uppercase">
              PWA
            </span>
          </div>
          <p className="text-[11px] text-stone-300 leading-snug">
            Add to home screen for 1-tap express ordering, instant dynamic QR payments, and live prep notifications.
          </p>

          <div className="pt-2 flex items-center gap-2">
            <Button
              variant="primary"
              size="sm"
              onClick={handleInstallClick}
              className="text-xs px-3.5 py-1.5 font-bold shadow-sm"
            >
              <Download className="w-3.5 h-3.5 mr-1" /> Install App
            </Button>
            <button
              onClick={handleDismiss}
              className="px-2.5 py-1.5 text-xs text-stone-400 hover:text-white transition font-medium"
            >
              Not Now
            </button>
          </div>
        </div>

        <button
          onClick={handleDismiss}
          className="text-stone-400 hover:text-white p-1 rounded-lg transition"
          title="Close"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
