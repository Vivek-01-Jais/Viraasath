import type { Product, Category } from "@/types/product"

export const demoCategories: Category[] = [
  {
    id: "cat-1",
    name: "Kurtis",
    slug: "kurtis",
    description: "Classic straight-cut and A-line kurtis for everyday elegance",
    image_url: null,
  },
  {
    id: "cat-2",
    name: "Anarkalis",
    slug: "anarkalis",
    description: "Floor-length flared silhouettes for festive occasions",
    image_url: null,
  },
  {
    id: "cat-3",
    name: "Tunics",
    slug: "tunics",
    description: "Modern crop-length tops with ethnic detailing",
    image_url: null,
  },
  {
    id: "cat-4",
    name: "Palazzos",
    slug: "palazzos",
    description: "Wide-legged bottoms that complement any kurti",
    image_url: null,
  },
  {
    id: "cat-5",
    name: "Dupattas",
    slug: "dupattas",
    description: "Handwoven scarves to complete your look",
    image_url: null,
  },
]

export const demoProducts: Product[] = [
  {
    id: "prod-1",
    name: "Ivory Cotton Chikankari Kurti",
    slug: "ivory-cotton-chikankari-kurti",
    description: "Hand-embroidered Chikankari work on pure cotton. This exquisite piece features intricate threadwork inspired by the timeless craft of Lucknow. Perfect for both casual outings and semi-formal gatherings, the breathable fabric ensures all-day comfort while the delicate embroidery adds a touch of heritage.",
    price: 2499,
    compare_at_price: 3999,
    category_id: "cat-1",
    material: "Pure Cotton, Hand-embroidered",
    care_instructions: "Dry clean recommended. Store in a cool, dry place away from direct sunlight.",
    is_featured: true,
    created_at: "2026-05-01T00:00:00Z",
    category: demoCategories[0],
    product_variants: [
      { id: "var-1", product_id: "prod-1", size: "S", color: "Ivory", color_hex: "#FFFFF0", sku: "CHK-S-IVR", price: null, stock_quantity: 15 },
      { id: "var-2", product_id: "prod-1", size: "M", color: "Ivory", color_hex: "#FFFFF0", sku: "CHK-M-IVR", price: null, stock_quantity: 20 },
      { id: "var-3", product_id: "prod-1", size: "L", color: "Ivory", color_hex: "#FFFFF0", sku: "CHK-L-IVR", price: null, stock_quantity: 18 },
      { id: "var-4", product_id: "prod-1", size: "XL", color: "Ivory", color_hex: "#FFFFF0", sku: "CHK-XL-IVR", price: null, stock_quantity: 10 },
    ],
    product_images: [
      { id: "img-1", product_id: "prod-1", url: "/demo/chikankari-1.jpg", alt_text: "Ivory Chikankari Kurti Front View", position: 1 },
      { id: "img-2", product_id: "prod-1", url: "/demo/chikankari-2.jpg", alt_text: "Ivory Chikankari Kurti Detail View", position: 2 },
    ],
  },
  {
    id: "prod-2",
    name: "Rust Red Bandhani Anarkali",
    slug: "rust-red-bandhani-anarkali",
    description: "Traditional Bandhani tie-dye artistry on a flowing Anarkali silhouette. Each piece carries the unique pattern of hand-tied knots that have been dyed with natural pigments, making every garment one-of-a-kind.",
    price: 4999,
    compare_at_price: 6499,
    category_id: "cat-2",
    material: "Georgette, Bandhani print",
    care_instructions: "Dry clean only. Do not wring. Iron on reverse side.",
    is_featured: true,
    created_at: "2026-05-02T00:00:00Z",
    category: demoCategories[1],
    product_variants: [
      { id: "var-5", product_id: "prod-2", size: "M", color: "Rust Red", color_hex: "#8B2500", sku: "BND-M-RED", price: null, stock_quantity: 8 },
      { id: "var-6", product_id: "prod-2", size: "L", color: "Rust Red", color_hex: "#8B2500", sku: "BND-L-RED", price: null, stock_quantity: 12 },
      { id: "var-7", product_id: "prod-2", size: "XL", color: "Rust Red", color_hex: "#8B2500", sku: "BND-XL-RED", price: null, stock_quantity: 6 },
    ],
    product_images: [
      { id: "img-3", product_id: "prod-2", url: "/demo/bandhani-1.jpg", alt_text: "Rust Red Bandhani Anarkali", position: 1 },
      { id: "img-4", product_id: "prod-2", url: "/demo/bandhani-2.jpg", alt_text: "Rust Red Bandhani Detail", position: 2 },
    ],
  },
  {
    id: "prod-3",
    name: "Sage Green Linen Tunic",
    slug: "sage-green-linen-tunic",
    description: "A contemporary tunic in pure linen with subtle block-print borders. The earthy sage tone transitions effortlessly from desk to dinner, while the relaxed fit offers unrestricted movement.",
    price: 1899,
    compare_at_price: null,
    category_id: "cat-3",
    material: "100% Linen, Block-printed",
    care_instructions: "Machine wash gentle cycle. Tumble dry low. Warm iron.",
    is_featured: true,
    created_at: "2026-05-03T00:00:00Z",
    category: demoCategories[2],
    product_variants: [
      { id: "var-8", product_id: "prod-3", size: "S", color: "Sage Green", color_hex: "#8A9A7C", sku: "LIN-S-SGE", price: null, stock_quantity: 22 },
      { id: "var-9", product_id: "prod-3", size: "M", color: "Sage Green", color_hex: "#8A9A7C", sku: "LIN-M-SGE", price: null, stock_quantity: 30 },
      { id: "var-10", product_id: "prod-3", size: "L", color: "Sage Green", color_hex: "#8A9A7C", sku: "LIN-L-SGE", price: null, stock_quantity: 25 },
    ],
    product_images: [
      { id: "img-5", product_id: "prod-3", url: "/demo/linen-1.jpg", alt_text: "Sage Green Linen Tunic", position: 1 },
    ],
  },
  {
    id: "prod-4",
    name: "Indigo Kalamkari Straight Kurti",
    slug: "indigo-kalamkari-straight-kurti",
    description: "Intricate Kalamkari hand-painting in deep indigo on pure cotton. Each motif tells a story from Indian mythology, rendered in the ancient art form that dates back over 3000 years.",
    price: 3299,
    compare_at_price: 4499,
    category_id: "cat-1",
    material: "Handwoven Cotton, Kalamkari print",
    care_instructions: "Dry clean preferred. If washing, use mild detergent and cold water separately.",
    is_featured: true,
    created_at: "2026-05-04T00:00:00Z",
    category: demoCategories[0],
    product_variants: [
      { id: "var-11", product_id: "prod-4", size: "S", color: "Indigo", color_hex: "#1B2F55", sku: "KLM-S-IND", price: null, stock_quantity: 5 },
      { id: "var-12", product_id: "prod-4", size: "M", color: "Indigo", color_hex: "#1B2F55", sku: "KLM-M-IND", price: null, stock_quantity: 12 },
      { id: "var-13", product_id: "prod-4", size: "L", color: "Indigo", color_hex: "#1B2F55", sku: "KLM-L-IND", price: null, stock_quantity: 14 },
      { id: "var-14", product_id: "prod-4", size: "XL", color: "Indigo", color_hex: "#1B2F55", sku: "KLM-XL-IND", price: null, stock_quantity: 7 },
    ],
    product_images: [
      { id: "img-6", product_id: "prod-4", url: "/demo/kalamkari-1.jpg", alt_text: "Indigo Kalamkari Kurti", position: 1 },
    ],
  },
  {
    id: "prod-5",
    name: "Blush Pink Organza Festive Kurti",
    slug: "blush-pink-organza-festive-kurti",
    description: "Delicate organza with zari embroidery and sequin accents. Designed for weddings and celebrations, this ethereal piece catches every light with its subtle shimmer.",
    price: 5999,
    compare_at_price: 7999,
    category_id: "cat-1",
    material: "Organza, Zari embroidery",
    care_instructions: "Dry clean only. Store in muslin cloth. Avoid perfumes directly on fabric.",
    is_featured: true,
    created_at: "2026-05-05T00:00:00Z",
    category: demoCategories[0],
    product_variants: [
      { id: "var-15", product_id: "prod-5", size: "M", color: "Blush Pink", color_hex: "#E8B4B8", sku: "ORG-M-BLP", price: null, stock_quantity: 3 },
      { id: "var-16", product_id: "prod-5", size: "L", color: "Blush Pink", color_hex: "#E8B4B8", sku: "ORG-L-BLP", price: null, stock_quantity: 8 },
      { id: "var-17", product_id: "prod-5", size: "XL", color: "Blush Pink", color_hex: "#E8B4B8", sku: "ORG-XL-BLP", price: null, stock_quantity: 5 },
    ],
    product_images: [
      { id: "img-7", product_id: "prod-5", url: "/demo/organza-1.jpg", alt_text: "Blush Pink Organza Kurti", position: 1 },
    ],
  },
  {
    id: "prod-6",
    name: "Teal Blue Mirror Work Tunic",
    slug: "teal-blue-mirror-work-tunic",
    description: "Hand-stitched mirror work (shisha) embroidery on a rich teal base. This traditional Gujarati craft technique creates a stunning interplay of light and texture.",
    price: 2199,
    compare_at_price: null,
    category_id: "cat-3",
    material: "Cotton Silk, Mirror embroidery",
    care_instructions: "Hand wash separately. Do not bleach. Iron inside out.",
    is_featured: false,
    created_at: "2026-05-10T00:00:00Z",
    category: demoCategories[2],
    product_variants: [
      { id: "var-18", product_id: "prod-6", size: "S", color: "Teal Blue", color_hex: "#005C5E", sku: "MIR-S-TBL", price: null, stock_quantity: 18 },
      { id: "var-19", product_id: "prod-6", size: "M", color: "Teal Blue", color_hex: "#005C5E", sku: "MIR-M-TBL", price: null, stock_quantity: 25 },
      { id: "var-20", product_id: "prod-6", size: "L", color: "Teal Blue", color_hex: "#005C5E", sku: "MIR-L-TBL", price: null, stock_quantity: 20 },
      { id: "var-21", product_id: "prod-6", size: "XL", color: "Teal Blue", color_hex: "#005C5E", sku: "MIR-XL-TBL", price: null, stock_quantity: 12 },
    ],
    product_images: [
      { id: "img-8", product_id: "prod-6", url: "/demo/mirror-1.jpg", alt_text: "Teal Blue Mirror Work Tunic", position: 1 },
    ],
  },
  {
    id: "prod-7",
    name: "Mustard Yellow Printed Palazzo Set",
    slug: "mustard-yellow-printed-palazzo-set",
    description: "A coordinated set featuring a straight kurti and wide-legged palazzos in matching block print. The mustard yellow is hand-dyed using natural turmeric for an authentic, eco-friendly finish.",
    price: 3599,
    compare_at_price: 4599,
    category_id: "cat-4",
    material: "Pure Cotton, Natural dyes",
    care_instructions: "Machine wash cold with similar colors. Dry in shade to preserve color.",
    is_featured: false,
    created_at: "2026-05-12T00:00:00Z",
    category: demoCategories[3],
    product_variants: [
      { id: "var-22", product_id: "prod-7", size: "S", color: "Mustard Yellow", color_hex: "#DFB740", sku: "PLZ-S-MUS", price: null, stock_quantity: 10 },
      { id: "var-23", product_id: "prod-7", size: "M", color: "Mustard Yellow", color_hex: "#DFB740", sku: "PLZ-M-MUS", price: null, stock_quantity: 15 },
      { id: "var-24", product_id: "prod-7", size: "L", color: "Mustard Yellow", color_hex: "#DFB740", sku: "PLZ-L-MUS", price: null, stock_quantity: 12 },
    ],
    product_images: [
      { id: "img-9", product_id: "prod-7", url: "/demo/palazzo-1.jpg", alt_text: "Mustard Yellow Palazzo Set", position: 1 },
    ],
  },
  {
    id: "prod-8",
    name: "White Handloom Cotton Anarkali",
    slug: "white-handloom-cotton-anarkali",
    description: "Pure handloom cotton Anarkali with subtle jaal pattern. The lightweight fabric makes it perfect for summer weddings and daytime festivities. Features a delicate A-line flare with intricate stitch detailing at the neckline.",
    price: 4299,
    compare_at_price: null,
    category_id: "cat-2",
    material: "Handloom Cotton",
    care_instructions: "Dry clean recommended. Iron when slightly damp for best results.",
    is_featured: false,
    created_at: "2026-05-15T00:00:00Z",
    category: demoCategories[1],
    product_variants: [
      { id: "var-25", product_id: "prod-8", size: "M", color: "White", color_hex: "#FFFFFF", sku: "HAN-M-WHT", price: null, stock_quantity: 7 },
      { id: "var-26", product_id: "prod-8", size: "L", color: "White", color_hex: "#FFFFFF", sku: "HAN-L-WHT", price: null, stock_quantity: 11 },
      { id: "var-27", product_id: "prod-8", size: "XL", color: "White", color_hex: "#FFFFFF", sku: "HAN-XL-WHT", price: null, stock_quantity: 4 },
    ],
    product_images: [
      { id: "img-10", product_id: "prod-8", url: "/demo/handloom-1.jpg", alt_text: "White Handloom Cotton Anarkali", position: 1 },
    ],
  },
]

export function getDemoProductBySlug(slug: string): Product | null {
  return demoProducts.find((p) => p.slug === slug) ?? null
}

export function getDemoProducts(filters?: { category?: string; query?: string; page?: number; pageSize?: number }): Product[] {
  let filtered = [...demoProducts]
  if (filters?.category) {
    filtered = filtered.filter((p) => p.category_id === filters.category)
  }
  if (filters?.query) {
    const q = filters.query.toLowerCase()
    filtered = filtered.filter((p) => p.name.toLowerCase().includes(q))
  }
  return filtered
}

export function getDemoFeaturedProducts(): Product[] {
  return demoProducts.filter((p) => p.is_featured).slice(0, 4)
}