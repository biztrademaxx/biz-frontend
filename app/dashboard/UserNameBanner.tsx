"use client"

import { useEffect, useState } from "react"
import { NameBanner } from "./NameBanner"
import { apiFetch, getCurrentUserDisplayName, getCurrentUserId } from "@/lib/api"

type UserNameBannerProps = {
  userId: string
  designation: string
}

/** Fetches `/api/users/:id` (backend) and shows role-aware `displayName` from the API. */
export function UserNameBanner({ userId, designation }: UserNameBannerProps) {
  // Keep first render deterministic for SSR hydration.
  const [name, setName] = useState("User")

  useEffect(() => {
    if (getCurrentUserId() === userId) {
      const fromToken = getCurrentUserDisplayName().trim()
      if (fromToken) setName(fromToken)
    }

    let cancelled = false
    apiFetch<{ user?: { displayName?: string } }>(`/api/users/${userId}`, { auth: true })
      .then((d) => {
        const dn = d.user?.displayName?.trim()
        if (!cancelled && dn) setName(dn)
      })
      .catch(() => {
        /* keep JWT / fallback name */
      })
    return () => {
      cancelled = true
    }
  }, [userId])

  return <NameBanner name={name} designation={designation} />
}
