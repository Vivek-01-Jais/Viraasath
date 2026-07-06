import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Header } from "@/components/header"
import { ProductCard } from "@/components/product/product-card"
import { getFeaturedProducts, getCategories } from "@/lib/queries/products"
import { ArrowRight, Sparkles } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function Home() {
  const [featured, categories] = await Promise.all([
    getFeaturedProducts(),
    getCategories(),
  ])

  return (
    <div className="flex flex-col flex-1">
      <Header />

      <main className="flex-1">
        <section className="relative overflow-hidden bg-gradient-to-br from-[#1A1110] via-[#2A1515] to-[#1A1110] text-[#F0EDE8]">
          <div className="absolute inset-0 bg-ethnic-dots opacity-30" />
          <div className="absolute top-1/2 right-0 w-[500px] h-[500px] bg-[#800020]/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-1/4 w-[300px] h-[300px] bg-[#C5A028]/10 rounded-full blur-3xl" />
          <div className="relative px-6 pt-32 pb-28 max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-flex items-center gap-2 border border-amber-400/30 text-amber-600 dark:border-[#C5A028]/30 dark:text-[#C5A028] text-xs tracking-[0.2em] uppercase px-4 py-1.5 rounded-full mb-8">
                  <Sparkles className="w-3 h-3" /> Summer Collection 2026
                </div>
                <h1 className="font-heading text-5xl sm:text-6xl lg:text-7xl leading-[1.1] tracking-tight">
                  Where Heritage
                  <br />
                  <span className="text-amber-600 dark:text-[#C5A028] italic">Meets</span> Modernity
                </h1>
                <p className="mt-6 max-w-lg text-[#B0A8A0] text-lg leading-relaxed">
                  Handcrafted kurtis that celebrate India&apos;s textile legacy — reimagined 
                  for the woman who honors tradition while defining her own future.
                </p>
                <div className="mt-10 flex flex-wrap gap-4">
                  <Link href="/products">
                    <Button size="lg" className="bg-[#C5A028] text-[#1A1110] hover:bg-[#D4B040] font-semibold px-10 h-13 text-base rounded-full">
                      Explore Collection <ArrowRight className="w-4 h-4 ml-1.5" />
                    </Button>
                  </Link>
                  <Link href="/track">
                    <Button size="lg" variant="outline" className="border-[#B0A8A0]/40 text-[#F0EDE8] hover:bg-white/5 px-10 h-13 text-base rounded-full">
                      Track Order
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="hidden lg:flex justify-center">
                <div className="relative w-80 h-96">
                  <div className="absolute inset-0 border-2 border-[#C5A028]/20 rounded-2xl rotate-6" />
                  <div className="absolute inset-0 border-2 border-[#800020]/20 rounded-2xl -rotate-3" />
                  <div className="absolute inset-0 bg-gradient-to-br from-[#800020]/10 to-[#C5A028]/5 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                    <span className="font-heading text-7xl text-[#C5A028]/30">V</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {categories.length > 0 && (
          <section className="px-6 py-24 max-w-7xl mx-auto w-full">
            <div className="text-center mb-14">
              <span className="text-[#800020] dark:text-[#B8860B] text-xs tracking-[0.2em] uppercase font-medium">Curated Collections</span>
              <h2 className="font-heading text-4xl mt-3 text-[#333] dark:text-[#F0EDE8]">Shop by Category</h2>
              <div className="w-16 h-0.5 bg-[#C5A028] mx-auto mt-4" />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5">
              {categories.map((cat, i) => {
                const gradients = [
                  "from-[#800020]/5 to-[#C5A028]/5 border-[#800020]/10",
                  "from-[#C5A028]/5 to-[#800020]/5 border-[#C5A028]/10",
                  "from-[#800020]/3 to-[#333]/5 border-[#800020]/8",
                  "from-[#C5A028]/3 to-[#800020]/8 border-[#C5A028]/8",
                  "from-[#333]/5 to-[#C5A028]/5 border-[#333]/10",
                ]
                return (
                  <Link key={cat.id} href={`/products?category=${cat.id}`} className="group">
                    <div className={`rounded-2xl bg-gradient-to-br ${gradients[i % gradients.length]} border p-8 text-center transition-all duration-500 hover:shadow-xl hover:-translate-y-1.5`}>
                      <div className="w-14 h-14 mx-auto rounded-full bg-[#800020]/10 dark:bg-[#B8860B]/10 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-500">
                        <span className="font-heading text-2xl text-[#800020] dark:text-[#B8860B]">{cat.name[0]}</span>
                      </div>
                      <h3 className="font-heading text-lg text-[#333] dark:text-[#F0EDE8] group-hover:text-[#800020] dark:group-hover:text-[#B8860B] transition-colors">{cat.name}</h3>
                      {cat.description && (
                        <p className="text-xs text-[#6B6B6B] dark:text-[#9C9C9C] mt-2 leading-relaxed line-clamp-2">{cat.description}</p>
                      )}
                    </div>
                  </Link>
                )
              })}
            </div>
          </section>
        )}

        {featured.length > 0 && (
          <section className="px-6 pb-24 max-w-7xl mx-auto w-full">
            <div className="flex items-end justify-between mb-12">
              <div>
                <span className="text-[#800020] dark:text-[#B8860B] text-xs tracking-[0.2em] uppercase font-medium">Featured</span>
                <h2 className="font-heading text-4xl mt-2 text-[#333] dark:text-[#F0EDE8]">Trending Now</h2>
                <div className="w-16 h-0.5 bg-[#C5A028] mt-3" />
              </div>
              <Link href="/products" className="hidden sm:inline-flex items-center gap-1.5 text-sm font-medium text-[#800020] dark:text-[#B8860B] hover:text-[#C5A028] dark:hover:text-[#D4A574] transition-colors">
                View All <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-12">
              {featured.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </section>
        )}

        <section className="bg-[#1A1110] text-[#F0EDE8] px-6 py-24">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <span className="text-[#C5A028] text-xs tracking-[0.2em] uppercase font-medium">Our Ethos</span>
              <h2 className="font-heading text-4xl mt-3">Crafted with Love, Worn with Pride</h2>
              <div className="w-16 h-0.5 bg-[#C5A028] mx-auto mt-4" />
            </div>
            <div className="grid md:grid-cols-3 gap-10">
              {[
                { 
                  title: "Handpicked Craftsmanship", 
                  desc: "Each piece is curated from skilled artisans across India, preserving age-old techniques while embracing contemporary aesthetics.",
                  icon: "◈"
                },
                { 
                  title: "Premium Fabrics", 
                  desc: "Only the finest cottons, silks, and handloom materials — ethically sourced and crafted to ensure lasting beauty and comfort.",
                  icon: "◇"
                },
                { 
                  title: "Effortless Elegance", 
                  desc: "Free returns within 15 days, secure checkout, and dedicated support to make your experience as beautiful as our kurtis.",
                  icon: "✦"
                },
              ].map((item) => (
                <div key={item.title} className="text-center group">
                  <div className="w-16 h-16 mx-auto rounded-full bg-[#C5A028]/10 border border-[#C5A028]/20 flex items-center justify-center text-2xl text-[#C5A028] mb-6 group-hover:bg-[#C5A028]/20 transition-colors duration-500">
                    {item.icon}
                  </div>
                  <h3 className="font-heading text-xl mb-3 group-hover:text-amber-600 dark:group-hover:text-[#C5A028] transition-colors duration-500">{item.title}</h3>
                  <p className="text-sm text-[#B0A8A0] leading-relaxed max-w-xs mx-auto">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
