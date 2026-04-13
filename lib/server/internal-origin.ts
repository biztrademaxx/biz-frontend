import { headers } from "next/headers"

/**
 * Absolute origin for same-origin fetches from RSC (e.g. `/api/...` routes).
 */
export async function getInternalAppOrigin(): Promise<string> {
  const h = await headers()
  const host = h.get("x-forwarded-host") ?? h.get("host")
  if (!host) {
    return (
      process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ??
      "http://localhost:3000"
    )
  }
  const proto = h.get("x-forwarded-proto") ?? "http"
  return `${proto}://${host}`
}
