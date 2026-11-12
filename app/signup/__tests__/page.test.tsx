import { fireEvent, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"

import SignupPage from "@/app/signup/page"
import { renderWithProviders } from "@/test/test-utils"

const push = jest.fn()
const searchParams = new URLSearchParams()

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push, replace: jest.fn(), prefetch: jest.fn() }),
  useSearchParams: () => searchParams,
}))

jest.mock("next-auth/react", () => ({
  signIn: jest.fn().mockResolvedValue(undefined),
}))

let fetchMock: jest.Mock
const response = (ok: boolean, data: object = {}) => ({ ok, json: async () => data })

async function fillProfile(user: ReturnType<typeof userEvent.setup>, email = "test@example.com") {
  await user.type(screen.getByPlaceholderText("Full Name"), "Test User")
  await user.type(screen.getByPlaceholderText("Email"), email)
  await user.type(screen.getByPlaceholderText("Phone Number"), "5551234567")
}

async function reachPasswordStep(user: ReturnType<typeof userEvent.setup>, email = "test@example.com") {
  await fillProfile(user, email)
  await user.click(screen.getByRole("button", { name: /^continue$/i }))
  await user.type(await screen.findByPlaceholderText("Enter OTP"), "246810")
  await user.click(screen.getByRole("button", { name: /^verify otp$/i }))
  await screen.findByPlaceholderText("Create Password")

  expect(fetchMock).toHaveBeenNthCalledWith(1, expect.stringMatching(/\/api\/auth\/send-otp$/), expect.objectContaining({
    method: "POST", body: JSON.stringify({ email }),
  }))
  expect(fetchMock).toHaveBeenNthCalledWith(2, expect.stringMatching(/\/api\/auth\/verify-otp$/), expect.objectContaining({
    method: "POST", body: JSON.stringify({ email, otp: "246810" }),
  }))
}

async function submitPassword(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByPlaceholderText("Create Password"), "secret12")
  await user.type(screen.getByPlaceholderText("Confirm Password"), "secret12")
  await user.click(screen.getByRole("checkbox"))
  await user.click(screen.getByRole("button", { name: /^create account$/i }))
}

describe("SignupPage", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    fetchMock = jest.fn().mockRejectedValue(new Error("Unexpected request"))
    global.fetch = fetchMock
  })

  it("shows validation errors without requesting OTP when the profile is empty", async () => {
    renderWithProviders(<SignupPage />)
    const form = screen.getByRole("button", { name: /^continue$/i }).closest("form")
    expect(form).toBeTruthy()
    fireEvent.submit(form!)

    expect(await screen.findByText(/validation error/i)).toBeInTheDocument()
    expect(screen.getByText(/please fix the errors/i)).toBeInTheDocument()
    expect(screen.getByText("Full name is required")).toBeInTheDocument()
    expect(screen.getByText("Email is required")).toBeInTheDocument()
    expect(screen.getByText("Phone number is required")).toBeInTheDocument()
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it("returns to the profile and displays server field errors after registration fails", async () => {
    fetchMock
      .mockResolvedValueOnce(response(true))
      .mockResolvedValueOnce(response(true))
      .mockResolvedValueOnce(response(false, {
        error: "Email taken",
        validationErrors: [{ path: ["email"], message: "Already registered" }],
      }))

    const user = userEvent.setup()
    renderWithProviders(<SignupPage />)
    await reachPasswordStep(user, "dup@example.com")
    await submitPassword(user)

    expect(await screen.findByText(/registration failed/i)).toBeInTheDocument()
    expect(screen.getByText("Already registered")).toBeInTheDocument()
    expect(screen.getByPlaceholderText("Email")).toHaveValue("dup@example.com")
    expect(screen.queryByPlaceholderText("Create Password")).not.toBeInTheDocument()
    expect(push).not.toHaveBeenCalled()
  })

  it("keeps the password step available when the registration request fails", async () => {
    fetchMock
      .mockResolvedValueOnce(response(true))
      .mockResolvedValueOnce(response(true))
      .mockRejectedValueOnce(new Error("offline"))

    const user = userEvent.setup()
    renderWithProviders(<SignupPage />)
    await reachPasswordStep(user)
    await submitPassword(user)

    expect(await screen.findByText("Something went wrong during registration")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /^create account$/i })).toBeEnabled()
    expect(push).not.toHaveBeenCalled()
  })

  it("shows the server error and keeps the profile editable when sending OTP fails", async () => {
    fetchMock.mockResolvedValueOnce(response(false, { message: "Unable to send code" }))
    const user = userEvent.setup()
    renderWithProviders(<SignupPage />)
    await fillProfile(user)
    await user.click(screen.getByRole("button", { name: /^continue$/i }))

    expect(await screen.findByText("Unable to send code")).toBeInTheDocument()
    expect(screen.getByPlaceholderText("Email")).toBeEnabled()
    expect(screen.queryByPlaceholderText("Enter OTP")).not.toBeInTheDocument()
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it("does not allow password creation when the OTP is rejected", async () => {
    fetchMock
      .mockResolvedValueOnce(response(true))
      .mockResolvedValueOnce(response(false, { message: "Code has expired" }))
    const user = userEvent.setup()
    renderWithProviders(<SignupPage />)
    await fillProfile(user)
    await user.click(screen.getByRole("button", { name: /^continue$/i }))
    await user.type(await screen.findByPlaceholderText("Enter OTP"), "246810")
    await user.click(screen.getByRole("button", { name: /^verify otp$/i }))

    expect(await screen.findByText("Code has expired")).toBeInTheDocument()
    expect(screen.queryByPlaceholderText("Create Password")).not.toBeInTheDocument()
    expect(screen.getByRole("button", { name: /^verify otp$/i })).toBeEnabled()
  })

  it("registers and redirects to login after successful OTP verification", async () => {
    fetchMock
      .mockResolvedValueOnce(response(true))
      .mockResolvedValueOnce(response(true))
      .mockResolvedValueOnce(response(true, { message: "Account created successfully" }))

    const user = userEvent.setup()
    renderWithProviders(<SignupPage />)
    await reachPasswordStep(user)
    await submitPassword(user)

    expect(await screen.findByText("Account created successfully")).toBeInTheDocument()
    expect(fetchMock).toHaveBeenNthCalledWith(3, expect.stringMatching(/\/api\/auth\/register$/), expect.objectContaining({
      method: "POST",
      body: JSON.stringify({
        fullName: "Test User", email: "test@example.com", password: "secret12",
        phone: "5551234567", companyName: "", designation: "", website: "",
        userType: "visitor", selectedPlan: null,
      }),
    }))
    await waitFor(() => expect(push).toHaveBeenCalledWith("/login"), { timeout: 2000 })
  })
})
