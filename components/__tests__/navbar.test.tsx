/** @jest-environment jsdom */

import { act, screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"

import Navbar from "@/components/navbar"
import * as api from "@/lib/api"
import { mockMatchMedia, renderWithProviders } from "@/test/test-utils"

const push = jest.fn()

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push, replace: jest.fn() }),
  usePathname: () => "/",
}))

jest.mock("@/components/ExploreMegaMenu", () => ({
  __esModule: true,
  default: () => null,
}))

jest.mock("@/lib/api", () => ({
  clearTokens: jest.fn(),
  getCurrentUserDisplayName: jest.fn(() => "Test User"),
  getCurrentUserEmail: jest.fn(() => "test@example.com"),
  getCurrentUserId: jest.fn(() => "user-1"),
  getCurrentUserRole: jest.fn(() => "ATTENDEE"),
  isAuthenticated: jest.fn(() => false),
}))

const isAuthenticated = api.isAuthenticated as jest.MockedFunction<typeof api.isAuthenticated>
const clearTokens = api.clearTokens as jest.MockedFunction<typeof api.clearTokens>
const getCurrentUserRole = api.getCurrentUserRole as jest.MockedFunction<
  typeof api.getCurrentUserRole
>
const getCurrentUserId = api.getCurrentUserId as jest.MockedFunction<typeof api.getCurrentUserId>

describe("Navbar", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockMatchMedia(true)
    isAuthenticated.mockReturnValue(false)
    getCurrentUserRole.mockReturnValue("ATTENDEE")
    getCurrentUserId.mockReturnValue("user-1")
    global.fetch = jest.fn() as jest.Mock
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it("renders home logo link and primary nav labels", () => {
    renderWithProviders(<Navbar />)
    expect(screen.getByRole("link", { name: /biztradefairs/i })).toHaveAttribute("href", "/")
    expect(screen.getByRole("link", { name: /top 100 must visit/i })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /explore menu/i })).toBeInTheDocument()
  })

  it("opens account menu and shows Sign in when logged out", async () => {
    const user = userEvent.setup()
    renderWithProviders(<Navbar />)
    await waitFor(() =>
      expect(screen.getAllByRole("button", { name: /account menu/i }).length).toBeGreaterThan(0)
    )
    const accountBtn = screen.getAllByRole("button", { name: /account menu/i })[0]
    await user.click(accountBtn)
    expect(screen.getAllByRole("link", { name: /^sign in$/i })[0]).toHaveAttribute("href", "/login")
    expect(screen.getAllByRole("link", { name: /create an account/i })[0]).toHaveAttribute(
      "href",
      "/signup"
    )
  })

  it("shows Dashboard and calls router on dashboard click when authenticated", async () => {
    isAuthenticated.mockReturnValue(true)
    getCurrentUserRole.mockReturnValue("ATTENDEE")
    getCurrentUserId.mockReturnValue("u-99")
    const user = userEvent.setup()
    renderWithProviders(<Navbar />)
    await waitFor(() =>
      expect(screen.getAllByRole("button", { name: /account menu/i }).length).toBeGreaterThan(0)
    )
    await user.click(screen.getAllByRole("button", { name: /account menu/i })[0])
    await user.click(screen.getAllByRole("menuitem", { name: /^dashboard$/i })[0])
    expect(push).toHaveBeenCalledWith("/dashboard/u-99")
  })

  it("debounced search fetches /api/search and navigates event result to event path", async () => {
    jest.useFakeTimers()
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
    const fetchMock = global.fetch as jest.Mock
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({
        events: [
          {
            id: "ev-1",
            slug: "world-expo",
            title: "World Expo",
            startDate: "2026-06-01T10:00:00.000Z",
            venue: { venueCity: "Berlin", venueCountry: "DE" },
          },
        ],
        venues: [],
        speakers: [],
      }),
    })

    renderWithProviders(<Navbar />)
    const nav = screen.getByRole("navigation")
    const searchInputs = within(nav).getAllByRole("textbox", { name: /search/i })
    const desktopSearch = searchInputs[0]
    await user.type(desktopSearch, "wo")
    await act(async () => {
      jest.advanceTimersByTime(450)
    })
    await waitFor(() => expect(fetchMock).toHaveBeenCalled())
    const url = fetchMock.mock.calls[0][0] as string
    expect(url).toContain("/api/search?q=wo")

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /world expo/i })).toBeInTheDocument()
    })
    await user.click(screen.getByRole("button", { name: /world expo/i }))
    expect(push).toHaveBeenCalledWith("/event/world-expo")
  })

  it("logout clears tokens and navigates to login", async () => {
    isAuthenticated.mockReturnValue(true)
    const user = userEvent.setup()
    renderWithProviders(<Navbar />)
    await waitFor(() =>
      expect(screen.getAllByRole("button", { name: /account menu/i }).length).toBeGreaterThan(0)
    )
    await user.click(screen.getAllByRole("button", { name: /account menu/i })[0])
    await user.click(screen.getAllByRole("menuitem", { name: /^logout$/i })[0])
    expect(clearTokens).toHaveBeenCalled()
    expect(push).toHaveBeenCalledWith("/login")
  })
})
