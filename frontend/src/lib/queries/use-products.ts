import { useQuery } from "@tanstack/react-query"
import type { Product, Category } from "@/types/product"
import { getDemoModule } from "@/lib/demo-loader"

async function fetchCategories(): Promise<Category[]> {
  const demo = await getDemoModule()
  if (demo) return demo.demoCategories

  const { createClient } = await import("@/lib/supabase/client")
  const supabase = createClient()
  const { data } = await supabase
    .from("categories")
    .select("*")
    .eq("is_active", true)
    .order("name")
  return data ?? []
}

async function fetchProducts(filters?: {
  category?: string
  query?: string
  page?: number
  pageSize?: number
  minPrice?: number
  maxPrice?: number
  sizes?: string[]
}): Promise<{ products: Product[]; total: number }> {
  const demo = await getDemoModule()
  if (demo) {
    const result = demo.getDemoProducts(filters)
    return { products: result, total: result.length }
  }

  const { createClient } = await import("@/lib/supabase/client")
  const supabase = createClient()
  const page = filters?.page ?? 1
  const pageSize = filters?.pageSize ?? 20
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  let productIds: string[] | undefined

  if (filters?.sizes && filters.sizes.length > 0) {
    const { data: variants } = await supabase
      .from("product_variants")
      .select("product_id")
      .in("size", filters.sizes)
      .gt("stock_quantity", 0)

    const rawVariants = (variants ?? []) as { product_id: string }[]
    productIds = [...new Set(rawVariants.map(v => v.product_id))]
    if (productIds.length === 0) return { products: [], total: 0 }
  }

  let query = supabase
    .from("products")
    .select(`
      *,
      category:categories(*),
      product_variants(*),
      product_images(*)
    `, { count: "exact" })
    .eq("is_active", true)

  if (filters?.category) {
    query = query.eq("category_id", filters.category)
  }

  if (filters?.query) {
    query = query.textSearch("search_vector", filters.query, { config: "english" })
  }

  if (filters?.minPrice != null) {
    query = query.gte("price", filters.minPrice)
  }

  if (filters?.maxPrice != null) {
    query = query.lte("price", filters.maxPrice)
  }

  if (productIds) {
    query = query.in("id", productIds)
  }

  const { data, count } = await query
    .order("created_at", { ascending: false })
    .range(from, to)

  const products = (data ?? []) as Product[]

  if (products.length > 0) {
    const pIds = products.map(p => p.id)
    const { data: reviewStats } = await supabase
      .from("reviews")
      .select("product_id, rating")
      .in("product_id", pIds)
      .eq("is_approved", true)

    if (reviewStats) {
      const stats: Record<string, { total: number; sum: number }> = {}
      for (const r of reviewStats as { product_id: string; rating: number }[]) {
        if (!stats[r.product_id]) stats[r.product_id] = { total: 0, sum: 0 }
        stats[r.product_id].total++
        stats[r.product_id].sum += r.rating
      }
      for (const p of products) {
        const s = stats[p.id]
        ;(p as Record<string, unknown>).review_avg = s ? s.sum / s.total : 0
        ;(p as Record<string, unknown>).review_count = s?.total ?? 0
      }
    }
  }

  return { products, total: count ?? 0 }
}

async function fetchProductBySlug(slug: string): Promise<Product | null> {
  const demo = await getDemoModule()
  if (demo) return demo.getDemoProductBySlug(slug)

  const { createClient } = await import("@/lib/supabase/client")
  const supabase = createClient()
  const { data } = await supabase
    .from("products")
    .select(`
      *,
      category:categories(*),
      product_variants(*),
      product_images(*)
    `)
    .eq("slug", slug)
    .maybeSingle()
  return data
}

async function fetchFeaturedProducts(): Promise<Product[]> {
  const demo = await getDemoModule()
  if (demo) return demo.getDemoFeaturedProducts()

  const { createClient } = await import("@/lib/supabase/client")
  const supabase = createClient()
  const { data } = await supabase
    .from("products")
    .select(`
      *,
      category:categories(*),
      product_variants(*),
      product_images(*)
    `)
    .eq("is_featured", true)
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(4)
  return data ?? []
}

export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
    staleTime: 1000 * 60 * 15,
  })
}

export function useProducts(filters?: {
  category?: string
  query?: string
  page?: number
  pageSize?: number
  minPrice?: number
  maxPrice?: number
  sizes?: string[]
}) {
  return useQuery({
    queryKey: ["products", filters],
    queryFn: () => fetchProducts(filters),
  })
}

export function useProductBySlug(slug: string) {
  return useQuery({
    queryKey: ["product", slug],
    queryFn: () => fetchProductBySlug(slug),
    enabled: !!slug,
  })
}

export function useFeaturedProducts() {
  return useQuery({
    queryKey: ["featured-products"],
    queryFn: fetchFeaturedProducts,
    staleTime: 1000 * 60 * 15,
  })
}

async function fetchAllSizes(): Promise<string[]> {
  const demo = await getDemoModule()
  if (demo) return (demo as { getDemoSizes?: () => string[] }).getDemoSizes?.() ?? []

  const { createClient } = await import("@/lib/supabase/client")
  const supabase = createClient()
  const { data } = await supabase
    .from("product_variants")
    .select("size")
    .gt("stock_quantity", 0)

  const rawData = (data ?? []) as { size: string }[]
  return [...new Set(rawData.map(v => v.size))].sort()
}

export function useAllSizes() {
  return useQuery({
    queryKey: ["all-sizes"],
    queryFn: fetchAllSizes,
    staleTime: 1000 * 60 * 15,
  })
}
