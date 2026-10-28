import React from "react";

interface BadgeProps {
  children: React.ReactNode;
  variant?:
    | "success"
    | "warning"
    | "danger"
    | "neutral"
    | "info"
    | "inStock"
    | "outOfStock";
  size?: "sm" | "md";
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = "neutral",
  size = "md",
  className = "",
}) => {
  const sizeStyles = {
    sm: "px-2 py-0.5 text-[10px]",
    md: "px-2.5 py-1 text-xs",
  }[size];

  const variantStyles = {
    inStock:
      "bg-emerald-50 text-emerald-800 border border-emerald-200/80 font-medium",
    outOfStock:
      "bg-stone-100 text-stone-600 border border-stone-300 font-medium",
    success:
      "bg-emerald-50 text-emerald-800 border border-emerald-200",
    warning:
      "bg-amber-50 text-amber-900 border border-amber-200",
    danger:
      "bg-red-50 text-red-800 border border-red-200",
    info:
      "bg-blue-50 text-blue-800 border border-blue-200",
    neutral:
      "bg-cream-100 text-charcoal-500 border border-cream-200",
  }[variant];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-sans tracking-wide uppercase ${sizeStyles} ${variantStyles} ${className}`}
    >
      {variant === "inStock" && (
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
      )}
      {children}
    </span>
  );
};

export const OrderStatusBadge: React.FC<{ status: string }> = ({ status }) => {
  switch (status) {
    case "PLACED":
      return <Badge variant="info">Placed</Badge>;
    case "CONFIRMED":
      return <Badge variant="warning">Confirmed</Badge>;
    case "PREPARING":
      return <Badge variant="warning">Preparing in Kitchen</Badge>;
    case "OUT_FOR_DELIVERY":
      return <Badge variant="info">Out for Delivery</Badge>;
    case "DELIVERED":
      return <Badge variant="success">Delivered</Badge>;
    case "CANCELLED":
      return <Badge variant="danger">Cancelled</Badge>;
    default:
      return <Badge variant="neutral">{status}</Badge>;
  }
};
