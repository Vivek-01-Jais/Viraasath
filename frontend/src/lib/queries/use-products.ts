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

  const { data, count } = await query
    .order("created_at", { ascending: false })
    .range(from, to)

  return { products: data ?? [], total: count ?? 0 }
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
