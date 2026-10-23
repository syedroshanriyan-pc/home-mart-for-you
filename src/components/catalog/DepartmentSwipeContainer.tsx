"use client";

import React, { useState, useRef, useEffect } from "react";
import { Sparkles, ShoppingBag, ArrowLeftRight, ChevronRight, ChevronLeft } from "lucide-react";

interface DepartmentSwipeContainerProps {
  meatContent: React.ReactNode;
  groceryContent: React.ReactNode;
  initialDepartment?: "MEAT" | "GROCERY";
}

export const DepartmentSwipeContainer: React.FC<DepartmentSwipeContainerProps> = ({
  meatContent,
  groceryContent,
  initialDepartment = "MEAT",
}) => {
  const [activeDepartment, setActiveDepartment] = useState<"MEAT" | "GROCERY">(initialDepartment);
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);
  const [touchDelta, setTouchDelta] = useState<number>(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Swipe detection handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    setTouchStart({ x: touch.clientX, y: touch.clientY });
    setTouchDelta(0);
    setIsSwiping(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStart) return;
    const currentX = e.touches[0].clientX;
    const currentY = e.touches[0].clientY;
    const diffX = currentX - touchStart.x;
    const diffY = currentY - touchStart.y;

    // If mainly horizontal swipe
    if (Math.abs(diffX) > Math.abs(diffY)) {
      setTouchDelta(diffX);
    }
  };

  const handleTouchEnd = () => {
    if (Math.abs(touchDelta) > 50) {
      if (touchDelta < -50 && activeDepartment === "MEAT") {
        // Swiped Left -> Switch to Grocery
        setActiveDepartment("GROCERY");
      } else if (touchDelta > 50 && activeDepartment === "GROCERY") {
        // Swiped Right -> Switch to Meat
        setActiveDepartment("MEAT");
      }
    }
    setTouchStart(null);
    setTouchDelta(0);
    setIsSwiping(false);
  };

  return (
    <div className="space-y-6">
      {/* Department Switch Bar */}
      <div className="bg-white rounded-3xl p-2 sm:p-2.5 border-2 border-stone-200 shadow-md">
        <div className="grid grid-cols-2 gap-2">
          {/* Fresh Meat Tab */}
          <button
            type="button"
            onClick={() => setActiveDepartment("MEAT")}
            className={`relative p-3 sm:p-4 rounded-2xl text-left transition-all flex items-center justify-between overflow-hidden ${
              activeDepartment === "MEAT"
                ? "bg-gradient-to-r from-rose-600 via-rose-700 to-rose-800 text-white shadow-lg shadow-rose-600/30 ring-2 ring-rose-500 scale-[1.01]"
                : "bg-stone-50 text-stone-700 hover:bg-stone-100 border border-stone-200"
            }`}
          >
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-base sm:text-lg">🍗</span>
                <span className="font-serif font-bold text-xs sm:text-sm">Fresh Meat</span>
              </div>
              <p
                className={`text-[10px] sm:text-xs mt-0.5 ${
                  activeDepartment === "MEAT" ? "text-rose-100 font-light" : "text-stone-400"
                }`}
              >
                100% Halal Farm Cuts
              </p>
            </div>

            {activeDepartment === "MEAT" && (
              <span className="hidden sm:inline-flex px-2 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-bold uppercase tracking-wider">
                Active Section
              </span>
            )}
          </button>

          {/* Groceries & Essentials Tab */}
          <button
            type="button"
            onClick={() => setActiveDepartment("GROCERY")}
            className={`relative p-3 sm:p-4 rounded-2xl text-left transition-all flex items-center justify-between overflow-hidden ${
              activeDepartment === "GROCERY"
                ? "bg-gradient-to-r from-emerald-700 via-emerald-800 to-teal-800 text-white shadow-lg shadow-emerald-700/30 ring-2 ring-emerald-500 scale-[1.01]"
                : "bg-stone-50 text-stone-700 hover:bg-stone-100 border border-stone-200"
            }`}
          >
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-base sm:text-lg">🛒</span>
                <span className="font-serif font-bold text-xs sm:text-sm">Daily Groceries</span>
                <span className="px-1.5 py-0.5 rounded-md bg-amber-400 text-stone-900 text-[9px] font-extrabold uppercase shadow-sm">
                  Daily Deals
                </span>
              </div>
              <p
                className={`text-[10px] sm:text-xs mt-0.5 ${
                  activeDepartment === "GROCERY" ? "text-emerald-100 font-light" : "text-stone-400"
                }`}
              >
                Dairy, Rice, Oils & Produce
              </p>
            </div>

            {activeDepartment === "GROCERY" && (
              <span className="hidden sm:inline-flex px-2 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-bold uppercase tracking-wider">
                Active Section
              </span>
            )}
          </button>
        </div>

        {/* Mobile Swipe Gesture Hint Strip */}
        <div className="mt-2 pt-2 border-t border-stone-100 flex items-center justify-center gap-2 text-[11px] text-stone-500 select-none">
          <ArrowLeftRight className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
          <span>
            Swipe <strong className="text-stone-700 font-semibold">Left or Right</strong> anywhere to switch between Meat & Groceries
          </span>
        </div>
      </div>

      {/* Swipeable Viewport Container */}
      <div
        ref={containerRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="w-full transition-opacity duration-300"
      >
        {activeDepartment === "MEAT" ? (
          <div className="animate-fade-in">{meatContent}</div>
        ) : (
          <div className="animate-fade-in">{groceryContent}</div>
        )}
      </div>
    </div>
  );
};
