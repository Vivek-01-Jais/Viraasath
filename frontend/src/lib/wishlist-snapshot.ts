import type { Product } from "@/types/product"

const SNAPSHOT_KEY = "viraasat_wishlist_snapshots"

type ProductSnapshot = {
  price: number
  in_stock: boolean
}

export type ChangeInfo = {
  type: "price_drop" | "price_increase" | "back_in_stock" | "out_of_stock"
  old: number | boolean
  current: number | boolean
}

export function loadSnapshots(): Record<string, ProductSnapshot> {
  if (typeof window === "undefined") return {}
  try {
    return JSON.parse(localStorage.getItem(SNAPSHOT_KEY) || "{}")
  } catch {
    return {}
  }
}

export function saveSnapshots(snapshots: Record<string, ProductSnapshot>) {
  localStorage.setItem(SNAPSHOT_KEY, JSON.stringify(snapshots))
}

export function detectChanges(
  products: Product[],
  snapshots: Record<string, ProductSnapshot>,
): Record<string, ChangeInfo> {
  const changes: Record<string, ChangeInfo> = {}

  for (const p of products) {
    const cached = snapshots[p.id]
    if (!cached) continue

    const currentPrice = p.price ?? 0
    const inStock = (p.product_variants ?? []).some((v) => v.stock_quantity > 0)

    if (inStock && !cached.in_stock) {
      changes[p.id] = { type: "back_in_stock", old: cached.in_stock, current: inStock }
    } else if (!inStock && cached.in_stock) {
      changes[p.id] = { type: "out_of_stock", old: cached.in_stock, current: inStock }
    } else if (currentPrice < cached.price) {
      changes[p.id] = { type: "price_drop", old: cached.price, current: currentPrice }
    } else if (currentPrice > cached.price) {
      changes[p.id] = { type: "price_increase", old: cached.price, current: currentPrice }
    }
  }

  return changes
}

export function buildSnapshots(products: Product[]): Record<string, ProductSnapshot> {
  const snapshots: Record<string, ProductSnapshot> = {}
  for (const p of products) {
    snapshots[p.id] = {
      price: p.price ?? 0,
      in_stock: (p.product_variants ?? []).some((v) => v.stock_quantity > 0),
    }
  }
  return snapshots
}
