"use client"

import VenueManagement from "../venue-management"

export default function VenuesPage({
  initialTab,
}: {
  initialTab?: "all" | "pending" | "active" | "bulk-import"
}) {
  return <VenueManagement initialTab={initialTab} />
}
