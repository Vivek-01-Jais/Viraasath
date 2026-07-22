"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { getRecentProducts, type RecentProduct } from "@/lib/recently-viewed"

function formatPrice(amount: number) {
  return "₹" + amount.toLocaleString("en-IN")
}

export function RecentlyViewed() {
  const [items, setItems] = useState<RecentProduct[]>([])

  useEffect(() => {
    setItems(getRecentProducts())
  }, [])

  if (items.length === 0) return null

  return (
    <section className="mt-16">
      <h2 className="font-heading text-xl text-[#333] dark:text-[#F0EDE8] mb-1">Recently Viewed</h2>
      <div className="w-12 h-0.5 bg-[#C5A028] mb-6" />
      <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-thin">
        {items.map(item => {
          const href = item.slug ? `/products/${item.slug}` : `/products/${item.id}`
          return (
            <Link key={item.id} href={href} className="group shrink-0 w-32">
              <div className="aspect-[3/4] bg-[#F5F0EB] dark:bg-[#242424] rounded-lg overflow-hidden mb-2">
                {item.image ? (
                  <Image
                    src={item.image}
                    alt={item.name}
                    width={128}
                    height={170}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[#9C9C9C] text-xs font-heading">
                    {item.name.split(" ").map(w => w[0]).join("")}
                  </div>
                )}
              </div>
              <p className="text-xs text-[#333] dark:text-[#F0EDE8] truncate group-hover:text-[#800020] dark:group-hover:text-[#B8860B] transition-colors">
                {item.name}
              </p>
              <p className="text-xs text-[#6B6B6B] dark:text-[#9C9C9C]">{formatPrice(item.price)}</p>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
