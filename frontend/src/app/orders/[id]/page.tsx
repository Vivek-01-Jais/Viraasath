"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { motion } from "motion/react"
import { CheckCircle, ArrowLeft, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Header } from "@/components/header"
import { createClient, isSupabaseAvailable } from "@/lib/supabase/client"
import { useAuth } from "@/lib/context/auth-context"
import { toast } from "sonner"

type OrderItem = {
  id: string
  product_name: string
  quantity: number
  unit_price: number
  total_price: number
  variant_size: string | null
  variant_color: string | null
}

type ShippingAddress = {
  full_name: string
  address_line1: string
  address_line2: string | null
  city: string
  state: string
  postal_code: string
  phone: string | null
}

type Order = {
  id: string
  order_number: string
  status: string
  payment_status: string
  total: number
  subtotal: number
  shipping_cost: number
  discount_amount: number
  coupon_code: string | null
  created_at: string
  items: OrderItem[]
  shipping_address: ShippingAddress
}

const STATUS_STEPS = ["confirmed", "shipped", "delivered"]
const STEP_LABELS: Record<string, string> = {
  confirmed: "Confirmed",
  shipped: "Shipped",
  delivered: "Delivered",
}

export default function OrderDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [cancelling, setCancelling] = useState(false)

  async function loadOrder() {
    if (!isSupabaseAvailable()) { setLoading(false); return }
    const supabase = createClient()
    const { data } = await supabase.from("orders").select("*").eq("id", params.id).maybeSingle()
    if (!data) { setError("Order not found"); setLoading(false); return }

    const { data: items } = await supabase.from("order_items").select("*").eq("order_id", params.id)
    const { data: address } = await supabase.from("addresses").select("*").eq("id", data.shipping_address_id).maybeSingle()

    setOrder({ ...data, items: items ?? [], shipping_address: address } as Order)
    setLoading(false)
  }

  useEffect(() => {
    if (!authLoading && !user) { router.push("/login"); return }
    if (user && params.id) loadOrder()
  }, [user, authLoading, params.id, router])

  async function handleCancel() {
    if (!confirm("Are you sure you want to cancel this order?")) return
    setCancelling(true)
    try {
      const supabase = createClient()
      const { error: err } = await supabase.from("orders").update({ status: "cancelled", payment_status: "refunded" }).eq("id", order!.id)
      if (err) throw err
      toast.success("Order cancelled")
      loadOrder()
    } catch (err) {
      toast.error("Failed to cancel order")
    } finally {
      setCancelling(false)
    }
  }

  if (authLoading || loading) {
    return <div className="flex flex-col flex-1"><Header /><main className="flex-1 flex items-center justify-center"><p className="text-[#9C9C9C]">Loading...</p></main></div>
  }

  if (error || !order) {
    return <div className="flex flex-col flex-1"><Header /><main className="flex-1 flex items-center justify-center"><p className="text-[#6B6B6B] dark:text-[#9C9C9C]">{error || "Order not found"}</p></main></div>
  }

  const currentStepIndex = STATUS_STEPS.indexOf(order.status)
  const isCancelled = order.status === "cancelled"

  return (
    <div className="flex flex-col flex-1">
      <Header />
      <main className="flex-1 px-6 py-8 max-w-3xl mx-auto w-full">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Link href="/orders" className="text-sm text-[#6B6B6B] dark:text-[#9C9C9C] hover:text-[#800020] dark:hover:text-[#B8860B] mb-6 inline-flex items-center gap-1 transition-colors">
            <ArrowLeft className="w-4 h-4" /> My Orders
          </Link>

          {isCancelled ? (
            <div className="text-center py-8">
              <XCircle className="w-16 h-16 mx-auto text-red-400 mb-4" />
              <h1 className="font-heading text-3xl text-[#333] dark:text-[#F0EDE8]">Order Cancelled</h1>
              <p className="text-[#6B6B6B] dark:text-[#9C9C9C] mt-2">{order.order_number}</p>
              <div className="w-12 h-0.5 bg-[#C5A028] mx-auto mt-4" />
            </div>
          ) : (
            <div className="text-center py-8">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200 }}>
                {order.status === "delivered" ? (
                  <CheckCircle className="w-16 h-16 mx-auto text-emerald-500 mb-4" />
                ) : (
                  <div className="w-16 h-16 mx-auto rounded-full bg-[#800020]/10 dark:bg-[#B8860B]/10 flex items-center justify-center mb-4">
                    <div className="w-4 h-4 rounded-full bg-[#800020] dark:bg-[#B8860B] animate-pulse" />
                  </div>
                )}
              </motion.div>
              <h1 className="font-heading text-3xl text-[#333] dark:text-[#F0EDE8]">
                {order.status === "delivered" ? "Delivered!" : "Order Placed"}
              </h1>
              <p className="text-[#6B6B6B] dark:text-[#9C9C9C] mt-2">Order #{order.order_number}</p>
              <div className="w-12 h-0.5 bg-[#C5A028] mx-auto mt-4" />
            </div>
          )}

          {!isCancelled && (
            <div className="mb-8 px-4">
              <div className="flex items-center justify-between max-w-md mx-auto">
                {STATUS_STEPS.map((step, i) => {
                  const isCompleted = i <= currentStepIndex
                  const isCurrent = i === currentStepIndex
                  return (
                    <div key={step} className="flex flex-col items-center">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                        isCompleted
                          ? "bg-[#800020] dark:bg-[#B8860B] text-white"
                          : "bg-[#E5E0DB] dark:bg-[#333] text-[#6B6B6B] dark:text-[#9C9C9C]"
                      } ${isCurrent ? "ring-4 ring-[#800020]/20 dark:ring-[#B8860B]/20" : ""}`}>
                        {isCompleted ? <CheckCircle className="w-5 h-5" /> : i + 1}
                      </div>
                      <p className={`text-xs mt-2 font-medium ${
                        isCompleted ? "text-[#800020] dark:text-[#B8860B]" : "text-[#6B6B6B] dark:text-[#9C9C9C]"
                      }`}>{STEP_LABELS[step]}</p>
                    </div>
                  )
                })}
              </div>
              <div className="relative max-w-md mx-auto mt-[-18px] z-[-1]">
                <div className="h-0.5 bg-[#E5E0DB] dark:bg-[#333] mx-[45px]" />
                <div className="h-0.5 bg-[#800020] dark:bg-[#B8860B] mx-[45px] transition-all" style={{ width: `${Math.max(0, currentStepIndex) * 50}%` }} />
              </div>
            </div>
          )}

          <div className="border border-[#E5E0DB] dark:border-[#333] rounded-xl p-5 space-y-3 mb-6">
            <div className="flex justify-between text-sm"><span className="text-[#6B6B6B] dark:text-[#9C9C9C]">Order Number</span><span className="font-medium text-[#333] dark:text-[#F0EDE8]">{order.order_number}</span></div>
            <div className="flex justify-between text-sm"><span className="text-[#6B6B6B] dark:text-[#9C9C9C]">Status</span><span className={`font-medium capitalize ${
              isCancelled ? "text-red-500" : order.status === "delivered" ? "text-emerald-600 dark:text-emerald-400" : "text-[#800020] dark:text-[#B8860B]"
            }`}>{order.status}</span></div>
            <div className="flex justify-between text-sm"><span className="text-[#6B6B6B] dark:text-[#9C9C9C]">Payment</span><span className={`font-medium capitalize ${
              order.payment_status === "paid" || order.payment_status === "refunded" ? "text-emerald-600 dark:text-emerald-400" : "text-[#C5A028]"
            }`}>{order.payment_status}</span></div>
            <div className="flex justify-between text-sm"><span className="text-[#6B6B6B] dark:text-[#9C9C9C]">Date</span><span className="font-medium text-[#333] dark:text-[#F0EDE8]">{new Date(order.created_at).toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })}</span></div>
          </div>

          <h2 className="font-heading text-lg text-[#333] dark:text-[#F0EDE8] mb-3">Items</h2>
          <div className="space-y-2 mb-6">
            {order.items.map((item) => (
              <div key={item.id} className="flex justify-between border border-[#E5E0DB] dark:border-[#333] rounded-xl p-3 text-sm">
                <div>
                  <p className="font-medium text-[#333] dark:text-[#F0EDE8]">{item.product_name}</p>
                  <p className="text-[#6B6B6B] dark:text-[#9C9C9C]">Qty: {item.quantity}{item.variant_size ? ` | Size: ${item.variant_size}` : ""}</p>
                </div>
                <p className="font-medium text-[#333] dark:text-[#F0EDE8]">₹{item.total_price.toLocaleString("en-IN")}</p>
              </div>
            ))}
          </div>

          <div className="border-t border-[#E5E0DB] dark:border-[#333] mb-4" />

          <div className="space-y-2 text-sm mb-6">
            <div className="flex justify-between"><span className="text-[#6B6B6B] dark:text-[#9C9C9C]">Subtotal</span><span className="text-[#333] dark:text-[#F0EDE8]">₹{order.subtotal.toLocaleString("en-IN")}</span></div>
            {order.discount_amount > 0 && (
              <div className="flex justify-between"><span className="text-[#6B6B6B] dark:text-[#9C9C9C]">Discount {order.coupon_code ? `(${order.coupon_code})` : ""}</span><span className="text-emerald-600 dark:text-emerald-400">-₹{order.discount_amount.toLocaleString("en-IN")}</span></div>
            )}
            <div className="flex justify-between"><span className="text-[#6B6B6B] dark:text-[#9C9C9C]">Shipping</span><span className="text-[#333] dark:text-[#F0EDE8]">{order.shipping_cost === 0 ? "Free" : `₹${order.shipping_cost.toLocaleString("en-IN")}`}</span></div>
            <div className="flex justify-between font-semibold text-base"><span className="text-[#333] dark:text-[#F0EDE8]">Total</span><span className="text-[#333] dark:text-[#F0EDE8]">₹{order.total.toLocaleString("en-IN")}</span></div>
          </div>

          {order.shipping_address && (
            <div className="border border-[#E5E0DB] dark:border-[#333] rounded-xl p-4">
              <h3 className="font-heading text-sm text-[#333] dark:text-[#F0EDE8] mb-2">Shipping Address</h3>
              <p className="text-sm text-[#6B6B6B] dark:text-[#9C9C9C]">{order.shipping_address.full_name}</p>
              <p className="text-sm text-[#6B6B6B] dark:text-[#9C9C9C]">{order.shipping_address.address_line1}{order.shipping_address.address_line2 ? `, ${order.shipping_address.address_line2}` : ""}</p>
              <p className="text-sm text-[#6B6B6B] dark:text-[#9C9C9C]">{order.shipping_address.city}, {order.shipping_address.state} — {order.shipping_address.postal_code}</p>
              {order.shipping_address.phone && <p className="text-sm text-[#6B6B6B] dark:text-[#9C9C9C]">{order.shipping_address.phone}</p>}
            </div>
          )}

          <div className="mt-8 flex justify-center gap-3">
            {!isCancelled && order.status === "confirmed" && (
              <Button onClick={handleCancel} disabled={cancelling} className="bg-red-500 hover:bg-red-600 text-white rounded-full">
                {cancelling ? "Cancelling..." : "Cancel Order"}
              </Button>
            )}
            <Button onClick={() => router.push("/orders")} className="bg-[#800020] hover:bg-[#A00028] dark:bg-[#B8860B] dark:hover:bg-[#D4A020] text-white rounded-full">
              View All Orders
            </Button>
          </div>
        </motion.div>
      </main>
    </div>
  )
}
