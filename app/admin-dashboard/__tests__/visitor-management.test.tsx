import { act, fireEvent, render, screen } from "@testing-library/react"
import VisitorManagement from "../visitor-management"
import { adminApi } from "@/lib/admin-api"

jest.mock("@/lib/admin-api", () => ({ adminApi: jest.fn() }))
jest.mock("@/components/admin-dashboard/admin-table-avatar", () => ({ AdminTableAvatar: () => null }))
jest.mock("../visitors/VisitorSuggestions", () => ({ VisitorSuggestionsAdmin: () => null }))

const apiMock = jest.mocked(adminApi)
const storageKey = "admin:visitors:list"
const listUrl = "/admin-dashboard?section=visitors&sub=visitors-all"

function response(page: number, totalPages = 20) {
  return {
    success: true,
    data: {
      visitors: [{
        id: "visitor-" + page,
        name: "Visitor " + page,
        email: "visitor" + page + "@example.com",
        createdAt: "2026-01-01T00:00:00Z",
        isActive: true,
        isVerified: false,
        stats: {},
      }],
      pagination: { page, limit: 10, total: totalPages * 10, totalPages },
      stats: { active: totalPages * 10, inactive: 0, verified: 0 },
    },
  }
}

function requestedPages() {
  return apiMock.mock.calls.map(([url]) => new URL(String(url), "http://localhost").searchParams.get("page"))
}

async function advanceSearchTimer() {
  await act(async () => { jest.advanceTimersByTime(1000) })
}

beforeEach(() => {
  jest.useFakeTimers()
  sessionStorage.clear()
  window.history.replaceState({ preserved: true }, "", listUrl)
  apiMock.mockReset().mockImplementation(async (url) => {
    const page = Number(new URL(String(url), "http://localhost").searchParams.get("page") || 1)
    return response(page) as never
  })
})

afterEach(() => {
  jest.useRealTimers()
  jest.restoreAllMocks()
})

it("loads page 12 from the URL without a page-1 request or a delayed reset", async () => {
  window.history.replaceState(window.history.state, "", listUrl + "&page=12")
  render(<VisitorManagement />)
  expect(await screen.findByText("Page 12 of 20")).toBeInTheDocument()
  await advanceSearchTimer()
  expect(screen.getByText("Page 12 of 20")).toBeInTheDocument()
  expect(requestedPages()).toEqual(["12"])
})

it("updates the URL on page changes and retains the page after remounting", async () => {
  window.history.replaceState(window.history.state, "", listUrl + "&page=12&trace=keep#visitors")
  const first = render(<VisitorManagement />)
  await screen.findByText("Page 12 of 20")
  fireEvent.click(screen.getByRole("button", { name: "Next" }))
  await screen.findByText("Page 13 of 20")
  expect(new URLSearchParams(window.location.search).get("page")).toBe("13")
  expect(new URLSearchParams(window.location.search).get("trace")).toBe("keep")
  expect(window.location.hash).toBe("#visitors")
  expect(window.history.state).toEqual({ preserved: true })

  first.unmount()
  apiMock.mockClear()
  render(<VisitorManagement />)
  await screen.findByText("Page 13 of 20")
  await advanceSearchTimer()
  expect(requestedPages()).toEqual(["13"])

  fireEvent.click(screen.getByRole("button", { name: "Previous" }))
  await screen.findByText("Page 12 of 20")
  expect(new URLSearchParams(window.location.search).get("page")).toBe("12")
})

it("restores the saved visitor page and filters when returning without URL list state", async () => {
  sessionStorage.setItem(storageKey, JSON.stringify({ page: 7, search: "Acme", status: "active" }))
  render(<VisitorManagement />)
  await screen.findByText("Page 7 of 20")
  await advanceSearchTimer()
  expect(requestedPages()).toEqual(["7"])
  expect(screen.getByRole("textbox")).toHaveValue("Acme")
  expect(screen.getByRole("combobox")).toHaveValue("active")
  const params = new URLSearchParams(window.location.search)
  expect(params.get("page")).toBe("7")
  expect(params.get("search")).toBe("Acme")
  expect(params.get("status")).toBe("active")
})

