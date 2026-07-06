"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Plus, Pencil } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Header } from "@/components/header"
import { useAuth } from "@/lib/context/auth-context"
import { createClient, isSupabaseAvailable } from "@/lib/supabase/client"
import { API_URL, getAuthHeaders } from "@/lib/config"
import { toast } from "sonner"

type Product = {
  id: string
  name: string
  slug: string
  price: number
  is_active: boolean
  is_featured: boolean
  category: { name: string } | null
  product_variants?: { id: string; size: string; stock_quantity: number; is_active: boolean }[]
  created_at: string
}

export default function AdminProductsPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && !user) { router.push("/login"); return }
    if (user) {
      if (!isSupabaseAvailable()) { queueMicrotask(() => setLoading(false)); return }
      const verifyAdmin = async () => {
        try {
          const headers = await getAuthHeaders()
          const verifyRes = await fetch(`${API_URL}/api/admin/verify`, { headers })
          if (!verifyRes.ok) { router.push("/admin"); return }
          loadProducts()
        } catch {
          const { data: profile } = await createClient().from("profiles").select("role").eq("id", user.id).maybeSingle()
          if (profile?.role !== "admin") { router.push("/admin"); return }
          loadProducts()
        }
      }
      verifyAdmin()
    }
  }, [user, authLoading, router])

  async function loadProducts() {
    if (!isSupabaseAvailable()) { queueMicrotask(() => setLoading(false)); return }
    const supabase = createClient()
    const { data } = await supabase.from("products").select("*, category:categories(name), product_variants(id, size, color, stock_quantity, is_active)").order("created_at", { ascending: false })
    setProducts(data ?? [])
    setLoading(false)
  }

  async function toggleActive(product: Product) {
    const supabase = createClient()
    await supabase.from("products").update({ is_active: !product.is_active }).eq("id", product.id)
    toast.success(product.is_active ? "Product hidden" : "Product visible")
    loadProducts()
  }

  async function toggleFeatured(product: Product) {
    const supabase = createClient()
    await supabase.from("products").update({ is_featured: !product.is_featured }).eq("id", product.id)
    toast.success(product.is_featured ? "Removed from featured" : "Added to featured")
    loadProducts()
  }

  return (
    <div className="flex flex-col flex-1">
      <Header />
      <main className="flex-1 px-6 py-8 max-w-6xl mx-auto w-full">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-heading font-bold text-[#800020] dark:text-[#B8860B]">Products</h1>
            <div className="w-12 h-0.5 bg-[#C5A028] mt-2" />
          </div>
          <Link href="/admin/products/new">
            <Button className="bg-[#800020] hover:bg-[#A00028] dark:bg-[#B8860B] dark:hover:bg-[#D4A020] text-white rounded-full"><Plus className="w-4 h-4 mr-1" /> Add Product</Button>
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-24 text-[#6B6B6B] dark:text-[#9C9C9C]">Loading...</div>
        ) : (
          <div className="border border-[#E5E0DB] dark:border-[#333] rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-[#F8F8FF] dark:bg-[#1A1A1A]">
                <tr>
                  <th className="text-left p-3 font-medium text-[#800020] dark:text-[#B8860B] text-xs tracking-[0.2em] uppercase">Name</th>
                  <th className="text-left p-3 font-medium text-[#800020] dark:text-[#B8860B] text-xs tracking-[0.2em] uppercase">Category</th>
                  <th className="text-left p-3 font-medium text-[#800020] dark:text-[#B8860B] text-xs tracking-[0.2em] uppercase">Price</th>
                  <th className="text-left p-3 font-medium text-[#800020] dark:text-[#B8860B] text-xs tracking-[0.2em] uppercase">Stock</th>
                  <th className="text-left p-3 font-medium text-[#800020] dark:text-[#B8860B] text-xs tracking-[0.2em] uppercase">Featured</th>
                  <th className="text-left p-3 font-medium text-[#800020] dark:text-[#B8860B] text-xs tracking-[0.2em] uppercase">Active</th>
                  <th className="text-left p-3 font-medium text-[#800020] dark:text-[#B8860B] text-xs tracking-[0.2em] uppercase">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id} className="border-t border-[#E5E0DB] dark:border-[#333] hover:bg-[#F8F8FF] dark:hover:bg-[#1A1A1A]">
                    <td className="p-3 text-[#333] dark:text-[#F0EDE8]">{p.name}</td>
                    <td className="p-3 text-[#6B6B6B] dark:text-[#9C9C9C]">{p.category?.name ?? "—"}</td>
                    <td className="p-3 text-[#333] dark:text-[#F0EDE8]">₹{p.price.toLocaleString("en-IN")}</td>
                    <td className="p-3">
                      {p.product_variants && p.product_variants.length > 0 ? (
                        <span className={`text-xs font-medium ${p.product_variants.some(v => v.stock_quantity > 0 && v.is_active) ? "text-green-600 dark:text-green-400" : "text-red-500"}`}>
                          {p.product_variants.reduce((s, v) => s + (v.is_active ? v.stock_quantity : 0), 0)} units
                        </span>
                      ) : (
                        <span className="text-xs text-zinc-400">—</span>
                      )}
                    </td>
                    <td className="p-3">
                      <button onClick={() => toggleFeatured(p)} className={`text-xs px-2 py-1 rounded-full ${p.is_featured ? "bg-[#800020]/10 text-[#800020] dark:bg-[#B8860B]/10 dark:text-[#B8860B]" : "bg-zinc-100 text-zinc-400 dark:bg-[#333] dark:text-[#9C9C9C]"}`}>
                        {p.is_featured ? "Yes" : "No"}
                      </button>
                    </td>
                    <td className="p-3">
                      <button onClick={() => toggleActive(p)} className={`text-xs px-2 py-1 rounded-full ${p.is_active ? "bg-[#800020]/10 text-[#800020] dark:bg-[#B8860B]/10 dark:text-[#B8860B]" : "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400"}`}>
                        {p.is_active ? "Active" : "Hidden"}
                      </button>
                    </td>
                    <td className="p-3">
                      <Link href={`/admin/products/${p.id}`} className="text-[#6B6B6B] dark:text-[#9C9C9C] hover:text-[#800020] dark:hover:text-[#B8860B]"><Pencil className="w-4 h-4" /></Link>
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
