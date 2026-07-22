"use client"

import { Suspense, useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import type { AuthChangeEvent } from "@supabase/supabase-js"

function CallbackInner() {
  const searchParams = useSearchParams()
  const [message, setMessage] = useState("Completing sign in...")

  useEffect(() => {
    let cancelled = false
    const supabase = createClient()

    const { data: listener } = supabase.auth.onAuthStateChange((event: AuthChangeEvent) => {
      if (event === "SIGNED_IN" && !cancelled) {
        window.location.href = "/"
      }
    })

    const handleCallback = async () => {
      const code = searchParams.get("code")

      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code)
        if (!error && !cancelled) {
          window.location.href = "/"
          return
        }
      }

      if (!cancelled) {
        window.location.href = "/"
      }
    }

    handleCallback()

    const timeout = setTimeout(() => {
      if (!cancelled) window.location.href = "/"
    }, 5000)

    return () => { cancelled = true; clearTimeout(timeout); listener.subscription.unsubscribe() }
  }, [searchParams])

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