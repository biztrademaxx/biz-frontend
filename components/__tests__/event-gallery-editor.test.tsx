import { act, fireEvent, render, screen, waitFor } from "@testing-library/react"
import EventHero from "@/app/event-dashboard/EventHero"
import { apiFetch } from "@/lib/api"

const mockToast = jest.fn()
const mockSlider = {
  next: jest.fn(),
  moveToIdx: jest.fn(),
  update: jest.fn(),
  animator: { stop: jest.fn() },
  track: { details: { rel: 0 } },
}
const mockInstanceRef = { current: mockSlider }
const mockSliderRef = jest.fn()
let mockSlideChanged: (slider: typeof mockSlider) => void

jest.mock("@/hooks/use-toast", () => ({ useToast: () => ({ toast: mockToast }) }))
jest.mock("@/lib/api", () => ({ apiFetch: jest.fn() }))
jest.mock("keen-slider/react", () => ({
  useKeenSlider: (options: { slideChanged: typeof mockSlideChanged }) => {
    mockSlideChanged = options.slideChanged
    return [mockSliderRef, mockInstanceRef]
  },
}))

const mockApi = jest.mocked(apiFetch)
const event = {
  id: "event-1",
  title: "Automation & Robotics Expo 2026",
  images: ["/first.png", "/second.png", "/third.png"],
  description: "Event description",
  shortDescription: "Expo",
  leads: [],
  ticketTypes: [],
  location: { city: "Mumbai", venue: "Expo Hall", address: "Road 1", coordinates: { lat: 19, lng: 72 } },
}

beforeEach(() => {
  jest.clearAllMocks()
  mockSlider.track.details.rel = 0
  mockSlider.moveToIdx.mockImplementation((index: number) => {
    mockSlider.track.details.rel = index
    mockSlideChanged(mockSlider)
  })
  mockSlider.update.mockImplementation((_options: unknown, index: number) => {
    mockSlider.track.details.rel = index
    mockSlideChanged(mockSlider)
  })
  mockApi.mockResolvedValue({})
  jest.spyOn(window, "confirm").mockReturnValue(true)
})

afterEach(() => {
  jest.useRealTimers()
  jest.restoreAllMocks()
})

it("pauses autoplay while editing and resumes after Done", () => {
  jest.useFakeTimers()
  render(<EventHero event={event} />)
  act(() => { jest.advanceTimersByTime(5000) })
  expect(mockSlider.next).toHaveBeenCalledTimes(1)

  fireEvent.click(screen.getByRole("button", { name: "Edit Images" }))
  expect(mockSlider.animator.stop).toHaveBeenCalled()
  act(() => { jest.advanceTimersByTime(15000) })
  expect(mockSlider.next).toHaveBeenCalledTimes(1)

  fireEvent.click(screen.getByRole("button", { name: "Done" }))
  act(() => { jest.advanceTimersByTime(5000) })
  expect(mockSlider.next).toHaveBeenCalledTimes(2)
})

it("deletes the image selected by thumbnail and updates the count", async () => {
  const onImagesUpdate = jest.fn()
  render(<EventHero event={event} onImagesUpdate={onImagesUpdate} />)
  expect(screen.getByRole("status", { name: "Gallery image count" })).toHaveTextContent("Image 1 / 3")
  fireEvent.click(screen.getByRole("button", { name: "Edit Images" }))
  fireEvent.click(screen.getByRole("button", { name: "Select image 2" }))
  expect(screen.getByRole("button", { name: "Select image 2" })).toHaveAttribute("aria-pressed", "true")
  expect(screen.getByRole("status", { name: "Gallery image count" })).toHaveTextContent("Image 2 / 3")
  fireEvent.click(screen.getByRole("button", { name: "Delete selected image" }))

  await waitFor(() => expect(onImagesUpdate).toHaveBeenCalledWith(["/first.png", "/third.png"]))
  expect(window.confirm).toHaveBeenCalledWith("Delete image 2?")
  expect(mockApi).toHaveBeenCalledWith("/api/events/event-1", {
    method: "PATCH", auth: true, body: { images: ["/first.png", "/third.png"] },
  })
  expect(screen.getByRole("status", { name: "Gallery image count" })).toHaveTextContent("Image 2 / 2")
})

