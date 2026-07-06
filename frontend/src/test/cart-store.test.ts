import { describe, it, expect, beforeEach, vi } from "vitest"
import { useCartStore } from "@/lib/stores/cart-store"
import type { Product } from "@/types/product"

const mockProduct: Product = {
  id: "prod-1",
  name: "Test Kurti",
  slug: "test-kurti",
  price: 999,
  description: "A test product",
  category: null,
  category_id: null,
  material: null,
  care_instructions: null,
  is_active: true,
  is_featured: false,
  created_at: "2025-01-01",
  updated_at: "2025-01-01",
  product_variants: [
    { id: "var-1", size: "M", color: "Red", color_hex: "#FF0000", stock_quantity: 10, price: null, is_active: true, sku: "V1", product_id: "prod-1", created_at: "2025-01-01" },
    { id: "var-2", size: "L", color: "Red", color_hex: "#FF0000", stock_quantity: 5, price: 1099, is_active: true, sku: "V2", product_id: "prod-1", created_at: "2025-01-01" },
  ],
  product_images: [],
  search_vector: null,
}

beforeEach(() => {
  useCartStore.setState({ items: [], loading: false, isOpen: false, initialized: false })
  localStorage.clear()
})

describe("Cart Store — Local (guest)", () => {
  it("starts empty", () => {
    const { items } = useCartStore.getState()
    expect(items).toHaveLength(0)
  })

  it("adds item to local cart", async () => {
    await useCartStore.getState().addItem(null, mockProduct)
    const { items } = useCartStore.getState()
    expect(items).toHaveLength(1)
    expect(items[0].product_id).toBe("prod-1")
    expect(items[0].quantity).toBe(1)
  })

  it("increments quantity for duplicate product", async () => {
    await useCartStore.getState().addItem(null, mockProduct)
    await useCartStore.getState().addItem(null, mockProduct)
    const { items } = useCartStore.getState()
    expect(items).toHaveLength(1)
    expect(items[0].quantity).toBe(2)
  })

  it("removes item from local cart", async () => {
    await useCartStore.getState().addItem(null, mockProduct)
    const id = useCartStore.getState().items[0].id
    await useCartStore.getState().removeItem(null, id)
    expect(useCartStore.getState().items).toHaveLength(0)
  })

  it("updates quantity", async () => {
    await useCartStore.getState().addItem(null, mockProduct)
    const id = useCartStore.getState().items[0].id
    await useCartStore.getState().updateQuantity(null, id, 5)
    expect(useCartStore.getState().items[0].quantity).toBe(5)
  })

  it("does not set quantity below 1", async () => {
    await useCartStore.getState().addItem(null, mockProduct)
    const id = useCartStore.getState().items[0].id
    await useCartStore.getState().updateQuantity(null, id, 0)
    expect(useCartStore.getState().items[0].quantity).toBe(1)
  })

  it("clears cart", async () => {
    await useCartStore.getState().addItem(null, mockProduct)
    useCartStore.getState().clearCart()
    expect(useCartStore.getState().items).toHaveLength(0)
  })
})

describe("Cart Store — totalPrice", () => {
  it("returns 0 for empty cart", () => {
    expect(useCartStore.getState().totalPrice()).toBe(0)
  })

  it("uses variant price when available", async () => {
    const productWithVarPrice: Product = {
      ...mockProduct,
      product_variants: [
        { id: "var-2", size: "L", color: "Red", color_hex: "#FF0000", stock_quantity: 5, price: 1099, is_active: true, sku: "V2", product_id: "prod-1", created_at: "2025-01-01" },
      ],
    }
    await useCartStore.getState().addItem(null, productWithVarPrice, "var-2")
    expect(useCartStore.getState().totalPrice()).toBe(1099)
  })

  it("falls back to product price", async () => {
    await useCartStore.getState().addItem(null, mockProduct)
    expect(useCartStore.getState().totalPrice()).toBe(999)
  })
})

describe("Cart Store — totalItems", () => {
  it("returns 0 for empty cart", () => {
    expect(useCartStore.getState().totalItems()).toBe(0)
  })

  it("counts all items", async () => {
    await useCartStore.getState().addItem(null, mockProduct)
    await useCartStore.getState().addItem(null, { ...mockProduct, id: "prod-2", product_variants: [] }, "var-1")
    expect(useCartStore.getState().totalItems()).toBe(2)
  })
})

describe("Cart Store — open/close", () => {
  it("opens and closes", () => {
    useCartStore.getState().openCart()
    expect(useCartStore.getState().isOpen).toBe(true)
    useCartStore.getState().closeCart()
    expect(useCartStore.getState().isOpen).toBe(false)
  })
})
