"use client"

import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import { apiFetch, getCurrentUserId } from "@/lib/api"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  Building2,
  MessageSquare,
  Star,
  HelpCircle,
  Settings,
  X,
  AlertCircle,
  CalendarDays,
  BookmarkCheck,
  Users,
  LogOut,
  LayoutDashboard,
  MapPin,
  Clock,
  ChevronRight,
  CheckCircle,
} from "lucide-react"
import { useRouter, usePathname } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { AppImage } from "@/components/app-image"

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
import {
  venueNavActive,
  venueNavGroupLabel,
  venueNavInactive,
  venuePageBg,
  venuePageHeader,
  venueSidebarSurface,
} from "./venue-dashboard-theme"

// Type definitions for nested objects
interface CapacityObject {
  total?: number;
  halls?: number;
}

interface StatsObject {
  totalEvents?: number;
  activeBookings?: number;
  averageRating?: number;
  totalReviews?: number;
}

interface LocationObject {
  timezone?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  coordinates?: { lat?: number; lng?: number };
}

interface RawVenueData {
  id?: string;
  name?: string;
  logo?: string;
  images?: string[];
  contactPerson?: string;
  email?: string;
  mobile?: string;
  address?: string;
  website?: string;
  description?: string;
  city?: string;
  state?: string;
  country?: string;
  zipCode?: string;
  venueImages?: string[];
  venueVideos?: string[];
  floorPlans?: string[];
  virtualTour?: string;
  latitude?: number;
  longitude?: number;
  basePrice?: number;
  currency?: string;
  maxCapacity?: number;
  totalHalls?: number;
  totalEvents?: number;
  activeBookings?: number;
  averageRating?: number;
  totalReviews?: number;
  amenities?: string[];
  meetingSpaces?: MeetingSpace[];
  timezone?: string;
  capacity?: CapacityObject;
  stats?: StatsObject;
  location?: LocationObject;
  manager?: {
    venueName?: string;
    name?: string;
    email?: string;
    phone?: string;
    isVerified?: boolean;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

function venuePayloadUnderReview(payload: unknown): boolean {
  if (!payload || typeof payload !== "object") return false
  const o = payload as Record<string, unknown>
  const m = o.manager
  if (m && typeof m === "object" && "isVerified" in m) {
    return (m as { isVerified?: boolean }).isVerified !== true
  }
  if (typeof o.isVerified === "boolean") return !o.isVerified
  return false
}

type VenueData = {
  id: string
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
  timezone?: string
  manager?: { isVerified?: boolean;[key: string]: unknown }
}

interface UserDashboardProps {
  routeSegment: string
}

interface Booking {
  id: string
  requester: {
    firstName: string
    lastName: string
    email: string
  }
  requesterPhone?: string
  requesterCompany?: string
  requestedDate: string
  requestedTime: string
  duration: number
  purpose?: string
  status: string
  notes?: string
}

export default function VenueDashboardPage({ routeSegment }: UserDashboardProps) {
  const { activeSection, setActiveSection } = useDashboard()
  const [venueData, setVenueData] = useState<VenueData | null>(null)
  const [accountUnderReview, setAccountUnderReview] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { role, loading: authLoading, logout } = useAuth({ requireAuth: true, allowedRoles: ["VENUE_MANAGER"] })
  const router = useRouter()
  const pathname = usePathname()
  const { toast } = useToast()

  useEffect(() => {
    if (!activeSection) setActiveSection("dashboard")
  }, [activeSection, setActiveSection])

  useEffect(() => {
    if (authLoading) return
    const roleUpper = (role || "").toString().toUpperCase()
    if (roleUpper !== "VENUE_MANAGER") {
      toast({ title: "Access Denied", description: "You don't have permission to view this dashboard.", variant: "destructive" })
      router.push("/")
      return
    }
    fetchVenueData()
  }, [routeSegment, authLoading, role, router, toast])

  useEffect(() => {
    if (!venueData?.id || authLoading) return
    const sessionUser = getCurrentUserId()
    if (sessionUser && sessionUser !== venueData.id) {
      toast({ title: "Access denied", description: "You can only open your own venue dashboard.", variant: "destructive" })
      router.replace("/login")
    }
  }, [venueData?.id, authLoading, router, toast])

  useEffect(() => {
    if (!venueData?.id) return
    const name = venueData.venueName?.trim() ? venueData.venueName : null
    const canonical = getVenueDashboardPath(venueData.id, name)
    if (pathname && canonical !== pathname) router.replace(canonical)
  }, [venueData?.id, venueData?.venueName, pathname, router])

  const fetchVenueData = async () => {
    try {
      setLoading(true)
      setError(null)
      setAccountUnderReview(false)
      const data = await apiFetch<{ data?: unknown; user?: { venue?: unknown }; venue?: unknown }>(
        `/api/venue-manager/${encodeURIComponent(routeSegment)}`
      )
      const payload = data.data ?? data.user?.venue ?? data.venue ?? data.user ?? null
      if (!payload) throw new Error("Invalid data structure in response")
      const raw = payload as RawVenueData
      const mgr = raw.manager

      const merged: VenueData = {
        id: raw.id || "",
        venueName: (mgr?.venueName ?? raw.name ?? "") as string,
        logo: (raw.logo || raw.images?.[0] || mgr?.avatar || "") as string,
        contactPerson: (mgr?.name ?? raw.contactPerson ?? "") as string,
        email: (mgr?.email ?? raw.email ?? "") as string,
        mobile: (mgr?.phone ?? raw.mobile ?? "") as string,
        address: (raw.address ?? "") as string,
        website: (raw.website ?? "") as string,
        description: (raw.description ?? "") as string,
        city: (raw.city ?? raw.location?.city ?? "") as string,
        state: (raw.state ?? raw.location?.state ?? "") as string,
        country: (raw.country ?? raw.location?.country ?? "") as string,
        zipCode: (raw.zipCode ?? "") as string,
        venueImages: (raw.venueImages ?? raw.images ?? []) as string[],
        venueVideos: (raw.venueVideos ?? []) as string[],
        floorPlans: (raw.floorPlans ?? []) as string[],
        virtualTour: (raw.virtualTour ?? "") as string,
        latitude: (raw.latitude ?? 0) as number,
        longitude: (raw.longitude ?? 0) as number,
        basePrice: (raw.basePrice ?? 0) as number,
        currency: (raw.currency ?? "₹") as string,
        maxCapacity: (raw.maxCapacity ?? raw.capacity?.total ?? 0) as number,
        totalHalls: (raw.totalHalls ?? raw.capacity?.halls ?? 0) as number,
        totalEvents: (raw.totalEvents ?? raw.stats?.totalEvents ?? 0) as number,
        activeBookings: (raw.activeBookings ?? raw.stats?.activeBookings ?? 0) as number,
        averageRating: (raw.averageRating ?? raw.stats?.averageRating ?? 0) as number,
        totalReviews: (raw.totalReviews ?? raw.stats?.totalReviews ?? 0) as number,
        amenities: (raw.amenities ?? []) as string[],
        meetingSpaces: (raw.meetingSpaces ?? []) as MeetingSpace[],
        timezone: (raw.timezone ?? raw.location?.timezone ?? "") as string,
        manager: mgr,
      }
      setVenueData(merged)
      setAccountUnderReview(venuePayloadUnderReview(payload))
    } catch (err: unknown) {
      const status = typeof err === "object" && err !== null && "status" in err ? Number((err as { status?: number }).status) : undefined
      const is404 = status === 404
      const is403 = status === 403
      const message = is404 ? "User not found" : is403 ? "Access denied" : err instanceof Error ? err.message : "An error occurred"
      setError(message)
      if (is404 || is403) {
        toast({ title: "Error", description: message, variant: "destructive" })
        router.push("/login")
      }
    } finally {
      setLoading(false)
    }
  }

  const navItemClass = (sectionId: string) =>
    cn(
      "flex items-center gap-3 w-full rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150 text-left",
      activeSection === sectionId
        ? "bg-[#004A96] text-white shadow-sm"
        : "text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#1E293B]"
    )

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F8FAFC]">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-[#004A96] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-[#64748B]">Loading dashboard…</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F8FAFC] px-4">
        <Card className="w-full max-w-sm">
          <CardHeader><CardTitle className="text-red-600">Error</CardTitle></CardHeader>
          <CardContent>
            <p className="mb-4 text-slate-600">{error}</p>
            <Button onClick={fetchVenueData} className="w-full bg-[#004A96] hover:bg-[#003d7a] text-white">Try Again</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!venueData) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F8FAFC] px-4">
        <Card className="w-full max-w-sm">
          <CardHeader><CardTitle>No Data</CardTitle></CardHeader>
          <CardContent><p className="text-slate-600">No venue data found.</p></CardContent>
        </Card>
      </div>
    )
  }

  const renderContent = () => {
    switch (activeSection) {
      case "dashboard": return <VenueDashboardHome venueData={venueData} setActiveSection={setActiveSection} />
      case "venue-profile": return <VenueProfile venueData={venueData} />
      case "event-management": return <EventManagement />
      case "booking-system": return <BookingSystem venueId={venueData.id} />
      case "communication": return <CommunicationCenter params={{ id: venueData.id }} />
      case "connection": return <ConnectionsSection userId={venueData.id} />
      case "ratings-reviews": return <VenueFeedbackManagement venueId={venueData.id} />
      case "legal-documentation": return <LegalDocumentation venueId={venueData.id} />
      case "help-support": return <HelpSupport variant="venue" />
      case "settings": return <VenueSettings />
      default: return <VenueDashboardHome venueData={venueData} setActiveSection={setActiveSection} />
    }
  }

  const SidebarNav = ({ onNavigate }: { onNavigate?: () => void }) => {
    const navigate = (section: string) => { setActiveSection(section); onNavigate?.() }
    return (
      <div className="flex flex-col h-full">
        <nav className="scrollbar-hover flex-1 space-y-0.5 overflow-y-auto px-3 py-4">
          <button onClick={() => navigate("dashboard")} className={navItemClass("dashboard")}>
            <LayoutDashboard className="h-4 w-4 shrink-0" />
            Dashboard
          </button>

          <div className="pt-4 pb-1">
            <p className={venueNavGroupLabel}>Venue Management</p>
          </div>
          <button onClick={() => navigate("venue-profile")} className={navItemClass("venue-profile")}>
            <Building2 className="h-4 w-4 shrink-0" />
            Venue Profile
          </button>
          <button onClick={() => navigate("event-management")} className={navItemClass("event-management")}>
            <CalendarDays className="h-4 w-4 shrink-0" />
            Event Management
          </button>
          <button onClick={() => navigate("booking-system")} className={navItemClass("booking-system")}>
            <BookmarkCheck className="h-4 w-4 shrink-0" />
            Booking System
          </button>

          <div className="pt-4 pb-1">
            <p className={venueNavGroupLabel}>Communication</p>
          </div>
          <button onClick={() => navigate("communication")} className={navItemClass("communication")}>
            <MessageSquare className="h-4 w-4 shrink-0" />
            Messages
          </button>
          <button onClick={() => navigate("connection")} className={navItemClass("connection")}>
            <Users className="h-4 w-4 shrink-0" />
            Connections
          </button>

          <div className="pt-4 pb-1">
            <p className={venueNavGroupLabel}>Reviews & Legal</p>
          </div>
          <button onClick={() => navigate("ratings-reviews")} className={navItemClass("ratings-reviews")}>
            <Star className="h-4 w-4 shrink-0" />
            Reviews & Ratings
          </button>

          <div className="pt-4 pb-1">
            <p className={venueNavGroupLabel}>Account</p>
          </div>
          <button onClick={() => navigate("help-support")} className={navItemClass("help-support")}>
            <HelpCircle className="h-4 w-4 shrink-0" />
            Help & Support
          </button>
          <button onClick={() => navigate("settings")} className={navItemClass("settings")}>
            <Settings className="h-4 w-4 shrink-0" />
            Settings
          </button>
        </nav>

        <div className="border-t border-slate-200 p-3">
          <button
            onClick={() => logout()}
            className="flex items-center gap-3 w-full rounded-xl px-3 py-2.5 text-sm font-medium text-[#EF4444] hover:bg-[#FEF2F2] transition-colors bg-red-500 border border-red-200 hover:border-red-300 hover:text-red-800 text-white items-center justify-center"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </div>
    )
  }

  return (
    <VenueDashboardVenueIdProvider venueUserId={venueData.id}>
      <div className={cn("relative flex min-h-0 flex-1 w-full overflow-hidden", venuePageBg)}>
        {sidebarOpen && (
          <div className="fixed inset-0 z-40 bg-black/40 md:hidden" onClick={() => setSidebarOpen(false)} />
        )}

        <aside
          className={cn(
            "fixed z-50 top-0 left-0 flex h-full w-[260px] flex-col transition-transform duration-300",
            venueSidebarSurface,
            "md:static md:translate-x-0 md:shrink-0",
            sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
          )}
        >
          <button
            className="absolute top-4 right-4 md:hidden text-[#64748B] hover:text-[#1E293B]"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>
          <SidebarNav onNavigate={() => setSidebarOpen(false)} />
        </aside>

        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          <main className="min-h-0 flex-1 overflow-auto p-0">
            <div className="min-h-0 w-full px-6 py-6">
            {accountUnderReview && (
              <Alert className="mb-5 border-amber-200 bg-amber-50" role="status">
                <AlertCircle className="h-4 w-4 text-amber-600" />
                <AlertTitle className="text-amber-800">Your account is under review</AlertTitle>
                <AlertDescription className="text-amber-700">
                  Our team is reviewing your venue before it can appear on the public venues directory. You can continue using this dashboard.
                </AlertDescription>
              </Alert>
            )}
            {renderContent()}
            </div>
          </main>
        </div>
      </div>
    </VenueDashboardVenueIdProvider>
  )
}

