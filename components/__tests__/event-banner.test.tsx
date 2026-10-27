import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import DashboardEventHero from "@/app/event-dashboard/EventHero"
import PublicEventHero from "@/components/event-hero"
import { apiFetch } from "@/lib/api"
import { uploadFileViaProxy } from "@/components/organizer-create-event/upload-backend"

const mockToast = jest.fn()
jest.mock("@/hooks/use-toast", () => ({ useToast: () => ({ toast: mockToast }) }))
jest.mock("@/lib/api", () => ({ apiFetch: jest.fn() }))
jest.mock("@/components/organizer-create-event/upload-backend", () => ({ uploadFileViaProxy: jest.fn() }))
jest.mock("keen-slider/react", () => ({
  useKeenSlider: () => [jest.fn(), { current: { next: jest.fn(), moveToIdx: jest.fn(), update: jest.fn(), track: { details: { rel: 0 } }, animator: { stop: jest.fn() } } }],
}))

const mockApi = jest.mocked(apiFetch)
const mockUpload = jest.mocked(uploadFileViaProxy)
const bannerUrl = "/uploaded-event-banner.png"
const event = {
  id: "event-1",
  title: "Automation & Robotics Expo 2026",
  bannerImage: null as string | null,
  thumbnailImage: null,
  logo: null,
  images: ["/gallery-image.png"],
  description: "Event description",
  shortDescription: "Expo",
  leads: [],
  ticketTypes: [],
  location: { city: "Mumbai", venue: "Expo Hall", address: "Road 1", coordinates: { lat: 19, lng: 72 } },
}

beforeEach(() => {
  jest.clearAllMocks()
  mockUpload.mockResolvedValue(bannerUrl)
  mockApi.mockResolvedValue({ bannerImage: bannerUrl })
})

it("shows the saved banner in the public details panel", () => {
  render(<PublicEventHero event={{ ...event, bannerImage: bannerUrl }} />)
  const banner = screen.getByRole("img", { name: `${event.title} banner` })
  expect(banner).toHaveAttribute("src", bannerUrl)
  expect(banner.closest("[class*='md:w-1/3']")).toContainElement(screen.getByRole("heading", { level: 2 }))
})

it("renders the public banner as a square beside the schedule details", () => {
  render(<PublicEventHero event={{ ...event, bannerImage: bannerUrl }} />)
  const banner = screen.getByRole("img", { name: `${event.title} banner` })
  expect(banner.parentElement).toHaveClass("aspect-square")
  const detailsRow = banner.closest(".flex.items-center.justify-between")
  expect(detailsRow).not.toBeNull()
  expect(detailsRow).toContainElement(screen.getByText(/dates to be announced/i))
})

it("does not show an empty banner on the public page", () => {
  render(<PublicEventHero event={event} />)
  expect(screen.queryByRole("img", { name: `${event.title} banner` })).not.toBeInTheDocument()
})

it("uploads and saves a banner while retaining the gallery image", async () => {
  const onBannerImageUpdate = jest.fn()
  render(<DashboardEventHero event={event} onBannerImageUpdate={onBannerImageUpdate} />)
  const file = new File(["image"], "banner.png", { type: "image/png" })
  fireEvent.change(screen.getByLabelText("Upload event banner image"), { target: { files: [file] } })

  await waitFor(() => expect(onBannerImageUpdate).toHaveBeenCalledWith(bannerUrl))
  expect(mockUpload).toHaveBeenCalledWith(file, "image")
  expect(mockApi).toHaveBeenCalledWith("/api/events/event-1", {
    method: "PATCH", auth: true, body: { bannerImage: bannerUrl },
  })
  expect(screen.getByRole("img", { name: `${event.title} banner` })).toHaveAttribute("src", bannerUrl)
  expect(screen.getByRole("img", { name: `${event.title} Image 1` })).toHaveAttribute("src", "/gallery-image.png")
})

