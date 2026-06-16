"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { apiFetch, getCurrentUserId, getCurrentUserRole } from "@/lib/api"
import { getVenueDashboardPath } from "@/lib/venue-dashboard-path"

// No server session; redirect to `/venue-dashboard/{slug|uuid}`. Client enforces JWT auth.
export default function VenueDashboardRoot() {
  const router = useRouter()

  useEffect(() => {
    const userId = getCurrentUserId()
    const role = (getCurrentUserRole() || "").toUpperCase()
    if (!userId || role !== "VENUE_MANAGER") {
      router.replace("/login")
      return
    }
    ;(async () => {
      try {
        const json = await apiFetch<{ data?: { manager?: { venueName?: string }; name?: string } }>(
          `/api/venue-manager/${encodeURIComponent(userId)}`,
        )
        const payload = json.data
        const rawVenueName = payload?.manager?.venueName?.trim() ?? ""
        const name =
          rawVenueName && rawVenueName !== "Unnamed Venue" ? rawVenueName : ""
        router.replace(getVenueDashboardPath(userId, name))
      } catch {
        router.replace(`/venue-dashboard/${userId}`)
      }
    })()
  }, [router])

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#eef1f8]">
      <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden>
        <div className="absolute -top-24 -left-20 h-[28rem] w-[28rem] rounded-full bg-blue-400/20 blur-3xl" />
        <div className="absolute top-1/3 -right-16 h-[24rem] w-[24rem] rounded-full bg-sky-300/40 blur-3xl" />
      </div>
      <div className="relative z-10 h-12 w-12 animate-spin rounded-full border-2 border-blue-200 border-t-[#004A96]" />
    </div>
  )
}
