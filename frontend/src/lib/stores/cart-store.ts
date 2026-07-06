"use client"

import { create } from "zustand"
import { createClient, isSupabaseAvailable } from "@/lib/supabase/client"
import type { Product } from "@/types/product"

export type CartItem = {
  id: string
  product_id: string
  variant_id: string | null
  quantity: number
  product: Product
}

type LocalCartItem = {
  id: string
  product_id: string
  variant_id: string | null
  quantity: number
  product: Product
}

type CartState = {
  items: CartItem[]
  loading: boolean
  isOpen: boolean
  initialized: boolean
  initLocalCart: () => void
  fetchCart: (userId: string) => Promise<void>
  addItem: (userId: string | null, product: Product, variantId?: string) => Promise<void>
  removeItem: (userId: string | null, itemId: string) => Promise<void>
  updateQuantity: (userId: string | null, itemId: string, quantity: number) => Promise<void>
  clearCart: () => void
  mergeGuestCart: (userId: string) => Promise<void>
  openCart: () => void
  closeCart: () => void
  totalItems: () => number
  totalPrice: () => number
}

const LOCAL_CART_KEY = "viraasat_guest_cart"

function loadLocalCart(): LocalCartItem[] {
  if (typeof window === "undefined") return []
  try {
    const raw = localStorage.getItem(LOCAL_CART_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveLocalCart(items: LocalCartItem[]) {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(LOCAL_CART_KEY, JSON.stringify(items))
  } catch {
    /* quota exceeded — silently fail */
  }
}

function generateTempId(): string {
  return `guest_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  loading: false,
  isOpen: false,
  initialized: false,

  initLocalCart: () => {
    if (get().initialized) return
    set({ items: loadLocalCart(), initialized: true })
  },

  fetchCart: async (userId: string) => {
    if (!isSupabaseAvailable()) { set({ loading: false }); return }
    const supabase = createClient()
    set({ loading: true })

    const { data: cart } = await supabase
      .from("carts")
      .select(`
        id,
        cart_items(
          id,
          product_id,
          variant_id,
          quantity,
          product:products(
            *,
            category:categories(*),
            product_variants(*),
            product_images(*)
          )
        )
      `)
      .eq("user_id", userId)
      .maybeSingle()

    if (cart?.cart_items) {
      type CartItemResponse = {
        id: string
        product_id: string
        variant_id: string | null
        quantity: number
        product: Product
      }
      const raw: CartItemResponse[] = (cart.cart_items ?? []) as CartItemResponse[]
      const items = raw.map((item) => ({
        id: item.id,
        product_id: item.product_id,
        variant_id: item.variant_id,
        quantity: item.quantity,
        product: item.product,
      }))
      set({ items, loading: false })
    } else {
      set({ items: [], loading: false })
    }
  },

  addItem: async (userId: string | null, product: Product, variantId?: string) => {
    const variant_id = variantId ?? null
    const existing = get().items.find(
      (i) => i.product_id === product.id && i.variant_id === variant_id
    )

    if (!userId) {
      if (existing) {
        set({
          items: get().items.map((i) =>
            i.id === existing.id ? { ...i, quantity: i.quantity + 1 } : i
          ),
        })
      } else {
        const newItem: LocalCartItem = {
          id: generateTempId(),
          product_id: product.id,
          variant_id,
          quantity: 1,
          product,
        }
        set({ items: [...get().items, newItem] })
      }
      saveLocalCart(get().items as LocalCartItem[])
      return
    }

    if (!isSupabaseAvailable()) return
    const supabase = createClient()

    if (existing) {
      await supabase
        .from("cart_items")
        .update({ quantity: existing.quantity + 1 })
        .eq("id", existing.id)

      set({
        items: get().items.map((i) =>
          i.id === existing.id ? { ...i, quantity: i.quantity + 1 } : i
        ),
      })
    } else {
      let cartId: string | null = null

      const { data: cart } = await supabase
        .from("carts")
        .select("id")
        .eq("user_id", userId)
        .maybeSingle()

      if (cart) {
        cartId = cart.id
      } else {
        const { data: newCart } = await supabase
          .from("carts")
          .insert({ user_id: userId })
          .select("id")
          .single()

        cartId = newCart?.id ?? null
      }

      if (cartId) {
        const { data: newItem } = await supabase
          .from("cart_items")
          .insert({
            cart_id: cartId,
            product_id: product.id,
            variant_id,
            quantity: 1,
          })
          .select("id")
          .single()

        if (newItem) {
          set({
            items: [
              ...get().items,
              {
                id: newItem.id,
                product_id: product.id,
                variant_id,
                quantity: 1,
                product,
              },
            ],
          })
        }
      }
    }
  },

  removeItem: async (userId: string | null, itemId: string) => {
    if (!userId) {
      set({ items: get().items.filter((i) => i.id !== itemId) })
      saveLocalCart(get().items as LocalCartItem[])
      return
    }
    if (!isSupabaseAvailable()) return
    const supabase = createClient()
    await supabase.from("cart_items").delete().eq("id", itemId)
    set({ items: get().items.filter((i) => i.id !== itemId) })
  },

  updateQuantity: async (userId: string | null, itemId: string, quantity: number) => {
    if (quantity < 1) return
    if (!userId) {
      set({
        items: get().items.map((i) => (i.id === itemId ? { ...i, quantity } : i)),
      })
      saveLocalCart(get().items as LocalCartItem[])
      return
    }
    if (!isSupabaseAvailable()) return
    const supabase = createClient()
    await supabase.from("cart_items").update({ quantity }).eq("id", itemId)
    set({
      items: get().items.map((i) => (i.id === itemId ? { ...i, quantity } : i)),
    })
  },

  mergeGuestCart: async (userId: string) => {
    const guestItems = loadLocalCart()
    if (guestItems.length === 0) return

    const supabase = createClient()

    let cartId: string | null = null
    const { data: cart } = await supabase
      .from("carts")
      .select("id")
      .eq("user_id", userId)
      .maybeSingle()

    if (cart) {
      cartId = cart.id
    } else {
      const { data: newCart } = await supabase
        .from("carts")
        .insert({ user_id: userId })
        .select("id")
        .single()
      cartId = newCart?.id ?? null
    }

    if (!cartId) return

    for (const guest of guestItems) {
      let query = supabase
        .from("cart_items")
        .select("id, quantity")
        .eq("cart_id", cartId)
        .eq("product_id", guest.product_id)

      if (guest.variant_id) {
        query = query.eq("variant_id", guest.variant_id)
      } else {
        query = query.is("variant_id", null)
      }

      const { data: existing } = await query.maybeSingle()

      if (existing) {
        await supabase
          .from("cart_items")
          .update({ quantity: existing.quantity + guest.quantity })
          .eq("id", existing.id)
      } else {
        const { data: newItem } = await supabase
          .from("cart_items")
          .insert({
            cart_id: cartId,
            product_id: guest.product_id,
            variant_id: guest.variant_id,
            quantity: guest.quantity,
          })
          .select("id")
          .single()

        if (newItem) {
          set({
            items: [
              ...get().items,
              {
                id: newItem.id,
                product_id: guest.product_id,
                variant_id: guest.variant_id,
                quantity: guest.quantity,
                product: guest.product,
              },
            ],
          })
        }
      }
    }

    try { localStorage.removeItem(LOCAL_CART_KEY) } catch { /* ignore */ }
  },

  clearCart: () => {
    saveLocalCart([])
    set({ items: [] })
  },

  openCart: () => set({ isOpen: true }),
  closeCart: () => set({ isOpen: false }),

  totalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
  totalPrice: () =>
    get().items.reduce((sum, i) => {
      const price = i.product.product_variants?.find(
        (v) => v.id === i.variant_id
      )?.price ?? i.product.price ?? 0
      return sum + price * i.quantity
    }, 0),
}))
