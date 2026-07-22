import { notFound } from "next/navigation"
import Link from "next/link"
import type { Metadata } from "next"
import { Badge } from "@/components/ui/badge"
import { Header } from "@/components/header"
import { ProductGallery } from "@/components/product/product-gallery"
import { getProductBySlug } from "@/lib/queries/products"
import { AddToCartButton } from "@/components/product/add-to-cart-button"
import { WishlistButton } from "@/components/product/wishlist-button"
import { ReviewSection } from "@/components/review/review-section"
import { ProductActions } from "@/components/product/product-actions"
import { BulkEnquiry } from "@/components/bulk-enquiry"
import { RecentlyViewedTracker } from "@/components/product/recently-viewed-tracker"
import { Check } from "lucide-react"

export const dynamic = "force-dynamic"

function formatPrice(amount: number) {
  return "₹" + amount.toLocaleString("en-IN")
}

type Props = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const product = await getProductBySlug(slug)
  if (!product) return { title: "Product Not Found — Viraasat" }
  return {
    title: `${product.name} — Viraasat`,
    description: product.description ?? `Shop ${product.name} at Viraasat. ${product.material ? `Made from ${product.material}.` : ""} Ethnic elegance for every occasion.`,
    openGraph: {
      title: product.name,
      description: product.description ?? undefined,
      images: product.product_images?.[0]?.url ? [{ url: product.product_images[0].url }] : undefined,
    },
  }
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params
  const product = await getProductBySlug(slug)

  if (!product) {
    notFound()
  }

  const images = product.product_images ?? []
  const variants = product.product_variants ?? []
  const sizes = [...new Set(variants.map((v) => v.size))]
  const colors = [...new Set(variants.map((v) => v.color))]
  const hasDiscount = product.compare_at_price && product.compare_at_price > product.price
  const inStock = variants.some((v) => v.stock_quantity > 0)

  return (
    <div className="flex flex-col flex-1">
      <Header />

      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <Link href="/products" className="inline-flex items-center gap-1.5 text-sm text-[#6B6B6B] dark:text-[#9C9C9C] hover:text-[#800020] dark:hover:text-[#B8860B] mb-6 transition-colors font-medium">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5m7-7-7 7 7 7"/></svg>
            Back to shop
          </Link>

          <div className="grid md:grid-cols-2 gap-8 lg:gap-14">
            <div className="space-y-4">
              {images.length > 0 ? (
                <ProductGallery images={images} name={product.name} />
              ) : (
                <div className="aspect-[4/5] bg-gradient-to-br from-[#800020]/10 via-[#C5A028]/5 to-[#800020]/5 dark:from-[#800020]/30 dark:via-[#B8860B]/20 dark:to-[#800020]/20 rounded-xl flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(197, 160, 40, 0.15) 1px, transparent 0)', backgroundSize: '20px 20px' }} />
                  <div className="text-center">
                    <span className="font-heading text-6xl font-bold text-[#800020]/40 dark:text-[#B8860B]/40 drop-shadow-sm">{product.name.split(" ").slice(0, 2).map((w: string) => w[0]).join("")}</span>
                    <p className="text-sm text-[#800020]/60 dark:text-[#B8860B]/60 mt-3 font-medium">{product.category?.name || "Kurti"}</p>
                  </div>
                  <span className="absolute bottom-4 left-4 text-[10px] text-[#800020]/30 dark:text-[#B8860B]/30 font-medium uppercase tracking-[0.2em]">वि rasaath</span>
                </div>
              )}
            </div>

            <div className="space-y-6 lg:sticky lg:top-24 lg:self-start">
              <div>
                {product.category && (
                  <p className="text-xs text-[#800020] dark:text-[#B8860B] font-medium tracking-[0.2em] uppercase mb-2">{product.category.name}</p>
                )}
                <h1 className="font-heading text-3xl text-[#333] dark:text-[#F0EDE8] leading-tight">{product.name}</h1>
                <div className="flex items-center gap-3 mt-4">
                  <span className="text-2xl font-bold text-[#333] dark:text-[#F0EDE8]">{formatPrice(product.price)}</span>
                  {hasDiscount && (
                    <>
                      <span className="text-lg text-[#6B6B6B] dark:text-[#9C9C9C] line-through">{formatPrice(product.compare_at_price!)}</span>
                      <Badge variant="destructive" className="text-xs font-medium bg-[#800020]/10 text-[#800020] dark:text-[#B8860B]">
                        {Math.round((1 - product.price / product.compare_at_price!) * 100)}% OFF
                      </Badge>
                    </>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-3">
                  {inStock ? (
                    <span className="inline-flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                      <Check className="w-3.5 h-3.5" /> In Stock
                    </span>
                  ) : (
                    <span className="text-xs text-[#800020] dark:text-[#B8860B] font-medium">Out of Stock</span>
                  )}
                </div>
                {product.material && (
                  <p className="text-sm text-[#6B6B6B] dark:text-[#9C9C9C] mt-3">
                    <span className="font-medium text-[#333] dark:text-[#F0EDE8]">Material:</span> {product.material}
                  </p>
                )}
              </div>

              <div className="border-t border-[#E5E0DB] dark:border-[#333]" />

              {colors.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-[#333] dark:text-[#F0EDE8] mb-2">
                    Color: <span className="text-[#6B6B6B] dark:text-[#9C9C9C] font-normal">{colors[0]}</span>
                  </p>
                  {variants.filter((v) => v.color_hex).length > 0 && (
                    <div className="flex gap-2">
                      {[...new Map(variants.filter(v => v.color_hex).map(v => [v.color, v])).values()].map((v) => (
                        <div
                          key={v.color}
                          className="w-8 h-8 rounded-full border-2 border-[#E5E0DB] dark:border-[#444] ring-offset-2 ring-offset-white dark:ring-offset-[#1A1A1A] cursor-pointer hover:ring-2 ring-[#C5A028] transition-all"
                          style={{ backgroundColor: v.color_hex! }}
                          title={v.color}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {sizes.length > 0 && <ProductActions product={product} variants={variants} />}

              {!sizes.length && (
                <div className="space-y-3 pt-2">
                  <AddToCartButton product={product} />
                  <WishlistButton product={product} />
                  <BulkEnquiry productName={product.name} />
                </div>
              )}

              {product.description && (
                <div>
                  <h3 className="text-sm font-semibold text-[#333] dark:text-[#F0EDE8] mb-2">Description</h3>
                  <p className="text-sm text-[#6B6B6B] dark:text-[#9C9C9C] leading-relaxed">{product.description}</p>
                </div>
              )}

              {product.care_instructions && (
                <div>
                  <h3 className="text-sm font-semibold text-[#333] dark:text-[#F0EDE8] mb-2">Care Instructions</h3>
                  <p className="text-sm text-[#6B6B6B] dark:text-[#9C9C9C]">{product.care_instructions}</p>
                </div>
              )}
            </div>
          </div>

          <div className="mt-16 max-w-2xl">
            <ReviewSection productId={product.id} />
          </div>

          <RecentlyViewedTracker product={product} />
        </div>
      </main>
    </div>
  )
}
