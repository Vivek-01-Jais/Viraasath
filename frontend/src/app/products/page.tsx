import { Suspense } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ProductCard } from "@/components/product/product-card"
import { getCategories, getProducts } from "@/lib/queries/products"

export const dynamic = "force-dynamic"

type Props = {
  searchParams: Promise<{ category?: string }>
}

async function ProductGrid({ category }: { category?: string }) {
  const [products, categories] = await Promise.all([
    getProducts(category ? { category } : undefined),
    getCategories(),
  ])

  const activeCategory = categories.find((c) => c.id === category)

  return (
    <>
      <div className="flex flex-wrap items-center gap-2 mb-8">
        <Link
          href="/products"
          className={`text-sm px-3 py-1.5 rounded-full border transition-colors ${
            !category
              ? "bg-zinc-900 text-white border-zinc-900"
              : "bg-white text-zinc-600 border-zinc-200 hover:border-zinc-400"
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
                ? "bg-zinc-900 text-white border-zinc-900"
                : "bg-white text-zinc-600 border-zinc-200 hover:border-zinc-400"
            }`}
          >
            {cat.name}
          </Link>
        ))}
      </div>

      {activeCategory && (
        <p className="text-sm text-zinc-500 mb-6">{activeCategory.description}</p>
      )}

      <p className="text-sm text-zinc-400 mb-6">{products.length} products</p>

      {products.length === 0 ? (
        <div className="text-center py-24">
          <p className="text-zinc-500">No products found in this category.</p>
          <Link href="/products">
            <Button variant="outline" className="mt-4">View all products</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-8">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </>
  )
}

export default async function ProductsPage({ searchParams }: Props) {
  const { category } = await searchParams

  return (
    <div className="flex flex-col flex-1">
      <header className="flex items-center justify-between px-6 py-4 border-b">
        <Link href="/" className="text-xl font-semibold tracking-tight">Viraasat</Link>
        <nav className="flex items-center gap-4">
          <span className="text-sm text-zinc-800 font-medium">Shop</span>
          <Link href="/login" className="text-sm text-zinc-500 hover:text-zinc-800">Sign in</Link>
        </nav>
      </header>

      <main className="flex-1 px-6 py-8 max-w-7xl mx-auto w-full">
        <h1 className="text-2xl font-bold mb-2">All Kurtis</h1>
        <p className="text-zinc-500 text-sm mb-8">
          Discover our collection of handcrafted kurtis for every occasion
        </p>

        <Suspense fallback={<div className="text-center py-24 text-zinc-400">Loading...</div>}>
          <ProductGrid category={category} />
        </Suspense>
      </main>
    </div>
  )
}
