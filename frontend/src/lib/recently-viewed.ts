const STORAGE_KEY = "viraasat_recently_viewed"
const MAX = 8

export type RecentProduct = {
  id: string
  slug: string
  name: string
  price: number
  image: string | null
}

export function addRecentProduct(product: RecentProduct) {
  if (typeof window === "undefined") return
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    let items: RecentProduct[] = raw ? JSON.parse(raw) : []
    items = items.filter(r => r.id !== product.id)
    items.unshift(product)
    if (items.length > MAX) items = items.slice(0, MAX)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  } catch { /* ignore */ }
}

export function getRecentProducts(): RecentProduct[] {
  if (typeof window === "undefined") return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch { return [] }
}
