"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/use-auth"
import { useRouter, usePathname } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useToast } from "@/hooks/use-toast"
import { ConnectionsSection } from "@/app/dashboard/connections-section"
import {
  MessageSquare,
  HelpCircle,
  Settings,
  ChevronDown,
  ChevronRight,
  User,
  Menu,
  X,
  LayoutDashboard,
  Presentation,
  LogOut,
  Bell,
  Search,
  Mic,
  CalendarDays,
  TrendingUp,
  Star,
  Sparkles,
  Zap,
  ChevronLeft,
  PanelLeftClose,
  PanelLeftOpen,
  BarChart3,
} from "lucide-react"

import { cn } from "@/lib/utils"
import {
  exCardShell,
  exNavActive,
  exNavInactive,
  exNavGroupLabel,
  exPrimaryBtn,
  exSidebarSurface,
} from "@/app/exhibitor-dashboard/dashboard-theme"
import MyProfile from "./my-profile"
import MySessions from "./my-sessions"
import { PresentationMaterials } from "./presentation-materials"
import MessagesCenter from "@/app/organizer-dashboard/messages-center"
import { SpeakerSettings } from "./speaker-settings"
import { useDashboard } from "@/contexts/dashboard-context"
import { SpeakerHelpSupport } from "./help-support"
import { apiFetch, getCurrentUserId } from "@/lib/api"
import { getSpeakerDashboardPath } from "@/lib/profile-path"
import { DashboardManagedBanner } from "@/components/dashboard-managed-banner"
import SpeakerOverview from "./overview"

interface SpeakerData {
  id: string
  firstName: string
  lastName: string
  displayName?: string
  publicSlug?: string | null
  email: string
  phone?: string
  avatar?: string
  bio?: string
  website?: string
  twitter?: string
  location?: string
  jobTitle?: string
  totalEvents: number
  activeEvents: number
  totalSessions: number
  profileViews: number
}

interface UserDashboardProps {
  routeSegment: string
}

