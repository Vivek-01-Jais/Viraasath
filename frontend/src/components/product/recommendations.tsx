import Link from "next/link"
import Image from "next/image"
import { createClient } from "@/lib/supabase/client"
import { isSupabaseConfigured } from "@/lib/config"

function formatPrice(amount: number) {
  return "₹" + amount.toLocaleString("en-IN")
}

export async function Recommendations({ categoryId, currentId }: { categoryId: string | null; currentId: string }) {
  if (!categoryId || !isSupabaseConfigured) return null

  const supabase = createClient()
  const { data } = await supabase
    .from("products")
    .select(`
      id, name, slug, price, compare_at_price,
      product_images(id, url, alt_text)
    `)
    .eq("category_id", categoryId)
    .eq("is_active", true)
    .neq("id", currentId)
    .order("created_at", { ascending: false })
    .limit(4)

  const rawProducts = (data ?? []) as {
    id: string; name: string; slug: string; price: number; compare_at_price: number | null;
    product_images: { id: string; url: string; alt_text: string | null }[]
  }[]

  if (rawProducts.length === 0) return null

  return (
    <section className="mt-16">
      <h2 className="font-heading text-xl text-[#333] dark:text-[#F0EDE8] mb-1">You May Also Like</h2>
      <div className="w-12 h-0.5 bg-[#C5A028] mb-6" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {rawProducts.map(p => {
          const hasDiscount = p.compare_at_price && p.compare_at_price > p.price
          const image = p.product_images?.[0]
          const href = p.slug ? `/products/${p.slug}` : `/products/${p.id}`
          return (
            <Link key={p.id} href={href} className="group">
              <div className="aspect-[3/4] bg-[#F5F0EB] dark:bg-[#242424] rounded-lg overflow-hidden mb-2">
                {image ? (
                  <Image
                    src={image.url}
                    alt={image.alt_text ?? p.name}
                    width={200}
                    height={260}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[#9C9C9C] text-xs font-heading">
                    {p.name.split(" ").map(w => w[0]).join("")}
                  </div>
                )}
              </div>
              <p className="text-sm text-[#333] dark:text-[#F0EDE8] truncate group-hover:text-[#800020] dark:group-hover:text-[#B8860B] transition-colors">
                {p.name}
              </p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="font-semibold text-[#333] dark:text-[#F0EDE8] text-sm">{formatPrice(p.price)}</span>
                {hasDiscount && (
                  <span className="text-xs text-[#6B6B6B] dark:text-[#9C9C9C] line-through">{formatPrice(p.compare_at_price!)}</span>
                )}
              </div>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
