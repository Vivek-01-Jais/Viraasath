"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

export default function SignupPage() {
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)
  const [googlePending, setGooglePending] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setPending(true)
    setError(null)

    const form = new FormData(e.currentTarget)
    const fullName = form.get("fullName") as string
    const email = form.get("email") as string
    const password = form.get("password") as string

    const supabase = createClient()
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    })

    if (error) {
      setError(error.message)
      setPending(false)
      return
    }

    router.push("/")
    router.refresh()
  }

  async function handleGoogleSignUp() {
    setGooglePending(true)
    setError(null)
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
    if (error) {
      setError(error.message)
      setGooglePending(false)
    }
  }

  return (
    <div className="flex flex-1 items-center justify-center px-4 py-24">
      <Card className="w-full max-w-sm border-[#E5E0DB] dark:border-[#333]">
        <CardHeader className="text-center">
          <div className="w-12 h-0.5 bg-[#C5A028] mx-auto mb-4" />
          <CardTitle className="font-heading text-3xl text-[#333] dark:text-[#F0EDE8]">Create account</CardTitle>
          <CardDescription className="text-[#6B6B6B] dark:text-[#9C9C9C]">Join Viraasat — discover ethnic elegance</CardDescription>
        </CardHeader>
        <CardContent>
          <button
            onClick={handleGoogleSignUp}
            disabled={googlePending}
            className="w-full flex items-center justify-center gap-2.5 border border-[#E5E0DB] dark:border-[#333] rounded-full h-11 text-sm font-medium text-[#333] dark:text-[#F0EDE8] hover:bg-[#F5F0EB] dark:hover:bg-[#242424] transition-colors disabled:opacity-50"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
            {googlePending ? "Redirecting..." : "Continue with Google"}
          </button>

          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-[#E5E0DB] dark:border-[#333]" /></div>
            <div className="relative flex justify-center text-xs uppercase"><span className="bg-[#F8F8FF] dark:bg-[#1A1A1A] px-2 text-[#6B6B6B] dark:text-[#9C9C9C]">or sign up with email</span></div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="fullName" className="text-sm font-medium text-[#333] dark:text-[#F0EDE8]">Full name</label>
              <Input id="fullName" name="fullName" placeholder="Priya Sharma" required className="border-[#E5E0DB] dark:border-[#333]" />
            </div>
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-[#333] dark:text-[#F0EDE8]">Email</label>
              <Input id="email" name="email" type="email" placeholder="you@example.com" required className="border-[#E5E0DB] dark:border-[#333]" />
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-[#333] dark:text-[#F0EDE8]">Password</label>
              <Input id="password" name="password" type="password" placeholder="••••••••" required minLength={6} className="border-[#E5E0DB] dark:border-[#333]" />
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <Button type="submit" className="w-full bg-[#800020] hover:bg-[#A00028] dark:bg-[#B8860B] dark:hover:bg-[#D4A020] text-white rounded-full h-11" disabled={pending}>
              {pending ? "Creating account..." : "Create account"}
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-[#6B6B6B] dark:text-[#9C9C9C]">
            Already have an account?{" "}
            <Link href="/login" className="font-medium underline underline-offset-4 text-[#800020] dark:text-[#B8860B] hover:text-[#C5A028] dark:hover:text-[#D4A574] transition-colors">
              Sign in
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