export function SpeakerDashboard({ routeSegment }: UserDashboardProps) {
  const [speaker, setSpeaker] = useState<SpeakerData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { activeSection, setActiveSection } = useDashboard()
  const [openMenus, setOpenMenus] = useState<string[]>(["speaker-management", "communication"])
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  const { userId: authUserId, role, loading: authLoading, logout } = useAuth({
    requireAuth: true,
    allowedRoles: ["SPEAKER"],
  })
  const router = useRouter()
  const pathname = usePathname()
  const { toast } = useToast()

  useEffect(() => {
    const handleNavigate = (event: CustomEvent) => {
      const { section } = event.detail
      if (section && ["myprofile", "mysessions", "materials", "message", "connection", "help", "settings", "overview"].includes(section)) {
        setActiveSection(section)
      }
    }
    window.addEventListener('navigateDashboard', handleNavigate as EventListener)
    return () => {
      window.removeEventListener('navigateDashboard', handleNavigate as EventListener)
    }
  }, [setActiveSection])

  useEffect(() => {
    if (!activeSection) {
      setActiveSection("overview")
    }
  }, [activeSection, setActiveSection])

  useEffect(() => {
    if (authLoading) return
    const roleUpper = (role || "").toUpperCase()
    if (roleUpper !== "SPEAKER") return
    fetchSpeakerData()
  }, [routeSegment, role, authLoading, router, toast])

  useEffect(() => {
    if (!speaker?.id || authLoading) return
    const sessionUser = getCurrentUserId()
    if (sessionUser && sessionUser !== speaker.id) {
      toast({
        title: "Access denied",
        description: "You can only open your own speaker dashboard.",
        variant: "destructive",
      })
      router.replace("/login")
    }
  }, [speaker?.id, authLoading, router, toast])

  useEffect(() => {
    if (!speaker?.id) return
    const canonical = getSpeakerDashboardPath(speaker.id, {
      publicSlug: speaker.publicSlug,
      firstName: speaker.firstName,
      lastName: speaker.lastName,
    })
    if (pathname && canonical !== pathname) {
      router.replace(canonical)
    }
  }, [speaker?.id, speaker?.publicSlug, speaker?.firstName, speaker?.lastName, pathname, router])

  const fetchSpeakerData = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await apiFetch<{ user?: SpeakerData }>(`/api/users/${encodeURIComponent(routeSegment)}`, {
        method: "GET",
        auth: true,
      })
      const u = data.user
      if (!u) throw new Error("Speaker not found")
      setSpeaker(u)
    } catch (err: unknown) {
      console.error("Error fetching speaker data:", err)
      const message = err instanceof Error ? err.message : "An error occurred"
      const status = typeof err === "object" && err !== null && "status" in err ? (err as { status?: number }).status : undefined
      setError(message)
      const notFound = status === 404 || /not found/i.test(message)
      const forbidden = status === 403 || /forbidden|access denied/i.test(message)
      if (notFound || forbidden) {
        toast({
          title: "Error",
          description: notFound ? "Speaker not found" : "Access denied",
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

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed)
  }

  const sectionLabel: Record<string, string> = {
    myprofile: "My Profile",
    mysessions: "My Sessions",
    materials: "Presentation Materials",
    message: "Messages",
    connection: "Connections",
    help: "Help & Support",
    settings: "Settings",
    overview: "Overview",
  }

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center bg-[#f8fafc]">
        <div
          className="h-14 w-14 animate-spin rounded-full border-2 border-blue-100 border-t-[#004A96]"
          aria-hidden
        />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center bg-[#f8fafc] p-4">
        <Card className={cn("w-full max-w-md", exCardShell)}>
          <CardHeader>
            <CardTitle className="text-red-600">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={fetchSpeakerData} className={cn("w-full", exPrimaryBtn)}>
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!speaker) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center bg-[#f8fafc] p-4">
        <Card className={cn("w-full max-w-md", exCardShell)}>
          <CardContent className="pt-6">
            <p className="text-slate-500">No speaker data found.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const renderContent = () => {
    switch (activeSection) {
      case "myprofile": return <MyProfile speakerId={speaker.id} />
      case "mysessions": return <MySessions speakerId={speaker.id} />
      case "overview": return <SpeakerOverview speakerId={speaker.id} />
      case "materials": return <PresentationMaterials speakerId={speaker.id} />
      case "message": return <MessagesCenter organizerId={speaker.id} surface="exhibitor" />
      case "connection": return <ConnectionsSection userId={speaker.id} surface="exhibitor" />
      case "help": return <SpeakerHelpSupport />
      case "settings": return <SpeakerSettings />
      default: return <MyProfile speakerId={speaker.id} />
    }
  }

  const navItem = (id: string, label: string, icon: React.ReactNode) => (
    <button
      key={id}
      type="button"
      onClick={() => { setActiveSection(id); setSidebarOpen(false) }}
      className={cn(
        "flex w-full items-center gap-3 py-2.5 pr-3 text-sm transition-colors",
        sidebarCollapsed ? "justify-center px-2" : "px-3",
        activeSection === id ? exNavActive : exNavInactive,
      )}
      title={sidebarCollapsed ? label : ""}
    >
      <span className="flex-shrink-0">{icon}</span>
      {!sidebarCollapsed && <span className="truncate">{label}</span>}
    </button>
  )

  return (
    /*
     * FIX: Changed from `flex min-h-screen` (row) to `flex flex-col min-h-screen`
     * so the topnav and the body-row stack vertically.
     */
    <div className="flex min-h-0 flex-1 w-full overflow-hidden bg-[#f8fafc]">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/*
       * BODY ROW — flex row that takes all remaining vertical space.
       * `items-stretch` makes BOTH the sidebar and the main column
       * grow to exactly the same height automatically.
       */}
      <div className="flex flex-1 items-stretch min-h-0 min-w-0 overflow-hidden">

        {/* ── SIDEBAR ── */}
        <div
          className={cn(
            "fixed inset-y-0 left-0 z-50 h-full shrink-0 transition-transform duration-300 ease-in-out md:static md:translate-x-0",
            sidebarOpen ? "translate-x-0" : "-translate-x-full",
          )}
        >
        <aside
          className={cn(
            "relative flex h-full w-[min(100vw,260px)] max-w-[85vw] flex-col overflow-hidden md:w-[260px]",
            exSidebarSurface,
            sidebarCollapsed && "md:w-[72px]",
          )}
        >
          {/* Logo / Brand */}
          <div
            className={cn(
              "flex items-center gap-3 border-b border-slate-200 px-4 py-4 flex-shrink-0",
              sidebarCollapsed && "justify-center",
            )}
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#004A96] shadow-sm">
              <Mic className="w-4 h-4 text-white" />
            </div>
            {!sidebarCollapsed && (
              <>
                <div>
                  <p className="text-sm font-bold text-slate-800 leading-tight tracking-tight">Speaker</p>
                  <p className="text-xs text-slate-400 font-medium">Dashboard</p>
                </div>
                <button
                  className="ml-auto md:hidden p-1.5 rounded-lg hover:bg-slate-100 transition"
                  onClick={() => setSidebarOpen(false)}
                >
                  <X className="w-4 h-4 text-slate-400" />
                </button>
              </>
            )}
          </div>

          {/* Collapse Toggle — desktop only */}
          <button
            onClick={toggleSidebar}
            className="absolute -right-3 top-20 hidden w-6 h-6 rounded-full bg-white shadow-md border border-slate-200 md:flex items-center justify-center hover:bg-slate-50 transition-all z-10"
            style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}
          >
            {sidebarCollapsed
              ? <PanelLeftOpen className="w-3.5 h-3.5 text-slate-600" />
              : <PanelLeftClose className="w-3.5 h-3.5 text-slate-600" />}
          </button>

          {/* Nav — overflow-y-auto so long lists scroll inside the sidebar */}
          <div className="flex-1 overflow-y-auto px-3 py-5 space-y-1">

            {/* Speaker Management group */}
            <div>
              {!sidebarCollapsed && (
                <button
                  onClick={() => toggleMenu("speaker-management")}
                  className={cn(
                    "mb-1 flex w-full items-center justify-between rounded-md px-2 py-1.5",
                    exNavGroupLabel,
                  )}
                >
                  <span className="flex items-center gap-2">
                    <User className="w-3 h-3" />
                    Speaker
                  </span>
                  {openMenus.includes("speaker-management")
                    ? <ChevronDown className="w-3 h-3" />
                    : <ChevronRight className="w-3 h-3" />}
                </button>
              )}

              {(openMenus.includes("speaker-management") || sidebarCollapsed) && (
                <div className={`mt-1 space-y-0.5 ${sidebarCollapsed ? "pl-0" : "pl-1"}`}>
                  {navItem("overview", "Overview", <BarChart3 className="w-4 h-4" />)}
                  {navItem("myprofile", "My Profile", <User className="w-4 h-4" />)}
                  {navItem("mysessions", "My Sessions", <CalendarDays className="w-4 h-4" />)}
                  {navItem("materials", "Presentations", <Presentation className="w-4 h-4" />)}
                </div>
              )}
            </div>

            {/* Communication group */}
            <div className="pt-2">
              {!sidebarCollapsed && (
                <button
                  onClick={() => toggleMenu("communication")}
                  className={cn(
                    "mb-1 flex w-full items-center justify-between rounded-md px-2 py-1.5",
                    exNavGroupLabel,
                  )}
                >
                  <span className="flex items-center gap-2">
                    <MessageSquare className="w-3 h-3" />
                    Communication
                  </span>
                  {openMenus.includes("communication")
                    ? <ChevronDown className="w-3 h-3" />
                    : <ChevronRight className="w-3 h-3" />}
                </button>
              )}

              {(openMenus.includes("communication") || sidebarCollapsed) && (
                <div className={`mt-1 space-y-0.5 ${sidebarCollapsed ? "pl-0" : "pl-1"}`}>
                  {navItem("message", "Messages", <MessageSquare className="w-4 h-4" />)}
                  {navItem("connection", "Connections", <User className="w-4 h-4" />)}
                </div>
              )}
            </div>

            {/* Standalone items */}
            <div className="mt-2 space-y-0.5 border-t border-slate-200 pt-4">
              {navItem("help", "Help & Support", <HelpCircle className="w-4 h-4" />)}
              {navItem("settings", "Settings", <Settings className="w-4 h-4" />)}
            </div>
          </div>

          {/* Speaker mini-card + logout */}
          {!sidebarCollapsed ? (
            <div className="shrink-0 space-y-3 border-t border-slate-200 px-3 pb-5 pt-4">
              <div className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2.5">
                <Avatar className="h-9 w-9 shrink-0 ring-2 ring-blue-100">
                  <AvatarImage src={speaker.avatar || ""} alt={speaker.firstName} />
                  <AvatarFallback className="bg-blue-50 text-xs font-bold text-[#004A96]">
                    {speaker.firstName?.[0]}{speaker.lastName?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-slate-900">
                    {speaker.firstName} {speaker.lastName}
                  </p>
                  <p className="truncate text-xs text-slate-500">{speaker.email}</p>
                </div>
              </div>
              <Button
                type="button"
                onClick={() => logout()}
                className={cn("h-10 w-full rounded-lg", exPrimaryBtn)}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Log out
              </Button>
            </div>
          ) : (
            <div className="px-2 pb-5 pt-4 flex-shrink-0">
              <button
                onClick={() => logout()}
                className="w-full flex items-center justify-center p-2.5 rounded-xl text-red-500 hover:bg-red-50 transition-all duration-200"
                title="Log out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </aside>
        </div>

        {/* ── MAIN CONTENT ── */}
        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">

          {/* Mobile top bar */}
          <div className="flex items-center justify-between gap-2 border-b border-slate-200 bg-white px-3 py-3 md:hidden">
            <Button
              variant="ghost"
              size="sm"
              className="shrink-0 text-[#004A96]"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </Button>
            <div className="min-w-0 flex-1 px-1 text-center">
              <p className="truncate text-xs text-slate-500">
                {speaker.firstName} {speaker.lastName}
              </p>
              <p className="truncate text-sm font-semibold text-[#004A96]">
                {sectionLabel[activeSection ?? "overview"] ?? "Dashboard"}
              </p>
            </div>
            <div className="w-9 shrink-0" />
          </div>

          <main className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden p-0">
            <DashboardManagedBanner page="speaker-dashboard" className="min-w-0 w-full" />
            <div className="w-full min-w-0 max-w-full px-3 py-4 sm:px-4 sm:py-5 md:px-6 md:py-6">
              <div className="mb-4 hidden items-center gap-3 sm:flex">
                <div className="flex items-center gap-2 rounded-xl border border-blue-100 bg-blue-50 px-4 py-2 text-xs font-bold text-[#004A96]">
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  {sectionLabel[activeSection ?? "overview"] ?? "Dashboard"}
                </div>
                <div className="hidden items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-[10px] font-semibold text-emerald-700 sm:flex">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
                  Active
                </div>
              </div>
              <div className="min-w-0 overflow-x-hidden">
                {renderContent()}
              </div>
            </div>
          </main>
        </div>

      </div>{/* end body-row */}
    </div>
  )
}