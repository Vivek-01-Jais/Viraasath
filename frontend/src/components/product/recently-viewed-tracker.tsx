"use client"

import { useEffect } from "react"
import { addRecentProduct } from "@/lib/recently-viewed"
import { RecentlyViewed } from "@/components/product/recently-viewed"
import type { Product } from "@/types/product"

export function RecentlyViewedTracker({ product }: { product: Product }) {
  useEffect(() => {
    addRecentProduct({
      id: product.id,
      slug: product.slug,
      name: product.name,
      price: product.price,
      image: product.product_images?.[0]?.url ?? null,
    })
  }, [product])

  return <RecentlyViewed />
}
