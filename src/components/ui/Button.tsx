import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "accent" | "outline" | "ghost" | "danger" | "success";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = "primary",
  size = "md",
  isLoading = false,
  disabled,
  className = "",
  ...props
}) => {
  const baseStyles =
    "relative inline-flex items-center justify-center font-semibold tracking-wide transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.98]";

  const sizeStyles = {
    sm: "px-3.5 py-1.5 text-xs rounded-xl gap-1.5 shadow-sm",
    md: "px-5 py-2.5 text-sm rounded-xl gap-2 shadow-sm",
    lg: "px-6 py-3.5 text-base rounded-2xl gap-2.5 shadow-md",
  }[size];

  const variantStyles = {
    primary:
      "bg-gradient-to-r from-rose-600 via-rose-650 to-rose-700 hover:from-rose-700 hover:via-rose-750 hover:to-rose-800 text-white shadow-md shadow-rose-600/30 border border-rose-500/40 hover:shadow-lg hover:shadow-rose-600/40 active:from-rose-800 active:to-rose-900",
    accent:
      "bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white shadow-md shadow-amber-500/30 border border-amber-450 active:from-amber-700 active:to-amber-800",
    secondary:
      "bg-white hover:bg-stone-50 text-stone-800 border-2 border-stone-200 hover:border-stone-300 shadow-sm active:bg-stone-100",
    outline:
      "bg-white/90 hover:bg-white text-stone-700 border-2 border-stone-300 hover:border-rose-500 hover:text-rose-700 shadow-sm active:bg-rose-50",
    ghost:
      "bg-transparent hover:bg-stone-200/60 text-stone-700 hover:text-stone-900 active:bg-stone-200",
    danger:
      "bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-md shadow-red-600/30 border border-red-500",
    success:
      "bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white shadow-md shadow-emerald-600/30 border border-emerald-500",
  }[variant];

  return (
    <button
      disabled={disabled || isLoading}
      className={`${baseStyles} ${sizeStyles} ${variantStyles} ${className}`}
      {...props}
    >
      {isLoading && (
        <svg
          className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      {children}
    </button>
  );
};
