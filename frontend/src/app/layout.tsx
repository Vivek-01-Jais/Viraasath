import type { Metadata } from "next"
import { Inter, Playfair_Display } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/lib/context/auth-context"
import { ThemeProvider } from "@/components/theme-provider"
import { QueryProvider } from "@/components/query-provider"
import { CartSheet } from "@/components/cart/cart-sheet"
import { Footer } from "@/components/footer"
import { Toaster } from "@/components/ui/sonner"
import { Analytics } from "@/components/analytics"
import { AbandonedCartDetector } from "@/components/abandoned-cart-detector"
import { BottomNav } from "@/components/bottom-nav"

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
})

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "Viraasat — Ethnic Women's Kurtis",
  description: "Discover traditional and contemporary kurtis for women. Viraasat brings you ethnic elegance.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${playfair.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col pb-safe">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <QueryProvider>
            <AuthProvider>
            {children}
            <Footer />
            <CartSheet />
            <Toaster />
            <BottomNav />
            <Analytics />
            <AbandonedCartDetector />
          </AuthProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
