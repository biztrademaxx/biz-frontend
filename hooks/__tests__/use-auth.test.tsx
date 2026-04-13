import { renderHook, waitFor } from "@testing-library/react"

import * as api from "@/lib/api"
import { useAuth } from "@/hooks/use-auth"

const replace = jest.fn()

jest.mock("next/navigation", () => ({
  useRouter: () => ({ replace }),
  usePathname: () => "/dashboard",
}))

jest.mock("@/lib/api", () => ({
  getAccessToken: jest.fn(),
  getCurrentUserId: jest.fn(),
  getCurrentUserRole: jest.fn(),
  getCurrentUserPermissions: jest.fn(),
  isAuthenticated: jest.fn(),
  clearTokens: jest.fn(),
}))

const getAccessToken = api.getAccessToken as jest.MockedFunction<typeof api.getAccessToken>
const getCurrentUserRole = api.getCurrentUserRole as jest.MockedFunction<
  typeof api.getCurrentUserRole
>
const clearTokens = api.clearTokens as jest.MockedFunction<typeof api.clearTokens>

describe("useAuth", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    getAccessToken.mockReturnValue(null)
    ;(api.getCurrentUserId as jest.Mock).mockReturnValue(null)
    getCurrentUserRole.mockReturnValue(null)
    ;(api.getCurrentUserPermissions as jest.Mock).mockReturnValue([])
  })

  it("does not redirect when requireAuth is false", async () => {
    getAccessToken.mockReturnValue(null)
    const { result } = renderHook(() => useAuth({ requireAuth: false }))
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(replace).not.toHaveBeenCalled()
    expect(result.current.authenticated).toBe(false)
  })

  it("redirects to /login when requireAuth and no token", async () => {
    getAccessToken.mockReturnValue(null)
    const { result } = renderHook(() => useAuth({ requireAuth: true }))
    await waitFor(() => expect(result.current.loading).toBe(false))
    await waitFor(() => expect(replace).toHaveBeenCalledWith("/login"))
    expect(result.current.authenticated).toBe(false)
  })

  it("redirects when role is not allowed", async () => {
    getAccessToken.mockReturnValue("header.payload.sig")
    getCurrentUserRole.mockReturnValue("ATTENDEE")
    const { result } = renderHook(() =>
      useAuth({ requireAuth: true, allowedRoles: ["ORGANIZER"] })
    )
    await waitFor(() => expect(result.current.loading).toBe(false))
    await waitFor(() => expect(replace).toHaveBeenCalledWith("/login"))
    expect(result.current.authenticated).toBe(true)
  })

  it("logout clears tokens and redirects", async () => {
    getAccessToken.mockReturnValue("tok")
    const { result } = renderHook(() => useAuth({ requireAuth: false }))
    await waitFor(() => expect(result.current.loading).toBe(false))
    result.current.logout()
    expect(clearTokens).toHaveBeenCalled()
    expect(replace).toHaveBeenCalledWith("/login")
  })
})
