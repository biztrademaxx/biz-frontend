import { act, render, renderHook, screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import EventApprovalDashboard from "../../EventApprovalDashboard"
import OrganizerApprovals from "../components/OrganizerApprovals"
import ExhibitorApprovals from "../components/ExhibitorApprovals"
import VenueApprovals from "../components/VenueApprovals"
import { useApprovalSelection } from "../hooks/useApprovalSelection"
import { adminApi } from "@/lib/admin-api"
import { apiFetch } from "@/lib/api"
import { fetchAllVenues, bulkApproveVenues } from "../../venues/services/venues.api"
import type { Venue } from "../../venues/types/venue.types"

jest.mock("@/lib/admin-api", () => ({ adminApi: jest.fn() }))
jest.mock("@/lib/api", () => ({ apiFetch: jest.fn() }))
jest.mock("../../EventDetailsModal", () => ({ __esModule: true, default: () => null }))
jest.mock("@/hooks/use-toast", () => ({ useToast: () => ({ toast: jest.fn() }) }))
jest.mock("@/components/ui/use-toast", () => ({ useToast: () => ({ toast: jest.fn() }) }))
jest.mock("sonner", () => ({ toast: { success: jest.fn(), error: jest.fn() } }))
jest.mock("../../venues/services/venues.api", () => ({
  fetchAllVenues: jest.fn(), bulkApproveVenues: jest.fn(), patchVenue: jest.fn(),
  fetchVenueById: jest.fn(), buildStatusPatchBody: jest.fn(), buildVenuePatchBody: jest.fn(),
  createVenue: jest.fn(), deleteVenue: jest.fn(), sendVenueAccountEmail: jest.fn(),
}))
jest.mock("../../venues/components", () => ({
  ApproveVenueDialog: jest.requireActual("../../venues/components/ApproveVenueDialog").ApproveVenueDialog,
  RejectVenueDialog: () => null,
  ViewVenueDialog: () => null,
}))

type Kind = "events" | "organizers" | "exhibitors" | "venues"
const kinds: Kind[] = ["events", "organizers", "exhibitors", "venues"]
const adminMock = jest.mocked(adminApi)
const eventMock = jest.mocked(apiFetch)
const venueFetchMock = jest.mocked(fetchAllVenues)
const venueApproveMock = jest.mocked(bulkApproveVenues)
let events: ReturnType<typeof event>[]
let organizers: ReturnType<typeof user>[]
let exhibitors: ReturnType<typeof user>[]
let venues: Venue[]
let failNextApproval: boolean
let approvalGate: Promise<void> | null

function event(index: number) {
  return {
    id: "event-" + index, title: "Event " + index, status: "PENDING_APPROVAL",
    city: "Mumbai", country: "India", startDate: "2026-12-01", endDate: "2026-12-03",
    createdAt: "2026-11-01", organizer: { id: "org", name: "Organizer", company: "Company" },
    ticketTypes: [], exhibitionSpaces: [], images: [],
  }
}
function user(index: number, kind: string) {
  return {
    id: kind + "-" + index, firstName: "Contact", lastName: String(index),
    organizationName: "Organizer " + index, company: kind + " " + index,
    email: kind + index + "@example.com", createdAt: "2026-11-01",
    isActive: kind === "organizer", isVerified: false,
  }
}
function venue(index: number): Venue {
  return {
    id: "venue-" + index, venueName: "Venue " + index, contactPerson: "Manager",
    email: "venue" + index + "@example.com", mobile: "", address: "", city: "Mumbai",
    state: "", country: "India", website: "", description: "", logo: "", maxCapacity: 100,
    totalHalls: 1, totalEvents: 0, activeBookings: 0, averageRating: 0, totalReviews: 0,
    amenities: [], meetingSpaces: [], venueImages: [], isVerified: false, isActive: true,
    status: "pending", events: [],
  }
}
function paginate<T>(items: T[], params: URLSearchParams) {
  const page = Number(params.get("page") || 1)
  const limit = Number(params.get("limit") || 10)
  return {
    data: items.slice((page - 1) * limit, page * limit),
    pagination: { page, limit, total: items.length, totalPages: Math.max(1, Math.ceil(items.length / limit)) },
  }
}
async function beforeApproval() {
  if (approvalGate) await approvalGate
  if (failNextApproval) {
    failNextApproval = false
    throw new Error("Request failed")
  }
}
function calls(kind: Kind): Array<{ ids?: string[]; eventIds?: string[]; allPending?: boolean; search?: string }> {
  if (kind === "venues") return venueApproveMock.mock.calls.map(([ids]) => ({ ids }))
  const mock = kind === "events" ? eventMock : adminMock
  return mock.mock.calls.filter(([url]) => String(url).endsWith("/" + kind + "/bulk-approve"))
    .map(([, options]) => options?.body as { ids?: string[]; eventIds?: string[]; allPending?: boolean; search?: string })
}
function App({ kind }: { kind: Kind }) {
  if (kind === "events") return <EventApprovalDashboard />
  if (kind === "organizers") return <OrganizerApprovals />
  if (kind === "exhibitors") return <ExhibitorApprovals />
  return <VenueApprovals />
}
async function ready(kind: Kind) {
  const checkbox = await screen.findByRole("checkbox", { name: "Select all pending " + kind })
  await waitFor(() => expect(checkbox).toBeEnabled())
  return checkbox
}
function confirm(kind: Kind, count: number) {
  const dialog = screen.getByRole(kind === "events" ? "alertdialog" : "dialog")
  return within(dialog).getByRole("button", { name: "Approve " + count + " " + kind })
}

beforeEach(() => {
  jest.clearAllMocks()
  sessionStorage.clear()
  window.history.replaceState(null, "", "/admin-dashboard?section=approvals&sub=approvals-events")
  jest.spyOn(window, "scrollTo").mockImplementation(() => {})
  events = Array.from({ length: 3 }, (_, index) => event(index + 1))
  organizers = Array.from({ length: 3 }, (_, index) => user(index + 1, "organizer"))
  exhibitors = Array.from({ length: 3 }, (_, index) => user(index + 1, "exhibitor"))
  venues = Array.from({ length: 3 }, (_, index) => venue(index + 1))
  failNextApproval = false
  approvalGate = null
  adminMock.mockReset().mockImplementation(async (url, options) => {
    const body = options?.body as { ids?: string[]; allPending?: boolean; search?: string } | undefined
    if (options?.method === "PATCH" && String(url).startsWith("/organizers/")) {
      const item = organizers.find((item) => String(url).endsWith("/" + item.id))!
      item.isVerified = true
      return { success: true, data: item } as never
    }
    if (String(url).endsWith("/bulk-approve")) {
      await beforeApproval()
      const organizer = String(url).includes("/organizers/")
      const source = organizer ? organizers : exhibitors
      const matching = source.filter((item) =>
        (organizer ? !item.isVerified && item.isActive : !item.isActive) &&
        (body?.allPending || body?.ids?.includes(item.id)) &&
        (!body?.search || item.organizationName.toLowerCase().includes(body.search.toLowerCase())),
      )
      matching.forEach((item) => { item.isVerified = organizer; item.isActive = true })
      return { success: true, approvedCount: matching.length } as never
    }
    const params = new URL(String(url), "http://localhost").searchParams
    const organizer = String(url).startsWith("/organizers")
    let source = organizer ? organizers : exhibitors
    if (organizer && params.has("verified")) source = source.filter((item) => item.isVerified === (params.get("verified") === "true"))
    if (params.get("status") === "pending") source = source.filter((item) => !item.isActive)
    if (params.get("isActive") === "true") source = source.filter((item) => item.isActive)
    if (params.get("search")) source = source.filter((item) => item.organizationName.toLowerCase().includes(params.get("search")!.toLowerCase()))
    return { success: true, ...paginate(source, params) } as never
  })
  eventMock.mockReset().mockImplementation(async (url, options) => {
    if (String(url).endsWith("/events/stats")) return {
      success: true, stats: {
        pending: events.filter((item) => item.status === "PENDING_APPROVAL").length,
        approved: events.filter((item) => item.status === "PUBLISHED").length, rejected: 0,
      },
    } as never
    if (String(url).endsWith("/events/bulk-approve")) {
      await beforeApproval()
      const ids = (options?.body as { eventIds: string[] }).eventIds
      const matching = events.filter((item) => ids.includes(item.id))
      matching.forEach((item) => { item.status = "PUBLISHED" })
      return { success: true, approved: matching.length, results: matching.map((item) => ({ eventId: item.id, ok: true })) } as never
    }
    const params = new URL(String(url), "http://localhost").searchParams
    const source = events.filter((item) => item.status === params.get("status"))
    const result = paginate(source, params)
    return { success: true, events: result.data, pagination: result.pagination } as never
  })
  venueFetchMock.mockReset().mockImplementation(async () => [...venues])
  venueApproveMock.mockReset().mockImplementation(async (ids) => {
    await beforeApproval()
    venues = venues.map((item) => ids.includes(item.id) ? { ...item, isVerified: true, status: "active" } : item)
    return { success: true, approvedCount: ids.length }
  })
})
afterEach(() => { jest.restoreAllMocks() })

it.each(kinds)("%s selects all pending records and approves them after confirmation", async (kind) => {
  const user = userEvent.setup()
  render(<App kind={kind} />)
  await user.click(await ready(kind))
  await screen.findByText("3 selected across all pages")
  expect(calls(kind)).toHaveLength(0)
  await user.click(screen.getByRole("button", { name: "Approve selected (3)" }))
  expect(calls(kind)).toHaveLength(0)
  await user.click(confirm(kind, 3))
  await waitFor(() => expect(screen.queryByRole(kind === "events" ? "alertdialog" : "dialog")).not.toBeInTheDocument())
  expect(calls(kind)).toHaveLength(1)
  const body = calls(kind)[0]
  const ids = "eventIds" in body ? body.eventIds : body.ids
  expect(ids).toHaveLength(3)
})

it.each(kinds)("%s keeps the selection and confirmation on failure and supports retry", async (kind) => {
  const user = userEvent.setup()
  render(<App kind={kind} />)
  await user.click(await ready(kind))
  await screen.findByText("3 selected across all pages")
  await user.click(screen.getByRole("button", { name: "Approve selected (3)" }))
  failNextApproval = true
  const log = jest.spyOn(console, "error").mockImplementation(() => {})
  await user.click(confirm(kind, 3))
  await waitFor(() => {
    expect(calls(kind)).toHaveLength(1)
    expect(confirm(kind, 3)).toBeEnabled()
  })
  expect(screen.getByText("3 selected across all pages")).toBeInTheDocument()
  await user.click(confirm(kind, 3))
  await waitFor(() => expect(screen.queryByRole(kind === "events" ? "alertdialog" : "dialog")).not.toBeInTheDocument())
  expect(calls(kind)).toHaveLength(2)
  log.mockRestore()
})

it.each(kinds)("%s prevents duplicate approval submissions while a request is pending", async (kind) => {
  const user = userEvent.setup()
  let release!: () => void
  approvalGate = new Promise<void>((resolve) => { release = resolve })
  render(<App kind={kind} />)
  await user.click(await ready(kind))
  await screen.findByText("3 selected across all pages")
  await user.click(screen.getByRole("button", { name: "Approve selected (3)" }))
  await user.dblClick(confirm(kind, 3))
  expect(calls(kind)).toHaveLength(1)
  expect(within(screen.getByRole(kind === "events" ? "alertdialog" : "dialog")).getByRole("button", { name: /^Approving/ })).toBeDisabled()
  await act(async () => { release() })
  await waitFor(() => expect(screen.queryByRole(kind === "events" ? "alertdialog" : "dialog")).not.toBeInTheDocument())
})

it("events selects all 105 pending records across pages and supports deselection on another page", async () => {
  const user = userEvent.setup()
  events = Array.from({ length: 105 }, (_, index) => event(index + 1))
  events.push({ ...event(106), status: "PUBLISHED" })
  render(<EventApprovalDashboard />)
  await user.click(await ready("events"))
  await screen.findByText("105 selected across all pages")
  await user.click(screen.getByRole("button", { name: "Go to page 2" }))
  const row = await screen.findByRole("checkbox", { name: "Select Event 11" })
  await waitFor(() => expect(row).toBeEnabled())
  expect(row).toBeChecked()
  await user.click(row)
  await screen.findByText("104 selected across all pages")
  await user.click(screen.getByRole("button", { name: "Approve selected (104)" }))
  await user.click(confirm("events", 104))
  await waitFor(() => expect(calls("events")).toHaveLength(1))
  expect(calls("events")[0].eventIds).toHaveLength(104)
  expect(calls("events")[0].eventIds).toContain("event-105")
  expect(calls("events")[0].eventIds).not.toContain("event-11")
  expect(calls("events")[0].eventIds).not.toContain("event-106")
})

it("organizers selects all pages and preserves selections when changing pages", async () => {
  const userEventApi = userEvent.setup()
  organizers = Array.from({ length: 105 }, (_, index) => user(index + 1, "organizer"))
  render(<OrganizerApprovals />)
  await userEventApi.click(await ready("organizers"))
  await screen.findByText("105 selected across all pages")
  await userEventApi.click(screen.getByRole("button", { name: "Next" }))
  const row = await screen.findByRole("checkbox", { name: "Select Organizer 11" })
  expect(row).toBeChecked()
  await userEventApi.click(row)
  await screen.findByText("104 selected across all pages")
  await userEventApi.click(screen.getByRole("button", { name: "Approve selected (104)" }))
  await userEventApi.click(confirm("organizers", 104))
  await waitFor(() => expect(calls("organizers")).toHaveLength(1))
  expect(calls("organizers")[0].ids).toHaveLength(104)
  expect(calls("organizers")[0].ids).toContain("organizer-105")
  expect(calls("organizers")[0].ids).not.toContain("organizer-11")
})

it("exhibitors includes pending records beyond the first 100 in its selection and confirmation", async () => {
  const userEventApi = userEvent.setup()
  exhibitors = Array.from({ length: 105 }, (_, index) => user(index + 1, "exhibitor"))
  exhibitors.push({ ...user(106, "exhibitor"), isActive: true })
  render(<ExhibitorApprovals />)
  await userEventApi.click(await ready("exhibitors"))
  await screen.findByText("105 selected across all pages")
  await userEventApi.click(screen.getByRole("button", { name: "Approve selected (105)" }))
  await userEventApi.click(confirm("exhibitors", 105))
  await waitFor(() => expect(calls("exhibitors")).toHaveLength(1))
  expect(calls("exhibitors")[0].ids).toHaveLength(105)
  expect(calls("exhibitors")[0].ids).toContain("exhibitor-105")
  expect(calls("exhibitors")[0].ids).not.toContain("exhibitor-106")
})

it("discards an old select-all response if the approval filter changes", async () => {
  let resolve!: (ids: string[]) => void
  const pending = new Promise<string[]>((done) => { resolve = done })
  const hook = renderHook(({ scope }) => useApprovalSelection(scope), { initialProps: { scope: "first" } })
  let selection!: Promise<string[]>
  act(() => { selection = hook.result.current.selectAll(() => pending) })
  hook.rerender({ scope: "second" })
  await act(async () => { resolve(["old-id"]); await selection })
  expect(hook.result.current.selectedIds.size).toBe(0)
  expect(hook.result.current.selecting).toBe(false)
})

it.each(kinds)("%s offers Approve all with the full count before submitting", async (kind) => {
  const user = userEvent.setup()
  render(<App kind={kind} />)
  await ready(kind)
  await user.click(screen.getByRole("button", { name: "Approve all " + kind + " (3)" }))
  await screen.findByRole(kind === "events" ? "alertdialog" : "dialog")
  expect(calls(kind)).toHaveLength(0)
  await user.click(confirm(kind, 3))
  await waitFor(() => expect(screen.queryByRole(kind === "events" ? "alertdialog" : "dialog")).not.toBeInTheDocument())
  expect(calls(kind)).toHaveLength(1)
  if (kind === "organizers" || kind === "exhibitors") expect(calls(kind)[0].allPending).toBe(true)
})

it("events keeps only unsuccessful records selected after partial approval and retries them", async () => {
  const user = userEvent.setup()
  const base = eventMock.getMockImplementation()!
  let partial = true
  eventMock.mockImplementation(async (url, options) => {
    if (String(url).endsWith("/events/bulk-approve") && partial) {
      partial = false
      events[0].status = "PUBLISHED"
      events[1].status = "PUBLISHED"
      return { success: true, approved: 2, results: [
        { eventId: "event-1", ok: true }, { eventId: "event-2", ok: true }, { eventId: "event-3", ok: false },
      ] } as never
    }
    return base(url, options) as never
  })
  render(<EventApprovalDashboard />)
  await user.click(await ready("events"))
  await screen.findByText("3 selected across all pages")
  await user.click(screen.getByRole("button", { name: "Approve selected (3)" }))
  await user.click(confirm("events", 3))
  await screen.findByText("1 selected across all pages")
  await waitFor(() => expect(confirm("events", 1)).toBeEnabled())
  await user.click(confirm("events", 1))
  await waitFor(() => expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument())
  expect(calls("events").map((body) => body.eventIds)).toEqual([
    ["event-1", "event-2", "event-3"], ["event-3"],
  ])
})

it("organizers select-all stays within the current search", async () => {
  const user = userEvent.setup()
  render(<OrganizerApprovals />)
  await ready("organizers")
  await user.type(screen.getByPlaceholderText("Search by name, email, or organization..."), "Organizer 2")
  await screen.findByText("Select all (1)")
  await user.click(await ready("organizers"))
  await screen.findByText("1 selected across all pages")
  await user.click(screen.getByRole("button", { name: "Approve selected (1)" }))
  await user.click(confirm("organizers", 1))
  await waitFor(() => expect(calls("organizers")).toHaveLength(1))
  expect(calls("organizers")[0].ids).toEqual(["organizer-2"])
})

it("does not select a partial set if loading another pending-events page fails", async () => {
  const user = userEvent.setup()
  events = Array.from({ length: 105 }, (_, index) => event(index + 1))
  const base = eventMock.getMockImplementation()!
  eventMock.mockImplementation(async (url, options) => {
    const params = new URL(String(url), "http://localhost").searchParams
    if (params.get("limit") === "100" && params.get("page") === "2") throw new Error("Offline")
    return base(url, options) as never
  })
  render(<EventApprovalDashboard />)
  await user.click(await ready("events"))
  await waitFor(() => expect(eventMock.mock.calls.some(([url]) => {
    const params = new URL(String(url), "http://localhost").searchParams
    return params.get("limit") === "100" && params.get("page") === "2"
  })).toBe(true))
  await ready("events")
  expect(screen.getByText("0 selected across all pages")).toBeInTheDocument()
  expect(screen.getByRole("button", { name: "Approve selected" })).toBeDisabled()
  expect(calls("events")).toHaveLength(0)
})

it("removes an individually approved organizer from the cross-page selection", async () => {
  const user = userEvent.setup()
  render(<OrganizerApprovals />)
  await user.click(await ready("organizers"))
  await screen.findByText("3 selected across all pages")
  const card = screen.getByRole("heading", { name: "Organizer 1" }).closest('[data-slot="card"]') as HTMLElement
  await user.click(within(card).getByRole("button", { name: "Approve" }))
  await screen.findByText("2 selected across all pages")
  await user.click(screen.getByRole("button", { name: "Approve selected (2)" }))
  await user.click(confirm("organizers", 2))
  await waitFor(() => expect(calls("organizers")).toHaveLength(1))
  expect(calls("organizers")[0].ids).toEqual(["organizer-2", "organizer-3"])
})
