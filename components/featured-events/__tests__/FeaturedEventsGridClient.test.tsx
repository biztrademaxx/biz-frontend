import { screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"

import FeaturedEventsGridClient from "@/components/featured-events/FeaturedEventsGridClient"
import type { FeaturedEventPayload } from "@/lib/events/types"
import { renderWithProviders } from "@/test/test-utils"

function makeEvent(over: Partial<FeaturedEventPayload> = {}): FeaturedEventPayload {
  return {
    id: "ev-1",
    title: "Global Manufacturing Week",
    slug: "gmw-2026",
    startDate: "2026-04-10T09:00:00.000Z",
    endDate: "2026-04-12T18:00:00.000Z",
    bannerImage: null,
    edition: "2026",
    tags: [],
    eventType: ["Trade"],
    categories: ["Industrial", "B2B"],
    averageRating: 4.5,
    totalReviews: 10,
    venue: {
      venueName: "ICC",
      venueAddress: "Main Rd",
      venueCity: "Delhi",
      venueCountry: "IN",
    },
    ...over,
  }
}

describe("FeaturedEventsGridClient", () => {
  it("renders empty grid with placeholders and Add Event CTA", () => {
    renderWithProviders(<FeaturedEventsGridClient events={[]} />)
    expect(screen.getAllByText(/placeholder featured event/i)).toHaveLength(9)
    expect(screen.getAllByRole("link", { name: /^add event$/i })[0]).toHaveAttribute(
      "href",
      "/organizer-signup"
    )
  })

  it("renders event title, category link, and event detail link", () => {
    renderWithProviders(<FeaturedEventsGridClient events={[makeEvent()]} />)
    const region = screen.getByRole("region", { name: /featured events/i })
    expect(screen.getAllByText("Global Manufacturing Week").length).toBeGreaterThan(0)
    const cat = within(region).getAllByRole("link", { name: /^industrial$/i })[0]
    expect(cat).toHaveAttribute("href", "/event?category=Industrial")
    const eventDetailLinks = within(region)
      .getAllByRole("link")
      .filter((a) => a.getAttribute("href") === "/event/gmw-2026")
    expect(eventDetailLinks.length).toBeGreaterThan(0)
    expect(eventDetailLinks[0]).toHaveAttribute("href", "/event/gmw-2026")
  })

  it("uses navigator.clipboard when Web Share API is unavailable", async () => {
    const user = userEvent.setup()
    const writeText = jest.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText },
    })
    Object.defineProperty(navigator, "share", {
      configurable: true,
      value: undefined,
    })

    renderWithProviders(<FeaturedEventsGridClient events={[makeEvent()]} />)
    const region = screen.getByRole("region", { name: /featured events/i })
    await user.click(
      within(region).getAllByRole("button", { name: /share global manufacturing week/i })[0]
    )
    expect(writeText).toHaveBeenCalled()
  })
})
