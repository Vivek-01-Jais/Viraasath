"use client"

import { useCallback } from "react"
import { useSearchParams, usePathname, useRouter } from "next/navigation"
import { X } from "lucide-react"
import { useAllSizes } from "@/lib/queries/use-products"

const PRICE_RANGES = [
  { label: "Under ₹1,000", min: 0, max: 1000 },
  { label: "₹1,000 - ₹2,500", min: 1000, max: 2500 },
  { label: "₹2,500 - ₹5,000", min: 2500, max: 5000 },
  { label: "Above ₹5,000", min: 5000, max: 999999 },
]

export function ProductFilters() {
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const router = useRouter()

  const selectedSizes = searchParams.getAll("size")
  const priceRange = searchParams.get("priceRange")
  const activePriceRange = priceRange ? PRICE_RANGES[Number(priceRange)] : null
  const { data: allSizes = [] } = useAllSizes()

  const buildHref = useCallback((updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString())
    for (const [key, value] of Object.entries(updates)) {
      if (value === null) {
        params.delete(key)
      } else {
        params.set(key, value)
      }
    }
    params.delete("page")
    const qs = params.toString()
    return `${pathname}${qs ? `?${qs}` : ""}`
  }, [searchParams, pathname])

  function toggleSize(size: string) {
    const params = new URLSearchParams(searchParams.toString())
    const current = params.getAll("size")
    if (current.includes(size)) {
      params.delete("size")
      for (const s of current) {
        if (s !== size) params.append("size", s)
      }
    } else {
      params.append("size", size)
    }
    params.delete("page")
    router.push(`${pathname}${params.toString() ? `?${params.toString()}` : ""}`)
  }

  function setPriceRange(index: number | null) {
    const params = new URLSearchParams(searchParams.toString())
    if (index === null) {
      params.delete("priceRange")
    } else {
      params.set("priceRange", String(index))
    }
    params.delete("page")
    router.push(`${pathname}${params.toString() ? `?${params.toString()}` : ""}`)
  }

  function clearFilters() {
    router.push(pathname)
  }

  const hasFilters = selectedSizes.length > 0 || activePriceRange

  return (
    <aside className="w-full lg:w-56 shrink-0">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-heading text-sm font-semibold text-[#333] dark:text-[#F0EDE8] tracking-wide">Filters</h3>
        {hasFilters && (
          <button onClick={clearFilters} className="text-xs text-[#800020] dark:text-[#B8860B] hover:underline flex items-center gap-1">
            <X className="w-3 h-3" /> Clear
          </button>
        )}
      </div>

      <div className="space-y-6">
        {allSizes.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold text-[#6B6B6B] dark:text-[#9C9C9C] uppercase tracking-wider mb-2">Size</h4>
            <div className="flex flex-wrap gap-1.5">
              {allSizes.map(size => {
                const active = selectedSizes.includes(size)
                return (
                  <button
                    key={size}
                    onClick={() => toggleSize(size)}
                    className={`text-xs px-2.5 py-1 rounded-md font-medium transition-all ${
                      active
                        ? "bg-[#800020] dark:bg-[#B8860B] text-white"
                        : "bg-[#F5F0EB] dark:bg-[#2A2A2A] text-[#6B6B6B] dark:text-[#9C9C9C] hover:bg-[#800020]/10 dark:hover:bg-[#B8860B]/20"
                    }`}
                  >
                    {size}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        <div>
          <h4 className="text-xs font-semibold text-[#6B6B6B] dark:text-[#9C9C9C] uppercase tracking-wider mb-2">Price</h4>
          <div className="space-y-1">
            <button
              onClick={() => setPriceRange(null)}
              className={`w-full text-left text-xs px-2.5 py-1.5 rounded-md transition-colors ${
                !activePriceRange
                  ? "bg-[#800020]/10 dark:bg-[#B8860B]/20 text-[#800020] dark:text-[#B8860B] font-medium"
                  : "text-[#6B6B6B] dark:text-[#9C9C9C] hover:bg-[#F5F0EB] dark:hover:bg-[#2A2A2A]"
              }`}
            >
              All Prices
            </button>
            {PRICE_RANGES.map((range, i) => (
              <button
                key={i}
                onClick={() => setPriceRange(i)}
                className={`w-full text-left text-xs px-2.5 py-1.5 rounded-md transition-colors ${
                  activePriceRange === range
                    ? "bg-[#800020]/10 dark:bg-[#B8860B]/20 text-[#800020] dark:text-[#B8860B] font-medium"
                    : "text-[#6B6B6B] dark:text-[#9C9C9C] hover:bg-[#F5F0EB] dark:hover:bg-[#2A2A2A]"
                }`}
              >
                {range.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </aside>
  )
}
