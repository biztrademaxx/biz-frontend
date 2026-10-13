"use client"

import { useEffect, useState } from "react"
import {
  User,
  LogOut,
  Settings,
  HelpCircle,
  LayoutDashboard,
  ChevronDown,
} from "lucide-react"
import { useRouter, usePathname } from "next/navigation"
import {
  isAuthenticated,
  getCurrentUserRole,
  getCurrentUserId,
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
import { Badge } from "@/components/ui/badge"
import { NotificationsDropdown } from "@/components/notifications-dropdown"
import { DashboardResponsiveNavbar } from "@/components/dashboard-responsive-navbar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

// const EXPLORE_LINKS = [
//   { href: "/trade-fairs", label: "Trade Fairs" },
//   { href: "/conferences", label: "Conferences" },
//   { href: "/webinars", label: "Webinars" },
// ]

export default function Navbar() {
  const [userName, setUserName] = useState("Speaker")
  const [userEmail, setUserEmail] = useState("")
  const [userAvatar, setUserAvatar] = useState("")
  const [userRole, setUserRole] = useState<string | null>(null)
  const [hydrated, setHydrated] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (!hydrated) return
    if (isAuthenticated() && getCurrentUserId()) {
      void fetchUserData()
      setUserRole(getCurrentUserRole())
    }
  }, [hydrated])

  const fetchUserData = async () => {
    try {
      const userId = getCurrentUserId()
      if (!userId) return
      const response = await fetch(`/api/users/${userId}`)
      if (!response.ok) return
      const data = await response.json()
      if (data.user) {
        setUserName(`${data.user.firstName || "Speaker"} ${data.user.lastName || ""}`.trim())
        setUserEmail(data.user.email || "")
        setUserAvatar(data.user.avatar || "")
      }
    } catch (error) {
      console.error("Error fetching user data:", error)
    }
  }

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

  const isOnDashboard = pathname?.includes("/dashboard") || pathname?.includes("/speaker-dashboard")
  const isOnSpeakerDashboard = pathname?.includes("/speaker-dashboard")
  const authenticated = hydrated && isAuthenticated()

  const dispatchSection = (section: string) => {
    window.dispatchEvent(new CustomEvent("navigateDashboard", { detail: { section } }))
  }

  const navigateToProfile = () => {
    if (isOnSpeakerDashboard) dispatchSection("myprofile")
    else if (isOnDashboard) dispatchSection("info")
    else router.push("/dashboard?section=info")
  }

  const navigateToSettings = () => {
    if (isOnSpeakerDashboard || isOnDashboard) dispatchSection("settings")
    else router.push("/dashboard?section=settings")
  }

  const navigateToDashboard = () => {
    if (isOnSpeakerDashboard) dispatchSection("overview")
    else if (isOnDashboard) dispatchSection("myprofile")
    else router.push("/dashboard?section=myprofile")
  }

  const navigateToHelp = () => {
    if (isOnSpeakerDashboard || isOnDashboard) dispatchSection("help")
    else router.push("/dashboard?section=help")
  }

  const handleLogout = () => {
    markLogoutSuccessBanner()
    clearTokens()
    router.push("/login")
  }

  const getInitials = () => {
    const nameParts = userName.split(" ").filter(Boolean)
    if (nameParts.length >= 2) {
      return `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase()
    }
    return userName.charAt(0).toUpperCase()
  }

  return (
    <DashboardResponsiveNavbar
      // exploreLinks={EXPLORE_LINKS}
      onAddEvent={handleAddevent}
      actions={
        <>
          {authenticated ? <NotificationsDropdown /> : null}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="flex max-w-[min(52vw,200px)] items-center gap-2 rounded-full px-1 py-1 transition-colors hover:bg-gray-50 focus:outline-none sm:gap-3 sm:px-2"
                aria-label="Account menu"
              >
                <Avatar className="h-9 w-9 shrink-0 ring-2 ring-blue-100 sm:h-10 sm:w-10">
                  <AvatarImage src={userAvatar} alt={userName} />
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-sm font-bold text-white">
                    {getInitials()}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden min-w-0 text-left md:block">
                  <p className="truncate text-sm font-semibold text-gray-800">{userName}</p>
                  {userEmail ? <p className="truncate text-xs text-gray-500">{userEmail}</p> : null}
                </div>
                <ChevronDown className="hidden h-4 w-4 shrink-0 text-gray-500 md:block" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-72" align="end" forceMount>
              <div className="flex items-center gap-3 border-b p-3">
                <Avatar className="h-12 w-12 ring-2 ring-blue-100">
                  <AvatarImage src={userAvatar} alt={userName} />
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-base font-bold text-white">
                    {getInitials()}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-gray-800">{userName}</p>
                  {userEmail ? <p className="truncate text-xs text-gray-500">{userEmail}</p> : null}
                  {userRole ? (
                    <Badge variant="secondary" className="mt-1 text-[10px]">
                      {userRole}
                    </Badge>
                  ) : null}
                </div>
              </div>

              <DropdownMenuItem onClick={navigateToDashboard} className="cursor-pointer py-2.5">
                <LayoutDashboard className="mr-3 h-4 w-4 text-blue-500" />
                <span>Dashboard</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={navigateToProfile} className="cursor-pointer py-2.5">
                <User className="mr-3 h-4 w-4 text-gray-500" />
                <span>My Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={navigateToSettings} className="cursor-pointer py-2.5">
                <Settings className="mr-3 h-4 w-4 text-gray-500" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={navigateToHelp} className="cursor-pointer py-2.5">
                <HelpCircle className="mr-3 h-4 w-4 text-gray-500" />
                <span>Help & Support</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="cursor-pointer py-2.5">
                <LogOut className="mr-2 h-4 w-4 text-red-500" />
                <span className="text-red-600">Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </>
      }
    />
  )
}
