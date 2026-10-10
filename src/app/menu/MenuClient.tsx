"use client";

import React, { useState, useMemo } from "react";
import { ProductCard, ProductData } from "@/components/catalog/ProductCard";
import { HalalBadge } from "@/components/ui/HalalBadge";
import { Search, SlidersHorizontal, PackageOpen } from "lucide-react";

interface MenuClientProps {
  initialCategories: { id: string; name: string; slug: string }[];
  initialProducts: ProductData[];
  defaultCategorySlug?: string;
}

export const MenuClient: React.FC<MenuClientProps> = ({
  initialCategories,
  initialProducts,
  defaultCategorySlug = "ALL",
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>(defaultCategorySlug);
  const [searchQuery, setSearchQuery] = useState("");
  const [inStockOnly, setInStockOnly] = useState(false);

  const filteredProducts = useMemo(() => {
    return initialProducts.filter((product) => {
      // Category filter
      if (selectedCategory !== "ALL" && product.category?.slug !== selectedCategory) {
        return false;
      }

      // Stock filter
      if (inStockOnly && !product.isAvailable) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const nameMatch = product.name.toLowerCase().includes(query);
        const descMatch = product.description?.toLowerCase().includes(query);
        if (!nameMatch && !descMatch) return false;
      }

      return true;
    });
  }, [initialProducts, selectedCategory, searchQuery, inStockOnly]);

  return (
    <div className="space-y-8">
      {/* Category Pills & Search Controls */}
      <div className="space-y-4">
        {/* Category Pills */}
        <div className="flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => setSelectedCategory("ALL")}
            className={`px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              selectedCategory === "ALL"
                ? "bg-gradient-to-r from-rose-600 to-rose-700 text-white shadow-md shadow-rose-600/25 border-2 border-rose-600"
                : "bg-white text-stone-700 hover:bg-stone-50 border-2 border-stone-200 shadow-sm"
            }`}
          >
            All Cuts & Items
          </button>
          {initialCategories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.slug)}
              className={`px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat.slug
                  ? "bg-gradient-to-r from-rose-600 to-rose-700 text-white shadow-md shadow-rose-600/25 border-2 border-rose-600"
                  : "bg-white text-stone-700 hover:bg-stone-50 border-2 border-stone-200 shadow-sm"
              }`}
            >
              {cat.name}
            </button>
          ))}
          <button
            onClick={() => setSelectedCategory("mutton-coming-soon")}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              selectedCategory === "mutton-coming-soon"
                ? "bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-md shadow-amber-500/30 border-2 border-amber-500"
                : "bg-amber-50 text-amber-900 border-2 border-amber-300 hover:bg-amber-100 shadow-sm"
            }`}
          >
            <span>🐐 Fresh Mutton</span>
            <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-amber-200 text-amber-950 font-extrabold uppercase">
              Soon
            </span>
          </button>
        </div>

        {/* Search Bar & In-Stock Toggle */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <div className="relative w-full sm:max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-charcoal-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search chicken cuts, wings, breast, eggs, drinks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-cream-50 border border-cream-200 rounded-xl text-xs text-charcoal-700 placeholder-charcoal-400 focus:outline-none focus:ring-2 focus:ring-amberGold-400 focus:border-transparent transition-all"
            />
          </div>

          <label className="flex items-center gap-2 cursor-pointer text-xs text-charcoal-600 self-end sm:self-center">
            <input
              type="checkbox"
              checked={inStockOnly}
              onChange={(e) => setInStockOnly(e.target.checked)}
              className="rounded border-cream-300 text-amberGold-600 focus:ring-amberGold-400 h-4 w-4"
            />
            <span>Show In Stock Only</span>
          </label>
        </div>
      </div>

      {/* Product Grid or Mutton Coming Soon Card */}
      {selectedCategory === "mutton-coming-soon" ? (
        <div className="bg-gradient-to-br from-charcoal-700 via-charcoal-800 to-amber-950 text-cream-50 rounded-3xl p-8 sm:p-12 text-center max-w-2xl mx-auto space-y-4 shadow-card border border-amberGold-400/40">
          <div className="flex items-center justify-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-amberGold-500 text-charcoal-900 shadow-sm animate-pulse">
              COMING SOON TO MULBAGAL
            </span>
            <HalalBadge size="md" variant="solid" />
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-cream-50">
            Fresh Mutton & Goat Cuts
          </h2>
          <p className="text-xs sm:text-sm text-cream-200/90 max-w-lg mx-auto leading-relaxed">
            We are preparing our expansion into daily fresh, tender, hand-slaughtered 100% Halal goat mutton. Available soon with custom curry cuts, biryani pieces, and minced keema.
          </p>
          <div className="pt-2 flex flex-wrap justify-center gap-3">
            <button
              onClick={() => setSelectedCategory("fresh-chicken")}
              className="px-5 py-2.5 bg-amberGold-500 hover:bg-amberGold-600 text-charcoal-900 text-xs font-bold rounded-xl transition shadow-subtle"
            >
              Browse Fresh Chicken Instead
            </button>
            <button
              onClick={() => setSelectedCategory("fish-seafood")}
              className="px-5 py-2.5 bg-cream-50/10 hover:bg-cream-50/20 text-cream-100 text-xs font-semibold rounded-xl border border-cream-200/20 transition"
            >
              Browse Fresh Fish
            </button>
          </div>
        </div>
      ) : filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((prod) => (
            <ProductCard key={prod.id} product={prod} />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="bg-cream-50 rounded-2xl border border-cream-200 p-12 text-center max-w-md mx-auto space-y-3">
          <div className="w-12 h-12 rounded-full bg-cream-200 text-charcoal-500 flex items-center justify-center mx-auto">
            <PackageOpen className="w-6 h-6" />
          </div>
          <h3 className="font-serif text-lg font-medium text-charcoal-700">
            No products found
          </h3>
          <p className="text-xs text-charcoal-500">
            We couldn&apos;t find any items matching your search or filters. Try adjusting your filters or search keywords.
          </p>
          <button
            onClick={() => {
              setSelectedCategory("ALL");
              setSearchQuery("");
              setInStockOnly(false);
            }}
            className="text-xs font-semibold text-amberGold-600 hover:underline pt-2 inline-block"
          >
            Reset All Filters
          </button>
        </div>
      )}
    </div>
  );
};
