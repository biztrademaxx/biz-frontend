import type { OrganizerListEntry } from "./types"

export function organizerHasProfileImage(entry: OrganizerListEntry): boolean {
  const raw = entry.image ?? entry.avatar ?? ""
  return typeof raw === "string" && raw.trim().length > 0
}

export function filterOrganizersWithProfileImage(
  entries: OrganizerListEntry[],
): OrganizerListEntry[] {
  return entries.filter(organizerHasProfileImage)
}
