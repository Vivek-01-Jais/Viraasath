"use client"

import { createContext, useContext, useEffect, useState, useRef, type ReactNode } from "react"
import { createClient } from "@/lib/supabase/client"
import { isSupabaseAvailable } from "@/lib/supabase/client"
import { useCartStore } from "@/lib/stores/cart-store"
import type { User } from "@supabase/supabase-js"

type AuthContextType = {
  user: User | null
  loading: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: false,
  signOut: async () => {},
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const cartInitialized = useRef(false)

  useEffect(() => {
    if (cartInitialized.current) return
    cartInitialized.current = true

    if (!isSupabaseAvailable()) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLoading(false)
      return
    }

    let mounted = true
    const supabase = createClient()

    supabase.auth.getUser().then((result: { data?: { user: User | null } | null }) => {
      const { data } = result
      if (mounted) {
        const user = data?.user ?? null
        setUser(user)
        setLoading(false)
        if (!user) {
          useCartStore.getState().initLocalCart()
        }
      }
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event: unknown, session: { user: User | null } | null) => {
      if (mounted) {
        const newUser = session?.user ?? null
        setUser(newUser)
        if (newUser) {
          useCartStore.getState().mergeGuestCart(newUser.id).then(() => {
            useCartStore.getState().fetchCart(newUser.id)
          })
        } else {
          useCartStore.getState().initLocalCart()
        }
      }
    })

    return () => {
      mounted = false
      listener.subscription.unsubscribe()
    }
  }, [])

  const signOut = async () => {
    if (!isSupabaseAvailable()) return
    const supabase = createClient()
    await supabase.auth.signOut()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)