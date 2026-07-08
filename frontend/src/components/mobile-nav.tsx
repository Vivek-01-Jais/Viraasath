"use client"

import { useEffect, useState } from "react"
import { createPortal } from "react-dom"
import Link from "next/link"
import { Menu, X, Search, LogIn, UserPlus, LogOut, User, Heart, Package, Shield } from "lucide-react"
import { useAuth } from "@/lib/context/auth-context"

type NavCategory = { id: string; slug: string; name: string }

export function MobileNav({ categories, isAdmin }: { categories: NavCategory[]; isAdmin?: boolean }) {
  const { user, signOut } = useAuth()
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!open) return
    document.body.style.overflow = "hidden"
    return () => { document.body.style.overflow = "" }
  }, [open])

  return (
    <>
      <button onClick={() => setOpen(true)} className="md:hidden p-3 -ml-1 text-[#6B6B6B] hover:text-[#800020] dark:text-[#9C9C9C] dark:hover:text-[#B8860B] active:scale-95 transition-transform" aria-label="Open menu">
        <Menu className="w-5 h-5" />
      </button>

      {open && createPortal(
        <div className="fixed inset-0 z-[100] md:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <div className="absolute top-0 left-0 bottom-0 w-[280px] bg-[#F8F8FF] dark:bg-[#1A1A1A] shadow-2xl flex flex-col">
            <div className="flex items-center justify-between px-4 h-16 border-b border-[#E5E0DB] dark:border-[#333]">
              <span className="font-heading font-bold text-[#800020] dark:text-[#B8860B]">Menu</span>
              <button onClick={() => setOpen(false)} className="p-2 text-[#6B6B6B] hover:text-[#800020] dark:hover:text-[#B8860B]">
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto p-4 space-y-2">
              <Link href="/products" onClick={() => setOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-[#F5F0EB] dark:hover:bg-[#242424] text-sm font-medium text-[#333] dark:text-[#F0EDE8]">
                <Search className="w-4 h-4 text-[#6B6B6B]" />
                Shop All
              </Link>
              <div className="border-t border-[#E5E0DB] dark:border-[#333] my-2" />
              {categories.map(cat => (
                <Link key={cat.id} href={`/products?category=${cat.id}`} onClick={() => setOpen(false)} className="block px-3 py-2.5 rounded-lg hover:bg-[#F5F0EB] dark:hover:bg-[#242424] text-sm text-[#6B6B6B] dark:text-[#9C9C9C] transition-colors">
                  {cat.name}
                </Link>
              ))}
              <div className="border-t border-[#E5E0DB] dark:border-[#333] my-2" />
              <Link href="/track" onClick={() => setOpen(false)} className="block px-3 py-2.5 rounded-lg hover:bg-[#F5F0EB] dark:hover:bg-[#242424] text-sm text-[#6B6B6B] dark:text-[#9C9C9C] transition-colors">
                Track Order
              </Link>
              {user && (
                <Link href="/orders" onClick={() => setOpen(false)} className="block px-3 py-2.5 rounded-lg hover:bg-[#F5F0EB] dark:hover:bg-[#242424] text-sm text-[#6B6B6B] dark:text-[#9C9C9C] transition-colors">
                  <Package className="inline w-4 h-4 mr-2" />Orders
                </Link>
              )}
              {isAdmin && user && (
                <Link href="/admin" onClick={() => setOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-[#F5F0EB] dark:hover:bg-[#242424] text-sm font-medium text-[#800020] dark:text-[#B8860B] transition-colors">
                  <Shield className="w-4 h-4" /> Admin
                </Link>
              )}
              {user ? (
                <>
                  <div className="border-t border-[#E5E0DB] dark:border-[#333] my-2" />
                  <Link href="/profile" onClick={() => setOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-[#F5F0EB] dark:hover:bg-[#242424] text-sm font-medium text-[#6B6B6B] dark:text-[#9C9C9C] transition-colors">
                    <User className="w-4 h-4" /> Profile
                  </Link>
                  <Link href="/wishlist" onClick={() => setOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-[#F5F0EB] dark:hover:bg-[#242424] text-sm font-medium text-[#6B6B6B] dark:text-[#9C9C9C] transition-colors">
                    <Heart className="w-4 h-4" /> Wishlist
                  </Link>
                  <button onClick={() => { signOut(); setOpen(false) }} className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-[#F5F0EB] dark:hover:bg-[#242424] text-sm font-medium text-[#6B6B6B] dark:text-[#9C9C9C] transition-colors w-full text-left">
                    <LogOut className="w-4 h-4" /> Sign Out
                  </button>
                </>
              ) : (
                <>
                  <div className="border-t border-[#E5E0DB] dark:border-[#333] my-2" />
                  <Link href="/login" onClick={() => setOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-[#F5F0EB] dark:hover:bg-[#242424] text-sm font-medium text-[#6B6B6B] dark:text-[#9C9C9C] transition-colors">
                    <LogIn className="w-4 h-4" /> Sign In
                  </Link>
                  <Link href="/signup" onClick={() => setOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-[#F5F0EB] dark:hover:bg-[#242424] text-sm font-medium text-[#6B6B6B] dark:text-[#9C9C9C] transition-colors">
                    <UserPlus className="w-4 h-4" /> Create Account
                  </Link>
                </>
              )}
            </nav>
          </div>
        </div>,
        document.body
      )}
    </>
  )
}