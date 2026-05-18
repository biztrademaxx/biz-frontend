"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/use-auth"
import { apiFetch, clearTokens, markLogoutSuccessBanner } from "@/lib/api"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Loader2,
  ChevronDown,
  ChevronRight,
  LayoutDashboard,
  Calendar,
  Network,
  Settings,
  LogOut,
  SidebarIcon,
  Store,
  HelpCircle,
  List,
  Menu,
  Bell,
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"

import { ProfileSection } from "./profile-section"
import { EventsSection } from "./events-section"
import { ConnectionsSection } from "./connections-section"
import MessagesSection from "@/app/organizer-dashboard/messages-center"
import { VisitorSettings } from "./settings-section"
import type { UserData } from "@/types/user"
import TravelAccommodation from "./TravelAccommodation"
import { PastEvents } from "./PastEvents"
import { SavedEvents } from "./SavedEvents"
import { UpcomingEvents } from "./UpcomingEvents"
import { MyAppointments } from "./my-appointments"
import { ExhibitorSchedule } from "./ExhibitorSchedule"
import { Favourites } from "./Favourites"
import { Recommendations } from "./Recommendations"
import RecommendedEvents from "./recommended-events"
import Schedule from "./Schedule"
import { HelpSupport } from "@/components/HelpSupport"
import { useDashboard } from "@/contexts/dashboard-context"
import { DashboardManagedBanner } from "@/components/dashboard-managed-banner"
import { cn } from "@/lib/utils"

const VISITOR_ACCENT = "#FF131C"

function visitorGreeting(): string {
  const h = new Date().getHours()
  if (h < 12) return "Good morning"
  if (h < 17) return "Good afternoon"
  return "Good evening"
}

interface UserDashboardProps {
  userId: string
}

