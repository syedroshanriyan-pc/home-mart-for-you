"use client";

import React, { useEffect } from "react";
import { X } from "lucide-react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "xl";
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = "md",
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const maxWidthStyles = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-2xl",
  }[maxWidth];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-charcoal-700/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div
        className={`relative w-full ${maxWidthStyles} bg-cream-50 rounded-2xl shadow-float border border-cream-200 p-6 sm:p-7 z-10 animate-in fade-in zoom-in-95 duration-200`}
      >
        <div className="flex items-center justify-between pb-4 border-b border-cream-200 mb-4">
          <h3 className="font-serif text-lg font-medium text-charcoal-600">
            {title}
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-charcoal-50 hover:text-charcoal-500 hover:bg-cream-100 transition-colors"
          >
            <X className="w-5 h-5 text-charcoal-500" />
          </button>
        </div>

        <div>{children}</div>
      </div>
    </div>
  );
};
