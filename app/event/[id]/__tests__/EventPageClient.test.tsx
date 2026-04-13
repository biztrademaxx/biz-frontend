import { screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"

import EventPageClient from "@/app/event/[id]/EventPageClient"
import * as api from "@/lib/api"
import { renderWithProviders } from "@/test/test-utils"

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn(), prefetch: jest.fn() }),
}))

jest.mock("@/lib/api", () => ({
  apiFetch: jest.fn(),
}))

jest.mock("@/app/event/EventPageContent", () => ({
  __esModule: true,
  default: function MockEventPageContent({ event }: { event: { title?: string } }) {
    return <div data-testid="event-content">{event?.title ?? "event"}</div>
  },
}))

jest.mock("@/components/EventPageSkeleton", () => ({
  __esModule: true,
  default: () => <div data-testid="event-skeleton">Loading event…</div>,
}))

const apiFetch = api.apiFetch as jest.MockedFunction<typeof api.apiFetch>

describe("EventPageClient", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("renders event content immediately when initialEvent is provided", () => {
    renderWithProviders(
      <EventPageClient
        params={{ id: "slug-1" }}
        initialEvent={{ title: "Expo 2026", id: "1" }}
      />
    )
    expect(screen.getByTestId("event-content")).toHaveTextContent("Expo 2026")
    expect(screen.queryByTestId("event-skeleton")).not.toBeInTheDocument()
    expect(apiFetch).not.toHaveBeenCalled()
  })

  it("shows error UI with retry when fetch fails, then recovers after retry", async () => {
    const user = userEvent.setup()
    let calls = 0
    apiFetch.mockImplementation(async () => {
      calls += 1
      if (calls === 1) throw new Error("Network down")
      return { title: "Recovered Event" }
    })

    renderWithProviders(<EventPageClient params={{ id: "ev-1" }} />)

    expect(await screen.findByTestId("event-skeleton")).toBeInTheDocument()
    await waitFor(() => {
      expect(screen.getByText(/error:\s*network down/i)).toBeInTheDocument()
    })

    await user.click(screen.getByRole("button", { name: /^retry$/i }))

    await waitFor(() => {
      expect(screen.getByTestId("event-content")).toHaveTextContent("Recovered Event")
    })
    expect(apiFetch).toHaveBeenCalledTimes(2)
  })

  it("renders not-found copy when API returns success but empty event", async () => {
    apiFetch.mockResolvedValue(null as never)

    renderWithProviders(<EventPageClient params={{ id: "missing" }} />)

    await waitFor(() => {
      expect(screen.getByText(/event not found/i)).toBeInTheDocument()
    })
  })

  it("shows initialError without fetching", () => {
    renderWithProviders(
      <EventPageClient params={{ id: "x" }} initialError="Not authorized" />
    )
    expect(screen.getByText(/error:\s*not authorized/i)).toBeInTheDocument()
    expect(apiFetch).not.toHaveBeenCalled()
  })
})
