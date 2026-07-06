const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

export const isSupabaseConfigured =
  supabaseUrl.startsWith("https://") &&
  !supabaseUrl.includes("placeholder") &&
  supabaseKey.length > 20

export const useDemoData = !isSupabaseConfigured || process.env.NEXT_PUBLIC_USE_DEMO === "true"

export function isSupabaseAvailable(): boolean {
  if (useDemoData) return false
  return isSupabaseConfigured
}

export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

export async function getAuthHeaders(): Promise<Record<string, string>> {
  const headers: Record<string, string> = { "Content-Type": "application/json" }
  try {
    const { createClient } = await import("@/lib/supabase/client")
    const supabase = createClient()
    const { data } = await supabase.auth.getSession()
    if (data?.session?.access_token) {
      headers["Authorization"] = `Bearer ${data.session.access_token}`
    }
  } catch {
    // Not in browser or Supabase unavailable
  }
  return headers
}