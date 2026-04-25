"use client"

import OrganizerManagement from "../organizer-management"

export default function OrganizersPage({ initialTab }: { initialTab?: "all" | "bulk-import" }) {
  return <OrganizerManagement initialTab={initialTab} />
}
