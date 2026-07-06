import { describe, it, expect, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import { Header } from "@/components/header"

vi.mock("@/lib/context/auth-context", () => ({
  useAuth: () => ({ user: null, loading: false, signIn: vi.fn(), signOut: vi.fn(), signUp: vi.fn() }),
}))

vi.mock("@/lib/supabase/client", () => ({
  createClient: vi.fn(),
  isSupabaseAvailable: () => false,
}))

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), prefetch: vi.fn() }),
  usePathname: () => "/",
}))

vi.mock("next/link", () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => <a href={href}>{children}</a>,
}))

describe("Header", () => {
  it("renders the brand name", () => {
    render(<Header />)
    expect(screen.getByText("वि rasaath")).toBeInTheDocument()
  })

  it("shows login link for unauthenticated users", () => {
    render(<Header />)
    expect(screen.getByText("Sign in")).toBeInTheDocument()
  })
})
