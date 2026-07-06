"use client"

import { useEffect, useMemo, useRef } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion } from "motion/react"
import { Heart, ArrowLeft, TrendingDown, RotateCcw, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Header } from "@/components/header"
import { ProductCard } from "@/components/product/product-card"
import { useWishlistStore } from "@/lib/stores/wishlist-store"
import { useAuth } from "@/lib/context/auth-context"
import { loadSnapshots, saveSnapshots, detectChanges, buildSnapshots } from "@/lib/wishlist-snapshot"
import type { ChangeInfo } from "@/lib/wishlist-snapshot"
import { toast } from "sonner"

const changeConfig: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  price_drop: { label: "Price Dropped", icon: <TrendingDown className="w-3 h-3" />, color: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400" },
  back_in_stock: { label: "Back in Stock", icon: <RotateCcw className="w-3 h-3" />, color: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400" },
  price_increase: { label: "Price Increased", icon: <TrendingDown className="w-3 h-3 rotate-180" />, color: "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400" },
  out_of_stock: { label: "Out of Stock", icon: <AlertTriangle className="w-3 h-3" />, color: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400" },
}

export default function WishlistPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const { items, loading, fetchWishlist } = useWishlistStore()
  const notified = useRef(false)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login")
      return
    }
    if (user) {
      fetchWishlist(user.id)
    }
  }, [user, authLoading, fetchWishlist, router])

  const changes = useMemo(() => {
    if (items.length === 0) return {}
    const snapshots = loadSnapshots()
    return detectChanges(items, snapshots)
  }, [items])

  useEffect(() => {
    if (notified.current || items.length === 0) return
    const changeCount = Object.keys(changes).length
    if (changeCount === 0) return

    notified.current = true
    const changeLabels = Object.values(changes).map((c) => changeConfig[c.type]?.label).filter(Boolean)
    toast(`${changeCount} wishlist update${changeCount > 1 ? "s" : ""}`, {
      description: changeLabels.slice(0, 3).join(", ") + (changeLabels.length > 3 ? " and more" : ""),
      duration: 6000,
    })
  }, [changes, items])

  useEffect(() => {
    if (items.length === 0) return
    const snapshots = buildSnapshots(items)
    saveSnapshots(snapshots)
  }, [items])

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
            <p className="text-sm text-[#6B6B6B] dark:text-[#9C9C9C] mb-6">{items.length} item{items.length > 1 ? "s" : ""}</p>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-8">
              {items.map((product) => {
                const change = changes[product.id]
                const cfg = change ? changeConfig[change.type] : null
                return (
                  <div key={product.id} className="relative">
                    {cfg && (
                      <span className={`absolute -top-1 -left-1 z-10 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium shadow-sm ${cfg.color}`}>
                        {cfg.icon} {cfg.label}
                      </span>
                    )}
                    <ProductCard product={product} />
                  </div>
                )
              })}
            </div>
          </>
        )}
      </main>
    </div>
  )
}
