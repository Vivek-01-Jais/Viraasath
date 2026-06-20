export type Category = {
  id: string
  name: string
  slug: string
  description: string | null
  image_url: string | null
}

export type ProductVariant = {
  id: string
  product_id: string
  size: string
  color: string
  color_hex: string | null
  sku: string | null
  price: number | null
  stock_quantity: number
}

export type ProductImage = {
  id: string
  product_id: string
  url: string
  alt_text: string | null
  position: number
}

export type Product = {
  id: string
  name: string
  slug: string
  description: string | null
  price: number
  compare_at_price: number | null
  category_id: string | null
  material: string | null
  care_instructions: string | null
  is_featured: boolean
  created_at: string
  category: Category | null
  product_variants: ProductVariant[]
  product_images: ProductImage[]
}
