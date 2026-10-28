import { ProductCardSkeleton, Skeleton } from "@/components/ui/Skeleton";

export default function MenuLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Header Skeleton */}
      <div className="mb-8 space-y-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-4 w-96 max-w-full" />
      </div>

      {/* Category Pills Skeleton */}
      <div className="flex gap-2 overflow-x-auto pb-4 mb-8">
        <Skeleton className="h-10 w-24 rounded-full flex-shrink-0" />
        <Skeleton className="h-10 w-32 rounded-full flex-shrink-0" />
        <Skeleton className="h-10 w-36 rounded-full flex-shrink-0" />
        <Skeleton className="h-10 w-28 rounded-full flex-shrink-0" />
        <Skeleton className="h-10 w-36 rounded-full flex-shrink-0" />
      </div>

      {/* Product Cards Shimmer Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
