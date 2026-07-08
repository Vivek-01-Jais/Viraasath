"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Upload, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Header } from "@/components/header"
import { createClient, isSupabaseAvailable } from "@/lib/supabase/client"
import { API_URL, getAuthHeaders } from "@/lib/config"
import { toast } from "sonner"

type ProductForm = {
  name: string
  slug: string
  description: string
  price: string
  compare_at_price: string
  material: string
  care_instructions: string
  category_id: string
  is_featured: boolean
}

const emptyForm: ProductForm = {
  name: "",
  slug: "",
  description: "",
  price: "",
  compare_at_price: "",
  material: "",
  care_instructions: "",
  category_id: "",
  is_featured: false,
}

type Category = { id: string; name: string }
type ProductImage = { id: string; url: string; alt_text: string; position: number }

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").trim()
}

export default function AdminProductEditPage() {
  const params = useParams()
  const router = useRouter()
  const isNew = params.id === "new"
  const [form, setForm] = useState<ProductForm>(emptyForm)
  const [categories, setCategories] = useState<Category[]>([])
  const [variants, setVariants] = useState<{ id: string; size: string; color: string; stock_quantity: number; is_active: boolean }[]>([])
  const [images, setImages] = useState<ProductImage[]>([])
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(!isNew)
  const [productId] = useState<string | null>(isNew ? null : (params.id as string))
  const [user, setUser] = useState<{ id: string } | null>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then((result: { data?: { user: { id: string } | null } | null }) => {
      if (result.data?.user) setUser(result.data.user)
    })
  }, [])

  const loadCategories = useCallback(async () => {
    if (!isSupabaseAvailable()) { setLoading(false); return }
    const supabase = createClient()
    const { data } = await supabase.from("categories").select("id, name").eq("is_active", true)
    setCategories(data ?? [])
  }, [])

  const loadProduct = useCallback(async () => {
    const supabase = createClient()
    const { data } = await supabase.from("products").select("*, product_variants(id, size, color, stock_quantity, is_active)").eq("id", params.id).maybeSingle()
    if (data) {
      setForm({
        name: data.name,
        slug: data.slug,
        description: data.description ?? "",
        price: String(data.price),
        compare_at_price: data.compare_at_price ? String(data.compare_at_price) : "",
        material: data.material ?? "",
        care_instructions: data.care_instructions ?? "",
        category_id: data.category_id ?? "",
        is_featured: data.is_featured,
      })
      if (data.product_variants) setVariants(data.product_variants)
    }
    const { data: imgs } = await supabase.from("product_images").select("*").eq("product_id", params.id).order("position")
    if (imgs) setImages(imgs)
    setLoading(false)
  }, [params.id])

  useEffect(() => {
    queueMicrotask(() => {
      loadCategories()
      if (!isNew) loadProduct()
    })
  }, [params.id, isNew, loadCategories, loadProduct])

  async function handleSave() {
    setSaving(true)
    const supabase = createClient()
    const payload = {
      name: form.name,
      slug: form.slug,
      description: form.description || null,
      price: Number(form.price),
      compare_at_price: form.compare_at_price ? Number(form.compare_at_price) : null,
      material: form.material || null,
      care_instructions: form.care_instructions || null,
      category_id: form.category_id || null,
      is_featured: form.is_featured,
    }

    if (isNew) {
      const { data, error } = await supabase.from("products").insert(payload).select("id").single()
      if (error) { toast.error(error.message); setSaving(false); return }
      toast.success("Product created! Add images now.")
      setSaving(false)
      router.push(`/admin/products/${data.id}`)
      return
    } else {
      const { error } = await supabase.from("products").update(payload).eq("id", params.id)
      if (error) { toast.error(error.message); setSaving(false); return }
      toast.success("Product updated")
    }

    for (const v of variants) {
      if (v.id.startsWith("new_")) {
        await supabase.from("product_variants").insert({
          product_id: params.id,
          size: v.size,
          color: v.color,
          stock_quantity: v.stock_quantity,
          is_active: v.is_active,
        })
      } else {
        await supabase.from("product_variants").update({
          size: v.size,
          stock_quantity: v.stock_quantity,
        }).eq("id", v.id)
      }
    }
    setSaving(false)
    router.push("/admin/products")
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files
    if (!files || !files.length || !productId || !user) return
    setUploading(true)

    for (const file of Array.from(files)) {
      const formData = new FormData()
      formData.append("file", file)

      try {
        const authHeaders = await getAuthHeaders()
        delete authHeaders["Content-Type"]
        const res = await fetch(`${API_URL}/api/admin/upload-image/${productId}`, {
          method: "POST",
          headers: authHeaders,
          body: formData,
        })
        if (!res.ok) {
          const err = await res.json()
          toast.error(err.detail || "Upload failed")
          continue
        }
        const img = await res.json()
        setImages(prev => [...prev, img])
      } catch {
        toast.error("Upload failed")
      }
    }

    setUploading(false)
    e.target.value = ""
  }

  async function handleDeleteImage(imageId: string) {
    if (!user) return
    try {
      const headers = await getAuthHeaders()
      const res = await fetch(`${API_URL}/api/admin/images/${imageId}`, { method: "DELETE", headers })
      if (!res.ok) throw new Error()
      setImages(prev => prev.filter(i => i.id !== imageId))
      toast.success("Image deleted")
    } catch {
      toast.error("Failed to delete image")
    }
  }

  if (loading) {
    return <div className="flex flex-col flex-1"><Header /><main className="flex-1 flex items-center justify-center"><p className="text-[#6B6B6B] dark:text-[#9C9C9C]">Loading...</p></main></div>
  }

  return (
    <div className="flex flex-col flex-1">
      <Header />
      <main className="flex-1 px-6 py-8 max-w-2xl mx-auto w-full">
        <Link href="/admin/products" className="text-sm text-[#6B6B6B] dark:text-[#9C9C9C] hover:text-[#800020] dark:hover:text-[#B8860B] mb-6 inline-flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" /> Back to Products
        </Link>
        <div className="mb-6">
          <h1 className="text-2xl font-heading font-bold text-[#800020] dark:text-[#B8860B]">{isNew ? "Add Product" : "Edit Product"}</h1>
          <div className="w-12 h-0.5 bg-[#C5A028] mt-2" />
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-[#800020] dark:text-[#B8860B]">Name</label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value, slug: form.slug || slugify(e.target.value) })} />
          </div>
          <div>
            <label className="text-sm font-medium text-[#800020] dark:text-[#B8860B]">Slug</label>
            <Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="product-url-slug" />
          </div>
          <div>
            <label className="text-sm font-medium text-[#800020] dark:text-[#B8860B]">Description</label>
            <textarea className="w-full rounded-xl border border-[#E5E0DB] dark:border-[#333] bg-transparent px-3 py-2 text-sm min-h-[100px] text-[#333] dark:text-[#F0EDE8] focus:outline-none focus:ring-2 focus:ring-[#C5A028]" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-[#800020] dark:text-[#B8860B]">Price (₹)</label>
              <Input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
            </div>
            <div>
              <label className="text-sm font-medium text-[#800020] dark:text-[#B8860B]">Compare at (₹)</label>
              <Input type="number" value={form.compare_at_price} onChange={(e) => setForm({ ...form, compare_at_price: e.target.value })} />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-[#800020] dark:text-[#B8860B]">Category</label>
            <select className="w-full rounded-xl border border-[#E5E0DB] dark:border-[#333] bg-transparent px-3 py-2 text-sm text-[#333] dark:text-[#F0EDE8] focus:outline-none focus:ring-2 focus:ring-[#C5A028]" value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })}>
              <option value="">None</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-[#800020] dark:text-[#B8860B]">Material</label>
            <Input value={form.material} onChange={(e) => setForm({ ...form, material: e.target.value })} />
          </div>
          <div>
            <label className="text-sm font-medium text-[#800020] dark:text-[#B8860B]">Care Instructions</label>
            <Input value={form.care_instructions} onChange={(e) => setForm({ ...form, care_instructions: e.target.value })} />
          </div>
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input type="checkbox" checked={form.is_featured} onChange={(e) => setForm({ ...form, is_featured: e.target.checked })} className="accent-[#800020] dark:accent-[#B8860B]" />
            <span className="text-[#333] dark:text-[#F0EDE8]">Featured product</span>
          </label>

          {!isNew && (
            <div>
              <label className="text-sm font-medium text-[#800020] dark:text-[#B8860B] block mb-2">Images</label>
              <div className="grid grid-cols-3 gap-3 mb-3">
                {images.map((img) => (
                  <div key={img.id} className="relative group aspect-[4/5] rounded-lg overflow-hidden border border-[#E5E0DB] dark:border-[#333]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img.url} alt={img.alt_text} className="w-full h-full object-cover" />
                    <button
                      onClick={() => handleDeleteImage(img.id)}
                      className="absolute top-1 right-1 p-1.5 rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
              <label className="flex items-center justify-center gap-2 w-full h-24 rounded-xl border-2 border-dashed border-[#E5E0DB] dark:border-[#333] cursor-pointer hover:border-[#800020] dark:hover:border-[#B8860B] transition-colors">
                <Upload className="w-5 h-5 text-[#6B6B6B] dark:text-[#9C9C9C]" />
                <span className="text-sm text-[#6B6B6B] dark:text-[#9C9C9C]">{uploading ? "Uploading..." : "Click to upload images"}</span>
                <input type="file" accept="image/*" multiple className="hidden" onChange={handleUpload} disabled={uploading} />
              </label>
            </div>
          )}

          {!isNew && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-[#800020] dark:text-[#B8860B]">Stock by Size</label>
                <button
                  onClick={() => setVariants([...variants, { id: `new_${Date.now()}`, size: "", color: "", stock_quantity: 0, is_active: true }])}
                  className="text-xs text-[#800020] dark:text-[#B8860B] hover:underline"
                >
                  + Add Size
                </button>
              </div>
              <div className="space-y-2">
                {variants.map((v) => (
                  <div key={v.id} className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-2 p-3 rounded-lg border border-[#E5E0DB] dark:border-[#333]">
                    <input
                      type="text"
                      value={v.size}
                      onChange={(e) => setVariants(variants.map(x => x.id === v.id ? { ...x, size: e.target.value } : x))}
                      placeholder="S, M, L, XL..."
                      className="text-sm font-medium bg-transparent border border-transparent focus:border-[#C5A028] rounded px-1 py-0.5 text-[#333] dark:text-[#F0EDE8] placeholder:text-[#9C9C9C] focus:outline-none"
                    />
                    {v.color && <span className="text-xs text-[#6B6B6B] dark:text-[#9C9C9C]">({v.color})</span>}
                    <input
                      type="number" min="0"
                      value={v.stock_quantity}
                      onChange={async (e) => {
                        const qty = Number(e.target.value)
                        setVariants(variants.map(x => x.id === v.id ? { ...x, stock_quantity: qty } : x))
                        if (!v.id.startsWith("new_")) {
                          const supabase = createClient()
                          await supabase.from("product_variants").update({ stock_quantity: qty }).eq("id", v.id)
                        }
                      }}
                      className="w-20 rounded-lg border border-[#E5E0DB] dark:border-[#333] bg-transparent px-2 py-1 text-sm text-center text-[#333] dark:text-[#F0EDE8] focus:outline-none focus:ring-2 focus:ring-[#C5A028]"
                    />
                    <span className="text-xs text-[#6B6B6B] dark:text-[#9C9C9C] w-14 text-center">{v.is_active ? "Active" : "Inactive"}</span>
                    <button
                      onClick={() => {
                        setVariants(variants.filter(x => x.id !== v.id))
                        if (!v.id.startsWith("new_")) {
                          const supabase = createClient()
                          supabase.from("product_variants").delete().eq("id", v.id)
                        }
                      }}
                      className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                      title="Remove size"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <Button onClick={handleSave} disabled={saving} className="bg-[#800020] hover:bg-[#A00028] dark:bg-[#B8860B] dark:hover:bg-[#D4A020] text-white rounded-full">{saving ? "Saving..." : isNew ? "Create Product" : "Update Product"}</Button>
        </div>
      </main>
    </div>
  )
}