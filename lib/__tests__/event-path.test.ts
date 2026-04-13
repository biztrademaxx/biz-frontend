import { eventPublicPath } from "@/lib/event-path"

describe("eventPublicPath", () => {
  it("uses slug when non-empty", () => {
    expect(eventPublicPath({ id: "uuid-1", slug: "  expo-2026  " })).toBe(
      "/event/expo-2026"
    )
  })

  it("falls back to id when slug missing or blank", () => {
    expect(eventPublicPath({ id: "abc-123", slug: null })).toBe("/event/abc-123")
    expect(eventPublicPath({ id: "abc-123", slug: "" })).toBe("/event/abc-123")
    expect(eventPublicPath({ id: "abc-123", slug: "   " })).toBe("/event/abc-123")
  })

  it("encodes unsafe segments", () => {
    expect(eventPublicPath({ id: "x y", slug: null })).toBe("/event/x%20y")
  })
})
