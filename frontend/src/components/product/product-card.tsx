"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion } from "motion/react"
import { Heart, ShoppingBag } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/lib/context/auth-context"
import { useWishlistStore } from "@/lib/stores/wishlist-store"
import { useCartStore } from "@/lib/stores/cart-store"
import { useRouter } from "next/navigation"
import type { Product } from "@/types/product"
import { toast } from "sonner"

function formatPrice(amount: number) {
  return "₹" + amount.toLocaleString("en-IN")
}

const gradients = [
  "from-[#800020]/10 via-[#C5A028]/5 to-[#800020]/5 dark:from-[#800020]/30 dark:via-[#B8860B]/20 dark:to-[#800020]/20",
  "from-[#C5A028]/10 via-[#800020]/5 to-[#C5A028]/5 dark:from-[#B8860B]/30 dark:via-[#800020]/20 dark:to-[#B8860B]/20",
  "from-[#800020]/5 via-[#C5A028]/10 to-[#800020]/8 dark:from-[#800020]/20 dark:via-[#B8860B]/30 dark:to-[#800020]/20",
  "from-[#6B4423]/10 via-[#C5A028]/5 to-[#800020]/5 dark:from-[#6B4423]/30 dark:via-[#B8860B]/20 dark:to-[#800020]/20",
  "from-[#C5A028]/5 via-[#800020]/8 to-[#C5A028]/5 dark:from-[#B8860B]/20 dark:via-[#800020]/30 dark:to-[#B8860B]/20",
  "from-[#800020]/8 via-[#6B4423]/5 to-[#C5A028]/8 dark:from-[#800020]/30 dark:via-[#6B4423]/20 dark:to-[#B8860B]/30",
]

function ProductImage({ product }: { product: Product }) {
  const [failed, setFailed] = useState(false)
  const image = product.product_images?.[0]
  const gradientIndex = product.name.length % gradients.length
  const initials = product.name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")

  if (!image || failed) {
    return (
      <div className={`w-full h-full flex flex-col items-center justify-center bg-gradient-to-br ${gradients[gradientIndex]} relative overflow-hidden`}>
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: `radial-gradient(circle at 1px 1px, rgba(197, 160, 40, 0.15) 1px, transparent 0)`, backgroundSize: '20px 20px' }} />
        <span className="font-heading text-5xl font-bold text-[#800020]/40 dark:text-[#B8860B]/40 mb-2">{initials}</span>
        <span className="text-xs font-medium text-[#800020]/60 dark:text-[#B8860B]/60 tracking-wide uppercase px-3 py-1 rounded-full bg-white/30 dark:bg-black/20 backdrop-blur-sm">{product.category?.name || "Kurti"}</span>
        <span className="absolute bottom-3 left-3 text-[10px] text-[#800020]/30 dark:text-[#B8860B]/30 font-medium uppercase tracking-[0.2em]">वि rasaath</span>
      </div>
    )
  }

  return (
    <Image
      src={image.url}
      alt={image.alt_text ?? product.name}
      fill
      className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
      sizes="(max-width: 768px) 50vw, 25vw"
      onError={() => setFailed(true)}
    />
  )
}

export function ProductCard({ product }: { product: Product }) {
  const { user } = useAuth()
  const router = useRouter()
  const { isWishlisted, toggleItem } = useWishlistStore()
  const { addItem, openCart } = useCartStore()
  const lowestPrice = product.product_variants?.length
    ? Math.min(...product.product_variants.map((v) => v.price ?? product.price))
    : product.price
  const hasDiscount = product.compare_at_price && product.compare_at_price > product.price
  const wishlisted = isWishlisted(product.id)

  async function handleWishlist(e: React.MouseEvent) {
    e.preventDefault()
    if (!user) { router.push("/login"); return }
    await toggleItem(user.id, product)
  }

  async function handleQuickAdd(e: React.MouseEvent) {
    e.preventDefault()
    const firstVariant = product.product_variants?.find(v => v.stock_quantity > 0)
    const variantId = firstVariant?.id
    await addItem(user?.id ?? null, product, variantId)
    const sizeInfo = variantId && firstVariant ? ` (${firstVariant.size})` : ""
    toast.success(`Added${sizeInfo} to cart`, {
      action: { label: "View", onClick: () => openCart() },
    })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <Link href={`/products/${product.slug}`} className="group block">
        <div className="relative aspect-[3/4] bg-[#F5F0EB] dark:bg-[#242424] overflow-hidden rounded-xl mb-4 shadow-sm group-hover:shadow-xl group-hover:shadow-[#800020]/10 dark:group-hover:shadow-[#B8860B]/10 transition-all duration-500">
          <ProductImage product={product} />
          {hasDiscount && (
            <Badge className="absolute top-3 left-3 bg-[#800020]/90 dark:bg-[#B8860B]/90 text-white text-xs font-medium px-2.5 py-1 rounded-full">
              {Math.round((1 - product.price / product.compare_at_price!) * 100)}% OFF
            </Badge>
          )}
          <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
            <button
              onClick={handleWishlist}
              className="p-2.5 rounded-full bg-white/90 dark:bg-[#242424]/90 backdrop-blur-sm hover:bg-white dark:hover:bg-[#242424] shadow-sm transition-all hover:shadow-md"
              aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
            >
              <Heart
                className={`w-4 h-4 transition-colors ${
                  wishlisted ? "fill-[#800020] text-[#800020] dark:fill-[#B8860B] dark:text-[#B8860B]" : "text-[#6B6B6B] dark:text-[#9C9C9C]"
                }`}
              />
            </button>
          </div>
          <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0 pointer-events-none group-hover:pointer-events-auto">
            <button
              onClick={handleQuickAdd}
              className="w-full py-2.5 rounded-full bg-white/95 dark:bg-[#242424]/95 text-[#333] dark:text-[#F0EDE8] text-sm font-medium hover:bg-white dark:hover:bg-[#242424] transition-colors flex items-center justify-center gap-2 shadow-sm"
            >
              <ShoppingBag className="w-4 h-4" /> Quick Add
            </button>
          </div>
        </div>
        <div className="px-0.5">
          <p className="text-[10px] text-[#6B6B6B] dark:text-[#9C9C9C] mb-1 tracking-[0.15em] uppercase font-medium">{product.category?.name}</p>
          <h3 className="font-heading text-sm leading-snug mb-1.5 group-hover:text-[#800020] dark:group-hover:text-[#B8860B] transition-colors line-clamp-1">
            {product.name}
          </h3>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-[#333] dark:text-[#F0EDE8] text-sm">{formatPrice(lowestPrice)}</span>
            {hasDiscount && (
              <span className="text-xs text-[#6B6B6B] dark:text-[#9C9C9C] line-through">{formatPrice(product.compare_at_price!)}</span>
            )}
          </div>
          {product.product_variants?.length > 0 && (
            <div className="flex gap-1.5 mt-2 flex-wrap">
              {[...new Set(product.product_variants.map((v) => v.size))].map((size) => (
                <span key={size} className="text-[10px] text-[#6B6B6B] dark:text-[#9C9C9C] bg-[#F5F0EB] dark:bg-[#2A2A2A] px-2 py-0.5 rounded-md font-medium">
                  {size}
                </span>
              ))}
            </div>
          )}
        </div>
      </Link>
    </motion.div>
  )
}
