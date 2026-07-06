"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { useAuth } from "@/lib/context/auth-context"

import { API_URL, getAuthHeaders } from "@/lib/config"
import { toast } from "sonner"
import { Shield, Trash2 } from "lucide-react"

type Admin = {
  id: string
  email: string
  full_name: string
  created_at: string
}

export default function AdminAdminsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [admins, setAdmins] = useState<Admin[]>([])
  const [loading, setLoading] = useState(true)
  const [email, setEmail] = useState("")
  const [granting, setGranting] = useState(false)

  const loadAdmins = async () => {
    try {
      const headers = await getAuthHeaders()
      const res = await fetch(`${API_URL}/api/admin/admins`, { headers })
      if (res.ok) setAdmins(await res.json())
    } catch {
      // fallback to direct supabase call
    }
    setLoading(false)
  }

  useEffect(() => {
    if (!user) return
    const verify = async () => {
      try {
        const headers = await getAuthHeaders()
        const verifyRes = await fetch(`${API_URL}/api/admin/verify`, { headers })
        if (!verifyRes.ok) { router.push("/admin"); return }
        loadAdmins()
      } catch {
        router.push("/admin")
      }
    }
    verify()
  }, [user, router])

  async function handleGrant() {
    if (!email.trim()) { toast.error("Enter an email address"); return }
    setGranting(true)
    try {
      const headers = await getAuthHeaders()
      const res = await fetch(`${API_URL}/api/admin/admins`, {
        method: "POST",
        headers,
        body: JSON.stringify({ email: email.trim() }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || "Failed to grant admin")
      toast.success(data.message)
      setEmail("")
      loadAdmins()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to grant admin")
    } finally {
      setGranting(false)
    }
  }

  async function handleRevoke(adminId: string, email: string) {
    if (!confirm(`Remove admin access from ${email}?`)) return
    try {
      const headers = await getAuthHeaders()
      const res = await fetch(`${API_URL}/api/admin/admins/${adminId}`, { method: "DELETE", headers })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || "Failed to revoke")
      toast.success(data.message)
      loadAdmins()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to revoke")
    }
  }

  return (
    <div className="flex flex-col flex-1">
      <Header />
      <main className="flex-1 px-6 py-8 max-w-4xl mx-auto w-full">
        <div className="mb-6">
          <h1 className="text-2xl font-heading font-bold text-[#800020] dark:text-[#B8860B]">Admin Management</h1>
          <div className="w-12 h-0.5 bg-[#C5A028] mt-2" />
        </div>

        <div className="mb-8 p-6 border border-[#E5E0DB] dark:border-[#333] rounded-xl">
          <h2 className="text-lg font-heading font-bold text-[#800020] dark:text-[#B8860B] mb-4">Grant Admin Access</h2>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter user email address"
              className="flex-1 min-w-0 rounded-xl border border-[#E5E0DB] dark:border-[#333] bg-transparent px-3 py-2 text-sm text-[#333] dark:text-[#F0EDE8] focus:outline-none focus:ring-2 focus:ring-[#C5A028]"
            />
            <button
              onClick={handleGrant}
              disabled={granting}
              className="px-6 py-2 rounded-full bg-[#800020] hover:bg-[#A00028] dark:bg-[#B8860B] dark:hover:bg-[#D4A020] text-white text-sm disabled:opacity-50 whitespace-nowrap"
            >
              {granting ? "Granting..." : "Grant Access"}
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-24 text-[#6B6B6B] dark:text-[#9C9C9C]">Loading...</div>
        ) : (
          <div className="border border-[#E5E0DB] dark:border-[#333] rounded-xl overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#F8F8FF] dark:bg-[#1A1A1A]">
                <tr>
                  <th className="text-left p-3 font-medium text-[#800020] dark:text-[#B8860B] text-xs tracking-[0.2em] uppercase">Name</th>
                  <th className="text-left p-3 font-medium text-[#800020] dark:text-[#B8860B] text-xs tracking-[0.2em] uppercase">Email</th>
                  <th className="text-left p-3 font-medium text-[#800020] dark:text-[#B8860B] text-xs tracking-[0.2em] uppercase">Actions</th>
                </tr>
              </thead>
              <tbody>
                {admins.map((a) => (
                  <tr key={a.id} className="border-t border-[#E5E0DB] dark:border-[#333] hover:bg-[#F8F8FF] dark:hover:bg-[#1A1A1A]">
                    <td className="p-3 font-medium text-[#333] dark:text-[#F0EDE8] flex items-center gap-2">
                      <Shield className="w-4 h-4 text-[#800020] dark:text-[#B8860B]" />
                      {a.full_name || "—"}
                    </td>
                    <td className="p-3 text-[#6B6B6B] dark:text-[#9C9C9C]">{a.email}</td>
                    <td className="p-3">
                      <button
                        onClick={() => handleRevoke(a.id, a.email)}
                        className="text-red-500 hover:text-red-700 dark:hover:text-red-400 disabled:opacity-30"
                        disabled={a.id === user?.id}
                        title={a.id === user?.id ? "Cannot remove yourself" : "Revoke admin"}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
                {admins.length === 0 && (
                  <tr><td colSpan={3} className="p-6 text-center text-[#6B6B6B] dark:text-[#9C9C9C]">No admins found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  )
}
