import Link from "next/link"
import { Newsletter } from "@/components/newsletter"

export function Footer() {
  return (
    <footer className="border-t border-[#800020]/10 dark:border-[#B8860B]/10 px-6 py-10 mt-auto bg-[#F8F8FF] dark:bg-[#1A1A1A]">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-3 gap-8 pb-8 border-b border-[#800020]/10 dark:border-[#B8860B]/10">
          <div>
            <span className="font-heading text-lg font-bold text-[#800020] dark:text-[#B8860B]">वि rasaath</span>
            <p className="text-sm text-[#6B6B6B] dark:text-[#9C9C9C] mt-2 max-w-xs leading-relaxed">
              Celebrating India&apos;s textile heritage through handcrafted kurtis for the modern woman.
            </p>
            <a
              href="https://www.instagram.com/viraasath_official"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm text-[#6B6B6B] hover:text-[#800020] dark:text-[#9C9C9C] dark:hover:text-[#B8860B] transition-colors mt-3"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
              @viraasath_official
            </a>
            <Newsletter />
          </div>
          <div>
            <h4 className="text-xs tracking-[0.15em] uppercase text-[#6B6B6B] dark:text-[#9C9C9C] font-medium mb-3">Quick Links</h4>
            <nav className="flex flex-col gap-2">
              <Link href="/products" className="text-sm text-[#333] dark:text-[#F0EDE8] hover:text-[#800020] dark:hover:text-[#B8860B] transition-colors">Shop All</Link>
              <Link href="/track" className="text-sm text-[#333] dark:text-[#F0EDE8] hover:text-[#800020] dark:hover:text-[#B8860B] transition-colors">Track Order</Link>
              <Link href="/contact" className="text-sm text-[#333] dark:text-[#F0EDE8] hover:text-[#800020] dark:hover:text-[#B8860B] transition-colors">Contact Us</Link>
              <Link href="/returns" className="text-sm text-[#333] dark:text-[#F0EDE8] hover:text-[#800020] dark:hover:text-[#B8860B] transition-colors">Returns & Exchanges</Link>
            </nav>
          </div>
          <div>
            <h4 className="text-xs tracking-[0.15em] uppercase text-[#6B6B6B] dark:text-[#9C9C9C] font-medium mb-3">Support</h4>
            <nav className="flex flex-col gap-2">
              <span className="text-sm text-[#333] dark:text-[#F0EDE8]">Email: hello@viraasat.com</span>
              <span className="text-sm text-[#6B6B6B] dark:text-[#9C9C9C]">Free shipping on orders above ₹999</span>
            </nav>
          </div>
        </div>
        <p className="text-xs text-[#6B6B6B] dark:text-[#9C9C9C] text-center mt-6 tracking-wide">
          &copy; {new Date().getFullYear()} Viraasat. All rights reserved.
        </p>
      </div>
    </footer>
  )
}
