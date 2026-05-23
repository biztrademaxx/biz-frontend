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
  Crown,
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
import { DashboardPricingPlansView } from "@/components/dashboard-packages"
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
  /** UUID, slug from `/exhibitor-dashboard/[id]`, or empty (we fall back to JWT `sub`). */
  routeSegment: string | undefined
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

  // Valid URL segment or JWT user id (never call API with undefined → encodeURIComponent("undefined"))
  const resolveExhibitorSegment = (): string | null => {
    const t = routeSegment?.trim()
    if (t && t !== "undefined") return t
    return getCurrentUserId()
  }

  const fetchExhibitorData = async () => {
    try {
      setLoading(true)
      setError(null)

      const segment = resolveExhibitorSegment()
      if (!segment) {
        setError("Missing exhibitor ID")
        return
      }

      const exhibitorRes = await apiFetch<{ success: boolean; exhibitor: any }>(
        `/api/exhibitors/${encodeURIComponent(segment)}`,
        {
          method: "GET",
          auth: true,
        },
      )

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
      if (err instanceof Error && (err.message === "Access denied" || err.message === "User not found" || err.message.includes("Exhibitor not found") || err.message.includes("Invalid exhibitor ID"))) {
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
    const apiSegment = exhibitor?.id ?? resolveExhibitorSegment()
    if (!apiSegment) {
      throw new Error("No exhibitor id")
    }
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
        const productCount = await fetchProductCount(data.exhibitor.id as string)
        setExhibitor((prev: any) => ({ ...prev, ...mapBackendExhibitor(data.exhibitor, productCount) }))
      }
    } catch (error) {
      console.error("Error updating exhibitor:", error)
      throw error
    }
  }

  // Light glass sidebar (reference) — active item: vibrant purple accent + soft frosted pill
  const menuItemClass = (sectionId: string) =>
    cn(
      "w-full cursor-pointer rounded-lg border-l-4 py-1.5 pl-2 text-left text-xs transition-colors md:text-sm",
      activeSection === sectionId
        ? "border-[#8E54E9] bg-gradient-to-r from-[#8E54E9]/14 via-white/65 to-[#4776E6]/12 font-semibold text-[#5b21b6] shadow-sm [&_svg]:text-[#8E54E9]"
        : "border-transparent text-slate-600 hover:bg-white/60 hover:text-[#5b21b6]",
    )

  const navGroupBtn = (collapsed: boolean) =>
    cn(
      "flex w-full items-center rounded-xl text-left text-xs font-medium text-slate-700 transition hover:bg-white/55 hover:text-[#5b21b6] [&_svg]:text-slate-500 hover:[&_svg]:text-[#8E54E9]",
      collapsed ? "justify-center px-0 py-2" : "justify-between py-2 pl-1 pr-1",
    )

  const sidebarUtilityNavClass = (sectionId: string, collapsed: boolean) =>
    cn(
      "flex w-full items-center gap-2 rounded-xl py-2 pl-2 text-left text-xs font-medium transition-colors md:text-sm",
      collapsed && "justify-center px-0",
      activeSection === sectionId
        ? "border border-[#8E54E9]/35 bg-gradient-to-r from-[#8E54E9]/12 to-[#4776E6]/10 text-[#5b21b6] shadow-sm [&_svg]:text-[#8E54E9]"
        : "border border-transparent text-slate-600 hover:bg-white/55 hover:text-[#5b21b6] [&_svg]:text-slate-500 hover:[&_svg]:text-[#8E54E9]",
    )

  const renderMainContent = () => {
    if (authLoading) {
      return (
        <div className="flex min-h-[50vh] items-center justify-center">
          <div
            className="h-12 w-12 animate-spin rounded-full border-2 border-[#8E54E9]/20 border-t-[#4776E6]"
            aria-hidden
          />
        </div>
      )
    }
    if (loading) {
      return (
        <div className="flex min-h-[50vh] items-center justify-center">
          <div
            className="h-14 w-14 animate-spin rounded-full border-2 border-[#8E54E9]/20 border-t-[#4776E6]"
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
              <CardTitle className="text-red-600">Error</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">{error}</p>
              <Button
                onClick={fetchExhibitorData}
                className="w-full bg-gradient-to-r from-[#8E54E9] to-[#4776E6] text-white hover:opacity-[0.96]"
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
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#8E54E9] to-[#4776E6] text-white shadow-md shadow-[#8E54E9]/20">
                    <Calendar className="h-4 w-4" />
                  </span>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-[#4776E6]">{exhibitor.activeEvents}</div>
                </CardContent>
              </Card>

              <Card className={cn(exGlassCard, "overflow-hidden")}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-slate-700">Products</CardTitle>
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl border-2 border-[#4776E6]/30 bg-[#4776E6]/10 text-[#4776E6]">
                    <Package className="h-4 w-4" />
                  </span>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-[#4776E6]">{exhibitor.totalProducts}</div>
                  <p className="text-xs text-slate-500">
                    {exhibitor.profileViews || 0} total views
                  </p>
                </CardContent>
              </Card>

              <Card className={cn(exGlassCard, "overflow-hidden")}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-slate-700">Leads</CardTitle>
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl border-2 border-[#ec4899]/35 bg-gradient-to-br from-[#fce7f3]/80 to-white text-[#db2777] shadow-sm">
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
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl border-2 border-[#a855f7]/30 bg-gradient-to-br from-[#eef2ff] to-white text-[#7c3aed] shadow-sm">
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
                  <Avatar className="h-16 w-16 ring-2 ring-[#4776E6]/20 ring-offset-2 ring-offset-white/40">
                    <AvatarImage src={exhibitor.avatar } />
                    <AvatarFallback className="bg-[#4776E6]/10 text-lg font-semibold text-[#4776E6]">
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
                        <Briefcase className="mr-2 h-4 w-4 shrink-0 text-[#4776E6]" />
                        {exhibitor.jobTitle}
                      </p>
                    )}
                    {exhibitor.location && (
                      <p className="mt-1 flex items-center text-slate-600">
                        <MapPin className="mr-2 h-4 w-4 shrink-0 text-[#4776E6]" />
                        {exhibitor.location}
                      </p>
                    )}
                    <div className="mt-3 flex flex-wrap items-center gap-3">
                      {exhibitor.email && (
                        <a
                          href={`mailto:${exhibitor.email}`}
                          className="flex items-center text-sm font-medium text-[#4776E6] hover:underline"
                        >
                          <Mail className="mr-1 h-4 w-4" />
                          Email
                        </a>
                      )}
                      {exhibitor.phone && (
                        <a
                          href={`tel:${exhibitor.phone}`}
                          className="flex items-center text-sm font-medium text-[#4776E6] hover:underline"
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
                          className="flex items-center text-sm font-medium text-[#4776E6] hover:underline"
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
                          className="flex items-center text-sm font-medium text-[#4776E6] hover:underline"
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
      case "pricing-plans":
        return <DashboardPricingPlansView role="EXHIBITOR" />
      case "help":
        return <ExhibitorHelpSupport />
      case "settings":
        return <ExhibitorSettings />
      default:
        return <CompanyInfo exhibitorId={exhibitor.id} onUpdate={handleUpdate} exhibitorData={exhibitor} />
    }
  }

  return (
    <div className="relative flex min-h-screen w-full overflow-x-hidden bg-[#f7f5fc]">
      <div
        className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(ellipse_120%_90%_at_100%_-15%,rgba(142,84,233,0.2),transparent_55%),radial-gradient(ellipse_100%_80%_at_-10%_110%,rgba(236,72,153,0.14),transparent_50%),radial-gradient(ellipse_70%_60%_at_75%_45%,rgba(71,118,230,0.1),transparent_55%)]"
        aria-hidden
      />
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden
        />
      )}

      <div className="flex w-full flex-1 flex-col md:flex-row md:items-stretch md:gap-6 md:px-5 md:py-5">
        <div
          className={cn(
            "fixed inset-y-0 left-0 z-50 p-4 md:relative md:inset-auto md:z-30 md:flex md:shrink-0 md:items-start md:self-stretch md:p-0",
            "transform transition-transform duration-300 ease-in-out",
            sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
          )}
        >
          <aside
            className={cn(
              "relative flex min-h-0 flex-col overflow-hidden rounded-[2rem] border border-white/70 bg-white/42 shadow-[0_8px_44px_rgba(142,84,233,0.14)] backdrop-blur-xl transition-[width] duration-300 ease-out",
              "w-64 min-w-[16rem] max-h-[calc(100dvh-2rem)]",
              "md:h-[calc(100vh-2.5rem)] md:max-h-[calc(100vh-2.5rem)]",
              isSidebarCollapsed ? "md:w-[4.5rem] md:min-w-[4.5rem]" : "md:w-64 md:min-w-[16rem]",
            )}
          >
            <div
              className="pointer-events-none absolute inset-0 rounded-[2rem] bg-[linear-gradient(165deg,rgba(142,84,233,0.12)_0%,rgba(255,255,255,0.48)_45%,rgba(71,118,230,0.1)_100%)]"
              aria-hidden
            />
            <div className="relative z-10 flex min-h-0 flex-1 flex-col overflow-hidden">
              <div className="flex items-center justify-between border-b border-[#8E54E9]/10 p-3 md:hidden">
                <h2 className="text-lg font-semibold text-slate-800">Exhibitor Menu</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-slate-600 hover:bg-white/60 hover:text-[#5b21b6]"
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
                    <div className="ml-1 space-y-0.5 border-l border-[#8E54E9]/20 pl-2">
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
                    <div className="ml-1 space-y-0.5 border-l border-[#8E54E9]/20 pl-2">
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
                    <div className="ml-1 space-y-0.5 border-l border-[#8E54E9]/20 pl-2">
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
                    <div className="ml-1 space-y-0.5 border-l border-[#8E54E9]/20 pl-2">
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
                    <div className="ml-1 space-y-0.5 border-l border-[#8E54E9]/20 pl-2">
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
                  title={isSidebarCollapsed ? "Pricing plans" : undefined}
                  onClick={() => {
                    setActiveSection("pricing-plans")
                    setSidebarOpen(false)
                  }}
                  className={sidebarUtilityNavClass("pricing-plans", isSidebarCollapsed)}
                >
                  <Crown size={16} className="shrink-0" />
                  <span className={cn("truncate", isSidebarCollapsed && "md:hidden")}>Pricing plans</span>
                </button>

                <button
                  type="button"
                  title={isSidebarCollapsed ? "Help & Support" : undefined}
                  onClick={() => setActiveSection("help")}
                  className={sidebarUtilityNavClass("help", isSidebarCollapsed)}
                >
                  <HelpCircle size={16} className="shrink-0" />
                  <span className={cn("truncate", isSidebarCollapsed && "md:hidden")}>Help & Support</span>
                </button>

                <button
                  type="button"
                  title={isSidebarCollapsed ? "Settings" : undefined}
                  onClick={() => setActiveSection("settings")}
                  className={sidebarUtilityNavClass("settings", isSidebarCollapsed)}
                >
                  <Settings size={16} className="shrink-0" />
                  <span className={cn("truncate", isSidebarCollapsed && "md:hidden")}>Settings</span>
                </button>
                </div>

                {!isSidebarCollapsed && (
                  <div className="mt-3 shrink-0 rounded-2xl border border-white/75 bg-white/50 p-3 shadow-[0_6px_28px_rgba(142,84,233,0.11)] backdrop-blur-md">
                    <div
                      className="mb-3 flex h-14 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-[#8E54E9]/15 via-white/50 to-[#4776E6]/14"
                      aria-hidden
                    >
                      <div className="flex items-end gap-1">
                        <span className="h-5 w-2 rounded-t-md bg-[#8E54E9]" />
                        <span className="h-10 w-2 rounded-t-md bg-[#4776E6]" />
                        <span className="h-7 w-2 rounded-t-md bg-[#a855f7]" />
                        <span className="h-4 w-2 rounded-t-md bg-[#818cf8]" />
                      </div>
                    </div>
                    <p className="text-sm font-bold leading-tight text-slate-800">Analysis report</p>
                    <p className="mt-1 text-xs leading-snug text-slate-600">Yearly detail & booth metrics</p>
                    <Button
                      type="button"
                      className="mt-3 h-9 w-full rounded-full bg-gradient-to-r from-[#8E54E9] to-[#4776E6] text-xs font-semibold text-white shadow-md shadow-[#8E54E9]/25 hover:opacity-[0.96]"
                      onClick={() => {
                        setActiveSection("analytics")
                        setSidebarOpen(false)
                      }}
                    >
                      Get report
                    </Button>
                  </div>
                )}

                <div className="mt-2 shrink-0 space-y-1.5 border-t border-[#8E54E9]/12 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    title={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                    onClick={() => setIsSidebarCollapsed((c) => !c)}
                    className="hidden w-full border-[#8E54E9]/25 bg-white/70 text-[#5b21b6] hover:bg-white hover:text-[#4776E6] md:flex"
                  >
                    <Sidebar className="h-4 w-4 shrink-0" />
                    {!isSidebarCollapsed && <span className="ml-2 truncate">Collapse</span>}
                  </Button>
                  <Button
                    type="button"
                    onClick={() => logout()}
                    title="Logout"
                    className={cn(
                      "w-full bg-gradient-to-r from-[#8E54E9] to-[#4776E6] text-white shadow-md hover:opacity-[0.96]",
                      isSidebarCollapsed && "md:px-0",
                    )}
                  >
                    <span className="flex items-center justify-center gap-2">
                      <LogOut className="h-4 w-4 shrink-0" />
                      <span className={cn(isSidebarCollapsed && "md:hidden")}>Logout</span>
                    </span>
                  </Button>
                </div>
              </div>
            </div>
          </aside>
        </div>

        <div className="relative z-10 flex min-h-0 min-w-0 flex-1 flex-col">
          <div className="mx-4 mt-4 flex items-center justify-between rounded-2xl border border-white/50 bg-white/45 px-4 py-3 shadow-sm backdrop-blur-xl md:hidden">
            <Button
              variant="ghost"
              size="sm"
              className="text-[#5b21b6]"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <span className="text-sm font-semibold bg-gradient-to-r from-[#8E54E9] to-[#4776E6] bg-clip-text text-transparent">Exhibitor</span>
            <div className="w-9" />
          </div>

          <main
            className={cn(
              "mx-4 mb-4 mt-4 flex min-h-0 flex-1 flex-col overflow-auto rounded-[1.75rem] border border-white/55 bg-white/42 p-5 shadow-[0_8px_36px_rgba(142,84,233,0.12)] backdrop-blur-xl sm:p-6",
              "md:mx-0 md:mb-0 md:mt-0 md:min-h-[calc(100vh-2.5rem)] md:p-6",
            )}
          >
            {exhibitor && !authLoading && !loading && !error && (
              <div className="relative mb-4 overflow-hidden rounded-[1.35rem] border border-white/60 bg-white/38 px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] backdrop-blur-md">
                <div
                  className="pointer-events-none absolute -right-8 top-1/2 h-52 w-52 -translate-y-1/2 rounded-full bg-[#8E54E9]/35 blur-3xl"
                  aria-hidden
                />
                <div
                  className="pointer-events-none absolute right-8 -top-12 h-44 w-44 rounded-full bg-[#4776E6]/28 blur-3xl"
                  aria-hidden
                />
                <div
                  className="pointer-events-none absolute -right-4 bottom-0 h-32 w-40 rounded-full bg-[#f472b6]/18 blur-2xl"
                  aria-hidden
                />
                <div className="relative flex flex-shrink-0 items-center justify-end gap-3 border-b border-[#8E54E9]/10 pb-3">
                <div className="min-w-0 max-w-[14rem] text-right sm:max-w-xs">
                  <p className="truncate text-sm font-semibold text-slate-800 md:text-base">
                    {exhibitor.displayName?.trim() ||
                      `${exhibitor.firstName} ${exhibitor.lastName}`.replace(/\s+/g, " ").trim()}
                  </p>
                  <p className="mt-0.5 flex items-center justify-end gap-1 truncate text-xs text-slate-500">
                    <Building2 className="h-3.5 w-3.5 shrink-0 text-[#8E54E9]/80" aria-hidden />
                    <span className="truncate">
                      {exhibitor.company || exhibitor.organizationName || "Company profile"}
                    </span>
                  </p>
                  {exhibitor.jobTitle?.trim() ? (
                    <p className="mt-0.5 truncate text-xs font-medium text-[#5b21b6]">{exhibitor.jobTitle}</p>
                  ) : null}
                </div>
                <Avatar className="h-11 w-11 shrink-0 ring-2 ring-[#8E54E9]/30 ring-offset-2 ring-offset-white/70">
                  <AvatarImage src={exhibitor.avatar || undefined} alt="" />
                  <AvatarFallback className="bg-gradient-to-br from-[#8E54E9]/20 to-[#4776E6]/25 text-sm font-semibold text-[#5b21b6]">
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