"use client"

import Link from "next/link"
import { motion } from "motion/react"
import { Button } from "@/components/ui/button"
import { Header } from "@/components/header"

export default function NotFoundPage() {
  return (
    <div className="flex flex-col flex-1">
      <Header />
      <main className="flex-1 flex items-center justify-center px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <h1 className="font-heading text-8xl text-[#800020] dark:text-[#B8860B]">404</h1>
          <div className="w-12 h-0.5 bg-[#C5A028] mx-auto my-6" />
          <p className="text-lg text-[#6B6B6B] dark:text-[#9C9C9C] mb-8">This page seems to have wandered off.</p>
          <Link href="/">
            <Button className="bg-[#800020] hover:bg-[#A00028] dark:bg-[#B8860B] dark:hover:bg-[#D4A020] text-white rounded-full">
              Back to Home
            </Button>
          </Link>
        </motion.div>
      </main>
    </div>
  )
}
