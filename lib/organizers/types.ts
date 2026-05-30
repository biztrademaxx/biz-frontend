/**
 * Public organizer list row (home / directory use cases).
 */
export interface OrganizerListEntry {
  id: string | number
  company?: string | null
  name?: string | null
  image?: string | null
  avatar?: string | null
  city?: string | null
  state?: string | null
  country?: string | null
  headquarters?: string | null
  location?: string | null
  locationHay?: string | null
}

export interface OrganizersApiEnvelope {
  organizers?: OrganizerListEntry[] | null
}
