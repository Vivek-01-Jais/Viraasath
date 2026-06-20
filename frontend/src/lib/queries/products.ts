import { createClient } from "@/lib/supabase/client"
import type { Product, Category } from "@/types/product"

export async function getCategories(): Promise<Category[]> {
  const supabase = createClient()
  const { data } = await supabase
    .from("categories")
    .select("*")
    .eq("is_active", true)
    .order("name")
  return data ?? []
}

export async function getProducts(filters?: {
  category?: string
}): Promise<Product[]> {
  const supabase = createClient()
  let query = supabase
    .from("products")
    .select(`
      *,
      category:categories(*),
      product_variants(*),
      product_images(*)
    `)
    .eq("is_active", true)

  if (filters?.category) {
    query = query.eq("category_id", filters.category)
  }

  const { data } = await query.order("created_at", { ascending: false })
  return data ?? []
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
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
    .single()
  return data
}

export async function getFeaturedProducts(): Promise<Product[]> {
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
