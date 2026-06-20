import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ProductCard } from "@/components/product/product-card"
import { getFeaturedProducts } from "@/lib/queries/products"

export const dynamic = "force-dynamic"

export default async function Home() {
  const featured = await getFeaturedProducts()

  return (
    <div className="flex flex-col flex-1">
      <header className="flex items-center justify-between px-6 py-4 border-b">
        <span className="text-xl font-semibold tracking-tight">Viraasat</span>
        <nav className="flex items-center gap-4">
          <Link href="/products" className="text-sm text-muted-foreground hover:text-foreground">Shop</Link>
          <Link href="/login">
            <Button variant="ghost" size="sm">Sign in</Button>
          </Link>
          <Link href="/signup">
            <Button size="sm">Join</Button>
          </Link>
        </nav>
      </header>

      <main className="flex-1">
        <section className="flex flex-col items-center justify-center px-6 py-24 text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Ethnic Elegance,<br />Redefined
          </h1>
          <p className="mt-4 max-w-md text-lg text-muted-foreground">
            Discover kurtis that blend tradition with contemporary style — crafted for every woman, every occasion.
          </p>
          <div className="mt-8 flex gap-4">
            <Link href="/products">
              <Button size="lg">Explore Collection</Button>
            </Link>
            <Link href="/signup">
              <Button variant="outline" size="lg">Join Viraasat</Button>
            </Link>
          </div>
        </section>

        {featured.length > 0 && (
          <section className="px-6 pb-24 max-w-7xl mx-auto w-full">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-bold">Featured Kurtis</h2>
              <Link href="/products" className="text-sm text-muted-foreground hover:text-foreground underline underline-offset-4">
                View all
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-8">
              {featured.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  )
}
