"use client"

import { useEffect, useState } from "react"
import { User, LogOut, Settings, ChevronDown } from "lucide-react"
import { useRouter } from "next/navigation"
import {
  isAuthenticated,
  getCurrentUserRole,
  getCurrentUserDisplayName,
  getCurrentUserEmail,
  clearTokens,
  markLogoutSuccessBanner,
} from "@/lib/api"
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

//  const EXPLORE_LINKS = [
//   { href: "/trade-fairs", label: "Trade Fairs" },
//   { href: "/conferences", label: "Conferences" },
//   { href: "/webinars", label: "Webinars" },
// ]

export default function Navbar() {
  const router = useRouter()
  const { setActiveSection } = useDashboard()

  // Guard against SSR/CSR mismatch — only read auth-derived display info
  // once mounted on the client.
  const [hydrated, setHydrated] = useState(false)
  useEffect(() => {
    setHydrated(true)
  }, [])

  const displayName = hydrated ? getCurrentUserDisplayName() : ""
  const userEmail = hydrated ? getCurrentUserEmail() : ""

  const initials = hydrated
    ? (displayName || userEmail || "U")
      .trim()
      .split(/\s+/)
      .map((word) => word[0])
      .join("")
      .substring(0, 2)
      .toUpperCase()
    : "U"

  const handleAddevent = () => {
    if (!isAuthenticated()) {
      alert("You are not logged in. Please login as an organizer.")
      router.push("/login")
      return
    }
    const role = (getCurrentUserRole() || "").toLowerCase()
    if (role === "organizer") {
      router.push("/organizer-dashboard")
    } else {
      const confirmed = window.confirm(
        `You are logged in as '${role}'.\n\nPlease login as an organizer to access this page.\n\nClick OK to logout and login as an organizer, or Cancel to stay logged in.`,
      )
      if (confirmed) {
        markLogoutSuccessBanner()
        clearTokens()
        router.push("/login")
      }
    }
  }

  return (
    <DashboardResponsiveNavbar
      navClassName="border-b border-slate-200 bg-white shadow-sm sticky top-0 z-50 shrink-0"
      // exploreLinks={EXPLORE_LINKS}
      onAddEvent={handleAddevent}
      actions={
        <>
          <NotificationsDropdown />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-[#004A96] text-sm font-semibold text-white transition-colors hover:bg-[#003d7a] focus:outline-none"
                aria-label="Account menu"
              >
                {initials}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <div className="border-b border-gray-100 px-3 py-2">
                <p className="truncate text-sm font-semibold text-gray-900">{displayName}</p>
                {userEmail ? <p className="truncate text-xs text-gray-500">{userEmail}</p> : null}
              </div>
              <DropdownMenuItem onClick={() => setActiveSection("info")}>
                <User className="mr-2 h-4 w-4" />
                <span>My Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setActiveSection("settings")}>
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  markLogoutSuccessBanner()
                  clearTokens()
                  router.push("/login")
                }}
              >
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