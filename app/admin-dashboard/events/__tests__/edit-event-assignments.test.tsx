import { fireEvent, render, screen, waitFor, cleanup } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { EditEventForm } from "../components/EditEventForm"
import { apiFetch } from "@/lib/api"
import { mapPatchedEventToEditRecord } from "../edit-event-form-utils"
import type { EditEventRecord } from "../edit-event-schema"

jest.mock("@/lib/api", () => ({ apiFetch: jest.fn() }))
jest.mock("../components/AdminEventFileUpload", () => ({
  AdminEventFileUpload: () => null,
  AdminEventImagePreview: () => null,
}))
jest.mock("@/components/app-image", () => ({ AppImage: () => null }))
jest.mock("@/components/organizer-create-event/upload-backend", () => ({ uploadEventFileToBackend: jest.fn() }))

const apiMock = apiFetch as jest.Mock
const organizer = { id: "org-1", organizationName: "Current Organizer", firstName: "Asha", lastName: "Shah", email: "asha@example.com", phone: "1234" }
const nextOrganizer = { id: "org-2", organizationName: "Next Organizer", firstName: "Rohan", lastName: "Rao", email: "rohan@example.com" }
const venue = { id: "venue-1", venueName: "Current Venue", venueAddress: "123 Main Road", venueCity: "Mumbai", venueCountry: "India", maxCapacity: 500 }
const nextVenue = { id: "venue-2", venueName: "Next Venue", venueAddress: "45 Expo Road", venueCity: "Pune", venueCountry: "India" }
const event: EditEventRecord = {
  id: "event-1", title: "Technology Expo", organizer: "Current Organizer", organizerId: organizer.id,
  venueId: venue.id, organizerDetails: organizer, venueDetails: venue,
  date: "2026-11-20", endDate: "2026-11-21", location: "Mumbai", venue: "Current Venue", country: "India",
  status: "Approved", attendees: 0, maxCapacity: 100, ticketPrice: 0, category: "Technology",
  featured: false, vip: false, description: "An exhibition", shortDescription: "", slug: "technology-expo",
  edition: "", tags: [], eventType: "in-person", timezone: "IST", currency: "USD",
  bannerImage: "", thumbnailImage: "", images: [], videos: [], brochure: "", layout: "", documents: [],
  isVerified: false, isPublic: true, verifiedBadgeImage: null,
}
const onSave = jest.fn()
const renderForm = (record = event) => render(<EditEventForm event={record} onSave={onSave} onCancel={jest.fn()} categories={[{ id: "tech", name: "Technology", isActive: true }]} />)
const ready = () => waitFor(() => expect(screen.getByLabelText("Organizer *")).toBeEnabled())
const patchBody = () => {
  const call = apiMock.mock.calls.find(([, options]) => options?.method === "PATCH")
  if (!call) throw new Error("The event was not submitted")
  return call[1].body
}

beforeEach(() => {
  jest.clearAllMocks()
  apiMock.mockImplementation(async (url: string, options?: { method?: string; body?: Record<string, unknown> }) => {
    if (options?.method === "PATCH" && options.body) {
      return { data: {
        ...event, ...options.body, status: "PUBLISHED",
        organizer: options.body.organizerId ? nextOrganizer : organizer,
        venue: options.body.venueId === null ? null : options.body.venueId ? nextVenue : venue,
        city: options.body.venueId === null ? null : options.body.venueId ? "Pune" : "Mumbai",
      } }
    }
    if (url === "/api/admin/organizers/org-2") return { data: { ...nextOrganizer, businessEmail: "info@next-organizer.example" } }
    if (url === "/api/admin/venues/venue-2") return { data: { ...nextVenue, venuePhone: "+91 555 1234" } }
    return { data: url.includes("/organizers") ? [nextOrganizer] : [nextVenue], pagination: { totalPages: 2 } }
  })
})

it("shows the current organizer and venue even when neither is in the first directory page", async () => {
  renderForm()
  await ready()
  expect(screen.getByLabelText("Organizer *")).toHaveValue(organizer.id)
  expect(screen.getByLabelText("Venue", { exact: true })).toHaveValue(venue.id)
  expect(screen.getByText("asha@example.com")).toBeInTheDocument()
  expect(screen.getByText("123 Main Road")).toBeInTheDocument()
})

it("saves changed assignments and restores their details when reopened", async () => {
  renderForm()
  await ready()
  fireEvent.change(screen.getByLabelText("Organizer *"), { target: { value: nextOrganizer.id } })
  fireEvent.change(screen.getByLabelText("Venue", { exact: true }), { target: { value: nextVenue.id } })
  expect(screen.getByText("45 Expo Road")).toBeInTheDocument()
  expect(await screen.findByText("+91 555 1234")).toBeInTheDocument()
  fireEvent.click(screen.getByRole("button", { name: "Save Changes" }))
  await waitFor(() => expect(onSave).toHaveBeenCalled())
  const patch = patchBody()
  expect(patch).toEqual(expect.objectContaining({ organizerId: nextOrganizer.id, venueId: nextVenue.id }))
  expect(patch).not.toHaveProperty("organizer")
  expect(patch).not.toHaveProperty("venue")
  const saved = onSave.mock.calls[0][0]
  expect(saved).toEqual(expect.objectContaining({ organizer: "Next Organizer", venue: "Next Venue", location: "Pune" }))
  cleanup()
  renderForm(saved)
  await ready()
  expect(screen.getByLabelText("Organizer *")).toHaveValue(nextOrganizer.id)
  expect(screen.getByLabelText("Venue", { exact: true })).toHaveValue(nextVenue.id)
})

it("omits assignment fields when saving unrelated event changes", async () => {
  renderForm()
  await ready()
  fireEvent.click(screen.getByRole("button", { name: "Save Changes" }))
  await waitFor(() => expect(onSave).toHaveBeenCalled())
  const patch = patchBody()
  expect(patch).not.toHaveProperty("organizerId")
  expect(patch).not.toHaveProperty("venueId")
})

it("can clear an optional venue without restoring stale details", async () => {
  renderForm()
  await ready()
  fireEvent.change(screen.getByLabelText("Venue", { exact: true }), { target: { value: "" } })
  fireEvent.click(screen.getByRole("button", { name: "Save Changes" }))
  await waitFor(() => expect(onSave).toHaveBeenCalled())
  expect(onSave.mock.calls[0][0]).toEqual(expect.objectContaining({ venueId: null, venue: "", location: "", venueDetails: null }))
})

it("searches the server directory and pages through results", async () => {
  renderForm()
  await ready()
  await userEvent.type(screen.getByLabelText("Search organizers"), "rohan{Enter}")
  await waitFor(() => expect(apiMock).toHaveBeenCalledWith(expect.stringContaining("search=rohan"), expect.anything()))
  expect(onSave).not.toHaveBeenCalled()
  await ready()
  fireEvent.click(screen.getByRole("button", { name: "Next organizers page" }))
  await waitFor(() => expect(apiMock).toHaveBeenCalledWith(expect.stringContaining("page=2"), expect.anything()))
  expect(screen.getByLabelText("Organizer *")).toHaveValue(organizer.id)
})

it("maps raw detail responses without losing relation IDs or contact names", () => {
  const result = mapPatchedEventToEditRecord({ ...event, organizerId: undefined, venueId: undefined, organizer, venue })
  expect(result.organizerId).toBe(organizer.id)
  expect(result.venueId).toBe(venue.id)
  expect(result.organizerDetails).toEqual(organizer)
  expect(result.venueDetails).toEqual(venue)
})
