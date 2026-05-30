import type { OrganizerListEntry } from "./types"

/** Match backend `hasPublicProfileImage`: real URL only, not empty or placeholder tiles. */
export function organizerHasProfileImage(entry: OrganizerListEntry): boolean {
  const raw = String(entry.image ?? entry.avatar ?? "").trim()
  if (!raw) return false
  const lower = raw.toLowerCase()
  if (lower.includes("placeholder.svg")) return false
  if (lower.includes("text=org") || lower.includes("text=avatar")) return false
  return true
}

export function filterOrganizersWithProfileImage(
  entries: OrganizerListEntry[],
): OrganizerListEntry[] {
  return entries.filter(organizerHasProfileImage)
}
