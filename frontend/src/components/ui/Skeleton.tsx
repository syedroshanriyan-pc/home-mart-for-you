import React from "react";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

/**
 * Base Skeleton component with radiant shimmer effect
 */
export function Skeleton({ className = "", ...props }: SkeletonProps) {
  return (
    <div
      className={`animate-shimmer rounded-lg bg-stone-200/75 dark:bg-stone-800/60 ${className}`}
      {...props}
    />
  );
}

/**
 * Skeleton loader matching ProductCard layout
 */
export function ProductCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm flex flex-col h-full">
      {/* Image Skeleton */}
      <div className="relative aspect-[4/3] w-full">
        <Skeleton className="w-full h-full rounded-none" />
      </div>

      <div className="p-4 flex flex-col flex-1 justify-between gap-3">
        <div>
          {/* Halal Badge placeholder */}
          <div className="flex items-center gap-2 mb-2">
            <Skeleton className="h-5 w-16 rounded-full" />
            <Skeleton className="h-5 w-20 rounded-full" />
          </div>

          {/* Title */}
          <Skeleton className="h-5 w-3/4 mb-1.5" />
          <Skeleton className="h-3.5 w-full mb-1" />
          <Skeleton className="h-3.5 w-2/3" />
        </div>

        {/* Pricing & Add to Cart button */}
        <div className="pt-2 border-t border-stone-100 flex items-center justify-between">
          <div>
            <Skeleton className="h-6 w-20 mb-1" />
            <Skeleton className="h-3.5 w-14" />
          </div>
          <Skeleton className="h-9 w-24 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

/**
 * Skeleton loader for detailed order status / SLA card
 */
export function OrderDetailSkeleton() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-6 w-28 rounded-full" />
      </div>

      {/* 20-min SLA timer skeleton */}
      <div className="p-6 rounded-2xl bg-white border border-stone-200 space-y-4">
        <div className="flex justify-between items-center">
          <Skeleton className="h-6 w-44" />
          <Skeleton className="h-10 w-24 rounded-xl" />
        </div>
        <Skeleton className="h-3 w-full rounded-full" />
        <Skeleton className="h-4 w-3/5" />
      </div>

      {/* Items list skeleton */}
      <div className="p-6 rounded-2xl bg-white border border-stone-200 space-y-4">
        <Skeleton className="h-6 w-36 mb-4" />
        <div className="space-y-3">
          <div className="flex items-center gap-4">
            <Skeleton className="w-16 h-16 rounded-xl flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-5 w-2/3" />
              <Skeleton className="h-4 w-1/3" />
            </div>
            <Skeleton className="h-5 w-16" />
          </div>
          <div className="flex items-center gap-4">
            <Skeleton className="w-16 h-16 rounded-xl flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-5 w-1/2" />
              <Skeleton className="h-4 w-1/4" />
            </div>
            <Skeleton className="h-5 w-16" />
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Skeleton loader for interactive modals when loading async geo or item data
 */
export function ModalSkeleton({ title = "Loading content..." }: { title?: string }) {
  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-stone-100">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-6 w-6 rounded-full" />
      </div>
      <p className="text-xs text-stone-400">{title}</p>
      <div className="space-y-3 pt-2">
        <Skeleton className="h-12 w-full rounded-xl" />
        <Skeleton className="h-12 w-full rounded-xl" />
        <Skeleton className="h-12 w-full rounded-xl" />
      </div>
      <div className="flex justify-end gap-3 pt-4">
        <Skeleton className="h-10 w-24 rounded-xl" />
        <Skeleton className="h-10 w-32 rounded-xl" />
      </div>
    </div>
  );
}
