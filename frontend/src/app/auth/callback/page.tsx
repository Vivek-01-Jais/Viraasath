"use client"

import { Suspense, useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

function CallbackInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [message, setMessage] = useState("Completing sign in...")

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get("code")

      if (code) {
        const supabase = createClient()
        const { error } = await supabase.auth.exchangeCodeForSession(code)
        if (error) {
          setMessage("Authentication failed. Redirecting...")
          setTimeout(() => router.push("/login?error=Auth failed"), 2000)
          return
        }
      }

      router.push("/")
      router.refresh()
    }

    handleCallback()
  }, [searchParams, router])

  return (
    <p className="text-[#6B6B6B] dark:text-[#9C9C9C]">{message}</p>
  )
}

export default function AuthCallbackPage() {
  return (
    <div className="flex flex-1 items-center justify-center">
      <Suspense fallback={<p className="text-[#6B6B6B] dark:text-[#9C9C9C]">Completing sign in...</p>}>
        <CallbackInner />
      </Suspense>
    </div>
  )
}