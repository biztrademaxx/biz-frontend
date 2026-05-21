/** Resolve country for navbar / home city picks (not visitor VPN). */

export type CityCountry = {
  countryCode: string
  countryName: string
}

/** Lowercase city key → country (popular picker + common aliases). */
const CITY_COUNTRY_MAP: Record<string, CityCountry> = {
  mumbai: { countryCode: "IN", countryName: "India" },
  delhi: { countryCode: "IN", countryName: "India" },
  "new delhi": { countryCode: "IN", countryName: "India" },
  bengaluru: { countryCode: "IN", countryName: "India" },
  bangalore: { countryCode: "IN", countryName: "India" },
  hyderabad: { countryCode: "IN", countryName: "India" },
  chennai: { countryCode: "IN", countryName: "India" },
  kolkata: { countryCode: "IN", countryName: "India" },
  calcutta: { countryCode: "IN", countryName: "India" },
  pune: { countryCode: "IN", countryName: "India" },
  ahmedabad: { countryCode: "IN", countryName: "India" },
  dubai: { countryCode: "AE", countryName: "United Arab Emirates" },
  singapore: { countryCode: "SG", countryName: "Singapore" },
  london: { countryCode: "GB", countryName: "United Kingdom" },
  "new york": { countryCode: "US", countryName: "United States" },
  paris: { countryCode: "FR", countryName: "France" },
  shanghai: { countryCode: "CN", countryName: "China" },
  "shanghai, china": { countryCode: "CN", countryName: "China" },
  berlin: { countryCode: "DE", countryName: "Germany" },
  amsterdam: { countryCode: "NL", countryName: "Netherlands" },
  istanbul: { countryCode: "TR", countryName: "Turkey" },
  "kuala lumpur": { countryCode: "MY", countryName: "Malaysia" },
  chicago: { countryCode: "US", countryName: "United States" },
  orlando: { countryCode: "US", countryName: "United States" },
  "washington dc": { countryCode: "US", countryName: "United States" },
}

function normalizeCityKey(city: string): string {
  return city.trim().toLowerCase().replace(/\s+/g, " ")
}

export function resolveCountryForCityName(city: string | null | undefined): CityCountry | null {
  const key = normalizeCityKey(city ?? "")
  if (!key) return null
  return CITY_COUNTRY_MAP[key] ?? null
}

export function homeLocationScopeLabel(
  city: string | null | undefined,
  country: string | null | undefined,
): string {
  const c = city?.trim()
  const co = country?.trim()
  if (c && co) return `${c}, ${co}`
  if (co) return co
  if (c) return c
  return "your region"
}
