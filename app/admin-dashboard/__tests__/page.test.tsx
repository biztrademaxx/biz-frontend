import { screen, waitFor } from "@testing-library/react"

import AdminDashboardPage from "@/app/admin-dashboard/page"
import { useAuth } from "@/hooks/use-auth"
import { renderWithProviders } from "@/test/test-utils"

const replace = jest.fn()

jest.mock("next/navigation", () => ({
  useRouter: () => ({ replace }),
}))

jest.mock("@/hooks/use-auth", () => ({
  useAuth: jest.fn(),
}))

jest.mock("@/app/admin-dashboard/sidebar", () => ({
  __esModule: true,
  default: ({ userRole }: { userRole: string }) => (
    <aside data-testid="admin-sidebar">{userRole}</aside>
  ),
}))

jest.mock("@/app/admin-dashboard/navbar", () => ({
  __esModule: true,
  default: () => <header data-testid="admin-navbar" />,
}))

const useAuthMock = useAuth as jest.MockedFunction<typeof useAuth>

describe("AdminDashboardPage", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("shows loading shell while auth is resolving", () => {
    useAuthMock.mockReturnValue({
      role: null,
      permissions: [],
      loading: true,
      logout: jest.fn(),
      token: null,
      userId: null,
      authenticated: false,
    } as ReturnType<typeof useAuth>)

    renderWithProviders(<AdminDashboardPage />)
    expect(screen.getByText(/loading admin dashboard/i)).toBeInTheDocument()
    expect(screen.queryByTestId("admin-sidebar")).not.toBeInTheDocument()
  })

  it("renders super-admin shell when authorized", async () => {
    useAuthMock.mockReturnValue({
      role: "SUPER_ADMIN",
      permissions: ["events.read"],
      loading: false,
      logout: jest.fn(),
      token: "t",
      userId: "a1",
      authenticated: true,
    } as ReturnType<typeof useAuth>)

    renderWithProviders(<AdminDashboardPage />)

    await waitFor(() => {
      expect(screen.getByTestId("admin-sidebar")).toHaveTextContent("SUPER_ADMIN")
    })
    expect(screen.getByTestId("admin-navbar")).toBeInTheDocument()
    expect(replace).not.toHaveBeenCalled()
    expect(useAuthMock).toHaveBeenCalledWith({
      requireAuth: true,
      allowedRoles: ["SUPER_ADMIN", "SUB_ADMIN"],
    })
  })

  it("redirects sub-admins to their dedicated dashboard", async () => {
    useAuthMock.mockReturnValue({
      role: "SUB_ADMIN",
      permissions: [],
      loading: false,
      logout: jest.fn(),
      token: "t",
      userId: "s1",
      authenticated: true,
    } as ReturnType<typeof useAuth>)

    renderWithProviders(<AdminDashboardPage />)

    await waitFor(() => {
      expect(replace).toHaveBeenCalledWith("/sub-admin/dashboard")
    })
  })
})
