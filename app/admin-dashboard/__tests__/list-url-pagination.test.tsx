import { act, fireEvent, render, renderHook, screen } from "@testing-library/react"
import OrganizerManagement from "../organizer-management"
import ExhibitorManagement from "../exhibitor-management"
import { useEvents } from "../events/hooks/useEvents"
import * as eventsApi from "../events/services/events.api"
import { adminApi } from "@/lib/admin-api"
import { apiFetch } from "@/lib/api"
import { readAdminListUrl, writeAdminListUrl } from "@/lib/admin-list-url"

jest.mock("next/navigation", () => ({ useRouter: () => ({ push: jest.fn(), replace: jest.fn() }) }))
jest.mock("@/lib/admin-api", () => ({ adminApi: jest.fn() }))
jest.mock("@/lib/api", () => ({ apiFetch: jest.fn() }))
jest.mock("@/lib/upload-utils", () => ({ uploadVenueLogo: jest.fn() }))
jest.mock("@/components/admin-dashboard/admin-table-avatar", () => ({ AdminTableAvatar: () => null }))
jest.mock("@/components/admin-dashboard/organizer-location-selects", () => ({ OrganizerLocationSelects: () => null }))
jest.mock("../entity-bulk-import", () => ({ __esModule: true, default: () => null }))
jest.mock("../add-exhibitor-form", () => ({ __esModule: true, default: () => null }))
jest.mock("../events/services/events.api", () => ({
  ...jest.requireActual("../events/services/events.api"),
  getEvents: jest.fn(),
  getEventStats: jest.fn(),
  getEventCategories: jest.fn(),
  getCountries: jest.fn(),
  getEventMailCandidates: jest.fn(),
}))

const adminMock = jest.mocked(adminApi)
const exhibitorMock = jest.mocked(apiFetch)
const eventMock = jest.mocked(eventsApi.getEvents)
const sections = ["organizers", "exhibitors"] as const

function listUrl(section: string, page?: string | number) {
  return "/admin-dashboard?section=" + section + "&sub=" + section + "-all" +
    (page === undefined ? "" : "&page=" + page)
}
function response(page: number, totalPages = 20) {
  return { data: [], pagination: { page, limit: 10, total: totalPages * 10, totalPages } }
}
function listCalls(section: typeof sections[number]) {
  const calls = section === "organizers" ? adminMock.mock.calls : exhibitorMock.mock.calls
  return calls.map(([url]) => new URL(String(url), "http://localhost"))
    .filter((url) => url.pathname.endsWith("/" + section) && url.searchParams.get("limit") !== "500")
}
function pages(section: typeof sections[number]) {
  return listCalls(section).map((url) => url.searchParams.get("page"))
}
function Component({ section }: { section: typeof sections[number] }) {
  return section === "organizers" ? <OrganizerManagement /> : <ExhibitorManagement />
}
async function settle() {
  await act(async () => { jest.advanceTimersByTime(1000) })
}

beforeEach(() => {
  jest.useFakeTimers()
  jest.clearAllMocks()
  sessionStorage.clear()
  window.history.replaceState({ preserve: true }, "", "/admin-dashboard")
  jest.spyOn(window, "scrollTo").mockImplementation(() => {})
  adminMock.mockReset().mockImplementation(async (url) => {
    if (url === "/countries") return [{ id: "india", name: "India" }] as never
    if (String(url).startsWith("/exhibitors/stats")) return { data: { total: 200, active: 200 } } as never
    const params = new URL(String(url), "http://localhost").searchParams
    return response(Number(params.get("page") || 1), params.get("limit") === "500" ? 1 : 20) as never
  })
  exhibitorMock.mockReset().mockImplementation(async (url) => {
    return response(Number(new URL(String(url), "http://localhost").searchParams.get("page") || 1)) as never
  })
  eventMock.mockReset().mockImplementation(async ({ page = 1 } = {}) => ({
    events: [],
    pagination: { page, limit: 15, total: 300, totalPages: 20, hasNextPage: page < 20, hasPreviousPage: page > 1 },
  }))
  jest.mocked(eventsApi.getEventStats).mockResolvedValue({})
  jest.mocked(eventsApi.getEventCategories).mockResolvedValue([])
  jest.mocked(eventsApi.getCountries).mockResolvedValue([])
  jest.mocked(eventsApi.getEventMailCandidates).mockResolvedValue({ data: [] })
})

afterEach(() => {
  jest.useRealTimers()
  jest.restoreAllMocks()
})

it.each(sections)("%s reads page 12, updates the URL, and retains its page on refresh", async (section) => {
  sessionStorage.setItem("admin:" + section + ":listState", JSON.stringify({
    page: 3, search: "Old search", country: "Old country", status: "suspended", industry: "Healthcare",
  }))
  window.history.replaceState(window.history.state, "", listUrl(section, 12) + "&trace=keep#list")
  const first = render(<Component section={section} />)
  await settle()
  expect(pages(section)).toEqual(["12"])
  expect(screen.getByRole("textbox")).toHaveValue("")
  expect(listCalls(section)[0].searchParams.has("search")).toBe(false)
  expect(screen.getByRole("button", { name: "Next" })).toBeEnabled()

  fireEvent.click(screen.getByRole("button", { name: "Next" }))
  await settle()
  expect(pages(section)).toEqual(["12", "13"])
  expect(new URLSearchParams(window.location.search).get("page")).toBe("13")
  expect(new URLSearchParams(window.location.search).get("trace")).toBe("keep")
  expect(window.location.hash).toBe("#list")
  expect(window.history.state).toEqual({ preserve: true })
  first.unmount()
  adminMock.mockClear()
  exhibitorMock.mockClear()
  render(<Component section={section} />)
  await settle()
  expect(pages(section)).toEqual(["13"])

  fireEvent.click(screen.getByRole("button", { name: "Previous" }))
  await settle()
  expect(new URLSearchParams(window.location.search).get("page")).toBe("12")
})

