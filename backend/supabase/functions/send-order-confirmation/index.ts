import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { Resend } from "https://esm.sh/resend@2.0.0"

interface OrderItem {
  name: string
  quantity: number
  price: number
}

interface Payload {
  to: string
  order_id: string
  items: OrderItem[]
  total: number
  shipping: number
}

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") ?? ""

serve(async (req) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405 })
  }

  const auth = req.headers.get("Authorization")
  if (!auth || !auth.startsWith("Bearer ") || auth.slice(7) !== Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 })
  }

  if (!RESEND_API_KEY) {
    return new Response(JSON.stringify({ error: "Resend not configured" }), { status: 200 })
  }

  try {
    const payload: Payload = await req.json()
    const resend = new Resend(RESEND_API_KEY)

    const itemsHtml = payload.items.map((item) =>
      `<tr><td style="padding:8px 0;border-bottom:1px solid #eee">${item.name}</td><td style="padding:8px 0;border-bottom:1px solid #eee;text-align:center">${item.quantity}</td><td style="padding:8px 0;border-bottom:1px solid #eee;text-align:right">₹${item.price.toLocaleString("en-IN")}</td></tr>`
    ).join("")

    const { error } = await resend.emails.send({
      from: "Viraasat <orders@viraasat.com>",
      to: [payload.to],
      subject: `Order Confirmed — #${payload.order_id.slice(0, 8).toUpperCase()}`,
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px">
          <div style="text-align:center;border-bottom:2px solid #800020;padding-bottom:16px;margin-bottom:24px">
            <h1 style="color:#800020;font-size:24px;margin:0">Viraasat</h1>
            <p style="color:#6B6B6B;font-size:14px">Ethnic Elegance</p>
          </div>
          <h2 style="color:#333;font-size:18px">Thank you for your order!</h2>
          <p style="color:#6B6B6B;font-size:14px">Order <strong>#${payload.order_id.slice(0, 8).toUpperCase()}</strong></p>
          <table style="width:100%;border-collapse:collapse;margin:24px 0;font-size:14px">
            <thead><tr style="background:#F5F0EB"><th style="padding:8px;text-align:left">Item</th><th style="padding:8px;text-align:center">Qty</th><th style="padding:8px;text-align:right">Price</th></tr></thead>
            <tbody>${itemsHtml}</tbody>
          </table>
          <div style="border-top:2px solid #eee;padding-top:12px;margin-top:12px">
            <p style="display:flex;justify-content:space-between;font-size:14px;color:#6B6B6B;margin:4px 0">
              <span>Shipping</span><span>${payload.shipping === 0 ? "FREE" : "₹" + payload.shipping.toLocaleString("en-IN")}</span>
            </p>
            <p style="display:flex;justify-content:space-between;font-size:18px;font-weight:bold;color:#333;margin:8px 0">
              <span>Total</span><span>₹${payload.total.toLocaleString("en-IN")}</span>
            </p>
          </div>
          <div style="margin-top:32px;padding:16px;background:#F5F0EB;border-radius:8px;font-size:13px;color:#6B6B6B">
            <p style="margin:0 0 8px"><strong style="color:#333">Shipping</strong></p>
            <p style="margin:0">Estimated delivery: 5–7 business days</p>
          </div>
          <p style="margin-top:24px;font-size:12px;color:#9C9C9C;text-align:center">
            Viraasat — Ethnic Women's Kurtis
          </p>
        </div>
      `,
    })

    if (error) {
      console.error("Resend error:", error)
    }

    return new Response(JSON.stringify({ sent: !error }), {
      headers: { "Content-Type": "application/json" },
    })
  } catch (err) {
    console.error("Send email error:", err)
    return new Response(JSON.stringify({ error: String(err) }), { status: 500 })
  }
})
