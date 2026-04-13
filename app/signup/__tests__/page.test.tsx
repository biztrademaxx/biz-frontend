import { fireEvent, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"

import SignupPage from "@/app/signup/page"
import { renderWithProviders } from "@/test/test-utils"

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn(), prefetch: jest.fn() }),
}))

jest.mock("next-auth/react", () => ({
  signIn: jest.fn().mockResolvedValue(undefined),
}))

describe("SignupPage", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    global.fetch = jest.fn() as jest.Mock
  })

  it("shows validation toast when form is submitted empty (client validation)", async () => {
    renderWithProviders(<SignupPage />)
    const form = screen.getByRole("button", { name: /create account/i }).closest("form")
    expect(form).toBeTruthy()
    fireEvent.submit(form!)

    await waitFor(() => {
      expect(screen.getByText(/validation error/i)).toBeInTheDocument()
    })
    expect(screen.getByText(/please fix the errors/i)).toBeInTheDocument()
  })

  it("surfaces server error and maps validationErrors onto fields", async () => {
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      json: async () => ({
        error: "Email taken",
        validationErrors: [{ path: ["email"], message: "Already registered" }],
      }),
    })

    const user = userEvent.setup()
    renderWithProviders(<SignupPage />)

    await user.type(screen.getByPlaceholderText("Full Name"), "Test User")
    await user.type(screen.getByPlaceholderText("Email"), "dup@example.com")
    await user.type(screen.getByPlaceholderText("Phone Number"), "5551234567")
    await user.type(screen.getByPlaceholderText(/^password$/i), "secret12")
    await user.type(screen.getByPlaceholderText("Confirm Password"), "secret12")
    await user.click(screen.getByRole("checkbox"))

    await user.click(screen.getByRole("button", { name: /create account/i }))

    await waitFor(() => {
      expect(screen.getByText(/registration failed/i)).toBeInTheDocument()
    })
    await waitFor(() => {
      expect(screen.getByText("Already registered")).toBeInTheDocument()
    })
  })

  it("shows network error toast when fetch throws", async () => {
    ;(global.fetch as jest.Mock).mockRejectedValue(new Error("offline"))

    const user = userEvent.setup()
    renderWithProviders(<SignupPage />)

    await user.type(screen.getByPlaceholderText("Full Name"), "Test User")
    await user.type(screen.getByPlaceholderText("Email"), "ok@example.com")
    await user.type(screen.getByPlaceholderText("Phone Number"), "5551234567")
    await user.type(screen.getByPlaceholderText(/^password$/i), "secret12")
    await user.type(screen.getByPlaceholderText("Confirm Password"), "secret12")
    await user.click(screen.getByRole("checkbox"))

    await user.click(screen.getByRole("button", { name: /create account/i }))

    await waitFor(() => {
      expect(screen.getByText(/network error/i)).toBeInTheDocument()
    })
  })
})
