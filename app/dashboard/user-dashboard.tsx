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
      if (!user) throw new Error("User data not found")
      setUserData(user as UserData)
      setUserInterests((user as UserData).interests || [])
    } catch (err) {
      console.error("Error fetching user data:", err)
      setError(err instanceof Error ? err.message : "Error loading user data")
      toast({ title: "Error", description: "Failed to load user data", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const fetchInterestedEvents = async (id: string) => {
    try {
      const data = await apiFetch<{ events?: any[]; data?: any[] }>(`/api/users/${id}/interested-events`, { auth: true })
      const list = data.events ?? data.data ?? []
      const uniqueEvents = Array.isArray(list)
        ? list.filter((event: any, index: number, self: any[]) =>
          index === self.findIndex((e: any) => e.id === event.id)
        )
        : []
      setInterestedEvents(uniqueEvents)
    } catch (err) {
      console.error("Error fetching interested events:", err)
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
    toast({ title: "Profile Updated", description: "Your profile has been successfully updated." })
  }

  const toggleMenu = (menu: string) => {
    setOpenMenus((prev) =>
      prev.includes(menu) ? prev.filter((m) => m !== menu) : [...prev, menu]
    )
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
          <Button onClick={fetchUserData} variant="outline">Retry</Button>
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
    const sidebarContent = (
      <div className="flex h-full w-[260px] flex-col justify-between border-r border-slate-200 bg-white py-4 text-slate-700 overflow-hidden">
        {/* Nav scroll area */}
        <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden no-scrollbar">
          <nav className="space-y-1 px-2 text-sm">

            {/* Dashboard */}
            <div>
              <button
                type="button"
                className={cn(
                  "flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm font-medium transition",
                  isMenuGroupActive(activeSection, "dashboard") || activeSection === "dashboard"
                    ? "bg-[#004A96] text-white shadow-sm"
                    : "text-slate-700 hover:bg-slate-100"
                )}
                onClick={() => toggleMenu("dashboard")}
              >
                <span className="flex items-center gap-3">
                  <LayoutDashboard className="h-[18px] w-[18px] shrink-0" />
                  <span className="truncate">Dashboard</span>
                </span>
                {openMenus.includes("dashboard") ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              </button>
              {openMenus.includes("dashboard") && (
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

            {/* My Events */}
            <div>
              <button
                type="button"
                className={cn(
                  "flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm font-medium transition",
                  isMenuGroupActive(activeSection, "event")
                    ? "bg-[#004A96] text-white shadow-sm"
                    : "text-slate-700 hover:bg-slate-100"
                )}
                onClick={() => toggleMenu("event")}
              >
                <span className="flex items-center gap-3">
                  <Calendar className="h-[18px] w-[18px] shrink-0" />
                  <span className="truncate">My Events</span>
                </span>
                {openMenus.includes("event") ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              </button>
              {openMenus.includes("event") && (
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
            <div>
              <button
                type="button"
                className={cn(
                  "flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm font-medium transition",
                  isMenuGroupActive(activeSection, "networking")
                    ? "bg-[#004A96] text-white shadow-sm"
                    : "text-slate-700 hover:bg-slate-100"
                )}
                onClick={() => toggleMenu("networking")}
              >
                <span className="flex items-center gap-3">
                  <Network className="h-[18px] w-[18px] shrink-0" />
                  <span className="truncate">Networking</span>
                </span>
                {openMenus.includes("networking") ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              </button>
              {openMenus.includes("networking") && (
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

            {/* My Exhibitors */}
            <div>
              <button
                type="button"
                className={cn(
                  "flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm font-medium transition",
                  isMenuGroupActive(activeSection, "exhibitor")
                    ? "bg-[#004A96] text-white shadow-sm"
                    : "text-slate-700 hover:bg-slate-100"
                )}
                onClick={() => toggleMenu("exhibitor")}
              >
                <span className="flex items-center gap-3">
                  <Store className="h-[18px] w-[18px] shrink-0" />
                  <span className="truncate">My Exhibitors</span>
                </span>
                {openMenus.includes("exhibitor") ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              </button>
              {openMenus.includes("exhibitor") && (
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
            <div>
              <button
                type="button"
                className={cn(
                  "flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm font-medium transition",
                  isMenuGroupActive(activeSection, "tools")
                    ? "bg-[#004A96] text-white shadow-sm"
                    : "text-slate-700 hover:bg-slate-100"
                )}
                onClick={() => toggleMenu("tools")}
              >
                <span className="flex items-center gap-3">
                  <List className="h-[18px] w-[18px] shrink-0" />
                  <span className="truncate">Event Planning Tools</span>
                </span>
                {openMenus.includes("tools") ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              </button>
              {openMenus.includes("tools") && (
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
            <div>
              <button
                type="button"
                className={cn(
                  "flex w-full items-center justify-start gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition",
                  activeSection === "recommended-events"
                    ? "bg-[#004A96] text-white shadow-sm"
                    : "text-slate-700 hover:bg-slate-100"
                )}
                onClick={() => setActiveSection("recommended-events")}
              >
                <TrendingUp className="h-[18px] w-[18px] shrink-0" />
                <span className="truncate">Recommendations</span>
              </button>
            </div>

            {/* Upgrade Plan */}
            <div>
              <button
                type="button"
                className={cn(
                  "flex w-full items-center justify-start gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition",
                  activeSection === "upgrade-plan"
                    ? "bg-[#004A96] text-white shadow-sm"
                    : "text-slate-700 hover:bg-slate-100"
                )}
                onClick={() => setActiveSection("upgrade-plan")}
              >
                <Crown className="h-[18px] w-[18px] shrink-0" />
                <span className="truncate">Upgrade Plan</span>
              </button>
            </div>

            {/* Help & Support */}
            <div>
              <button
                type="button"
                className={cn(
                  "flex w-full items-center justify-start gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition",
                  activeSection === "Help & Support"
                    ? "bg-[#004A96] text-white shadow-sm"
                    : "text-slate-700 hover:bg-slate-100"
                )}
                onClick={() => setActiveSection("Help & Support")}
              >
                <Headphones className="h-[18px] w-[18px] shrink-0" />
                <span className="truncate">Help & Support</span>
              </button>
            </div>

            {/* Settings */}
            <div>
              <button
                type="button"
                className={cn(
                  "flex w-full items-center justify-start gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition",
                  activeSection === "settings"
                    ? "bg-[#004A96] text-white shadow-sm"
                    : "text-slate-700 hover:bg-slate-100"
                )}
                onClick={() => setActiveSection("settings")}
              >
                <Settings className="h-[18px] w-[18px] shrink-0" />
                <span className="truncate">Settings</span>
              </button>
            </div>

          </nav>
        </div>

        {/* Footer: Logout */}
        <div className="mt-2 shrink-0 border-t border-slate-100 px-3 pt-4">
          <Button
            type="button"
            onClick={handleSignOut}
            className="flex w-full items-center justify-center gap-2 text-white hover:opacity-95"
            style={{ backgroundColor: VISITOR_ACCENT }}
            size="sm"
          >
            <LogOut size={16} className="shrink-0" />
            <span>Logout</span>
          </Button>
        </div>
      </div>
    )

    return (
      <div className="contents">
        {/* Mobile overlay */}
        {isMobileSidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden"
            onClick={() => setIsMobileSidebarOpen(false)}
            aria-hidden
          />
        )}

        {/* Sidebar */}
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

  const displayName =
    userData?.displayName?.trim() ||
    [userData?.firstName, userData?.lastName].filter(Boolean).join(" ").trim()

  const showShellHeader = Boolean(
    !loading && !error && userData && activeSection !== "profile" && activeSection !== "dashboard"
  )

  return (
    <div className="flex min-h-0 flex-1 w-full overflow-hidden bg-white">
      {renderSidebar()}

      <div className="relative flex min-h-0 min-w-0 flex-1 flex-col">
        {/* Mobile topbar */}
        <div className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 md:hidden">
          <Button
            variant="ghost"
            size="sm"
            className="text-[#004A96]"
            onClick={() => setIsMobileSidebarOpen(true)}
          >
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

// ── Helpers ──────────────────────────────────────────────────────────────────

function menuItemClass(activeSection: string, id: string) {
  return cn(
    "cursor-pointer border-l-4 py-1.5 pl-3 text-sm transition-colors",
    activeSection === id
      ? "border-[#004A96] font-semibold text-[#004A96]"
      : "border-transparent text-slate-600 hover:text-[#004A96]"
  )
}

const MENU_SECTIONS: Record<string, string[]> = {
  dashboard: ["profile"],
  event: ["events", "past-events", "wishlist", "upcoming-events", "favourites", "recommended-events"],
  networking: ["connections", "messages"],
  exhibitor: ["my-appointments", "exhibitor-schedule", "Suggested"],
  tools: ["travel", "schedule"],
  recommendations: ["recommended-events"],
  settings: ["settings", "upgrade-plan"],
}

function isMenuGroupActive(activeSection: string, menuId: string): boolean {
  return MENU_SECTIONS[menuId]?.includes(activeSection) ?? false
}