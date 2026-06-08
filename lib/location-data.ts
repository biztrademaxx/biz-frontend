import { City, Country, State } from "country-state-city"

export type CountryOption = { code: string; name: string }
export type StateOption = { code: string; name: string }
export type CityOption = { name: string }

export function getCountryOptions(): CountryOption[] {
  return Country.getAllCountries()
    .map((country) => ({ code: country.isoCode, name: country.name }))
    .sort((a, b) => a.name.localeCompare(b.name))
}

export function getCountryTimezoneByName(countryName: string): string | null {
  const typed = countryName.trim().toLowerCase()
  if (!typed) return null
  const country = Country.getAllCountries().find((c) => {
    const name = c.name.trim().toLowerCase()
    const code = c.isoCode.trim().toLowerCase()
    return name === typed || code === typed || typed.includes(name) || name.includes(typed)
  })
  if (!country) return null
  // Prefer canonical business timezones for countries we commonly use.
  if (country.isoCode === "IN") return "Asia/Kolkata"
  const zones = country.timezones
  if (!Array.isArray(zones) || zones.length === 0) return null
  return zones[0]?.zoneName ?? null
}

export function getStateOptions(countryCode: string): StateOption[] {
  if (!countryCode) return []
  return State.getStatesOfCountry(countryCode)
    .map((state) => ({ code: state.isoCode, name: state.name }))
    .sort((a, b) => a.name.localeCompare(b.name))
}

export function getCityOptions(countryCode: string, stateCode: string): CityOption[] {
  if (!countryCode || !stateCode) return []
  return City.getCitiesOfState(countryCode, stateCode)
    .map((city) => ({ name: city.name }))
    .sort((a, b) => a.name.localeCompare(b.name))
}

/** City and country only (e.g. connection cards, event tables). */
export function formatCityCountryLine(input: {
  city?: string | null
  country?: string | null
  locationDisplay?: string | null
  profileCity?: string | null
  profileCountry?: string | null
  location?: string | null
} | null | undefined): string {
  if (!input) return ""
  const fromApi = String(input.locationDisplay ?? "").trim()
  if (fromApi) return fromApi
  const city = String(input.city ?? input.profileCity ?? "").trim()
  const country = String(input.country ?? input.profileCountry ?? "").trim()
  const fromParts = [city, country].filter(Boolean).join(", ")
  if (fromParts) return fromParts
  const raw = String(input.location ?? "").trim()
  if (!raw) return ""
  const segments = raw.split(",").map((s) => s.trim()).filter(Boolean)
  if (segments.length >= 2) {
    return [segments[0], segments[segments.length - 1]].filter(Boolean).join(", ")
  }
  return raw
}

/** Profile / speaker / visitor location line. */
export function formatProfileLocationLine(user: {
  profileCity?: string | null
  profileState?: string | null
  profileCountry?: string | null
  location?: string | null
} | null | undefined): string {
  if (!user) return ""
  const city = String(user.profileCity ?? "").trim()
  const state = String(user.profileState ?? "").trim()
  const country = String(user.profileCountry ?? "").trim()
  const fromParts = [city, state, country].filter(Boolean).join(", ")
  if (fromParts) return fromParts
  return String(user.location ?? "").trim()
}

/** Prefer structured organizer location; fall back to legacy headquarters / location strings. */
export function formatOrganizerLocationLine(organizer: {
  organizerCity?: string | null
  organizerState?: string | null
  organizerCountry?: string | null
  headquarters?: string | null
  location?: string | null
} | null | undefined): string {
  if (!organizer) return ""
  const city = String(organizer.organizerCity ?? "").trim()
  const state = String(organizer.organizerState ?? "").trim()
  const country = String(organizer.organizerCountry ?? "").trim()
  const fromParts = [city, state, country].filter(Boolean).join(", ")
  if (fromParts) return fromParts
  const hq = String(organizer.headquarters ?? "").trim()
  const loc = String(organizer.location ?? "").trim()
  return hq || loc
}
