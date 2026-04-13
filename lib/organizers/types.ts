/**
 * Public organizer list row (home / directory use cases).
 */
export interface OrganizerListEntry {
  id: string | number
  company?: string | null
  name?: string | null
  image?: string | null
  avatar?: string | null
}

export interface OrganizersApiEnvelope {
  organizers?: OrganizerListEntry[] | null
}
