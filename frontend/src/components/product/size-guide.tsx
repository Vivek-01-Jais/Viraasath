"use client"

import { useState } from "react"
import { X, Ruler } from "lucide-react"

const SIZE_CHART = [
  { size: "XS", bust: "30-32", waist: "24-26", hip: "32-34", length: "36" },
  { size: "S", bust: "32-34", waist: "26-28", hip: "34-36", length: "37" },
  { size: "M", bust: "34-36", waist: "28-30", hip: "36-38", length: "38" },
  { size: "L", bust: "36-38", waist: "30-32", hip: "38-40", length: "39" },
  { size: "XL", bust: "38-41", waist: "32-35", hip: "40-43", length: "40" },
  { size: "XXL", bust: "41-44", waist: "35-38", hip: "43-46", length: "40" },
]

export function SizeGuide() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button onClick={() => setOpen(true)} className="inline-flex items-center gap-1.5 text-xs text-[#800020] dark:text-[#B8860B] hover:underline font-medium mt-1">
        <Ruler className="w-3.5 h-3.5" /> Size Guide
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setOpen(false)}>
          <div className="w-full max-w-lg rounded-xl border border-[#E5E0DB] dark:border-[#333] bg-[#F8F8FF] dark:bg-[#1A1A1A] shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#E5E0DB] dark:border-[#333]">
              <h3 className="font-heading text-lg text-[#333] dark:text-[#F0EDE8]">Size Guide</h3>
               <button onClick={() => setOpen(false)} className="p-2 text-[#6B6B6B] hover:text-[#333] dark:hover:text-[#F0EDE8]"><X className="w-4 h-4" /></button>
            </div>
            <div className="p-5 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#E5E0DB] dark:border-[#333]">
                    <th className="text-left py-2 pr-4 font-semibold text-[#800020] dark:text-[#B8860B]">Size</th>
                    <th className="text-left py-2 pr-4 font-semibold text-[#333] dark:text-[#F0EDE8]">Bust (in)</th>
                    <th className="text-left py-2 pr-4 font-semibold text-[#333] dark:text-[#F0EDE8]">Waist (in)</th>
                    <th className="text-left py-2 pr-4 font-semibold text-[#333] dark:text-[#F0EDE8]">Hip (in)</th>
                    <th className="text-left py-2 font-semibold text-[#333] dark:text-[#F0EDE8]">Length (in)</th>
                  </tr>
                </thead>
                <tbody>
                  {SIZE_CHART.map((row) => (
                    <tr key={row.size} className="border-b border-[#E5E0DB]/50 dark:border-[#333]/50">
                      <td className="py-2.5 pr-4 font-medium text-[#800020] dark:text-[#B8860B]">{row.size}</td>
                      <td className="py-2.5 pr-4 text-[#6B6B6B] dark:text-[#9C9C9C]">{row.bust}</td>
                      <td className="py-2.5 pr-4 text-[#6B6B6B] dark:text-[#9C9C9C]">{row.waist}</td>
                      <td className="py-2.5 pr-4 text-[#6B6B6B] dark:text-[#9C9C9C]">{row.hip}</td>
                      <td className="py-2.5 text-[#6B6B6B] dark:text-[#9C9C9C]">{row.length}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="text-xs text-[#9C9C9C] mt-4">Measurements are in inches. If between sizes, size up for a relaxed fit.</p>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
