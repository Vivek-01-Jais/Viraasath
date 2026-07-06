"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Search, X } from "lucide-react"
import { getDemoModule } from "@/lib/demo-loader"

type SearchResult = { id: string; name: string; slug: string; price: number }

export function SearchCommand() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchResult[]>([])
  const inputRef = useRef<HTMLInputElement>(null)
  const modalRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (open) inputRef.current?.focus()
  }, [open])

  useEffect(() => {
    if (query.length < 1) { setResults([]); return }
    const timer = setTimeout(async () => {
      const q = query.toLowerCase()
      const demo = await getDemoModule()
      if (demo) {
        setResults(demo.demoProducts.filter(p => p.name.toLowerCase().includes(q) || (p.description && p.description.toLowerCase().includes(q))).slice(0, 6))
      } else {
        const { createClient } = await import("@/lib/supabase/client")
        const supabase = createClient()
        const { data } = await supabase.from("products").select("id, name, slug, price").ilike("name", `%${q}%`).limit(6)
        setResults(data ?? [])
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [query])

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") { e.preventDefault(); setOpen(o => !o) }
      if (e.key === "Escape") setOpen(false)
    }
    const handleClick = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("keydown", handleKey)
    document.addEventListener("mousedown", handleClick)
    return () => { document.removeEventListener("keydown", handleKey); document.removeEventListener("mousedown", handleClick) }
  }, [])

  return (
    <>
      <button onClick={() => setOpen(true)} className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[#E5E0DB] dark:border-[#333] text-xs text-[#9C9C9C] hover:border-[#800020]/30 dark:hover:border-[#B8860B]/30 transition-colors w-full max-w-[200px]">
        <Search className="w-3.5 h-3.5" />
        <span>Search products...</span>
        <kbd className="ml-auto hidden sm:inline text-[10px] px-1 py-0.5 rounded bg-[#F5F0EB] dark:bg-[#242424] text-[#6B6B6B] dark:text-[#9C9C9C]">⌘K</kbd>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] bg-black/40">
          <div ref={modalRef} className="w-full max-w-lg mx-4 rounded-xl border border-[#E5E0DB] dark:border-[#333] bg-[#F8F8FF] dark:bg-[#1A1A1A] shadow-2xl overflow-hidden">
            <div className="flex items-center gap-3 px-4 py-3 border-b border-[#E5E0DB] dark:border-[#333]">
              <Search className="w-4 h-4 text-[#6B6B6B] dark:text-[#9C9C9C] shrink-0" />
              <input
                ref={inputRef}
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search products..."
                className="flex-1 bg-transparent text-sm text-[#333] dark:text-[#F0EDE8] placeholder:text-[#9C9C9C] focus:outline-none"
              />
              {query && <button onClick={() => setQuery("")} className="p-0.5 text-[#6B6B6B] hover:text-[#333] dark:hover:text-[#F0EDE8]"><X className="w-3.5 h-3.5" /></button>}
            </div>
            {results.length > 0 && (
              <div className="max-h-72 overflow-y-auto p-2">
                {results.map(r => (
                  <button key={r.id} onClick={(e) => { e.preventDefault(); setOpen(false); setQuery(""); router.push(`/products/${r.slug}`) }} className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-[#F5F0EB] dark:hover:bg-[#242424] transition-colors text-left">
                    <span className="text-sm text-[#333] dark:text-[#F0EDE8]">{r.name}</span>
                    <span className="text-xs text-[#6B6B6B] dark:text-[#9C9C9C] font-medium">₹{r.price.toLocaleString("en-IN")}</span>
                  </button>
                ))}
                <button onClick={(e) => { e.preventDefault(); setOpen(false); setQuery(""); router.push(`/products?q=${encodeURIComponent(query)}`) }} className="w-full flex items-center justify-center gap-1 px-3 py-2.5 mt-1 rounded-lg text-xs text-[#800020] dark:text-[#B8860B] hover:bg-[#F5F0EB] dark:hover:bg-[#242424] transition-colors border border-dashed border-[#E5E0DB] dark:border-[#333]">
                  <Search className="w-3 h-3" /> View all results for &quot;{query}&quot;
                </button>
              </div>
            )}
            {query && results.length === 0 && (
              <p className="text-center py-8 text-sm text-[#9C9C9C]">No products found</p>
            )}
          </div>
        </div>
      )}
    </>
  )
}