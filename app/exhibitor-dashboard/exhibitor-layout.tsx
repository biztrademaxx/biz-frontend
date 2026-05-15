"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/use-auth"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import MessagesCenter from "@/app/organizer-dashboard/messages-center"
import EventPromotion from "@/app/organizer-dashboard/event-promotion"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Building2,
  Calendar,
  Users,
  TrendingUp,
  Package,
  Settings,
  BarChart3,
  Star,
  MapPin,
  Phone,
  Mail,
  Globe,
  Twitter,
  Briefcase,
  HelpCircle,
  ChevronDown,
  ChevronRight,
  Menu,
  X,
  Sidebar,
  LogOut,
} from "lucide-react"
import { useRouter, usePathname } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { useDashboard } from "@/contexts/dashboard-context"
import { apiFetch, getCurrentUserId } from "@/lib/api"
import { getExhibitorDashboardPath } from "@/lib/profile-path"

import CompanyInfo from "./company-info"
import EventParticipation from "./event-participation"
import ProductListing from "./product-listing"
import LeadManagement from "./lead-management"
import AppointmentScheduling from "./appointment-scheduling"
import AnalyticsReports from "./analytics-reports"
import PromotionsMarketing from "./promotions-marketing"
import { ExhibitorSettings } from "./settings"
import { ConnectionsSection } from "@/app/dashboard/connections-section"
import { HelpSupport } from "@/components/HelpSupport"
import { FollowManagement } from "./follow-management"
import { ActiveEventsCard } from "./TotalExhibitorEvent"
import { FollowersCountCard } from "./FollowersCountCard"
import { AppointmentsCountCard } from "./AppointmentsCountCard"
import ActivePromotions from "./active-promotion"
import { ExhibitorHelpSupport } from "./help-support"
import ViewFeedback from "./view-feedback"
import { DashboardManagedBanner } from "@/components/dashboard-managed-banner"
import { cn } from "@/lib/utils"
import { exGlassCard } from "./dashboard-theme"

interface ExhibitorData {
  id: string
  firstName: string
  lastName: string
  displayName?: string
  publicSlug?: string | null
  organizationName?: string | null
  email: string
  phone?: string
  avatar?: string
  bio?: string
  website?: string
  twitter?: string
  location?: string
  jobTitle?: string
  company?: string | null
  totalEvents: number
  activeEvents: number
  totalProducts: number
  totalLeads: number
  pendingLeads: number
  profileViews: number
  upcomingAppointments: number
}

interface UserDashboardProps {
  /** UUID or public profile slug from `/exhibitor-dashboard/[id]`. */
  routeSegment: string
}

