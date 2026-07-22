"use client"

import { useMemo } from "react"

function addDays(date: Date, days: number): Date {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d
}

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-IN", { month: "short", day: "numeric" })
}

export function DeliveryEstimate() {
  const range = useMemo(() => {
    const today = new Date()
    const start = addDays(today, 5)
    const end = addDays(today, 9)
    return `${formatDate(start)} – ${formatDate(end)}`
  }, [])

  return <span>Free Delivery — estimated by <strong>{range}</strong></span>
}
