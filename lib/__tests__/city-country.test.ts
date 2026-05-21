import { resolveCountryForCityName } from "@/lib/city-country"

describe("resolveCountryForCityName", () => {
  it("maps Indian cities to India", () => {
    expect(resolveCountryForCityName("Mumbai")).toEqual({
      countryCode: "IN",
      countryName: "India",
    })
    expect(resolveCountryForCityName("Bengaluru")).toEqual({
      countryCode: "IN",
      countryName: "India",
    })
  })

  it("maps international popular cities", () => {
    expect(resolveCountryForCityName("Dubai")?.countryCode).toBe("AE")
    expect(resolveCountryForCityName("New York")?.countryCode).toBe("US")
    expect(resolveCountryForCityName("shanghai")?.countryName).toBe("China")
  })
})
