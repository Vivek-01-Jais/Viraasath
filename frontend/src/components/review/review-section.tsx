"use client"

import { useEffect, useState } from "react"
import { Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/context/auth-context"
import { useRouter } from "next/navigation"
import { createClient, isSupabaseAvailable } from "@/lib/supabase/client"
import { toast } from "sonner"

type Review = {
  id: string
  rating: number
  comment: string | null
  created_at: string
  profile: { full_name: string } | null
}

export function ReviewSection({ productId }: { productId: string }) {
  const { user } = useAuth()
  const router = useRouter()
  const [reviews, setReviews] = useState<Review[]>([])
  const [average, setAverage] = useState(0)
  const [total, setTotal] = useState(0)
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadReviews() {
      if (!isSupabaseAvailable()) { setLoading(false); return }
      const supabase = createClient()
      const { data } = await supabase
        .from("reviews")
        .select("*, profile:profiles(full_name)")
        .eq("product_id", productId)
        .eq("is_approved", true)
        .order("created_at", { ascending: false })

      const reviewsData = data ?? []
      setReviews(reviewsData)

      if (reviewsData.length > 0) {
        const avg = reviewsData.reduce((s: number, r: Review) => s + r.rating, 0) / reviewsData.length
        setAverage(Math.round(avg * 10) / 10)
        setTotal(reviewsData.length)
      }
      setLoading(false)
    }
    loadReviews()
  }, [productId])

  async function handleSubmit() {
    if (!user) { router.push("/login"); return }
    if (rating === 0) { toast.error("Please select a rating"); return }
    setSubmitting(true)

    const supabase = createClient()
    const { error } = await supabase.from("reviews").insert({
      product_id: productId,
      user_id: user.id,
      rating,
      comment: comment || null,
    })

    if (error) {
      toast.error(error.message === 'duplicate key value violates unique constraint "reviews_product_id_user_id_key"' ? "You've already reviewed this product" : error.message)
    } else {
      toast.success("Review submitted! Awaiting moderation.")
      setRating(0)
      setComment("")
    }
    setSubmitting(false)
  }

  return (
    <div className="mt-10">
      <div className="flex items-center gap-4 mb-6">
        <h3 className="font-heading text-lg text-[#333] dark:text-[#F0EDE8]">Reviews</h3>
        {total > 0 && (
          <div className="flex items-center gap-1 text-sm">
            <span className="text-[#C5A028] font-semibold">{average}</span>
            <div className="flex">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className={`w-3.5 h-3.5 ${i < Math.round(average) ? "fill-[#C5A028] text-[#C5A028]" : "text-[#E5E0DB] dark:text-[#333]"}`} />
              ))}
            </div>
            <span className="text-[#6B6B6B] dark:text-[#9C9C9C]">({total})</span>
          </div>
        )}
      </div>

      {user && (
        <div className="border border-[#E5E0DB] dark:border-[#333] rounded-xl p-5 mb-6 space-y-3">
          <p className="text-sm font-medium text-[#333] dark:text-[#F0EDE8]">Write a review</p>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button key={star} onClick={() => setRating(star)} className="p-0.5">
                <Star className={`w-5 h-5 ${star <= rating ? "fill-[#C5A028] text-[#C5A028]" : "text-[#E5E0DB] dark:text-[#333]"}`} />
              </button>
            ))}
          </div>
          <textarea
            className="w-full rounded-xl border border-[#E5E0DB] dark:border-[#333] bg-transparent px-3 py-2 text-sm min-h-[80px] text-[#333] dark:text-[#F0EDE8] placeholder:text-[#6B6B6B] dark:placeholder:text-[#9C9C9C]"
            placeholder="Share your thoughts about this product..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
          <Button size="sm" className="bg-[#800020] hover:bg-[#A00028] dark:bg-[#B8860B] dark:hover:bg-[#D4A020] text-white rounded-full" onClick={handleSubmit} disabled={submitting}>
            {submitting ? "Submitting..." : "Submit Review"}
          </Button>
        </div>
      )}

      {loading ? (
        <p className="text-sm text-[#9C9C9C]">Loading reviews...</p>
      ) : reviews.length === 0 ? (
        <p className="text-sm text-[#6B6B6B] dark:text-[#9C9C9C]">No reviews yet. Be the first to review!</p>
      ) : (
        <div className="space-y-4">
          {reviews.map((r) => (
            <div key={r.id} className="border-b border-[#E5E0DB] dark:border-[#333] pb-4">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-medium text-[#333] dark:text-[#F0EDE8]">{r.profile?.full_name ?? "Anonymous"}</span>
                <div className="flex">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={`w-3 h-3 ${i < r.rating ? "fill-[#C5A028] text-[#C5A028]" : "text-[#E5E0DB] dark:text-[#333]"}`} />
                  ))}
                </div>
              </div>
              {r.comment && <p className="text-sm text-[#6B6B6B] dark:text-[#9C9C9C]">{r.comment}</p>}
              <p className="text-xs text-[#6B6B6B] dark:text-[#9C9C9C] mt-1">{new Date(r.created_at).toLocaleDateString("en-IN")}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
