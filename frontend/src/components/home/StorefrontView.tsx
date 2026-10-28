"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { formatCurrency } from "@/lib/delivery";
import {
  MapPin,
  Search,
  Mic,
  User as UserIcon,
  ShoppingBag,
  Sparkles,
  Truck,
  Plus,
  Minus,
  Check,
  ChevronDown,
  Tag,
  Milk,
  Wheat,
  Droplets,
  Flame,
  Carrot,
  Coffee,
  Egg,
  Fish,
} from "lucide-react";
import { HalalBadge } from "@/components/ui/HalalBadge";
import { FoodTypeBadge, getProductFoodType } from "@/components/ui/FoodTypeBadge";

export interface StoreProductVariant {
  id: string;
  name: string;
  priceMinor: number;
  mrpMinor?: number | null;
  quantityValue?: number;
  quantityUnit?: string;
  isAvailable: boolean;
}

export interface StoreProduct {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  imageUrl?: string | null;
  productType: string;
  isAvailable: boolean;
  foodType?: string | null;
  isHalal?: boolean | null;
  mrpMinor?: number | null;
  savePriceText?: string | null;
  badgeText?: string | null;
  category: {
    id: string;
    name: string;
    slug: string;
    department?: string;
  };
  variants: StoreProductVariant[];
}

interface StorefrontViewProps {
  products: StoreProduct[];
  categories: { id: string; name: string; slug: string; department?: string; imageUrl?: string | null }[];
  onOpenLocation?: () => void;
  initialDepartment?: "GROCERIES" | "MEAT";
  onBackToBlog?: () => void;
}

