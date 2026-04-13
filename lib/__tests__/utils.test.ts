import { cn, formatDate } from "@/lib/utils"

describe("cn", () => {
  it("merges tailwind classes and drops conflicts (later wins)", () => {
    expect(cn("px-2 py-1", "px-4")).toBe("py-1 px-4")
  })

  it("handles conditional classes", () => {
    expect(cn("base", false && "hidden", true && "block")).toBe("base block")
  })
})

describe("formatDate", () => {
  it("formats ISO date strings for en-US locale", () => {
    const s = formatDate("2026-03-15T12:00:00.000Z")
    expect(s).toMatch(/Mar/)
    expect(s).toMatch(/2026/)
  })
})
