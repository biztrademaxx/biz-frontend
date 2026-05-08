import { screen, waitFor } from "@testing-library/react"

import EventHero from "@/components/event-hero"
import * as api from "@/lib/api"
import { renderWithProviders } from "@/test/test-utils"

jest.mock("@/lib/api", () => ({
  apiFetch: jest.fn(),
}))

jest.mock("keen-slider/react", () => ({
  useKeenSlider: () => {
    const ref = jest.fn()
    const inst = { current: { next: jest.fn(), moveToIdx: jest.fn() } }
    return [ref, inst]
  },
}))

const apiFetch = api.apiFetch as jest.MockedFunction<typeof api.apiFetch>

function baseEvent(
  over: Partial<{
    id: string
    title: string
    images: string[]
    videos: string[]
    description: string
    leads: string[]
    ticketTypes: { name: string; price: number; currency?: string }[]
    location: {
      city: string
      venue: string
      address: string
      coordinates: { lat: number; lng: number }
    }
    followers?: number
    startDate?: string
    endDate?: string
    postponedReason?: string
  }> = {}
) {
  return {
    id: "e1",
    title: "Industrial Fair 2026",
    images: ["/img1.jpg"],
    videos: [] as string[],
    description: "Full description",
    leads: [] as string[],
    ticketTypes: [] as { name: string; price: number; currency?: string }[],
    location: {
      city: "Mumbai",
      venue: "Hall A",
      address: "Road 1",
      coordinates: { lat: 19, lng: 72 },
    },
    ...over,
  }
}

describe("EventHero", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    apiFetch.mockResolvedValue([] as never)
  })

  it("fetches hero banners on mount", async () => {
    renderWithProviders(<EventHero event={baseEvent()} />)
    await waitFor(() => {
      expect(apiFetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/content/banners?page=event-detail&position=hero"),
        expect.objectContaining({ auth: false })
      )
    })
  })

  it("renders subtitle, free entry when no tickets, and TBA dates when missing", () => {
    renderWithProviders(
      <EventHero
        event={baseEvent({
          title: "Big Show",
          startDate: undefined,
          endDate: undefined,
          ticketTypes: [],
        })}
      />
    )
    expect(screen.getByRole("heading", { level: 2, name: /big show/i })).toBeInTheDocument()
    expect(screen.getByText(/date to be announced/i)).toBeInTheDocument()
    expect(screen.getByText(/time to be announced/i)).toBeInTheDocument()
    expect(screen.getByText(/^free$/i)).toBeInTheDocument()
  })

  it("shows Free when ticket rows exist but all prices are zero", () => {
    renderWithProviders(
      <EventHero
        event={baseEvent({
          ticketTypes: [{ name: "General Admission", price: 0, currency: "₹" }],
        })}
      />,
    )
    expect(screen.getByText(/^free$/i)).toBeInTheDocument()
  })

  it("renders ticket price line when ticket types exist", () => {
    renderWithProviders(
      <EventHero
        event={baseEvent({
          ticketTypes: [{ name: "VIP", price: 500, currency: "₹" }],
        })}
      />
    )
    expect(screen.getByText(/vip:\s*₹500/i)).toBeInTheDocument()
  })

  it("shows postponed badge when postponedReason is set", () => {
    renderWithProviders(
      <EventHero
        event={baseEvent({
          postponedReason: "Venue renovation",
          startDate: "2026-01-01T10:00:00.000Z",
          endDate: "2026-01-02T18:00:00.000Z",
        })}
      />
    )
    expect(screen.getByText(/postponed:\s*venue renovation/i)).toBeInTheDocument()
  })

  it("shows follower count when followers is positive", () => {
    renderWithProviders(<EventHero event={baseEvent({ followers: 42 })} />)
    expect(screen.getByText(/42.*followers/i)).toBeInTheDocument()
  })
})
