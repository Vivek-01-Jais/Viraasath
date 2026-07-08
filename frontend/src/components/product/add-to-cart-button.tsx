"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/context/auth-context"
import { useCartStore } from "@/lib/stores/cart-store"
import { toast } from "sonner"
import { ShoppingBag, Check } from "lucide-react"
import type { Product } from "@/types/product"

export function AddToCartButton({ product, variantId, hasSizes }: { product: Product; variantId?: string | null; hasSizes?: boolean }) {
  const { user } = useAuth()
  const { addItem, openCart } = useCartStore()
  const [added, setAdded] = useState(false)
  const noSize = hasSizes && !variantId

  async function handleAddToCart() {
    if (noSize) return
    await addItem(user?.id ?? null, product, variantId || undefined)
    setAdded(true)
    toast.success("Added to cart!", {
      action: { label: "View Cart", onClick: () => openCart() },
    })
    setTimeout(() => setAdded(false), 2000)
  }

  return (
    <Button
      disabled={noSize}
      className={`w-full h-12 text-base font-semibold transition-all rounded-full ${
        noSize ? "bg-[#9C9C9C] dark:bg-[#555] text-white cursor-not-allowed"
        : added
          ? "bg-emerald-600 hover:bg-emerald-600 text-white"
          : "bg-[#800020] hover:bg-[#A00028] dark:bg-[#B8860B] dark:hover:bg-[#D4A020] text-white"
      }`}
      size="lg"
      onClick={handleAddToCart}
    >
      {noSize ? (
        <><ShoppingBag className="w-5 h-5 mr-2" /> Select a size</>
      ) : added ? (
        <><Check className="w-5 h-5 mr-2" /> Added to Cart</>
      ) : (
        <><ShoppingBag className="w-5 h-5 mr-2" /> Add to Cart</>
      )}
    </Button>
  )
}
