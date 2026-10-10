"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/ui/Logo";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { LocationModal } from "@/components/ui/LocationModal";
import {
  MapPin,
  ShoppingBag,
  User as UserIcon,
  ChevronDown,
  Menu as MenuIcon,
  X,
  Shield,
  Bike,
} from "lucide-react";

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const { user, selectedAddress, logout } = useAuth();
  const { itemCount } = useCart();
  const [isLocationOpen, setIsLocationOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // If we are in admin or delivery sub-surface, render their dedicated layouts
  if (pathname.startsWith("/admin") || pathname.startsWith("/delivery")) {
    return null;
  }

  const navLinks = [
    { label: "Home", href: "/" },
    { label: "Menu", href: "/menu" },
    { label: "Offers", href: "/offers" },
    { label: "Location", href: "/location" },
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" },
  ];

  return (
    <>
      {/* Top Banner: Service Area & Delivery Promise */}
      <div className="bg-charcoal-600 text-cream-100 text-xs py-1.5 px-4 text-center font-sans tracking-wide border-b border-charcoal-400">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-[11px] sm:text-xs">
          <span className="hidden sm:inline-flex items-center gap-1.5 text-amberGold-300">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Mulbagal Express Delivery &bull; Target ~20 Minutes
          </span>
          <span className="mx-auto sm:mx-0 flex items-center gap-1.5">
            First 3 km <strong>FREE Delivery</strong> &bull; No Minimum Order &bull; <span className="text-emerald-400 font-semibold">100% Halal</span>
          </span>
          <div className="hidden md:flex items-center gap-4 text-cream-300">
            <a href="tel:+919845012345" className="hover:text-amberGold-300 transition-colors">
              Call: +91 98450 12345
            </a>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <header className="sticky top-0 z-40 bg-cream-50/95 backdrop-blur-md border-b border-cream-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20 gap-4">
            {/* Logo */}
            <div className="flex-shrink-0">
              <Logo size="md" />
            </div>

            {/* Location Selector Pill */}
            <button
              onClick={() => setIsLocationOpen(true)}
              className="hidden md:flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-cream-100 hover:bg-cream-200/80 border border-cream-200 text-left transition-all max-w-[280px]"
            >
              <MapPin className="w-4 h-4 text-amberGold-600 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-[10px] uppercase font-semibold tracking-wider text-charcoal-50">
                  Delivering in Mulbagal
                </p>
                <p className="text-xs font-medium text-charcoal-600 truncate">
                  {selectedAddress
                    ? `${selectedAddress.locality || selectedAddress.addressLine}`
                    : "Select your delivery location"}
                </p>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-charcoal-400 flex-shrink-0" />
            </button>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-7">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`text-sm font-medium tracking-wide transition-colors ${
                      isActive
                        ? "text-amberGold-600 font-semibold"
                        : "text-charcoal-500 hover:text-charcoal-700"
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>

            {/* Right CTAs: Account & Cart */}
            <div className="flex items-center gap-3">
              {/* Account Dropdown */}
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-charcoal-600 hover:bg-cream-100 transition-colors"
                  >
                    <div className="w-7 h-7 rounded-full bg-cream-200 text-charcoal-600 flex items-center justify-center font-medium text-xs">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="hidden sm:inline text-xs font-medium max-w-[90px] truncate">
                      {user.name}
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 text-charcoal-400" />
                  </button>

                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-52 bg-cream-50 rounded-2xl shadow-card border border-cream-200 py-2 z-50 animate-in fade-in zoom-in-95">
                      <div className="px-4 py-2 border-b border-cream-200">
                        <p className="text-xs font-medium text-charcoal-700 truncate">{user.name}</p>
                        <p className="text-[11px] text-charcoal-400">{user.mobile}</p>
                      </div>

                      <Link
                        href="/account"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="block px-4 py-2 text-xs text-charcoal-600 hover:bg-cream-100 transition-colors"
                      >
                        My Account & Profile
                      </Link>
                      <Link
                        href="/account/orders"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="block px-4 py-2 text-xs text-charcoal-600 hover:bg-cream-100 transition-colors"
                      >
                        Order History
                      </Link>
                      <Link
                        href="/account/addresses"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="block px-4 py-2 text-xs text-charcoal-600 hover:bg-cream-100 transition-colors"
                      >
                        Saved Addresses
                      </Link>
                      <Link
                        href="/account/favorites"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="block px-4 py-2 text-xs text-charcoal-600 hover:bg-cream-100 transition-colors"
                      >
                        My Favorites
                      </Link>

                      {(user.role === "ADMIN" || user.role === "SUPER_ADMIN") && (
                        <Link
                          href="/admin"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="block px-4 py-2 text-xs font-semibold text-amberGold-600 bg-amberGold-50/50 hover:bg-amberGold-100/50 border-t border-cream-200 transition-colors"
                        >
                          Admin Dashboard
                        </Link>
                      )}

                      {user.role === "DELIVERY_AGENT" && (
                        <Link
                          href="/delivery"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="block px-4 py-2 text-xs font-semibold text-amberGold-600 bg-amberGold-50/50 hover:bg-amberGold-100/50 border-t border-cream-200 transition-colors"
                        >
                          Delivery Portal
                        </Link>
                      )}

                      <div className="border-t border-cream-200 pt-1">
                        <button
                          onClick={() => {
                            setIsUserMenuOpen(false);
                            logout();
                          }}
                          className="w-full text-left px-4 py-2 text-xs text-red-600 hover:bg-red-50 transition-colors"
                        >
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium text-charcoal-600 hover:bg-cream-100 border border-cream-200 transition-all"
                >
                  <UserIcon className="w-3.5 h-3.5" />
                  <span>Login</span>
                </Link>
              )}

              {/* Cart Button with Counter */}
              <Link
                href="/cart"
                className="relative inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-charcoal-500 hover:bg-charcoal-600 text-cream-50 text-xs font-medium transition-all shadow-subtle group"
              >
                <ShoppingBag className="w-4 h-4 text-amberGold-400 group-hover:scale-110 transition-transform" />
                <span className="hidden sm:inline">Cart</span>
                {itemCount > 0 && (
                  <span className="inline-flex items-center justify-center min-w-5 h-5 px-1.5 text-[11px] font-bold bg-amberGold-400 text-charcoal-700 rounded-full">
                    {itemCount}
                  </span>
                )}
              </Link>

              {/* Mobile Menu Trigger */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 rounded-xl text-charcoal-600 hover:bg-cream-100 lg:hidden"
              >
                {isMobileMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <MenuIcon className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Location Bar */}
          <div className="py-2.5 border-t border-cream-200 flex items-center justify-between md:hidden">
            <button
              onClick={() => setIsLocationOpen(true)}
              className="flex items-center gap-2 text-left"
            >
              <MapPin className="w-4 h-4 text-amberGold-600 flex-shrink-0" />
              <div className="min-w-0">
                <span className="text-[10px] uppercase font-semibold text-charcoal-400 block">
                  Delivery Area
                </span>
                <span className="text-xs font-medium text-charcoal-700 truncate block">
                  {selectedAddress
                    ? `${selectedAddress.locality || selectedAddress.addressLine}, Mulbagal`
                    : "Tap to select location in Mulbagal"}
                </span>
              </div>
            </button>
          </div>
        </div>

        {/* Mobile Slide-down Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-cream-200 bg-cream-50 px-4 pt-3 pb-6 space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`block px-3 py-2.5 rounded-xl text-sm font-medium ${
                  pathname === link.href
                    ? "bg-amberGold-50 text-amberGold-700 font-semibold"
                    : "text-charcoal-600 hover:bg-cream-100"
                }`}
              >
                {link.label}
              </Link>
            ))}

            <div className="pt-3 border-t border-cream-200 space-y-2">
              <a
                href="tel:+919845012345"
                className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-forest-800 bg-forest-50 border border-forest-200 rounded-xl"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Call Store: +91 98450 12345</span>
              </a>
              <a
                href="mailto:orders@freshchicken.com"
                className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-charcoal-700 bg-cream-100 border border-cream-200 rounded-xl"
              >
                <span>✉️ Email: orders@freshchicken.com</span>
              </a>
            </div>
          </div>
        )}
      </header>

      {/* Location Modal */}
      <LocationModal
        isOpen={isLocationOpen}
        onClose={() => setIsLocationOpen(false)}
      />
    </>
  );
};
