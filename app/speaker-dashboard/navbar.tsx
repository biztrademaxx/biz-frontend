"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { ChevronDown, User, LogOut, Settings } from "lucide-react"
import { useRouter } from "next/navigation"
import { isAuthenticated, getCurrentUserRole, getCurrentUserId, clearTokens } from "@/lib/api"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useDashboard } from "@/contexts/dashboard-context"
import { NotificationsDropdown } from "@/components/notifications-dropdown"

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
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const router = useRouter()
  const { setActiveSection } = useDashboard()

  useEffect(() => {
    if (isAuthenticated() && getCurrentUserId()) {
      fetchNotifications()
    }
  }, [])

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

  const markAsRead = async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isRead: true }),
      })

      if (response.ok) {
        // Update local state
        setNotifications((prev) =>
          prev.map((notif) => (notif.id === notificationId ? { ...notif, isRead: true } : notif)),
        )
        setUnreadCount((prev) => Math.max(0, prev - 1))
      }
    } catch (error) {
      console.error("Error marking notification as read:", error)
    }
  }

  const markAllAsRead = async () => {
    try {
      const response = await fetch("/api/notifications/mark-all-read", {
        method: "POST",
      })

      if (response.ok) {
        setNotifications((prev) => prev.map((notif) => ({ ...notif, isRead: true })))
        setUnreadCount(0)
      }
    } catch (error) {
      console.error("Error marking all as read:", error)
    }
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (seconds < 60) return "Just now"
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
    return `${Math.floor(seconds / 86400)}d ago`
  }

  const toggleExplore = () => setExploreOpen((prev) => !prev)

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
        clearTokens()
        router.push("/login")
      }
    }
  }

  // Navigation functions using dashboard context
  const navigateToProfile = () => {
    setActiveSection("info")
  }

  const navigateToSettings = () => {
    setActiveSection("settings")
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
              {/* <button
                onClick={toggleExplore}
                className="flex items-center text-gray-700 hover:text-gray-900 focus:outline-none"
              >
                <span>Explore</span>
                <ChevronDown className="w-4 h-4 ml-1" />
              </button> */}

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

            {/* Show both notification systems if you want to keep both */}
            {isAuthenticated() && (
              <>
                {/* Push Notifications Dropdown (from super admin) */}
                <NotificationsDropdown />

                {/* Optional: Keep your existing system notifications if needed */}
                {/* Uncomment if you want both */}
                {/*
                <DropdownMenu open={notificationsOpen} onOpenChange={setNotificationsOpen}>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="relative">
                      <Bell className="w-5 h-5" />
                      {unreadCount > 0 && (
                        <Badge
                          variant="destructive"
                          className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                        >
                          {unreadCount > 9 ? "9+" : unreadCount}
                        </Badge>
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-80" align="end" forceMount>
                    <div className="flex items-center justify-between p-4 border-b">
                      <h3 className="font-semibold">System Notifications</h3>
                      {unreadCount > 0 && (
                        <Button variant="ghost" size="sm" onClick={markAllAsRead} className="text-xs h-auto p-1">
                          Mark all read
                        </Button>
                      )}
                    </div>
                    <ScrollArea className="h-[400px]">
                      {notifications.length === 0 ? (
                        <div className="p-4 text-center text-muted-foreground">No notifications</div>
                      ) : (
                        notifications.map((notification) => (
                          <div
                            key={notification.id}
                            className={`p-4 border-b hover:bg-accent cursor-pointer transition-colors ${
                              !notification.isRead ? "bg-blue-50" : ""
                            }`}
                            onClick={() => {
                              if (!notification.isRead) {
                                markAsRead(notification.id)
                              }
                            }}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <h4 className="text-sm font-medium truncate">{notification.title}</h4>
                                  {!notification.isRead && (
                                    <span className="h-2 w-2 rounded-full bg-blue-600 flex-shrink-0" />
                                  )}
                                </div>
                                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{notification.message}</p>
                                <span className="text-xs text-muted-foreground mt-1 block">
                                  {formatTimeAgo(notification.createdAt)}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </ScrollArea>
                  </DropdownMenuContent>
                </DropdownMenu>
                */}
              </>
            )}

            {/* Profile Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 p-2 rounded-full bg-[#002C71] text-white hover:bg-blue-800 focus:outline-none transition-colors">
                  <User className="w-4 h-4" />
                  <ChevronDown className="w-3 h-3" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuItem onClick={navigateToProfile}>
                  <User className="mr-2 h-4 w-4" />
                  <span>My Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={navigateToSettings}>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => { clearTokens(); router.push("/login"); }}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </nav>
  )
}