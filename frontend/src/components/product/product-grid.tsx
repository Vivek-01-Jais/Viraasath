"use client"

import { useSearchParams, usePathname } from "next/navigation"
import Link from "next/link"
import { Search, X, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ProductCard } from "@/components/product/product-card"
import { ProductGridSkeleton } from "@/components/ui/skeleton"
import { useCategories, useProducts } from "@/lib/queries/use-products"

const PAGE_SIZE = 20

export function ProductGrid() {
  const searchParams = useSearchParams()
  const pathname = usePathname()

  const category = searchParams.get("category") ?? undefined
  const query = searchParams.get("q") ?? undefined
  const page = Math.max(1, Number(searchParams.get("page")) || 1)

  const { data: categories, isLoading: catsLoading } = useCategories()
  const { data: result, isLoading: productsLoading } = useProducts({
    category,
    query,
    page,
    pageSize: PAGE_SIZE,
  })

  if (catsLoading || productsLoading) return <ProductGridSkeleton />

  const products = result?.products ?? []
  const total = result?.total ?? 0
  const activeCategory = categories?.find((c) => c.id === category)
  const totalPages = Math.ceil(total / PAGE_SIZE)

  function buildPageUrl(p: number) {
    const params = new URLSearchParams(searchParams.toString())
    if (params.has("page")) params.delete("page")
    if (p > 1) params.set("page", String(p))
    const qs = params.toString()
    return `${pathname}${qs ? `?${qs}` : ""}`
  }

  return (
    <>
      {!category && !query && categories && categories.length > 0 && (
        <div className="mb-10">
          <div className="flex flex-wrap gap-3">
            {categories.map((cat) => {
              const gradients = [
                "from-[#800020]/5 to-[#C5A028]/5 border-[#800020]/10",
                "from-[#C5A028]/5 to-[#800020]/5 border-[#C5A028]/10",
                "from-[#800020]/3 to-[#333]/5 border-[#800020]/8",
                "from-[#C5A028]/3 to-[#800020]/8 border-[#C5A028]/8",
                "from-[#333]/5 to-[#C5A028]/5 border-[#333]/10",
              ]
              return (
                <Link
                  key={cat.id}
                  href={`/products?category=${cat.id}`}
                  className={`rounded-xl bg-gradient-to-br ${gradients[categories.indexOf(cat) % gradients.length]} border p-5 flex-1 min-w-[160px] group hover:shadow-lg hover:-translate-y-1 transition-all duration-300`}
                >
                  <h3 className="font-heading text-base text-[#333] dark:text-[#F0EDE8] group-hover:text-[#800020] dark:group-hover:text-[#B8860B] transition-colors">{cat.name}</h3>
                  {cat.description && (
                    <p className="text-xs text-[#6B6B6B] dark:text-[#9C9C9C] mt-1 line-clamp-2">{cat.description}</p>
                  )}
                </Link>
              )
            })}
          </div>
        </div>
      )}

      {categories && (
        <div className="flex flex-wrap items-center gap-2 mb-8">
          <Link
            href="/products"
            className={`text-sm px-3 py-1.5 rounded-full border transition-colors ${
              !category
                ? "bg-[#800020] text-white border-[#800020] dark:bg-[#B8860B] dark:border-[#B8860B]"
                : "bg-white dark:bg-transparent text-[#6B6B6B] dark:text-[#9C9C9C] border-[#E5E0DB] dark:border-[#333] hover:border-[#800020] dark:hover:border-[#B8860B] hover:text-[#800020] dark:hover:text-[#B8860B]"
            }`}
          >
            All
          </Link>
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/products?category=${cat.id}`}
              className={`text-sm px-3 py-1.5 rounded-full border transition-colors ${
                category === cat.id
                  ? "bg-[#800020] text-white border-[#800020] dark:bg-[#B8860B] dark:border-[#B8860B]"
                  : "bg-white dark:bg-transparent text-[#6B6B6B] dark:text-[#9C9C9C] border-[#E5E0DB] dark:border-[#333] hover:border-[#800020] dark:hover:border-[#B8860B] hover:text-[#800020] dark:hover:text-[#B8860B]"
              }`}
            >
              {cat.name}
            </Link>
          ))}
        </div>
      )}

      {activeCategory && (
        <p className="text-sm text-[#6B6B6B] dark:text-[#9C9C9C] mb-6 font-heading italic">{activeCategory.description}</p>
      )}

      {query && (
        <div className="mb-6 flex items-center gap-2 text-sm text-[#6B6B6B] dark:text-[#9C9C9C]">
          <Search className="w-4 h-4" />
          <span>Search results for &ldquo;<strong className="text-[#333] dark:text-[#F0EDE8]">{query}</strong>&rdquo;</span>
          <Link href="/products" className="ml-1 p-1 hover:text-[#800020] dark:hover:text-[#B8860B]"><X className="w-3.5 h-3.5" /></Link>
        </div>
      )}
      <p className="text-sm text-[#6B6B6B] dark:text-[#9C9C9C] mb-6">{total} product{total !== 1 ? "s" : ""}</p>

      {products.length === 0 ? (
        <div className="text-center py-24">
          <p className="text-[#6B6B6B] dark:text-[#9C9C9C]">No products found.</p>
          <Link href="/products">
            <Button variant="outline" className="mt-4">View all products</Button>
          </Link>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-8">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-12">
              {page > 1 && (
                <Link href={buildPageUrl(page - 1)} className="p-2 rounded-lg border border-[#E5E0DB] dark:border-[#333] text-[#6B6B6B] dark:text-[#9C9C9C] hover:border-[#800020] dark:hover:border-[#B8860B] transition-colors">
                  <ChevronLeft className="w-4 h-4" />
                </Link>
              )}
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                .map((p, idx, arr) => (
                  <span key={p} className="flex items-center">
                    {idx > 0 && arr[idx - 1] !== p - 1 && <span className="px-1 text-[#9C9C9C]">...</span>}
                    <Link
                      href={buildPageUrl(p)}
                      className={`w-9 h-9 flex items-center justify-center rounded-lg text-sm transition-colors ${
                        p === page
                          ? "bg-[#800020] text-white dark:bg-[#B8860B]"
                          : "border border-[#E5E0DB] dark:border-[#333] text-[#6B6B6B] dark:text-[#9C9C9C] hover:border-[#800020] dark:hover:border-[#B8860B]"
                      }`}
                    >
                      {p}
                    </Link>
                  </span>
                ))}
              {page < totalPages && (
                <Link href={buildPageUrl(page + 1)} className="p-2 rounded-lg border border-[#E5E0DB] dark:border-[#333] text-[#6B6B6B] dark:text-[#9C9C9C] hover:border-[#800020] dark:hover:border-[#B8860B] transition-colors">
                  <ChevronRight className="w-4 h-4" />
                </Link>
              )}
            </div>
          )}
        </>
      )}
    </>
  )
}
