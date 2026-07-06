"use client"

import { useState } from "react"
import { X, Package } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

export function BulkEnquiry({ productName }: { productName: string }) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [quantity, setQuantity] = useState("")
  const [message, setMessage] = useState("")
  const [sending, setSending] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || !email.trim() || !quantity.trim()) {
      toast.error("Please fill in name, email and quantity")
      return
    }
    setSending(true)
    await new Promise((r) => setTimeout(r, 1000))
    toast.success("Enquiry sent! We'll contact you shortly.")
    setName("")
    setEmail("")
    setQuantity("")
    setMessage("")
    setOpen(false)
    setSending(false)
  }

  return (
    <>
      <button onClick={() => setOpen(true)} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-dashed border-[#E5E0DB] dark:border-[#333] text-sm text-[#6B6B6B] dark:text-[#9C9C9C] hover:border-[#800020] dark:hover:border-[#B8860B] hover:text-[#800020] dark:hover:text-[#B8860B] transition-colors">
        <Package className="w-4 h-4" /> Enquire for Bulk Order
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setOpen(false)}>
          <div className="w-full max-w-md rounded-xl border border-[#E5E0DB] dark:border-[#333] bg-[#F8F8FF] dark:bg-[#1A1A1A] shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#E5E0DB] dark:border-[#333]">
              <h3 className="font-heading text-lg text-[#333] dark:text-[#F0EDE8]">Bulk Order Enquiry</h3>
              <button onClick={() => setOpen(false)} className="p-2 text-[#6B6B6B] hover:text-[#333] dark:hover:text-[#F0EDE8]"><X className="w-4 h-4" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <p className="text-sm text-[#6B6B6B] dark:text-[#9C9C9C]">Interested in bulk purchasing <strong className="text-[#333] dark:text-[#F0EDE8]">{productName}</strong>? Fill in your details and we&apos;ll get back to you.</p>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" className="w-full rounded-xl border border-[#E5E0DB] dark:border-[#333] bg-transparent px-3 py-2 text-sm text-[#333] dark:text-[#F0EDE8] placeholder:text-[#6B6B6B] focus:outline-none focus:ring-2 focus:ring-[#C5A028]" />
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Your email" className="w-full rounded-xl border border-[#E5E0DB] dark:border-[#333] bg-transparent px-3 py-2 text-sm text-[#333] dark:text-[#F0EDE8] placeholder:text-[#6B6B6B] focus:outline-none focus:ring-2 focus:ring-[#C5A028]" />
              <input type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} placeholder="Approximate quantity" className="w-full rounded-xl border border-[#E5E0DB] dark:border-[#333] bg-transparent px-3 py-2 text-sm text-[#333] dark:text-[#F0EDE8] placeholder:text-[#6B6B6B] focus:outline-none focus:ring-2 focus:ring-[#C5A028]" />
              <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={3} placeholder="Any specific requirements?" className="w-full rounded-xl border border-[#E5E0DB] dark:border-[#333] bg-transparent px-3 py-2 text-sm text-[#333] dark:text-[#F0EDE8] placeholder:text-[#6B6B6B] focus:outline-none focus:ring-2 focus:ring-[#C5A028] resize-none" />
              <Button type="submit" disabled={sending} className="w-full bg-[#800020] hover:bg-[#A00028] dark:bg-[#B8860B] dark:hover:bg-[#D4A020] text-white rounded-full">
                {sending ? "Sending..." : "Send Enquiry"}
              </Button>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
