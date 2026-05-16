"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { ChevronDown, User, LogOut, Settings, HelpCircle, LayoutDashboard } from "lucide-react"
import { useRouter, usePathname } from "next/navigation"
import { isAuthenticated, getCurrentUserRole, getCurrentUserId, clearTokens, markLogoutSuccessBanner } from "@/lib/api"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { NotificationsDropdown } from "@/components/notifications-dropdown"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface Notification {
  id: string
  type: string
  title: string
  message: string
  isRead: boolean
  createdAt: string
  priority: string
}

export default function Navbar() {
  const [exploreOpen, setExploreOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [userName, setUserName] = useState("Rohan Mondal")
  const [userEmail, setUserEmail] = useState("rohan1.maxx@gmail.com")
  const [userAvatar, setUserAvatar] = useState("")
  const [userRole, setUserRole] = useState<string | null>(null)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (isAuthenticated() && getCurrentUserId()) {
      fetchNotifications()
      fetchUserData()
      setUserRole(getCurrentUserRole())
    }
  }, [])

  const fetchUserData = async () => {
    try {
      const userId = getCurrentUserId()
      if (userId) {
        const response = await fetch(`/api/users/${userId}`)
        if (response.ok) {
          const data = await response.json()
          if (data.user) {
            setUserName(`${data.user.firstName || "Rohan"} ${data.user.lastName || "Mondal"}`)
            setUserEmail(data.user.email || "rohan1.maxx@gmail.com")
            setUserAvatar(data.user.avatar || "")
          }
        }
      }
    } catch (error) {
      console.error("Error fetching user data:", error)
    }
  }

  const fetchNotifications = async () => {
    try {
      const response = await fetch("/api/notifications")
      if (response.ok) {
        const data = await response.json()
        setNotifications(data.notifications)
        setUnreadCount(data.unreadCount)
      }
    } catch (error) {
      console.error("Error fetching notifications:", error)
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

  // Navigation functions - check if already on dashboard page
  const isOnDashboard = pathname?.includes('/dashboard') || pathname?.includes('/speaker-dashboard')
  const isOnSpeakerDashboard = pathname?.includes('/speaker-dashboard')

  const navigateToProfile = () => {
    if (isOnSpeakerDashboard) {
      // Dispatch custom event to communicate with speaker dashboard
      window.dispatchEvent(new CustomEvent('navigateDashboard', { detail: { section: 'myprofile' } }))
    } else if (isOnDashboard) {
      window.dispatchEvent(new CustomEvent('navigateDashboard', { detail: { section: 'info' } }))
    } else {
      // Navigate to appropriate dashboard based on role
      const role = (getCurrentUserRole() || "").toLowerCase()
      if (role === "speaker") {
        router.push(`/speaker-dashboard/${userName.toLowerCase().replace(' ', '-')}`)
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('navigateDashboard', { detail: { section: 'myprofile' } }))
        }, 100)
      } else {
        router.push("/dashboard?section=info")
      }
    }
  }

  const navigateToSettings = () => {
    if (isOnSpeakerDashboard) {
      window.dispatchEvent(new CustomEvent('navigateDashboard', { detail: { section: 'settings' } }))
    } else if (isOnDashboard) {
      window.dispatchEvent(new CustomEvent('navigateDashboard', { detail: { section: 'settings' } }))
    } else {
      const role = (getCurrentUserRole() || "").toLowerCase()
      if (role === "speaker") {
        router.push(`/speaker-dashboard/${userName.toLowerCase().replace(' ', '-')}`)
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('navigateDashboard', { detail: { section: 'settings' } }))
        }, 100)
      } else {
        router.push("/dashboard?section=settings")
      }
    }
  }

  const navigateToDashboard = () => {
    if (isOnSpeakerDashboard) {
      window.dispatchEvent(new CustomEvent('navigateDashboard', { detail: { section: 'overview' } }))
    } else if (isOnDashboard) {
      window.dispatchEvent(new CustomEvent('navigateDashboard', { detail: { section: 'myprofile' } }))
    } else {
      const role = (getCurrentUserRole() || "").toLowerCase()
      if (role === "speaker") {
        router.push(`/speaker-dashboard/${userName.toLowerCase().replace(' ', '-')}`)
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('navigateDashboard', { detail: { section: 'overview' } }))
        }, 100)
      } else {
        router.push("/dashboard?section=myprofile")
      }
    }
  }

  const navigateToHelp = () => {
    if (isOnSpeakerDashboard) {
      window.dispatchEvent(new CustomEvent('navigateDashboard', { detail: { section: 'help' } }))
    } else if (isOnDashboard) {
      window.dispatchEvent(new CustomEvent('navigateDashboard', { detail: { section: 'help' } }))
    } else {
      const role = (getCurrentUserRole() || "").toLowerCase()
      if (role === "speaker") {
        router.push(`/speaker-dashboard/${userName.toLowerCase().replace(' ', '-')}`)
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('navigateDashboard', { detail: { section: 'help' } }))
        }, 100)
      } else {
        router.push("/dashboard?section=help")
      }
    }
  }

  const handleLogout = () => {
    clearTokens()
    router.push("/login")
  }

  const getInitials = () => {
    const nameParts = userName.split(" ")
    if (nameParts.length >= 2) {
      return `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase()
    }
    return userName.charAt(0).toUpperCase()
  }

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-1xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
        <div className="flex justify-between h-20 items-center">
          {/* Left: Logo + Explore */}
          <div className="flex items-center space-x-6">
            <Link href="/" className="inline-block">
              <Image src="/logo/bizlogo.png" alt="BizTradeFairs.com" width={160} height={80} className="h-42 w-auto" />
            </Link>

            <div className="relative">
              {exploreOpen && (
                <div className="absolute left-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                  <ul className="py-1">
                    <li>
                      <Link href="/trade-fairs">
                        <p className="block px-4 py-2 hover:bg-gray-100">Trade Fairs</p>
                      </Link>
                    </li>
                    <li>
                      <Link href="/conferences">
                        <p className="block px-4 py-2 hover:bg-gray-100">Conferences</p>
                      </Link>
                    </li>
                    <li>
                      <Link href="/webinars">
                        <p className="block px-4 py-2 hover:bg-gray-100">Webinars</p>
                      </Link>
                    </li>
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Right: Links + Profile */}
          <div className="flex items-center space-x-6">
            <Link href="/event">
              <p className="text-gray-700 hover:text-gray-900">Top 10 Must Visit</p>
            </Link>
            <Link href="/speakers">
              <p className="text-gray-700 hover:text-gray-900">Speakers</p>
            </Link>
            <p onClick={handleAddevent} className="text-gray-700 hover:text-gray-900 cursor-pointer">
              Add Event
            </p>

            {/* Notifications */}
            {isAuthenticated() && (
              <NotificationsDropdown />
            )}

            {/* Profile Menu with Avatar and Name */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-3 px-3 py-2 rounded-full hover:bg-gray-50 transition-colors focus:outline-none">
                  <Avatar className="w-10 h-10 ring-2 ring-blue-100">
                    <AvatarImage src={userAvatar} alt={userName} />
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-sm font-bold">
                      {getInitials()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden md:block text-left">
                    <p className="text-sm font-semibold text-gray-800">{userName}</p>
                    <p className="text-xs text-gray-500">{userEmail}</p>
                  </div>
                  <ChevronDown className="w-4 h-4 text-gray-500 hidden md:block" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-72" align="end" forceMount>
                {/* User Info Header */}
                <div className="flex items-center gap-3 p-3 border-b">
                  <Avatar className="w-12 h-12 ring-2 ring-blue-100">
                    <AvatarImage src={userAvatar} alt={userName} />
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-base font-bold">
                      {getInitials()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-bold text-gray-800">{userName}</p>
                    <p className="text-xs text-gray-500">{userEmail}</p>
                    {userRole && (
                      <Badge variant="secondary" className="mt-1 text-[10px]">
                        {userRole}
                      </Badge>
                    )}
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
          </div>
        </div>
      </div>
    </nav>
  )
}