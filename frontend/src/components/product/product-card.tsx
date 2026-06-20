import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import type { Product } from "@/types/product"

function formatPrice(amount: number) {
  return "₹" + amount.toLocaleString("en-IN")
}

export function ProductCard({ product }: { product: Product }) {
  const image = product.product_images?.[0]
  const lowestPrice = product.product_variants?.length
    ? Math.min(...product.product_variants.map((v) => v.price ?? product.price))
    : product.price
  const hasDiscount = product.compare_at_price && product.compare_at_price > product.price

  return (
    <Link href={`/products/${product.slug}`} className="group block">
      <div className="relative aspect-[3/4] bg-zinc-100 overflow-hidden rounded-lg mb-3">
        {image ? (
          <img
            src={image.url}
            alt={image.alt_text ?? product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-zinc-400 text-sm">
            No image
          </div>
        )}
        {hasDiscount && (
          <Badge className="absolute top-2 left-2 bg-red-500 text-white text-xs">
            {Math.round((1 - product.price / product.compare_at_price!) * 100)}% OFF
          </Badge>
        )}
      </div>
      <div>
        <p className="text-sm text-zinc-500 mb-0.5">{product.category?.name}</p>
        <h3 className="font-medium text-sm leading-tight mb-1 group-hover:text-zinc-600 transition-colors">
          {product.name}
        </h3>
        <div className="flex items-center gap-2">
          <span className="font-semibold">{formatPrice(lowestPrice)}</span>
          {hasDiscount && (
            <span className="text-sm text-zinc-400 line-through">
              {formatPrice(product.compare_at_price!)}
            </span>
          )}
        </div>
        {product.product_variants?.length > 0 && (
          <div className="flex gap-1 mt-1.5">
            {[...new Set(product.product_variants.map((v) => v.size))].map((size) => (
              <span key={size} className="text-xs text-zinc-400 bg-zinc-50 px-1.5 py-0.5 rounded">
                {size}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  )
}
