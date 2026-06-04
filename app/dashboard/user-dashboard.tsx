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
  List,
  Menu,
  Bell,
  Crown,
  TrendingUp,
  Headphones,
} from "lucide-react"
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
import { DashboardPricingPlansView } from "@/components/dashboard-packages"

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
    const currentPath = decodeURIComponent(pathname ?? "")
    if (currentPath && currentPath !== canonical) {
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
            interests={userInterests}
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
      case "upgrade-plan":
        return <DashboardPricingPlansView role="VISITOR" />
      default:
        return (
          <DashboardOverview
            userId={resolvedUserId}
            events={interestedEvents}
            userName={displayName || userData?.firstName || "User"}
            interests={userInterests}
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
          "visitor-sidebar-shell flex h-full flex-col justify-between border-r border-slate-200 bg-white py-4 text-slate-700 transition-[width] duration-300 ease-out",
          isSidebarCollapsed
            ? "visitor-sidebar-shell--collapsed no-scrollbar w-[5.25rem] min-w-0 overflow-x-hidden overflow-y-auto"
            : "w-[260px] overflow-hidden",
        )}
      >
        <div
          className={cn(
            "visitor-sidebar-nav-scroll min-w-0",
            isSidebarCollapsed ? "overflow-visible" : "min-h-0 flex-1 overflow-x-hidden overflow-y-auto no-scrollbar",
          )}
        >
          <nav className={cn("min-w-0 max-w-full space-y-1 text-sm", isSidebarCollapsed ? "space-y-1.5 px-0" : "px-2")}>
            {/* Dashboard */}
            <div className={visitorCollapsedNavItemClass(isSidebarCollapsed, activeSection, "dashboard")}>
              <button
                type="button"
                title={isSidebarCollapsed ? "Dashboard" : undefined}
                className={cn(
                  visitorNavParentButtonClass(isSidebarCollapsed, isVisitorMenuGroupActive(activeSection, "dashboard") || activeSection === "dashboard"),
                  navBtnCollapsed,
                )}
                onClick={() => toggleMenu("dashboard")}
              >
                <span className={`flex items-center gap-3 ${isSidebarCollapsed ? "w-full justify-center" : "min-w-0 flex-1"}`}>
                  <span className={visitorCollapsedIconSlotClass(isSidebarCollapsed, activeSection, "dashboard")}>
                    <LayoutDashboard className={visitorNavIconClass(isSidebarCollapsed, activeSection, "dashboard", activeSection === "dashboard")} />
                  </span>
                  {!isSidebarCollapsed && <span className="truncate">Dashboard</span>}
                </span>
                {!isSidebarCollapsed &&
                  (openMenus.includes("dashboard") ? <ChevronDown size={16} /> : <ChevronRight size={16} />)}
              </button>
              {openMenus.includes("dashboard") && !isSidebarCollapsed && (
                <ul className="ml-3 mt-1 space-y-0.5 border-l border-slate-200 pl-1">
                  <li onClick={() => setActiveSection("dashboard")} className={menuItemClass(activeSection, "dashboard")}>
                    Dashboard Overview
                  </li>
                  <li onClick={() => setActiveSection("profile")} className={menuItemClass(activeSection, "profile")}>
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
                className={cn(visitorNavParentButtonClass(isSidebarCollapsed, isVisitorMenuGroupActive(activeSection, "event")), navBtnCollapsed)}
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
                <ul className="ml-3 mt-1 space-y-0.5 border-l border-slate-200 pl-1">
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
                className={cn(visitorNavParentButtonClass(isSidebarCollapsed, isVisitorMenuGroupActive(activeSection, "networking")), navBtnCollapsed)}
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
                <ul className="ml-3 mt-1 space-y-0.5 border-l border-slate-200 pl-1">
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
                  visitorNavParentButtonClass(isSidebarCollapsed, isVisitorMenuGroupActive(activeSection, "exhibitor")),
                  navBtnCollapsed,
                )}
                onClick={() => toggleMenu("exhibitor")}
              >
                <span className={`flex items-center gap-3 ${isSidebarCollapsed ? "w-full justify-center" : "min-w-0 flex-1"}`}>
                  <span className={visitorCollapsedIconSlotClass(isSidebarCollapsed, activeSection, "exhibitor")}>
                    <Store className={visitorNavIconClass(isSidebarCollapsed, activeSection, "exhibitor")} />
                  </span>
                  {!isSidebarCollapsed && <span className="truncate">My Exhibitors</span>}
                </span>
                {!isSidebarCollapsed &&
                  (openMenus.includes("exhibitor") ? <ChevronDown size={16} /> : <ChevronRight size={16} />)}
              </button>
              {openMenus.includes("exhibitor") && !isSidebarCollapsed && (
                <ul className="ml-3 mt-1 space-y-0.5 border-l border-slate-200 pl-1">
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
                className={cn(visitorNavParentButtonClass(isSidebarCollapsed, isVisitorMenuGroupActive(activeSection, "tools")), navBtnCollapsed)}
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
                <ul className="ml-3 mt-1 space-y-0.5 border-l border-slate-200 pl-1">
                  <li onClick={() => setActiveSection("travel")} className={menuItemClass(activeSection, "travel")}>
                    Travel & Stay
                  </li>
                  <li onClick={() => setActiveSection("schedule")} className={menuItemClass(activeSection, "schedule")}>
                    Schedule
                  </li>
                </ul>
              )}
            </div>

            {/* Recommendations */}
            <div className={visitorCollapsedNavItemClass(isSidebarCollapsed, activeSection, "recommendations")}>
              <button
                type="button"
                title={isSidebarCollapsed ? "Recommendations" : undefined}
                onClick={() => setActiveSection("recommended-events")}
                className={cn(
                  visitorNavParentButtonClass(isSidebarCollapsed, activeSection === "recommended-events"),
                  simpleNavBtnCollapsed,
                )}
              >
                <span className={visitorCollapsedIconSlotClass(isSidebarCollapsed, activeSection, "recommendations")}>
                  <TrendingUp className={visitorCollapsedIconClass(isSidebarCollapsed, activeSection, "recommendations")} />
                </span>
                {!isSidebarCollapsed && <span className="ml-3 truncate">Recommendations</span>}
              </button>
            </div>

            {/* Upgrade plan */}
            <div className={visitorCollapsedNavItemClass(isSidebarCollapsed, activeSection, "settings")}>
              <button
                type="button"
                title={isSidebarCollapsed ? "Upgrade plan" : undefined}
                onClick={() => {
                  setActiveSection("upgrade-plan")
                  if (typeof window !== "undefined" && window.innerWidth < 768) setIsMobileSidebarOpen(false)
                }}
                className={cn(
                  visitorNavParentButtonClass(isSidebarCollapsed, activeSection === "upgrade-plan"),
                  simpleNavBtnCollapsed,
                )}
              >
                <span className={visitorCollapsedIconSlotClass(isSidebarCollapsed, activeSection, "settings")}>
                  <Crown className={visitorCollapsedIconClass(isSidebarCollapsed, activeSection, "settings")} />
                </span>
                {!isSidebarCollapsed && <span className="ml-3 truncate">Upgrade plan</span>}
              </button>
            </div>

            {/* Settings */}
            <div className={visitorCollapsedNavItemClass(isSidebarCollapsed, activeSection, "settings")}>
              <button
                type="button"
                title={isSidebarCollapsed ? "Settings" : undefined}
                onClick={() => setActiveSection("settings")}
                className={cn(
                  visitorNavParentButtonClass(isSidebarCollapsed, activeSection === "settings"),
                  simpleNavBtnCollapsed,
                )}
              >
                <span className={visitorCollapsedIconSlotClass(isSidebarCollapsed, activeSection, "settings")}>
                  <Settings className={visitorNavIconClass(isSidebarCollapsed, activeSection, "settings", activeSection === "settings")} />
                </span>
                {!isSidebarCollapsed && <span className="ml-3 truncate">Settings</span>}
              </button>
            </div>
          </nav>
        </div>

        {/* Upgrade, help, collapse & logout */}
        <div
          className={cn(
            "visitor-sidebar-footer mt-2 min-w-0 shrink-0 space-y-3 overflow-hidden border-t border-slate-100 pt-4",
            isSidebarCollapsed ? "px-1" : "px-3",
          )}
        >
          {!isSidebarCollapsed && (
            <div className="rounded-2xl border border-blue-100/80 bg-gradient-to-br from-[#eef4fc] to-[#f0f7ff] p-4 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50">
                  <Crown className="h-5 w-5 text-amber-500" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-[#004A96]">Upgrade to Pro</p>
                  <p className="mt-1 text-xs leading-relaxed text-slate-600">
                    Unlock advanced features and get more visibility.
                  </p>
                </div>
              </div>
              <Button
                type="button"
                size="sm"
                className="mt-4 h-9 w-full rounded-lg bg-[#004A96] text-sm font-semibold text-white hover:bg-[#003d7a]"
                onClick={() => setActiveSection("upgrade-plan")}
              >
                Upgrade Now
              </Button>
            </div>
          )}

          {!isSidebarCollapsed && (
            <button
              type="button"
              onClick={() => setActiveSection("Help & Support")}
              className={cn(
                "flex w-full items-center gap-3 rounded-xl border p-3 text-left transition",
                activeSection === "Help & Support"
                  ? "border-[#004A96]/30 bg-blue-50"
                  : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50",
              )}
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100">
                <Headphones className="h-5 w-5 text-slate-600" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-slate-800">Need Help?</p>
                <p className="text-xs text-slate-500">Visit our Help Center</p>
              </div>
              <ChevronRight className="h-4 w-4 shrink-0 text-slate-400" />
            </button>
          )}

          <Button
            type="button"
            onClick={toggleSidebar}
            title={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            className={cn(
              "flex w-full min-w-0 max-w-full border-slate-200 text-slate-700 hover:bg-slate-50",
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
          className={cn(
            "fixed inset-y-0 left-0 z-50 h-full shrink-0 transform transition-transform duration-300 ease-in-out md:static md:translate-x-0",
            isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full",
          )}
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

  const showShellHeader = Boolean(!loading && !error && userData && activeSection !== "profile" && activeSection !== "dashboard")

  return (
    <div className="flex min-h-0 flex-1 w-full overflow-hidden bg-white">
      {renderSidebar()}

      <div className="relative flex min-h-0 min-w-0 flex-1 flex-col">
        <div className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 md:hidden">
          <Button variant="ghost" size="sm" className="text-[#004A96]" onClick={() => setIsMobileSidebarOpen(true)}>
            <Menu className="h-5 w-5" />
          </Button>
          <span className="text-sm font-semibold text-[#004A96]">Biz TradeFairs</span>
          <div className="w-9" />
        </div>

        <main className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden p-0">
          {showShellHeader && (
            <p className="border-b border-slate-100 px-6 py-4 text-xl font-bold text-[#004A96] md:text-2xl">
              {visitorGreeting()}, {displayName || "there"}!
            </p>
          )}

          {!loading && !error && userData && activeSection === "dashboard" && (
            <DashboardManagedBanner page="visitor-dashboard" className="w-full" />
          )}

          <div className="w-full px-6 py-6">{renderContent()}</div>
        </main>
      </div>
    </div>
  )
}

function visitorNavParentButtonClass(collapsed: boolean, isActive: boolean) {
  return cn(
    "flex w-full items-center rounded-lg py-2.5 text-left text-sm font-medium transition",
    !collapsed && isActive && "bg-[#004A96] text-white shadow-sm",
    !collapsed && !isActive && "text-slate-700 hover:bg-slate-100",
    collapsed && isActive && "bg-transparent",
    collapsed && !isActive && "text-slate-600 hover:bg-slate-50",
  )
}

// Helper for menu items (expanded sidebar)
function menuItemClass(activeSection: string, id: string) {
  return `cursor-pointer border-l-4 py-1.5 pl-3 text-sm transition-colors ${activeSection === id
    ? "border-[#004A96] font-semibold text-[#004A96]"
    : "border-transparent text-slate-600 hover:text-[#004A96]"
    }`
}

const VISITOR_MENU_SECTIONS: Record<string, string[]> = {
  dashboard: ["profile"],
  event: ["events", "past-events", "wishlist", "upcoming-events", "favourites", "recommended-events"],
  networking: ["connections", "messages"],
  exhibitor: ["my-appointments", "exhibitor-schedule", "Suggested"],
  tools: ["travel", "schedule"],
  recommendations: ["recommended-events"],
  settings: ["settings", "upgrade-plan"],
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

function visitorNavIconClass(collapsed: boolean, activeSection: string, menuId: string, expandedActive = false) {
  const groupActive = isVisitorMenuGroupActive(activeSection, menuId) || expandedActive
  if (!collapsed && groupActive) return "h-[18px] w-[18px] shrink-0 text-white"
  if (collapsed && groupActive) return "h-[18px] w-[18px] shrink-0 text-[#004A96]"
  return "h-[18px] w-[18px] shrink-0 text-slate-500"
}

function visitorCollapsedIconClass(collapsed: boolean, activeSection: string, menuId: string) {
  return visitorNavIconClass(collapsed, activeSection, menuId)
} 