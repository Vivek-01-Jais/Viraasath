"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, MapPin, CreditCard, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Header } from "@/components/header"
import { useCartStore } from "@/lib/stores/cart-store"
import { useAuth } from "@/lib/context/auth-context"
import { PageSkeleton } from "@/components/ui/skeleton"
import { createClient, isSupabaseAvailable } from "@/lib/supabase/client"
import { API_URL, getAuthHeaders } from "@/lib/config"
import { toast } from "sonner"
import Link from "next/link"

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

type RazorpayOrder = {
  id: string | null
  amount: number
  currency: string
  key_id: string | null
  mock?: boolean
}

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => { open: () => void; on: (event: string, handler: (response: Record<string, unknown>) => void) => void }
  }
}

export default function CheckoutPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const { items, fetchCart, totalPrice, loading: cartLoading } = useCartStore()
  const [addresses, setAddresses] = useState<Address[]>([])
  const [selectedAddress, setSelectedAddress] = useState<string | null>(null)
  const [placing, setPlacing] = useState(false)
  const [razorpayLoaded, setRazorpayLoaded] = useState(false)
  const [couponCode, setCouponCode] = useState("")
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number } | null>(null)
  const [couponLoading, setCouponLoading] = useState(false)

  const shipping = totalPrice() >= 999 ? 0 : 49
  const discount = appliedCoupon?.discount ?? 0
  const grandTotal = totalPrice() + shipping - discount

  useEffect(() => {
    if (typeof window !== "undefined" && !document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]')) {
      const script = document.createElement("script")
      script.src = "https://checkout.razorpay.com/v1/checkout.js"
      script.async = true
      script.onload = () => setRazorpayLoaded(true)
      document.body.appendChild(script)
    } else if (typeof window !== "undefined" && window.Razorpay) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setRazorpayLoaded(true)
    }
  }, [])

  const loadAddresses = useCallback(async () => {
    if (!user || !isSupabaseAvailable()) return
    const supabase = createClient()
    const { data } = await supabase.from("addresses").select("*").eq("user_id", user.id).order("created_at")
    const addrs = data ?? []
    setAddresses(addrs)
    const defaultAddr = addrs.find((a: Address) => a.is_default) ?? addrs[0]
    if (defaultAddr) setSelectedAddress(defaultAddr.id)
  }, [user])

  useEffect(() => {
    if (!authLoading && !user) { router.push("/login"); return }
    if (user) {
      fetchCart(user.id)
      queueMicrotask(() => loadAddresses())
    }
  }, [user, authLoading, router, fetchCart, loadAddresses])

  async function handleApplyCoupon() {
    if (!couponCode.trim()) { toast.error("Enter a coupon code"); return }
    setCouponLoading(true)
    try {
      const headers = await getAuthHeaders()
      const res = await fetch(`${API_URL}/api/coupons/validate/${couponCode.trim()}`, { headers })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.detail || "Invalid coupon")
      }
      const data = await res.json()
      const discountValue = data.discount_type === "percentage"
        ? Math.min(totalPrice() * data.discount_value / 100, data.max_discount ?? Infinity)
        : data.discount_value
      setAppliedCoupon({ code: couponCode.trim().toUpperCase(), discount: Math.round(discountValue) })
      toast.success(`Coupon applied! You save ₹${Math.round(discountValue).toLocaleString("en-IN")}`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to apply coupon")
      setAppliedCoupon(null)
    } finally {
      setCouponLoading(false)
    }
  }

  async function handlePlaceOrder() {
    if (!user || !selectedAddress) {
      toast.error("Please select a shipping address")
      return
    }
    if (items.length === 0) {
      toast.error("Your cart is empty")
      return
    }

    setPlacing(true)

    try {
      const headers = await getAuthHeaders()
      const orderRes = await fetch(`${API_URL}/api/orders/create-razorpay-order`, {
        method: "POST",
        headers,
        body: JSON.stringify({ coupon_code: appliedCoupon?.code ?? null }),
      })

      if (!orderRes.ok) {
        const err = await orderRes.json()
        throw new Error(err.detail || "Failed to initiate payment")
      }

      const razorpayOrder: RazorpayOrder = await orderRes.json()

      if (razorpayOrder.mock || !razorpayOrder.key_id) {
        const res = await fetch(`${API_URL}/api/orders/place`, {
          method: "POST",
          headers,
          body: JSON.stringify({ address_id: selectedAddress, coupon_code: appliedCoupon?.code ?? null }),
        })

        if (!res.ok) {
          const err = await res.json()
          throw new Error(err.detail || "Failed to place order")
        }

        const data = await res.json()
        toast.success("Order placed!")
        router.push(`/orders/${data.order_id}`)
        return
      }

      if (!razorpayLoaded || !window.Razorpay) {
        toast.error("Payment gateway not loaded. Please refresh.")
        setPlacing(false)
        return
      }

      const options = {
        key: razorpayOrder.key_id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        name: "Viraasat",
        description: "Ethnic Kurtis",
        order_id: razorpayOrder.id,
        handler: async (response: Record<string, unknown>) => {
          const placeRes = await fetch(`${API_URL}/api/orders/place`, {
            method: "POST",
            headers,
              body: JSON.stringify({
                address_id: selectedAddress,
                coupon_code: appliedCoupon?.code ?? null,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
              }),
          })

          if (!placeRes.ok) {
            const err = await placeRes.json()
            toast.error(err.detail || "Payment succeeded but order failed. Contact support.")
            setPlacing(false)
            return
          }

          const data = await placeRes.json()
          toast.success("Payment successful! Order placed.")
          router.push(`/orders/${data.order_id}`)
        },
        modal: {
          ondismiss: () => {
            setPlacing(false)
            toast.error("Payment cancelled")
          },
        },
        theme: { color: "#800020" },
      }

      const rzp = new window.Razorpay(options)
      rzp.open()
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Something went wrong"
      toast.error(message)
      setPlacing(false)
    }
  }

  if (authLoading || !user) {
    return <div className="flex flex-col flex-1"><Header /><main className="flex-1 flex items-center justify-center"><PageSkeleton /></main></div>
  }

  if (cartLoading) {
    return <div className="flex flex-col flex-1"><Header /><main className="flex-1 flex items-center justify-center"><PageSkeleton /></main></div>
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col flex-1">
        <Header />
        <main className="flex-1 px-6 py-24 text-center">
          <p className="text-[#6B6B6B] dark:text-[#9C9C9C] mb-4">Your cart is empty</p>
          <Button onClick={() => router.push("/products")} className="bg-[#800020] hover:bg-[#A00028] dark:bg-[#B8860B] dark:hover:bg-[#D4A020] text-white rounded-full">Browse Products</Button>
        </main>
      </div>
    )
  }

  return (
    <div className="flex flex-col flex-1">
      <Header />
      <main className="flex-1 px-6 py-8 max-w-4xl mx-auto w-full">
        <Link href="/cart" className="text-sm text-[#6B6B6B] dark:text-[#9C9C9C] hover:text-[#800020] dark:hover:text-[#B8860B] mb-6 inline-flex items-center gap-1 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Cart
        </Link>
        <h1 className="font-heading text-3xl text-[#333] dark:text-[#F0EDE8] mb-8">Checkout</h1>

        <div className="grid lg:grid-cols-5 gap-8">
          <div className="lg:col-span-3 space-y-6">
            <div>
              <h2 className="font-semibold flex items-center gap-2 mb-3 text-[#333] dark:text-[#F0EDE8]"><MapPin className="w-4 h-4 text-[#800020] dark:text-[#B8860B]" /> Shipping Address</h2>
              {addresses.length === 0 ? (
                <div className="border border-[#E5E0DB] dark:border-[#333] rounded-xl p-4 text-center">
                  <p className="text-sm text-[#6B6B6B] dark:text-[#9C9C9C] mb-3">No addresses saved</p>
                  <Button size="sm" className="bg-[#800020] hover:bg-[#A00028] dark:bg-[#B8860B] dark:hover:bg-[#D4A020] text-white rounded-full" onClick={() => router.push("/profile")}>Add Address</Button>
                </div>
              ) : (
                <div className="space-y-2">
                  {addresses.map((addr) => (
                    <label key={addr.id} className={`flex items-start gap-3 p-3 border rounded-xl cursor-pointer transition-colors ${selectedAddress === addr.id ? "border-[#800020] dark:border-[#B8860B] bg-[#800020]/5 dark:bg-[#B8860B]/10" : "border-[#E5E0DB] dark:border-[#333] hover:border-[#6B6B6B]"}`}>
                      <input type="radio" name="address" checked={selectedAddress === addr.id} onChange={() => setSelectedAddress(addr.id)} className="mt-1 accent-[#800020] dark:accent-[#B8860B]" />
                      <div>
                        <p className="font-medium text-sm text-[#333] dark:text-[#F0EDE8]">{addr.full_name}</p>
                        <p className="text-xs text-[#6B6B6B] dark:text-[#9C9C9C]">{addr.address_line1}{addr.address_line2 ? `, ${addr.address_line2}` : ""}</p>
                        <p className="text-xs text-[#6B6B6B] dark:text-[#9C9C9C]">{addr.city}, {addr.state} — {addr.postal_code}</p>
                        {addr.phone && <p className="text-xs text-[#6B6B6B] dark:text-[#9C9C9C]">{addr.phone}</p>}
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>

            <div>
              <h2 className="font-semibold flex items-center gap-2 mb-3 text-[#333] dark:text-[#F0EDE8]"><CreditCard className="w-4 h-4 text-[#800020] dark:text-[#B8860B]" /> Payment</h2>
              <div className="border border-[#E5E0DB] dark:border-[#333] rounded-xl p-4 space-y-2">
                <div className="flex items-center gap-2 text-sm text-[#6B6B6B] dark:text-[#9C9C9C]">
                  <Shield className="w-4 h-4 text-emerald-500" />
                  <span>Secured by Razorpay</span>
                </div>
                <p className="text-xs text-[#6B6B6B] dark:text-[#9C9C9C]">
                  Your payment information is processed securely. We do not store card details.
                </p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="border border-[#E5E0DB] dark:border-[#333] rounded-xl p-5 space-y-3 sticky top-8">
              <h3 className="font-heading text-lg text-[#333] dark:text-[#F0EDE8]">Order Summary</h3>
              <div className="space-y-2">
                {items.slice(0, 3).map((item) => {
                  const price = item.product.product_variants?.find((v) => v.id === item.variant_id)?.price ?? item.product.price
                  return (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="text-[#6B6B6B] dark:text-[#9C9C9C] truncate max-w-[200px]">{item.product.name} × {item.quantity}</span>
                      <span className="text-[#333] dark:text-[#F0EDE8]">₹{(price * item.quantity).toLocaleString("en-IN")}</span>
                    </div>
                  )
                })}
                {items.length > 3 && <p className="text-xs text-[#6B6B6B] dark:text-[#9C9C9C]">+{items.length - 3} more items</p>}
              </div>
              <div className="border-t border-[#E5E0DB] dark:border-[#333]" />
              <div className="flex justify-between text-sm"><span className="text-[#6B6B6B] dark:text-[#9C9C9C]">Subtotal</span><span className="text-[#333] dark:text-[#F0EDE8]">₹{totalPrice().toLocaleString("en-IN")}</span></div>
              <div className="flex justify-between text-sm"><span className="text-[#6B6B6B] dark:text-[#9C9C9C]">Shipping</span><span className={shipping === 0 ? "text-emerald-600 dark:text-emerald-400" : "text-[#333] dark:text-[#F0EDE8]"}>{shipping === 0 ? "Free" : `₹${shipping}`}</span></div>
              {discount > 0 && <div className="flex justify-between text-sm"><span className="text-emerald-600 dark:text-emerald-400">Discount ({appliedCoupon?.code})</span><span className="text-emerald-600 dark:text-emerald-400">-₹{discount.toLocaleString("en-IN")}</span></div>}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  placeholder={appliedCoupon ? `${appliedCoupon.code} applied` : "Enter coupon code"}
                  disabled={!!appliedCoupon}
                  className="flex-1 px-3 py-2 text-sm border border-[#E5E0DB] dark:border-[#333] rounded-lg bg-white dark:bg-[#1A1A1A] text-[#333] dark:text-[#F0EDE8] placeholder-[#9C9C9C] disabled:opacity-50"
                />
                {appliedCoupon ? (
                  <Button size="sm" variant="outline" className="text-xs rounded-full" onClick={() => { setAppliedCoupon(null); setCouponCode("") }}>Remove</Button>
                ) : (
                  <Button size="sm" className="bg-[#800020] hover:bg-[#A00028] dark:bg-[#B8860B] dark:hover:bg-[#D4A020] text-white rounded-full text-xs" onClick={handleApplyCoupon} disabled={couponLoading || !couponCode.trim()}>
                    {couponLoading ? "..." : "Apply"}
                  </Button>
                )}
              </div>
              <div className="border-t border-[#E5E0DB] dark:border-[#333]" />
              <div className="flex justify-between font-semibold text-[#333] dark:text-[#F0EDE8]"><span>Total</span><span>₹{grandTotal.toLocaleString("en-IN")}</span></div>
              <Button className="w-full bg-[#800020] hover:bg-[#A00028] dark:bg-[#B8860B] dark:hover:bg-[#D4A020] text-white rounded-full h-12" size="lg" onClick={handlePlaceOrder} disabled={placing || !selectedAddress}>
                {placing ? "Processing..." : `Pay ₹${grandTotal.toLocaleString("en-IN")}`}
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
