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
  Crown,
  TrendingUp,
  Headphones,
  User,
  X,
  MessageSquare,
  Heart,
  type LucideIcon,
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
// import RecommendedEvents from "./recommended-events"
import Schedule from "./Schedule"
import { HelpSupport } from "@/components/HelpSupport"
import { useDashboard } from "@/contexts/dashboard-context"
import { DashboardManagedBanner } from "@/components/dashboard-managed-banner"
import { cn } from "@/lib/utils"
import { DashboardOverview } from "./dashboard-overview"
import { DashboardPricingPlansView } from "@/components/dashboard-packages"
import { AppImage } from "@/components/app-image"
import {
  orgNavActive,
  orgNavGroupLabel,
  orgNavInactive,
  orgPrimaryBtn,
  orgSidebarSurface,
} from "@/app/organizer-dashboard/organizer-dashboard-theme"

type SidebarNavItem = { id: string; title: string; icon: LucideIcon }

const VISITOR_SIDEBAR_GROUPS: { id: string; label: string; items: SidebarNavItem[] }[] = [
  {
    id: "dashboard",
    label: "Main",
    items: [
      { id: "dashboard", title: "Dashboard Overview", icon: LayoutDashboard },
      { id: "profile", title: "Profile", icon: User },
    ],
  },
  {
    id: "event",
    label: "My Events",
    items: [
      { id: "events", title: "Interested Events", icon: Calendar },
      { id: "past-events", title: "Past Events", icon: Calendar },
      { id: "wishlist", title: "Saved Events", icon: Heart },
    ],
  },
  {
    id: "networking",
    label: "Networking",
    items: [
      { id: "connections", title: "My Connections", icon: Network },
      { id: "messages", title: "Messages", icon: MessageSquare },
    ],
  },
  {
    id: "exhibitor",
    label: "My Exhibitors",
    items: [
      { id: "my-appointments", title: "Exhibitor Appointments", icon: Store },
      { id: "Suggested", title: "Suggested", icon: TrendingUp },
    ],
  },
  {
    id: "tools",
    label: "Event Planning",
    items: [
      { id: "travel", title: "Travel & Stay", icon: List },
      { id: "schedule", title: "Schedule", icon: Calendar },
    ],
  },
]

const VISITOR_INDIVIDUAL_ITEMS: SidebarNavItem[] = [
  // { id: "recommended-events", title: "Recommendations", icon: TrendingUp },
  { id: "upgrade-plan", title: "Upgrade Plan", icon: Crown },
  { id: "Help & Support", title: "Help & Support", icon: Headphones },
  { id: "settings", title: "Settings", icon: Settings },
]

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

  const [openMenus, setOpenMenus] = useState<string[]>([
    "dashboard",
    "event",
    "networking",
    "exhibitor",
    "tools",
  ])
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

  useEffect(() => {
    const groupId = getVisitorGroupForSection(activeSection)
    if (groupId) {
      setOpenMenus((prev) => (prev.includes(groupId) ? prev : [...prev, groupId]))
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
      // case "recommended-events":
      //   return <RecommendedEvents userId={resolvedUserId} interests={userInterests} />
      // case "Suggested":
      //   return <Recommendations />
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
    const sidebarName =
      userData?.displayName?.trim() ||
      [userData?.firstName, userData?.lastName].filter(Boolean).join(" ").trim() ||
      "Visitor"
    const sidebarInitial = (userData?.firstName?.[0] || userData?.lastName?.[0] || "V").toUpperCase()

    const sidebarContent = (
      <div className={cn("flex h-full w-[260px] flex-col overflow-hidden", orgSidebarSurface)}>
        <div className="flex items-center justify-between border-b border-slate-200 p-4 md:hidden">
          <h2 className="text-lg font-semibold text-slate-900">Menu</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMobileSidebarOpen(false)}
            className="text-slate-600"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {!loading && userData && (
          <div className="border-b border-slate-100 px-4 py-4">
            <div className="flex items-center gap-3">
              <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full bg-blue-50 ring-2 ring-blue-100">
                {userData.avatar ? (
                  <AppImage
                    src={userData.avatar}
                    alt={sidebarName}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-sm font-bold text-[#004A96]">
                    {sidebarInitial}
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-900">{sidebarName}</p>
                <p className="text-xs text-slate-500">Visitor Dashboard</p>
              </div>
            </div>
          </div>
        )}

        <div className="scrollbar-hover min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-3 py-4">
          <nav className="text-sm">
            {VISITOR_SIDEBAR_GROUPS.map((group) => (
              <div key={group.id} className="mb-5">
                <button
                  type="button"
                  className={cn(
                    "mb-1 flex w-full cursor-pointer items-center justify-between rounded-md px-2 py-1.5",
                    orgNavGroupLabel,
                  )}
                  onClick={() => toggleMenu(group.id)}
                >
                  <span>{group.label}</span>
                  {openMenus.includes(group.id) ? (
                    <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
                  ) : (
                    <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
                  )}
                </button>
                {openMenus.includes(group.id) && (
                  <div className="space-y-0.5">
                    {group.items.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setActiveSection(item.id)}
                        className={cn(
                          "flex w-full items-center gap-3 py-2.5 pr-3 text-sm transition-colors",
                          activeSection === item.id ? orgNavActive : orgNavInactive,
                        )}
                      >
                        <item.icon className="h-4 w-4 shrink-0" />
                        <span className="truncate">{item.title}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            <div className="mt-2 space-y-0.5 border-t border-slate-200 pt-4">
              {VISITOR_INDIVIDUAL_ITEMS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveSection(item.id)}
                  className={cn(
                    "flex w-full items-center gap-3 py-2.5 pr-3 text-sm transition-colors",
                    activeSection === item.id ? orgNavActive : orgNavInactive,
                  )}
                >
                  <item.icon className="h-4 w-4 shrink-0" />
                  <span className="truncate">{item.title}</span>
                </button>
              ))}
            </div>
          </nav>
        </div>

        <div className="shrink-0 border-t border-slate-200 p-4">
          <Button
            type="button"
            onClick={handleSignOut}
            className={cn("h-10 w-full rounded-lg bg-red-600 text-white hover:bg-red-700")}
          >
            <LogOut className="mr-2 h-4 w-4" />
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
          {/* Removed the greeting header */}

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

function getVisitorGroupForSection(section: string): string | null {
  for (const group of VISITOR_SIDEBAR_GROUPS) {
    if (group.items.some((item) => item.id === section)) {
      return group.id
    }
  }
  return null
}