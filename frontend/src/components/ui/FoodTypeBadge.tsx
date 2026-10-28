import React from "react";

export type FoodType = "VEG" | "NON_VEG" | "EGG";

interface FoodTypeBadgeProps {
  type: FoodType;
  showLabel?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

/**
 * Standard Indian FSSAI Veg / Non-Veg / Egg Certification Badges:
 * - VEG: Green square border with a solid green circle
 * - NON_VEG: Red/Brown square border with a solid red circle / triangle
 * - EGG: Yellow/Amber square border with a solid yellow circle
 */
export const FoodTypeBadge: React.FC<FoodTypeBadgeProps> = ({
  type,
  showLabel = false,
  size = "md",
  className = "",
}) => {
  const sizeMap = {
    sm: { box: "w-3.5 h-3.5 border-[1.5px]", dot: "w-1.5 h-1.5", text: "text-[9px]" },
    md: { box: "w-4 h-4 border-2", dot: "w-2 h-2", text: "text-[10px]" },
    lg: { box: "w-5 h-5 border-2", dot: "w-2.5 h-2.5", text: "text-xs" },
  }[size];

  if (type === "VEG") {
    return (
      <div className={`inline-flex items-center gap-1.5 ${className}`} title="100% Vegetarian">
        <div
          className={`${sizeMap.box} rounded-[4px] border-emerald-600 bg-white flex items-center justify-center p-[1px] shadow-2xs flex-shrink-0`}
        >
          <div className={`${sizeMap.dot} rounded-full bg-emerald-600`} />
        </div>
        {showLabel && (
          <span className={`font-bold tracking-wider text-emerald-700 uppercase ${sizeMap.text}`}>
            VEG
          </span>
        )}
      </div>
    );
  }

  if (type === "EGG") {
    return (
      <div className={`inline-flex items-center gap-1.5 ${className}`} title="Contains Egg">
        <div
          className={`${sizeMap.box} rounded-[4px] border-amber-500 bg-white flex items-center justify-center p-[1px] shadow-2xs flex-shrink-0`}
        >
          <div className={`${sizeMap.dot} rounded-full bg-amber-500`} />
        </div>
        {showLabel && (
          <span className={`font-bold tracking-wider text-amber-700 uppercase ${sizeMap.text}`}>
            EGG
          </span>
        )}
      </div>
    );
  }

  // Default: NON_VEG
  return (
    <div className={`inline-flex items-center gap-1.5 ${className}`} title="Non-Vegetarian">
      <div
        className={`${sizeMap.box} rounded-[4px] border-rose-600 bg-white flex items-center justify-center p-[1px] shadow-2xs flex-shrink-0`}
      >
        <div className={`${sizeMap.dot} rounded-full bg-rose-600`} />
      </div>
      {showLabel && (
        <span className={`font-bold tracking-wider text-rose-700 uppercase ${sizeMap.text}`}>
          NON-VEG
        </span>
      )}
    </div>
  );
};

/**
 * Utility helper to determine product FoodType based on name, category, and department
 */
export function getProductFoodType(product: {
  name: string;
  foodType?: string | null;
  category?: { name?: string; slug?: string; department?: string };
}): FoodType {
  // 0. Explicit Food Type tag set by Admin (VEG, NON_VEG, EGG)
  if (product.foodType === "VEG" || product.foodType === "NON_VEG" || product.foodType === "EGG") {
    return product.foodType as FoodType;
  }

  const nameLower = product.name.toLowerCase();
  const catSlug = product.category?.slug?.toLowerCase() || "";
  const catDept = product.category?.department?.toUpperCase() || "";

  // 1. Egg detection
  if (
    catSlug.includes("egg") ||
    nameLower.includes("egg") ||
    nameLower.includes("anda")
  ) {
    return "EGG";
  }

  // 2. Meat / Non-Veg detection
  if (
    catDept === "MEAT" ||
    catSlug === "fresh-chicken" ||
    catSlug === "masala-special" ||
    catSlug === "fish-seafood" ||
    nameLower.includes("chicken") ||
    nameLower.includes("mutton") ||
    nameLower.includes("goat") ||
    nameLower.includes("fish") ||
    nameLower.includes("prawn") ||
    nameLower.includes("meat") ||
    nameLower.includes("rohu") ||
    nameLower.includes("boneless") ||
    nameLower.includes("drumstick") ||
    nameLower.includes("lollypop")
  ) {
    return "NON_VEG";
  }

  // 3. Everything else in groceries is Pure Veg (Dairy, Atta, Rice, Oils, Spices, Veggies, Beverages)
  return "VEG";
}
