"use client"

import { useEffect } from "react"
import { Heart } from "lucide-react"
import { useWishlistStore } from "@/lib/stores/wishlist-store"
import { useAuth } from "@/lib/context/auth-context"
import { useRouter } from "next/navigation"
import type { Product } from "@/types/product"

export function WishlistButton({
  product,
  className = "",
  iconOnly = false,
}: {
  product: Product
  className?: string
  iconOnly?: boolean
}) {
  const { user } = useAuth()
  const router = useRouter()
  const { isWishlisted, toggleItem, fetchWishlist } = useWishlistStore()

  useEffect(() => {
    if (user) {
      fetchWishlist(user.id)
    }
  }, [user, fetchWishlist])

  const wishlisted = isWishlisted(product.id)

  async function handleToggle() {
    if (!user) {
      router.push("/login")
      return
    }
    await toggleItem(user.id, product)
  }

  if (iconOnly) {
    return (
      <button
        onClick={handleToggle}
        className={`p-2 rounded-full bg-white/80 dark:bg-[#242424]/80 backdrop-blur-sm hover:bg-white dark:hover:bg-[#242424] transition-colors ${className}`}
        aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
      >
        <Heart
          className={`w-4 h-4 transition-colors ${
            wishlisted ? "fill-[#800020] text-[#800020] dark:fill-[#B8860B] dark:text-[#B8860B]" : "text-[#6B6B6B] dark:text-[#9C9C9C]"
          }`}
        />
      </button>
    )
  }

  return (
    <button
      onClick={handleToggle}
      className={`flex items-center justify-center gap-2 text-sm transition-colors w-full py-3 rounded-full border border-[#E5E0DB] dark:border-[#333] ${
        wishlisted ? "text-[#800020] dark:text-[#B8860B] border-[#800020] dark:border-[#B8860B]" : "text-[#6B6B6B] dark:text-[#9C9C9C] hover:text-[#800020] dark:hover:text-[#B8860B] hover:border-[#800020] dark:hover:border-[#B8860B]"
      } ${className}`}
    >
      <Heart
        className={`w-4 h-4 ${wishlisted ? "fill-[#800020] text-[#800020] dark:fill-[#B8860B] dark:text-[#B8860B]" : ""}`}
      />
      {wishlisted ? "Wishlisted" : "Add to Wishlist"}
    </button>
  )
}
