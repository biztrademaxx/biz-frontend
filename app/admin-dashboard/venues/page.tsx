"use client"

import VenueManagement from "./VenueManagementPage"

export default function VenuesPage({
  initialTab,
}: {
  initialTab?: "all" | "pending" | "active" | "bulk-import"
}) {
  return <VenueManagement initialTab={initialTab} />
}
