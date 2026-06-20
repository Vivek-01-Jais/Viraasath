import { notFound } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { SizeGuide } from "@/components/product/size-guide"
import { getProductBySlug } from "@/lib/queries/products"
import { AddToCartButton } from "@/components/product/add-to-cart-button"

export const dynamic = "force-dynamic"

function formatPrice(amount: number) {
  return "₹" + amount.toLocaleString("en-IN")
}

type Props = {
  params: Promise<{ slug: string }>
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params
  const product = await getProductBySlug(slug)

  if (!product) {
    notFound()
  }

  const images = product.product_images ?? []
  const variants = product.product_variants ?? []
  const sizes = [...new Set(variants.map((v) => v.size))]
  const colors = [...new Set(variants.map((v) => v.color))]
  const hasDiscount = product.compare_at_price && product.compare_at_price > product.price

  return (
    <div className="flex flex-col flex-1">
      <header className="flex items-center justify-between px-6 py-4 border-b">
        <Link href="/" className="text-xl font-semibold tracking-tight">Viraasat</Link>
        <nav className="flex items-center gap-4">
          <Link href="/products" className="text-sm text-zinc-500 hover:text-zinc-800">Shop</Link>
          <Link href="/login" className="text-sm text-zinc-500 hover:text-zinc-800">Sign in</Link>
        </nav>
      </header>

      <main className="flex-1 px-6 py-8 max-w-7xl mx-auto w-full">
        <Link href="/products" className="text-sm text-zinc-400 hover:text-zinc-600 mb-6 block">
          &larr; Back to shop
        </Link>

        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          <div className="space-y-3">
            {images.length > 0 ? (
              images.map((img) => (
                <img
                  key={img.id}
                  src={img.url}
                  alt={img.alt_text ?? product.name}
                  className="w-full rounded-lg bg-zinc-50"
                />
              ))
            ) : (
              <div className="aspect-[3/4] bg-zinc-100 rounded-lg flex items-center justify-center text-zinc-400">
                No image available
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div>
              {product.category && (
                <p className="text-sm text-zinc-500 mb-1">{product.category.name}</p>
              )}
              <h1 className="text-2xl font-bold">{product.name}</h1>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-xl font-semibold">{formatPrice(product.price)}</span>
                {hasDiscount && (
                  <>
                    <span className="text-lg text-zinc-400 line-through">
                      {formatPrice(product.compare_at_price!)}
                    </span>
                    <Badge variant="destructive" className="text-xs">
                      {Math.round((1 - product.price / product.compare_at_price!) * 100)}% OFF
                    </Badge>
                  </>
                )}
              </div>
              {product.material && (
                <p className="text-sm text-zinc-500 mt-2">
                  <span className="font-medium">Material:</span> {product.material}
                </p>
              )}
            </div>

            <Separator />

            {colors.length > 0 && (
              <div>
                <p className="text-sm font-medium mb-2">Color: <span className="text-zinc-500 font-normal">{colors[0]}</span></p>
              </div>
            )}

            {sizes.length > 0 && (
              <div>
                <p className="text-sm font-medium mb-2">Size</p>
                <div className="flex flex-wrap gap-2">
                  {sizes.map((size) => {
                    const variant = variants.find((v) => v.size === size)
                    const outOfStock = variant ? variant.stock_quantity === 0 : true
                    return (
                      <button
                        key={size}
                        disabled={outOfStock}
                        className={`px-4 py-2 text-sm border rounded-md transition-colors ${
                          outOfStock
                            ? "border-zinc-200 text-zinc-300 cursor-not-allowed line-through"
                            : "border-zinc-300 hover:border-zinc-900 hover:text-zinc-900 cursor-pointer"
                        }`}
                      >
                        {size}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            <AddToCartButton product={product} />

            {product.description && (
              <div>
                <h3 className="text-sm font-medium mb-2">Description</h3>
                <p className="text-sm text-zinc-600 leading-relaxed">{product.description}</p>
              </div>
            )}

            {product.care_instructions && (
              <div>
                <h3 className="text-sm font-medium mb-2">Care Instructions</h3>
                <p className="text-sm text-zinc-600">{product.care_instructions}</p>
              </div>
            )}

            <SizeGuide />
          </div>
        </div>
      </main>
    </div>
  )
}
