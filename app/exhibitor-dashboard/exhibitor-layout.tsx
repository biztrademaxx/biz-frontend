"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/use-auth"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import MessagesCenter from "@/app/organizer-dashboard/messages-center"
import EventPromotion from "@/app/organizer-dashboard/event-promotion"
import {
  Building2,
  Calendar,
  Users,
  TrendingUp,
  Package,
  Settings,
  Star,
  BarChart3,
  HelpCircle,
  ChevronDown,
  ChevronRight,
  Menu,
  X,
  LogOut,
  Crown,
  MessageSquare,
  LayoutDashboard,
  type LucideIcon,
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
import ActivePromotions from "./active-promotion"
import { ExhibitorHelpSupport } from "./help-support"
import ViewFeedback from "./view-feedback"
import { DashboardManagedBanner } from "@/components/dashboard-managed-banner"
import { DashboardPricingPlansView } from "@/components/dashboard-packages"
import { AppImage } from "@/components/app-image"
import { cn } from "@/lib/utils"
import {
  exCardShell,
  exNavActive,
  exNavGroupLabel,
  exNavInactive,
  exPrimaryBtn,
  exSidebarSurface,
  exUpgradeCard,
} from "./dashboard-theme"
import { ExhibitorDashboardOverview } from "./dashboard-overview"

type ExhibitorNavItem = { id: string; title: string; icon: LucideIcon }

const EXHIBITOR_SIDEBAR_GROUPS: { id: string; label: string; items: ExhibitorNavItem[] }[] = [
  {
    id: "main",
    label: "Overview",
    items: [
      { id: "overview", title: "Overview", icon: LayoutDashboard },
      { id: "company", title: "Company Profile", icon: Building2 },
    ],
  },
  {
    id: "feedback",
    label: "Feedback",
    items: [{ id: "view-feedback", title: "View Feedback", icon: Star }],
  },
  {
    id: "leadManagement",
    label: "Event & Products",
    items: [
      { id: "events", title: "My Events", icon: Calendar },
      { id: "products", title: "Products", icon: Package },
    ],
  },
  {
    id: "marketingCampaigns",
    label: "Marketing",
    items: [
      { id: "promotions", title: "Promotions", icon: TrendingUp },
      { id: "active-promotions", title: "Active Promotions", icon: Star },
    ],
  },
  {
    id: "network",
    label: "Network",
    items: [
      { id: "follow", title: "Follow", icon: Users },
      { id: "messages", title: "Messages", icon: MessageSquare },
      { id: "connection", title: "Connection", icon: Users },
      { id: "appointments", title: "Appointments", icon: Calendar },
    ],
  },
]

const EXHIBITOR_INDIVIDUAL_ITEMS: ExhibitorNavItem[] = [
  //{ id: "analytics", title: "Analytics", icon: BarChart3 },
  { id: "pricing-plans", title: "Pricing plans", icon: Crown },
  { id: "help", title: "Help & Support", icon: HelpCircle },
  { id: "settings", title: "Settings", icon: Settings },
]

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
  profileCity?: string
  profileState?: string
  profileCountry?: string
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
      setActiveSection("overview")
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
    foundedYear: e?.foundedYear ?? e?.founded ?? "",
    companySize: e?.companySize ?? e?.teamSize ?? "",
    industry: e?.industry ?? e?.companyIndustry ?? "",
    headquarters: e?.headquarters ?? "",
    specialties: Array.isArray(e?.specialties) ? e.specialties : [],
    profileCity: e?.profileCity,
    profileState: e?.profileState,
    profileCountry: e?.profileCountry,
    location: e?.location,
    totalProducts: productCount,
    totalEvents: e?.totalEvents ?? 0,
    activeEvents: e?.activeEvents ?? 0,
    totalLeads: (e as any)?.totalLeads ?? 0,
    pendingLeads: (e as any)?.pendingLeads ?? 0,
    profileViews: (e as any)?.profileViews ?? 0,
    upcomingAppointments: (e as any)?.upcomingAppointments ?? 0,
  })

  /** API id for the logged-in exhibitor: always prefer JWT `sub` so slug URLs (canonical redirect) never break fetch. */
  const resolveExhibitorSegment = (): string | null => {
    const sessionId = getCurrentUserId()?.trim()
    if (sessionId && sessionId !== "undefined") return sessionId
    const t = routeSegment?.trim()
    if (t && t !== "undefined") return t
    return null
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

  const exhibitorDisplayName =
    exhibitor?.displayName?.trim() ||
    [exhibitor?.firstName, exhibitor?.lastName].filter(Boolean).join(" ").trim() ||
    "Exhibitor"

  const getCurrentSectionTitle = () => {
    const fromGroups = EXHIBITOR_SIDEBAR_GROUPS.flatMap((g) => g.items).find((i) => i.id === activeSection)
    if (fromGroups) return fromGroups.title
    const fromIndividual = EXHIBITOR_INDIVIDUAL_ITEMS.find((i) => i.id === activeSection)
    if (fromIndividual) return fromIndividual.title
    return "Exhibitor Dashboard"
  }

  const renderMainContent = () => {
    if (authLoading) {
      return (
        <div className="flex min-h-[50vh] items-center justify-center">
          <div
            className="h-12 w-12 animate-spin rounded-full border-2 border-[#004A96]/20 border-t-[#004A96]"
            aria-hidden
          />
        </div>
      )
    }
    if (loading) {
      return (
        <div className="flex min-h-[50vh] items-center justify-center">
          <div
            className="h-14 w-14 animate-spin rounded-full border-2 border-blue-100 border-t-[#004A96]"
            aria-hidden
          />
        </div>
      )
    }
    if (error) {
      return (
        <div className="flex min-h-[50vh] items-center justify-center">
          <Card className={cn("w-full max-w-md", exCardShell)}>
            <CardHeader>
              <CardTitle className="text-red-600">Error</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">{error}</p>
              <Button
                onClick={fetchExhibitorData}
                className={cn("w-full", exPrimaryBtn)}
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
          <Card className={cn("w-full max-w-md", exCardShell)}>
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
          <ExhibitorDashboardOverview
            exhibitor={exhibitor}
            onNavigate={(section) => setActiveSection(section)}
          />
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
          <div className="min-w-0 space-y-6">
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
  return (
    <ExhibitorDashboardOverview
      exhibitor={exhibitor}
      onNavigate={(section) => setActiveSection(section)}
    />
  )
      }
  }

  const sidebarInitial = (
    exhibitor?.firstName?.[0] ||
    exhibitor?.lastName?.[0] ||
    exhibitorDisplayName[0] ||
    "E"
  ).toUpperCase()

  return (
    <div className="flex min-h-0 flex-1 w-full overflow-hidden bg-[#f8fafc]">
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden
        />
      )}

      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 h-full w-[min(100vw,260px)] max-w-[85vw] shrink-0 transform transition-transform duration-300 ease-in-out md:static md:max-w-none md:w-[260px] md:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <aside className={cn("flex h-full w-[260px] flex-col overflow-hidden", exSidebarSurface)}>
          <div className="flex items-center justify-between border-b border-slate-200 p-4 md:hidden">
            <h2 className="text-lg font-semibold text-slate-900">Menu</h2>
            <Button variant="ghost" size="sm" onClick={() => setSidebarOpen(false)} className="text-slate-600">
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="scrollbar-hover min-h-0 flex-1 overflow-y-auto px-3 py-4">
            {EXHIBITOR_SIDEBAR_GROUPS.map((group) => (
              <div key={group.id} className="mb-5">
                <button
                  type="button"
                  className={cn(
                    "mb-1 flex w-full cursor-pointer items-center justify-between rounded-md px-2 py-1.5",
                    exNavGroupLabel,
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
                        onClick={() => {
                          setActiveSection(item.id)
                          setSidebarOpen(false)
                        }}
                        className={cn(
                          "flex w-full items-center gap-3 py-2.5 pr-3 text-sm transition-colors",
                          activeSection === item.id ? exNavActive : exNavInactive,
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
              {EXHIBITOR_INDIVIDUAL_ITEMS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setActiveSection(item.id)
                    setSidebarOpen(false)
                  }}
                  className={cn(
                    "flex w-full items-center gap-3 py-2.5 pr-3 text-sm transition-colors",
                    activeSection === item.id ? exNavActive : exNavInactive,
                  )}
                >
                  <item.icon className="h-4 w-4 shrink-0" />
                  <span className="truncate">{item.title}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="shrink-0 space-y-3 border-t border-slate-200 p-4">
            <div className={exUpgradeCard}>
              <div className="flex items-start gap-2">
                <Crown className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
                <div>
                  <p className="text-sm font-bold text-[#004A96]">Upgrade to Pro</p>
                  <p className="mt-0.5 text-xs text-slate-600">Unlock advanced booth features and visibility.</p>
                </div>
              </div>
              <Button
                type="button"
                size="sm"
                className={cn("mt-3 h-9 w-full rounded-lg", exPrimaryBtn)}
                onClick={() => setActiveSection("pricing-plans")}
              >
                Upgrade Now
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>

            {exhibitor && (
              <div className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2.5">
                <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full bg-blue-50 ring-2 ring-blue-100">
                  {exhibitor.avatar ? (
                    <AppImage src={exhibitor.avatar} alt={exhibitorDisplayName} fill className="object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-xs font-bold text-[#004A96]">
                      {sidebarInitial}
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-900">{exhibitorDisplayName}</p>
                  <p className="truncate text-xs text-slate-500">Exhibitor</p>
                </div>
              </div>
            )}

            <Button type="button" onClick={() => logout()} className={cn("h-10 w-full rounded-lg", exPrimaryBtn)}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Logout</span>
            </Button>
          </div>
        </aside>
      </div>

      <div className="relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <div className="flex items-center justify-between gap-2 border-b border-slate-200 bg-white px-3 py-3 md:hidden">
          <Button variant="ghost" size="sm" className="shrink-0 text-[#004A96]" onClick={() => setSidebarOpen(true)}>
            <Menu className="h-5 w-5" />
          </Button>
          <div className="min-w-0 flex-1 px-1 text-center">
            {exhibitorDisplayName ? (
              <p className="truncate text-xs text-slate-500">{exhibitorDisplayName}</p>
            ) : null}
            <p className="truncate text-sm font-semibold text-[#004A96]">{getCurrentSectionTitle()}</p>
          </div>
          <div className="w-9 shrink-0" />
        </div>

        <main className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden p-0">
          {activeSection !== "overview" && (
            <DashboardManagedBanner page="exhibitor-dashboard" className="w-full min-w-0" />
          )}
          <div className="w-full min-w-0 max-w-full px-2 py-4 sm:px-4 sm:py-5 md:px-6 md:py-6">{renderMainContent()}</div>
        </main>
      </div>
    </div>
  )
}