"use client"

import { AppImage } from "@/components/app-image"
import { Badge } from "@/components/ui/badge"
import type { Event } from "../types/event.types"
import { resolvedVerifiedBadgeImageUrl } from "@/lib/verified-event-badge"

export function VerifiedBadge({ event }: { event: Event }) {
  if (!event.isVerified) return null
  const src = resolvedVerifiedBadgeImageUrl(true, event.verifiedBadgeImage)
  if (!src) return null
  return (
    <Badge className="bg-green-100 text-green-800 border border-green-300">
      <AppImage src={src} alt="Verified" width={16} height={16} className="mr-1 h-4 w-4 object-contain" />
      Verified
    </Badge>
  )
}
