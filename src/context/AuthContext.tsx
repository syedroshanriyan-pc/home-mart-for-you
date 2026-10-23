"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export interface UserAddress {
  id: string;
  label: string;
  addressLine: string;
  locality: string;
  city: string;
  postalCode?: string | null;
  latitude: number;
  longitude: number;
  isDefault: boolean;
}

export interface UserProfile {
  id: string;
  name: string;
  mobile: string;
  email: string | null;
  role: "CUSTOMER" | "ADMIN" | "SUPER_ADMIN" | "DELIVERY_AGENT" | "ORDER_MANAGER";
  addresses?: UserAddress[];
}

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  selectedAddress: UserAddress | null;
  setSelectedAddress: (addr: UserAddress | null) => void;
  login: (identifier: string, pass: string) => Promise<{ success: boolean; user?: UserProfile; error?: string }>;
  register: (data: any) => Promise<{ success: boolean; user?: UserProfile; error?: string }>;
  logout: () => Promise<void>;
  deleteAccount: () => Promise<{ success: boolean; error?: string }>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  selectedAddress: null,
  setSelectedAddress: () => {},
  login: async () => ({ success: false }),
  register: async () => ({ success: false }),
  logout: async () => {},
  deleteAccount: async () => ({ success: false }),
  refreshUser: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedAddress, setSelectedAddress] = useState<UserAddress | null>(null);

  const refreshUser = async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        setUser(data.user || null);
        if (data.user?.addresses?.length) {
          const defaultAddr = data.user.addresses.find((a: UserAddress) => a.isDefault) || data.user.addresses[0];
          setSelectedAddress((prev) => prev || defaultAddr);
        }
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (identifier: string, pass: string) => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password: pass }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || "Login failed" };
      }
      setUser(data.user);
      if (data.user?.addresses?.length) {
        setSelectedAddress(data.user.addresses[0]);
      }
      return { success: true, user: data.user };
    } catch {
      return { success: false, error: "Network error during login" };
    }
  };

  const register = async (regData: any) => {
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(regData),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || "Registration failed" };
      }
      setUser(data.user);
      if (data.user?.addresses?.length) {
        setSelectedAddress(data.user.addresses[0]);
      }
      return { success: true, user: data.user };
    } catch {
      return { success: false, error: "Network error during registration" };
    }
  };

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      setUser(null);
      setSelectedAddress(null);
    }
  };

  const deleteAccount = async () => {
    try {
      const res = await fetch("/api/auth/delete-account", {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || "Failed to delete account" };
      }
      setUser(null);
      setSelectedAddress(null);
      if (typeof window !== "undefined") {
        try {
          localStorage.removeItem("fresh-chicken-cart-v1");
          localStorage.removeItem("fc_user_session");
        } catch {}
      }
      return { success: true };
    } catch {
      return { success: false, error: "Network error during account deletion." };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        selectedAddress,
        setSelectedAddress,
        login,
        register,
        logout,
        deleteAccount,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
