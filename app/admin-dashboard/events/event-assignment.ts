export type EventAssignmentContact = {
  id: string
  firstName?: string | null
  lastName?: string | null
  name?: string | null
  email?: string | null
  phone?: string | null
  company?: string | null
  organizationName?: string | null
  businessEmail?: string | null
  businessPhone?: string | null
  businessAddress?: string | null
  headquarters?: string | null
  location?: string | null
  organizerCity?: string | null
  organizerState?: string | null
  organizerCountry?: string | null
  website?: string | null
  venueName?: string | null
  venueAddress?: string | null
  venueCity?: string | null
  venueState?: string | null
  venueCountry?: string | null
  venueZipCode?: string | null
  venueEmail?: string | null
  venuePhone?: string | null
  venueWebsite?: string | null
  maxCapacity?: number | null
}

export type EventAssignmentKind = "organizers" | "venues"

export function getAssignmentName(contact: EventAssignmentContact, kind: EventAssignmentKind): string {
  const fullName = [contact.firstName, contact.lastName].filter(Boolean).join(" ").trim()
  return (kind === "organizers"
    ? contact.organizationName || contact.company || contact.name || fullName || contact.email || "Unnamed organizer"
    : contact.venueName || contact.name || fullName || "Unnamed venue").trim()
}

export function getAssignmentDetails(
  contact: EventAssignmentContact,
  kind: EventAssignmentKind,
): Array<[string, string]> {
  const fullName = [contact.firstName, contact.lastName].filter(Boolean).join(" ").trim()
  if (kind === "organizers") {
    return [
      ["Contact person", fullName],
      ["Email", contact.businessEmail || contact.email || ""],
      ["Phone", contact.businessPhone || contact.phone || ""],
      ["Address", contact.businessAddress || contact.headquarters || ""],
      ["Location", [contact.organizerCity, contact.organizerState, contact.organizerCountry].filter(Boolean).join(", ") || contact.location || ""],
      ["Website", contact.website || ""],
    ]
  }
  return [
    ["Contact person", fullName],
    ["Email", contact.venueEmail || contact.email || ""],
    ["Phone", contact.venuePhone || contact.phone || ""],
    ["Address", contact.venueAddress || ""],
    ["Location", [contact.venueCity, contact.venueState, contact.venueCountry, contact.venueZipCode].filter(Boolean).join(", ")],
    ["Website", contact.venueWebsite || contact.website || ""],
    ["Capacity", contact.maxCapacity ? contact.maxCapacity.toLocaleString() : ""],
  ]
}
