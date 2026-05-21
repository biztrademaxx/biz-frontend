import {
  buildResolvedHomeLocation,
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

  it("does not match India via `in` substring inside Singapore", () => {
    const loc = buildResolvedHomeLocation({ city: "Singapore", countryCode: "SG", countryName: "Singapore" })
    expect(matchesHomeCountry({ id: "x", city: "Singapore", country: "Singapore" }, loc, getters)).toBe(true)
    expect(matchesHomeCountry({ id: "y", city: "Mumbai", country: "India" }, loc, getters)).toBe(false)
  })
})
