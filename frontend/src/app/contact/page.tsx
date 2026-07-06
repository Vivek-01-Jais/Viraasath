"use client"

import { useState } from "react"
import { motion } from "motion/react"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Mail, MessageSquare, Phone } from "lucide-react"
import { toast } from "sonner"

export default function ContactPage() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [message, setMessage] = useState("")
  const [sending, setSending] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || !email.trim() || !message.trim()) {
      toast.error("Please fill in all fields")
      return
    }
    setSending(true)
    await new Promise((r) => setTimeout(r, 1000))
    toast.success("Message sent! We'll get back to you soon.")
    setName("")
    setEmail("")
    setMessage("")
    setSending(false)
  }

  return (
    <div className="flex flex-col flex-1">
      <Header />
      <main className="flex-1 px-6 py-8 max-w-2xl mx-auto w-full">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="mb-8">
            <h1 className="text-3xl font-heading font-bold text-[#800020] dark:text-[#B8860B]">Contact Us</h1>
            <div className="w-12 h-0.5 bg-[#C5A028] mt-2" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <div className="border border-[#E5E0DB] dark:border-[#333] rounded-xl p-4 text-center">
              <Mail className="w-6 h-6 mx-auto mb-2 text-[#800020] dark:text-[#B8860B]" />
              <p className="text-sm font-medium text-[#333] dark:text-[#F0EDE8]">Email</p>
              <p className="text-xs text-[#6B6B6B] dark:text-[#9C9C9C]">hello@viraasat.com</p>
            </div>
            <div className="border border-[#E5E0DB] dark:border-[#333] rounded-xl p-4 text-center">
              <Phone className="w-6 h-6 mx-auto mb-2 text-[#800020] dark:text-[#B8860B]" />
              <p className="text-sm font-medium text-[#333] dark:text-[#F0EDE8]">WhatsApp</p>
              <a href="https://wa.me/919876543210" target="_blank" className="text-xs text-[#6B6B6B] dark:text-[#9C9C9C] hover:text-[#800020] dark:hover:text-[#B8860B]">+91 98765 43210</a>
            </div>
            <div className="border border-[#E5E0DB] dark:border-[#333] rounded-xl p-4 text-center">
              <MessageSquare className="w-6 h-6 mx-auto mb-2 text-[#800020] dark:text-[#B8860B]" />
              <p className="text-sm font-medium text-[#333] dark:text-[#F0EDE8]">Response Time</p>
              <p className="text-xs text-[#6B6B6B] dark:text-[#9C9C9C]">Within 24 hours</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="border border-[#E5E0DB] dark:border-[#333] rounded-xl p-6 space-y-4">
            <div>
              <label className="block text-sm text-[#6B6B6B] dark:text-[#9C9C9C] mb-1">Name</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded-xl border border-[#E5E0DB] dark:border-[#333] bg-transparent px-3 py-2 text-sm text-[#333] dark:text-[#F0EDE8] focus:outline-none focus:ring-2 focus:ring-[#C5A028]" />
            </div>
            <div>
              <label className="block text-sm text-[#6B6B6B] dark:text-[#9C9C9C] mb-1">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-xl border border-[#E5E0DB] dark:border-[#333] bg-transparent px-3 py-2 text-sm text-[#333] dark:text-[#F0EDE8] focus:outline-none focus:ring-2 focus:ring-[#C5A028]" />
            </div>
            <div>
              <label className="block text-sm text-[#6B6B6B] dark:text-[#9C9C9C] mb-1">Message</label>
              <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={4} className="w-full rounded-xl border border-[#E5E0DB] dark:border-[#333] bg-transparent px-3 py-2 text-sm text-[#333] dark:text-[#F0EDE8] focus:outline-none focus:ring-2 focus:ring-[#C5A028] resize-none" />
            </div>
            <Button type="submit" disabled={sending} className="w-full bg-[#800020] hover:bg-[#A00028] dark:bg-[#B8860B] dark:hover:bg-[#D4A020] text-white rounded-full">
              {sending ? "Sending..." : "Send Message"}
            </Button>
          </form>
        </motion.div>
      </main>
    </div>
  )
}
