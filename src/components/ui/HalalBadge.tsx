import React from "react";

interface HalalBadgeProps {
  size?: "sm" | "md" | "lg";
  variant?: "solid" | "outline" | "pill";
  className?: string;
}

export const HalalBadge: React.FC<HalalBadgeProps> = ({
  size = "sm",
  variant = "pill",
  className = "",
}) => {
  const sizeClasses = {
    sm: "text-[10px] px-2 py-0.5 gap-1",
    md: "text-xs px-2.5 py-1 gap-1.5",
    lg: "text-sm px-3.5 py-1.5 gap-2",
  };

  const iconSizes = {
    sm: "w-3 h-3",
    md: "w-4 h-4",
    lg: "w-5 h-5",
  };

  return (
    <span
      className={`inline-flex items-center font-sans font-bold tracking-wide rounded-full border shadow-subtle ${
        variant === "solid"
          ? "bg-forest-700 text-cream-50 border-forest-800"
          : variant === "outline"
          ? "bg-transparent text-forest-700 border-forest-600"
          : "bg-forest-50 text-forest-800 border-forest-300"
      } ${sizeClasses[size]} ${className}`}
      title="100% Halal Certified - Hand-slaughtered strictly per Islamic dietary standards"
    >
      {/* Authentic Halal Emblem Icon */}
      <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        className={`${iconSizes[size]} flex-shrink-0 text-emerald-600`}
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="10" fill="#15803d" />
        <circle cx="12" cy="12" r="8.5" fill="none" stroke="#fef08a" strokeWidth="1" />
        {/* Crescent and Star / Halal Arabic Emblem */}
        <path
          d="M10.5 7.5c1.8.8 2.8 2.4 2.8 4.5 0 2.2-1.2 3.8-3 4.5 2.5.4 5.2-1.5 5.2-4.5 0-3-2.6-4.9-5-4.5z"
          fill="#fef08a"
        />
        <polygon points="15.5,9.5 16,10.8 17.3,10.8 16.2,11.6 16.6,12.9 15.5,12 14.4,12.9 14.8,11.6 13.7,10.8 15,10.8" fill="#fef08a" />
      </svg>
      <span>100% HALAL</span>
    </span>
  );
};