export function ExhibitorLayout({ routeSegment }: UserDashboardProps) {
  const [exhibitor, setExhibitor] = useState<ExhibitorData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { activeSection, setActiveSection } = useDashboard()
  const [appointmentCount, setAppointmentCount] = useState<number>(0)
  const [openMenus, setOpenMenus] = useState<string[]>([
  "main", "leadManagement", "marketingCampaigns", "analytics", "network", "feedback"
])

  const [sidebarOpen, setSidebarOpen] = useState(false)
  /** Desktop only: narrow icon rail vs full labels (mobile drawer always expanded). */
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)

  const { role, loading: authLoading, logout } = useAuth({
    requireAuth: true,
    allowedRoles: ["EXHIBITOR"],
  })
  const router = useRouter()
  const pathname = usePathname()
  const { toast } = useToast()

  useEffect(() => {
    if (authLoading) return
    const roleUpper = (role || "").toString().toUpperCase()
    if (roleUpper !== "EXHIBITOR") {
      toast({
        title: "Access Denied",
        description: "You don't have permission to view this dashboard.",
        variant: "destructive",
      })
      router.replace("/login")
      return
    }
    fetchExhibitorData()
  }, [routeSegment, authLoading, role, router, toast])

  useEffect(() => {
    if (!exhibitor?.id || authLoading) return
    const sessionUser = getCurrentUserId()
    if (sessionUser && sessionUser !== exhibitor.id) {
      toast({
        title: "Access denied",
        description: "You can only open your own exhibitor dashboard.",
        variant: "destructive",
      })
      router.replace("/login")
    }
  }, [exhibitor?.id, authLoading, router, toast])

  useEffect(() => {
    if (!exhibitor?.id) return
    const canonical = getExhibitorDashboardPath(exhibitor.id, {
      publicSlug: exhibitor.publicSlug,
      organizationName: exhibitor.organizationName,
      company: exhibitor.company,
      firstName: exhibitor.firstName,
      lastName: exhibitor.lastName,
    })
    if (pathname && canonical !== pathname) {
      router.replace(canonical)
    }
  }, [
    exhibitor?.id,
    exhibitor?.publicSlug,
    exhibitor?.organizationName,
    exhibitor?.company,
    exhibitor?.firstName,
    exhibitor?.lastName,
    pathname,
    router,
  ])

  useEffect(() => {
    // Set company info as default active section when component mounts
    if (!activeSection) {
      setActiveSection("company")
    }
  }, [activeSection, setActiveSection])

  // Fetch product count from backend only
  const fetchProductCount = async (exhibitorId: string): Promise<number> => {
    try {
      const data = await apiFetch<{ products?: unknown[] }>(
        `/api/exhibitors/${encodeURIComponent(exhibitorId)}/products`,
        {
          method: "GET",
          auth: true,
        },
      )
      return data.products?.length ?? 0
    } catch (error) {
      console.error("Error fetching product count:", error)
      return 0
    }
  }

  // Map backend exhibitor shape to layout state
  const mapBackendExhibitor = (e: any, productCount: number) => ({
    id: e?.id,
    firstName: e?.firstName ?? "",
    lastName: e?.lastName ?? "",
    displayName: e?.displayName?.trim?.() || undefined,
    publicSlug: e?.publicSlug ?? null,
    organizationName: e?.organizationName ?? e?.companyName ?? null,
    email: e?.email ?? "",
    phone: e?.phone,
    avatar: e?.avatar,
    bio: e?.bio,
    website: e?.website,
    twitter: e?.twitter,
    jobTitle: e?.jobTitle,
    company: e?.company ?? e?.companyName,
    linkedin: e?.linkedin,
    location: e?.location,
    totalProducts: productCount,
    totalEvents: e?.totalEvents ?? 0,
    activeEvents: e?.activeEvents ?? 0,
    totalLeads: (e as any)?.totalLeads ?? 0,
    pendingLeads: (e as any)?.pendingLeads ?? 0,
    profileViews: (e as any)?.profileViews ?? 0,
    upcomingAppointments: (e as any)?.upcomingAppointments ?? 0,
  })

  const fetchExhibitorData = async () => {
    try {
      setLoading(true)
      setError(null)

      let exhibitorRes: { success: boolean; exhibitor: any }
      try {
        exhibitorRes = await apiFetch<{ success: boolean; exhibitor: any }>(
          `/api/exhibitors/${encodeURIComponent(routeSegment)}`,
          {
            method: "GET",
            auth: true,
          },
        )
      } catch (firstErr) {
        const msg = firstErr instanceof Error ? firstErr.message : ""
        const fallbackId = getCurrentUserId()
        if (msg.includes("Invalid exhibitor ID") && fallbackId && fallbackId !== routeSegment) {
          exhibitorRes = await apiFetch<{ success: boolean; exhibitor: any }>(
            `/api/exhibitors/${encodeURIComponent(fallbackId)}`,
            {
              method: "GET",
              auth: true,
            },
          )
        } else {
          throw firstErr
        }
      }

      if (!exhibitorRes.success || !exhibitorRes.exhibitor) {
        setError("Exhibitor not found")
        return
      }

      const resolvedId = exhibitorRes.exhibitor.id as string
      const productCount = await fetchProductCount(resolvedId)

      setExhibitor(mapBackendExhibitor(exhibitorRes.exhibitor, productCount))
      setAppointmentCount(Number((exhibitorRes.exhibitor as any)?.upcomingAppointments) || 0)
    } catch (err) {
      console.error("Error fetching exhibitor data:", err)
      setError(err instanceof Error ? err.message : "An error occurred")
      if (err instanceof Error && (err.message === "Access denied" || err.message === "User not found" || err.message.includes("Exhibitor not found"))) {
        toast({
          title: "Error",
          description: err.message,
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

  const handleUpdate = async (updates: Partial<any>) => {
    const apiSegment = exhibitor?.id ?? routeSegment
    try {
      const data = await apiFetch<{ success: boolean; exhibitor: any }>(
        `/api/exhibitors/${encodeURIComponent(apiSegment)}`,
        {
          method: "PUT",
          body: updates,
          auth: true,
        },
      )
      if (data.success && data.exhibitor) {
        const productCount = await fetchProductCount(apiSegment)
        setExhibitor((prev: any) => ({ ...prev, ...mapBackendExhibitor(data.exhibitor, productCount) }))
      }
    } catch (error) {
      console.error("Error updating exhibitor:", error)
      throw error
    }
  }

  // Helper function for menu item styling (brand: blue shell + red active accent)
  const menuItemClass = (sectionId: string) => {
    return `cursor-pointer w-full rounded-lg border-l-4 py-1.5 pl-2 text-left text-xs transition-colors md:text-sm ${
      activeSection === sectionId
        ? "border-[#FF131C] bg-white/10 font-medium text-white"
        : "border-transparent text-white/80 hover:bg-white/10 hover:text-white"
    }`
  }

  const navGroupBtn = (collapsed: boolean) =>
    cn(
      "flex w-full items-center rounded-xl text-left text-xs font-medium text-white/90 transition hover:bg-white/10",
      collapsed ? "justify-center px-0 py-2" : "justify-between py-2 pl-1 pr-1",
    )

  const renderMainContent = () => {
    if (authLoading) {
      return (
        <div className="flex min-h-[50vh] items-center justify-center">
          <div
            className="h-12 w-12 animate-spin rounded-full border-2 border-[#004A96]/25 border-t-[#004A96]"
            aria-hidden
          />
        </div>
      )
    }
    if (loading) {
      return (
        <div className="flex min-h-[50vh] items-center justify-center">
          <div
            className="h-14 w-14 animate-spin rounded-full border-2 border-[#004A96]/25 border-t-[#004A96]"
            aria-hidden
          />
        </div>
      )
    }
    if (error) {
      return (
        <div className="flex min-h-[50vh] items-center justify-center">
          <Card className={cn("w-full max-w-md", exGlassCard)}>
            <CardHeader>
              <CardTitle className="text-[#FF131C]">Error</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">{error}</p>
              <Button
                onClick={fetchExhibitorData}
                className="w-full bg-[#004A96] text-white hover:bg-[#003d7a]"
              >
                Try Again
              </Button>
            </CardContent>
          </Card>
        </div>
      )
    }
    if (!exhibitor) {
      return (
        <div className="flex min-h-[50vh] items-center justify-center">
          <Card className={cn("w-full max-w-md", exGlassCard)}>
            <CardHeader>
              <CardTitle className="text-slate-800">No Data</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">No exhibitor data found.</p>
            </CardContent>
          </Card>
        </div>
      )
    }
    return renderContent()
  }

  const renderContent = () => {
    if (!exhibitor) return null
    switch (activeSection) {
      case "overview":
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-800 md:text-3xl">
                Exhibitor Dashboard
              </h1>
              <p className="mt-1 text-slate-600">
                Welcome back, {exhibitor.displayName ?? exhibitor.firstName}!
              </p>
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
              <Card className={cn(exGlassCard, "overflow-hidden")}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-slate-700">Active Events</CardTitle>
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#004A96] to-[#003566] text-white shadow-md">
                    <Calendar className="h-4 w-4" />
                  </span>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-[#004A96]">{exhibitor.activeEvents}</div>
                </CardContent>
              </Card>

              <Card className={cn(exGlassCard, "overflow-hidden")}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-slate-700">Products</CardTitle>
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl border-2 border-[#004A96]/30 bg-[#004A96]/10 text-[#004A96]">
                    <Package className="h-4 w-4" />
                  </span>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-[#004A96]">{exhibitor.totalProducts}</div>
                  <p className="text-xs text-slate-500">
                    {exhibitor.profileViews || 0} total views
                  </p>
                </CardContent>
              </Card>

              <Card className={cn(exGlassCard, "overflow-hidden")}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-slate-700">Leads</CardTitle>
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl border-2 border-[#FF131C]/30 bg-[#FF131C]/10 text-[#FF131C]">
                    <Users className="h-4 w-4" />
                  </span>
                </CardHeader>
                <CardContent>
                  <FollowersCountCard exhibitorId={exhibitor.id} />
                  <p className="mt-1 text-xs text-slate-500">Total Leads</p>
                </CardContent>
              </Card>

              <Card className={cn(exGlassCard, "overflow-hidden")}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-slate-700">Appointments</CardTitle>
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl border-2 border-[#FF131C]/25 bg-[#FF131C]/10 text-[#FF131C]">
                    <Calendar className="h-4 w-4" />
                  </span>
                </CardHeader>
                <CardContent>
                  <AppointmentsCountCard exhibitorId={exhibitor.id} />
                  <p className="mt-1 text-xs text-slate-500">Total Appointments</p>
                </CardContent>
              </Card>
            </div>

            <Card className={cn(exGlassCard, "overflow-hidden")}>
              <CardHeader>
                <CardTitle className="text-slate-800">Profile Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-start gap-4">
                  <Avatar className="h-16 w-16 ring-2 ring-[#004A96]/20 ring-offset-2 ring-offset-white/40">
                    <AvatarImage src={exhibitor.avatar || "/city/c4.jpg"} />
                    <AvatarFallback className="bg-[#004A96]/10 text-lg font-semibold text-[#004A96]">
                      {(() => {
                        const label = (
                          exhibitor.displayName || `${exhibitor.firstName} ${exhibitor.lastName}`
                        ).trim()
                        const parts = label.split(/\s+/).filter(Boolean)
                        if (parts.length >= 2) {
                          return `${parts[0][0] ?? ""}${parts[parts.length - 1][0] ?? ""}`.toUpperCase()
                        }
                        if (label.length >= 2) return label.slice(0, 2).toUpperCase()
                        return (
                          `${exhibitor.firstName[0] ?? ""}${exhibitor.lastName[0] ?? ""}`.toUpperCase() || "?"
                        )
                      })()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-xl font-semibold text-slate-800">
                      {exhibitor.displayName?.trim() ||
                        `${exhibitor.firstName} ${exhibitor.lastName}`.replace(/\s+/g, " ").trim()}
                    </h3>
                    {exhibitor.jobTitle && (
                      <p className="mt-1 flex items-center text-slate-600">
                        <Briefcase className="mr-2 h-4 w-4 shrink-0 text-[#004A96]" />
                        {exhibitor.jobTitle}
                      </p>
                    )}
                    {exhibitor.location && (
                      <p className="mt-1 flex items-center text-slate-600">
                        <MapPin className="mr-2 h-4 w-4 shrink-0 text-[#004A96]" />
                        {exhibitor.location}
                      </p>
                    )}
                    <div className="mt-3 flex flex-wrap items-center gap-3">
                      {exhibitor.email && (
                        <a
                          href={`mailto:${exhibitor.email}`}
                          className="flex items-center text-sm font-medium text-[#004A96] hover:underline"
                        >
                          <Mail className="mr-1 h-4 w-4" />
                          Email
                        </a>
                      )}
                      {exhibitor.phone && (
                        <a
                          href={`tel:${exhibitor.phone}`}
                          className="flex items-center text-sm font-medium text-[#004A96] hover:underline"
                        >
                          <Phone className="mr-1 h-4 w-4" />
                          Call
                        </a>
                      )}
                      {exhibitor.website && (
                        <a
                          href={exhibitor.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center text-sm font-medium text-[#004A96] hover:underline"
                        >
                          <Globe className="mr-1 h-4 w-4" />
                          Website
                        </a>
                      )}
                      {exhibitor.twitter && (
                        <a
                          href={`https://twitter.com/${exhibitor.twitter}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center text-sm font-medium text-[#004A96] hover:underline"
                        >
                          <Twitter className="mr-1 h-4 w-4" />
                          Twitter
                        </a>
                      )}
                    </div>
                    {exhibitor.bio && (
                      <p className="mt-3 border-t border-slate-200/80 pt-3 text-slate-700">{exhibitor.bio}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )
      case "company":
        return <CompanyInfo exhibitorId={exhibitor.id} onUpdate={handleUpdate} exhibitorData={exhibitor} />
      case "events":
        return <EventParticipation exhibitorId={exhibitor.id} />
      case "products":
        return <ProductListing exhibitorId={exhibitor.id} />
      case "messages":
        return <MessagesCenter organizerId={exhibitor.id} surface="exhibitor" />
      case "connection":
        return <ConnectionsSection userId={exhibitor.id} surface="exhibitor" />
      case "follow":
        return <FollowManagement userId={exhibitor.id} />
      case "appointments":
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {/* Add any appointment stats cards here if needed */}
            </div>
            <AppointmentScheduling
              exhibitorId={exhibitor.id}
              onCountChange={setAppointmentCount}
            />
          </div>
        )
  //       case "submit-feedback":
  // return <SubmitFeedback exhibitorId={exhibitor.id} />
case "view-feedback":
  return <ViewFeedback exhibitorId={exhibitor.id} />


      case "analytics":
        return <AnalyticsReports exhibitorId={exhibitor.id} />
      case "promotions":
        return <PromotionsMarketing exhibitorId={exhibitor.id} />
      case "active-promotions":
        return <ActivePromotions exhibitorId={exhibitor.id} />
      case "help":
        return <ExhibitorHelpSupport />
      case "settings":
        return <ExhibitorSettings />
      default:
        return <CompanyInfo exhibitorId={exhibitor.id} onUpdate={handleUpdate} exhibitorData={exhibitor} />
    }
  }

  return (
    <div className="flex min-h-screen w-full justify-center bg-gradient-to-br from-cyan-200/70 via-[#004A96]/35 to-fuchsia-200/65">
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden
        />
      )}

      <div className="flex w-full max-w-[1680px] flex-1 flex-col md:flex-row md:items-stretch md:px-5 md:py-5">
        <div
          className={cn(
            "fixed inset-y-0 left-0 z-50 p-4 md:relative md:inset-auto md:z-30 md:flex md:shrink-0 md:items-start md:pl-6 md:pr-0 md:pt-2 md:pb-5",
            isSidebarCollapsed ? "md:-mr-9" : "md:-mr-32",
            "transform transition-transform duration-300 ease-in-out",
            sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
          )}
        >
          <aside
            className={cn(
              "flex flex-col overflow-hidden rounded-[2rem] border border-white/30 bg-gradient-to-b from-[#004A96] via-[#003d7a] to-[#002f5e] text-white shadow-[0_8px_32px_rgba(0,74,150,0.4)] transition-[width] duration-300 ease-out",
              "w-64 min-w-[16rem] max-h-[calc(100dvh-2rem)]",
              "md:h-[calc(100vh-2.5rem)] md:max-h-[calc(100vh-2.5rem)]",
              isSidebarCollapsed ? "md:w-[4.5rem] md:min-w-[4.5rem]" : "md:w-64 md:min-w-[16rem]",
            )}
          >
            <div className="flex items-center justify-between border-b border-white/15 p-3 md:hidden">
              <h2 className="text-lg font-semibold text-white">Exhibitor Menu</h2>
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/10"
                onClick={() => setSidebarOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex min-h-0 flex-1 flex-col overflow-hidden p-3 md:px-2 md:pb-3 md:pt-2">
              <div className="min-h-0 flex-1 space-y-1 overflow-hidden">
                {/* Main */}
                <div className="space-y-0.5">
                  <button
                    type="button"
                    title={isSidebarCollapsed ? "Main" : undefined}
                    className={navGroupBtn(isSidebarCollapsed)}
                    onClick={() => toggleMenu("main")}
                  >
                    <span className={cn("flex min-w-0 items-center gap-2", isSidebarCollapsed && "justify-center")}>
                      <BarChart3 size={16} className="shrink-0" />
                      <span className={cn("truncate", isSidebarCollapsed && "md:hidden")}>Main</span>
                    </span>
                    {!isSidebarCollapsed &&
                      (openMenus.includes("main") ? (
                        <ChevronDown size={16} className="shrink-0 opacity-80" />
                      ) : (
                        <ChevronRight size={16} className="shrink-0 opacity-80" />
                      ))}
                  </button>
                  {openMenus.includes("main") && !isSidebarCollapsed && (
                    <div className="ml-1 space-y-0.5 border-l border-white/15 pl-2">
                      <button
                        type="button"
                        onClick={() => setActiveSection("overview")}
                        className={menuItemClass("overview")}
                      >
                        Overview
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveSection("company")}
                        className={menuItemClass("company")}
                      >
                        Company
                      </button>
                    </div>
                  )}
                </div>

                {/* Feedback */}
                <div className="space-y-0.5">
                  <button
                    type="button"
                    title={isSidebarCollapsed ? "Feedback" : undefined}
                    className={navGroupBtn(isSidebarCollapsed)}
                    onClick={() => toggleMenu("feedback")}
                  >
                    <span className={cn("flex min-w-0 items-center gap-2", isSidebarCollapsed && "justify-center")}>
                      <Star size={16} className="shrink-0" />
                      <span className={cn("truncate", isSidebarCollapsed && "md:hidden")}>Feedback</span>
                    </span>
                    {!isSidebarCollapsed &&
                      (openMenus.includes("feedback") ? (
                        <ChevronDown size={16} className="shrink-0 opacity-80" />
                      ) : (
                        <ChevronRight size={16} className="shrink-0 opacity-80" />
                      ))}
                  </button>
                  {openMenus.includes("feedback") && !isSidebarCollapsed && (
                    <div className="ml-1 space-y-0.5 border-l border-white/15 pl-2">
                      <button
                        type="button"
                        onClick={() => setActiveSection("view-feedback")}
                        className={menuItemClass("view-feedback")}
                      >
                        View Feedback
                      </button>
                    </div>
                  )}
                </div>

                {/* Event & Products */}
                <div className="space-y-0.5">
                  <button
                    type="button"
                    title={isSidebarCollapsed ? "Event & Products" : undefined}
                    className={navGroupBtn(isSidebarCollapsed)}
                    onClick={() => toggleMenu("leadManagement")}
                  >
                    <span className={cn("flex min-w-0 items-center gap-2", isSidebarCollapsed && "justify-center")}>
                      <Users size={16} className="shrink-0" />
                      <span className={cn("truncate", isSidebarCollapsed && "md:hidden")}>Event & Products</span>
                    </span>
                    {!isSidebarCollapsed &&
                      (openMenus.includes("leadManagement") ? (
                        <ChevronDown size={16} className="shrink-0 opacity-80" />
                      ) : (
                        <ChevronRight size={16} className="shrink-0 opacity-80" />
                      ))}
                  </button>
                  {openMenus.includes("leadManagement") && !isSidebarCollapsed && (
                    <div className="ml-1 space-y-0.5 border-l border-white/15 pl-2">
                      <button
                        type="button"
                        onClick={() => setActiveSection("events")}
                        className={menuItemClass("events")}
                      >
                        Events
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveSection("products")}
                        className={menuItemClass("products")}
                      >
                        Products
                      </button>
                    </div>
                  )}
                </div>

                {/* Marketing */}
                <div className="space-y-0.5">
                  <button
                    type="button"
                    title={isSidebarCollapsed ? "Marketing Campaigns" : undefined}
                    className={navGroupBtn(isSidebarCollapsed)}
                    onClick={() => toggleMenu("marketingCampaigns")}
                  >
                    <span className={cn("flex min-w-0 items-center gap-2", isSidebarCollapsed && "justify-center")}>
                      <Star size={16} className="shrink-0" />
                      <span className={cn("truncate", isSidebarCollapsed && "md:hidden")}>
                        Marketing Campaigns
                      </span>
                    </span>
                    {!isSidebarCollapsed &&
                      (openMenus.includes("marketingCampaigns") ? (
                        <ChevronDown size={16} className="shrink-0 opacity-80" />
                      ) : (
                        <ChevronRight size={16} className="shrink-0 opacity-80" />
                      ))}
                  </button>
                  {openMenus.includes("marketingCampaigns") && !isSidebarCollapsed && (
                    <div className="ml-1 space-y-0.5 border-l border-white/15 pl-2">
                      <button
                        type="button"
                        onClick={() => setActiveSection("promotions")}
                        className={menuItemClass("promotions")}
                      >
                        Promotion
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveSection("active-promotions")}
                        className={menuItemClass("active-promotions")}
                      >
                        Active Promotion
                      </button>
                    </div>
                  )}
                </div>

                {/* Network */}
                <div className="space-y-0.5">
                  <button
                    type="button"
                    title={isSidebarCollapsed ? "Network" : undefined}
                    className={navGroupBtn(isSidebarCollapsed)}
                    onClick={() => toggleMenu("network")}
                  >
                    <span className={cn("flex min-w-0 items-center gap-2", isSidebarCollapsed && "justify-center")}>
                      <Users size={16} className="shrink-0" />
                      <span className={cn("truncate", isSidebarCollapsed && "md:hidden")}>Network</span>
                    </span>
                    {!isSidebarCollapsed &&
                      (openMenus.includes("network") ? (
                        <ChevronDown size={16} className="shrink-0 opacity-80" />
                      ) : (
                        <ChevronRight size={16} className="shrink-0 opacity-80" />
                      ))}
                  </button>
                  {openMenus.includes("network") && !isSidebarCollapsed && (
                    <div className="ml-1 space-y-0.5 border-l border-white/15 pl-2">
                      <button
                        type="button"
                        onClick={() => setActiveSection("follow")}
                        className={menuItemClass("follow")}
                      >
                        Follow
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveSection("messages")}
                        className={menuItemClass("messages")}
                      >
                        Messages
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveSection("connection")}
                        className={menuItemClass("connection")}
                      >
                        Connection
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveSection("appointments")}
                        className={menuItemClass("appointments")}
                      >
                        Appointments
                      </button>
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  title={isSidebarCollapsed ? "Help & Support" : undefined}
                  onClick={() => setActiveSection("help")}
                  className={cn(
                    "flex w-full items-center gap-2 rounded-xl py-2 pl-2 text-left text-xs font-medium transition-colors md:text-sm",
                    isSidebarCollapsed && "justify-center px-0",
                    activeSection === "help"
                      ? "border border-white/20 bg-white/15 text-white"
                      : "text-white/85 hover:bg-white/10",
                  )}
                >
                  <HelpCircle size={16} className="shrink-0" />
                  <span className={cn("truncate", isSidebarCollapsed && "md:hidden")}>Help & Support</span>
                </button>

                <button
                  type="button"
                  title={isSidebarCollapsed ? "Settings" : undefined}
                  onClick={() => setActiveSection("settings")}
                  className={cn(
                    "flex w-full items-center gap-2 rounded-xl py-2 pl-2 text-left text-xs font-medium transition-colors md:text-sm",
                    isSidebarCollapsed && "justify-center px-0",
                    activeSection === "settings"
                      ? "border border-white/20 bg-white/15 text-white"
                      : "text-white/85 hover:bg-white/10",
                  )}
                >
                  <Settings size={16} className="shrink-0" />
                  <span className={cn("truncate", isSidebarCollapsed && "md:hidden")}>Settings</span>
                </button>
              </div>

              <div className="mt-2 shrink-0 space-y-1.5 border-t border-white/10 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  title={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                  onClick={() => setIsSidebarCollapsed((c) => !c)}
                  className="hidden w-full border-white/40 bg-white/10 text-white hover:bg-white/20 hover:text-white md:flex"
                >
                  <Sidebar className="h-4 w-4 shrink-0" />
                  {!isSidebarCollapsed && <span className="ml-2 truncate">Collapse</span>}
                </Button>
                <Button
                  type="button"
                  onClick={() => logout()}
                  title="Logout"
                  className={cn(
                    "w-full text-white hover:opacity-95",
                    isSidebarCollapsed && "md:px-0",
                  )}
                  style={{ backgroundColor: "#FF131C" }}
                >
                  <span className="flex items-center justify-center gap-2">
                    <LogOut className="h-4 w-4 shrink-0" />
                    <span className={cn(isSidebarCollapsed && "md:hidden")}>Logout</span>
                  </span>
                </Button>
              </div>
            </div>
          </aside>
        </div>

        <div className="relative z-10 flex min-h-0 min-w-0 flex-1 flex-col">
          <div className="mx-4 mt-4 flex items-center justify-between rounded-2xl border border-white/40 bg-white/45 px-4 py-3 shadow-sm backdrop-blur-xl md:hidden">
            <Button
              variant="ghost"
              size="sm"
              className="text-[#004A96]"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <span className="text-sm font-semibold text-[#004A96]">Exhibitor</span>
            <div className="w-9" />
          </div>

          <main
            className={cn(
              "mx-4 mb-4 mt-4 flex min-h-0 flex-1 flex-col overflow-auto rounded-[1.75rem] border border-white/50 bg-white/45 p-5 shadow-[0_8px_32px_rgba(0,74,150,0.12)] backdrop-blur-xl sm:p-6",
              "md:mx-0 md:mb-0 md:mt-0 md:min-h-[calc(100vh-2.5rem)] md:pt-6 md:pb-6 md:pr-6",
              isSidebarCollapsed ? "md:pl-12" : "md:pl-36",
            )}
          >
            {exhibitor && !authLoading && !loading && !error && (
              <div className="mb-4 flex flex-shrink-0 items-center justify-end gap-3 border-b border-[#004A96]/10 pb-4">
                <div className="min-w-0 max-w-[14rem] text-right sm:max-w-xs">
                  <p className="truncate text-sm font-semibold text-slate-800 md:text-base">
                    {exhibitor.displayName?.trim() ||
                      `${exhibitor.firstName} ${exhibitor.lastName}`.replace(/\s+/g, " ").trim()}
                  </p>
                  <p className="mt-0.5 flex items-center justify-end gap-1 truncate text-xs text-slate-500">
                    <Building2 className="h-3.5 w-3.5 shrink-0 text-[#004A96]/80" aria-hidden />
                    <span className="truncate">
                      {exhibitor.company || exhibitor.organizationName || "Company profile"}
                    </span>
                  </p>
                  {exhibitor.jobTitle?.trim() ? (
                    <p className="mt-0.5 truncate text-xs font-medium text-[#004A96]">{exhibitor.jobTitle}</p>
                  ) : null}
                </div>
                <Avatar className="h-11 w-11 shrink-0 ring-2 ring-[#004A96]/25 ring-offset-2 ring-offset-white/60">
                  <AvatarImage src={exhibitor.avatar || undefined} alt="" />
                  <AvatarFallback className="bg-[#004A96]/10 text-sm font-semibold text-[#004A96]">
                    {(() => {
                      const label = (
                        exhibitor.displayName || `${exhibitor.firstName} ${exhibitor.lastName}`
                      ).trim()
                      const parts = label.split(/\s+/).filter(Boolean)
                      if (parts.length >= 2) {
                        return `${parts[0][0] ?? ""}${parts[parts.length - 1][0] ?? ""}`.toUpperCase()
                      }
                      if (label.length >= 2) return label.slice(0, 2).toUpperCase()
                      return (
                        `${exhibitor.firstName[0] ?? ""}${exhibitor.lastName[0] ?? ""}`.toUpperCase() || "?"
                      )
                    })()}
                  </AvatarFallback>
                </Avatar>
              </div>
            )}
            <DashboardManagedBanner page="exhibitor-dashboard" />
            <div className="mx-auto w-full max-w-7xl flex-1">{renderMainContent()}</div>
          </main>
        </div>
      </div>
    </div>
  )
}