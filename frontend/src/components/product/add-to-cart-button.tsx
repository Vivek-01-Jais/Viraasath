"use client"

import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "@/lib/context/auth-context"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import type { Product } from "@/types/product"

export function AddToCartButton({ product }: { product: Product }) {
  const { user } = useAuth()
  const router = useRouter()

  async function handleAddToCart() {
    if (!user) {
      router.push("/login")
      return
    }

    const supabase = createClient()

    const { data: cart } = await supabase
      .from("carts")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle()

    if (!cart) {
      const { data: newCart } = await supabase
        .from("carts")
        .insert({ user_id: user.id })
        .select("id")
        .single()

      if (newCart) {
        await supabase.from("cart_items").insert({
          cart_id: newCart.id,
          product_id: product.id,
          quantity: 1,
        })
      }
    } else {
      const { data: existing } = await supabase
        .from("cart_items")
        .select("id, quantity")
        .eq("cart_id", cart.id)
        .eq("product_id", product.id)
        .maybeSingle()

      if (existing) {
        await supabase
          .from("cart_items")
          .update({ quantity: existing.quantity + 1 })
          .eq("id", existing.id)
      } else {
        await supabase.from("cart_items").insert({
          cart_id: cart.id,
          product_id: product.id,
          quantity: 1,
        })
      }
    }

    toast.success("Added to cart!")
    router.refresh()
  }

  return (
    <Button className="w-full" size="lg" onClick={handleAddToCart}>
      Add to Cart
    </Button>
  )
}
