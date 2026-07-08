"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { ShoppingBag, Heart, Moon, Sun, User, LogOut, ChevronDown, Shield, LogIn, UserPlus } from "lucide-react"
import { useTheme } from "next-themes"
import { useAuth } from "@/lib/context/auth-context"
import { useCartStore } from "@/lib/stores/cart-store"
import { Button } from "@/components/ui/button"
import { useSyncExternalStore } from "react"
import { SearchCommand } from "@/components/search-command"
import { MobileNav } from "@/components/mobile-nav"
import { AnnouncementBar } from "@/components/announcement-bar"
import { createClient, isSupabaseAvailable } from "@/lib/supabase/client"
import { API_URL, getAuthHeaders } from "@/lib/config"

const emptySubscribe = () => () => {}

type NavCategory = { id: string; slug: string; name: string }

export function Header() {
  const { user, loading, signOut } = useAuth()
  const { theme, setTheme } = useTheme()
  const { openCart, totalItems } = useCartStore()
  const itemCount = totalItems()
  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false)
  const [categories, setCategories] = useState<NavCategory[]>([])
  const [shopOpen, setShopOpen] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const shopRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!shopOpen) return
    function handleClick(e: MouseEvent) {
      if (shopRef.current && !shopRef.current.contains(e.target as Node)) {
        setShopOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [shopOpen])

  useEffect(() => {
    if (!isSupabaseAvailable()) return
    const supabase = createClient()
    supabase.from("categories").select("id, name").eq("is_active", true).order("name").then((res: { data: { id: string; name: string }[] | null }) => {
      if (res.data && res.data.length > 0) {
        setCategories(res.data.map(c => ({ ...c, slug: c.name.toLowerCase().replace(/\s+/g, "-") })))
      }
    })
  }, [])

  useEffect(() => {
    if (!user) { setIsAdmin(false); return }
    getAuthHeaders().then(headers => {
      fetch(`${API_URL}/api/admin/verify`, { headers }).then(r => setIsAdmin(r.ok)).catch(() => setIsAdmin(false))
    })
  }, [user])

  return (
    <>
      <AnnouncementBar />
      <header className="sticky top-0 z-30 border-b border-[#800020]/10 dark:border-[#B8860B]/10 bg-[#F8F8FF]/95 dark:bg-[#1A1A1A]/95 backdrop-blur-md supports-[backdrop-filter]:bg-[#F8F8FF]/80 dark:supports-[backdrop-filter]:bg-[#1A1A1A]/80">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-4 h-16">
          <div className="flex items-center gap-4">
            <MobileNav categories={categories} />
            <Link href="/" className="flex items-center gap-2.5">
              <span className="font-heading text-xl font-bold tracking-tight text-[#800020] dark:text-[#B8860B]">
                वि rasaath
              </span>
            </Link>
          </div>

          <nav className="hidden md:flex items-center gap-6">
            <div className="relative" ref={shopRef}>
              <button
                onClick={() => setShopOpen(!shopOpen)}
                className="flex items-center gap-1 text-sm text-[#6B6B6B] hover:text-[#800020] dark:text-[#9C9C9C] dark:hover:text-[#B8860B] transition-colors font-medium tracking-wide"
              >
                Shop
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${shopOpen ? "rotate-180" : ""}`} />
              </button>
              {shopOpen && (
                <div className="absolute top-full left-0 mt-2 w-48 rounded-lg border border-[#800020]/10 dark:border-[#B8860B]/10 bg-[#F8F8FF] dark:bg-[#1A1A1A] shadow-lg py-1.5 z-50">
                  <Link
                    href="/products"
                    onClick={() => setShopOpen(false)}
                    className="block px-4 py-2 text-sm text-[#6B6B6B] hover:text-[#800020] dark:text-[#9C9C9C] dark:hover:text-[#B8860B] hover:bg-[#800020]/5 dark:hover:bg-[#B8860B]/10 transition-colors"
                  >
                    All Products
                  </Link>
                  <div className="border-t border-[#800020]/10 dark:border-[#B8860B]/10 my-1" />
                  {categories.map((cat) => (
                    <Link
                      key={cat.id}
                      href={`/products?category=${cat.id}`}
                      onClick={() => setShopOpen(false)}
                      className="block px-4 py-2 text-sm text-[#6B6B6B] hover:text-[#800020] dark:text-[#9C9C9C] dark:hover:text-[#B8860B] hover:bg-[#800020]/5 dark:hover:bg-[#B8860B]/10 transition-colors"
                    >
                      {cat.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
            <Link href="/track" className="text-sm text-[#6B6B6B] hover:text-[#800020] dark:text-[#9C9C9C] dark:hover:text-[#B8860B] transition-colors tracking-wide">
              Track
            </Link>
          </nav>

          <div className="flex items-center gap-2">
            <div className="hidden sm:block">
              <SearchCommand />
            </div>

            {mounted && (
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="p-2 text-[#6B6B6B] hover:text-[#800020] dark:text-[#9C9C9C] dark:hover:text-[#B8860B] hover:bg-[#800020]/5 dark:hover:bg-[#B8860B]/10 rounded-lg transition-colors"
                aria-label="Toggle theme"
              >
                {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
            )}

            {user && (
              <>
                {isAdmin && (
                  <Link href="/admin" className="p-2 text-[#6B6B6B] hover:text-[#800020] dark:text-[#9C9C9C] dark:hover:text-[#B8860B] hover:bg-[#800020]/5 dark:hover:bg-[#B8860B]/10 rounded-lg transition-colors" title="Admin">
                    <Shield className="w-4 h-4" />
                  </Link>
                )}
                <Link href="/wishlist" className="p-2 text-[#6B6B6B] hover:text-[#800020] dark:text-[#9C9C9C] dark:hover:text-[#B8860B] hover:bg-[#800020]/5 dark:hover:bg-[#B8860B]/10 rounded-lg transition-colors">
                  <Heart className="w-4 h-4" />
                </Link>
                <Link href="/profile" className="p-2 text-[#6B6B6B] hover:text-[#800020] dark:text-[#9C9C9C] dark:hover:text-[#B8860B] hover:bg-[#800020]/5 dark:hover:bg-[#B8860B]/10 rounded-lg transition-colors">
                  <User className="w-4 h-4" />
                </Link>
              </>
            )}

            <button
              onClick={openCart}
              className="relative p-2 text-[#6B6B6B] hover:text-[#800020] dark:text-[#9C9C9C] dark:hover:text-[#B8860B] hover:bg-[#800020]/5 dark:hover:bg-[#B8860B]/10 rounded-lg transition-colors"
            >
              <ShoppingBag className="w-4 h-4" />
              {itemCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-[#800020] dark:bg-[#B8860B] text-white text-[10px] w-4.5 h-4.5 flex items-center justify-center rounded-full font-bold">
                  {itemCount > 9 ? "9+" : itemCount}
                </span>
              )}
            </button>

            {loading ? null : user ? (
              <div className="flex items-center gap-1 ml-1">
                <span className="text-xs sm:text-sm text-[#6B6B6B] dark:text-[#9C9C9C] max-w-[80px] sm:max-w-[120px] truncate hidden sm:inline">
                  {user.user_metadata?.full_name ?? user.email?.split("@")[0]}
                </span>
                <button onClick={signOut} className="p-2 text-[#6B6B6B] hover:text-[#800020] dark:text-[#9C9C9C] dark:hover:text-[#B8860B] hover:bg-[#800020]/5 dark:hover:bg-[#B8860B]/10 rounded-lg transition-colors" title="Sign out">
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1 ml-1">
                <Link href="/login" className="p-2 text-[#6B6B6B] hover:text-[#800020] dark:text-[#9C9C9C] dark:hover:text-[#B8860B] hover:bg-[#800020]/5 dark:hover:bg-[#B8860B]/10 rounded-lg transition-colors" title="Sign in">
                  <LogIn className="w-4 h-4" />
                  <span className="hidden sm:inline text-xs sm:text-sm font-medium ml-1">Sign in</span>
                </Link>
                <Link href="/signup" className="p-2 text-[#6B6B6B] hover:text-[#800020] dark:text-[#9C9C9C] dark:hover:text-[#B8860B] hover:bg-[#800020]/5 dark:hover:bg-[#B8860B]/10 rounded-lg transition-colors sm:hidden" title="Create Account">
                  <UserPlus className="w-4 h-4" />
                </Link>
                <Link href="/signup" className="hidden sm:block">
                  <Button size="sm" className="bg-[#800020] hover:bg-[#A00028] dark:bg-[#B8860B] dark:hover:bg-[#D4A020] text-white font-semibold px-4 rounded-full text-xs sm:text-sm h-8 sm:h-9">
                    Create Account
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>
    </>
  )
}