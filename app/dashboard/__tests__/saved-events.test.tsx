import { fireEvent, render, screen } from "@testing-library/react"
import { apiFetch } from "@/lib/api"
import { SavedEvents } from "../SavedEvents"

jest.mock("next/navigation", () => ({ useRouter: () => ({ push: jest.fn() }) }))
jest.mock("@/hooks/use-toast", () => ({ useToast: () => ({ toast: jest.fn() }) }))
jest.mock("@/lib/api", () => ({
  apiFetch: jest.fn(),
  getCurrentUserId: () => "visitor-id",
  isAuthenticated: () => true,
}))

const event = {
  id: "demo-event-id",
  title: "Demo Technology Expo 2026",
  startDate: "2026-11-02T04:30:00.000Z",
  endDate: "2026-11-03T12:30:00.000Z",
  category: "Technology",
  city: "Bangalore",
  venue: { venueCountry: "India" },
  images: [],
  ticketTypes: [],
}

describe("visitor saved-event wishlist", () => {
  beforeEach(() => jest.mocked(apiFetch).mockReset())

  it("shows a saved event using the wishlist endpoint independently of visit interest", async () => {
    jest.mocked(apiFetch).mockResolvedValueOnce({ events: [event] })

    render(<SavedEvents userId="visitor-id" />)

    expect(await screen.findByText(event.title)).toBeInTheDocument()
    expect(apiFetch).toHaveBeenCalledWith("/api/users/visitor-id/saved-events", { auth: true })
  })

  it("removes a saved event through the same save resource used by public event cards", async () => {
    jest.mocked(apiFetch).mockResolvedValueOnce({ events: [event] }).mockResolvedValueOnce({ success: true })
    render(<SavedEvents userId="visitor-id" />)
    await screen.findByText(event.title)

    fireEvent.click(screen.getByRole("button", { name: "Remove from saved" }))

    expect(await screen.findByText("No saved events found.")).toBeInTheDocument()
    expect(apiFetch).toHaveBeenLastCalledWith("/api/events/demo-event-id/save", { method: "DELETE", auth: true })
  })
})
