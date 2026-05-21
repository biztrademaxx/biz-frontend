import { formatVenueLocationLabel } from "@/lib/venues/format-venue-location"

describe("formatVenueLocationLabel", () => {
  it("joins city and country", () => {
    expect(formatVenueLocationLabel("Bengaluru", "India")).toBe("Bengaluru, India")
  })

  it("expands ISO country codes", () => {
    expect(formatVenueLocationLabel("Mumbai", "IN")).toBe("Mumbai, India")
  })

  it("avoids duplicating country already in city", () => {
    expect(formatVenueLocationLabel("Bengaluru, India", "India")).toBe("Bengaluru, India")
  })

  it("returns TBD when both empty", () => {
    expect(formatVenueLocationLabel("", "")).toBe("Location TBD")
  })
})
