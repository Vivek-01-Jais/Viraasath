"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Search, ShoppingBag, Heart, User } from "lucide-react"
import { useCartStore } from "@/lib/stores/cart-store"
import { useAuth } from "@/lib/context/auth-context"

export function BottomNav() {
  const pathname = usePathname()
  const { totalItems } = useCartStore()
  const { user } = useAuth()
  const itemCount = totalItems()

  if (pathname.startsWith("/admin")) return null

  const links = [
    { href: "/", label: "Home", icon: Home },
    { href: "/products", label: "Shop", icon: Search },
    { href: "/cart", label: "Cart", icon: ShoppingBag, badge: itemCount },
    { href: user ? "/wishlist" : "/login", label: "Wishlist", icon: Heart },
    { href: user ? "/profile" : "/login", label: "Profile", icon: User },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 md:hidden border-t border-[#E5E0DB] dark:border-[#333] bg-[#F8F8FF]/95 dark:bg-[#1A1A1A]/95 backdrop-blur-md">
      <div className="flex items-center justify-around h-14">
        {links.map(l => {
          const active = pathname === l.href
          const Icon = l.icon
          return (
            <Link key={l.label} href={l.href} className="relative flex flex-col items-center gap-0.5 px-3 py-1">
              <Icon className={`w-4 h-4 ${active ? "text-[#800020] dark:text-[#B8860B]" : "text-[#6B6B6B] dark:text-[#9C9C9C]"}`} />
              <span className={`text-[10px] ${active ? "text-[#800020] dark:text-[#B8860B] font-medium" : "text-[#6B6B6B] dark:text-[#9C9C9C]"}`}>{l.label}</span>
              {l.badge && l.badge > 0 && (
                <span className="absolute -top-0.5 right-1 bg-[#800020] dark:bg-[#B8860B] text-white text-[9px] w-4 h-4 flex items-center justify-center rounded-full font-bold">
                  {l.badge > 9 ? "9+" : l.badge}
                </span>
              )}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}