"use client"

import { useEffect, useRef } from "react"
import { ShoppingBag } from "lucide-react"
import { toast } from "sonner"
import { checkAbandonedCart, dismissAbandonedReminder } from "@/lib/cart-activity"
import { useCartStore } from "@/lib/stores/cart-store"

export function AbandonedCartDetector() {
  const totalItems = useCartStore((s) => s.totalItems())
  const openCart = useCartStore((s) => s.openCart)
  const shown = useRef(false)

  useEffect(() => {
    if (shown.current) return
    if (totalItems === 0) return
    if (!checkAbandonedCart()) return

    shown.current = true
    dismissAbandonedReminder()

    const t = setTimeout(() => {
      toast("You left items in your cart!", {
        icon: <ShoppingBag className="w-4 h-4" />,
        description: `${totalItems} item${totalItems > 1 ? "s" : ""} waiting for you`,
        action: {
          label: "View Cart",
          onClick: () => openCart(),
        },
        duration: 8000,
      })
    }, 3000)

    return () => clearTimeout(t)
  }, [totalItems, openCart])

  return null
}
