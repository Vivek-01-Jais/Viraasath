"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { useAuth } from "@/lib/context/auth-context"
import { createClient, isSupabaseAvailable } from "@/lib/supabase/client"
import { API_URL, getAuthHeaders } from "@/lib/config"

type Customer = {
  id: string
  email: string | null
  full_name: string | null
  created_at: string
}

export default function AdminCustomersPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    const currentUserId = user.id
    async function loadCustomers() {
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
      if (!isAdmin) { router.push("/admin"); return }

      const { data } = await supabase.from("profiles").select("*").eq("role", "customer").order("created_at", { ascending: false })
      setCustomers(data ?? [])
      setLoading(false)
    }
    if (user) loadCustomers()
  }, [user, router])

  return (
    <div className="flex flex-col flex-1">
      <Header />
      <main className="flex-1 px-6 py-8 max-w-4xl mx-auto w-full">
        <div className="mb-6">
          <h1 className="text-2xl font-heading font-bold text-[#800020] dark:text-[#B8860B]">Customers</h1>
          <div className="w-12 h-0.5 bg-[#C5A028] mt-2" />
        </div>

        {loading ? (
          <div className="text-center py-24 text-[#6B6B6B] dark:text-[#9C9C9C]">Loading...</div>
        ) : (
          <div className="border border-[#E5E0DB] dark:border-[#333] rounded-xl overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#F8F8FF] dark:bg-[#1A1A1A]">
                <tr>
                  <th className="text-left p-3 font-medium text-[#800020] dark:text-[#B8860B] text-xs tracking-[0.2em] uppercase">Name</th>
                  <th className="text-left p-3 font-medium text-[#800020] dark:text-[#B8860B] text-xs tracking-[0.2em] uppercase">Email</th>
                  <th className="text-left p-3 font-medium text-[#800020] dark:text-[#B8860B] text-xs tracking-[0.2em] uppercase">Joined</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((c) => (
                  <tr key={c.id} className="border-t border-[#E5E0DB] dark:border-[#333] hover:bg-[#F8F8FF] dark:hover:bg-[#1A1A1A]">
                    <td className="p-3">{c.full_name || "—"}</td>
                    <td className="p-3 text-[#6B6B6B] dark:text-[#9C9C9C]">{c.email || "—"}</td>
                    <td className="p-3 text-[#6B6B6B] dark:text-[#9C9C9C] text-xs">{new Date(c.created_at).toLocaleDateString()}</td>
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
