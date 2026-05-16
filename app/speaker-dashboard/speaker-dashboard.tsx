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
      <div
        className="flex items-center justify-center min-h-screen"
        style={{ background: "linear-gradient(135deg, #f0f4ff 0%, #faf5ff 50%, #f0fdf4 100%)" }}
      >
        <div className="flex flex-col items-center gap-5">
          <div className="relative">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg"
              style={{ background: "linear-gradient(135deg, #2563eb, #7c3aed)" }}
            >
              <Mic className="w-7 h-7 text-white" />
            </div>
            <div
              className="absolute -inset-1 rounded-2xl opacity-30 animate-ping"
              style={{ background: "linear-gradient(135deg, #2563eb, #7c3aed)" }}
            />
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold text-slate-600 tracking-wide">Loading your dashboard</p>
            <p className="text-xs text-slate-400 mt-1">Setting everything up…</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div
        className="flex items-center justify-center min-h-screen"
        style={{ background: "linear-gradient(135deg, #f0f4ff 0%, #faf5ff 50%, #f0fdf4 100%)" }}
      >
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-10 shadow-xl max-w-md w-full border border-white/60">
          <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center mb-4">
            <X className="w-6 h-6 text-red-500" />
          </div>
          <p className="text-red-600 font-semibold mb-2">Something went wrong</p>
          <p className="text-slate-500 text-sm mb-6">{error}</p>
          <button
            onClick={fetchSpeakerData}
            className="w-full py-3 rounded-2xl text-white text-sm font-semibold transition-all hover:shadow-lg hover:-translate-y-0.5"
            style={{ background: "linear-gradient(135deg, #2563eb, #7c3aed)" }}
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  if (!speaker) {
    return (
      <div
        className="flex items-center justify-center min-h-screen"
        style={{ background: "linear-gradient(135deg, #f0f4ff 0%, #faf5ff 50%, #f0fdf4 100%)" }}
      >
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-10 shadow-xl border border-white/60">
          <p className="text-slate-500">No speaker data found.</p>
        </div>
      </div>
    )
  }

  const renderContent = () => {
    switch (activeSection) {
      case "myprofile": return <MyProfile speakerId={speaker.id} />
      case "mysessions": return <MySessions speakerId={speaker.id} />
      case "overview": return <SpeakerOverview speakerId={speaker.id} />
      case "materials": return <PresentationMaterials speakerId={speaker.id} />
      case "message": return <MessagesCenter organizerId={speaker.id} />
      case "connection": return <ConnectionsSection userId={speaker.id} />
      case "help": return <SpeakerHelpSupport />
      case "settings": return <SpeakerSettings />
      default: return <MyProfile speakerId={speaker.id} />
    }
  }

  const navItem = (id: string, label: string, icon: React.ReactNode) => (
    <button
      key={id}
      onClick={() => { setActiveSection(id); setSidebarOpen(false) }}
      className={`
        w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
        ${activeSection === id
          ? "text-white shadow-md"
          : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"}
        ${sidebarCollapsed ? "justify-center px-2" : ""}
      `}
      style={activeSection === id ? { background: "linear-gradient(135deg, #2563eb, #7c3aed)" } : {}}
      title={sidebarCollapsed ? label : ""}
    >
      <span className="flex-shrink-0">{icon}</span>
      {!sidebarCollapsed && <span>{label}</span>}
      {activeSection === id && !sidebarCollapsed && (
        <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white/70" />
      )}
    </button>
  )

  return (
    /*
     * FIX: Changed from `flex min-h-screen` (row) to `flex flex-col min-h-screen`
     * so the topnav and the body-row stack vertically.
     */
    <div
      className="flex flex-col min-h-screen w-full font-sans"
      style={{ background: "linear-gradient(135deg, #f0f4ff 0%, #faf8ff 50%, #f0fdf4 100%)" }}
    >
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
      <div className="flex flex-1 items-stretch min-h-0">

        {/* ── SIDEBAR ─────────────────────────────────────────────────────
         *  KEY FIXES:
         *  1. Removed `fixed` positioning — sidebar is now in normal flow.
         *  2. Removed `h-screen` — height is driven by the parent flex row.
         *  3. Added `self-stretch` so it always fills the full row height
         *     even when content is short.
         *  4. `overflow-y-auto` on the nav section handles long nav lists.
         * ──────────────────────────────────────────────────────────────── */}
        <aside
          className={`
            relative self-stretch z-50 flex flex-col
            transform transition-all duration-300 ease-in-out
            ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0
            ${sidebarCollapsed ? "w-[72px]" : "w-[260px]"}
          `}
          style={{
            background: "rgba(255,255,255,0.92)",
            backdropFilter: "blur(24px)",
            borderRight: "1px solid rgba(255,255,255,0.6)",
            boxShadow: "4px 0 24px rgba(99,102,241,0.06)",
          }}
        >
          {/* Logo / Brand */}
          <div
            className={`flex items-center gap-3 px-4 py-4 flex-shrink-0 ${sidebarCollapsed ? "justify-center" : ""}`}
            style={{ borderBottom: "1px solid rgba(148,163,184,0.12)" }}
          >
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0"
              style={{ background: "linear-gradient(135deg, #2563eb, #7c3aed)" }}
            >
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

          {/* Collapse Toggle */}
          <button
            onClick={toggleSidebar}
            className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-white shadow-md border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-all z-10"
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
                  className="w-full flex items-center justify-between px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-slate-600 transition rounded-lg hover:bg-slate-50"
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
                  className="w-full flex items-center justify-between px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-slate-600 transition rounded-lg hover:bg-slate-50"
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
            <div
              className="pt-4 space-y-0.5"
              style={{ borderTop: "1px solid rgba(148,163,184,0.12)", marginTop: "12px" }}
            >
              {navItem("help", "Help & Support", <HelpCircle className="w-4 h-4" />)}
              {navItem("settings", "Settings", <Settings className="w-4 h-4" />)}
            </div>
          </div>

          {/* Speaker mini-card + logout */}
          {!sidebarCollapsed ? (
            <div
              className="px-3 pb-5 pt-4 space-y-3 flex-shrink-0"
              style={{ borderTop: "1px solid rgba(148,163,184,0.12)" }}
            >
              <div
                className="flex items-center gap-3 p-3 rounded-2xl"
                style={{ background: "linear-gradient(135deg, #f0f4ff, #faf5ff)" }}
              >
                <Avatar className="w-9 h-9 ring-2 ring-white shadow-sm">
                  <AvatarImage src={speaker.avatar || ""} alt={speaker.firstName} />
                  <AvatarFallback
                    className="text-xs font-bold"
                    style={{ background: "linear-gradient(135deg, #dbeafe, #ede9fe)", color: "#2563eb" }}
                  >
                    {speaker.firstName?.[0]}{speaker.lastName?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-slate-800 truncate">
                    {speaker.firstName} {speaker.lastName}
                  </p>
                  <p className="text-[10px] text-slate-400 truncate font-medium">{speaker.email}</p>
                </div>
              </div>
              <button
                onClick={() => logout()}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-all duration-200"
              >
                <LogOut className="w-4 h-4" />
                Log out
              </button>
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

        {/* ── MAIN CONTENT ────────────────────────────────────────────────
         *  `flex-1` makes it take all remaining horizontal space.
         *  `flex flex-col` stacks the inner content vertically.
         *  `min-w-0` prevents flex blowout on narrow viewports.
         *  `overflow-auto` lets the content scroll when needed.
         * ──────────────────────────────────────────────────────────────── */}
        <div className="flex-1 flex flex-col min-w-0 overflow-auto">

          {/* Mobile top bar */}
          <div className="md:hidden flex items-center gap-3 px-4 py-3 bg-white/80 backdrop-blur-sm border-b border-slate-200/60">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-xl hover:bg-slate-100 transition"
            >
              <Menu className="w-5 h-5 text-slate-600" />
            </button>
            <span className="text-sm font-bold text-slate-800">Speaker Dashboard</span>
          </div>

          <main className="flex-1 p-6">
            <div className="max-w-7xl mx-auto space-y-5">
              <DashboardManagedBanner page="speaker-dashboard" />

              {/* Header breadcrumb row */}
              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center gap-3">
                  <div
                    className="flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold"
                    style={{
                      background: "linear-gradient(135deg, #dbeafe, #ede9fe)",
                      color: "#2563eb",
                      border: "1px solid rgba(99,102,241,0.15)",
                    }}
                  >
                    <LayoutDashboard className="w-3.5 h-3.5" />
                    {sectionLabel[activeSection ?? "overview"] ?? "Dashboard"}
                  </div>
                  <div
                    className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-semibold text-emerald-700"
                    style={{
                      background: "rgba(209,250,229,0.6)",
                      border: "1px solid rgba(167,243,208,0.6)",
                    }}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Active
                  </div>
                </div>
              </div>

              {/*
               * CONTENT CARD
               * `min-h-[calc(100vh-220px)]` ensures the card is always tall
               * enough to visually match the sidebar on short-content pages.
               */}
              <div
                className="rounded-3xl min-h-[calc(100vh-220px)] p-6 md:p-8"
                style={{
                  background: "rgba(255,255,255,0.80)",
                  backdropFilter: "blur(20px)",
                  border: "1px solid rgba(255,255,255,0.8)",
                  boxShadow: "0 4px 32px rgba(99,102,241,0.06), 0 1px 4px rgba(0,0,0,0.04)",
                }}
              >
                {renderContent()}
              </div>
            </div>
          </main>
        </div>

      </div>{/* end body-row */}
    </div>
  )
}