import { createBrowserClient } from "@supabase/ssr"
import { isSupabaseConfigured, useDemoData } from "@/lib/config"

export function createClient() {
  if (useDemoData) {
    return createDemoClient()
  }
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

function createDemoClient() {
  const noop = () => Promise.resolve({ data: null, error: new Error("Demo mode") })
  return {
    auth: {
      getUser: () => Promise.resolve({ data: { user: null }, error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      signOut: () => Promise.resolve({ error: null }),
      signInWithPassword: noop,
      signUp: noop,
      signInWithOAuth: noop,
      exchangeCodeForSession: noop,
      getSession: () => Promise.resolve({ data: { session: null }, error: null }),
      refreshSession: noop,
      _initialize: () => {},
      _recoverAndRefresh: () => Promise.resolve(),
      _callRefreshToken: () => Promise.resolve(),
    },
    from: () => {
      const chain = new Proxy(() => Promise.resolve({ data: [], error: null, count: 0 }), {
        get: () => () => chain,
      })
      return chain as unknown as ReturnType<ReturnType<typeof createBrowserClient>["from"]>
    },
    channel: () => ({ on: () => ({ subscribe: () => {} }) }),
    removeChannel: () => {},
  } as unknown as ReturnType<typeof createBrowserClient>
}

export function isSupabaseAvailable(): boolean {
  if (useDemoData) return false
  return isSupabaseConfigured
}