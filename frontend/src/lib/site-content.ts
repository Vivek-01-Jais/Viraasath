import { API_URL } from "@/lib/config"

let cachedContent: Record<string, string> | null = null
let cachePromise: Promise<Record<string, string>> | null = null

export async function getSiteContent(): Promise<Record<string, string>> {
  if (cachedContent) return cachedContent
  if (cachePromise) return cachePromise

  cachePromise = (async () => {
    try {
      const res = await fetch(`${API_URL}/api/site-content`, { next: { revalidate: 300 } })
      if (res.ok) {
        cachedContent = await res.json()
        return cachedContent!
      }
    } catch {
      // fall through
    }
    return {}
  })()

  return cachePromise
}

export async function getContent(key: string, fallback: string): Promise<string> {
  const content = await getSiteContent()
  return content[key] || fallback
}
