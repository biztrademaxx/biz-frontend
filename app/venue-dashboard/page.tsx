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
        const name = payload?.manager?.venueName ?? payload?.name ?? ""
        router.replace(getVenueDashboardPath(userId, name))
      } catch {
        router.replace(`/venue-dashboard/${userId}`)
      }
    })()
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
    </div>
  )
}
