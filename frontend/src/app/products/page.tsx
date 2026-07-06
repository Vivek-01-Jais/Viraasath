import { Suspense } from "react"
import { Header } from "@/components/header"
import { ProductGridSkeleton } from "@/components/ui/skeleton"
import { ProductGrid } from "@/components/product/product-grid"

export const dynamic = "force-dynamic"

export default function ProductsPage() {
  return (
    <div className="flex flex-col flex-1">
      <Header />

      <main className="flex-1 px-6 py-8 max-w-7xl mx-auto w-full">
        <div className="mb-8">
          <span className="text-[#800020] dark:text-[#B8860B] text-xs tracking-[0.2em] uppercase font-medium">Collection</span>
          <h1 className="font-heading text-4xl mt-1 text-[#333] dark:text-[#F0EDE8]">All Products</h1>
          <p className="text-[#6B6B6B] dark:text-[#9C9C9C] text-sm mt-2">
            Discover our collection of handcrafted ethnic wear for every occasion
          </p>
          <div className="w-16 h-0.5 bg-[#C5A028] mt-4" />
        </div>

        <Suspense fallback={<ProductGridSkeleton />}>
          <ProductGrid />
        </Suspense>
      </main>
    </div>
  )
}
