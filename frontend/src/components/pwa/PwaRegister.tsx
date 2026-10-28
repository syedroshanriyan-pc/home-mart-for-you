"use client";

import { useEffect } from "react";

export const PwaRegister = () => {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator) || process.env.NODE_ENV !== "production") {
      return;
    }

    const registerWorker = () => {
      navigator.serviceWorker
        .register("/sw.js")
        .then((reg) => {
          console.log("PWA Service Worker registered:", reg.scope);
        })
        .catch((err) => {
          console.warn("PWA Service Worker registration notice:", err);
        });
    };

    // Defer service worker registration until browser main thread is idle
    if ("requestIdleCallback" in window) {
      const handle = (window as any).requestIdleCallback(registerWorker, { timeout: 3000 });
      return () => (window as any).cancelIdleCallback?.(handle);
    } else {
      const timeoutId = setTimeout(registerWorker, 2000);
      return () => clearTimeout(timeoutId);
    }
  }, []);

  return null;
};
