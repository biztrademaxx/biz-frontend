"use client"

import { useEffect, useState } from "react"
import type { CurrentDashboardPlan, DashboardPackageRole } from "@/lib/dashboard-packages"
import { fetchCurrentDashboardPlan } from "@/lib/subscription-checkout"

export function useDashboardPlan(role: DashboardPackageRole | null) {
  const [plan, setPlan] = useState<CurrentDashboardPlan | null>(null)
  const [loading, setLoading] = useState(Boolean(role))

  useEffect(() => {
    if (!role) {
      setPlan(null)
      setLoading(false)
      return
    }

    let cancelled = false
    setLoading(true)
    void fetchCurrentDashboardPlan(role)
      .then((data) => {
        if (!cancelled) setPlan(data)
      })
      .catch(() => {
        if (!cancelled) setPlan(null)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [role])

  return { plan, loading }
}

/** Map JWT / user role string to dashboard plan role. */
export function dashboardRoleFromUserRole(role: string | null | undefined): DashboardPackageRole | null {
  const r = (role ?? "").toUpperCase()
  if (r === "EXHIBITOR") return "EXHIBITOR"
  if (r === "ORGANIZER") return "ORGANIZER"
  if (r === "VISITOR" || r === "ATTENDEE") return "VISITOR"
  return null
}
