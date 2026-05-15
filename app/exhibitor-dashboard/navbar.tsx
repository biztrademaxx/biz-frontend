"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { ChevronDown, User, LogOut, Settings, Bell } from "lucide-react"
import { useRouter } from "next/navigation"
import { isAuthenticated, getCurrentUserRole, clearTokens } from "@/lib/api"
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
  imageUrl?: string
  actionUrl?: string
}

export default function Navbar() {
  const [exploreOpen, setExploreOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const router = useRouter()
  const { setActiveSection } = useDashboard()

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
    <nav className="border-b border-white/50 bg-white/45 shadow-[0_4px_24px_rgba(71,118,230,0.06)] backdrop-blur-md">
      <div className="max-w-1xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
        <div className="flex justify-between h-20 items-center">
          {/* Left: Logo + Explore */}
          <div className="flex items-center space-x-6">
            <Link href="/" className="inline-block">
              <Image src="/logo/bizlogo.png" alt="BizTradeFairs.com" width={160} height={80} className="h-42 w-auto" />
            </Link>

            <div className="relative">
              <button
                onClick={toggleExplore}
                className="flex items-center text-slate-700 hover:text-[#4776E6] focus:outline-none"
              >
                <span>Explore</span>
                <ChevronDown className="w-4 h-4 ml-1" />
              </button>

              {exploreOpen && (
                <div className="absolute left-0 z-10 mt-2 w-48 rounded-md border border-white/60 bg-white/80 shadow-lg backdrop-blur-md">
                  <ul className="py-1">
                    <li>
                      <Link href="/trade-fairs">
                        <p className="block px-4 py-2 hover:bg-[#4776E6]/10">Trade Fairs</p>
                      </Link>
                    </li>
                    <li>
                      <Link href="/conferences">
                        <p className="block px-4 py-2 hover:bg-[#4776E6]/10">Conferences</p>
                      </Link>
                    </li>
                    <li>
                      <Link href="/webinars">
                        <p className="block px-4 py-2 hover:bg-[#4776E6]/10">Webinars</p>
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
              <p className="text-slate-700 hover:text-[#4776E6]">Top 10 Must Visit</p>
            </Link>
            <Link href="/speakers">
              <p className="text-slate-700 hover:text-[#4776E6]">Speakers</p>
            </Link>
            <p onClick={handleAddevent} className="cursor-pointer text-slate-700 hover:text-[#4776E6]">
              Add Event
            </p>

            {/* Replace the old notification dropdown with the new component */}
            <NotificationsDropdown />

            {/* Profile Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 rounded-full bg-[#4776E6] p-2 text-white transition-colors hover:bg-[#3556b8] focus:outline-none">
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