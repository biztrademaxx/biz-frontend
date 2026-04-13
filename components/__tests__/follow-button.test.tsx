import { screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"

import { FollowButton } from "@/components/follow-button"
import * as api from "@/lib/api"
import { renderWithProviders } from "@/test/test-utils"

jest.mock("@/lib/api", () => ({
  apiFetch: jest.fn(),
}))

const apiFetch = api.apiFetch as jest.MockedFunction<typeof api.apiFetch>

describe("FollowButton", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    apiFetch.mockResolvedValue({ isFollowing: false })
  })

  it("does not render follow control when viewing own profile", () => {
    renderWithProviders(<FollowButton userId="same" currentUserId="same" />)
    expect(screen.queryByRole("button", { name: /follow/i })).not.toBeInTheDocument()
  })

  it("shows auth toast and does not call API when not logged in", async () => {
    const user = userEvent.setup()
    renderWithProviders(<FollowButton userId="ex-1" currentUserId={undefined} />)
    await user.click(await screen.findByRole("button", { name: /follow/i }))
    await waitFor(() => {
      expect(screen.getByText(/authentication required/i)).toBeInTheDocument()
    })
    expect(apiFetch).not.toHaveBeenCalledWith(
      expect.stringContaining("/api/follow/ex-1"),
      expect.objectContaining({ method: "POST" })
    )
  })

  it("loads follow state and toggles follow via API when logged in", async () => {
    const user = userEvent.setup()
    apiFetch.mockImplementation(async (url: string, opts?: { method?: string }) => {
      if (url.includes("?currentUserId=") && (!opts || !opts.method)) {
        return { isFollowing: false }
      }
      if (opts?.method === "POST") return {}
      if (opts?.method === "DELETE") return {}
      return {}
    })

    renderWithProviders(<FollowButton userId="ex-1" currentUserId="me-1" />)

    await waitFor(() =>
      expect(apiFetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/follow/ex-1"),
        expect.any(Object)
      )
    )

    await user.click(screen.getByRole("button", { name: /^follow$/i }))
    await waitFor(() => {
      expect(apiFetch).toHaveBeenCalledWith("/api/follow/ex-1", {
        method: "POST",
        auth: true,
      })
    })
    expect(screen.getByRole("button", { name: /following/i })).toBeInTheDocument()

    await user.click(screen.getByRole("button", { name: /following/i }))
    await waitFor(() => {
      expect(apiFetch).toHaveBeenCalledWith("/api/follow/ex-1", {
        method: "DELETE",
        auth: true,
      })
    })
  })
})
