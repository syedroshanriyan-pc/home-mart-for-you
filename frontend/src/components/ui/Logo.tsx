import React from "react";
import Link from "next/link";

interface LogoProps {
  className?: string;
  variant?: "dark" | "light";
  size?: "sm" | "md" | "lg";
  showTagline?: boolean;
}

export const Logo: React.FC<LogoProps> = ({
  className = "",
  variant = "dark",
  size = "md",
  showTagline = true,
}) => {
  const isLight = variant === "light";

  const iconDimensions = {
    sm: { w: 38, h: 33 },
    md: { w: 48, h: 42 },
    lg: { w: 60, h: 52 },
  }[size];

  const fontSizeClasses = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-2xl",
  }[size];

  return (
    <Link
      href="/"
      className={`group inline-flex items-center gap-2.5 transition-all duration-300 ${className}`}
    >
      {/* Brand Icon (Rooster, Home, Speeding Shopping Cart, Golden Swoosh) */}
      <div className="relative flex-shrink-0 transition-transform duration-300 group-hover:scale-105">
        <svg
          width={iconDimensions.w}
          height={iconDimensions.h}
          viewBox="0 0 160 140"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Golden Base Swoosh */}
          <path d="M 22 108 C 48 126, 92 128, 142 96 C 114 116, 68 116, 32 102 Z" fill="#F59E0B" />
          
          {/* House Roof & Windows in Background */}
          <path d="M 88 56 L 126 26 L 150 45 V 72 H 138 V 48 L 126 38 L 98 62 Z" fill="#991B1B" />
          <rect x="110" y="46" width="6" height="6" rx="1" fill="#FBBF24" />
          <rect x="118" y="46" width="6" height="6" rx="1" fill="#FBBF24" />
          <rect x="110" y="54" width="6" height="6" rx="1" fill="#FBBF24" />
          <rect x="118" y="54" width="6" height="6" rx="1" fill="#FBBF24" />

          {/* Speeding Shopping Cart */}
          <path d="M 94 68 H 106 M 88 74 H 104 M 92 80 H 106" stroke="#C51111" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M 108 65 H 136 L 131 82 H 112 Z" fill="none" stroke="#C51111" strokeWidth="2.6" strokeLinejoin="round" />
          <path d="M 117 65 V 82 M 126 65 V 82 M 108 73 H 134" stroke="#C51111" strokeWidth="2" />
          <path d="M 136 65 L 140 59" stroke="#C51111" strokeWidth="2.6" strokeLinecap="round" />
          <circle cx="115" cy="87" r="2.8" fill="#C51111" />
          <circle cx="127" cy="87" r="2.8" fill="#C51111" />

          {/* Rooster Body & Crimson Feathers */}
          <path d="M 24 94 C 24 74, 40 54, 58 44 C 54 54, 52 66, 56 78 C 50 82, 42 88, 36 96 C 30 102, 26 100, 24 94 Z" fill="#B91C1C" />
          <path d="M 52 46 C 44 58, 38 72, 34 88 C 42 78, 52 70, 62 64 C 58 58, 55 52, 52 46 Z" fill="#DC2626" />
          
          {/* White Feathers & Neck */}
          <path d="M 60 40 C 60 40, 72 44, 78 52 C 84 60, 84 72, 88 84 C 84 88, 76 96, 68 100 C 72 90, 72 82, 68 76 C 64 84, 58 92, 50 96 C 54 88, 56 80, 54 72 C 48 80, 42 86, 36 90 C 40 76, 46 62, 58 48 Z" fill="#FFFFFF" />
          <path d="M 64 56 C 68 68, 72 80, 74 92" stroke="#CBD5E1" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M 56 64 C 58 74, 60 84, 58 92" stroke="#CBD5E1" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M 46 72 C 48 80, 48 86, 44 92" stroke="#CBD5E1" strokeWidth="1.8" strokeLinecap="round" />

          {/* Rooster Head & Face */}
          <path d="M 60 38 C 64 36, 74 38, 78 44 C 82 50, 78 58, 72 62 C 64 62, 58 52, 60 38 Z" fill="#DC2626" />

          {/* Rooster Comb / Crest */}
          <path d="M 52 38 C 50 26, 56 16, 66 12 C 68 20, 72 22, 76 18 C 80 14, 86 16, 88 24 C 92 22, 98 26, 96 34 C 94 40, 88 44, 82 46 C 76 38, 64 36, 52 38 Z" fill="#C51111" />
          <path d="M 56 34 C 54 26, 60 18, 67 15 C 68 22, 73 24, 76 21 C 80 18, 85 20, 86 26 C 82 32, 74 36, 64 36 C 60 36, 58 35, 56 34 Z" fill="#EF4444" />

          {/* Beak */}
          <path d="M 78 46 L 96 52 C 92 56, 84 60, 78 58 Z" fill="#F59E0B" />
          <path d="M 78 46 L 96 52 L 86 54 Z" fill="#FBBF24" />

          {/* Wattle */}
          <path d="M 76 58 C 82 58, 88 64, 86 74 C 84 82, 74 84, 70 76 C 68 70, 70 58, 76 58 Z" fill="#DC2626" />
          <path d="M 74 60 C 78 60, 82 65, 81 72 C 80 77, 74 78, 71 73 Z" fill="#EF4444" />

          {/* Eye */}
          <circle cx="72" cy="45" r="3.2" fill="#FFFFFF" />
          <circle cx="72" cy="45" r="2" fill="#1C1917" />
          <circle cx="71.2" cy="44.2" r="0.7" fill="#FFFFFF" />
        </svg>
      </div>

      {/* Typography: HOMEMART4U */}
      <div className="flex flex-col leading-none">
        <div className="flex items-center">
          <span
            className={`font-sans tracking-tight font-black uppercase text-base sm:${fontSizeClasses} ${
              isLight ? "text-white" : "text-stone-900"
            }`}
          >
            HOMEMART<span className="text-rose-600">4U</span>
          </span>
        </div>
        {showTagline && (
          <span
            className={`hidden sm:block text-[9px] uppercase tracking-wider font-sans font-bold mt-0.5 whitespace-nowrap ${
              isLight ? "text-amberGold-300" : "text-stone-500"
            }`}
          >
            Srinivaspur Road &bull; Mulbagal
          </span>
        )}
      </div>
    </Link>
  );
};
