import { act, fireEvent, render, renderHook, screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { toast } from "sonner"
import VenueManagementPage from "../VenueManagementPage"
import { useVenueManagement } from "../hooks/useVenueManagement"
import { bulkApproveVenues, fetchAllVenues, patchVenue } from "../services/venues.api"
import type { Venue, VenueTab } from "../types/venue.types"

jest.mock("../services/venues.api", () => ({
  fetchAllVenues: jest.fn(),
  fetchVenueById: jest.fn(),
  bulkApproveVenues: jest.fn(),
  patchVenue: jest.fn(),
  buildStatusPatchBody: jest.fn(),
  buildVenuePatchBody: jest.fn(),
  createVenue: jest.fn(),
  deleteVenue: jest.fn(),
  sendVenueAccountEmail: jest.fn(),
}))
jest.mock("sonner", () => ({ toast: { success: jest.fn(), error: jest.fn() } }))
jest.mock("@/components/app-image", () => ({ AppImage: () => null }))
jest.mock("@/app/admin-dashboard/entity-bulk-import", () => ({ __esModule: true, default: () => null }))
jest.mock("../components/EditVenueDialog", () => ({ EditVenueDialog: () => null }))
jest.mock("../components/ViewVenueDialog", () => ({ ViewVenueDialog: () => null }))
jest.mock("../components/RejectVenueDialog", () => ({ RejectVenueDialog: () => null }))

const storageKey = "admin:venues:list:all"
const fetchMock = jest.mocked(fetchAllVenues)
const approveMock = jest.mocked(bulkApproveVenues)
let venues: Venue[]

function deferred<T>() {
  let resolve!: (value: T) => void
  const promise = new Promise<T>((done) => { resolve = done })
  return { promise, resolve }
}

function makeVenue(index: number): Venue {
  const active = index === 1
  return {
    id: `venue-${index}`, venueName: `Hall ${index}`, contactPerson: `Manager ${index}`,
    email: `venue${index}@example.com`, mobile: "", address: "", city: "Mumbai",
    state: "Maharashtra", country: "India", website: "", description: "", logo: "",
    maxCapacity: 100, totalHalls: 1, totalEvents: 0, activeBookings: 0,
    averageRating: 0, totalReviews: 0, amenities: [], meetingSpaces: [], venueImages: [],
    isVerified: active, isActive: true, status: active ? "active" : "pending", events: [],
  }
}

const ready = () => screen.findByRole("heading", { name: "Venue Management" })

beforeEach(() => {
  jest.clearAllMocks()
  sessionStorage.clear()
  venues = Array.from({ length: 25 }, (_, index) => makeVenue(index + 1))
  fetchMock.mockReset().mockImplementation(async () => venues)
  approveMock.mockReset().mockImplementation(async (ids) => {
    venues = venues.map((venue) => ids.includes(venue.id)
      ? { ...venue, isVerified: true, isActive: true, status: "active" }
      : venue)
    return { success: true, approvedCount: ids.length }
  })
})

it("supports numbered pagination and keeps selections across pages", async () => {
  const user = userEvent.setup()
  render(<VenueManagementPage />)
  await ready()

  expect(screen.getByRole("checkbox", { name: "Select Hall 1" })).toBeDisabled()
  await user.click(screen.getByRole("checkbox", { name: "Select all on this page" }))
  expect(screen.getByText("9 selected across all pages")).toBeInTheDocument()
  await user.click(screen.getByRole("button", { name: "Next" }))
  expect(screen.getByRole("heading", { name: "Hall 11" })).toBeInTheDocument()
  await user.click(screen.getByRole("checkbox", { name: "Select all on this page" }))
  expect(screen.getByText("19 selected across all pages")).toBeInTheDocument()

  await user.click(screen.getByRole("button", { name: "Go to page 3" }))
  expect(screen.getByRole("button", { name: "Go to page 3" })).toHaveAttribute("aria-current", "page")
  expect(screen.getByRole("button", { name: "Next" })).toBeDisabled()
  expect(screen.getByRole("heading", { name: "Hall 21" })).toBeInTheDocument()
  await user.click(screen.getByRole("button", { name: "Go to page 1" }))
  expect(screen.getByRole("checkbox", { name: "Select all on this page" })).toBeChecked()
  await user.click(screen.getByRole("checkbox", { name: "Select Hall 2" }))
  expect(screen.getByRole("checkbox", { name: "Select all on this page" })).toHaveAttribute("aria-checked", "mixed")
})

it("selects and approves every matching venue across pages once, keeping the current page", async () => {
  const user = userEvent.setup()
  const approval = deferred<{ success: boolean; approvedCount: number }>()
  approveMock.mockImplementationOnce(() => approval.promise)
  render(<VenueManagementPage />)
  await ready()
  await user.click(screen.getByRole("button", { name: "Next" }))
  await user.click(screen.getByRole("button", { name: "Select all 24 matching venues" }))
  await user.click(screen.getByRole("button", { name: "Approve all (24)" }))
  const dialog = screen.getByRole("dialog")
  expect(within(dialog).getByText(/Approve 24 selected venues/)).toBeInTheDocument()
  expect(approveMock).not.toHaveBeenCalled()
  await user.click(within(dialog).getByRole("button", { name: "Approve 24 venues" }))
  expect(approveMock).toHaveBeenCalledTimes(1)
  expect(approveMock).toHaveBeenCalledWith(venues.slice(1).map((v) => v.id))
  expect(within(dialog).getByRole("button", { name: "Approving..." })).toBeDisabled()
  await user.keyboard("{Escape}")
  expect(screen.getByRole("dialog")).toBeInTheDocument()

  await act(async () => {
    venues = venues.map((venue) => ({ ...venue, isVerified: true, isActive: true, status: "active" }))
    approval.resolve({ success: true, approvedCount: 24 })
  })
  await ready()
  expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
  expect(screen.getByText("0 selected across all pages")).toBeInTheDocument()
  expect(screen.getByRole("button", { name: "Go to page 2" })).toHaveAttribute("aria-current", "page")
  expect(JSON.parse(sessionStorage.getItem(storageKey)!).listPage).toBe(2)
})

it("retains selection and the confirmation after a failed bulk approval", async () => {
  const errorLog = jest.spyOn(console, "error").mockImplementation(() => {})
  approveMock.mockRejectedValueOnce(new Error("Request failed"))
  try {
    const user = userEvent.setup()
    render(<VenueManagementPage />)
    await ready()
    await user.click(screen.getByRole("checkbox", { name: "Select Hall 2" }))
    await user.click(screen.getByRole("button", { name: "Approve selected (1)" }))
    await user.click(within(screen.getByRole("dialog")).getByRole("button", { name: "Approve Venue" }))
    await waitFor(() => expect(toast.error).toHaveBeenCalledWith("Failed to approve selected venues"))
    expect(screen.getByRole("dialog")).toBeInTheDocument()
    await user.click(within(screen.getByRole("dialog")).getByRole("button", { name: "Cancel" }))
    expect(screen.getByRole("checkbox", { name: "Select Hall 2" })).toBeChecked()
  } finally {
    errorLog.mockRestore()
  }
})

it("restores the page and search on refresh, waiting for venue data before clamping", async () => {
  const user = userEvent.setup()
  const first = render(<VenueManagementPage />)
  await ready()
  fireEvent.change(screen.getByRole("textbox"), { target: { value: "Hall " } })
  await user.click(screen.getByRole("button", { name: "Go to page 3" }))
  first.unmount()

  const loading = deferred<Venue[]>()
  fetchMock.mockImplementationOnce(() => loading.promise)
  render(<VenueManagementPage />)
  expect(JSON.parse(sessionStorage.getItem(storageKey)!).listPage).toBe(3)
  await act(async () => { loading.resolve(venues) })
  await ready()
  expect(screen.getByRole("textbox")).toHaveValue("Hall ")
  expect(screen.getByRole("button", { name: "Go to page 3" })).toHaveAttribute("aria-current", "page")

  await user.click(screen.getByRole("checkbox", { name: "Select all on this page" }))
  fireEvent.change(screen.getByRole("textbox"), { target: { value: "Hall 2" } })
  expect(screen.queryByRole("navigation", { name: "Venue pagination" })).not.toBeInTheDocument()
  expect(screen.getByText("0 selected across all pages")).toBeInTheDocument()
  expect(JSON.parse(sessionStorage.getItem(storageKey)!).listPage).toBe(1)
})

it("restores the saved tab, status filter and page together", async () => {
  const first = renderHook(() => useVenueManagement())
  await waitFor(() => expect(first.result.current.loading).toBe(false))
  act(() => {
    first.result.current.setStatusFilter("pending")
    first.result.current.setSearchTerm("Hall ")
    first.result.current.setActiveTab("pending")
  })
  act(() => first.result.current.setListPage(2))
  first.unmount()

  const next = renderHook(() => useVenueManagement())
  await waitFor(() => expect(next.result.current.loading).toBe(false))
  expect(next.result.current.activeTab).toBe("pending")
  expect(next.result.current.statusFilter).toBe("pending")
  expect(next.result.current.searchTerm).toBe("Hall ")
  expect(next.result.current.paginatedPending.page).toBe(2)
})

it("keeps the All Venues state separate from the sidebar Bulk Import entry", async () => {
  const hook = renderHook(({ tab }: { tab: VenueTab }) => useVenueManagement(tab), { initialProps: { tab: "all" as VenueTab } })
  await waitFor(() => expect(hook.result.current.loading).toBe(false))
  act(() => hook.result.current.setListPage(3))
  hook.rerender({ tab: "bulk-import" })
  expect(hook.result.current.activeTab).toBe("bulk-import")
  hook.rerender({ tab: "all" })
  expect(hook.result.current.activeTab).toBe("all")
  expect(hook.result.current.listPage).toBe(3)
})

it("limits select-all to the current search and clears selection when the status filter changes", async () => {
  const hook = renderHook(() => useVenueManagement())
  await waitFor(() => expect(hook.result.current.loading).toBe(false))
  act(() => hook.result.current.setSearchTerm("Hall 2"))
  act(() => hook.result.current.bulkSelection.selectAll())
  expect([...hook.result.current.bulkSelection.selectedIds]).toEqual(["venue-2", "venue-20", "venue-21", "venue-22", "venue-23", "venue-24", "venue-25"])
  act(() => hook.result.current.setStatusFilter("active"))
  expect(hook.result.current.bulkSelection.selectedIds.size).toBe(0)
  expect(hook.result.current.listPage).toBe(1)
})

it.each([
  ["malformed JSON", "{bad", 1],
  ["invalid page", JSON.stringify({ listPage: -4 }), 1],
  ["a page beyond the last page", JSON.stringify({ listPage: 99 }), 3],
])("handles %s in saved list state", async (_label, saved, expectedPage) => {
  sessionStorage.setItem(storageKey, saved)
  const hook = renderHook(() => useVenueManagement())
  await waitFor(() => expect(hook.result.current.loading).toBe(false))
  expect(hook.result.current.paginatedAll.page).toBe(expectedPage)
  expect(JSON.parse(sessionStorage.getItem(storageKey)!).listPage).toBe(expectedPage)
})

it("preserves the saved page if venue loading fails", async () => {
  sessionStorage.setItem(storageKey, JSON.stringify({ listPage: 3 }))
  fetchMock.mockRejectedValueOnce(new Error("Offline"))
  const errorLog = jest.spyOn(console, "error").mockImplementation(() => {})
  try {
    const hook = renderHook(() => useVenueManagement())
    await waitFor(() => expect(hook.result.current.loading).toBe(false))
    expect(JSON.parse(sessionStorage.getItem(storageKey)!).listPage).toBe(3)
  } finally {
    errorLog.mockRestore()
  }
})

it("keeps single venue approval on the existing PATCH endpoint", async () => {
  const hook = renderHook(() => useVenueManagement())
  await waitFor(() => expect(hook.result.current.loading).toBe(false))
  act(() => hook.result.current.openApproveVenue(venues[1]))
  await act(async () => { await hook.result.current.handleApproveVenue(venues[1].id) })
  expect(patchVenue).toHaveBeenCalledWith("venue-2", { isVerified: true, isActive: true })
  expect(approveMock).not.toHaveBeenCalled()
})
