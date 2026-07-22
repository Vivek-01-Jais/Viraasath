"use client"

import { useState } from "react"
import { toast } from "sonner"

export function Newsletter() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) return
    setLoading(true)
    await new Promise(r => setTimeout(r, 800))
    toast.success("You're subscribed! Stay tuned for updates.")
    setEmail("")
    setLoading(false)
  }

  return (
    <div className="mt-4">
      <h4 className="text-xs tracking-[0.15em] uppercase text-[#6B6B6B] dark:text-[#9C9C9C] font-medium mb-2">Stay in Touch</h4>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Your email"
          required
          className="flex-1 min-w-0 rounded-lg border border-[#E5E0DB] dark:border-[#333] bg-transparent px-2.5 py-1.5 text-xs text-[#333] dark:text-[#F0EDE8] placeholder:text-[#9C9C9C] focus:outline-none focus:ring-1 focus:ring-[#C5A028]"
        />
        <button
          type="submit"
          disabled={loading}
          className="px-3 py-1.5 rounded-lg bg-[#800020] hover:bg-[#A00028] dark:bg-[#B8860B] dark:hover:bg-[#D4A020] text-white text-xs font-medium disabled:opacity-50 whitespace-nowrap transition-colors"
        >
          {loading ? "..." : "Subscribe"}
        </button>
      </form>
    </div>
  )
}
