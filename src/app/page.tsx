import React from "react";
import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/catalog/ProductCard";
import { Button } from "@/components/ui/Button";
import { HalalBadge } from "@/components/ui/HalalBadge";
import {
  Sparkles,
  Truck,
  ShieldCheck,
  Clock,
  ArrowRight,
  CheckCircle2,
  Tag,
  Star,
  MapPin,
  ChevronRight,
} from "lucide-react";

export const revalidate = 60; // Revalidate every minute for live daily pricing & stock

export default async function HomePage() {
  // 1. Fetch featured categories
  const categories = await prisma.category.findMany({
    where: { isActive: true },
    orderBy: { displayOrder: "asc" },
  });

  // 2. Fetch popular/featured products
  const products = await prisma.product.findMany({
    where: { isActive: true },
    orderBy: { displayOrder: "asc" },
    take: 6,
    include: {
      category: { select: { name: true, slug: true } },
      variants: { where: { isAvailable: true }, orderBy: { priceMinor: "asc" } },
      customizationGroups: {
        include: { options: { where: { isActive: true } } },
      },
    },
  });

  // 3. Fetch active coupons
  const coupons = await prisma.coupon.findMany({
    where: { isActive: true },
    take: 3,
    orderBy: { createdAt: "desc" },
  });

  // 4. Fetch recent customer reviews
  const reviews = await prisma.review.findMany({
    where: { status: "PUBLISHED" },
    take: 3,
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { name: true } },
      order: { select: { orderNumber: true } },
    },
  });

  return (
    <div className="space-y-16 sm:space-y-24 pb-16">
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden bg-charcoal-700 text-cream-50 pt-12 pb-20 sm:pt-20 sm:pb-28 border-b border-charcoal-500">
        {/* Subtle background glow */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-amberGold-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-copper-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-charcoal-600 border border-charcoal-400 text-amberGold-300 text-xs font-medium tracking-wide">
                <Sparkles className="w-3.5 h-3.5 text-amberGold-400" />
                <span>Mulbagal&apos;s Pure Fresh Meat Experience</span>
              </div>

              <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-normal tracking-tight text-cream-50 leading-[1.15]">
                Artisanal Tender Chicken,{" "}
                <span className="italic font-serif text-amberGold-300">
                  Delivered in ~20 Minutes.
                </span>
              </h1>

              <p className="text-sm sm:text-base text-cream-200/90 max-w-2xl leading-relaxed font-sans font-light">
                Never frozen, freshly portioned upon your order, and precision-cut to your exact curry or biryani style. Free doorstep delivery for your first 3 kilometers in Mulbagal.
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link href="/menu">
                  <Button
                    variant="primary"
                    size="lg"
                    className="font-bold shadow-xl shadow-rose-600/35 hover:scale-[1.02] active:scale-[0.98] transition-transform"
                  >
                    <span>Order Fresh Chicken Now</span>
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
                <Link href="/offers">
                  <Button
                    variant="secondary"
                    size="lg"
                    className="bg-white/10 backdrop-blur-md border-2 border-cream-200/60 text-white hover:bg-white/20 hover:text-white hover:border-white font-semibold shadow-sm"
                  >
                    View Today&apos;s Offers
                  </Button>
                </Link>
              </div>

              {/* Quick Trust Badges */}
              <div className="grid grid-cols-3 gap-3 pt-6 border-t border-charcoal-500 text-xs text-cream-200">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>100% Farm Fresh</span>
                </div>
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-amberGold-300 flex-shrink-0" />
                  <span>First 3km FREE</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>Custom Clean Cuts</span>
                </div>
              </div>
            </div>

            {/* Right Hero Image Card */}
            <div className="lg:col-span-5 relative">
              <div className="relative aspect-[4/3] rounded-3xl overflow-hidden shadow-float border border-charcoal-400 bg-charcoal-600">
                <Image
                  src="https://images.unsplash.com/photo-1587593810167-a84920ea0781?auto=format&fit=crop&w=800&q=85"
                  alt="Fresh Chicken Mulbagal tender chicken portions"
                  fill
                  priority
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal-700/80 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 p-4 rounded-2xl bg-charcoal-700/80 backdrop-blur-md border border-charcoal-400 text-cream-50 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] uppercase font-semibold text-amberGold-300 tracking-wider">
                      Daily Fresh Stock
                    </p>
                    <p className="text-sm font-serif font-medium">Whole & Curry Cuts Ready</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-cream-200">From</span>
                    <p className="text-base font-bold text-cream-50 font-serif">₹130 / 500g</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Offers & Promo Code Strip */}
      {coupons.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-amberGold-50 border border-amberGold-200 rounded-3xl p-6 sm:p-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <div className="inline-flex items-center gap-2 text-xs font-semibold text-amberGold-700 uppercase tracking-wider mb-1">
                  <Tag className="w-3.5 h-3.5" />
                  <span>Exclusive Mulbagal Discounts</span>
                </div>
                <h2 className="font-serif text-2xl font-medium text-charcoal-700">
                  Save More on Your Fresh Order Today
                </h2>
                <p className="text-xs text-charcoal-500 mt-1">
                  Enter coupon code at checkout to apply instant deduction.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {coupons.map((c) => (
                  <div
                    key={c.id}
                    className="flex items-center gap-3 bg-cream-50 px-4 py-2.5 rounded-xl border border-amberGold-300/80 shadow-subtle"
                  >
                    <div>
                      <p className="text-xs font-mono font-bold text-amberGold-700 tracking-wider">
                        {c.code}
                      </p>
                      <p className="text-[10px] text-charcoal-500">
                        {c.type === "FIXED" && `₹${c.value} OFF`}
                        {c.type === "PERCENTAGE" && `${c.value}% OFF`}
                        {c.type === "FREE_DELIVERY" && "Free Delivery"}
                        {c.type === "MIN_ORDER_FIXED" && `₹${c.value} OFF`}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 3. Browse by Category */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <span className="text-xs uppercase font-semibold text-amberGold-600 tracking-wider">
              Explore Catalog
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-medium text-charcoal-700 mt-1">
              Shop by Category
            </h2>
          </div>
          <Link
            href="/menu"
            className="text-xs font-semibold text-charcoal-600 hover:text-amberGold-600 flex items-center gap-1 transition-colors"
          >
            <span>View All</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/menu/${cat.slug}`}
              className="group relative aspect-[4/3] rounded-2xl overflow-hidden border border-cream-200 bg-cream-100 shadow-subtle hover:shadow-card transition-all"
            >
              {cat.imageUrl && (
                <Image
                  src={cat.imageUrl}
                  alt={cat.name}
                  fill
                  sizes="(max-width: 640px) 50vw, 25vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-charcoal-700/80 via-charcoal-700/20 to-transparent" />
              <div className="absolute bottom-3 left-3 right-3 text-cream-50">
                <h3 className="font-serif text-sm sm:text-base font-medium leading-tight">
                  {cat.name}
                </h3>
              </div>
            </Link>
          ))}

          {/* Mutton & Goat Cuts - Coming Soon Teaser Card */}
          <div className="group relative aspect-[4/3] rounded-2xl overflow-hidden border border-amberGold-400/50 bg-gradient-to-br from-charcoal-700 via-charcoal-800 to-amber-950 shadow-subtle p-3 flex flex-col justify-between">
            <div className="flex items-center justify-between z-10">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amberGold-500 text-charcoal-900 shadow-sm animate-pulse">
                COMING SOON
              </span>
              <HalalBadge size="sm" variant="solid" />
            </div>
            <div className="z-10">
              <span className="text-[10px] uppercase font-mono text-amberGold-300 font-bold tracking-wider block">
                Future Expansion
              </span>
              <h3 className="font-serif text-sm sm:text-base font-bold text-cream-50 leading-tight">
                Fresh Mutton & Goat Cuts
              </h3>
              <p className="text-[11px] text-cream-200/80 mt-0.5">
                Curry cut, chops & biryani cuts arriving soon in Mulbagal.
              </p>
            </div>
            <div className="absolute inset-0 bg-charcoal-800/40 backdrop-blur-[1px]" />
          </div>
        </div>

        {/* 100% Halal Guarantee & Mutton Announcement Banner */}
        <div className="mt-6 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-forest-900 via-forest-800 to-charcoal-700 text-cream-50 shadow-subtle flex flex-col md:flex-row md:items-center justify-between gap-4 border border-forest-700">
          <div className="flex items-center gap-3">
            <HalalBadge size="lg" variant="solid" className="flex-shrink-0" />
            <div>
              <h4 className="font-serif font-bold text-sm sm:text-base text-cream-50">
                100% Halal Certified Slaughter & Hand-Prepared Meats
              </h4>
              <p className="text-xs text-cream-200/90 mt-0.5">
                All poultry and meats are prepared daily according to authentic Islamic dietary requirements with zero preservatives.
              </p>
            </div>
          </div>
          <div className="inline-flex items-center gap-2 self-start md:self-center px-3.5 py-1.5 rounded-xl bg-amberGold-500/20 border border-amberGold-400 text-amberGold-300 text-xs font-semibold">
            <span className="h-2 w-2 rounded-full bg-amberGold-400 animate-ping" />
            <span>🐐 Fresh Mutton & Goat Cuts — Coming Soon to Mulbagal!</span>
          </div>
        </div>
      </section>

      {/* 4. Popular Fresh Chicken Cuts */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <span className="text-xs uppercase font-semibold text-amberGold-600 tracking-wider">
              Daily Favorites
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-medium text-charcoal-700 mt-1">
              Today&apos;s Specials & Cuts
            </h2>
          </div>
          <Link
            href="/menu"
            className="text-xs font-semibold text-charcoal-600 hover:text-amberGold-600 flex items-center gap-1 transition-colors"
          >
            <span>See Full Menu</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((prod) => (
            <ProductCard key={prod.id} product={prod as any} />
          ))}
        </div>
      </section>

      {/* 5. How Ordering Works */}
      <section className="bg-cream-100/70 border-y border-cream-200 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs uppercase font-semibold text-amberGold-600 tracking-wider">
              Hassle-Free Process
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-medium text-charcoal-700 mt-1">
              How Fresh Chicken Delivery Works
            </h2>
            <p className="text-xs text-charcoal-500 mt-2">
              From our clean prep kitchen in Mulbagal straight to your doorstep in 3 easy steps.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-cream-50 p-6 rounded-2xl border border-cream-200 shadow-subtle space-y-3">
              <div className="w-10 h-10 rounded-xl bg-charcoal-500 text-cream-50 flex items-center justify-center font-serif font-bold text-sm">
                1
              </div>
              <h3 className="font-serif text-base font-semibold text-charcoal-700">
                Choose Cuts & Customization
              </h3>
              <p className="text-xs text-charcoal-500 leading-relaxed">
                Select your preferred portions (no minimum order limit), then customize cutting (curry cut, small biryani pieces) and cleaning (skinless, washed).
              </p>
            </div>

            <div className="bg-cream-50 p-6 rounded-2xl border border-cream-200 shadow-subtle space-y-3">
              <div className="w-10 h-10 rounded-xl bg-charcoal-500 text-cream-50 flex items-center justify-center font-serif font-bold text-sm">
                2
              </div>
              <h3 className="font-serif text-base font-semibold text-charcoal-700">
                Confirm GPS Location
              </h3>
              <p className="text-xs text-charcoal-500 leading-relaxed">
                One-tap &quot;Use Current Location&quot; automatically calculates your route. First 3 km is 100% free delivery.
              </p>
            </div>

            <div className="bg-cream-50 p-6 rounded-2xl border border-cream-200 shadow-subtle space-y-3">
              <div className="w-10 h-10 rounded-xl bg-charcoal-500 text-cream-50 flex items-center justify-center font-serif font-bold text-sm">
                3
              </div>
              <h3 className="font-serif text-base font-semibold text-charcoal-700">
                ~20 Minute Delivery & COD
              </h3>
              <p className="text-xs text-charcoal-500 leading-relaxed">
                Our local delivery partner delivers your order fresh. Pay via cash (+₹7 fee) or instant UPI upon arrival.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Why Choose Fresh Chicken */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div>
              <span className="text-xs uppercase font-semibold text-amberGold-600 tracking-wider">
                Uncompromising Quality
              </span>
              <h2 className="font-serif text-2xl sm:text-4xl font-medium text-charcoal-700 mt-1 leading-tight">
                Why Families in Mulbagal Trust Our Fresh Chicken
              </h2>
            </div>

            <p className="text-xs sm:text-sm text-charcoal-500 leading-relaxed">
              Unlike generic supermarket meat that sits in chillers for days, our birds are sourced directly from verified local biosecure farms and dressed daily in sterile clean-cut stations.
            </p>

            <div className="space-y-4">
              <div className="flex items-start gap-3.5">
                <div className="p-2 rounded-xl bg-cream-100 text-emerald-700 mt-0.5">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-charcoal-700">Zero Antibiotic & Hormone Misuse</h4>
                  <p className="text-xs text-charcoal-500 mt-0.5">Only naturally fed poultry raised under strict animal welfare standards.</p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="p-2 rounded-xl bg-cream-100 text-emerald-700 mt-0.5">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-charcoal-700">Daily Market Transparent Pricing</h4>
                  <p className="text-xs text-charcoal-500 mt-0.5">We update prices transparently every morning based on live local markets.</p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="p-2 rounded-xl bg-cream-100 text-emerald-700 mt-0.5">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-charcoal-700">Hygienic Temperature-Controlled Pack</h4>
                  <p className="text-xs text-charcoal-500 mt-0.5">Double-sealed food-grade insulated packs ensure freshness until cooking.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="relative aspect-square sm:aspect-[4/3] rounded-3xl overflow-hidden shadow-card border border-cream-200">
            <Image
              src="https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?auto=format&fit=crop&w=800&q=80"
              alt="Hygienic cutting station at Fresh Chicken Mulbagal"
              fill
              className="object-cover"
            />
          </div>
        </div>
      </section>

      {/* 7. Real Customer Reviews */}
      {reviews.length > 0 && (
        <section className="bg-cream-100/60 border-t border-cream-200 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between mb-8">
              <div>
                <span className="text-xs uppercase font-semibold text-amberGold-600 tracking-wider">
                  Verified Feedback
                </span>
                <h2 className="font-serif text-2xl sm:text-3xl font-medium text-charcoal-700 mt-1">
                  What Our Customers Say
                </h2>
              </div>
              <span className="text-xs text-charcoal-500">Only verified buyers</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {reviews.map((r) => (
                <div
                  key={r.id}
                  className="bg-cream-50 p-5 rounded-2xl border border-cream-200 shadow-subtle flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center gap-1 text-amberGold-500">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3.5 h-3.5 ${
                            i < r.rating ? "fill-current" : "text-cream-300"
                          }`}
                        />
                      ))}
                    </div>
                    {r.comment && (
                      <p className="text-xs text-charcoal-600 italic leading-relaxed">
                        &ldquo;{r.comment}&rdquo;
                      </p>
                    )}
                  </div>
                  <div className="pt-4 mt-4 border-t border-cream-200 flex items-center justify-between text-[11px] text-charcoal-400">
                    <span className="font-semibold text-charcoal-700">{r.user.name}</span>
                    <span>Order #{r.order.orderNumber}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 8. Factual FAQ Section (AEO) */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="text-center space-y-1">
          <span className="text-xs uppercase font-semibold text-amberGold-600 tracking-wider">
            Clear Answers
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl font-medium text-charcoal-700">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-3 pt-4">
          <div className="bg-cream-50 p-4 sm:p-5 rounded-xl border border-cream-200 shadow-subtle">
            <h3 className="font-serif text-sm font-semibold text-charcoal-700">
              Where does Fresh Chicken deliver?
            </h3>
            <p className="text-xs text-charcoal-500 mt-1 leading-relaxed">
              We exclusively deliver across Mulbagal city and adjoining residential localities. The first 3 km from our Clock Tower bazaar shop is completely free.
            </p>
          </div>

          <div className="bg-cream-50 p-4 sm:p-5 rounded-xl border border-cream-200 shadow-subtle">
            <h3 className="font-serif text-sm font-semibold text-charcoal-700">
              Is there a minimum order requirement?
            </h3>
            <p className="text-xs text-charcoal-500 mt-1 leading-relaxed">
              No! There is no minimum order quantity. You can order any portion size—from a single 500g cut, fresh fish, farm eggs, or beverages for express doorstep delivery.
            </p>
          </div>

          <div className="bg-cream-50 p-4 sm:p-5 rounded-xl border border-cream-200 shadow-subtle">
            <h3 className="font-serif text-sm font-semibold text-charcoal-700">
              How is the delivery charge calculated?
            </h3>
            <p className="text-xs text-charcoal-500 mt-1 leading-relaxed">
              The first 3 km (3000 metres) is 100% free. Any distance beyond 3 km is charged at ₹1.50 per 100 metres (e.g. 4 km distance adds only ₹15).
            </p>
          </div>

          <div className="bg-cream-50 p-4 sm:p-5 rounded-xl border border-cream-200 shadow-subtle">
            <h3 className="font-serif text-sm font-semibold text-charcoal-700">
              Is Cash on Delivery (COD) available?
            </h3>
            <p className="text-xs text-charcoal-500 mt-1 leading-relaxed">
              Yes, Cash on Delivery is available across Mulbagal with a ₹7 nominal handling fee. Online UPI payments have zero surcharge.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
