const ACTIVITY_KEY = "viraasat_cart_activity"
const DISMISS_KEY = "viraasat_cart_dismissed"
const THRESHOLD = 2 * 60 * 60 * 1000
const DISMISS_COOLDOWN = 24 * 60 * 60 * 1000

export function markCartActivity() {
  if (typeof window === "undefined") return
  localStorage.setItem(ACTIVITY_KEY, Date.now().toString())
}

export function checkAbandonedCart(): boolean {
  if (typeof window === "undefined") return false
  const lastActivity = localStorage.getItem(ACTIVITY_KEY)
  if (!lastActivity) return false

  const dismissed = localStorage.getItem(DISMISS_KEY)
  if (dismissed && Date.now() - Number(dismissed) < DISMISS_COOLDOWN) return false

  return Date.now() - Number(lastActivity) >= THRESHOLD
}

export function dismissAbandonedReminder() {
  localStorage.setItem(DISMISS_KEY, Date.now().toString())
}
