"use client"

import { useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion } from "motion/react"
import { Heart, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Header } from "@/components/header"
import { ProductCard } from "@/components/product/product-card"
import { useWishlistStore } from "@/lib/stores/wishlist-store"
import { useAuth } from "@/lib/context/auth-context"

export default function WishlistPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const { items, loading, fetchWishlist } = useWishlistStore()

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login")
      return
    }
    if (user) {
      fetchWishlist(user.id)
    }
  }, [user, authLoading, fetchWishlist, router])

  if (authLoading || !user) {
    return (
      <div className="flex flex-col flex-1">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <p className="text-[#9C9C9C]">Loading...</p>
        </main>
      </div>
    )
  }

  return (
    <div className="flex flex-col flex-1">
      <Header />

      <main className="flex-1 px-6 py-8 max-w-7xl mx-auto w-full">
        <div className="mb-8">
          <Link href="/products" className="text-sm text-[#6B6B6B] dark:text-[#9C9C9C] hover:text-[#800020] dark:hover:text-[#B8860B] mb-6 inline-flex items-center gap-1 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Continue Shopping
          </Link>
          <div className="flex items-center gap-3 mt-2">
            <Heart className="w-6 h-6 text-[#800020] dark:text-[#B8860B]" />
            <h1 className="font-heading text-3xl text-[#333] dark:text-[#F0EDE8]">My Wishlist</h1>
          </div>
          <div className="w-12 h-0.5 bg-[#C5A028] mt-3" />
        </div>

        {loading ? (
          <div className="text-center py-24 text-[#9C9C9C]">Loading wishlist...</div>
        ) : items.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-24"
          >
            <Heart className="w-16 h-16 mx-auto text-[#E5E0DB] dark:text-[#333] mb-4" />
            <p className="text-[#6B6B6B] dark:text-[#9C9C9C] mb-6">Your wishlist is empty</p>
            <Button onClick={() => router.push("/products")} className="bg-[#800020] hover:bg-[#A00028] dark:bg-[#B8860B] dark:hover:bg-[#D4A020] text-white rounded-full">
              Discover Products
            </Button>
          </motion.div>
        ) : (
          <>
            <p className="text-sm text-[#6B6B6B] dark:text-[#9C9C9C] mb-6">{items.length} items</p>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-8">
              {items.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  )
}
