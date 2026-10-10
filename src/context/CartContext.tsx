"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";

export interface CartCustomization {
  group: string;
  option: string;
  optionId?: string;
  priceDeltaMinor?: number;
}

export interface CartItem {
  id: string; // Unique key: variantId + customizations
  productId: string;
  variantId: string;
  productName: string;
  variantName: string;
  imageUrl?: string;
  unitPriceMinor: number;
  quantity: number;
  weightGrams?: number | null;
  isQualifyingMeat?: boolean;
  customizations?: CartCustomization[];
}

export interface ValidationSummary {
  isValid: boolean;
  subtotalMinor: number;
  discountMinor: number;
  deliveryDistanceMeters: number;
  deliveryFeeMinor: number;
  codFeeMinor: number;
  totalMinor: number;
  qualifyingMeatGrams: number;
  isMinMeatMet: boolean;
  meatShortfallGrams: number;
  coupon: any;
  errors: string[];
}

interface CartContextType {
  items: CartItem[];
  itemCount: number;
  couponCode: string;
  paymentMethod: string;
  setPaymentMethod: (m: string) => void;
  validation: ValidationSummary | null;
  isValidating: boolean;
  addItem: (item: Omit<CartItem, "id">) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, delta: number) => void;
  clearCart: () => void;
  applyCoupon: (code: string) => Promise<boolean>;
  removeCoupon: () => void;
  revalidate: () => Promise<void>;
}

const CartContext = createContext<CartContextType>({
  items: [],
  itemCount: 0,
  couponCode: "",
  paymentMethod: "COD",
  setPaymentMethod: () => {},
  validation: null,
  isValidating: false,
  addItem: () => {},
  removeItem: () => {},
  updateQuantity: () => {},
  clearCart: () => {},
  applyCoupon: async () => false,
  removeCoupon: () => {},
  revalidate: async () => {},
});

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { selectedAddress } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [couponCode, setCouponCode] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<string>("COD");
  const [validation, setValidation] = useState<ValidationSummary | null>(null);
  const [isValidating, setIsValidating] = useState<boolean>(false);

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("fc_cart_v1");
      if (saved) {
        setItems(JSON.parse(saved));
      }
    } catch {}
  }, []);

  // Save cart to localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem("fc_cart_v1", JSON.stringify(items));
    } catch {}
  }, [items]);

  const generateItemId = (variantId: string, customizations?: CartCustomization[]) => {
    if (!customizations || customizations.length === 0) return variantId;
    const sorted = [...customizations].sort((a, b) => a.option.localeCompare(b.option));
    return `${variantId}_${sorted.map((c) => c.option).join("_")}`;
  };

  const addItem = (itemInput: Omit<CartItem, "id">) => {
    const id = generateItemId(itemInput.variantId, itemInput.customizations);
    setItems((prev) => {
      const existing = prev.find((i) => i.id === id);
      if (existing) {
        return prev.map((i) =>
          i.id === id ? { ...i, quantity: i.quantity + itemInput.quantity } : i
        );
      }
      return [...prev, { ...itemInput, id }];
    });
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const updateQuantity = (id: string, delta: number) => {
    setItems((prev) =>
      prev
        .map((i) => {
          if (i.id === id) {
            const newQty = i.quantity + delta;
            return newQty > 0 ? { ...i, quantity: newQty } : null;
          }
          return i;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const clearCart = () => {
    setItems([]);
    setCouponCode("");
    setValidation(null);
  };

  const applyCoupon = async (code: string): Promise<boolean> => {
    setCouponCode(code.trim().toUpperCase());
    return true;
  };

  const removeCoupon = () => {
    setCouponCode("");
  };

  // Trigger server-side cart revalidation whenever items, address, coupon, or payment method change
  const revalidate = async () => {
    if (items.length === 0) {
      setValidation(null);
      return;
    }

    setIsValidating(true);
    try {
      const payload = {
        items: items.map((i) => ({
          productId: i.productId,
          variantId: i.variantId,
          quantity: i.quantity,
          customizations: i.customizations,
        })),
        addressId: selectedAddress?.id,
        coordinates: selectedAddress
          ? { lat: selectedAddress.latitude, lng: selectedAddress.longitude }
          : undefined,
        couponCode,
        paymentMethod,
      };

      const res = await fetch("/api/cart/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const data = await res.json();
        setValidation(data);
      }
    } catch (err) {
      console.error("Cart validation error:", err);
    } finally {
      setIsValidating(false);
    }
  };

  useEffect(() => {
    revalidate();
  }, [items, selectedAddress, couponCode, paymentMethod]);

  const itemCount = items.reduce((acc, i) => acc + i.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        itemCount,
        couponCode,
        paymentMethod,
        setPaymentMethod,
        validation,
        isValidating,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        applyCoupon,
        removeCoupon,
        revalidate,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
