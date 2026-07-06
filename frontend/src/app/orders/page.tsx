"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { motion } from "motion/react"
import { Package } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Header } from "@/components/header"
import { createClient, isSupabaseAvailable } from "@/lib/supabase/client"
import { useAuth } from "@/lib/context/auth-context"

type Order = {
  id: string
  order_number: string
  status: string
  payment_status: string
  total: number
  created_at: string
}

const statusColors: Record<string, string> = {
  pending: "text-amber-600 bg-amber-50 dark:text-[#C5A028] dark:bg-[#C5A028]/10",
  confirmed: "text-[#800020] bg-[#800020]/10",
  shipped: "text-purple-600 bg-purple-50 dark:bg-purple-900/20",
  delivered: "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20",
  cancelled: "text-red-600 bg-red-50 dark:bg-red-900/20",
}

export default function OrdersPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && !user) { router.push("/login"); return }
    if (!user) return
    const currentUserId = user.id
    async function loadOrders() {
      if (!isSupabaseAvailable()) { setLoading(false); return }
      const supabase = createClient()
      const { data } = await supabase.from("orders").select("*").eq("user_id", currentUserId).order("created_at", { ascending: false })
      setOrders(data ?? [])
      setLoading(false)
    }
    if (!authLoading && !user) { router.push("/login"); return }
    if (user) loadOrders()
  }, [user, authLoading, router])

  if (authLoading || !user) {
    return <div className="flex flex-col flex-1"><Header /><main className="flex-1 flex items-center justify-center"><p className="text-[#9C9C9C]">Loading...</p></main></div>
  }

  return (
    <div className="flex flex-col flex-1">
      <Header />
      <main className="flex-1 px-6 py-8 max-w-3xl mx-auto w-full">
        <div className="mb-8">
          <div className="flex items-center gap-2">
            <Package className="w-6 h-6 text-[#800020] dark:text-[#B8860B]" />
            <h1 className="font-heading text-3xl text-[#333] dark:text-[#F0EDE8]">My Orders</h1>
          </div>
          <div className="w-12 h-0.5 bg-[#C5A028] mt-3" />
        </div>

        {loading ? (
          <div className="text-center py-24 text-[#9C9C9C]">Loading...</div>
        ) : orders.length === 0 ? (
          <div className="text-center py-24">
            <Package className="w-16 h-16 mx-auto text-[#E5E0DB] dark:text-[#333] mb-4" />
            <p className="text-[#6B6B6B] dark:text-[#9C9C9C] mb-6">No orders yet</p>
            <Button onClick={() => router.push("/products")} className="bg-[#800020] hover:bg-[#A00028] dark:bg-[#B8860B] dark:hover:bg-[#D4A020] text-white rounded-full">Start Shopping</Button>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order, i) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Link href={`/orders/${order.id}`} className="block border border-[#E5E0DB] dark:border-[#333] rounded-xl p-4 hover:border-[#800020] dark:hover:border-[#B8860B] transition-colors hover:shadow-sm">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-[#333] dark:text-[#F0EDE8]">{order.order_number}</p>
                      <p className="text-sm text-[#6B6B6B] dark:text-[#9C9C9C] mt-1">{new Date(order.created_at).toLocaleDateString("en-IN")}</p>
                    </div>
                    <div className="text-right">
                      <span className={`text-xs px-2.5 py-1 rounded-full capitalize font-medium ${statusColors[order.status] ?? "text-[#6B6B6B] bg-[#F5F0EB] dark:bg-[#242424]"}`}>
                        {order.status}
                      </span>
                      <p className="font-semibold mt-1 text-[#333] dark:text-[#F0EDE8]">₹{order.total.toLocaleString("en-IN")}</p>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
