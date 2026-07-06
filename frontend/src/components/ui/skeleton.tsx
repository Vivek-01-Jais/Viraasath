export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse bg-[#E5E0DB]/50 dark:bg-[#333]/50 rounded-md ${className}`} />
}

export function ProductCardSkeleton() {
  return (
    <div className="block">
      <div className="relative aspect-[3/4] bg-[#F5F0EB] dark:bg-[#242424] overflow-hidden rounded-xl mb-4">
        <Skeleton className="absolute inset-0 rounded-none" />
      </div>
      <div className="px-0.5 space-y-2">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-20" />
        <div className="flex gap-1.5 mt-2">
          <Skeleton className="h-5 w-8 rounded-md" />
          <Skeleton className="h-5 w-8 rounded-md" />
          <Skeleton className="h-5 w-8 rounded-md" />
        </div>
      </div>
    </div>
  )
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-8">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  )
}

export function PageSkeleton() {
  return (
    <div className="flex flex-col flex-1 p-6 max-w-4xl mx-auto w-full">
      <Skeleton className="h-6 w-32 mb-4" />
      <Skeleton className="h-10 w-64 mb-2" />
      <Skeleton className="h-4 w-24 mb-4" />
      <div className="space-y-4 mt-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
    </div>
  )
}