it("gives explicit URLs priority over the saved page and filters", async () => {
  sessionStorage.setItem(storageKey, JSON.stringify({ page: 7, search: "Old company", status: "inactive" }))
  window.history.replaceState(null, "", listUrl + "&page=12")
  render(<VisitorManagement />)
  await screen.findByText("Page 12 of 20")
  expect(requestedPages()).toEqual(["12"])
  expect(screen.getByRole("textbox")).toHaveValue("")
  expect(screen.getByRole("combobox")).toHaveValue("all")
})

it("preserves URL filters on refresh and resets the page only when a filter changes", async () => {
  window.history.replaceState(null, "", listUrl + "&page=12&search=Acme&status=active")
  render(<VisitorManagement />)
  await screen.findByText("Page 12 of 20")
  await advanceSearchTimer()
  expect(requestedPages()).toEqual(["12"])
  expect(apiMock.mock.calls[0][0]).toContain("search=Acme")
  expect(apiMock.mock.calls[0][0]).toContain("status=active")

  fireEvent.change(screen.getByRole("textbox"), { target: { value: "New company" } })
  expect(requestedPages()).toEqual(["12"])
  await advanceSearchTimer()
  await screen.findByText("Page 1 of 20")
  expect(requestedPages()).toEqual(["12", "1"])
  expect(new URLSearchParams(window.location.search).get("search")).toBe("New company")

  fireEvent.click(screen.getByRole("button", { name: "Next" }))
  await screen.findByText("Page 2 of 20")
  fireEvent.change(screen.getByRole("combobox"), { target: { value: "verified" } })
  await screen.findByText("Page 1 of 20")
  expect(new URLSearchParams(window.location.search).get("status")).toBe("verified")
})

it.each(["0", "-2", "1.5", "invalid", "12abc", "9007199254740992"])(
  "uses page 1 for an invalid page value: %s",
  async (page) => {
    window.history.replaceState(null, "", listUrl + "&page=" + page)
    render(<VisitorManagement />)
    await screen.findByText("Page 1 of 20")
    expect(requestedPages()).toEqual(["1"])
    expect(new URLSearchParams(window.location.search).get("page")).toBe("1")
  }
)

it("moves to the last available page when the requested page no longer exists", async () => {
  window.history.replaceState(null, "", listUrl + "&page=12")
  apiMock.mockImplementation(async (url) => {
    const page = Number(new URL(String(url), "http://localhost").searchParams.get("page"))
    return response(page, 3) as never
  })
  render(<VisitorManagement />)
  await screen.findByText("Page 3 of 3")
  expect(requestedPages()).toEqual(["12", "3"])
  expect(new URLSearchParams(window.location.search).get("page")).toBe("3")
})

it("handles malformed or unavailable session storage using the URL", async () => {
  sessionStorage.setItem(storageKey, "{broken")
  window.history.replaceState(null, "", listUrl + "&page=12")
  const first = render(<VisitorManagement />)
  await screen.findByText("Page 12 of 20")
  first.unmount()
  jest.spyOn(Storage.prototype, "getItem").mockImplementation(() => { throw new Error("Blocked") })
  jest.spyOn(Storage.prototype, "setItem").mockImplementation(() => { throw new Error("Blocked") })
  render(<VisitorManagement />)
  await screen.findByText("Page 12 of 20")
})

it("follows browser URL navigation and ignores an older request that completes late", async () => {
  let resolveOldRequest!: (value: unknown) => void
  window.history.replaceState(null, "", listUrl + "&page=12")
  apiMock.mockImplementationOnce(() => new Promise((resolve) => { resolveOldRequest = resolve }) as never)
  render(<VisitorManagement />)
  expect(requestedPages()).toEqual(["12"])

  await act(async () => {
    window.history.replaceState(null, "", listUrl + "&page=13")
    window.dispatchEvent(new PopStateEvent("popstate"))
  })
  await screen.findByText("Page 13 of 20")
  await act(async () => { resolveOldRequest(response(12)) })
  expect(screen.getByText("Page 13 of 20")).toBeInTheDocument()
  expect(new URLSearchParams(window.location.search).get("page")).toBe("13")
})
