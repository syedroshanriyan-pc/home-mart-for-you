"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { HalalBadge } from "@/components/ui/HalalBadge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { Heart, Plus, Check, SlidersHorizontal, AlertCircle } from "lucide-react";

export interface ProductVariantData {
  id: string;
  name: string;
  pricingType: string;
  quantityValue: number;
  quantityUnit: string;
  priceMinor: number;
  isAvailable: boolean;
}

export interface CustomizationOptionData {
  id: string;
  name: string;
  priceDeltaMinor: number;
  isActive: boolean;
}

export interface CustomizationGroupData {
  id: string;
  name: string;
  selectionType: string;
  isRequired: boolean;
  options: CustomizationOptionData[];
}

export interface ProductData {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  productType: string;
  isAvailable: boolean;
  imageUrl?: string | null;
  category?: { name: string; slug: string };
  variants: ProductVariantData[];
  customizationGroups?: CustomizationGroupData[];
}

export const ProductCard: React.FC<{
  product: ProductData;
  isFavoriteInitial?: boolean;
}> = ({ product, isFavoriteInitial = false }) => {
  const { addItem } = useCart();
  const { user } = useAuth();
  const [isFavorite, setIsFavorite] = useState(isFavoriteInitial);
  const [isCustomizeOpen, setIsCustomizeOpen] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariantData>(
    product.variants[0] || null
  );

  // Selected customizations: map of groupId -> optionId
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    product.customizationGroups?.forEach((g) => {
      if (g.options.length > 0) {
        initial[g.id] = g.options[0].id;
      }
    });
    return initial;
  });

  const [addedAnimation, setAddedAnimation] = useState(false);

  const toggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) return;
    const nextState = !isFavorite;
    setIsFavorite(nextState);
    try {
      await fetch(`/api/me/favorites/${product.id}`, {
        method: nextState ? "POST" : "DELETE",
      });
    } catch {}
  };

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!product.isAvailable || !selectedVariant?.isAvailable) return;

    // If product has required customizations or multiple variants, open customization modal
    if (
      (product.customizationGroups && product.customizationGroups.length > 0) ||
      product.variants.length > 1
    ) {
      setIsCustomizeOpen(true);
      return;
    }

    // Direct add
    addItem({
      productId: product.id,
      variantId: selectedVariant.id,
      productName: product.name,
      variantName: selectedVariant.name,
      imageUrl: product.imageUrl || undefined,
      unitPriceMinor: selectedVariant.priceMinor,
      quantity: 1,
      weightGrams: selectedVariant.quantityValue,
      isQualifyingMeat:
        product.category?.slug === "fresh-chicken" ||
        product.category?.slug === "masala-special",
    });

    setAddedAnimation(true);
    setTimeout(() => setAddedAnimation(false), 1200);
  };

  const handleConfirmCustomize = () => {
    if (!selectedVariant) return;

    const chosenCustomizations: { group: string; option: string; optionId: string; priceDeltaMinor: number }[] = [];
    let deltaSum = 0;

    product.customizationGroups?.forEach((g) => {
      const optId = selectedOptions[g.id];
      const opt = g.options.find((o) => o.id === optId);
      if (opt) {
        chosenCustomizations.push({
          group: g.name,
          option: opt.name,
          optionId: opt.id,
          priceDeltaMinor: opt.priceDeltaMinor,
        });
        deltaSum += opt.priceDeltaMinor;
      }
    });

    addItem({
      productId: product.id,
      variantId: selectedVariant.id,
      productName: product.name,
      variantName: selectedVariant.name,
      imageUrl: product.imageUrl || undefined,
      unitPriceMinor: selectedVariant.priceMinor + deltaSum,
      quantity: 1,
      weightGrams: selectedVariant.quantityValue,
      isQualifyingMeat:
        product.category?.slug === "fresh-chicken" ||
        product.category?.slug === "masala-special",
      customizations: chosenCustomizations,
    });

    setIsCustomizeOpen(false);
    setAddedAnimation(true);
    setTimeout(() => setAddedAnimation(false), 1200);
  };

  const primaryPrice = selectedVariant?.priceMinor
    ? (selectedVariant.priceMinor / 100).toFixed(0)
    : "0";

  return (
    <>
      <div className="group relative flex flex-col bg-cream-50 rounded-2xl border border-cream-200 overflow-hidden hover:border-cream-300 hover:shadow-card transition-all duration-300">
        {/* Product Image & Badges */}
        <Link href={`/product/${product.slug}`} className="relative aspect-[4/3] w-full overflow-hidden bg-cream-100 block">
          {product.imageUrl ? (
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-charcoal-400 text-xs">
              No Image
            </div>
          )}

          {/* Availability & Halal Badges */}
          <div className="absolute top-3 left-3 z-10 flex flex-col gap-1 items-start">
            {product.isAvailable ? (
              <Badge variant="inStock" size="sm">
                In Stock
              </Badge>
            ) : (
              <Badge variant="outOfStock" size="sm">
                Out of Stock
              </Badge>
            )}
            {(product.category?.slug === "fresh-chicken" || product.category?.slug === "masala-special") && (
              <HalalBadge size="sm" />
            )}
          </div>

          {/* Favorite Button */}
          {user && (
            <button
              onClick={toggleFavorite}
              className={`absolute top-3 right-3 p-2 rounded-xl backdrop-blur-md transition-all ${
                isFavorite
                  ? "bg-red-50 text-red-600 shadow-sm"
                  : "bg-charcoal-700/30 text-cream-50 hover:bg-charcoal-700/50"
              }`}
              aria-label="Add to favorites"
            >
              <Heart className={`w-4 h-4 ${isFavorite ? "fill-current" : ""}`} />
            </button>
          )}

          {/* Category Pill */}
          {product.category && (
            <div className="absolute bottom-3 left-3">
              <span className="px-2.5 py-1 rounded-md text-[10px] font-medium bg-charcoal-700/70 text-cream-100 backdrop-blur-md">
                {product.category.name}
              </span>
            </div>
          )}
        </Link>

        {/* Content & Pricing */}
        <div className="p-4 sm:p-5 flex flex-col flex-1 justify-between">
          <div>
            <Link href={`/product/${product.slug}`}>
              <h3 className="font-serif text-base sm:text-lg font-medium text-charcoal-600 group-hover:text-amberGold-600 transition-colors line-clamp-1">
                {product.name}
              </h3>
            </Link>
            {product.description && (
              <p className="text-xs text-charcoal-500 mt-1 line-clamp-2 leading-relaxed">
                {product.description}
              </p>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-cream-200 flex items-center justify-between gap-2">
            <div>
              <span className="text-[10px] uppercase font-semibold text-charcoal-400 block tracking-wider">
                {selectedVariant?.name || "Today's Price"}
              </span>
              <div className="flex items-baseline gap-1">
                <span className="text-lg font-serif font-bold text-charcoal-700">
                  ₹{primaryPrice}
                </span>
                <span className="text-xs text-charcoal-400">
                  / {selectedVariant?.quantityUnit === "g" ? `${selectedVariant.quantityValue}g` : selectedVariant?.name}
                </span>
              </div>
            </div>

            {/* Add to Cart CTA */}
            {product.isAvailable ? (
              <Button
                variant={addedAnimation ? "secondary" : "primary"}
                size="sm"
                onClick={handleQuickAdd}
                className="min-w-[80px]"
              >
                {addedAnimation ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Added</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add</span>
                  </>
                )}
              </Button>
            ) : (
              <Button variant="secondary" size="sm" disabled className="min-w-[80px]">
                Sold Out
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Product Customization & Variant Modal */}
      <Modal
        isOpen={isCustomizeOpen}
        onClose={() => setIsCustomizeOpen(false)}
        title={`Customize: ${product.name}`}
        maxWidth="md"
      >
        <div className="space-y-5">
          {/* Variant Selector (if more than 1) */}
          {product.variants.length > 1 && (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal-500 mb-2">
                Select Portion / Variant
              </label>
              <div className="grid grid-cols-2 gap-2">
                {product.variants.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => setSelectedVariant(v)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      selectedVariant?.id === v.id
                        ? "border-amberGold-400 bg-amberGold-50 text-charcoal-700 ring-1 ring-amberGold-400"
                        : "border-cream-300 bg-cream-50 hover:bg-cream-100 text-charcoal-600"
                    }`}
                  >
                    <p className="text-xs font-semibold">{v.name}</p>
                    <p className="text-xs text-amberGold-600 font-bold mt-0.5">
                      ₹{(v.priceMinor / 100).toFixed(0)}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Customization Groups */}
          {product.customizationGroups?.map((group) => (
            <div key={group.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold uppercase tracking-wider text-charcoal-500">
                  {group.name}
                </label>
                {group.isRequired && (
                  <span className="text-[10px] text-amberGold-600 font-medium">Required</span>
                )}
              </div>
              <div className="space-y-1.5">
                {group.options.map((opt) => {
                  const isSelected = selectedOptions[group.id] === opt.id;
                  return (
                    <button
                      type="button"
                      key={opt.id}
                      onClick={() =>
                        setSelectedOptions((prev) => ({
                          ...prev,
                          [group.id]: opt.id,
                        }))
                      }
                      className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-left text-xs transition-all ${
                        isSelected
                          ? "border-amberGold-400 bg-amberGold-50/50 text-charcoal-700 font-medium ring-1 ring-amberGold-400/40"
                          : "border-cream-200 hover:border-cream-300 bg-cream-50 text-charcoal-600"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                            isSelected
                              ? "border-amberGold-500 bg-amberGold-500 text-cream-50"
                              : "border-cream-300"
                          }`}
                        >
                          {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-cream-50" />}
                        </div>
                        <span>{opt.name}</span>
                      </div>
                      {opt.priceDeltaMinor > 0 && (
                        <span className="text-amberGold-600 font-semibold">
                          +₹{(opt.priceDeltaMinor / 100).toFixed(0)}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Add to Cart Confirm Action */}
          <div className="pt-3 border-t border-cream-200">
            <Button
              variant="primary"
              size="lg"
              onClick={handleConfirmCustomize}
              className="w-full"
            >
              Add with Selected Preferences
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};
