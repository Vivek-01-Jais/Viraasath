"use client"

import { create } from "zustand"
import { createClient, isSupabaseAvailable } from "@/lib/supabase/client"
import type { Product } from "@/types/product"

type WishlistState = {
  items: Product[]
  loading: boolean
  fetchWishlist: (userId: string) => Promise<void>
  toggleItem: (userId: string, product: Product) => Promise<void>
  isWishlisted: (productId: string) => boolean
}

export const useWishlistStore = create<WishlistState>((set, get) => ({
  items: [],
  loading: false,

  fetchWishlist: async (userId: string) => {
    if (!isSupabaseAvailable()) { set({ loading: false }); return }
    const supabase = createClient()
    set({ loading: true })

    const { data } = await supabase
      .from("wishlist_items")
      .select(`
        product:products(
          *,
          category:categories(*),
          product_variants(*),
          product_images(*)
        )
      `)
      .eq("user_id", userId)

    type WishlistItemResponse = {
      product: Product
    }
    const raw: WishlistItemResponse[] = (data ?? []) as WishlistItemResponse[]
    set({
      items: raw.map((d) => d.product),
      loading: false,
    })
  },

  toggleItem: async (userId: string, product: Product) => {
    if (!isSupabaseAvailable()) return
    const supabase = createClient()
    const exists = get().items.find((p) => p.id === product.id)

    if (exists) {
      await supabase
        .from("wishlist_items")
        .delete()
        .eq("user_id", userId)
        .eq("product_id", product.id)

      set({ items: get().items.filter((p) => p.id !== product.id) })
    } else {
      await supabase
        .from("wishlist_items")
        .insert({ user_id: userId, product_id: product.id })

      set({ items: [...get().items, product] })
    }
  },

  isWishlisted: (productId: string) =>
    get().items.some((p) => p.id === productId),
}))
