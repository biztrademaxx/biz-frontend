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
