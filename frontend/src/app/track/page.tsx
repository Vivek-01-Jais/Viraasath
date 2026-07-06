"use client"

import { useState } from "react"
import { motion } from "motion/react"
import { Search, Package } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Header } from "@/components/header"

type Order = {
  id: string
  order_number: string
  status: string
  payment_status: string
  total: number
  created_at: string
  items: { product_name: string; quantity: number }[]
}

export default function TrackPage() {
  const [orderNumber, setOrderNumber] = useState("")
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setOrder(null)

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/orders/track/${orderNumber.trim()}`)
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.detail || "Order not found")
      }
      setOrder(await res.json())
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err))
    }
    setLoading(false)
  }

  const statusSteps = ["pending", "confirmed", "shipped", "delivered"]
  const currentStep = order ? statusSteps.indexOf(order.status) : -1

  return (
    <div className="flex flex-col flex-1">
      <Header />
      <main className="flex-1 px-6 py-8 max-w-2xl mx-auto w-full">
        <div className="mb-8">
          <span className="text-[#800020] dark:text-[#B8860B] text-xs tracking-[0.2em] uppercase font-medium">Support</span>
          <h1 className="font-heading text-4xl mt-1 text-[#333] dark:text-[#F0EDE8]">Track Your Order</h1>
          <p className="text-[#6B6B6B] dark:text-[#9C9C9C] text-sm mt-2">Enter your order number to check status</p>
          <div className="w-12 h-0.5 bg-[#C5A028] mt-4" />
        </div>

        <form onSubmit={handleSearch} className="flex gap-2 mb-8">
          <Input
            placeholder="e.g. VR250620ABC123"
            value={orderNumber}
            onChange={(e) => setOrderNumber(e.target.value)}
            className="flex-1 border-[#E5E0DB] dark:border-[#333]"
            required
          />
          <Button type="submit" disabled={loading} className="bg-[#800020] hover:bg-[#A00028] dark:bg-[#B8860B] dark:hover:bg-[#D4A020] text-white rounded-full">
            <Search className="w-4 h-4 mr-1" /> {loading ? "Searching..." : "Track"}
          </Button>
        </form>

        {error && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
            <Package className="w-12 h-12 mx-auto text-[#E5E0DB] dark:text-[#333] mb-3" />
            <p className="text-[#6B6B6B] dark:text-[#9C9C9C]">{error}</p>
          </motion.div>
        )}

        {order && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="border border-[#E5E0DB] dark:border-[#333] rounded-xl p-5 space-y-2">
              <div className="flex justify-between text-sm"><span className="text-[#6B6B6B] dark:text-[#9C9C9C]">Order</span><span className="font-medium text-[#333] dark:text-[#F0EDE8]">{order.order_number}</span></div>
              <div className="flex justify-between text-sm"><span className="text-[#6B6B6B] dark:text-[#9C9C9C]">Status</span><span className="font-medium capitalize text-[#333] dark:text-[#F0EDE8]">{order.status}</span></div>
              <div className="flex justify-between text-sm"><span className="text-[#6B6B6B] dark:text-[#9C9C9C]">Total</span><span className="font-medium text-[#333] dark:text-[#F0EDE8]">₹{order.total.toLocaleString("en-IN")}</span></div>
              <div className="flex justify-between text-sm"><span className="text-[#6B6B6B] dark:text-[#9C9C9C]">Date</span><span className="font-medium text-[#333] dark:text-[#F0EDE8]">{new Date(order.created_at).toLocaleDateString("en-IN")}</span></div>
            </div>

            <div className="border border-[#E5E0DB] dark:border-[#333] rounded-xl p-5">
              <h3 className="font-heading text-sm text-[#333] dark:text-[#F0EDE8] mb-4">Order Progress</h3>
              <div className="space-y-3">
                {statusSteps.map((step, i) => {
                  const isActive = i <= currentStep
                  const isCurrent = i === currentStep
                  return (
                    <div key={step} className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full shrink-0 ${isActive ? (isCurrent ? "bg-[#800020] dark:bg-[#B8860B] ring-2 ring-[#C5A028]/30" : "bg-emerald-500") : "bg-[#E5E0DB] dark:bg-[#333]"}`} />
                      <span className={`text-sm capitalize ${isActive ? "font-medium text-[#333] dark:text-[#F0EDE8]" : "text-[#6B6B6B] dark:text-[#9C9C9C]"}`}>{step}</span>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="border border-[#E5E0DB] dark:border-[#333] rounded-xl p-5">
              <h3 className="font-heading text-sm text-[#333] dark:text-[#F0EDE8] mb-3">Items</h3>
              {order.items.map((item, i) => (
                <div key={i} className="flex justify-between text-sm py-1">
                  <span className="text-[#333] dark:text-[#F0EDE8]">{item.product_name}</span>
                  <span className="text-[#6B6B6B] dark:text-[#9C9C9C]">× {item.quantity}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </main>
    </div>
  )
}