export function UserDashboard({ userId }: UserDashboardProps) {
  const { userId: authUserId, loading: authLoading } = useAuth({ requireAuth: true })
  const router = useRouter()
  const { toast } = useToast()
  const { activeSection, setActiveSection } = useDashboard()

  const [openMenus, setOpenMenus] = useState<string[]>(["dashboard"])
  const [userData, setUserData] = useState<UserData | null>(null)
  const [userInterests, setUserInterests] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)
  const [interestedEvents, setInterestedEvents] = useState<any[]>([])

  useEffect(() => {
    if (authLoading || !userId) return

    fetchUserData()
    fetchInterestedEvents()
  }, [authLoading, userId])

  // Close mobile sidebar when switching sections
  useEffect(() => {
    if (isMobileSidebarOpen) {
      setIsMobileSidebarOpen(false)
    }
  }, [activeSection])

  const fetchUserData = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await apiFetch<{ user?: UserData; data?: UserData }>(`/api/users/${userId}`, { auth: true })
      const user = data?.user ?? data?.data
      if (!user) {
        throw new Error("User data not found")
      }
      setUserData(user as UserData)
      setUserInterests((user as UserData).interests || [])
    } catch (err) {
      console.error("Error fetching user data:", err)
      setError(err instanceof Error ? err.message : "Error loading user data")
      
      toast({
        title: "Error",
        description: "Failed to load user data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchInterestedEvents = async () => {
    try {
      const data = await apiFetch<{ events?: any[]; data?: any[] }>(`/api/users/${userId}/interested-events`, { auth: true })
      const list = data.events ?? data.data ?? []
      // Ensure unique events to prevent duplicate key errors
      const uniqueEvents = Array.isArray(list)
        ? list.filter((event: any, index: number, self: any[]) =>
            index === self.findIndex((e: any) => e.id === event.id)
          )
        : []
        
      setInterestedEvents(uniqueEvents)
    } catch (err) {
      console.error("Error fetching interested events:", err)
      // Don't show toast for this as it's secondary data
    }
  }

  const handleProfileUpdate = (updatedUser: Partial<UserData>) => {
    setUserData((prev) => {
      if (!prev) return updatedUser as UserData
      return { ...prev, ...updatedUser }
    })

    if (updatedUser.interests) {
      setUserInterests(updatedUser.interests)
    }

    toast({
      title: "Profile Updated",
      description: "Your profile has been successfully updated.",
    })
  }

  const toggleMenu = (menu: string) => {
    setOpenMenus((prev) => 
      prev.includes(menu) 
        ? prev.filter((m) => m !== menu) 
        : [...prev, menu]
    )
  }

  const toggleSidebar = () => {
    if (window.innerWidth < 768) {
      setIsMobileSidebarOpen(!isMobileSidebarOpen)
    } else {
      setIsSidebarCollapsed(!isSidebarCollapsed)
    }
  }

  const handleSignOut = () => {
    markLogoutSuccessBanner()
    clearTokens()
    router.push("/login")
  }

  const renderContent = () => {
    if (loading) {
      return (
        <div className="space-y-4">
          <Skeleton className="h-8 w-1/3" />
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      )
    }
    
    if (error) {
      return (
        <div className="text-center py-8">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={fetchUserData} variant="outline">
            Retry
          </Button>
        </div>
      )
    }
    
    if (!userData) {
      return (
        <div className="text-center py-8">
          <p className="text-gray-600">No user data found</p>
        </div>
      )
    }

    switch (activeSection) {
      case "profile":
        return <ProfileSection userData={userData} onUpdate={handleProfileUpdate} organizerId={""} />
      case "events":
        return <EventsSection userId={userId} />
      case "past-events":
        return <PastEvents userId={userId} />
      case "wishlist":
        return <SavedEvents userId={userId} />
      case "upcoming-events":
        return <UpcomingEvents events={interestedEvents} userId={userId} />
      case "my-appointments":
        return <MyAppointments userId={userId} />
      case "exhibitor-schedule":
        return <ExhibitorSchedule userId={userId} />
      case "schedule":
        return <Schedule userId={userId} />
      case "favourites":
        return <Favourites />
      case "recommended-events":
        return <RecommendedEvents userId={userId} interests={userInterests} />
      case "Suggested":
        return <Recommendations />
      case "connections":
        return <ConnectionsSection userId={userId} />
      case "messages":
        return <MessagesSection organizerId={userId} surface="visitor" />
      case "settings":
        return <VisitorSettings  />
      case "travel":
        return <TravelAccommodation />
      case "Help & Support":
        return <HelpSupport />
      default:
        return <ProfileSection userData={userData} onUpdate={handleProfileUpdate} organizerId={""} />
    }
  }

  const renderSidebar = () => {
    const navBtnCollapsed = isSidebarCollapsed ? "justify-center px-0" : "justify-between px-3"
    const simpleNavBtnCollapsed = isSidebarCollapsed ? "justify-center px-0" : "justify-start px-3"

    const sidebarContent = (
      <div
        className={`${
          isSidebarCollapsed ? "w-[4.5rem]" : "w-64"
        } flex max-h-[calc(100vh-2rem)] flex-col justify-between overflow-hidden rounded-[2rem] border border-white/30 bg-gradient-to-b from-[#004A96] via-[#003d7a] to-[#002f5e] py-5 text-white shadow-[0_8px_32px_rgba(0,74,150,0.4)] transition-[width] duration-300 ease-out md:h-[calc(100vh-2rem)]`}
      >
        <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden">
          <nav className="space-y-1 px-2 text-sm">
            {/* Notifications — matches reference; opens Messages */}
            <div className={`mb-3 flex ${isSidebarCollapsed ? "justify-center" : "justify-center px-1"}`}>
              <button
                type="button"
                title="Notifications"
                onClick={() => {
                  setActiveSection("messages")
                  if (window.innerWidth < 768) setIsMobileSidebarOpen(false)
                }}
                className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/15 ring-2 ring-white/30 transition hover:bg-white/25"
              >
                <Bell className="h-5 w-5 text-white" strokeWidth={2} />
                <span
                  className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-[#003d7a]"
                  style={{ backgroundColor: VISITOR_ACCENT }}
                  aria-hidden
                />
              </button>
            </div>

            {/* Dashboard */}
            <div>
              <button
                type="button"
                title={isSidebarCollapsed ? "Dashboard" : undefined}
                className={`flex w-full items-center rounded-xl py-2.5 text-left font-medium text-white/95 transition hover:bg-white/10 ${navBtnCollapsed}`}
                onClick={() => toggleMenu("dashboard")}
              >
                <span className={`flex items-center gap-3 ${isSidebarCollapsed ? "" : "min-w-0 flex-1"}`}>
                  <LayoutDashboard className="h-[18px] w-[18px] shrink-0" />
                  {!isSidebarCollapsed && <span className="truncate">Dashboard</span>}
                </span>
                {!isSidebarCollapsed &&
                  (openMenus.includes("dashboard") ? <ChevronDown size={16} /> : <ChevronRight size={16} />)}
              </button>
              {openMenus.includes("dashboard") && !isSidebarCollapsed && (
                <ul className="ml-2 mt-1 space-y-1 border-l border-white/20">
                  <li
                    onClick={() => setActiveSection("profile")}
                    className={`cursor-pointer border-l-4 py-1.5 pl-3 transition-colors ${
                      activeSection === "profile"
                        ? "border-[#FF131C] font-medium text-white"
                        : "border-transparent text-white/80 hover:text-white"
                    }`}
                  >
                    Profile
                  </li>
                </ul>
              )}
            </div>

            {/* Event */}
            <div>
              <button
                type="button"
                title={isSidebarCollapsed ? "My Events" : undefined}
                className={`flex w-full items-center rounded-xl py-2.5 text-left font-medium text-white/95 transition hover:bg-white/10 ${navBtnCollapsed}`}
                onClick={() => toggleMenu("event")}
              >
                <span className={`flex items-center gap-3 ${isSidebarCollapsed ? "" : "min-w-0 flex-1"}`}>
                  <Calendar className="h-[18px] w-[18px] shrink-0" />
                  {!isSidebarCollapsed && <span className="truncate">My Events</span>}
                </span>
                {!isSidebarCollapsed &&
                  (openMenus.includes("event") ? <ChevronDown size={16} /> : <ChevronRight size={16} />)}
              </button>
              {openMenus.includes("event") && !isSidebarCollapsed && (
                <ul className="ml-2 mt-1 space-y-1 border-l border-white/20">
                  <li onClick={() => setActiveSection("events")} className={menuItemClass(activeSection, "events")}>
                    Interested Events
                  </li>
                  <li onClick={() => setActiveSection("past-events")} className={menuItemClass(activeSection, "past-events")}>
                    Past Events
                  </li>
                  <li onClick={() => setActiveSection("wishlist")} className={menuItemClass(activeSection, "wishlist")}>
                    Saved Events
                  </li>
                </ul>
              )}
            </div>

            {/* Networking */}
            <div>
              <button
                type="button"
                title={isSidebarCollapsed ? "Networking" : undefined}
                className={`flex w-full items-center rounded-xl py-2.5 text-left font-medium text-white/95 transition hover:bg-white/10 ${navBtnCollapsed}`}
                onClick={() => toggleMenu("networking")}
              >
                <span className={`flex items-center gap-3 ${isSidebarCollapsed ? "" : "min-w-0 flex-1"}`}>
                  <Network className="h-[18px] w-[18px] shrink-0" />
                  {!isSidebarCollapsed && <span className="truncate">Networking</span>}
                </span>
                {!isSidebarCollapsed &&
                  (openMenus.includes("networking") ? <ChevronDown size={16} /> : <ChevronRight size={16} />)}
              </button>
              {openMenus.includes("networking") && !isSidebarCollapsed && (
                <ul className="ml-2 mt-1 space-y-1 border-l border-white/20">
                  <li onClick={() => setActiveSection("connections")} className={menuItemClass(activeSection, "connections")}>
                    My Connections
                  </li>
                  <li onClick={() => setActiveSection("messages")} className={menuItemClass(activeSection, "messages")}>
                    Messages
                  </li>
                </ul>
              )}
            </div>

            {/* Exhibitor */}
            <div>
              <button
                type="button"
                title={isSidebarCollapsed ? "My Exhibitors" : undefined}
                className={`flex w-full items-center rounded-xl py-2.5 text-left font-medium text-white/95 transition hover:bg-white/10 ${navBtnCollapsed}`}
                onClick={() => toggleMenu("exhibitor")}
              >
                <span className={`flex items-center gap-3 ${isSidebarCollapsed ? "" : "min-w-0 flex-1"}`}>
                  <Store className="h-[18px] w-[18px] shrink-0" />
                  {!isSidebarCollapsed && <span className="truncate">My Exhibitors</span>}
                </span>
                {!isSidebarCollapsed &&
                  (openMenus.includes("exhibitor") ? <ChevronDown size={16} /> : <ChevronRight size={16} />)}
              </button>
              {openMenus.includes("exhibitor") && !isSidebarCollapsed && (
                <ul className="ml-2 mt-1 space-y-1 border-l border-white/20">
                  <li onClick={() => setActiveSection("my-appointments")} className={menuItemClass(activeSection, "my-appointments")}>
                    Exhibitor Appointments
                  </li>
                  <li onClick={() => setActiveSection("Suggested")} className={menuItemClass(activeSection, "Suggested")}>
                    Suggested
                  </li>
                </ul>
              )}
            </div>

            {/* Event Planning Tools */}
            <div>
              <button
                type="button"
                title={isSidebarCollapsed ? "Event Planning Tools" : undefined}
                className={`flex w-full items-center rounded-xl py-2.5 text-left font-medium text-white/95 transition hover:bg-white/10 ${navBtnCollapsed}`}
                onClick={() => toggleMenu("tools")}
              >
                <span className={`flex items-center gap-3 ${isSidebarCollapsed ? "" : "min-w-0 flex-1"}`}>
                  <List className="h-[18px] w-[18px] shrink-0" />
                  {!isSidebarCollapsed && <span className="truncate">Event Planning Tools</span>}
                </span>
                {!isSidebarCollapsed &&
                  (openMenus.includes("tools") ? <ChevronDown size={16} /> : <ChevronRight size={16} />)}
              </button>
              {openMenus.includes("tools") && !isSidebarCollapsed && (
                <ul className="ml-2 mt-1 space-y-1 border-l border-white/20">
                  <li onClick={() => setActiveSection("travel")} className={menuItemClass(activeSection, "travel")}>
                    Travel & Stay
                  </li>
                  <li onClick={() => setActiveSection("schedule")} className={menuItemClass(activeSection, "schedule")}>
                    Schedule
                  </li>
                </ul>
              )}
            </div>

            {/* Help & Support */}
            <div>
              <button
                type="button"
                title={isSidebarCollapsed ? "Help & Support" : undefined}
                onClick={() => setActiveSection("Help & Support")}
                className={`flex w-full items-center rounded-xl py-2.5 font-medium transition hover:bg-white/10 ${simpleNavBtnCollapsed} ${
                  activeSection === "Help & Support" ? "bg-white/15 text-white" : "text-white/95"
                }`}
              >
                <HelpCircle className="h-[18px] w-[18px] shrink-0" />
                {!isSidebarCollapsed && <span className="ml-3 truncate">Help & Support</span>}
              </button>
            </div>

            {/* Settings */}
            <div>
              <button
                type="button"
                title={isSidebarCollapsed ? "Settings" : undefined}
                onClick={() => setActiveSection("settings")}
                className={`flex w-full items-center rounded-xl py-2.5 font-medium transition hover:bg-white/10 ${simpleNavBtnCollapsed} ${
                  activeSection === "settings" ? "bg-white/15 text-white" : "text-white/95"
                }`}
              >
                <Settings className="h-[18px] w-[18px] shrink-0" />
                {!isSidebarCollapsed && <span className="ml-3 truncate">Settings</span>}
              </button>
            </div>
          </nav>
        </div>

        {/* Collapse & Logout */}
        <div className="mt-2 space-y-2 border-t border-white/15 px-2 pt-4">
          <Button
            type="button"
            onClick={toggleSidebar}
            title={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            className={`flex w-full border-white/40 bg-white/10 text-white hover:bg-white/20 hover:text-white ${isSidebarCollapsed ? "justify-center px-0" : "justify-center gap-2"}`}
            variant="outline"
            size="sm"
          >
            <SidebarIcon size={16} className="shrink-0" />
            {!isSidebarCollapsed && <span>Collapse</span>}
          </Button>
          <Button
            type="button"
            onClick={handleSignOut}
            title="Logout"
            className={`flex w-full text-white hover:opacity-95 ${isSidebarCollapsed ? "justify-center px-0" : "justify-center gap-2"}`}
            style={{ backgroundColor: VISITOR_ACCENT }}
            size="sm"
          >
            <LogOut size={16} className="shrink-0" />
            {!isSidebarCollapsed && <span>Logout</span>}
          </Button>
        </div>
      </div>
    )

    return (
      <div className="contents">
        {/* Mobile Sidebar Overlay */}
        {isMobileSidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden"
            onClick={() => setIsMobileSidebarOpen(false)}
            aria-hidden
          />
        )}

        {/* Sidebar: drawer on mobile; on md+ overlaps main glass (half out / half in) */}
        <div
          className={`
          fixed inset-y-0 left-0 z-50 p-4
          md:relative md:inset-auto md:z-30 md:flex md:shrink-0 md:items-start md:pl-6 md:pr-0 md:pt-5 md:pb-5
          transition-[margin] duration-300 ease-out
          ${isSidebarCollapsed ? "md:-mr-9" : "md:-mr-32"}
          transform transition-transform duration-300 ease-in-out
          ${isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}
        >
          {sidebarContent}
        </div>
      </div>
    )
  }

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-cyan-200/70 via-[#004A96]/35 to-fuchsia-200/65">
        <Loader2 className="h-8 w-8 animate-spin text-[#004A96]" />
      </div>
    )
  }

  const displayName = userData?.displayName?.trim() || [userData?.firstName, userData?.lastName].filter(Boolean).join(" ").trim()

  const showShellHeader = Boolean(!loading && !error && userData && activeSection !== "profile")

  return (
    <div className="flex min-h-screen w-full justify-center bg-gradient-to-br from-cyan-200/70 via-[#004A96]/35 to-fuchsia-200/65">
      <div className="flex w-full max-w-[1680px] flex-1 flex-col md:flex-row md:items-stretch md:gap-0 md:px-5 md:py-5">
        {renderSidebar()}

        {/* Main column — glass panel aligns with overlapped sidebar */}
        <div className="relative z-10 flex min-h-0 min-w-0 flex-1 flex-col">
          {/* Mobile top bar */}
          <div className="mx-4 mt-4 flex items-center justify-between rounded-2xl border border-white/40 bg-white/45 px-4 py-3 shadow-sm backdrop-blur-xl md:hidden">
            <Button variant="ghost" size="sm" className="text-[#004A96]" onClick={() => setIsMobileSidebarOpen(true)}>
              <Menu className="h-5 w-5" />
            </Button>
            <span className="text-sm font-semibold text-[#004A96]">Dashboard</span>
            <div className="w-9" />
          </div>

          <main
            className={cn(
              "mx-4 mb-4 mt-4 flex min-h-0 flex-1 flex-col overflow-auto rounded-[1.75rem] border border-white/50 bg-white/45 shadow-[0_8px_32px_rgba(0,74,150,0.12)] backdrop-blur-xl",
              "p-5 sm:p-6",
              "md:mx-0 md:mb-0 md:mt-0 md:min-h-[calc(100vh-2.5rem)] md:pt-6 md:pb-6 md:pr-6",
              /* Keep text & controls out from under the overlapping pill (half overlap + radius) */
              isSidebarCollapsed ? "md:pl-12" : "md:pl-36",
            )}
          >
            {showShellHeader && (
              <div className="mb-6 flex flex-shrink-0 items-center justify-between gap-4 border-b border-[#004A96]/10 pb-5">
                <p className="text-lg font-semibold tracking-tight text-slate-800 md:text-xl">
                  {visitorGreeting()}, {displayName || "there"}!
                </p>
                <Avatar className="h-11 w-11 shrink-0 ring-2 ring-[#004A96]/25 ring-offset-2">
                  <AvatarImage src={userData!.avatar || undefined} alt="" />
                  <AvatarFallback className="bg-[#004A96]/10 text-sm font-medium text-[#004A96]">
                    {(userData!.firstName?.[0] ?? "") + (userData!.lastName?.[0] ?? "") || "?"}
                  </AvatarFallback>
                </Avatar>
              </div>
            )}

            <div className="min-h-0 flex-1">
              <DashboardManagedBanner page="visitor-dashboard" />
              <div className={cn("w-full", activeSection === "profile" ? "pt-0" : "pt-2")}>{renderContent()}</div>
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}

// Helper for menu items (expanded sidebar)
function menuItemClass(activeSection: string, id: string) {
  return `cursor-pointer border-l-4 py-1.5 pl-3 transition-colors ${
    activeSection === id
      ? "border-[#FF131C] font-medium text-white"
      : "border-transparent text-white/80 hover:text-white"
  }`
}