import { ProductCardSkeleton, Skeleton } from "@/components/ui/Skeleton";

export default function GlobalLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Hero Skeleton */}
      <div className="rounded-3xl bg-stone-100 p-8 sm:p-12 space-y-6">
        <Skeleton className="h-6 w-48 rounded-full" />
        <Skeleton className="h-12 w-3/4 max-w-xl" />
        <Skeleton className="h-5 w-1/2 max-w-md" />
        <div className="flex gap-4 pt-2">
          <Skeleton className="h-12 w-40 rounded-xl" />
          <Skeleton className="h-12 w-36 rounded-xl" />
        </div>
      </div>

      {/* Featured Cuts Grid Skeleton */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-5 w-24" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
