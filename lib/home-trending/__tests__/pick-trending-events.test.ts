import { pickTrendingHomeEvents } from "@/lib/home-trending/pick-trending-events"
import type { TrendingHomeEvent } from "@/lib/home-trending/types"

function ev(id: string, followersCount: number): TrendingHomeEvent {
  return {
    id,
    slug: null,
    title: id,
    leads: "",
    followersCount,
    startDate: "2026-05-01T00:00:00.000Z",
  }
}

describe("pickTrendingHomeEvents", () => {
  it("orders by follower count descending", () => {
    const picked = pickTrendingHomeEvents(
      [ev("low", 2), ev("high", 50), ev("mid", 10), ev("none", 0), ev("top", 100)],
      4,
    )
    expect(picked.map((e) => e.id)).toEqual(["top", "high", "mid", "low"])
  })

  it("includes zero-follower events when slots remain", () => {
    const picked = pickTrendingHomeEvents([ev("a", 5), ev("b", 0)], 4)
    expect(picked).toHaveLength(2)
    expect(picked[0].id).toBe("a")
    expect(picked[1].id).toBe("b")
  })
})
