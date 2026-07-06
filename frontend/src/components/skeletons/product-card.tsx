export function ProductCardSkeleton() {
  return (
    <div className="animate-pulse border border-[#E5E0DB] dark:border-[#333] rounded-2xl overflow-hidden">
      <div className="aspect-[3/4] bg-[#F5F0EB] dark:bg-[#242424]" />
      <div className="p-4 space-y-3">
        <div className="h-3 bg-[#F5F0EB] dark:bg-[#242424] rounded w-3/4" />
        <div className="h-4 bg-[#F5F0EB] dark:bg-[#242424] rounded w-1/2" />
        <div className="flex gap-1">
          <div className="h-6 w-6 rounded-full bg-[#F5F0EB] dark:bg-[#242424]" />
          <div className="h-6 w-6 rounded-full bg-[#F5F0EB] dark:bg-[#242424]" />
          <div className="h-6 w-6 rounded-full bg-[#F5F0EB] dark:bg-[#242424]" />
        </div>
      </div>
    </div>
  )
}
