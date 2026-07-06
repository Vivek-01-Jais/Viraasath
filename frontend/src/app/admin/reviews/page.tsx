"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Check, X } from "lucide-react"
import { Header } from "@/components/header"
import { useAuth } from "@/lib/context/auth-context"
import { createClient, isSupabaseAvailable } from "@/lib/supabase/client"
import { API_URL, getAuthHeaders } from "@/lib/config"

type Review = {
  id: string
  rating: number
  comment: string | null
  is_approved: boolean
  created_at: string
  product: { name: string } | null
  profile: { full_name: string } | null
}

export default function AdminReviewsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const currentUserId = user?.id

  const loadReviews = useCallback(async () => {
    if (!isSupabaseAvailable() || !currentUserId) { setLoading(false); return }
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

    const { data } = await supabase
      .from("reviews")
      .select("*, product:products(name), profile:profiles(full_name)")
      .order("created_at", { ascending: false })
    setReviews(data ?? [])
    setLoading(false)
  }, [currentUserId, router])

  useEffect(() => {
    if (user) queueMicrotask(() => loadReviews())
  }, [user, loadReviews])

  async function moderateReview(id: string, approved: boolean) {
    const supabase = createClient()
    await supabase.from("reviews").update({ is_approved: approved }).eq("id", id)
    toast.success(approved ? "Review approved" : "Review rejected")
    loadReviews()
  }

  return (
    <div className="flex flex-col flex-1">
      <Header />
      <main className="flex-1 px-6 py-8 max-w-4xl mx-auto w-full">
        <div className="mb-6">
          <h1 className="text-2xl font-heading font-bold text-[#800020] dark:text-[#B8860B]">Review Moderation</h1>
          <div className="w-12 h-0.5 bg-[#C5A028] mt-2" />
        </div>

        {loading ? (
          <div className="text-center py-24 text-[#6B6B6B] dark:text-[#9C9C9C]">Loading...</div>
        ) : (
          <div className="space-y-3">
            {reviews.length === 0 ? (
              <p className="text-center py-12 text-[#6B6B6B] dark:text-[#9C9C9C]">No reviews yet</p>
            ) : (
              reviews.map((r) => (
                <div key={r.id} className={`border border-[#E5E0DB] dark:border-[#333] rounded-xl p-4 ${r.is_approved ? "" : "border-[#C5A028] bg-[#C5A028]/5"}`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-sm">{r.profile?.full_name ?? "Anonymous"}</p>
                      <p className="text-xs text-[#6B6B6B] dark:text-[#9C9C9C]">{r.product?.name ?? "Unknown product"}</p>
                      <div className="flex items-center gap-0.5 my-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <span key={i} className={`text-sm ${i < r.rating ? "text-[#C5A028]" : "text-zinc-200 dark:text-[#333]"}`}>★</span>
                        ))}
                      </div>
                      {r.comment && <p className="text-sm text-[#333] dark:text-[#F0EDE8]">{r.comment}</p>}
                    </div>
                    <div className="flex gap-2">
                      {!r.is_approved && (
                        <button onClick={() => moderateReview(r.id, true)} className="p-2 text-[#800020] hover:bg-[#800020]/10 dark:text-[#B8860B] dark:hover:bg-[#B8860B]/10 rounded"><Check className="w-4 h-4" /></button>
                      )}
                      <button onClick={() => moderateReview(r.id, false)} className="p-2 text-red-500 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 rounded"><X className="w-4 h-4" /></button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </main>
    </div>
  )
}
