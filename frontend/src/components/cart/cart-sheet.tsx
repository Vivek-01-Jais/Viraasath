"use client"

import { useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { AnimatePresence, motion } from "motion/react"
import { X, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCartStore } from "@/lib/stores/cart-store"
import { useAuth } from "@/lib/context/auth-context"

function formatPrice(amount: number) {
  return "₹" + amount.toLocaleString("en-IN")
}

export function CartSheet() {
  const { user } = useAuth()
  const router = useRouter()
  const { items, isOpen, loading, fetchCart, removeItem, updateQuantity, updateVariant, closeCart, totalItems, totalPrice, initLocalCart } = useCartStore()
  const userId = user?.id

  useEffect(() => {
    if (!isOpen) return
    if (user) {
      fetchCart(user.id)
    } else {
      initLocalCart()
    }
  }, [user, isOpen, fetchCart, initLocalCart])

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 z-40"
            onClick={closeCart}
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-white dark:bg-[#1A1A1A] z-50 flex flex-col shadow-xl"
          >
            <div className="flex items-center justify-between px-4 py-4 border-b border-[#E5E0DB] dark:border-[#333]">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-[#800020] dark:text-[#B8860B]" />
                <span className="font-heading font-semibold text-[#333] dark:text-[#F0EDE8]">Cart ({totalItems()})</span>
              </div>
              <button onClick={closeCart} className="p-2 hover:bg-[#F5F0EB] dark:hover:bg-[#242424] rounded-md text-[#6B6B6B] dark:text-[#9C9C9C]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-4">
              {loading ? (
                <div className="text-center text-[#9C9C9C] py-12">Loading...</div>
              ) : items.length === 0 ? (
                <div className="text-center py-12">
                  <ShoppingBag className="w-12 h-12 mx-auto text-[#E5E0DB] dark:text-[#333] mb-3" />
                  <p className="text-[#6B6B6B] dark:text-[#9C9C9C]">Your cart is empty</p>
                  <button
                    onClick={() => { closeCart(); router.push("/products") }}
                    className="inline-flex items-center justify-center rounded-full border border-[#E5E0DB] dark:border-[#333] bg-transparent hover:bg-[#F5F0EB] dark:hover:bg-[#242424] h-8 px-3 text-sm font-medium transition-colors text-[#6B6B6B] dark:text-[#9C9C9C] mt-2"
                  >
                    Continue Shopping
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {items.map((item) => {
                    const price = item.product.product_variants?.find(
                      (v) => v.id === item.variant_id
                    )?.price ?? item.product.price
                    const image = item.product.product_images?.[0]

                    return (
                      <motion.div
                        key={item.id}
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex gap-3 pb-4 border-b border-[#E5E0DB] dark:border-[#333] last:border-0"
                      >
                        <div className="w-20 h-24 bg-[#F5F0EB] dark:bg-[#242424] rounded-md overflow-hidden shrink-0">
                          {image ? (
                            <Image
                              src={image.url}
                              alt={image.alt_text ?? item.product.name}
                              width={80}
                              height={96}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[#9C9C9C] text-xs font-heading">
                              {item.product.name.split(" ").map((w: string) => w[0]).join("")}
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <Link
                            href={`/products/${item.product.slug}`}
                            className="text-sm font-medium line-clamp-1 text-[#333] dark:text-[#F0EDE8] hover:text-[#800020] dark:hover:text-[#B8860B]"
                            onClick={closeCart}
                          >
                            {item.product.name}
                          </Link>
                          <p className="text-sm text-[#6B6B6B] dark:text-[#9C9C9C] mt-0.5">{formatPrice(price)}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <button
                              onClick={() => userId && updateQuantity(userId, item.id, item.quantity - 1)}
                              disabled={item.quantity <= 1}
                              className="p-2 rounded border border-[#E5E0DB] dark:border-[#333] hover:bg-[#F5F0EB] dark:hover:bg-[#242424] text-[#6B6B6B] dark:text-[#9C9C9C] disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="text-sm w-6 text-center text-[#333] dark:text-[#F0EDE8]">{item.quantity}</span>
                            <button
                              onClick={() => userId && updateQuantity(userId, item.id, item.quantity + 1)}
                              className="p-2 rounded border border-[#E5E0DB] dark:border-[#333] hover:bg-[#F5F0EB] dark:hover:bg-[#242424] text-[#6B6B6B] dark:text-[#9C9C9C]"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                          {item.product.product_variants?.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {[...new Set(item.product.product_variants.map(v => v.size))].map(size => {
                                const variant = item.product.product_variants.find(v => v.size === size)
                                const isSelected = item.variant_id === variant?.id
                                const outOfStock = variant ? variant.stock_quantity === 0 : true
                                return (
                                  <button key={size} disabled={outOfStock}
                                    onClick={() => userId && updateVariant(userId, item.id, variant!.id)}
                                    className={`text-[9px] px-1.5 py-0.5 rounded font-medium transition-all ${
                                      outOfStock ? "text-[#9C9C9C] line-through bg-[#F5F0EB] dark:bg-[#242424]/50 cursor-not-allowed"
                                      : isSelected ? "bg-[#800020] dark:bg-[#B8860B] text-white"
                                      : "bg-[#F5F0EB] dark:bg-[#2A2A2A] text-[#6B6B6B] dark:text-[#9C9C9C] hover:bg-[#800020]/10 dark:hover:bg-[#B8860B]/20 cursor-pointer"
                                    }`}
                                  >{size}</button>
                                )
                              })}
                            </div>
                          )}
                        </div>
                        <button
                          onClick={() => userId && removeItem(userId, item.id)}
                          className="p-2 text-[#6B6B6B] dark:text-[#9C9C9C] hover:text-red-500 shrink-0 self-start"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </motion.div>
                    )
                  })}
                </div>
              )}
            </div>

            {items.length > 0 && (
              <div className="border-t border-[#E5E0DB] dark:border-[#333] px-4 py-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-[#6B6B6B] dark:text-[#9C9C9C]">Subtotal</span>
                  <span className="font-semibold text-[#333] dark:text-[#F0EDE8]">{formatPrice(totalPrice())}</span>
                </div>
                <p className="text-xs text-[#6B6B6B] dark:text-[#9C9C9C]">Shipping calculated at checkout</p>
                <Button className="w-full bg-[#800020] hover:bg-[#A00028] dark:bg-[#B8860B] dark:hover:bg-[#D4A020] text-white rounded-full" onClick={() => { closeCart(); router.push("/cart") }}>
                  View Cart
                </Button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
