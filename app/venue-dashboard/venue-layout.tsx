"use client"

import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import { apiFetch, clearTokens, getCurrentUserId } from "@/lib/api"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
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

export default function VenueDashboardPage({ routeSegment }: UserDashboardProps) {
  const { activeSection, setActiveSection } = useDashboard()
  const [venueData, setVenueData] = useState<VenueData | null>(null)
  const [accountUnderReview, setAccountUnderReview] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [openMenus, setOpenMenus] = useState<string[]>(["venue-management", "communication", "reviews-legal"])
  const [sidebarOpen, setSidebarOpen] = useState(false)
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
    `cursor-pointer pl-3 py-2 text-sm rounded-md transition-colors w-full text-left ${
      activeSection === sectionId
        ? "bg-blue-50 text-blue-700 border-l-4 border-blue-700 font-medium"
        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 border-l-4 border-transparent"
    }`

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={fetchVenueData} className="w-full">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!venueData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>No Data</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">No venue data found.</p>
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
        return <HelpSupport />
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
    <div className="flex min-h-screen w-full bg-[#F5F4F0]">
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed md:relative w-64 min-h-screen bg-white border-r border-gray-200 z-50 transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 flex flex-col shadow-sm`}
      >
        <div className="md:hidden flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Venue Menu</h2>
          <Button variant="ghost" size="sm" onClick={() => setSidebarOpen(false)}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex-1 p-4 overflow-y-auto">
          {/* Venue Management Dropdown */}
          <div className="mb-4">
            <button
              className="flex items-center justify-between w-full py-2 font-medium text-sm text-gray-700 hover:text-gray-900"
              onClick={() => toggleMenu("venue-management")}
            >
              <span className="flex items-center gap-2">
                <Building2 size={16} />
                Venue Management
              </span>
              {openMenus.includes("venue-management") ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </button>

            {openMenus.includes("venue-management") && (
              <div className="ml-2 mt-2 space-y-1">
                <button onClick={() => setActiveSection("venue-profile")} className={menuItemClass("venue-profile")}>
                  Venue Profile
                </button>
                <button onClick={() => setActiveSection("event-management")} className={menuItemClass("event-management")}>
                  Event Management
                </button>
                <button onClick={() => setActiveSection("booking-system")} className={menuItemClass("booking-system")}>
                  Booking System
                </button>
              </div>
            )}
          </div>

          {/* Communication Dropdown */}
          <div className="mb-4">
            <button
              className="flex items-center justify-between w-full py-2 font-medium text-sm text-gray-700 hover:text-gray-900"
              onClick={() => toggleMenu("communication")}
            >
              <span className="flex items-center gap-2">
                <MessageSquare size={16} />
                Communication
              </span>
              {openMenus.includes("communication") ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </button>
            {openMenus.includes("communication") && (
              <div className="ml-2 mt-2 space-y-1">
                <button onClick={() => setActiveSection("communication")} className={menuItemClass("communication")}>
                  Messages
                </button>
                <button onClick={() => setActiveSection("connection")} className={menuItemClass("connection")}>
                  Connections
                </button>
              </div>
            )}
          </div>

          {/* Reviews & Legal Dropdown */}
          <div className="mb-4">
            <button
              className="flex items-center justify-between w-full py-2 font-medium text-sm text-gray-700 hover:text-gray-900"
              onClick={() => toggleMenu("reviews-legal")}
            >
              <span className="flex items-center gap-2">
                <Star size={16} />
                Reviews & Legal
              </span>
              {openMenus.includes("reviews-legal") ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </button>
            {openMenus.includes("reviews-legal") && (
              <div className="ml-2 mt-2 space-y-1">
                <button onClick={() => setActiveSection("ratings-reviews")} className={menuItemClass("ratings-reviews")}>
                  Ratings & Reviews
                </button>
                {/* <button
                  onClick={() => setActiveSection("legal-documentation")}
                  className={menuItemClass("legal-documentation")}
                >
                  Legal & Documentation
                </button> */}
              </div>
            )}
          </div>

          {/* Help & Support */}
          <button
            onClick={() => setActiveSection("help-support")}
            className={`flex items-center w-full py-2 gap-2 font-medium text-sm rounded-md transition-colors ${
              activeSection === "help-support"
                ? "bg-blue-50 text-blue-700"
                : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
            }`}
          >
            <HelpCircle size={16} />
            Help & Support
          </button>

          {/* Settings */}
          <button
            onClick={() => setActiveSection("settings")}
            className={`flex items-center w-full py-2 gap-2 font-medium text-sm rounded-md transition-colors mt-1 ${
              activeSection === "settings"
                ? "bg-blue-50 text-blue-700"
                : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
            }`}
          >
            <Settings size={16} />
            Settings
          </button>

          {/* Logout */}
          <Button onClick={() => logout()} className="w-full bg-red-500 hover:bg-red-600 text-white mt-8">
            Logout
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        <main className="flex-1 p-6 overflow-auto">
          <DashboardManagedBanner page="venue-dashboard" />
          <div className="max-w-7xl mx-auto">
            {accountUnderReview && (
              <Alert
                className="mb-4 border-amber-200 bg-amber-50 text-amber-950 [&>svg]:text-amber-700"
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
            <div className="bg-[#F5F4F0] min-h-screen w-full ">
              {renderContent()}
            </div>
          </div>
        </main>
      </div>
    </div>
    </VenueDashboardVenueIdProvider>
  )
}