function getVenueThumbUrl(venueData: VenueData): string | null {
  const fromGallery = venueData.venueImages?.map((img) => img?.trim()).find((img) => img && img.length > 0)
  if (fromGallery) return fromGallery

  const logo = venueData.logo?.trim()
  if (logo && logo !== "/placeholder.svg") return logo

  return null
}

/* ─────────────────────────────────────────────
   Dashboard Home - NEW DESIGN with Bar Chart & Monthly Data
───────────────────────────────────────────── */
function VenueDashboardHome({ venueData, setActiveSection }: { venueData: VenueData; setActiveSection: (s: string) => void }) {
  const { toast } = useToast()
  const [showAllBookings, setShowAllBookings] = useState(false)
  const [expandedBookingId, setExpandedBookingId] = useState<string | null>(null)
  const [bookingsData, setBookingsData] = useState<Booking[]>([])
  const [loadingBookings, setLoadingBookings] = useState(false)
  const [selectedPeriod, setSelectedPeriod] = useState<"thisMonth" | "lastMonth">("thisMonth")

  // Monthly data from screenshot - values are counts, need to be scaled to percentage of max
  const monthlyDataRaw = {
    thisMonth: [
      { day: "May 1", value: 75 },
      { day: "May 5", value: 43 },
      { day: "May 10", value: 72 },
      { day: "May 15", value: 84 },
      { day: "May 20", value: 33 },
      { day: "May 25", value: 67 },
      { day: "May 30", value: 68 },
    ],
    lastMonth: [
      { day: "Apr 1", value: 95 },
      { day: "Apr 5", value: 52 },
      { day: "Apr 10", value: 46 },
      { day: "Apr 15", value: 78 },
      { day: "Apr 20", value: 46 },
      { day: "Apr 25", value: 48 },
      { day: "Apr 30", value: 41 },
    ]
  }

  // Find max value to scale bars properly (max height will be 85% of container)
  const maxValueThisMonth = Math.max(...monthlyDataRaw.thisMonth.map(d => d.value))
  const maxValueLastMonth = Math.max(...monthlyDataRaw.lastMonth.map(d => d.value))
  const globalMax = Math.max(maxValueThisMonth, maxValueLastMonth)

  // Scale values to percentage (max bar height = 85% of container, so highest value becomes 85%)
  const maxBarHeight = 85
  const scaleValue = (value: number) => (value / globalMax) * maxBarHeight

  const currentData = (selectedPeriod === "thisMonth" ? monthlyDataRaw.thisMonth : monthlyDataRaw.lastMonth).map(item => ({
    ...item,
    scaledHeight: scaleValue(item.value)
  }))

  // Calculate real stats from venueData
  const stats = [
    {
      label: "Total Events",
      value: venueData.totalEvents ?? 0,
      change: `${venueData.totalEvents ?? 0} total events hosted`,
      icon: CalendarDays,
      color: "bg-[#EFF6FF] text-[#004A96]"
    },
    {
      label: "Active Bookings",
      value: venueData.activeBookings ?? 0,
      change: `${venueData.activeBookings ?? 0} active ${(venueData.activeBookings ?? 0) === 1 ? 'booking' : 'bookings'}`,
      icon: BookmarkCheck,
      color: "bg-[#F0FDF4] text-[#16A34A]"
    },
    {
      label: "Total Halls",
      value: venueData.totalHalls ?? 0,
      change: `${venueData.totalHalls ?? 0} ${(venueData.totalHalls ?? 0) === 1 ? 'hall' : 'halls'} available`,
      icon: Building2,
      color: "bg-[#FFF7ED] text-[#EA580C]"
    },
    {
      label: "Max Capacity",
      value: (venueData.maxCapacity ?? 0).toLocaleString(),
      change: `up to ${(venueData.maxCapacity ?? 0).toLocaleString()} people`,
      icon: Users,
      color: "bg-[#F0F9FF] text-[#0284C7]"
    },
  ]

  // Fetch bookings data
  const fetchBookings = async () => {
    if (!venueData.id) return
    try {
      setLoadingBookings(true)
      const response = await apiFetch<{ success: boolean; data?: Booking[] }>(
        `/api/venue-appointments?venueId=${venueData.id}`,
        { auth: true }
      )
      if (response.success && response.data) {
        setBookingsData(response.data)
      }
    } catch (error) {
      console.error("Error fetching bookings:", error)
    } finally {
      setLoadingBookings(false)
    }
  }

  useEffect(() => {
    if (venueData.id) {
      fetchBookings()
    }
  }, [venueData.id])

  const updateBookingStatus = async (bookingId: string, newStatus: string) => {
    try {
      await apiFetch('/api/venue-appointments', {
        method: 'PATCH',
        body: JSON.stringify({ id: bookingId, status: newStatus })
      })
      toast({ title: "Success", description: `Booking ${newStatus.toLowerCase()} successfully` })
      fetchBookings()
    } catch (error) {
      toast({ title: "Error", description: `Failed to ${newStatus.toLowerCase()} booking`, variant: "destructive" })
    }
  }

  const getStatusStyles = (status: string) => {
    switch (status.toUpperCase()) {
      case 'PENDING':
        return 'bg-[#FFF7ED] text-[#C2410C] border border-[#FED7AA]'
      case 'CONFIRMED':
        return 'bg-[#F0FDF4] text-[#15803D] border border-[#BBF7D0]'
      case 'COMPLETED':
        return 'bg-[#dbeafe] text-[#004A96] border border-[#bfdbfe]'
      case 'CANCELLED':
        return 'bg-[#FEF2F2] text-[#DC2626] border border-[#FECACA]'
      default:
        return 'bg-[#F1F5F9] text-[#64748B] border border-[#E2E8F0]'
    }
  }

  const welcomeName = venueData.contactPerson || venueData.venueName
  const venueThumbUrl = getVenueThumbUrl(venueData)

  return (
    <div className="space-y-6">
      <header className={cn(venuePageHeader, "lg:items-center lg:gap-6")}>
        <div className="min-w-0 shrink-0 lg:max-w-[280px] xl:max-w-xs">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Dashboard</h1>
          <p className="mt-1 text-sm text-slate-600">
            Welcome back, <span className="font-medium text-slate-800">{welcomeName}</span> 👋
          </p>
        </div>
        <div className="flex min-w-0 flex-1 sm:justify-end">
          <DashboardManagedBanner
            page="venue-dashboard"
            variant="compact"
            className="!h-14 w-full min-w-[360px] sm:!h-16 sm:flex-1 sm:max-w-3xl lg:-ml-2"
          />
        </div>
      </header>

      {/* Stats Cards - Row of 4 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white rounded-2xl border border-[#E2E8F0] p-4">
            <div className="flex items-center justify-between mb-2">
              <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", stat.color.split(" ")[0])}>
                <stat.icon className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-medium text-[#22C55E] bg-[#F0FDF4] px-2 py-0.5 rounded-full">
                +12%
              </span>
            </div>
            <p className="text-2xl font-bold text-[#1E293B]">{stat.value}</p>
            <p className="text-xs text-[#64748B] mt-1">{stat.label}</p>
            <p className="text-[10px] text-[#94A3B8] mt-1">{stat.change}</p>
          </div>
        ))}
      </div>

      {/* Main Content Grid - 2 columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Event Overview - with Bar Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-[#E2E8F0] p-5">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-base font-semibold text-[#1E293B]">Event Overview</h2>
            <div className="flex gap-2">
              <button
                onClick={() => setSelectedPeriod("thisMonth")}
                className={cn(
                  "px-3 py-1 text-xs font-medium rounded-lg transition-colors",
                  selectedPeriod === "thisMonth"
                    ? "bg-[#004A96] text-white"
                    : "bg-[#F1F5F9] text-[#64748B] hover:bg-[#E2E8F0]"
                )}
              >
                This Month
              </button>
              <button
                onClick={() => setSelectedPeriod("lastMonth")}
                className={cn(
                  "px-3 py-1 text-xs font-medium rounded-lg transition-colors",
                  selectedPeriod === "lastMonth"
                    ? "bg-[#004A96] text-white"
                    : "bg-[#F1F5F9] text-[#64748B] hover:bg-[#E2E8F0]"
                )}
              >
                Last Month
              </button>
            </div>
          </div>

          {/* Bar Chart - FIXED: using scaled heights */}
          <div className="flex items-end justify-between gap-2 h-56 mb-2">
            {currentData.map((item, index) => (
              <div key={index} className="flex-1 flex flex-col items-center gap-2">
                <div className="relative w-full flex justify-center">
                  <div
                    className="w-full max-w-[40px] bg-gradient-to-t from-[#004A96] to-[#3b82f6] rounded-t-lg transition-all duration-300 hover:from-[#003d7a] hover:to-[#2563eb] cursor-pointer"
                    style={{ height: `${item.scaledHeight}px` }}
                  />
                </div>
                <span className="text-[10px] text-[#94A3B8] font-medium">
                  {item.day}
                </span>
              </div>
            ))}
          </div>

          {/* Y-axis labels */}
          <div className="flex justify-between px-2 mb-2">
            <span className="text-[9px] text-[#94A3B8]">0</span>
            <span className="text-[9px] text-[#94A3B8]">{Math.round(globalMax * 0.25)}</span>
            <span className="text-[9px] text-[#94A3B8]">{Math.round(globalMax * 0.5)}</span>
            <span className="text-[9px] text-[#94A3B8]">{Math.round(globalMax * 0.75)}</span>
            <span className="text-[9px] text-[#94A3B8]">{globalMax}</span>
          </div>

          {/* Summary Stats below chart */}
          <div className="grid grid-cols-3 gap-4 mt-6 pt-4 border-t border-[#F1F5F9]">
            <div className="text-center">
              <p className="text-2xl font-bold text-[#1E293B]">{venueData.totalEvents || 0}</p>
              <p className="text-[11px] text-[#64748B]">Total Events</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-[#1E293B]">{venueData.activeBookings || 0}</p>
              <p className="text-[11px] text-[#64748B]">Active Bookings</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-[#1E293B]">{(venueData.averageRating || 0).toFixed(1)}</p>
              <p className="text-[11px] text-[#64748B]">Rating</p>
            </div>
          </div>
        </div>

        {/* Booking Status - Expandable */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-[#1E293B]">Booking Status</h2>
            <button
              onClick={() => setActiveSection("booking-system")}
              className="text-xs text-[#004A96] font-medium hover:underline"
            >
              View All
            </button>
          </div>

          <div className="space-y-3">
            {loadingBookings ? (
              <div className="text-center py-6">
                <div className="w-6 h-6 border-2 border-[#004A96] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                <p className="text-xs text-[#94A3B8]">Loading bookings...</p>
              </div>
            ) : bookingsData.length > 0 ? (
              <>
                {(showAllBookings ? bookingsData : bookingsData.slice(0, 2)).map((booking, idx) => {
                  const bookingId = booking.id
                  const isExpanded = expandedBookingId === bookingId
                  const visitorName = `${booking.requester?.firstName || ''} ${booking.requester?.lastName || ''}`.trim() || 'Guest'
                  const company = booking.requesterCompany || 'Individual'
                  const date = booking.requestedDate ? new Date(booking.requestedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Date TBD'
                  const time = booking.requestedTime || 'Time TBD'
                  const status = booking.status || 'PENDING'
                  const purpose = booking.purpose || 'No purpose specified'
                  const duration = booking.duration || 30
                  const visitorEmail = booking.requester?.email || 'No email'
                  const visitorPhone = booking.requesterPhone || 'No phone'

                  return (
                    <div key={bookingId} className="border border-[#E2E8F0] rounded-xl overflow-hidden transition-all">
                      <div
                        className="flex items-start gap-3 p-3 cursor-pointer hover:bg-[#F8FAFC] transition-colors"
                        onClick={() => setExpandedBookingId(isExpanded ? null : bookingId)}
                      >
                        <div className="w-8 h-8 rounded-full bg-[#EFF6FF] flex items-center justify-center text-[#004A96] text-xs font-semibold shrink-0">
                          {visitorName.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-[#1E293B] truncate">{visitorName}</p>
                            <span className={cn("text-[10px] font-medium px-2 py-0.5 rounded-full whitespace-nowrap ml-2", getStatusStyles(status))}>
                              {status}
                            </span>
                          </div>
                          <p className="text-[11px] text-[#94A3B8] truncate">{company}</p>
                          <div className="flex items-center gap-3 mt-1">
                            <p className="text-[10px] text-[#64748B] flex items-center gap-1">
                              <CalendarDays className="w-3 h-3" />
                              {date}
                            </p>
                            <p className="text-[10px] text-[#64748B] flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {time} ({duration} min)
                            </p>
                          </div>
                        </div>
                        {/* <ChevronRight className={cn("w-4 h-4 text-[#94A3B8] transition-transform shrink-0", isExpanded && "rotate-90")} /> */}
                      </div>

                      {isExpanded && (
                        <div className="border-t border-[#F1F5F9] p-3 bg-[#F8FAFC] space-y-2">
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div>
                              <p className="text-[10px] text-[#94A3B8]">Email</p>
                              <p className="text-[11px] text-[#1E293B] truncate">{visitorEmail}</p>
                            </div>
                            <div>
                              <p className="text-[10px] text-[#94A3B8]">Phone</p>
                              <p className="text-[11px] text-[#1E293B]">{visitorPhone}</p>
                            </div>
                          </div>
                          <div>
                            <p className="text-[10px] text-[#94A3B8]">Purpose</p>
                            <p className="text-[11px] text-[#475569]">{purpose}</p>
                          </div>
                          {booking.notes && (
                            <div>
                              <p className="text-[10px] text-[#94A3B8]">Notes</p>
                              <p className="text-[11px] text-[#475569]">{booking.notes}</p>
                            </div>
                          )}
                          
                        </div>
                      )}
                    </div>
                  )
                })}

                {bookingsData.length > 2 && (
                  <button
                    onClick={() => setShowAllBookings(!showAllBookings)}
                    className="w-full text-center py-2 text-xs font-medium text-[#004A96] hover:text-[#003d7a] hover:bg-[#EFF6FF] rounded-lg transition-colors flex items-center justify-center gap-1"
                  >
                    {showAllBookings ? (
                      <>Show Less <ChevronRight className="w-3 h-3 rotate-90" /></>
                    ) : (
                      <>+{bookingsData.length - 2} More Bookings <ChevronRight className="w-3 h-3" /></>
                    )}
                  </button>
                )}
              </>
            ) : (
              <div className="text-center py-6">
                <BookmarkCheck className="w-8 h-8 text-[#CBD5E1] mx-auto mb-2" />
                <p className="text-sm text-[#94A3B8]">No booking requests</p>
                <p className="text-xs text-[#CBD5E1] mt-1">Booking requests will appear here</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Row - 3 Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Venue Details */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-[#1E293B]">Venue Details</h2>
            <button onClick={() => setActiveSection("venue-profile")} className="text-xs text-[#004A96] font-medium hover:underline">Edit</button>
          </div>
          <div className="flex items-start gap-3 p-3 bg-[#F8FAFC] rounded-xl">
            <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-[#EFF6FF]">
              {venueThumbUrl ? (
                <AppImage
                  src={venueThumbUrl}
                  alt={venueData.venueName}
                  fill
                  sizes="48px"
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <Building2 className="h-5 w-5 text-[#004A96]" />
                </div>
              )}
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-[#1E293B]">{venueData.venueName}</p>
              <p className="text-xs text-[#94A3B8] mt-0.5">
                {venueData.totalHalls || 0} {venueData.totalHalls === 1 ? 'Hall' : 'Halls'} •
                Capacity {venueData.maxCapacity?.toLocaleString() || 0}
              </p>
              <p className="text-xs text-[#94A3B8] flex items-center gap-1 mt-0.5">
                <MapPin className="w-3 h-3" />
                {venueData.city && venueData.country
                  ? `${venueData.city}, ${venueData.country}`
                  : venueData.address || 'Location not set'}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-3">
            <div className="bg-[#F8FAFC] rounded-lg p-2 text-center">
              <p className="text-xs text-[#64748B]">Amenities</p>
              <p className="text-sm font-semibold text-[#1E293B]">{venueData.amenities?.length || 0}</p>
            </div>
            <div className="bg-[#F8FAFC] rounded-lg p-2 text-center">
              <p className="text-xs text-[#64748B]">Meeting Spaces</p>
              <p className="text-sm font-semibold text-[#1E293B]">{venueData.meetingSpaces?.length || 0}</p>
            </div>
          </div>
        </div>

        {/* Reviews Summary */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-[#1E293B]">Customer Reviews</h2>
            <button onClick={() => setActiveSection("ratings-reviews")} className="text-xs text-[#004A96] font-medium hover:underline">View All</button>
          </div>
          <div className="text-center py-2">
            <p className="text-4xl font-bold text-[#1E293B]">
              {(venueData.averageRating || 0).toFixed(1)}
            </p>
            <div className="flex justify-center gap-1 my-2">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  className={cn(
                    "w-5 h-5",
                    s <= Math.floor(venueData.averageRating || 0)
                      ? "text-[#F59E0B] fill-[#F59E0B]"
                      : "text-[#D1D5DB]"
                  )}
                />
              ))}
            </div>
            <p className="text-sm text-[#94A3B8]">{venueData.totalReviews || 0} Total Reviews</p>
          </div>
        </div>

        {/* Contact Info */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-[#1E293B]">Contact Information</h2>
            <button onClick={() => setActiveSection("venue-profile")} className="text-xs text-[#004A96] font-medium hover:underline">Edit</button>
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm text-[#64748B]">
              <Building2 className="w-4 h-4 text-[#004A96]" />
              <span>{venueData.contactPerson || "Not provided"}</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-[#64748B]">
              <MessageSquare className="w-4 h-4 text-[#004A96]" />
              <span className="truncate">{venueData.email || "Not provided"}</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-[#64748B]">
              <BookmarkCheck className="w-4 h-4 text-[#004A96]" />
              <span>{venueData.mobile || "Not provided"}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}