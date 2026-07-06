"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { motion } from "motion/react"
import { LayoutDashboard, Package, ShoppingCart, Users, Star, FolderTree, Tag, Shield } from "lucide-react"
import { Header } from "@/components/header"
import { useAuth } from "@/lib/context/auth-context"
import { createClient } from "@/lib/supabase/client"
import { isSupabaseAvailable } from "@/lib/supabase/client"
import { API_URL, getAuthHeaders } from "@/lib/config"

type DashboardData = {
  total_products: number
  total_orders: number
  total_customers: number
  total_revenue: number
}

export default function AdminDashboard() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [notAdmin, setNotAdmin] = useState(false)
  const [bootstrapping, setBootstrapping] = useState(false)
  const [bootstrapMsg, setBootstrapMsg] = useState("")

  useEffect(() => {
    if (!authLoading && !user) { router.push("/login"); return }
    if (!user) return
    const currentUserId = user.id
    async function loadDashboard() {
      if (!isSupabaseAvailable()) { setLoading(false); return }
      const supabase = createClient()
      let isAdmin = false
      try {
        const headers = await getAuthHeaders()
        const verifyRes = await fetch(`${API_URL}/api/admin/verify`, { headers })
        isAdmin = verifyRes.ok
      } catch {
        const { data: profile } = await supabase.from("profiles").select("role").eq("id", currentUserId).maybeSingle()
        isAdmin = profile?.role === "admin"
      }
      if (!isAdmin) { setNotAdmin(true); setLoading(false); return }

      const [prodRes, orderRes, custRes, revRes] = await Promise.all([
        supabase.from("products").select("id", { count: "exact", head: true }),
        supabase.from("orders").select("id", { count: "exact", head: true }),
        supabase.from("profiles").select("id", { count: "exact", head: true }).eq("role", "customer"),
        supabase.from("orders").select("total").eq("payment_status", "paid"),
      ])

      const revenue = (revRes.data ?? []).reduce((s: number, o: { total: number }) => s + Number(o.total), 0)
      setData({
        total_products: prodRes.count ?? 0,
        total_orders: orderRes.count ?? 0,
        total_customers: custRes.count ?? 0,
        total_revenue: revenue,
      })
      setLoading(false)
    }
    if (!authLoading && !user) { router.push("/login"); return }
    if (user) loadDashboard()
  }, [user, authLoading, router])

  async function handleBootstrap() {
    setBootstrapping(true)
    setBootstrapMsg("Use Supabase dashboard to set admin role manually.")
    setBootstrapping(false)
  }

  if (authLoading || (!notAdmin && loading)) {
    return <div className="flex flex-col flex-1"><Header /><main className="flex-1 flex items-center justify-center"><p className="text-[#9C9C9C]">Loading...</p></main></div>
  }

  if (notAdmin) {
    return (
      <div className="flex flex-col flex-1">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center max-w-md px-4">
            <div className="w-16 h-16 rounded-full bg-[#800020]/10 flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl text-[#800020] dark:text-[#B8860B]">!</span>
            </div>
            <h2 className="text-xl font-heading font-bold text-[#333] dark:text-[#F0EDE8] mb-2">Admin Access Required</h2>
            <p className="text-sm text-[#6B6B6B] dark:text-[#9C9C9C] mb-6">
              Your account does not have admin privileges. If you are the first user, you can claim admin access.
            </p>
            <button
              onClick={handleBootstrap}
              disabled={bootstrapping}
              className="px-6 py-2.5 rounded-lg bg-[#800020] text-white text-sm hover:bg-[#600018] transition-colors disabled:opacity-50"
            >
              {bootstrapping ? "Granting access..." : "Claim Admin Access"}
            </button>
            {bootstrapMsg && (
              <p className={`mt-4 text-sm ${bootstrapMsg.includes("granted") ? "text-green-600" : "text-red-500"}`}>
                {bootstrapMsg}
              </p>
            )}
          </div>
        </main>
      </div>
    )
  }

  const cards = [
    { label: "Products", value: data?.total_products ?? 0, icon: Package, href: "/admin/products", color: "text-[#800020] bg-[#800020]/10" },
    { label: "Orders", value: data?.total_orders ?? 0, icon: ShoppingCart, href: "/admin/orders", color: "text-[#C5A028] bg-[#C5A028]/10" },
    { label: "Customers", value: data?.total_customers ?? 0, icon: Users, href: "/admin/customers", color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20" },
    { label: "Revenue", value: `₹${(data?.total_revenue ?? 0).toLocaleString("en-IN")}`, icon: LayoutDashboard, href: "#", color: "text-[#800020] bg-[#800020]/10" },
  ]

  return (
    <div className="flex flex-col flex-1">
      <Header />
      <main className="flex-1 px-6 py-8 max-w-6xl mx-auto w-full">
        <div className="mb-8">
          <span className="text-[#800020] dark:text-[#B8860B] text-xs tracking-[0.2em] uppercase font-medium">Admin</span>
          <h1 className="font-heading text-3xl mt-1 text-[#333] dark:text-[#F0EDE8]">Dashboard</h1>
          <div className="w-12 h-0.5 bg-[#C5A028] mt-3" />
        </div>

        {loading ? (
          <div className="text-center py-24 text-[#9C9C9C]">Loading...</div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {cards.map((card, i) => (
                <motion.div
                  key={card.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Link href={card.href} className="block border border-[#E5E0DB] dark:border-[#333] rounded-xl p-4 hover:shadow-md transition-all hover:-translate-y-0.5">
                    <div className={`inline-flex p-2 rounded-lg ${card.color} mb-3`}>
                      <card.icon className="w-5 h-5" />
                    </div>
                    <p className="text-2xl font-bold text-[#333] dark:text-[#F0EDE8]">{card.value}</p>
                    <p className="text-sm text-[#6B6B6B] dark:text-[#9C9C9C]">{card.label}</p>
                  </Link>
                </motion.div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Link href="/admin/products" className="border border-[#E5E0DB] dark:border-[#333] rounded-xl p-6 text-center hover:border-[#800020] dark:hover:border-[#B8860B] transition-colors hover:shadow-sm">
                <Package className="w-8 h-8 mx-auto mb-2 text-[#800020] dark:text-[#B8860B]" />
                <p className="font-medium text-[#333] dark:text-[#F0EDE8]">Manage Products</p>
              </Link>
              <Link href="/admin/categories" className="border border-[#E5E0DB] dark:border-[#333] rounded-xl p-6 text-center hover:border-[#800020] dark:hover:border-[#B8860B] transition-colors hover:shadow-sm">
                <FolderTree className="w-8 h-8 mx-auto mb-2 text-[#800020] dark:text-[#B8860B]" />
                <p className="font-medium text-[#333] dark:text-[#F0EDE8]">Categories</p>
              </Link>
              <Link href="/admin/orders" className="border border-[#E5E0DB] dark:border-[#333] rounded-xl p-6 text-center hover:border-[#800020] dark:hover:border-[#B8860B] transition-colors hover:shadow-sm">
                <ShoppingCart className="w-8 h-8 mx-auto mb-2 text-[#800020] dark:text-[#B8860B]" />
                <p className="font-medium text-[#333] dark:text-[#F0EDE8]">Manage Orders</p>
              </Link>
              <Link href="/admin/customers" className="border border-[#E5E0DB] dark:border-[#333] rounded-xl p-6 text-center hover:border-[#800020] dark:hover:border-[#B8860B] transition-colors hover:shadow-sm">
                <Users className="w-8 h-8 mx-auto mb-2 text-[#800020] dark:text-[#B8860B]" />
                <p className="font-medium text-[#333] dark:text-[#F0EDE8]">Customers</p>
              </Link>
              <Link href="/admin/reviews" className="border border-[#E5E0DB] dark:border-[#333] rounded-xl p-6 text-center hover:border-[#800020] dark:hover:border-[#B8860B] transition-colors hover:shadow-sm">
                <Star className="w-8 h-8 mx-auto mb-2 text-[#800020] dark:text-[#B8860B]" />
                <p className="font-medium text-[#333] dark:text-[#F0EDE8]">Reviews</p>
              </Link>
              <Link href="/admin/coupons" className="border border-[#E5E0DB] dark:border-[#333] rounded-xl p-6 text-center hover:border-[#800020] dark:hover:border-[#B8860B] transition-colors hover:shadow-sm">
                <Tag className="w-8 h-8 mx-auto mb-2 text-[#800020] dark:text-[#B8860B]" />
                <p className="font-medium text-[#333] dark:text-[#F0EDE8]">Coupons</p>
              </Link>
              <Link href="/admin/admins" className="border border-[#E5E0DB] dark:border-[#333] rounded-xl p-6 text-center hover:border-[#800020] dark:hover:border-[#B8860B] transition-colors hover:shadow-sm">
                <Shield className="w-8 h-8 mx-auto mb-2 text-[#800020] dark:text-[#B8860B]" />
                <p className="font-medium text-[#333] dark:text-[#F0EDE8]">Admins</p>
              </Link>
            </div>
          </>
        )}
      </main>
    </div>
  )
}
