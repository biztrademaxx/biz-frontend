import { act, fireEvent, render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import CountriesManagement from "../countries-management"
import { apiFetch } from "@/lib/api"

jest.mock("@/lib/api", () => ({ apiFetch: jest.fn() }))
jest.mock("@/components/app-image", () => ({ AppImage: () => null }))
jest.mock("@/components/cloudinary-upload", () => ({ __esModule: true, default: () => null }))
jest.mock("@/lib/location-data", () => ({ getCountryCatalog: () => [], getCountryOptions: () => [] }))

type Tab = "countries" | "states"
const tabs: Tab[] = ["countries", "states"]
const apiMock = jest.mocked(apiFetch)
let countries: ReturnType<typeof country>[]
let states: ReturnType<typeof state>[]

function country(index: number) {
  return {
    id: "country-" + index, name: "Country " + String(index).padStart(3, "0"),
    code: index === 1 ? "IN" : index === 2 ? "US" : "C" + index,
    isActive: true, isPermitted: false, eventCount: 0, cityCount: 0,
    createdAt: "2026-01-01", updatedAt: "2026-01-01",
  }
}
function state(index: number, code = "IN") {
  return {
    id: code + "-state-" + index, name: "State " + String(index).padStart(3, "0"),
    countryId: code === "IN" ? "country-1" : "country-2",
    isActive: true, isPermitted: false, eventCount: 0, cityCount: 1,
    country: { id: code === "IN" ? "country-1" : "country-2", name: code, code },
  }
}
function listUrl(tab: Tab, page?: number | string) {
  return "/admin-dashboard?section=locations&sub=" + tab +
    (tab === "states" ? "&country=IN" : "") + (page === undefined ? "" : "&page=" + page)
}
async function ready(page = 1, total = 3) {
  return screen.findByText(new RegExp("Page " + page + " of " + total + "$"))
}
function locationRows(tab: Tab) {
  return tab === "countries"
    ? screen.getAllByRole("heading", { level: 3 })
    : screen.getAllByText(/^State \d{3}$/)
}

beforeEach(() => {
  sessionStorage.clear()
  window.history.replaceState({ preserved: true }, "", listUrl("countries"))
  countries = Array.from({ length: 25 }, (_, index) => country(index + 1))
  states = [
    ...Array.from({ length: 25 }, (_, index) => state(index + 1)),
    ...Array.from({ length: 5 }, (_, index) => state(index + 1, "US")),
  ]
  jest.spyOn(window, "confirm").mockReturnValue(true)
  apiMock.mockReset().mockImplementation(async (url, options) => {
    const pathname = new URL(String(url), "http://localhost").pathname
    if (options?.method === "DELETE") {
      const id = pathname.split("/").pop()
      if (pathname.includes("/countries/")) countries = countries.filter((item) => item.id !== id)
      else states = states.filter((item) => item.id !== id)
      return { success: true } as never
    }
    return (pathname.endsWith("/countries") ? countries : pathname.endsWith("/states") ? states : []) as never
  })
})
afterEach(() => { jest.restoreAllMocks() })

it("shows 12 countries per page with numbered, next and previous controls", async () => {
  const user = userEvent.setup()
  render(<CountriesManagement />)
  await ready()
  expect(locationRows("countries")).toHaveLength(12)
  expect(screen.queryByRole("heading", { name: "Country 013" })).not.toBeInTheDocument()
  expect(screen.getByText("Total Countries").previousElementSibling).toHaveTextContent("25")
  await user.click(screen.getByRole("link", { name: "Go to next page" }))
  await ready(2)
  expect(screen.getByRole("heading", { name: "Country 013" })).toBeInTheDocument()
  expect(new URLSearchParams(window.location.search).get("page")).toBe("2")
  await user.click(screen.getByRole("link", { name: "3" }))
  await ready(3)
  expect(locationRows("countries")).toHaveLength(1)
  expect(screen.getByRole("heading", { name: "Country 025" })).toBeInTheDocument()
  await user.click(screen.getByRole("link", { name: "Go to previous page" }))
  await ready(2)
  expect(apiMock).toHaveBeenCalledTimes(1)
})

it("paginates states after country selection and resets the page for another country", async () => {
  const user = userEvent.setup()
  window.history.replaceState(null, "", "/admin-dashboard?section=locations&sub=states")
  render(<CountriesManagement activeTab="states" />)
  await screen.findByText("Select a country to view states.")
  expect(screen.queryByRole("navigation", { name: "pagination" })).not.toBeInTheDocument()
  await user.selectOptions(screen.getByLabelText("Country"), "IN")
  await ready()
  expect(locationRows("states")).toHaveLength(12)
  expect(screen.getByText("Total States").previousElementSibling).toHaveTextContent("25")
  expect(screen.getByText("Mapped Cities").previousElementSibling).toHaveTextContent("25")
  await user.click(screen.getByRole("link", { name: "3" }))
  await ready(3)
  expect(locationRows("states")).toHaveLength(1)
  await user.selectOptions(screen.getByLabelText("Country"), "US")
  await ready(1, 1)
  expect(locationRows("states")).toHaveLength(5)
  expect(new URLSearchParams(window.location.search).get("country")).toBe("US")
  expect(new URLSearchParams(window.location.search).get("page")).toBe("1")
})

it.each(tabs)("%s restores direct page 12 links and waits for data before clamping", async (tab) => {
  countries = Array.from({ length: 150 }, (_, index) => country(index + 1))
  states = Array.from({ length: 150 }, (_, index) => state(index + 1))
  sessionStorage.setItem("admin:locations:" + tab + ":list", JSON.stringify({ page: 2, search: "Old search", country: "US" }))
  window.history.replaceState(window.history.state, "", listUrl(tab, 12) + "&trace=keep#locations")
  const base = apiMock.getMockImplementation()!
  let resolve!: (value: unknown) => void
  const pending = new Promise((done) => { resolve = done })
  apiMock.mockImplementation(async (url, options) => {
    if (new URL(String(url), "http://localhost").pathname.endsWith("/" + tab)) return pending as never
    return base(url, options) as never
  })
  render(<CountriesManagement activeTab={tab} />)
  expect(new URLSearchParams(window.location.search).get("page")).toBe("12")
  await act(async () => { resolve(tab === "countries" ? countries : states) })
  await ready(12, 13)
  expect(locationRows(tab)).toHaveLength(12)
  expect(locationRows(tab)[0]).toHaveTextContent(tab === "countries" ? "Country 133" : "State 133")
  expect(screen.getByPlaceholderText("Search " + tab + "...")).toHaveValue("")
  expect(new URLSearchParams(window.location.search).get("trace")).toBe("keep")
  expect(window.location.hash).toBe("#locations")
  expect(window.history.state).toEqual({ preserved: true })
})

it.each(tabs)("%s resets pagination for searches and preserves the search on refresh", async (tab) => {
  const user = userEvent.setup()
  window.history.replaceState(null, "", listUrl(tab, 2))
  const first = render(<CountriesManagement activeTab={tab} />)
  await ready(2)
  const search = tab === "countries" ? "Country 025" : "State 025"
  fireEvent.change(screen.getByPlaceholderText("Search " + tab + "..."), { target: { value: search } })
  await ready(1, 1)
  expect(locationRows(tab)).toHaveLength(1)
  expect(new URLSearchParams(window.location.search).get("page")).toBe("1")
  first.unmount()
  render(<CountriesManagement activeTab={tab} />)
  await ready(1, 1)
  expect(screen.getByPlaceholderText("Search " + tab + "...")).toHaveValue(search)
  expect(locationRows(tab)).toHaveLength(1)
  await user.clear(screen.getByPlaceholderText("Search " + tab + "..."))
  await ready(1, 3)
})

it.each([
  ["countries", "invalid", 1], ["states", "invalid", 1],
  ["countries", "99", 3], ["states", "99", 3],
] as const)("%s handles page=%s", async (tab, page, expected) => {
  window.history.replaceState(null, "", listUrl(tab, page))
  render(<CountriesManagement activeTab={tab} />)
  await ready(expected)
  await waitFor(() => expect(new URLSearchParams(window.location.search).get("page")).toBe(String(expected)))
})

it.each(tabs)("%s moves to the last available page after deleting its final record", async (tab) => {
  const user = userEvent.setup()
  window.history.replaceState(null, "", listUrl(tab, 3))
  render(<CountriesManagement activeTab={tab} />)
  await ready(3)
  await user.click(screen.getByRole("button", { name: tab === "countries" ? "Delete Country 025" : "Delete State 025" }))
  await ready(2, 2)
  await waitFor(() => expect(new URLSearchParams(window.location.search).get("page")).toBe("2"))
  expect(locationRows(tab)).toHaveLength(12)
})

it("keeps countries and states pagination separate when switching the location tabs", async () => {
  const user = userEvent.setup()
  render(<CountriesManagement />)
  await ready()
  await user.click(screen.getByRole("link", { name: "Go to next page" }))
  await user.click(screen.getByRole("button", { name: "States" }))
  await screen.findByText("Select a country to view states.")
  await user.selectOptions(screen.getByLabelText("Country"), "IN")
  await ready()
  await user.click(screen.getByRole("link", { name: "3" }))
  await ready(3)
  await user.click(screen.getByRole("button", { name: /^Countries/ }))
  await ready(2)
  expect(new URLSearchParams(window.location.search).get("sub")).toBe("countries")
  expect(new URLSearchParams(window.location.search).has("country")).toBe(false)
  await user.click(screen.getByRole("button", { name: "States" }))
  await ready(3)
  expect(screen.getByLabelText("Country")).toHaveValue("IN")
  expect(new URLSearchParams(window.location.search).get("sub")).toBe("states")
})

it.each(tabs)("%s follows browser page navigation", async (tab) => {
  window.history.replaceState(null, "", listUrl(tab, 1))
  render(<CountriesManagement activeTab={tab} />)
  await ready()
  act(() => {
    window.history.replaceState(null, "", listUrl(tab, 2))
    window.dispatchEvent(new PopStateEvent("popstate"))
  })
  await ready(2)
  expect(locationRows(tab)[0]).toHaveTextContent(tab === "countries" ? "Country 013" : "State 013")
})

it("uses dashboard navigation for its internal location tabs", async () => {
  const onTabChange = jest.fn()
  const user = userEvent.setup()
  render(<CountriesManagement onTabChange={onTabChange} />)
  await ready()
  await user.click(screen.getByRole("button", { name: "States" }))
  expect(onTabChange).toHaveBeenCalledWith("states")
})
