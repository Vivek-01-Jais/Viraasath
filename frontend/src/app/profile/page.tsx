"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Plus, MapPin, Pencil, Trash2, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Header } from "@/components/header"
import { useAuth } from "@/lib/context/auth-context"
import { createClient, isSupabaseAvailable } from "@/lib/supabase/client"
import { motion, AnimatePresence } from "motion/react"
import { toast } from "sonner"

type Address = {
  id: string
  full_name: string
  phone: string | null
  address_line1: string
  address_line2: string | null
  city: string
  state: string
  postal_code: string
  country: string
  is_default: boolean
}

const emptyForm = {
  full_name: "",
  phone: "",
  address_line1: "",
  address_line2: "",
  city: "",
  state: "",
  postal_code: "",
  country: "India",
  is_default: false,
}

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [addresses, setAddresses] = useState<Address[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)

  const loadAddresses = useCallback(async () => {
    if (!user || !isSupabaseAvailable()) return
    const supabase = createClient()
    const { data } = await supabase.from("addresses").select("*").eq("user_id", user.id).order("created_at")
    setAddresses(data ?? [])
  }, [user])

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login")
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (user) queueMicrotask(() => loadAddresses())
  }, [user, loadAddresses])

  async function saveAddress() {
    if (!user) return
    setSaving(true)
    const supabase = createClient()

    if (form.is_default) {
      await supabase.from("addresses").update({ is_default: false }).eq("user_id", user.id)
    }

    if (editingId) {
      const { error } = await supabase.from("addresses").update(form).eq("id", editingId)
      if (error) { toast.error(error.message); setSaving(false); return }
      toast.success("Address updated")
    } else {
      const { error } = await supabase.from("addresses").insert({ ...form, user_id: user.id })
      if (error) { toast.error(error.message); setSaving(false); return }
      toast.success("Address added")
    }

    setShowForm(false)
    setEditingId(null)
    setForm(emptyForm)
    setSaving(false)
    loadAddresses()
  }

  async function deleteAddress(id: string) {
    const supabase = createClient()
    await supabase.from("addresses").delete().eq("id", id)
    toast.success("Address deleted")
    loadAddresses()
  }

  function editAddress(addr: Address) {
    setForm({
      full_name: addr.full_name,
      phone: addr.phone ?? "",
      address_line1: addr.address_line1,
      address_line2: addr.address_line2 ?? "",
      city: addr.city,
      state: addr.state,
      postal_code: addr.postal_code,
      country: addr.country,
      is_default: addr.is_default,
    })
    setEditingId(addr.id)
    setShowForm(true)
  }

  if (authLoading || !user) {
    return <div className="flex flex-col flex-1"><Header /><main className="flex-1 flex items-center justify-center"><p className="text-[#9C9C9C]">Loading...</p></main></div>
  }

  return (
    <div className="flex flex-col flex-1">
      <Header />
      <main className="flex-1 px-6 py-8 max-w-3xl mx-auto w-full">
        <div className="mb-8">
          <h1 className="font-heading text-3xl text-[#333] dark:text-[#F0EDE8]">My Profile</h1>
          <p className="text-[#6B6B6B] dark:text-[#9C9C9C] text-sm mt-1">{user.email}</p>
          <div className="w-12 h-0.5 bg-[#C5A028] mt-3" />
        </div>

        <div className="flex items-center justify-between mb-4">
          <h2 className="font-heading text-lg text-[#333] dark:text-[#F0EDE8] flex items-center gap-2"><MapPin className="w-5 h-5 text-[#800020] dark:text-[#B8860B]" /> Shipping Addresses</h2>
          <Button size="sm" className="bg-[#800020] hover:bg-[#A00028] dark:bg-[#B8860B] dark:hover:bg-[#D4A020] text-white rounded-full" onClick={() => { setShowForm(true); setEditingId(null); setForm(emptyForm) }}>
            <Plus className="w-4 h-4 mr-1" /> Add Address
          </Button>
        </div>

        <AnimatePresence>
          {showForm && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden mb-4">
              <div className="border border-[#E5E0DB] dark:border-[#333] rounded-xl p-4 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <Input placeholder="Full name" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} className="border-[#E5E0DB] dark:border-[#333]" />
                  <Input placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="border-[#E5E0DB] dark:border-[#333]" />
                </div>
                <Input placeholder="Address line 1" value={form.address_line1} onChange={(e) => setForm({ ...form, address_line1: e.target.value })} className="border-[#E5E0DB] dark:border-[#333]" />
                <Input placeholder="Address line 2 (optional)" value={form.address_line2} onChange={(e) => setForm({ ...form, address_line2: e.target.value })} className="border-[#E5E0DB] dark:border-[#333]" />
                <div className="grid grid-cols-3 gap-3">
                  <Input placeholder="City" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className="border-[#E5E0DB] dark:border-[#333]" />
                  <Input placeholder="State" value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} className="border-[#E5E0DB] dark:border-[#333]" />
                  <Input placeholder="Postal code" value={form.postal_code} onChange={(e) => setForm({ ...form, postal_code: e.target.value })} className="border-[#E5E0DB] dark:border-[#333]" />
                </div>
                <label className="flex items-center gap-2 text-sm text-[#333] dark:text-[#F0EDE8]">
                  <input type="checkbox" checked={form.is_default} onChange={(e) => setForm({ ...form, is_default: e.target.checked })} className="accent-[#800020] dark:accent-[#B8860B]" />
                  Set as default address
                </label>
                <div className="flex gap-2">
                  <Button onClick={saveAddress} disabled={saving} className="bg-[#800020] hover:bg-[#A00028] dark:bg-[#B8860B] dark:hover:bg-[#D4A020] text-white rounded-full">
                    {saving ? "Saving..." : editingId ? "Update" : "Save"}
                  </Button>
                  <Button variant="outline" className="border-[#E5E0DB] dark:border-[#333] text-[#333] dark:text-[#F0EDE8] rounded-full" onClick={() => { setShowForm(false); setEditingId(null); setForm(emptyForm) }}>Cancel</Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="space-y-3">
          {addresses.length === 0 ? (
            <p className="text-[#6B6B6B] dark:text-[#9C9C9C] text-sm py-8 text-center">No addresses saved yet</p>
          ) : (
            addresses.map((addr) => (
              <div key={addr.id} className="border border-[#E5E0DB] dark:border-[#333] rounded-xl p-4 flex justify-between items-start hover:shadow-sm transition-shadow">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-[#333] dark:text-[#F0EDE8]">{addr.full_name}</p>
                    {addr.is_default && <span className="text-xs bg-[#C5A028]/10 text-[#C5A028] px-2 py-0.5 rounded-full flex items-center gap-1 font-medium"><Check className="w-3 h-3" /> Default</span>}
                  </div>
                  <p className="text-sm text-[#6B6B6B] dark:text-[#9C9C9C] mt-1">{addr.address_line1}{addr.address_line2 ? `, ${addr.address_line2}` : ""}</p>
                  <p className="text-sm text-[#6B6B6B] dark:text-[#9C9C9C]">{addr.city}, {addr.state} — {addr.postal_code}</p>
                  {addr.phone && <p className="text-sm text-[#6B6B6B] dark:text-[#9C9C9C]">{addr.phone}</p>}
                </div>
                <div className="flex gap-2">
                  <button onClick={() => editAddress(addr)} className="p-1.5 text-[#6B6B6B] hover:text-[#800020] dark:hover:text-[#B8860B] transition-colors"><Pencil className="w-4 h-4" /></button>
                  <button onClick={() => deleteAddress(addr.id)} className="p-1.5 text-[#6B6B6B] hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  )
}
