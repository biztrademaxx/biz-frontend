"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { getCurrentUserId, getCurrentUserRole } from "@/lib/api"

// No server session; redirect to dashboard by user id or login. Client enforces JWT auth.
export default function VenueDashboardRoot() {
  const router = useRouter()

  useEffect(() => {
    const userId = getCurrentUserId()
    const role = (getCurrentUserRole() || "").toUpperCase()
    if (!userId || role !== "VENUE_MANAGER") {
      router.replace("/login")
      return
    }
    router.replace(`/venue-dashboard/${userId}`)
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
    </div>
  )
}
