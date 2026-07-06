"use client"

import { useState } from "react"
import { SizeGuide } from "@/components/product/size-guide"
import { AddToCartButton } from "@/components/product/add-to-cart-button"
import { WishlistButton } from "@/components/product/wishlist-button"
import { BulkEnquiry } from "@/components/bulk-enquiry"
import type { Product, ProductVariant } from "@/types/product"

export function ProductActions({ product, variants }: { product: Product; variants: ProductVariant[] }) {
  const sizes = [...new Set(variants.map((v) => v.size))]
  const [selectedSize, setSelectedSize] = useState<string | null>(null)

  const selectedVariant = selectedSize ? variants.find((v) => v.size === selectedSize) : null
  const variantId = selectedVariant?.id ?? null

  return (
    <>
      {sizes.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-[#333] dark:text-[#F0EDE8]">Size</p>
            <SizeGuide />
          </div>
          <div className="flex flex-wrap gap-2">
            {sizes.map((size) => {
              const variant = variants.find((v) => v.size === size)
              const outOfStock = variant ? variant.stock_quantity === 0 : true
              const isSelected = selectedSize === size
              return (
                <button
                  key={size}
                  disabled={outOfStock}
                  onClick={() => setSelectedSize(size)}
                  className={`px-5 py-2.5 text-sm font-medium border rounded-lg transition-all ${
                    outOfStock
                      ? "border-[#E5E0DB] dark:border-[#333] text-[#9C9C9C] dark:text-[#555] cursor-not-allowed line-through bg-[#F5F0EB] dark:bg-[#242424]/50"
                      : isSelected
                        ? "border-[#800020] dark:border-[#B8860B] bg-[#800020] dark:bg-[#B8860B] text-white shadow-sm"
                        : "border-[#E5E0DB] dark:border-[#444] text-[#333] dark:text-[#F0EDE8] hover:border-[#800020] dark:hover:border-[#B8860B] hover:text-[#800020] dark:hover:text-[#B8860B] cursor-pointer bg-white dark:bg-transparent hover:shadow-sm"
                  }`}
                >
                  {size}
                </button>
              )
            })}
          </div>
        </div>
      )}

      <div className="space-y-3 pt-2">
        <AddToCartButton product={product} variantId={variantId} />
        <WishlistButton product={product} />
        <BulkEnquiry productName={product.name} />
      </div>
    </>
  )
}