export const StorefrontView: React.FC<StorefrontViewProps> = ({
  products,
  categories,
  onOpenLocation,
  initialDepartment = "GROCERIES",
  onBackToBlog,
}) => {
  const { user, selectedAddress } = useAuth();
  const { items, addItem, updateQuantity } = useCart();

  // Top header toggle matching reference screenshot: ⚡ Groceries vs 🥩 Meat
  const [activeMainDept, setActiveMainDept] = useState<"GROCERIES" | "MEAT">(initialDepartment);
  const [selectedSubCat, setSelectedSubCat] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});

  // Subcategories for Groceries
  const grocerySubCats = [
    { name: "All Groceries", slug: "ALL", icon: ShoppingBag },
    { name: "Dairy & Eggs", slug: "dairy-eggs-bread", icon: Milk },
    { name: "Atta, Rice & Dals", slug: "atta-rice-dal", icon: Wheat },
    { name: "Oils & Ghee", slug: "oils-ghee", icon: Droplets },
    { name: "Masalas & Spices", slug: "spices-masalas", icon: Flame },
    { name: "Fresh Vegetables", slug: "fresh-vegetables", icon: Carrot },
    { name: "Tea & Beverages", slug: "tea-beverages", icon: Coffee },
  ];

  // Subcategories for Meat
  const meatSubCats = [
    { name: "All Meat Cuts", slug: "ALL", icon: ShoppingBag },
    { name: "Fresh Chicken", slug: "fresh-chicken", icon: Sparkles },
    { name: "Curry & Biryani Cuts", slug: "masala-special", icon: Flame },
    { name: "Desi & Farm Eggs", slug: "eggs", icon: Egg },
    { name: "Fresh Fish & Seafood", slug: "fish-seafood", icon: Fish },
  ];

  const currentSubCats = activeMainDept === "GROCERIES" ? grocerySubCats : meatSubCats;

  // Filter products by department & subcategory
  const filteredProducts = useMemo(() => {
    return products.filter((prod) => {
      const isGrocery =
        prod.category?.department === "GROCERY" ||
        [
          "dairy-eggs-bread",
          "atta-rice-dal",
          "oils-ghee",
          "spices-masalas",
          "fresh-vegetables",
          "tea-beverages",
        ].includes(prod.category?.slug);

      if (activeMainDept === "GROCERIES" && !isGrocery) return false;
      if (activeMainDept === "MEAT" && isGrocery) return false;

      if (selectedSubCat !== "ALL" && prod.category?.slug !== selectedSubCat) {
        return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = prod.name.toLowerCase().includes(q);
        const matchesDesc = prod.description?.toLowerCase().includes(q);
        const matchesCat = prod.category?.name.toLowerCase().includes(q);
        if (!matchesName && !matchesDesc && !matchesCat) return false;
      }

      return true;
    });
  }, [products, activeMainDept, selectedSubCat, searchQuery]);

  // Group products by subcategory for clean structured display
  const groupedProducts = useMemo(() => {
    const groups: Record<string, { categoryName: string; categorySlug: string; items: StoreProduct[] }> = {};

    filteredProducts.forEach((prod) => {
      const catSlug = prod.category?.slug || "general";
      const catName = prod.category?.name || "General Essentials";

      if (!groups[catSlug]) {
        groups[catSlug] = { categoryName: catName, categorySlug: catSlug, items: [] };
      }
      groups[catSlug].items.push(prod);
    });

    return Object.values(groups);
  }, [filteredProducts]);

  const getActiveVariant = (product: StoreProduct) => {
    const selId = selectedVariants[product.id];
    if (selId) {
      const found = product.variants.find((v) => v.id === selId);
      if (found) return found;
    }
    return product.variants[0];
  };

  const getCartQuantity = (productId: string, variantId: string) => {
    const item = items.find((i) => i.productId === productId && i.variantId === variantId);
    return item ? item.quantity : 0;
  };

  const getCartItemId = (productId: string, variantId: string) => {
    const item = items.find((i) => i.productId === productId && i.variantId === variantId);
    return item ? item.id : null;
  };

  const handleAddToCart = (product: StoreProduct, variant: StoreProductVariant) => {
    addItem({
      productId: product.id,
      variantId: variant.id,
      productName: product.name,
      variantName: variant.name,
      imageUrl: product.imageUrl || undefined,
      unitPriceMinor: variant.priceMinor,
      quantity: 1,
      isQualifyingMeat: activeMainDept === "MEAT",
    });
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {onBackToBlog && (
        <div className="flex items-center justify-between bg-stone-100 border border-stone-200 px-4 py-2 rounded-2xl text-xs text-stone-600">
          <span>Viewing homemart4u Storefront Catalog</span>
          <button
            type="button"
            onClick={onBackToBlog}
            className="text-rose-600 font-bold hover:underline flex items-center gap-1"
          >
            <span>&larr; View Blog &amp; Story</span>
          </button>
        </div>
      )}

      {/* 1. TOP HEADER SWITCH BAR: Streamlined Dual Pill Switcher */}
      <div className="bg-white rounded-2xl p-2 sm:p-2.5 shadow-sm border border-stone-200 max-w-md mx-auto">
        <div className="grid grid-cols-2 gap-2 bg-stone-100/90 p-1.5 rounded-xl">
          {/* Groceries Tab */}
          <button
            type="button"
            onClick={() => {
              setActiveMainDept("GROCERIES");
              setSelectedSubCat("ALL");
            }}
            className={`py-2 sm:py-2.5 px-3 rounded-lg text-xs sm:text-sm font-extrabold transition-all flex items-center justify-center gap-1.5 ${
              activeMainDept === "GROCERIES"
                ? "bg-emerald-600 text-white shadow-sm scale-[1.01]"
                : "text-stone-600 hover:text-stone-900 hover:bg-white/60"
            }`}
          >
            <span>⚡ Daily Groceries</span>
          </button>

          {/* Meat Tab */}
          <button
            type="button"
            onClick={() => {
              setActiveMainDept("MEAT");
              setSelectedSubCat("ALL");
            }}
            className={`py-2 sm:py-2.5 px-3 rounded-lg text-xs sm:text-sm font-extrabold transition-all flex items-center justify-center gap-1.5 ${
              activeMainDept === "MEAT"
                ? "bg-rose-600 text-white shadow-sm scale-[1.01]"
                : "text-stone-600 hover:text-stone-900 hover:bg-white/60"
            }`}
          >
            <span>🍗 Fresh Meat</span>
          </button>
        </div>
      </div>

      {/* 2. Subcategory Quick Strip & Filter */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-stone-800 uppercase tracking-wider text-[11px]">
              {activeMainDept === "GROCERIES" ? "Browse Grocery Categories" : "Browse Meat Cuts"}
            </span>
            <span className="text-stone-500 font-mono text-[11px] bg-stone-100 px-2 py-0.5 rounded-md">
              {filteredProducts.length} Items Available
            </span>
          </div>

          {/* Clean minimal search filter */}
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              placeholder={activeMainDept === "GROCERIES" ? "Search groceries..." : "Search fresh cuts..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-white text-stone-900 rounded-xl text-xs border border-stone-200 placeholder-stone-400 focus:outline-none focus:ring-1 focus:ring-rose-500 shadow-2xs"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {currentSubCats.map((sc) => {
            const Icon = sc.icon;
            const isSelected = selectedSubCat === sc.slug;
            return (
              <button
                key={sc.slug}
                onClick={() => setSelectedSubCat(sc.slug)}
                className={`shrink-0 px-3.5 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 shadow-sm ${
                  isSelected
                    ? activeMainDept === "GROCERIES"
                      ? "bg-emerald-700 text-white ring-2 ring-emerald-500 shadow-md"
                      : "bg-rose-700 text-white ring-2 ring-rose-500 shadow-md"
                    : "bg-white text-stone-700 hover:bg-stone-50 border border-stone-200"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isSelected ? "text-amber-300" : "text-stone-500"}`} />
                <span>{sc.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Clean Minimal Cashback / Promotion Banner (No 3rd party ads) */}
      <div className="rounded-2xl bg-gradient-to-r from-stone-900 via-rose-950 to-stone-900 text-white p-4 shadow-sm border border-stone-800 flex items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 text-[10px] font-bold uppercase tracking-wider">
            <Sparkles className="w-3 h-3" />
            <span>homemart4u Express Benefit</span>
          </div>
          <h4 className="font-serif text-sm sm:text-base font-bold text-white">
            Flat 10% Cashback on orders above ₹499
          </h4>
          <p className="text-[11px] text-stone-300">
            Delivering from our Srinivaspur Road hub in ~20 minutes with zero delivery fee for your first 3km.
          </p>
        </div>

        <div className="hidden sm:block text-right">
          <span className="px-3 py-1.5 rounded-xl bg-white text-stone-900 font-mono text-xs font-bold shadow-sm">
            CODE: FRESH100
          </span>
        </div>
      </div>

      {/* 4. Product Listing by Subcategory Sections */}
      {groupedProducts.length === 0 ? (
        <div className="bg-white rounded-3xl border border-stone-200 p-12 text-center max-w-md mx-auto space-y-2 shadow-sm">
          <ShoppingBag className="w-10 h-10 text-stone-300 mx-auto" />
          <h4 className="font-serif text-base font-bold text-stone-700">No items found</h4>
          <p className="text-xs text-stone-400">
            Try adjusting your search query or reset your category filter.
          </p>
          <button
            onClick={() => {
              setSelectedSubCat("ALL");
              setSearchQuery("");
            }}
            className="text-xs font-bold text-rose-600 hover:underline pt-2 block mx-auto"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          {groupedProducts.map((group) => (
            <div key={group.categorySlug} className="space-y-3.5">
              {/* Subcategory Section Header */}
              <div className="flex items-center justify-between border-b border-stone-200 pb-2">
                <h3 className="font-serif text-base sm:text-lg font-bold text-stone-800 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-rose-600" />
                  <span>{group.categoryName}</span>
                </h3>
                <span className="text-[11px] font-semibold text-stone-400">
                  {group.items.length} items
                </span>
              </div>

              {/* Product Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-5">
                {group.items.map((prod) => {
                  const activeVariant = getActiveVariant(prod);
                  const cartQty = activeVariant ? getCartQuantity(prod.id, activeVariant.id) : 0;
                  const cartItemId = activeVariant ? getCartItemId(prod.id, activeVariant.id) : null;

                  const sellingRs = activeVariant ? Math.round(activeVariant.priceMinor / 100) : 0;
                  const variantMrp = activeVariant?.mrpMinor ?? prod.mrpMinor;
                  const mrpRs = variantMrp ? Math.round(variantMrp / 100) : 0;
                  const savingsRs = mrpRs > sellingRs ? mrpRs - sellingRs : 0;
                  const saveTag = prod.savePriceText || (savingsRs > 0 ? `Save ₹${savingsRs}` : null);

                  return (
                    <div
                      key={prod.id}
                      className="group relative bg-white rounded-2xl sm:rounded-3xl border border-stone-200/90 shadow-sm hover:shadow-md hover:border-rose-400/50 transition-all flex flex-col justify-between overflow-hidden p-3 sm:p-4"
                    >
                      {/* Image Box */}
                      <div className="relative aspect-square w-full rounded-xl sm:rounded-2xl overflow-hidden bg-stone-50 mb-3">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={
                            prod.imageUrl ||
                            "https://images.unsplash.com/photo-1587593810167-a84920ea0781?auto=format&fit=crop&w=400&q=80"
                          }
                          alt={prod.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                        />

                        {/* Top-Right Veg / Non-Veg / Egg Badge */}
                        <div className="absolute top-2 right-2 z-10 bg-white/95 backdrop-blur-xs p-1 rounded-md shadow-xs">
                          <FoodTypeBadge type={getProductFoodType(prod)} showLabel={false} size="sm" />
                        </div>

                        {saveTag && (
                          <div className="absolute top-2 left-2">
                            <span className="px-2 py-0.5 rounded-md bg-emerald-600 text-white text-[9px] font-black uppercase tracking-wider shadow">
                              {saveTag}
                            </span>
                          </div>
                        )}

                        <div className="absolute bottom-2 left-2">
                          <span className="px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-sm text-white text-[9px] font-medium flex items-center gap-1">
                            <Truck className="w-2.5 h-2.5 text-amber-300" />
                            ~20 Min
                          </span>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="space-y-1.5 flex-1">
                        <div className="flex items-center gap-1.5">
                          <FoodTypeBadge type={getProductFoodType(prod)} showLabel={true} size="sm" />
                          <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 truncate">
                            &bull; {prod.category?.name}
                          </span>
                        </div>

                        <h4 className="font-semibold text-xs sm:text-sm text-stone-900 line-clamp-2 leading-snug">
                          {prod.name}
                        </h4>

                        {/* Tag/Badge: Halal tag for meat, Daily Essentials at Wholesale Prices for groceries */}
                        {((prod.category?.department || "MEAT") === "MEAT") ? (
                          Boolean(prod.isHalal) && (
                            <div className="pt-0.5">
                              <HalalBadge size="sm" variant="outline" />
                            </div>
                          )
                        ) : (
                          <div className="pt-0.5">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-2xs">
                              <Sparkles className="w-2.5 h-2.5 text-emerald-600 flex-shrink-0" />
                              <span>{prod.badgeText || "Daily Essentials at Wholesale Prices"}</span>
                            </span>
                          </div>
                        )}

                        {/* Variants pill switcher if multi-variant */}
                        {prod.variants.length > 1 && (
                          <div className="flex flex-wrap gap-1 pt-1">
                            {prod.variants.map((v) => (
                              <button
                                key={v.id}
                                type="button"
                                onClick={() =>
                                  setSelectedVariants((prev) => ({
                                    ...prev,
                                    [prod.id]: v.id,
                                  }))
                                }
                                className={`px-2 py-0.5 rounded-lg text-[10px] font-semibold border transition ${
                                  activeVariant?.id === v.id
                                    ? "bg-rose-50 text-rose-800 border-rose-400 ring-1 ring-rose-300"
                                    : "bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100"
                                }`}
                              >
                                {v.name}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Pricing & Add Stepper */}
                      <div className="pt-3 border-t border-stone-100 mt-2 flex items-center justify-between gap-2">
                        <div>
                          <div className="flex items-baseline gap-1.5">
                            <span className="font-mono text-sm sm:text-base font-bold text-stone-900">
                              ₹{sellingRs}
                            </span>
                            {mrpRs > sellingRs && (
                              <span className="font-mono text-[10px] sm:text-xs text-stone-400 line-through">
                                ₹{mrpRs}
                              </span>
                            )}
                          </div>
                          <span className="text-[9px] text-stone-400 block font-mono">
                            {activeVariant?.name || "Standard"}
                          </span>
                        </div>

                        {/* Add / Stepper Button */}
                        <div>
                          {cartQty > 0 && cartItemId ? (
                            <div className="flex items-center gap-1 bg-rose-600 text-white rounded-xl px-2 py-1 shadow-sm">
                              <button
                                type="button"
                                onClick={() => updateQuantity(cartItemId, -1)}
                                className="p-1 hover:bg-rose-700 rounded-lg transition"
                                title="Decrease"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="font-bold font-mono text-xs px-1 min-w-[1.2rem] text-center">
                                {cartQty}
                              </span>
                              <button
                                type="button"
                                onClick={() => updateQuantity(cartItemId, 1)}
                                className="p-1 hover:bg-rose-700 rounded-lg transition"
                                title="Increase"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => activeVariant && handleAddToCart(prod, activeVariant)}
                              disabled={!activeVariant}
                              className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-white text-rose-600 border-2 border-rose-600 hover:bg-rose-600 hover:text-white transition-all shadow-sm flex items-center gap-1 disabled:opacity-40"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>ADD</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
