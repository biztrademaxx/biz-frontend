import {
  buildResolvedHomeLocation,
  cityMatches,
  countryMatchNeedles,
  filterByHomeCountryPrioritizeCity,
  matchesHomeCountry,
} from "@/lib/home-location"

type Row = { id: string; city: string; country: string }

const getters = {
  getCity: (r: Row) => r.city,
  getCountry: (r: Row) => r.country,
}

describe("home country filtering", () => {
  it("does not include nearby countries in match needles", () => {
    const sg = buildResolvedHomeLocation({ city: "Singapore", countryCode: "SG", countryName: "Singapore" })
    expect(countryMatchNeedles(sg)).not.toContain("in")
    expect(countryMatchNeedles(sg)).not.toContain("india")

    const gb = buildResolvedHomeLocation({ city: "London", countryCode: "GB", countryName: "United Kingdom" })
    expect(countryMatchNeedles(gb)).not.toContain("france")
    expect(countryMatchNeedles(gb)).not.toContain("fr")
  })

  it("Singapore scope excludes India events", () => {
    const loc = buildResolvedHomeLocation({ city: "Singapore", countryCode: "SG", countryName: "Singapore" })
    const items: Row[] = [
      { id: "1", city: "Singapore", country: "Singapore" },
      { id: "2", city: "Mumbai", country: "India" },
    ]
    const filtered = filterByHomeCountryPrioritizeCity(items, loc, getters)
    expect(filtered.map((r) => r.id)).toEqual(["1"])
  })

  it("United Kingdom scope excludes France events", () => {
    const loc = buildResolvedHomeLocation({
      city: "London",
      countryCode: "GB",
      countryName: "United Kingdom",
    })
    const items: Row[] = [
      { id: "1", city: "London", country: "United Kingdom" },
      { id: "2", city: "Paris", country: "France" },
    ]
    const filtered = filterByHomeCountryPrioritizeCity(items, loc, getters)
    expect(filtered.map((r) => r.id)).toEqual(["1"])
  })

  it("matches Bengaluru and Bangalore as the same city", () => {
    expect(cityMatches("Bangalore, Karnataka", "Bengaluru")).toBe(true)
    expect(cityMatches("Bengaluru", "Bangalore")).toBe(true)
  })

  it("matches venues by visitor country when only city is set on the venue", () => {
    const loc = buildResolvedHomeLocation({
      city: "Bengaluru",
      countryCode: "IN",
      countryName: "India",
    })
    const venues: Row[] = [
      { id: "1", city: "Mumbai", country: "" },
      { id: "2", city: "Sydney", country: "Australia" },
    ]
    expect(matchesHomeCountry(venues[0], loc, getters)).toBe(true)
    expect(matchesHomeCountry(venues[1], loc, getters)).toBe(false)
    const ordered = filterByHomeCountryPrioritizeCity(venues, loc, getters)
    expect(ordered.map((r) => r.id)).toEqual(["1"])
  })

  it("includes all venues in country with home city listed first", () => {
    const loc = buildResolvedHomeLocation({
      city: "Bengaluru",
      countryCode: "IN",
      countryName: "India",
    })
    const venues: Row[] = [
      { id: "mumbai", city: "Mumbai", country: "India" },
      { id: "blr", city: "Bengaluru", country: "India" },
      { id: "delhi", city: "Delhi", country: "India" },
    ]
    const ordered = filterByHomeCountryPrioritizeCity(venues, loc, getters)
    expect(ordered.map((r) => r.id)).toEqual(["blr", "mumbai", "delhi"])
  })

  it("does not match India via `in` substring inside Singapore", () => {
    const loc = buildResolvedHomeLocation({ city: "Singapore", countryCode: "SG", countryName: "Singapore" })
    expect(matchesHomeCountry({ id: "x", city: "Singapore", country: "Singapore" }, loc, getters)).toBe(true)
    expect(matchesHomeCountry({ id: "y", city: "Mumbai", country: "India" }, loc, getters)).toBe(false)
  })

  it("matches speakers in India when only legacy location line is set", () => {
    const loc = buildResolvedHomeLocation({
      city: "Bengaluru",
      countryCode: "IN",
      countryName: "India",
    })
    const speakerGetters = {
      getCity: (s: { city: string; country: string; locationHay: string }) =>
        s.city?.trim() || s.locationHay?.trim() || "",
      getCountry: (s: { city: string; country: string; locationHay: string }) =>
        s.country?.trim() || s.locationHay?.trim() || "",
    }
    const speakers = [
      { id: "1", city: "Mumbai", country: "", locationHay: "Mumbai Maharashtra India" },
      { id: "2", city: "Paris", country: "France", locationHay: "Paris France" },
    ]
    const filtered = filterByHomeCountryPrioritizeCity(speakers, loc, speakerGetters)
    expect(filtered.map((s) => s.id)).toEqual(["1"])
  })
})
