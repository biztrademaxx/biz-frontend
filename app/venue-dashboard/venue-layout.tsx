"use client"

import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import { apiFetch, getCurrentUserId } from "@/lib/api"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import {
  Building2,
  MessageSquare,
  Star,
  HelpCircle,
  ChevronDown,
  ChevronRight,
  Settings,
  X,
  AlertCircle,
  ChevronsLeft,
  ChevronsRight,
  CalendarDays,
  BookmarkCheck,
  Users,
  LogOut,
  Menu,
  type LucideIcon,
} from "lucide-react"
import { useRouter, usePathname } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

// Import all section components
import VenueProfile from "./venue-profile"
import EventManagement from "./event-management"
import BookingSystem from "./booking-system"
import CommunicationCenter from "./communication-center"
import LegalDocumentation from "./legal-documentation"
import { VenueSettings } from "./venue-settings"
import { MeetingSpace } from "@prisma/client"
import { ConnectionsSection } from "../dashboard/connections-section"
import { HelpSupport } from "@/components/HelpSupport"
import VenueFeedbackManagement from "./ratings-reviews"
import { useDashboard } from "@/contexts/dashboard-context"
import { DashboardManagedBanner } from "@/components/dashboard-managed-banner"
import { getVenueDashboardPath } from "@/lib/venue-dashboard-path"
import { VenueDashboardVenueIdProvider } from "@/contexts/venue-dashboard-venue-id"

/** True when venue is not yet approved for the public /venues directory (manager.isVerified). */
function venuePayloadUnderReview(payload: unknown): boolean {
  if (!payload || typeof payload !== "object") return false
  const o = payload as Record<string, unknown>
  const m = o.manager
  if (m && typeof m === "object" && "isVerified" in m) {
    return (m as { isVerified?: boolean }).isVerified !== true
  }
  if (typeof o.isVerified === "boolean") {
    return !o.isVerified
  }
  return false
}

type VenueData = {
  id: string
  /** Resolved venue display name (for canonical dashboard URL slug). */
  venueName: string
  logo: string
  contactPerson: string
  email: string
  mobile: string
  address: string
  website: string
  description: string
  city: string
  state: string
  country: string
  zipCode: string
  venueImages: string[]
  venueVideos: string[]
  floorPlans: string[]
  virtualTour: string
  latitude: number
  longitude: number
  basePrice: number
  currency: string
  maxCapacity: number
  totalHalls: number
  totalEvents: number
  activeBookings: number
  averageRating: number
  totalReviews: number
  amenities: string[]
  meetingSpaces: MeetingSpace[]
  /** Present on API payload via `location.timezone`; optional for legacy shapes. */
  timezone?: string
  manager?: { isVerified?: boolean; [key: string]: unknown }
}

interface UserDashboardProps {
  /** UUID or slug from `/venue-dashboard/[segment]`. */
  routeSegment: string
}

const SIDEBAR_COLLAPSED_KEY = "venue-dashboard-sidebar-collapsed"

const COLLAPSED_NAV: { id: string; label: string; icon: LucideIcon }[] = [
  { id: "venue-profile", label: "Venue Profile", icon: Building2 },
  { id: "event-management", label: "Event Management", icon: CalendarDays },
  { id: "booking-system", label: "Booking System", icon: BookmarkCheck },
  { id: "communication", label: "Messages", icon: MessageSquare },
  { id: "connection", label: "Connections", icon: Users },
  { id: "ratings-reviews", label: "Ratings & Reviews", icon: Star },
  { id: "help-support", label: "Help & Support", icon: HelpCircle },
  { id: "settings", label: "Settings", icon: Settings },
]

