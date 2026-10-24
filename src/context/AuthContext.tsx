"use client";

import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from "react";

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
  deliveryProfile?: any;
}

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  isNetworkError: boolean;
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
  isNetworkError: false,
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
  const [isNetworkError, setIsNetworkError] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<UserAddress | null>(null);

  // In-flight dedup ref to prevent React StrictMode duplicate concurrent requests
  const inFlightPromiseRef = useRef<Promise<void> | null>(null);

  const refreshUser = useCallback(async () => {
    if (inFlightPromiseRef.current) {
      return inFlightPromiseRef.current;
    }

    const task = (async () => {
      try {
        const res = await fetch("/api/auth/me", {
          cache: "no-store",
          headers: {
            "Cache-Control": "no-cache",
            Pragma: "no-cache",
          },
        });

        if (res.ok) {
          const data = await res.json();
          setUser(data.user || null);
          setIsNetworkError(false);
          if (data.user?.addresses?.length) {
            const defaultAddr =
              data.user.addresses.find((a: UserAddress) => a.isDefault) || data.user.addresses[0];
            setSelectedAddress((prev) => prev || defaultAddr);
          }
        } else if (res.status === 401) {
          // Confirmed unauthenticated session
          setUser(null);
          setIsNetworkError(false);
        } else {
          // 5xx Server error: preserve current user session, mark network issue
          setIsNetworkError(true);
        }
      } catch (err) {
        // Network/connectivity interruption: preserve existing session, mark network issue
        console.warn("Session check network interruption:", err);
        setIsNetworkError(true);
      } finally {
        setLoading(false);
        inFlightPromiseRef.current = null;
      }
    })();

    inFlightPromiseRef.current = task;
    return task;
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

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
      setIsNetworkError(false);
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
      setIsNetworkError(false);
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
      setIsNetworkError(false);
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
      setIsNetworkError(false);
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
        isNetworkError,
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
