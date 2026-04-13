import type { OrganizerListEntry } from "@/lib/organizers/types"
import {
  filterOrganizersWithProfileImage,
  organizerHasProfileImage,
} from "@/lib/organizers/organizer-visibility"

const FALLBACK_ORGANIZER_LABEL = "Organizer"

export { filterOrganizersWithProfileImage, organizerHasProfileImage }

export function organizerDisplayName(entry: OrganizerListEntry): string {
  const company = typeof entry.company === "string" ? entry.company.trim() : ""
  if (company) return company
  const personName = typeof entry.name === "string" ? entry.name.trim() : ""
  if (personName) return personName
  return FALLBACK_ORGANIZER_LABEL
}

export function organizerLogoSrc(entry: OrganizerListEntry): string {
  return (entry.image ?? entry.avatar ?? "").trim()
}

export function organizerRouteId(entry: OrganizerListEntry): string {
  return String(entry.id)
}

/**
 * Longer lists scroll a bit faster so the loop does not feel stuck; bounded for readability.
 */
export function organizersMarqueeDurationSeconds(visibleCount: number): number {
  return Math.min(90, Math.max(28, visibleCount * 2.8 + 12))
}

