"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { createServerSupabase } from "@/lib/supabase/server"

export async function signup(_prevState: { error: string | null }, formData: FormData) {
  const supabase = await createServerSupabase()

  const fullName = formData.get("fullName") as string
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName } },
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath("/", "layout")
  redirect("/login?message=Check your email to confirm signup")
}

export async function login(_prevState: { error: string | null }, formData: FormData) {
  const supabase = await createServerSupabase()

  const email = formData.get("email") as string
  const password = formData.get("password") as string

  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    return { error: error.message }
  }

  revalidatePath("/", "layout")
  redirect("/")
}

export async function signOut() {
  const supabase = await createServerSupabase()
  await supabase.auth.signOut()
  revalidatePath("/", "layout")
  redirect("/")
}
