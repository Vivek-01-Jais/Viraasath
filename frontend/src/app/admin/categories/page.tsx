"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { useAuth } from "@/lib/context/auth-context"
import { createClient, isSupabaseAvailable } from "@/lib/supabase/client"
import { API_URL, getAuthHeaders } from "@/lib/config"
import { toast } from "sonner"
import { Plus, Pencil, X } from "lucide-react"

type Category = {
  id: string
  name: string
  slug: string
  description: string | null
  is_active: boolean
  created_at: string
}

export default function AdminCategoriesPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<Category | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: "", slug: "", description: "" })
  const [saving, setSaving] = useState(false)

  const loadCategories = useCallback(async () => {
    if (!isSupabaseAvailable()) { queueMicrotask(() => setLoading(false)); return }
    const supabase = createClient()
    const { data } = await supabase.from("categories").select("*").order("name")
    setCategories(data ?? [])
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
        loadCategories()
      } catch {
        const { data: profile } = await createClient().from("profiles").select("role").eq("id", user.id).maybeSingle()
        if (profile?.role !== "admin") { router.push("/admin"); return }
        loadCategories()
      }
    }
    verifyAdmin()
  }, [user, router, loadCategories])

  function openNew() {
    setForm({ name: "", slug: "", description: "" })
    setEditing(null)
    setShowForm(true)
  }

  function openEdit(cat: Category) {
    setForm({ name: cat.name, slug: cat.slug, description: cat.description ?? "" })
    setEditing(cat)
    setShowForm(true)
  }

  async function handleSave() {
    setSaving(true)
    const supabase = createClient()
    if (editing) {
      const { error } = await supabase.from("categories").update(form).eq("id", editing.id)
      if (error) { toast.error(error.message); setSaving(false); return }
      toast.success("Category updated")
    } else {
      const { error } = await supabase.from("categories").insert({ ...form, is_active: true })
      if (error) { toast.error(error.message); setSaving(false); return }
      toast.success("Category created")
    }
    setSaving(false)
    setShowForm(false)
    setEditing(null)
    loadCategories()
  }

  async function toggleActive(cat: Category) {
    const supabase = createClient()
    await supabase.from("categories").update({ is_active: !cat.is_active }).eq("id", cat.id)
    toast.success(cat.is_active ? "Category hidden" : "Category visible")
    loadCategories()
  }

  return (
    <div className="flex flex-col flex-1">
      <Header />
      <main className="flex-1 px-6 py-8 max-w-4xl mx-auto w-full">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-heading font-bold text-[#800020] dark:text-[#B8860B]">Categories</h1>
            <div className="w-12 h-0.5 bg-[#C5A028] mt-2" />
          </div>
          {!showForm && (
            <button onClick={openNew} className="flex items-center gap-1 px-4 py-2 rounded-full bg-[#800020] hover:bg-[#A00028] dark:bg-[#B8860B] dark:hover:bg-[#D4A020] text-white text-sm">
              <Plus className="w-4 h-4" /> Add Category
            </button>
          )}
        </div>

        {showForm && (
          <div className="mb-8 p-6 border border-[#E5E0DB] dark:border-[#333] rounded-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-heading font-bold text-[#800020] dark:text-[#B8860B]">{editing ? "Edit Category" : "New Category"}</h2>
              <button onClick={() => setShowForm(false)} className="text-[#6B6B6B] hover:text-[#333] dark:hover:text-[#F0EDE8]"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-[#800020] dark:text-[#B8860B]">Name</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full rounded-xl border border-[#E5E0DB] dark:border-[#333] bg-transparent px-3 py-2 text-sm text-[#333] dark:text-[#F0EDE8] focus:outline-none focus:ring-2 focus:ring-[#C5A028]" />
              </div>
              <div>
                <label className="text-sm font-medium text-[#800020] dark:text-[#B8860B]">Slug</label>
                <input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} className="w-full rounded-xl border border-[#E5E0DB] dark:border-[#333] bg-transparent px-3 py-2 text-sm text-[#333] dark:text-[#F0EDE8] focus:outline-none focus:ring-2 focus:ring-[#C5A028]" />
              </div>
              <div>
                <label className="text-sm font-medium text-[#800020] dark:text-[#B8860B]">Description</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full rounded-xl border border-[#E5E0DB] dark:border-[#333] bg-transparent px-3 py-2 text-sm min-h-[80px] text-[#333] dark:text-[#F0EDE8] focus:outline-none focus:ring-2 focus:ring-[#C5A028]" />
              </div>
              <button onClick={handleSave} disabled={saving} className="px-6 py-2 rounded-full bg-[#800020] hover:bg-[#A00028] dark:bg-[#B8860B] dark:hover:bg-[#D4A020] text-white text-sm disabled:opacity-50">
                {saving ? "Saving..." : editing ? "Update Category" : "Create Category"}
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
                  <th className="text-left p-3 font-medium text-[#800020] dark:text-[#B8860B] text-xs tracking-[0.2em] uppercase">Name</th>
                  <th className="text-left p-3 font-medium text-[#800020] dark:text-[#B8860B] text-xs tracking-[0.2em] uppercase">Slug</th>
                  <th className="text-left p-3 font-medium text-[#800020] dark:text-[#B8860B] text-xs tracking-[0.2em] uppercase">Active</th>
                  <th className="text-left p-3 font-medium text-[#800020] dark:text-[#B8860B] text-xs tracking-[0.2em] uppercase">Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((c) => (
                  <tr key={c.id} className="border-t border-[#E5E0DB] dark:border-[#333] hover:bg-[#F8F8FF] dark:hover:bg-[#1A1A1A]">
                    <td className="p-3 font-medium text-[#333] dark:text-[#F0EDE8]">{c.name}</td>
                    <td className="p-3 text-[#6B6B6B] dark:text-[#9C9C9C] font-mono text-xs">{c.slug}</td>
                    <td className="p-3">
                      <button onClick={() => toggleActive(c)} className={`text-xs px-2 py-1 rounded-full ${c.is_active ? "bg-[#800020]/10 text-[#800020] dark:bg-[#B8860B]/10 dark:text-[#B8860B]" : "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400"}`}>
                        {c.is_active ? "Active" : "Hidden"}
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