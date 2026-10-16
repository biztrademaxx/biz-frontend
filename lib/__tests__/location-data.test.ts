import { getCountryTimezoneByName } from "@/lib/location-data"

describe("getCountryTimezoneByName", () => {
  it.each(["India", " india ", "IN", "in"])("resolves %s to India before partial country matches", (country) => {
    expect(getCountryTimezoneByName(country)).toBe("Asia/Kolkata")
  })

  it("keeps British Indian Ocean Territory distinct from India", () => {
    expect(getCountryTimezoneByName("British Indian Ocean Territory")).toBe("Indian/Chagos")
  })

  it("prefers Indonesia over partial matches for its ISO code", () => {
    expect(getCountryTimezoneByName("ID")).toBe("Asia/Jakarta")
  })

  it.each(["", "   ", "Unknown country"])("returns no timezone for %s", (country) => {
    expect(getCountryTimezoneByName(country)).toBeNull()
  })
})
