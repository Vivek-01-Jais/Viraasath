"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { useAuth } from "@/lib/context/auth-context"
import { createClient, isSupabaseAvailable } from "@/lib/supabase/client"
import { API_URL, getAuthHeaders } from "@/lib/config"
import { toast } from "sonner"
import { Plus, Pencil, X } from "lucide-react"

type Coupon = {
  id: string
  code: string
  discount_type: string
  discount_value: number
  min_cart_value: number
  max_discount: number | null
  usage_limit: number | null
  used_count: number
  is_active: boolean
  created_at: string
}

export default function AdminCouponsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<Coupon | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ code: "", discount_type: "percentage", discount_value: 0, min_cart_value: 0, max_discount: 0, usage_limit: 0 })
  const [saving, setSaving] = useState(false)

  const loadCoupons = useCallback(async () => {
    if (!isSupabaseAvailable()) { queueMicrotask(() => setLoading(false)); return }
    const supabase = createClient()
    const { data } = await supabase.from("coupons").select("*").order("code")
    setCoupons(data ?? [])
    setLoading(false)
  }, [])

  useEffect(() => {
    if (!user) return
    if (!isSupabaseAvailable()) { queueMicrotask(() => setLoading(false)); return }
    const verifyAdmin = async () => {
      try {
        const headers = await getAuthHeaders()
        const verifyRes = await fetch(`${API_URL}/api/admin/verify`, { headers })
        if (!verifyRes.ok) { router.push("/admin"); return }
        loadCoupons()
      } catch {
        const { data: profile } = await createClient().from("profiles").select("role").eq("id", user.id).maybeSingle()
        if (profile?.role !== "admin") { router.push("/admin"); return }
        loadCoupons()
      }
    }
    verifyAdmin()
  }, [user, router, loadCoupons])

  function openNew() {
    setForm({ code: "", discount_type: "percentage", discount_value: 0, min_cart_value: 0, max_discount: 0, usage_limit: 0 })
    setEditing(null)
    setShowForm(true)
  }

  function openEdit(c: Coupon) {
    setForm({ code: c.code, discount_type: c.discount_type, discount_value: c.discount_value, min_cart_value: c.min_cart_value, max_discount: c.max_discount ?? 0, usage_limit: c.usage_limit ?? 0 })
    setEditing(c)
    setShowForm(true)
  }

  async function handleSave() {
    setSaving(true)
    const supabase = createClient()
    if (editing) {
      const { error } = await supabase.from("coupons").update({ discount_type: form.discount_type, discount_value: form.discount_value, min_cart_value: form.min_cart_value, max_discount: form.max_discount || null, usage_limit: form.usage_limit || null }).eq("id", editing.id)
      if (error) { toast.error(error.message); setSaving(false); return }
      toast.success("Coupon updated")
    } else {
      const { error } = await supabase.from("coupons").insert({ code: form.code.toUpperCase(), discount_type: form.discount_type, discount_value: form.discount_value, min_cart_value: form.min_cart_value, max_discount: form.max_discount || null, usage_limit: form.usage_limit || null, is_active: true })
      if (error) { toast.error(error.message); setSaving(false); return }
      toast.success("Coupon created")
    }
    setSaving(false)
    setShowForm(false)
    setEditing(null)
    loadCoupons()
  }

  async function toggleActive(c: Coupon) {
    const supabase = createClient()
    await supabase.from("coupons").update({ is_active: !c.is_active }).eq("id", c.id)
    toast.success(c.is_active ? "Coupon deactivated" : "Coupon activated")
    loadCoupons()
  }

  return (
    <div className="flex flex-col flex-1">
      <Header />
      <main className="flex-1 px-6 py-8 max-w-4xl mx-auto w-full">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-heading font-bold text-[#800020] dark:text-[#B8860B]">Coupons</h1>
            <div className="w-12 h-0.5 bg-[#C5A028] mt-2" />
          </div>
          {!showForm && (
            <button onClick={openNew} className="flex items-center gap-1 px-4 py-2 rounded-full bg-[#800020] hover:bg-[#A00028] dark:bg-[#B8860B] dark:hover:bg-[#D4A020] text-white text-sm">
              <Plus className="w-4 h-4" /> Add Coupon
            </button>
          )}
        </div>

        {showForm && (
          <div className="mb-8 p-6 border border-[#E5E0DB] dark:border-[#333] rounded-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-heading font-bold text-[#800020] dark:text-[#B8860B]">{editing ? "Edit Coupon" : "New Coupon"}</h2>
              <button onClick={() => setShowForm(false)} className="text-[#6B6B6B] hover:text-[#333] dark:hover:text-[#F0EDE8]"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-4">
              {!editing && (
                <div>
                  <label className="text-sm font-medium text-[#800020] dark:text-[#B8860B]">Code</label>
                  <input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} className="w-full rounded-xl border border-[#E5E0DB] dark:border-[#333] bg-transparent px-3 py-2 text-sm text-[#333] dark:text-[#F0EDE8] focus:outline-none focus:ring-2 focus:ring-[#C5A028]" placeholder="e.g. SAVE20" />
                </div>
              )}
              {editing && <p className="text-sm font-medium text-[#800020] dark:text-[#B8860B]">Code: <span className="text-[#333] dark:text-[#F0EDE8]">{editing.code}</span></p>}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-[#800020] dark:text-[#B8860B]">Type</label>
                  <select value={form.discount_type} onChange={(e) => setForm({ ...form, discount_type: e.target.value })} className="w-full rounded-xl border border-[#E5E0DB] dark:border-[#333] bg-transparent px-3 py-2 text-sm text-[#333] dark:text-[#F0EDE8] focus:outline-none focus:ring-2 focus:ring-[#C5A028]">
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed (₹)</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-[#800020] dark:text-[#B8860B]">Value</label>
                  <input type="number" value={form.discount_value} onChange={(e) => setForm({ ...form, discount_value: Number(e.target.value) })} className="w-full rounded-xl border border-[#E5E0DB] dark:border-[#333] bg-transparent px-3 py-2 text-sm text-[#333] dark:text-[#F0EDE8] focus:outline-none focus:ring-2 focus:ring-[#C5A028]" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-[#800020] dark:text-[#B8860B]">Min Cart Value</label>
                  <input type="number" value={form.min_cart_value} onChange={(e) => setForm({ ...form, min_cart_value: Number(e.target.value) })} className="w-full rounded-xl border border-[#E5E0DB] dark:border-[#333] bg-transparent px-3 py-2 text-sm text-[#333] dark:text-[#F0EDE8] focus:outline-none focus:ring-2 focus:ring-[#C5A028]" />
                </div>
                <div>
                  <label className="text-sm font-medium text-[#800020] dark:text-[#B8860B]">Max Discount (0 = no limit)</label>
                  <input type="number" value={form.max_discount} onChange={(e) => setForm({ ...form, max_discount: Number(e.target.value) })} className="w-full rounded-xl border border-[#E5E0DB] dark:border-[#333] bg-transparent px-3 py-2 text-sm text-[#333] dark:text-[#F0EDE8] focus:outline-none focus:ring-2 focus:ring-[#C5A028]" />
                </div>
                <div>
                  <label className="text-sm font-medium text-[#800020] dark:text-[#B8860B]">Usage Limit (0 = unlimited)</label>
                  <input type="number" value={form.usage_limit} onChange={(e) => setForm({ ...form, usage_limit: Number(e.target.value) })} className="w-full rounded-xl border border-[#E5E0DB] dark:border-[#333] bg-transparent px-3 py-2 text-sm text-[#333] dark:text-[#F0EDE8] focus:outline-none focus:ring-2 focus:ring-[#C5A028]" />
                </div>
              </div>
              <button onClick={handleSave} disabled={saving} className="px-6 py-2 rounded-full bg-[#800020] hover:bg-[#A00028] dark:bg-[#B8860B] dark:hover:bg-[#D4A020] text-white text-sm disabled:opacity-50">
                {saving ? "Saving..." : editing ? "Update Coupon" : "Create Coupon"}
              </button>
            </div>
          </div>
        )}

        {loading ? (
          <div className="text-center py-24 text-[#6B6B6B] dark:text-[#9C9C9C]">Loading...</div>
        ) : (
          <div className="border border-[#E5E0DB] dark:border-[#333] rounded-xl overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#F8F8FF] dark:bg-[#1A1A1A]">
                <tr>
                  <th className="text-left p-3 font-medium text-[#800020] dark:text-[#B8860B] text-xs tracking-[0.2em] uppercase">Code</th>
                  <th className="text-left p-3 font-medium text-[#800020] dark:text-[#B8860B] text-xs tracking-[0.2em] uppercase">Discount</th>
                  <th className="text-left p-3 font-medium text-[#800020] dark:text-[#B8860B] text-xs tracking-[0.2em] uppercase">Used</th>
                  <th className="text-left p-3 font-medium text-[#800020] dark:text-[#B8860B] text-xs tracking-[0.2em] uppercase">Status</th>
                  <th className="text-left p-3 font-medium text-[#800020] dark:text-[#B8860B] text-xs tracking-[0.2em] uppercase">Actions</th>
                </tr>
              </thead>
              <tbody>
                {coupons.map((c) => (
                  <tr key={c.id} className="border-t border-[#E5E0DB] dark:border-[#333] hover:bg-[#F8F8FF] dark:hover:bg-[#1A1A1A]">
                    <td className="p-3 font-medium text-[#333] dark:text-[#F0EDE8] font-mono">{c.code}</td>
                    <td className="p-3 text-[#6B6B6B] dark:text-[#9C9C9C]">{c.discount_type === "percentage" ? `${c.discount_value}%` : `₹${c.discount_value}`}</td>
                    <td className="p-3 text-[#6B6B6B] dark:text-[#9C9C9C]">{c.used_count}{c.usage_limit ? `/${c.usage_limit}` : ""}</td>
                    <td className="p-3">
                      <button onClick={() => toggleActive(c)} className={`text-xs px-2 py-1 rounded-full ${c.is_active ? "bg-[#800020]/10 text-[#800020] dark:bg-[#B8860B]/10 dark:text-[#B8860B]" : "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400"}`}>
                        {c.is_active ? "Active" : "Inactive"}
                      </button>
                    </td>
                    <td className="p-3">
                      <button onClick={() => openEdit(c)} className="text-[#6B6B6B] hover:text-[#800020] dark:hover:text-[#B8860B]"><Pencil className="w-4 h-4" /></button>
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