it("renders the dashboard banner on the right side of the details section", () => {
  render(<DashboardEventHero event={{ ...event, bannerImage: bannerUrl }} />)
  const banner = screen.getByRole("img", { name: `${event.title} banner` })
  expect(banner.parentElement).toHaveClass("aspect-square")
  const detailsRow = banner.closest(".flex.items-start.justify-between")
  expect(detailsRow).not.toBeNull()
  expect(detailsRow).toContainElement(screen.getByText("Date"))
})

it("keeps the previous banner when saving a replacement fails", async () => {
  mockApi.mockRejectedValueOnce(new Error("Save failed"))
  const onBannerImageUpdate = jest.fn()
  render(<DashboardEventHero event={{ ...event, bannerImage: "/previous.png" }} onBannerImageUpdate={onBannerImageUpdate} />)
  fireEvent.change(screen.getByLabelText("Upload event banner image"), {
    target: { files: [new File(["image"], "banner.png", { type: "image/png" })] },
  })
  await waitFor(() => expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({ title: "Banner upload failed" })))
  expect(screen.getByRole("img", { name: `${event.title} banner` })).toHaveAttribute("src", "/previous.png")
  expect(onBannerImageUpdate).not.toHaveBeenCalled()
})

it.each(["non-image", "oversized"])("rejects a %s file before uploading", (kind) => {
  render(<DashboardEventHero event={event} />)
  const file = new File(["file"], kind === "non-image" ? "document.pdf" : "banner.png", {
    type: kind === "non-image" ? "application/pdf" : "image/png",
  })
  if (kind === "oversized") Object.defineProperty(file, "size", { value: 10 * 1024 * 1024 + 1 })
  fireEvent.change(screen.getByLabelText("Upload event banner image"), { target: { files: [file] } })
  expect(mockUpload).not.toHaveBeenCalled()
  expect(mockApi).not.toHaveBeenCalled()
  expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({ title: "Invalid banner image" }))
})

it("removes the saved banner", async () => {
  mockApi.mockResolvedValueOnce({ bannerImage: null })
  const onBannerImageUpdate = jest.fn()
  render(<DashboardEventHero event={{ ...event, bannerImage: bannerUrl }} onBannerImageUpdate={onBannerImageUpdate} />)
  fireEvent.click(screen.getByRole("button", { name: "Remove banner image" }))
  await waitFor(() => expect(onBannerImageUpdate).toHaveBeenCalledWith(null))
  expect(mockApi).toHaveBeenCalledWith("/api/events/event-1", {
    method: "PATCH", auth: true, body: { bannerImage: null },
  })
  expect(screen.queryByRole("img", { name: `${event.title} banner` })).not.toBeInTheDocument()
  expect(screen.getByRole("button", { name: "Upload banner" })).toBeEnabled()
})

it("shows only the saved gallery images in order in the public slideshow", () => {
  const galleryImages = ["/first-gallery-image.png", "/second-gallery-image.png"]
  const { container } = render(
    <PublicEventHero event={{
      ...event,
      images: galleryImages,
      bannerImage: bannerUrl,
      thumbnailImage: "/event-thumbnail.png",
      logo: "/event-logo.png",
      videos: ["/event-video.mp4"],
    }} />,
  )
  expect(screen.getAllByRole("img", { name: / Image \d+$/ }).map((img) => img.getAttribute("src")))
    .toEqual(galleryImages)
  expect(container.querySelector("video")).not.toBeInTheDocument()
  expect(screen.getByRole("img", { name: `${event.title} banner` })).toHaveAttribute("src", bannerUrl)
})

it("shows an empty gallery when there are no uploaded images even if a banner exists", () => {
  render(<PublicEventHero event={{ ...event, images: [], bannerImage: bannerUrl, thumbnailImage: "/thumbnail.png" }} />)
  expect(screen.queryByRole("img", { name: / Image \d+$/ })).not.toBeInTheDocument()
  expect(screen.getByText("No event images added yet")).toBeInTheDocument()
  expect(screen.getByRole("img", { name: `${event.title} banner` })).toHaveAttribute("src", bannerUrl)
})
