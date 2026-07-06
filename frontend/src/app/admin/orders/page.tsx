"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { useAuth } from "@/lib/context/auth-context"
import { createClient, isSupabaseAvailable } from "@/lib/supabase/client"
import { API_URL, getAuthHeaders } from "@/lib/config"

type Order = {
  id: string
  order_number: string
  status: string
  payment_status: string
  total: number
  user_id: string
  created_at: string
}

const statuses = ["pending", "confirmed", "shipped", "delivered", "cancelled"]

export default function AdminOrdersPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  async function loadOrders() {
    if (!isSupabaseAvailable()) { queueMicrotask(() => setLoading(false)); return }
    const supabase = createClient()
    const { data } = await supabase.from("orders").select("*").order("created_at", { ascending: false })
    setOrders(data ?? [])
    setLoading(false)
  }

  useEffect(() => {
    if (!user) return
    if (!isSupabaseAvailable()) { queueMicrotask(() => setLoading(false)); return }
    const verifyAdmin = async () => {
      try {
        const headers = await getAuthHeaders()
        const verifyRes = await fetch(`${API_URL}/api/admin/verify`, { headers })
        if (!verifyRes.ok) { router.push("/admin"); return }
        loadOrders()
      } catch {
        const { data: profile } = await createClient().from("profiles").select("role").eq("id", user.id).maybeSingle()
        if (profile?.role !== "admin") { router.push("/admin"); return }
        loadOrders()
      }
    }
    verifyAdmin()
  }, [user, router])

  async function updateStatus(orderId: string, status: string) {
    const supabase = createClient()
    await supabase.from("orders").update({ status }).eq("id", orderId)
    toast.success(`Order status updated to "${status}"`)
    loadOrders()
  }

  return (
    <div className="flex flex-col flex-1">
      <Header />
      <main className="flex-1 px-6 py-8 max-w-6xl mx-auto w-full">
        <div className="mb-6">
          <h1 className="text-2xl font-heading font-bold text-[#800020] dark:text-[#B8860B]">Orders</h1>
          <div className="w-12 h-0.5 bg-[#C5A028] mt-2" />
        </div>

        {loading ? (
          <div className="text-center py-24 text-[#6B6B6B] dark:text-[#9C9C9C]">Loading...</div>
        ) : (
          <div className="border border-[#E5E0DB] dark:border-[#333] rounded-xl overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#F8F8FF] dark:bg-[#1A1A1A]">
                <tr>
                  <th className="text-left p-3 font-medium text-[#800020] dark:text-[#B8860B] text-xs tracking-[0.2em] uppercase">Order #</th>
                  <th className="text-left p-3 font-medium text-[#800020] dark:text-[#B8860B] text-xs tracking-[0.2em] uppercase">Customer</th>
                  <th className="text-left p-3 font-medium text-[#800020] dark:text-[#B8860B] text-xs tracking-[0.2em] uppercase">Total</th>
                  <th className="text-left p-3 font-medium text-[#800020] dark:text-[#B8860B] text-xs tracking-[0.2em] uppercase">Payment</th>
                  <th className="text-left p-3 font-medium text-[#800020] dark:text-[#B8860B] text-xs tracking-[0.2em] uppercase">Status</th>
                  <th className="text-left p-3 font-medium text-[#800020] dark:text-[#B8860B] text-xs tracking-[0.2em] uppercase">Date</th>
                  <th className="text-left p-3 font-medium text-[#800020] dark:text-[#B8860B] text-xs tracking-[0.2em] uppercase">Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.id} className="border-t border-[#E5E0DB] dark:border-[#333] hover:bg-[#F8F8FF] dark:hover:bg-[#1A1A1A]">
                    <td className="p-3 font-mono text-xs">{o.order_number}</td>
                    <td className="p-3 text-[#6B6B6B] dark:text-[#9C9C9C]">{o.user_id.slice(0, 8)}...</td>
                    <td className="p-3">₹{o.total.toLocaleString("en-IN")}</td>
                    <td className="p-3">
                      <span className={`text-xs px-2 py-1 rounded-full capitalize ${o.payment_status === "paid" ? "bg-[#800020]/10 text-[#800020] dark:bg-[#B8860B]/10 dark:text-[#B8860B]" : "bg-[#C5A028]/10 text-[#C5A028]"}`}>{o.payment_status}</span>
                    </td>
                    <td className="p-3">
                      <span className={`text-xs px-2 py-1 rounded-full capitalize ${["shipped", "delivered"].includes(o.status) ? "bg-[#800020]/10 text-[#800020] dark:bg-[#B8860B]/10 dark:text-[#B8860B]" : o.status === "cancelled" ? "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400" : "bg-[#C5A028]/10 text-[#C5A028]"}`}>{o.status}</span>
                    </td>
                    <td className="p-3 text-[#6B6B6B] dark:text-[#9C9C9C] text-xs">{new Date(o.created_at).toLocaleDateString()}</td>
                    <td className="p-3">
                      <select
                        className="text-xs border border-[#E5E0DB] dark:border-[#333] rounded px-2 py-1 bg-transparent text-[#333] dark:text-[#F0EDE8] focus:outline-none focus:ring-2 focus:ring-[#C5A028]"
                        value={o.status}
                        onChange={(e) => updateStatus(o.id, e.target.value)}
                      >
                        {statuses.map((s) => <option key={s} value={s} className="capitalize">{s}</option>)}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  )
}
