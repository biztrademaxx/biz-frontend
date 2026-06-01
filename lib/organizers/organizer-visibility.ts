// organizer-visibility.ts
import type { OrganizerListEntry } from "./types"

/** Match backend `hasPublicProfileImage`: real URL only, not empty or placeholder tiles. */
export function organizerHasProfileImage(entry: OrganizerListEntry): boolean {
  const raw = String(entry.image ?? entry.avatar ?? "").trim()
  if (!raw) return false

  // TEMPORARILY DISABLED FOR DEBUGGING - COMMENT BACK IN PRODUCTION
  const lower = raw.toLowerCase()
  // if (lower.includes("placeholder.svg")) return false
  // if (lower.includes("text=org") || lower.includes("text=avatar")) return false

  // Allow all images for now to debug India issue
  return true
}

export function filterOrganizersWithProfileImage(
  entries: OrganizerListEntry[],
): OrganizerListEntry[] {
  return entries.filter(organizerHasProfileImage)
}