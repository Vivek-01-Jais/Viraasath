"use client"

import { useEffect, useRef } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { motion } from "motion/react"
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft, LogIn } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Header } from "@/components/header"
import { PageSkeleton } from "@/components/ui/skeleton"
import { useCartStore } from "@/lib/stores/cart-store"
import { useAuth } from "@/lib/context/auth-context"

function formatPrice(amount: number) {
  return "₹" + amount.toLocaleString("en-IN")
}

export default function CartPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const { items, loading, fetchCart, removeItem, updateQuantity, totalPrice, initLocalCart } = useCartStore()
  const initDone = useRef(false)

  useEffect(() => {
    if (authLoading || initDone.current) return
    initDone.current = true
    if (user) {
      fetchCart(user.id)
    } else {
      initLocalCart()
    }
  }, [user, authLoading, fetchCart, initLocalCart])

  if (authLoading) {
    return (
      <div className="flex flex-col flex-1">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <PageSkeleton />
        </main>
      </div>
    )
  }

  return (
    <div className="flex flex-col flex-1">
      <Header />

      <main className="flex-1 px-6 py-8 max-w-4xl mx-auto w-full">
        <div className="mb-8">
          <Link href="/products" className="text-sm text-[#6B6B6B] dark:text-[#9C9C9C] hover:text-[#800020] dark:hover:text-[#B8860B] mb-6 inline-flex items-center gap-1 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Continue Shopping
          </Link>
          <h1 className="font-heading text-3xl mt-2 text-[#333] dark:text-[#F0EDE8]">Shopping Cart</h1>
          <div className="w-12 h-0.5 bg-[#C5A028] mt-3" />
        </div>

        {loading ? (
          <div className="text-center py-24"><PageSkeleton /></div>
        ) : items.length === 0 ? (
          <div className="text-center py-24">
            <ShoppingBag className="w-16 h-16 mx-auto text-[#E5E0DB] dark:text-[#333] mb-4" />
            <p className="text-[#6B6B6B] dark:text-[#9C9C9C] mb-6">Your cart is empty</p>
            <Button onClick={() => router.push("/products")} className="bg-[#800020] hover:bg-[#A00028] dark:bg-[#B8860B] dark:hover:bg-[#D4A020] text-white rounded-full">
              Browse Products
            </Button>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {items.map((item, index) => {
                const price = item.product.product_variants?.find(
                  (v) => v.id === item.variant_id
                )?.price ?? item.product.price
                const image = item.product.product_images?.[0]

                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex gap-4 p-4 border border-[#E5E0DB] dark:border-[#333] rounded-xl hover:shadow-sm transition-shadow"
                  >
                    <div className="w-24 h-28 bg-[#F5F0EB] dark:bg-[#242424] rounded-lg overflow-hidden shrink-0">
                      {image ? (
                        <Image
                          src={image.url}
                          alt={image.alt_text ?? item.product.name}
                          width={96}
                          height={112}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[#9C9C9C] text-xs font-heading">
                          {item.product.name.split(" ").map((w) => w[0]).join("")}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <Link href={`/products/${item.product.slug}`} className="text-sm font-medium text-[#333] dark:text-[#F0EDE8] hover:text-[#800020] dark:hover:text-[#B8860B] transition-colors">
                        {item.product.name}
                      </Link>
                      <p className="text-sm text-[#6B6B6B] dark:text-[#9C9C9C] mt-1">{formatPrice(price)} each</p>
                      <div className="flex items-center gap-2 mt-3">
                        <button
                          onClick={() => updateQuantity(user?.id ?? null, item.id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                          className="p-2 rounded-lg border border-[#E5E0DB] dark:border-[#333] hover:bg-[#F5F0EB] dark:hover:bg-[#242424] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="text-sm w-8 text-center font-medium text-[#333] dark:text-[#F0EDE8]">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(user?.id ?? null, item.id, item.quantity + 1)}
                          className="p-2 rounded-lg border border-[#E5E0DB] dark:border-[#333] hover:bg-[#F5F0EB] dark:hover:bg-[#242424] transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-semibold text-[#333] dark:text-[#F0EDE8]">{formatPrice(price * item.quantity)}</p>
                      <button
                        onClick={() => removeItem(user?.id ?? null, item.id)}
                        className="p-2 text-xs text-[#6B6B6B] dark:text-[#9C9C9C] hover:text-[#800020] dark:hover:text-[#B8860B] mt-2 inline-flex items-center gap-1 transition-colors rounded-lg"
                      >
                        <Trash2 className="w-3 h-3" /> Remove
                      </button>
                    </div>
                  </motion.div>
                )
              })}
            </div>

            <div className="lg:col-span-1">
              <div className="border border-[#E5E0DB] dark:border-[#333] rounded-xl p-5 space-y-3 sticky top-8">
                <h3 className="font-heading text-lg text-[#333] dark:text-[#F0EDE8]">Order Summary</h3>
                <div className="border-t border-[#E5E0DB] dark:border-[#333]" />
                <div className="flex justify-between text-sm">
                  <span className="text-[#6B6B6B] dark:text-[#9C9C9C]">Subtotal</span>
                  <span className="font-semibold text-[#333] dark:text-[#F0EDE8]">{formatPrice(totalPrice())}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#6B6B6B] dark:text-[#9C9C9C]">Shipping</span>
                  <span className="text-[#6B6B6B] dark:text-[#9C9C9C]">Calculated at checkout</span>
                </div>
                <div className="border-t border-[#E5E0DB] dark:border-[#333]" />
                {user ? (
                  <Button className="w-full bg-[#800020] hover:bg-[#A00028] dark:bg-[#B8860B] dark:hover:bg-[#D4A020] text-white rounded-full h-12" size="lg" onClick={() => router.push("/checkout")}>
                    Proceed to Checkout
                  </Button>
                ) : (
                  <Button className="w-full bg-[#800020] hover:bg-[#A00028] dark:bg-[#B8860B] dark:hover:bg-[#D4A020] text-white rounded-full h-12" size="lg" onClick={() => router.push("/login")}>
                    <LogIn className="w-4 h-4 mr-1" /> Sign in to Checkout
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
