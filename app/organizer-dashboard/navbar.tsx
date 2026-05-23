"use client"

import { User, LogOut, Settings } from "lucide-react"
import { useRouter } from "next/navigation"
import { isAuthenticated, getCurrentUserRole, clearTokens, markLogoutSuccessBanner } from "@/lib/api"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useDashboard } from "@/contexts/dashboard-context"
import { UserNotificationsDropdown } from "@/components/organizerNotificationDropdown"
import { DashboardResponsiveNavbar } from "@/components/dashboard-responsive-navbar"

const EXPLORE_LINKS = [
  { href: "/trade-fairs", label: "Trade Fairs" },
  { href: "/conferences", label: "Conferences" },
  { href: "/webinars", label: "Webinars" },
]

export default function Navbar() {
  const router = useRouter()
  const { setActiveSection } = useDashboard()

  const handleAddevent = () => {
    if (!isAuthenticated()) {
      alert("You are not logged in. Please login as an organizer.")
      router.push("/login")
      return
    }
    const role = getCurrentUserRole()
    if (role === "ORGANIZER" || role === "organizer") {
      router.push("/organizer-dashboard")
    } else {
      const confirmed = window.confirm(
        `You are logged in as '${role ?? "user"}'.\n\nPlease login as an organizer to access this page.\n\nClick OK to logout and login as an organizer, or Cancel to stay logged in.`,
      )
      if (confirmed) {
        markLogoutSuccessBanner()
        clearTokens()
        router.push("/login")
      }
    }
  }

  const handleLogout = () => {
    markLogoutSuccessBanner()
    clearTokens()
    router.push("/login")
  }

  return (
    <DashboardResponsiveNavbar
      exploreLinks={EXPLORE_LINKS}
      onAddEvent={handleAddevent}
      actions={
        <>
          <UserNotificationsDropdown />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="flex items-center gap-2 rounded-full bg-gradient-to-r from-[#4776E6] to-[#8E54E9] p-2 text-white transition-opacity hover:opacity-95 focus:outline-none"
                aria-label="Account menu"
              >
                <User className="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuItem onClick={() => setActiveSection("info")}>
                <User className="mr-2 h-4 w-4" />
                <span>My Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setActiveSection("settings")}>
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </>
      }
    />
  )
}
