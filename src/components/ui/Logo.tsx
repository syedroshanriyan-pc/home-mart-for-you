import React from "react";
import Link from "next/link";

interface LogoProps {
  className?: string;
  variant?: "dark" | "light";
  size?: "sm" | "md" | "lg";
}

export const Logo: React.FC<LogoProps> = ({
  className = "",
  variant = "dark",
  size = "md",
}) => {
  const isLight = variant === "light";

  const sizeClasses = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-2xl",
  }[size];

  const iconSizes = {
    sm: 24,
    md: 30,
    lg: 38,
  }[size];

  return (
    <Link
      href="/"
      className={`group inline-flex items-center gap-2.5 transition-all duration-300 ${className}`}
    >
      {/* Minimal luxury mark: geometric artisan poultry emblem */}
      <div
        className={`relative flex items-center justify-center rounded-xl p-2 transition-transform duration-300 group-hover:scale-105 ${
          isLight
            ? "bg-amberGold-400/20 text-amberGold-300 ring-1 ring-amberGold-400/30"
            : "bg-charcoal-500 text-cream-50 ring-1 ring-charcoal-400"
        }`}
      >
        <svg
          width={iconSizes}
          height={iconSizes}
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="transition-colors"
        >
          {/* Elegant geometric chicken silhouette */}
          <path
            d="M8 22C8 16 12 11 18 11C20.5 11 23 12 24.5 14C26 16 26.5 19 25 22C23.5 25 20 26 16 26C11 26 8 24 8 22Z"
            fill="currentColor"
            fillOpacity="0.15"
          />
          <path
            d="M17 6C15 6 13.5 7.5 13.5 9.5C13.5 10.5 14 11.5 15 12C12 13 9 16 9 20C9 23 12 25 16 25C21 25 24 22 24 18C24 15 22 13 19 12.5C19.8 11.5 20 10 19 9C18.5 7.5 17.5 6 17 6Z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Comb mark */}
          <path
            d="M16 4C16.5 5 18 5 18.5 6"
            stroke="#CB810E"
            strokeWidth="2"
            strokeLinecap="round"
          />
          {/* Beak & eye */}
          <circle cx="16" cy="9.5" r="0.9" fill="currentColor" />
          <path
            d="M14 9.5L12 10.5"
            stroke="#CB810E"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
          {/* Freshness leaf accent */}
          <path
            d="M20 18C22 17 23 15 24 14"
            stroke="#79967D"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </svg>
      </div>

      <div className="flex flex-col leading-tight">
        <span
          className={`font-serif tracking-tight font-medium ${sizeClasses} ${
            isLight ? "text-cream-50" : "text-charcoal-600"
          }`}
        >
          Fresh Chicken
        </span>
        <span
          className={`text-[9px] uppercase tracking-widest font-sans font-medium ${
            isLight ? "text-cream-300" : "text-amberGold-600"
          }`}
        >
          Mulbagal &bull; Artisanal Cut
        </span>
      </div>
    </Link>
  );
};
