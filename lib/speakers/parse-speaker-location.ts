/** Parse structured or legacy comma-separated speaker location. */
export function parseSpeakerLocationParts(input: {
  profileCity?: string | null
  profileState?: string | null
  profileCountry?: string | null
  city?: string | null
  state?: string | null
  country?: string | null
  location?: string | null
}): { city: string; state: string; country: string } {
  const city = String(input.profileCity ?? input.city ?? "").trim()
  const state = String(input.profileState ?? input.state ?? "").trim()
  const country = String(input.profileCountry ?? input.country ?? "").trim()
  if (city || state || country) return { city, state, country }

  const raw = String(input.location ?? "").trim()
  if (!raw) return { city: "", state: "", country: "" }

  const segments = raw.split(",").map((s) => s.trim()).filter(Boolean)
  if (segments.length >= 3) {
    return {
      city: segments[0] ?? "",
      state: segments[1] ?? "",
      country: segments.slice(2).join(", "),
    }
  }
  if (segments.length === 2) {
    return { city: segments[0] ?? "", state: "", country: segments[1] ?? "" }
  }
  return { city: raw, state: "", country: "" }
}
