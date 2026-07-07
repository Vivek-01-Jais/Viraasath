"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { useAuth } from "@/lib/context/auth-context"
import { API_URL, getAuthHeaders } from "@/lib/config"
import { toast } from "sonner"
import { Save } from "lucide-react"

type ContentItem = {
  key: string
  value: string
}

const LABELS: Record<string, string> = {
  hero_badge: "Hero Badge Text",
  hero_title_1: "Hero Title (Line 1)",
  hero_title_2: "Hero Title (Line 2 - Italic)",
  hero_tagline: "Hero Tagline",
  hero_cta: "Hero Button Text",
  ethos_title_1: "Ethos Card 1 Title",
  ethos_desc_1: "Ethos Card 1 Description",
  ethos_title_2: "Ethos Card 2 Title",
  ethos_desc_2: "Ethos Card 2 Description",
  ethos_title_3: "Ethos Card 3 Title",
  ethos_desc_3: "Ethos Card 3 Description",
}

export default function AdminSiteContentPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [items, setItems] = useState<ContentItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState<string | null>(null)

  const loadContent = useCallback(async () => {
    try {
      const headers = await getAuthHeaders()
      const res = await fetch(`${API_URL}/api/admin/site-content`, { headers })
      if (res.ok) {
        const data = await res.json()
        if (data.length === 0) {
          setError("No content found. Run migration 007_site_content.sql in Supabase SQL Editor.")
        } else {
          setItems(data)
        }
      } else {
        const err = await res.json()
        setError(err.detail || "Failed to load site content. Run migration 007_site_content.sql first.")
      }
    } catch {
      setError("Failed to connect. Is the backend running?")
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    if (!authLoading && !user) { router.push("/login"); return }
    if (user) loadContent()
  }, [user, authLoading, router, loadContent])

  async function handleSave(item: ContentItem) {
    setSaving(item.key)
    try {
      const headers = await getAuthHeaders()
      const res = await fetch(`${API_URL}/api/admin/site-content`, {
        method: "PUT",
        headers,
        body: JSON.stringify({ key: item.key, value: item.value }),
      })
      if (res.ok) {
        toast.success("Saved!")
      } else {
        const err = await res.json()
        toast.error(err.detail || "Failed to save")
      }
    } catch {
      toast.error("Failed to save")
    }
    setSaving(null)
  }

  function handleChange(key: string, value: string) {
    setItems((prev) => prev.map((i) => (i.key === key ? { ...i, value } : i)))
  }

  if (loading) {
    return (
      <div className="flex flex-col flex-1">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <p className="text-[#9C9C9C]">Loading...</p>
        </main>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col flex-1">
        <Header />
        <main className="flex-1 px-6 py-8 max-w-3xl mx-auto w-full">
          <h1 className="font-heading text-3xl text-[#333] dark:text-[#F0EDE8] mb-2">Site Content</h1>
          <div className="border border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/20 rounded-xl p-6 text-center">
            <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="flex flex-col flex-1">
      <Header />
      <main className="flex-1 px-6 py-8 max-w-3xl mx-auto w-full">
        <h1 className="font-heading text-3xl text-[#333] dark:text-[#F0EDE8] mb-2">Site Content</h1>
        <p className="text-sm text-[#6B6B6B] dark:text-[#9C9C9C] mb-8">Edit homepage text — changes reflect immediately.</p>

        <div className="space-y-4">
          {items.map((item) => (
            <div key={item.key} className="border border-[#E5E0DB] dark:border-[#333] rounded-xl p-4">
              <label className="block text-xs text-[#6B6B6B] dark:text-[#9C9C9C] uppercase tracking-wide mb-1.5">
                {LABELS[item.key] || item.key}
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={item.value}
                  onChange={(e) => handleChange(item.key, e.target.value)}
                  className="flex-1 px-3 py-2 text-sm border border-[#E5E0DB] dark:border-[#333] rounded-lg bg-white dark:bg-[#1A1A1A] text-[#333] dark:text-[#F0EDE8] placeholder-[#9C9C9C]"
                />
                <button
                  onClick={() => handleSave(item)}
                  disabled={saving === item.key}
                  className="px-3 py-2 bg-[#800020] hover:bg-[#A00028] dark:bg-[#B8860B] dark:hover:bg-[#D4A020] text-white rounded-lg text-sm disabled:opacity-50 transition-colors"
                >
                  {saving === item.key ? "..." : <Save className="w-4 h-4" />}
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
