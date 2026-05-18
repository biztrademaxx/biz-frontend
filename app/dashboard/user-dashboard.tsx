"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/use-auth"
import { apiFetch, clearTokens, markLogoutSuccessBanner } from "@/lib/api"
import { usePathname, useRouter } from "next/navigation"
import { getVisitorDashboardPath } from "@/lib/profile-path"
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
import { DashboardOverview } from "./dashboard-overview"

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
  const pathname = usePathname()
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
  }, [authLoading, userId])

  const resolvedUserId = userData?.id ?? userId

  useEffect(() => {
    if (!userData?.id) return
    fetchInterestedEvents(userData.id)
  }, [userData?.id])

  useEffect(() => {
    if (!userData?.id) return
    const canonical = getVisitorDashboardPath(userData.id, {
      publicSlug: userData.publicSlug,
      firstName: userData.firstName,
      lastName: userData.lastName,
    })
    if (pathname && canonical !== pathname) {
      router.replace(canonical)
    }
  }, [userData?.id, userData?.publicSlug, userData?.firstName, userData?.lastName, pathname, router])

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

  const fetchInterestedEvents = async (id: string) => {
    try {
      const data = await apiFetch<{ events?: any[]; data?: any[] }>(`/api/users/${id}/interested-events`, { auth: true })
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
    // Auto expand sidebar when collapsed
    if (isSidebarCollapsed) {
      setIsSidebarCollapsed(false)
    }

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
      case "dashboard":
        return (
          <DashboardOverview
            userId={resolvedUserId}
            events={interestedEvents}
            userName={displayName || userData?.firstName || "User"}
          />
        )
      case "profile":
        return <ProfileSection userData={userData} onUpdate={handleProfileUpdate} organizerId={""} />
      case "events":
        return <EventsSection userId={resolvedUserId} />
      case "past-events":
        return <PastEvents userId={resolvedUserId} />
      case "wishlist":
        return <SavedEvents userId={resolvedUserId} />
      case "upcoming-events":
        return <UpcomingEvents events={interestedEvents} userId={resolvedUserId} />
      case "my-appointments":
        return <MyAppointments userId={resolvedUserId} />
      case "exhibitor-schedule":
        return <ExhibitorSchedule userId={resolvedUserId} />
      case "schedule":
        return <Schedule userId={resolvedUserId} />
      case "favourites":
        return <Favourites />
      case "recommended-events":
        return <RecommendedEvents userId={resolvedUserId} interests={userInterests} />
      case "Suggested":
        return <Recommendations />
      case "connections":
        return <ConnectionsSection userId={resolvedUserId} />
      case "messages":
        return <MessagesSection organizerId={resolvedUserId} surface="visitor" />
      case "settings":
        return <VisitorSettings />
      case "travel":
        return <TravelAccommodation />
      case "Help & Support":
        return <HelpSupport />
      default:
        return (
          <DashboardOverview
            userId={resolvedUserId}
            events={interestedEvents}
            userName={displayName || userData?.firstName || "User"}
          />
        )
    }
  }

  const renderSidebar = () => {
    const navBtnCollapsed = isSidebarCollapsed ? "justify-center px-0" : "justify-between px-3"
    const simpleNavBtnCollapsed = isSidebarCollapsed ? "justify-center px-0" : "justify-start px-3"

    const sidebarContent = (
      <div
        className={cn(
          "visitor-sidebar-shell flex max-h-[calc(100vh-2rem)] flex-col justify-between rounded-[2rem] border border-white/30 bg-gradient-to-b from-[#004A96] via-[#003d7a] to-[#002f5e] py-5 text-white shadow-[0_8px_32px_rgba(0,74,150,0.4)] transition-[width] duration-300 ease-out md:h-[calc(100vh-2rem)]",
          isSidebarCollapsed
            ? "visitor-sidebar-shell--collapsed no-scrollbar w-[5.25rem] min-w-0 overflow-x-hidden overflow-y-auto"
            : "w-64 overflow-hidden",
        )}
      >
        <div
          className={cn(
            "visitor-sidebar-nav-scroll min-w-0",
            isSidebarCollapsed ? "overflow-visible" : "min-h-0 flex-1 overflow-x-hidden overflow-y-auto no-scrollbar",
          )}
        >
          <nav className={cn("min-w-0 max-w-full space-y-1 text-sm", isSidebarCollapsed ? "space-y-1.5 px-0" : "px-2")}>
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
            <div className={visitorCollapsedNavItemClass(isSidebarCollapsed, activeSection, "dashboard")}>
              <button
                type="button"
                title={isSidebarCollapsed ? "Dashboard" : undefined}
                className={cn(
                  "flex w-full items-center rounded-xl py-2.5 text-left font-medium text-white/95 transition hover:bg-white/10",
                  navBtnCollapsed,
                  isSidebarCollapsed && isVisitorMenuGroupActive(activeSection, "dashboard") && "hover:bg-transparent",
                )}
                onClick={() => toggleMenu("dashboard")}
              >
                <span className={`flex items-center gap-3 ${isSidebarCollapsed ? "w-full justify-center" : "min-w-0 flex-1"}`}>
                  <span className={visitorCollapsedIconSlotClass(isSidebarCollapsed, activeSection, "dashboard")}>
                    <LayoutDashboard className={visitorCollapsedIconClass(isSidebarCollapsed, activeSection, "dashboard")} />
                  </span>
                  {!isSidebarCollapsed && <span className="truncate">Dashboard</span>}
                </span>
                {!isSidebarCollapsed &&
                  (openMenus.includes("dashboard") ? <ChevronDown size={16} /> : <ChevronRight size={16} />)}
              </button>
              {openMenus.includes("dashboard") && !isSidebarCollapsed && (
                <ul className="ml-2 mt-1 space-y-1 border-l border-white/20">
                  <li
                    onClick={() => setActiveSection("dashboard")}
                    className={menuItemClass(activeSection, "dashboard")}
                  >
                    Dashboard Overview
                  </li>
                  <li
                    onClick={() => setActiveSection("profile")}
                    className={`cursor-pointer border-l-4 py-1.5 pl-3 transition-colors ${activeSection === "profile"
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
            <div className={visitorCollapsedNavItemClass(isSidebarCollapsed, activeSection, "event")}>
              <button
                type="button"
                title={isSidebarCollapsed ? "My Events" : undefined}
                className={cn(
                  "flex w-full items-center rounded-xl py-2.5 text-left font-medium text-white/95 transition hover:bg-white/10",
                  navBtnCollapsed,
                  isSidebarCollapsed && isVisitorMenuGroupActive(activeSection, "event") && "hover:bg-transparent",
                )}
                onClick={() => toggleMenu("event")}
              >
                <span className={`flex items-center gap-3 ${isSidebarCollapsed ? "w-full justify-center" : "min-w-0 flex-1"}`}>
                  <span className={visitorCollapsedIconSlotClass(isSidebarCollapsed, activeSection, "event")}>
                    <Calendar className={visitorCollapsedIconClass(isSidebarCollapsed, activeSection, "event")} />
                  </span>
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
            <div className={visitorCollapsedNavItemClass(isSidebarCollapsed, activeSection, "networking")}>
              <button
                type="button"
                title={isSidebarCollapsed ? "Networking" : undefined}
                className={cn(
                  "flex w-full items-center rounded-xl py-2.5 text-left font-medium text-white/95 transition hover:bg-white/10",
                  navBtnCollapsed,
                  isSidebarCollapsed && isVisitorMenuGroupActive(activeSection, "networking") && "hover:bg-transparent",
                )}
                onClick={() => toggleMenu("networking")}
              >
                <span className={`flex items-center gap-3 ${isSidebarCollapsed ? "w-full justify-center" : "min-w-0 flex-1"}`}>
                  <span className={visitorCollapsedIconSlotClass(isSidebarCollapsed, activeSection, "networking")}>
                    <Network className={visitorCollapsedIconClass(isSidebarCollapsed, activeSection, "networking")} />
                  </span>
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
            <div className={visitorCollapsedNavItemClass(isSidebarCollapsed, activeSection, "exhibitor")}>
              <button
                type="button"
                title={isSidebarCollapsed ? "My Exhibitors" : undefined}
                className={cn(
                  "flex w-full items-center rounded-xl py-2.5 text-left font-medium text-white/95 transition hover:bg-white/10",
                  navBtnCollapsed,
                  isSidebarCollapsed && isVisitorMenuGroupActive(activeSection, "exhibitor") && "hover:bg-transparent",
                )}
                onClick={() => toggleMenu("exhibitor")}
              >
                <span className={`flex items-center gap-3 ${isSidebarCollapsed ? "w-full justify-center" : "min-w-0 flex-1"}`}>
                  <span className={visitorCollapsedIconSlotClass(isSidebarCollapsed, activeSection, "exhibitor")}>
                    <Store className={visitorCollapsedIconClass(isSidebarCollapsed, activeSection, "exhibitor")} />
                  </span>
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
            <div className={visitorCollapsedNavItemClass(isSidebarCollapsed, activeSection, "tools")}>
              <button
                type="button"
                title={isSidebarCollapsed ? "Event Planning Tools" : undefined}
                className={cn(
                  "flex w-full items-center rounded-xl py-2.5 text-left font-medium text-white/95 transition hover:bg-white/10",
                  navBtnCollapsed,
                  isSidebarCollapsed && isVisitorMenuGroupActive(activeSection, "tools") && "hover:bg-transparent",
                )}
                onClick={() => toggleMenu("tools")}
              >
                <span className={`flex items-center gap-3 ${isSidebarCollapsed ? "w-full justify-center" : "min-w-0 flex-1"}`}>
                  <span className={visitorCollapsedIconSlotClass(isSidebarCollapsed, activeSection, "tools")}>
                    <List className={visitorCollapsedIconClass(isSidebarCollapsed, activeSection, "tools")} />
                  </span>
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
            <div className={visitorCollapsedNavItemClass(isSidebarCollapsed, activeSection, "help")}>
              <button
                type="button"
                title={isSidebarCollapsed ? "Help & Support" : undefined}
                onClick={() => setActiveSection("Help & Support")}
                className={cn(
                  "flex w-full items-center rounded-xl py-2.5 font-medium transition hover:bg-white/10",
                  simpleNavBtnCollapsed,
                  !isSidebarCollapsed && activeSection === "Help & Support" && "bg-white/15 text-white",
                  !isSidebarCollapsed && activeSection !== "Help & Support" && "text-white/95",
                  isSidebarCollapsed && isVisitorMenuGroupActive(activeSection, "help") && "hover:bg-transparent",
                )}
              >
                <span className={visitorCollapsedIconSlotClass(isSidebarCollapsed, activeSection, "help")}>
                  <HelpCircle className={visitorCollapsedIconClass(isSidebarCollapsed, activeSection, "help")} />
                </span>
                {!isSidebarCollapsed && <span className="ml-3 truncate">Help & Support</span>}
              </button>
            </div>

            {/* Settings */}
            <div className={visitorCollapsedNavItemClass(isSidebarCollapsed, activeSection, "settings")}>
              <button
                type="button"
                title={isSidebarCollapsed ? "Settings" : undefined}
                onClick={() => setActiveSection("settings")}
                className={cn(
                  "flex w-full items-center rounded-xl py-2.5 font-medium transition hover:bg-white/10",
                  simpleNavBtnCollapsed,
                  !isSidebarCollapsed && activeSection === "settings" && "bg-white/15 text-white",
                  !isSidebarCollapsed && activeSection !== "settings" && "text-white/95",
                  isSidebarCollapsed && isVisitorMenuGroupActive(activeSection, "settings") && "hover:bg-transparent",
                )}
              >
                <span className={visitorCollapsedIconSlotClass(isSidebarCollapsed, activeSection, "settings")}>
                  <Settings className={visitorCollapsedIconClass(isSidebarCollapsed, activeSection, "settings")} />
                </span>
                {!isSidebarCollapsed && <span className="ml-3 truncate">Settings</span>}
              </button>
            </div>
          </nav>
        </div>

        {/* Collapse & Logout */}
        <div
          className={cn(
            "visitor-sidebar-footer mt-2 min-w-0 shrink-0 space-y-2 overflow-hidden border-t border-white/15 pt-4",
            isSidebarCollapsed ? "px-1" : "px-2",
          )}
        >
          <Button
            type="button"
            onClick={toggleSidebar}
            title={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            className={cn(
              "flex w-full min-w-0 max-w-full border-white/40 bg-white/10 text-white hover:bg-white/20 hover:text-white",
              isSidebarCollapsed ? "justify-center px-0" : "justify-center gap-2",
            )}
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
            className={cn(
              "flex w-full min-w-0 max-w-full text-white hover:opacity-95",
              isSidebarCollapsed ? "justify-center px-0" : "justify-center gap-2",
            )}
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
          fixed inset-y-0 left-0 z-50 h-screen p-4
          md:sticky md:top-0 md:z-30 md:flex md:shrink-0 md:items-start md:pl-6 md:pr-0 md:pt-5 md:pb-5
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
      <div className="flex min-h-screen items-center justify-center bg-white">
        <Loader2 className="h-8 w-8 animate-spin text-[#004A96]" />
      </div>
    )
  }

  const displayName = userData?.displayName?.trim() || [userData?.firstName, userData?.lastName].filter(Boolean).join(" ").trim()

  const showShellHeader = Boolean(!loading && !error && userData && activeSection !== "profile")

  return (
    <div className="flex h-screen overflow-hidden w-full justify-center bg-white">
      <div className="flex h-full w-full max-w-[1680px] flex-1 flex-col overflow-hidden md:flex-row md:items-stretch md:gap-0 md:px-5 md:py-5">
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
              "mx-4 mb-4 mt-4 flex h-full min-h-0 flex-1 flex-col overflow-y-auto overflow-x-hidden rounded-[1.75rem] border border-white/50 bg-white/45 shadow-[0_8px_32px_rgba(0,74,150,0.12)] backdrop-blur-xl",
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
  return `cursor-pointer border-l-4 py-1.5 pl-3 transition-colors ${activeSection === id
      ? "border-[#FF131C] font-medium text-white"
      : "border-transparent text-white/80 hover:text-white"
    }`
}

const VISITOR_MENU_SECTIONS: Record<string, string[]> = {
  dashboard: ["profile"],
  event: ["events", "past-events", "wishlist", "upcoming-events", "favourites", "recommended-events"],
  networking: ["connections", "messages"],
  exhibitor: ["my-appointments", "exhibitor-schedule", "Suggested"],
  tools: ["travel", "schedule"],
  help: ["Help & Support"],
  settings: ["settings"],
}

function isVisitorMenuGroupActive(activeSection: string, menuId: string): boolean {
  return VISITOR_MENU_SECTIONS[menuId]?.includes(activeSection) ?? false
}

function visitorCollapsedNavItemClass(collapsed: boolean, activeSection: string, menuId: string) {
  return cn(collapsed && "visitor-sidebar-nav-item", collapsed && isVisitorMenuGroupActive(activeSection, menuId) && "visitor-sidebar-nav-item--active")
}

function visitorCollapsedIconSlotClass(collapsed: boolean, activeSection: string, menuId: string) {
  const isActive = collapsed && isVisitorMenuGroupActive(activeSection, menuId)
  return cn(
    "shrink-0",
    collapsed && !isActive && "flex h-12 w-full items-center justify-center",
    isActive && "visitor-sidebar-icon-slot--active",
  )
}

function visitorCollapsedIconClass(collapsed: boolean, activeSection: string, menuId: string) {
  return cn(
    "h-[18px] w-[18px] shrink-0",
    collapsed && isVisitorMenuGroupActive(activeSection, menuId) ? "text-[#004A96]" : "text-white",
  )
}