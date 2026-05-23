"use client"

import { User, LogOut, Settings, ChevronDown } from "lucide-react"
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
import { NotificationsDropdown } from "@/components/notifications-dropdown"
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
    if (role === "VENUE_MANAGER" || role === "venue_manager") {
      router.push("/venue-dashboard")
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
      navClassName="sticky top-0 z-40 border-b border-violet-100/40 bg-white/65 shadow-[0_10px_36px_-16px_rgba(138,112,214,0.12)] backdrop-blur-xl"
      exploreLinks={EXPLORE_LINKS}
      onAddEvent={handleAddevent}
      actions={
        <>
          <NotificationsDropdown />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="flex items-center gap-2 rounded-full bg-gradient-to-r from-violet-600 to-sky-500 p-2 text-white shadow-md shadow-violet-500/25 transition-all hover:from-violet-500 hover:to-sky-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 focus-visible:ring-offset-2"
                aria-label="Account menu"
              >
                <User className="h-4 w-4" />
                <ChevronDown className="hidden h-3 w-3 sm:block" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuItem onClick={() => setActiveSection("venue-profile")}>
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