it.each(sections)("%s preserves linked filters and resets the page when search changes", async (section) => {
  const filters = section === "organizers" ? "&search=Acme&country=India" : "&search=Acme&status=suspended&industry=Technology"
  window.history.replaceState(null, "", listUrl(section, 12) + filters)
  render(<Component section={section} />)
  await settle()
  expect(pages(section)).toEqual(["12"])
  expect(screen.getByRole("textbox")).toHaveValue("Acme")
  const request = listCalls(section)[0].searchParams
  expect(request.get("search")).toBe("Acme")
  if (section === "organizers") expect(request.get("country")).toBe("India")
  else {
    expect(request.get("status")).toBe("suspended")
    expect(request.get("industry")).toBe("Technology")
  }

  fireEvent.change(screen.getByRole("textbox"), { target: { value: "New search" } })
  await settle()
  expect(pages(section)).toEqual(["12", "1"])
  expect(new URLSearchParams(window.location.search).get("page")).toBe("1")
  expect(new URLSearchParams(window.location.search).get("search")).toBe("New search")
})

it.each(sections)("%s restores its saved page without URL list state", async (section) => {
  sessionStorage.setItem("admin:" + section + ":listState", JSON.stringify({ page: 7, search: "Acme" }))
  window.history.replaceState(null, "", listUrl(section))
  render(<Component section={section} />)
  await settle()
  expect(pages(section)).toEqual(["7"])
  expect(new URLSearchParams(window.location.search).get("page")).toBe("7")
})

it.each(sections)("%s corrects invalid URL pages and clamps pages beyond the available results", async (section) => {
  window.history.replaceState(null, "", listUrl(section, "invalid"))
  const first = render(<Component section={section} />)
  await settle()
  expect(pages(section)).toEqual(["1"])
  first.unmount()

  window.history.replaceState(null, "", listUrl(section, 99))
  render(<Component section={section} />)
  await settle()
  await settle()
  expect(pages(section).slice(-2)).toEqual(["99", "20"])
  expect(new URLSearchParams(window.location.search).get("page")).toBe("20")
})

it.each(sections)("%s follows browser URL navigation while ignoring an outdated request", async (section) => {
  let completeOld!: (value: unknown) => void
  const pending = new Promise((resolve) => { completeOld = resolve })
  if (section === "organizers") {
    adminMock.mockImplementation(async (url) => {
      const params = new URL(String(url), "http://localhost").searchParams
      if (params.get("limit") === "500") return response(1, 1) as never
      if (params.get("page") === "12") return pending as never
      return response(13) as never
    })
  } else exhibitorMock.mockImplementationOnce(() => pending as never)
  window.history.replaceState(null, "", listUrl(section, 12))
  render(<Component section={section} />)
  await settle()

  act(() => {
    window.history.replaceState(null, "", listUrl(section, 13))
    window.dispatchEvent(new PopStateEvent("popstate"))
  })
  await settle()
  await act(async () => { completeOld(response(12, 1)) })
  await settle()
  expect(pages(section)).toEqual(["12", "13"])
  expect(new URLSearchParams(window.location.search).get("page")).toBe("13")
})

it("events reads linked page and filters before fetching, then preserves page changes on refresh", async () => {
  sessionStorage.setItem("admin:events:listState", JSON.stringify({ page: 3, tab: "send-email", search: "Old search" }))
  window.history.replaceState(null, "", listUrl("events", 12) + "&search=Acme&country=India&category=technology&status=approved")
  const first = renderHook(() => useEvents())
  await settle()
  expect(eventMock).toHaveBeenCalledTimes(1)
  expect(eventMock).toHaveBeenLastCalledWith(expect.objectContaining({
    page: 12, search: "Acme", country: "India", category: "technology", status: "approved", tab: "all",
  }))
  act(() => first.result.current.handlePageChange(13))
  await settle()
  expect(new URLSearchParams(window.location.search).get("page")).toBe("13")
  first.unmount()
  eventMock.mockClear()

  const next = renderHook(() => useEvents())
  await settle()
  expect(eventMock.mock.calls.map(([params]) => params?.page)).toEqual([13])
  expect(next.result.current.page).toBe(13)
  act(() => next.result.current.setSearchTerm("New search"))
  await settle()
  expect(next.result.current.page).toBe(1)
  expect(new URLSearchParams(window.location.search).get("search")).toBe("New search")
})

it("events honors browser page links and clamps unavailable pages", async () => {
  window.history.replaceState(null, "", listUrl("events", "invalid"))
  const hook = renderHook(() => useEvents())
  await settle()
  expect(eventMock.mock.calls.map(([params]) => params?.page)).toEqual([1])

  act(() => {
    window.history.replaceState(null, "", listUrl("events", 99))
    window.dispatchEvent(new PopStateEvent("popstate"))
  })
  await settle()
  expect(hook.result.current.page).toBe(20)
  expect(eventMock.mock.calls.map(([params]) => params?.page)).toEqual([1, 99, 20])
  expect(new URLSearchParams(window.location.search).get("page")).toBe("20")
})

it("keeps list URL updates scoped to their sidebar section", () => {
  window.history.replaceState(null, "", listUrl("organizers", 12) + "&country=India")
  expect(readAdminListUrl("events")).toBeNull()
  writeAdminListUrl("events", { page: 3, category: "technology" })
  expect(new URLSearchParams(window.location.search).get("page")).toBe("12")
  expect(new URLSearchParams(window.location.search).get("country")).toBe("India")
})
