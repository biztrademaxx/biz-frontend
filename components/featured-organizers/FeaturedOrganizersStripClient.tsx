"use client"

import { useCallback } from "react"
import { useRouter } from "next/navigation"
import type { OrganizerListEntry } from "@/lib/organizers/types"
import { OrganizersMarquee } from "./OrganizersMarquee"

export interface FeaturedOrganizersStripClientProps {
  organizers: OrganizerListEntry[]
}

export default function FeaturedOrganizersStripClient({
  organizers,
}: FeaturedOrganizersStripClientProps) {
  const router = useRouter()
  const onOrganizerActivate = useCallback(
    (organizerId: string) => {
      router.push(`/organizer/${encodeURIComponent(organizerId)}`)
    },
    [router],
  )

  return <OrganizersMarquee organizers={organizers} onOrganizerActivate={onOrganizerActivate} />
}
