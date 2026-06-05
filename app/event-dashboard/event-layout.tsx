"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  LayoutDashboard,   // Dashboard
  Users,             // Attendees
  IdCard,            // Visitor Badge Settings
  Briefcase,         // Exhibitors
  Megaphone,         // Promotions
  Tag,               // Active Promotions
  BarChart3,         // Analytics
  MessageSquare,     // Feedback
  Users2,            // Total Exhibitors
  UserPlus,          // Add Exhibitor
  FileText,          // Exhibitor Manual
  X,                 // Close button (mobile sidebar)
  ChevronDown,       // Expand group
  ChevronRight,      // Collapse group
  ArrowLeft,         // Back to Events
  Menu,              // Mobile menu button
  CalendarDays, FilePlus2, Presentation, UserRoundPlus
} from "lucide-react"


import EventPage from "./info"
import AttendeesManagement from "./AttendeesManagement"
import ExhibitorManagement from "./ExhibitorsManagement"
import VisitorBadgeSettings from "./Visitor-Badge-Settings"
import EventPromotion from "./promotions"
import ActivePromotions from "./active-promotions"
import FeedbackReplyManagement from "./FeedbackReplyManagement"
import ExhibitorsManagement from "./TotalExhibitores"
import AddExhibitor from "./AddExhibitor"
import ExhibitorsForEvent from "./ExhibitorsForEvent"
import ExhibitorManual from "../organizer-dashboard/exhibitor-manual/exhibitor-manual"
import AddSpeaker from "./AddSpeaker"
import SpeakerSessionsTable from "./SpeakerSessionsTable"
import { CreateConferenceAgenda } from "./CreateConferenceAgenda"
import { ConferenceList } from "./ConferenceAgenda"
import { getCurrentUserId, apiFetch } from "@/lib/api"
import { isEventIdUuid } from "@/lib/event-ref"
import AnalyticsDashboard from "./analytics"
import { cn } from "@/lib/utils"
import {
  eventNavActive,
  eventNavGroupLabel,
  eventNavInactive,
  eventPageBg,
  eventSidebarSurface,
} from "./event-dashboard-theme"

interface EventLayoutProps {
  children?: React.ReactNode
  /** Segment from the URL (slug or UUID). Used to resolve the event when the server cannot (no auth on RSC). */
  dashboardRef: string
  /** When the server could fetch the event (e.g. public listing), the real event UUID. */
  eventId?: string | null
  /** From server when available; client may refresh if missing. */
  initialEventTitle?: string | null
}

interface SidebarGroup {
  id: string
  label: string
  items: SidebarItem[]
}

interface SidebarItem {
  title: string
  icon: React.ComponentType<any>
  id: string
}

