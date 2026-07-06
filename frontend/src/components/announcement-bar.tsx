"use client"

import { useState } from "react"
import { X } from "lucide-react"

export function AnnouncementBar() {
  const [visible, setVisible] = useState(true)

  if (!visible) return null

  return (
    <div className="bg-[#800020] dark:bg-[#B8860B] text-white text-center text-xs sm:text-sm py-2 px-4 relative">
      <span>Free shipping on orders above ₹999 — Use code <strong>VIRASAT10</strong> for 10% off</span>
      <button onClick={() => setVisible(false)} className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 hover:opacity-70">
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  )
}