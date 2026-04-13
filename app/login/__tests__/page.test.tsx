import { screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"

import LoginPage from "@/app/login/page"
import * as api from "@/lib/api"
import { renderWithProviders } from "@/test/test-utils"

const push = jest.fn()

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push, replace: jest.fn(), prefetch: jest.fn() }),
}))

jest.mock("next-auth/react", () => ({
  signIn: jest.fn().mockResolvedValue(undefined),
}))

jest.mock("@/lib/api", () => ({
  loginWithEmailPassword: jest.fn(),
}))

const loginWithEmailPassword = api.loginWithEmailPassword as jest.MockedFunction<
  typeof api.loginWithEmailPassword
>

describe("LoginPage", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("redirects attendee to /dashboard/:id after successful credential login", async () => {
    const user = userEvent.setup()
    loginWithEmailPassword.mockResolvedValue({
      user: { role: "ATTENDEE", sub: "user-42" },
      accessToken: "a",
      refreshToken: "r",
    } as Awaited<ReturnType<typeof api.loginWithEmailPassword>>)

    renderWithProviders(<LoginPage />)

    await user.type(screen.getByPlaceholderText("Email"), "a@b.com")
    await user.type(screen.getByPlaceholderText("Password"), "Secret1a")
    await user.click(screen.getByRole("button", { name: /^sign in$/i }))

    await waitFor(() => {
      expect(loginWithEmailPassword).toHaveBeenCalledWith("a@b.com", "Secret1a")
    })
    await waitFor(() => expect(push).toHaveBeenCalledWith("/dashboard/user-42"))
  })

  it("redirects organizer to organizer dashboard", async () => {
    const user = userEvent.setup()
    loginWithEmailPassword.mockResolvedValue({
      user: { role: "ORGANIZER", id: "org-9" },
      accessToken: "a",
      refreshToken: "r",
    } as Awaited<ReturnType<typeof api.loginWithEmailPassword>>)

    renderWithProviders(<LoginPage />)
    await user.type(screen.getByPlaceholderText("Email"), "o@b.com")
    await user.type(screen.getByPlaceholderText("Password"), "Secret1a")
    await user.click(screen.getByRole("button", { name: /^sign in$/i }))

    await waitFor(() => expect(push).toHaveBeenCalledWith("/organizer-dashboard/org-9"))
  })

  it("shows error message when loginWithEmailPassword rejects", async () => {
    const user = userEvent.setup()
    loginWithEmailPassword.mockRejectedValue(new Error("Invalid email or password"))

    renderWithProviders(<LoginPage />)
    await user.type(screen.getByPlaceholderText("Email"), "x@y.com")
    await user.type(screen.getByPlaceholderText("Password"), "wrong")
    await user.click(screen.getByRole("button", { name: /^sign in$/i }))

    await waitFor(() => {
      expect(screen.getByText(/invalid email or password/i)).toBeInTheDocument()
    })
    expect(push).not.toHaveBeenCalled()
  })
})