it("keeps selection valid when the last image in the list is deleted", async () => {
  const onImagesUpdate = jest.fn()
  render(<EventHero event={event} onImagesUpdate={onImagesUpdate} />)
  fireEvent.click(screen.getByRole("button", { name: "Edit Images" }))
  fireEvent.click(screen.getByRole("button", { name: "Select image 3" }))
  fireEvent.click(screen.getByRole("button", { name: "Delete selected image" }))
  await waitFor(() => expect(onImagesUpdate).toHaveBeenCalledWith(["/first.png", "/second.png"]))
  expect(screen.getByRole("status", { name: "Gallery image count" })).toHaveTextContent("Image 2 / 2")
  expect(screen.getByRole("button", { name: "Select image 2" })).toHaveAttribute("aria-pressed", "true")
})

it("keeps the selected image when deletion is cancelled", () => {
  jest.mocked(window.confirm).mockReturnValue(false)
  render(<EventHero event={event} />)
  fireEvent.click(screen.getByRole("button", { name: "Edit Images" }))
  fireEvent.click(screen.getByRole("button", { name: "Select image 2" }))
  fireEvent.click(screen.getByRole("button", { name: "Delete selected image" }))
  expect(mockApi).not.toHaveBeenCalled()
  expect(screen.getByRole("status", { name: "Gallery image count" })).toHaveTextContent("Image 2 / 3")
})

it("keeps images and selection when saving the deletion fails", async () => {
  mockApi.mockRejectedValueOnce(new Error("Save failed"))
  jest.spyOn(console, "error").mockImplementation(() => {})
  const onImagesUpdate = jest.fn()
  render(<EventHero event={event} onImagesUpdate={onImagesUpdate} />)
  fireEvent.click(screen.getByRole("button", { name: "Edit Images" }))
  fireEvent.click(screen.getByRole("button", { name: "Select image 2" }))
  fireEvent.click(screen.getByRole("button", { name: "Delete selected image" }))
  await waitFor(() => expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({ description: "Failed to delete image" })))
  expect(onImagesUpdate).not.toHaveBeenCalled()
  expect(screen.getByRole("status", { name: "Gallery image count" })).toHaveTextContent("Image 2 / 3")
  expect(screen.getByRole("button", { name: "Delete selected image" })).toBeEnabled()
})

it("switches from a video to an image before allowing deletion", () => {
  render(<EventHero event={{ ...event, videos: ["/video.mp4"] }} />)
  act(() => {
    mockSlider.track.details.rel = 3
    mockSlideChanged(mockSlider)
  })
  expect(screen.getByRole("status", { name: "Gallery image count" })).toHaveTextContent("Video 1 / 1 · 3 images")
  fireEvent.click(screen.getByRole("button", { name: "Edit Images" }))
  expect(screen.getByRole("status", { name: "Gallery image count" })).toHaveTextContent("Image 3 / 3")
  fireEvent.click(screen.getByRole("button", { name: "Next slide" }))
  expect(screen.getByRole("status", { name: "Gallery image count" })).toHaveTextContent("Image 1 / 3")
})

it("disables deletion for the only remaining image", () => {
  render(<EventHero event={{ ...event, images: ["/first.png"] }} />)
  fireEvent.click(screen.getByRole("button", { name: "Edit Images" }))
  expect(screen.getByRole("button", { name: "Delete selected image" })).toBeDisabled()
  expect(screen.getByRole("status", { name: "Gallery image count" })).toHaveTextContent("Image 1 / 1")
})