export default function EventSidebar({
  dashboardRef,
  eventId: serverEventId = null,
  initialEventTitle = null,
}: EventLayoutProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const tabParam = searchParams.get("tab")
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [expandedGroups, setExpandedGroups] = useState<string[]>(["main", "lead-management"])
  const [activeSection, setActiveSection] = useState("dashboard")
  const [params, setParams] = useState<{ id: string } | null>(null)
  const userId = getCurrentUserId()
  const [displayEventTitle, setDisplayEventTitle] = useState(() => initialEventTitle?.trim() || "")
  const [resolvedEventId, setResolvedEventId] = useState<string | null>(() => serverEventId ?? null)
  const [resolveError, setResolveError] = useState<string | null>(null)
  const [resolving, setResolving] = useState(() => !serverEventId)

  const [refreshKey, setRefreshKey] = useState(0)
  const [activeTab, setActiveTab] = useState("list")

  useEffect(() => {
    setDisplayEventTitle(initialEventTitle?.trim() || "")
  }, [initialEventTitle, serverEventId])

  useEffect(() => {
    setResolvedEventId(serverEventId ?? null)
    setResolveError(null)
    setResolving(!(serverEventId ?? null))
  }, [dashboardRef, serverEventId])

  useEffect(() => {
    if (resolvedEventId) return
    let cancelled = false
    ;(async () => {
      try {
        setResolving(true)
        const data = await apiFetch<{ id: string; title?: string; slug?: string | null }>(
          `/api/events/${encodeURIComponent(dashboardRef.trim())}`,
          { auth: true },
        )
        if (cancelled) return
        setResolvedEventId(data.id)
        const t = typeof data.title === "string" ? data.title.trim() : ""
        if (t) setDisplayEventTitle(t)
        const refTrim = dashboardRef.trim()
        if (isEventIdUuid(refTrim) && data.slug?.trim()) {
          router.replace(`/event-dashboard/${encodeURIComponent(data.slug.trim())}`)
        }
      } catch (e: unknown) {
        if (!cancelled) {
          const status = typeof e === "object" && e !== null && "status" in e ? (e as { status?: number }).status : undefined
          setResolveError(status === 404 ? "Event not found" : "Could not load this event")
        }
      } finally {
        if (!cancelled) setResolving(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [resolvedEventId, dashboardRef, router])

  useEffect(() => {
    if (displayEventTitle) return
    if (!resolvedEventId) return
    let cancelled = false
    ;(async () => {
      try {
        const data = await apiFetch<{ title?: string }>(`/api/events/${resolvedEventId}`, { auth: true })
        const t = typeof data?.title === "string" ? data.title.trim() : ""
        if (!cancelled && t) setDisplayEventTitle(t)
      } catch {
        // keep empty; organizer may lack token on edge cases
      }
    })()
    return () => {
      cancelled = true
    }
  }, [resolvedEventId, displayEventTitle])

  useEffect(() => {
    if (!displayEventTitle) return
    document.title = `${displayEventTitle} · Event dashboard`
  }, [displayEventTitle])

  const handleSuccess = () => {
    setActiveTab("list")
    setRefreshKey((prev) => prev + 1)
  }

  useEffect(() => {
    if (tabParam === "space-cost") {
      setActiveSection("dashboard")
    }
  }, [tabParam])

  useEffect(() => {
    if (!resolvedEventId) {
      setParams(null)
      return
    }
    setParams({ id: resolvedEventId })
  }, [resolvedEventId])

  const toggleGroup = (groupId: string) => {
    setExpandedGroups((prev) =>
      prev.includes(groupId) ? prev.filter((id) => id !== groupId) : [...prev, groupId]
    )
  }

  const sidebarGroups: SidebarGroup[] = [
    {
      id: "main",
      label: "Main",
      items: [{ title: "Event Info", icon: LayoutDashboard, id: "dashboard" }],
    },
    {
      id: "lead-management",
      label: "Lead Management",
      items: [
        { title: "Attendees", icon: Users, id: "attendees" },
        // { title: "Visitor Badge Settings", icon: IdCard, id: "badge-settings" },
        { title: "Exhibitors", icon: Briefcase, id: "exhibitors" },
      ],
    },
    {
      id: "marketing",
      label: "Marketing Campaigns",
      items: [
        { title: "Promotions", icon: Megaphone, id: "promotions" },
        { title: "Active Promotions", icon: Tag, id: "active-promotions" },
      ],
    },
    // {
    //   id: "analytics",
    //   label: "Analytics",
    //   items: [{ title: "Analytics", icon: BarChart3, id: "analytics" }],
    // },
    {
      id: "feedback",
      label: "Feedback",
      items: [{ title: "Feedback", icon: MessageSquare, id: "feedback" }],
    },
    {
      id: "exhibitor",
      label: "Exhibitor",
      items: [
        { title: "Total Exhibitor", icon: Users2, id: "total-exhibitores" },
        { title: "Add Exhibitor", icon: UserPlus, id: "add-exhibitores" },
        { title: "Exhibitor Manual", icon: FileText, id: "exhibitor-manual" },
      ],
    },
    {
      id: "speaker",
      label: "Speaker Management",
      items: [
        { title: "Conference Agenda", icon: CalendarDays, id: "conference-agenda" },
        { title: "Create Conference Agenda", icon: FilePlus2, id: "create-conference-agenda" },
        { title: "Speakers", icon: Presentation, id: "speakers" },
        { title: "Add Speakers", icon: UserRoundPlus, id: "add-speaker" },
      ],
    }

  ]


  const renderContent = () => {
    if (resolveError) {
      return (
        <div className="p-8 text-center max-w-md mx-auto">
          <p className="text-destructive font-medium">{resolveError}</p>
          <p className="text-sm text-muted-foreground mt-2">
            If you are the organizer, sign in and open this dashboard from My Events.
          </p>
        </div>
      )
    }
    if (resolving || !resolvedEventId || !params) {
      return (
        <div className="flex items-center justify-center h-64 text-muted-foreground">
          Loading event…
        </div>
      )
    }

    const eventId = resolvedEventId

    switch (activeSection) {
      case "dashboard":
        return <EventPage params={params} />  // <-- remove Promise.resolve
      case "promotions":
        return <EventPromotion eventId={eventId} />
      case "active-promotions":
        return <ActivePromotions eventId={eventId} />
      case "attendees":
        return <AttendeesManagement eventId={eventId} />
      case "exhibitors":
        return <ExhibitorManagement eventId={eventId} />
      case "feedback":
        return <FeedbackReplyManagement eventId={eventId} />
      case "badge-settings":
        return <VisitorBadgeSettings />
      case "total-exhibitores":
        return <ExhibitorsForEvent eventId={eventId} />
      case "add-exhibitores":
        return <AddExhibitor eventId={eventId} />
      case "exhibitor-manual":
        return <ExhibitorManual userId={userId ?? ""} eventId={eventId} />
      case "analytics":
        return <AnalyticsDashboard exhibitorId={eventId} />
      case "add-speaker":
        return <AddSpeaker eventId={eventId} />
      case "speakers":
        return <SpeakerSessionsTable eventId={eventId} />
      case "create-conference-agenda":
        return <CreateConferenceAgenda eventId={eventId} />
      case "conference-agenda":
        return <ConferenceList eventId={eventId} refreshKey={refreshKey} onCreateNew={() => setActiveTab("create")} />
      default:
        return <div className="p-4">Select a section</div>
    }
  }

  const getCurrentSectionTitle = () => {
    for (const group of sidebarGroups) {
      const item = group.items.find((i) => i.id === activeSection)
      if (item) return item.title
    }
    return "Event Dashboard"
  }

  return (
    <div className={cn("relative flex min-h-0 flex-1 w-full overflow-hidden", eventPageBg)}>
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden
        />
      )}

      <aside
        className={cn(
          "fixed z-50 flex h-full w-[260px] shrink-0 flex-col transition-transform duration-300 ease-in-out md:static md:translate-x-0",
          eventSidebarSurface,
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex items-center justify-between border-b border-slate-200 p-4 md:hidden">
          <h2 className="text-lg font-semibold text-slate-900">Menu</h2>
          <Button variant="ghost" size="sm" onClick={() => setSidebarOpen(false)} className="text-slate-600">
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="scrollbar-hover flex-1 overflow-y-auto px-3 py-4">
          {sidebarGroups.map((group) => (
            <div key={group.id} className="mb-5">
              <div
                className={cn("mb-1 flex cursor-pointer items-center justify-between px-2 py-1.5", eventNavGroupLabel)}
                onClick={() => toggleGroup(group.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault()
                    toggleGroup(group.id)
                  }
                }}
                role="button"
                tabIndex={0}
              >
                <span>{group.label}</span>
                {expandedGroups.includes(group.id) ? (
                  <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
                ) : (
                  <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
                )}
              </div>
              {expandedGroups.includes(group.id) && (
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
                        "flex w-full items-center gap-3 py-2.5 pr-3 text-left text-sm transition-colors",
                        activeSection === item.id ? eventNavActive : eventNavInactive,
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
        </div>

        <div className="shrink-0 border-t border-slate-200 p-4">
          <Button
            type="button"
            onClick={() => router.back()}
            variant="outline"
            className="h-10 w-full rounded-lg border-slate-200 text-slate-700 hover:border-[#004A96]/30 hover:bg-blue-50 hover:text-[#004A96]"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </div>
      </aside>

      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <div className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 md:hidden">
          <Button variant="ghost" size="sm" onClick={() => setSidebarOpen(true)} className="text-[#004A96]">
            <Menu className="h-5 w-5" />
          </Button>
          <div className="min-w-0 flex-1 px-2 text-center">
            {displayEventTitle ? (
              <p className="truncate text-xs text-slate-500">{displayEventTitle}</p>
            ) : null}
            <p className="truncate text-sm font-semibold text-[#004A96]">{getCurrentSectionTitle()}</p>
          </div>
          <div className="w-9" />
        </div>

        <div className="hidden border-b border-slate-200 bg-white px-6 py-5 md:block">
          <h1 className="truncate text-2xl font-bold tracking-tight text-slate-900">
            {displayEventTitle || "Event dashboard"}
          </h1>
          <p className="mt-1 text-sm text-slate-600">{getCurrentSectionTitle()}</p>
        </div>

        <main className="min-h-0 flex-1 overflow-auto p-0">
          <div className="min-h-0 w-full px-6 py-6">{renderContent()}</div>
        </main>
      </div>
    </div>
  )
}