export default function VenueDashboardPage({ routeSegment }: UserDashboardProps) {
  const { activeSection, setActiveSection } = useDashboard()
  const [venueData, setVenueData] = useState<VenueData | null>(null)
  const [accountUnderReview, setAccountUnderReview] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [openMenus, setOpenMenus] = useState<string[]>(["venue-management", "communication", "reviews-legal"])
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const { role, loading: authLoading, logout } = useAuth({ requireAuth: true, allowedRoles: ["VENUE_MANAGER"] })
  const router = useRouter()
  const pathname = usePathname()
  const { toast } = useToast()

  // 👇 Set Venue Profile as default tab when dashboard loads
  useEffect(() => {
    if (!activeSection) {
      setActiveSection("venue-profile")
    }
  }, [activeSection, setActiveSection])

  useEffect(() => {
    try {
      setSidebarCollapsed(localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === "1")
    } catch {
      /* ignore */
    }
  }, [])

  const toggleSidebarCollapsed = () => {
    setSidebarCollapsed((c) => {
      const next = !c
      try {
        localStorage.setItem(SIDEBAR_COLLAPSED_KEY, next ? "1" : "0")
      } catch {
        /* ignore */
      }
      return next
    })
  }

  useEffect(() => {
    if (authLoading) return
    const roleUpper = (role || "").toString().toUpperCase()
    if (roleUpper !== "VENUE_MANAGER") {
      toast({
        title: "Access Denied",
        description: "You don't have permission to view this dashboard.",
        variant: "destructive",
      })
      router.push("/")
      return
    }

    fetchVenueData()
  }, [routeSegment, authLoading, role, router, toast])

  useEffect(() => {
    if (!venueData?.id || authLoading) return
    const sessionUser = getCurrentUserId()
    if (sessionUser && sessionUser !== venueData.id) {
      toast({
        title: "Access denied",
        description: "You can only open your own venue dashboard.",
        variant: "destructive",
      })
      router.replace("/login")
    }
  }, [venueData?.id, authLoading, router, toast])

  useEffect(() => {
    if (!venueData?.id) return
    const name = venueData.venueName?.trim() ? venueData.venueName : null
    const canonical = getVenueDashboardPath(venueData.id, name)
    if (pathname && canonical !== pathname) {
      router.replace(canonical)
    }
  }, [venueData?.id, venueData?.venueName, pathname, router])

  const fetchVenueData = async () => {
    try {
      setLoading(true)
      setError(null)
      setAccountUnderReview(false)

      const data = await apiFetch<{
        data?: unknown
        user?: { venue?: unknown }
        venue?: unknown
      }>(`/api/venue-manager/${encodeURIComponent(routeSegment)}`)

      const payload =
        data.data ?? data.user?.venue ?? data.venue ?? data.user ?? null
      if (!payload) throw new Error("Invalid data structure in response")
      const raw = payload as Record<string, unknown>
      const mgr = raw.manager as { venueName?: string } | undefined
      const merged = {
        ...raw,
        venueName: (mgr?.venueName ?? (typeof raw.name === "string" ? raw.name : "")) || "",
      } as VenueData
      setVenueData(merged)
      setAccountUnderReview(venuePayloadUnderReview(payload))

    } catch (err: unknown) {
      console.error("Error fetching user data:", err)
      setAccountUnderReview(false)

      const status =
        typeof err === "object" && err !== null && "status" in err
          ? Number((err as { status?: number }).status)
          : undefined
      const is404 = status === 404
      const is403 = status === 403

      const message =
        is404 ? "User not found" : is403 ? "Access denied" : err instanceof Error ? err.message : "An error occurred"
      setError(message)

      if (is404 || is403) {
        toast({
          title: "Error",
          description: message,
          variant: "destructive",
        })
        router.push("/login")
      }
    } finally {
      setLoading(false)
    }
  }

  const toggleMenu = (menu: string) => {
    setOpenMenus((prev) => (prev.includes(menu) ? prev.filter((m) => m !== menu) : [...prev, menu]))
  }

  const menuItemClass = (sectionId: string) =>
    cn(
      "cursor-pointer w-full rounded-xl py-2 pl-3 pr-2 text-left text-sm transition-colors",
      activeSection === sectionId
        ? "bg-slate-100/95 font-semibold text-[#8A70D6] shadow-sm shadow-violet-100/40"
        : "text-slate-500 hover:bg-white/60 hover:text-slate-800",
    )

  if (loading) {
    return (
      <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-[#eef1f8]">
        <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden>
          <div className="absolute -top-24 -left-20 h-[28rem] w-[28rem] rounded-full bg-violet-400/30 blur-3xl" />
          <div className="absolute top-1/3 -right-16 h-[24rem] w-[24rem] rounded-full bg-sky-300/40 blur-3xl" />
        </div>
        <div className="relative z-10 h-14 w-14 animate-spin rounded-full border-2 border-violet-200 border-t-violet-600" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-[#eef1f8] px-4">
        <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden>
          <div className="absolute -top-24 -left-20 h-[28rem] w-[28rem] rounded-full bg-violet-400/30 blur-3xl" />
          <div className="absolute top-1/3 -right-16 h-[24rem] w-[24rem] rounded-full bg-sky-300/40 blur-3xl" />
        </div>
        <Card className="relative z-10 w-full max-w-md rounded-3xl border border-white/90 bg-white/85 shadow-[0_20px_60px_-15px_rgba(79,70,229,0.14)] backdrop-blur-md">
          <CardHeader>
            <CardTitle className="text-red-600">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-slate-600">{error}</p>
            <Button
              onClick={fetchVenueData}
              className="w-full rounded-2xl bg-gradient-to-r from-violet-600 to-sky-500 text-white hover:from-violet-500 hover:to-sky-400"
            >
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!venueData) {
    return (
      <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-[#eef1f8] px-4">
        <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden>
          <div className="absolute -top-24 -left-20 h-[28rem] w-[28rem] rounded-full bg-violet-400/30 blur-3xl" />
          <div className="absolute top-1/3 -right-16 h-[24rem] w-[24rem] rounded-full bg-sky-300/40 blur-3xl" />
        </div>
        <Card className="relative z-10 w-full max-w-md rounded-3xl border border-white/90 bg-white/85 shadow-[0_20px_60px_-15px_rgba(79,70,229,0.14)] backdrop-blur-md">
          <CardHeader>
            <CardTitle className="text-slate-800">No Data</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-600">No venue data found.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const renderContent = () => {
    switch (activeSection) {
      case "venue-profile":
        return <VenueProfile venueData={venueData} />
      case "event-management":
        return <EventManagement />
      case "booking-system":
        return <BookingSystem venueId={venueData.id} />
      case "communication":
        return <CommunicationCenter params={{ id: venueData.id }} />
      case "connection":
        return <ConnectionsSection userId={venueData.id} />
      case "ratings-reviews":
        return <VenueFeedbackManagement venueId={venueData.id} />
      case "legal-documentation":
        return <LegalDocumentation venueId={venueData.id} />
      case "help-support":
        return <HelpSupport variant="venue" />
      case "settings":
        return (
          <VenueSettings
          />
        )
      default:
        // 👇 Fallback if something breaks
        return <VenueProfile venueData={venueData} />
    }
  }

  return (
    <VenueDashboardVenueIdProvider venueUserId={venueData.id}>
    <div className="relative flex min-h-screen w-full overflow-x-hidden bg-gradient-to-br from-slate-100 via-[#eef1fb] to-sky-50/40">
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden>
        <div className="absolute -top-32 -left-28 h-[26rem] w-[26rem] rounded-full bg-violet-400/22 blur-3xl" />
        <div className="absolute top-[18%] -right-24 h-[22rem] w-[22rem] rounded-full bg-sky-300/30 blur-3xl" />
        <div className="absolute bottom-10 left-[35%] h-64 w-64 rounded-full bg-indigo-300/18 blur-3xl" />
      </div>

      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/35 backdrop-blur-[2px] md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="relative z-10 flex min-h-screen w-full flex-1 md:items-stretch md:gap-2 md:px-3 md:pb-4 md:pt-2">
      {/* Sidebar: frosted rail on desktop; drawer on mobile */}
      <aside
        className={cn(
          "fixed z-50 flex min-h-screen w-64 shrink-0 flex-col overflow-y-auto overflow-x-hidden transition-[width,transform] duration-300 ease-out",
          "border-r border-violet-200/35 bg-white/90 backdrop-blur-lg md:min-h-0 md:rounded-2xl md:border md:border-white/80 md:bg-white/55 md:shadow-[0_12px_40px_-12px_rgba(138,112,214,0.15)] md:backdrop-blur-xl md:ring-1 md:ring-violet-100/40",
          "md:sticky md:top-2 md:h-[calc(100vh-1rem)] md:self-start",
          sidebarCollapsed ? "md:w-[4.75rem]" : "md:w-[232px]",
          sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
        )}
      >
        {/* Desktop: logo row + collapse */}
        <div
          className={cn(
            "hidden shrink-0 items-center gap-2 px-3 pb-3 pt-3 md:flex",
            sidebarCollapsed ? "flex-col justify-center px-1 pt-3" : "justify-between",
          )}
        >
          {!sidebarCollapsed && (
            <div className="min-w-0 flex-1 pt-0.5">
              <p className="text-lg font-bold leading-tight tracking-tight text-[#8A70D6]">BizTradeFairs</p>
              <p
                className="mt-0.5 truncate text-[11px] font-medium text-slate-400"
                title={venueData.venueName || undefined}
              >
                {venueData.venueName?.trim() ? venueData.venueName : "Venue dashboard"}
              </p>
            </div>
          )}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className={cn(
                  "h-9 w-9 shrink-0 rounded-xl text-slate-500 hover:bg-white/50 hover:text-[#8A70D6]",
                  sidebarCollapsed && "mt-1",
                )}
                onClick={toggleSidebarCollapsed}
                aria-expanded={!sidebarCollapsed}
                aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              >
                {sidebarCollapsed ? <ChevronsRight className="h-5 w-5" /> : <ChevronsLeft className="h-5 w-5" />}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">{sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}</TooltipContent>
          </Tooltip>
        </div>

        <div className="flex items-center justify-between border-b border-violet-200/20 px-3 py-3 md:hidden">
          <h2 className="text-base font-semibold text-slate-800">Venue Menu</h2>
          <Button variant="ghost" size="sm" onClick={() => setSidebarOpen(false)} className="rounded-xl">
            <X className="h-4 w-4 text-slate-600" />
          </Button>
        </div>

        {/* Mobile: full menu */}
        <div className="flex-1 overflow-y-auto p-3 md:hidden">
          <div className="mb-4">
            <button
              type="button"
              className="flex w-full items-center justify-between rounded-xl py-2.5 pl-2 pr-1 text-sm font-medium text-slate-600 transition-colors hover:bg-white/60"
              onClick={() => toggleMenu("venue-management")}
            >
              <span className="flex items-center gap-2">
                <Building2 size={16} className="text-slate-400" />
                Venue Management
              </span>
              {openMenus.includes("venue-management") ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </button>
            {openMenus.includes("venue-management") && (
              <div className="ml-2 mt-2 space-y-1">
                <button type="button" onClick={() => { setActiveSection("venue-profile"); setSidebarOpen(false) }} className={menuItemClass("venue-profile")}>
                  Venue Profile
                </button>
                <button type="button" onClick={() => { setActiveSection("event-management"); setSidebarOpen(false) }} className={menuItemClass("event-management")}>
                  Event Management
                </button>
                <button type="button" onClick={() => { setActiveSection("booking-system"); setSidebarOpen(false) }} className={menuItemClass("booking-system")}>
                  Booking System
                </button>
              </div>
            )}
          </div>
          <div className="mb-4">
            <button
              type="button"
              className="flex w-full items-center justify-between rounded-xl py-2.5 pl-2 pr-1 text-sm font-medium text-slate-600 transition-colors hover:bg-white/60"
              onClick={() => toggleMenu("communication")}
            >
              <span className="flex items-center gap-2">
                <MessageSquare size={16} className="text-slate-400" />
                Communication
              </span>
              {openMenus.includes("communication") ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </button>
            {openMenus.includes("communication") && (
              <div className="ml-2 mt-2 space-y-1">
                <button type="button" onClick={() => { setActiveSection("communication"); setSidebarOpen(false) }} className={menuItemClass("communication")}>
                  Messages
                </button>
                <button type="button" onClick={() => { setActiveSection("connection"); setSidebarOpen(false) }} className={menuItemClass("connection")}>
                  Connections
                </button>
              </div>
            )}
          </div>
          <div className="mb-4">
            <button
              type="button"
              className="flex w-full items-center justify-between rounded-xl py-2.5 pl-2 pr-1 text-sm font-medium text-slate-600 transition-colors hover:bg-white/60"
              onClick={() => toggleMenu("reviews-legal")}
            >
              <span className="flex items-center gap-2">
                <Star size={16} className="text-slate-400" />
                Reviews & Legal
              </span>
              {openMenus.includes("reviews-legal") ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </button>
            {openMenus.includes("reviews-legal") && (
              <div className="ml-2 mt-2 space-y-1">
                <button type="button" onClick={() => { setActiveSection("ratings-reviews"); setSidebarOpen(false) }} className={menuItemClass("ratings-reviews")}>
                  Ratings & Reviews
                </button>
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={() => { setActiveSection("help-support"); setSidebarOpen(false) }}
            className={cn(
              "flex w-full items-center gap-2 rounded-xl py-2.5 pl-2 text-sm font-medium transition-colors",
              activeSection === "help-support"
                ? "bg-slate-100/95 font-semibold text-[#8A70D6] shadow-sm shadow-violet-100/40"
                : "text-slate-500 hover:bg-white/60",
            )}
          >
            <HelpCircle size={16} className={cn(activeSection === "help-support" ? "text-[#8A70D6]" : "text-slate-400")} />
            Help & Support
          </button>
          <button
            type="button"
            onClick={() => { setActiveSection("settings"); setSidebarOpen(false) }}
            className={cn(
              "mt-1 flex w-full items-center gap-2 rounded-xl py-2.5 pl-2 text-sm font-medium transition-colors",
              activeSection === "settings"
                ? "bg-slate-100/95 font-semibold text-[#8A70D6] shadow-sm shadow-violet-100/40"
                : "text-slate-500 hover:bg-white/60",
            )}
          >
            <Settings size={16} className={cn(activeSection === "settings" ? "text-[#8A70D6]" : "text-slate-400")} />
            Settings
          </button>
          <Button
            type="button"
            onClick={() => logout()}
            className="mt-8 w-full rounded-2xl border border-red-200/90 bg-white text-red-600 shadow-sm hover:bg-red-50"
            variant="outline"
          >
            Logout
          </Button>
        </div>

        {/* Desktop expanded */}
        <div className={cn("hidden flex-1 overflow-y-auto p-3 md:block", sidebarCollapsed && "md:hidden")}>
          <div className="mb-3">
            <button
              type="button"
              className="flex w-full items-center justify-between rounded-xl py-2.5 pl-2 pr-1 text-sm font-medium text-slate-600 transition-colors hover:bg-white/60"
              onClick={() => toggleMenu("venue-management")}
            >
              <span className="flex items-center gap-2">
                <Building2 size={16} className="text-slate-400" />
                Venue Management
              </span>
              {openMenus.includes("venue-management") ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </button>
            {openMenus.includes("venue-management") && (
              <div className="ml-2 mt-2 space-y-1">
                <button type="button" onClick={() => setActiveSection("venue-profile")} className={menuItemClass("venue-profile")}>
                  Venue Profile
                </button>
                <button type="button" onClick={() => setActiveSection("event-management")} className={menuItemClass("event-management")}>
                  Event Management
                </button>
                <button type="button" onClick={() => setActiveSection("booking-system")} className={menuItemClass("booking-system")}>
                  Booking System
                </button>
              </div>
            )}
          </div>
          <div className="mb-3">
            <button
              type="button"
              className="flex w-full items-center justify-between rounded-xl py-2.5 pl-2 pr-1 text-sm font-medium text-slate-600 transition-colors hover:bg-white/60"
              onClick={() => toggleMenu("communication")}
            >
              <span className="flex items-center gap-2">
                <MessageSquare size={16} className="text-slate-400" />
                Communication
              </span>
              {openMenus.includes("communication") ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </button>
            {openMenus.includes("communication") && (
              <div className="ml-2 mt-2 space-y-1">
                <button type="button" onClick={() => setActiveSection("communication")} className={menuItemClass("communication")}>
                  Messages
                </button>
                <button type="button" onClick={() => setActiveSection("connection")} className={menuItemClass("connection")}>
                  Connections
                </button>
              </div>
            )}
          </div>
          <div className="mb-3">
            <button
              type="button"
              className="flex w-full items-center justify-between rounded-xl py-2.5 pl-2 pr-1 text-sm font-medium text-slate-600 transition-colors hover:bg-white/60"
              onClick={() => toggleMenu("reviews-legal")}
            >
              <span className="flex items-center gap-2">
                <Star size={16} className="text-slate-400" />
                Reviews & Legal
              </span>
              {openMenus.includes("reviews-legal") ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </button>
            {openMenus.includes("reviews-legal") && (
              <div className="ml-2 mt-2 space-y-1">
                <button type="button" onClick={() => setActiveSection("ratings-reviews")} className={menuItemClass("ratings-reviews")}>
                  Ratings & Reviews
                </button>
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={() => setActiveSection("help-support")}
            className={cn(
              "flex w-full items-center gap-2 rounded-xl py-2.5 pl-2 text-sm font-medium transition-colors",
              activeSection === "help-support"
                ? "bg-slate-100/95 font-semibold text-[#8A70D6] shadow-sm shadow-violet-100/40"
                : "text-slate-500 hover:bg-white/60",
            )}
          >
            <HelpCircle size={16} className={cn(activeSection === "help-support" ? "text-[#8A70D6]" : "text-slate-400")} />
            Help & Support
          </button>
          <button
            type="button"
            onClick={() => setActiveSection("settings")}
            className={cn(
              "mt-1 flex w-full items-center gap-2 rounded-xl py-2.5 pl-2 text-sm font-medium transition-colors",
              activeSection === "settings"
                ? "bg-slate-100/95 font-semibold text-[#8A70D6] shadow-sm shadow-violet-100/40"
                : "text-slate-500 hover:bg-white/60",
            )}
          >
            <Settings size={16} className={cn(activeSection === "settings" ? "text-[#8A70D6]" : "text-slate-400")} />
            Settings
          </button>
          <Button
            type="button"
            onClick={() => logout()}
            className="mt-6 w-full rounded-2xl border border-red-200/90 bg-white text-red-600 shadow-sm hover:bg-red-50"
            variant="outline"
          >
            Logout
          </Button>
        </div>

        {/* Desktop collapsed: icon rail */}
        <div
          className={cn(
            "hidden min-h-0 flex-1 flex-col gap-1 overflow-y-auto px-1.5 pb-3 pt-1",
            sidebarCollapsed ? "md:flex" : "md:hidden",
          )}
        >
          {COLLAPSED_NAV.map(({ id, label, icon: Icon }) => (
            <Tooltip key={id}>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={() => setActiveSection(id)}
                  className={cn(
                    "mx-auto flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-all",
                    activeSection === id
                      ? "bg-gradient-to-br from-[#8A70D6] to-violet-500 text-white shadow-md shadow-[#8A70D6]/30"
                      : "text-slate-500 hover:bg-white/40",
                  )}
                  aria-label={label}
                >
                  <Icon className="h-5 w-5 shrink-0" strokeWidth={1.75} />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right" className="font-medium">
                {label}
              </TooltipContent>
            </Tooltip>
          ))}
          <div className="mt-auto border-t border-violet-200/25 pt-3">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="mx-auto flex h-11 w-11 rounded-xl border-red-200/90 text-red-600 hover:bg-red-50"
                  onClick={() => logout()}
                  aria-label="Logout"
                >
                  <LogOut className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">Logout</TooltipContent>
            </Tooltip>
          </div>
        </div>
      </aside>

      {/* Main Content — full width of column (no mx-auto: that caused a huge gap next to the sidebar) */}
      <div className="relative z-10 flex min-h-0 min-w-0 flex-1 flex-col">
        <main className="min-h-0 w-full min-w-0 flex-1 overflow-auto md:py-0.5">
          <div className="h-full w-full max-w-none rounded-[24px] border border-white/90 bg-white px-4 py-5 shadow-[0_20px_64px_-20px_rgba(138,112,214,0.28)] sm:px-6 md:min-h-[calc(100vh-1rem)] md:rounded-[30px] md:px-8 md:py-7">
            <div className="mb-4 flex items-center gap-2 md:hidden">
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="shrink-0 rounded-xl border-slate-200/80 bg-white shadow-sm"
                onClick={() => setSidebarOpen(true)}
                aria-label="Open navigation"
              >
                <Menu className="h-5 w-5 text-slate-700" />
              </Button>
              <span className="truncate text-sm font-semibold text-slate-800">{venueData.venueName || "Venue"}</span>
            </div>
            <DashboardManagedBanner page="venue-dashboard" />
            {accountUnderReview && (
              <Alert
                className="mb-4 rounded-2xl border-amber-200/80 bg-amber-50/90 text-amber-950 shadow-sm backdrop-blur-sm [&>svg]:text-amber-700"
                role="status"
              >
                <AlertCircle className="h-4 w-4" aria-hidden />
                <AlertTitle>Your account is under review</AlertTitle>
                <AlertDescription className="text-amber-900/90">
                  Our team is reviewing your venue before it can appear on the public venues directory. You can
                  continue using this dashboard to complete your profile and settings. We will notify you when your
                  listing is live.
                </AlertDescription>
              </Alert>
            )}
            <div className="min-h-0 w-full">{renderContent()}</div>
          </div>
        </main>
      </div>
      </div>
    </div>
    </VenueDashboardVenueIdProvider>
  )
}
