"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import {
  LayoutDashboard,
  Calendar,
  Plus,
  Settings,
  User,
  Loader2,
  ChevronDown,
  ChevronRight,
  Menu,
  X,
  HelpCircle,
  MessageSquare,
  Users,
  Star,
  Crown,
  LogOut,
  ChevronLeft,
} from "lucide-react"
import { clearTokens, markLogoutSuccessBanner } from "@/lib/api"
import DashboardOverview from "./dashboard-overview"
import MyEvents from "./my-events"
import CreateEvent from "./create-event"
import { OrganizerSettings } from "./settings-panel"
import OrganizerInfo from "./organizer-info"
import { HelpSupport } from "@/components/HelpSupport"
import MessagesCenter from "./messages-center"
import { ConnectionsSection } from "../dashboard/connections-section"
import { MyAppointments } from "./my-appointments"
import { useDashboard } from "@/contexts/dashboard-context"
import { FeedbackSection } from "./FeedbackSection"
import { OrganizerHelpSupport } from "./help-support"
import { apiFetch, getCurrentUserId } from "@/lib/api"
import { getOrganizerDashboardPath } from "@/lib/profile-path"
import { DashboardPricingPlansView } from "@/components/dashboard-packages"
import { cn } from "@/lib/utils"
import {
  orgNavActive,
  orgNavInactive,
  orgNavGroupLabel,
  orgPageBg,
  orgPrimaryBtn,
  orgSidebarSurface,
  orgUpgradeCard,
} from "./organizer-dashboard-theme"

interface OrganizerDashboardPageProps {
  /** UUID or public company slug from `/organizer-dashboard/[id]`. */
  organizerId: string
}

interface OrganizerData {
  id: string
  name: string
  displayName?: string
  publicSlug?: string | null
  firstName: string
  lastName: string
  organizationName?: string
  email: string
  phone: string
  location: string
  website: string
  description: string
  avatar: string
  totalEvents: number
  activeEvents: number
  totalAttendees: number
  totalRevenue: number
  founded: string
  company: string
  teamSize: string
  headquarters?: string
  organizerCountry: string
  organizerState: string
  organizerCity: string
  specialties: string[]
  achievements: string[]
  certifications: string[]
}

interface Event {
  id: string | number
  title: string
  description: string
  date: string
  startDate: string
  endDate: string
  location: string
  status: string
  attendees: number
  registrations: number
  revenue: number
  type: string
  maxAttendees?: number
  isVirtual: boolean
  bannerImage?: string
  thumbnailImage?: string
  isPublic: boolean
  slug?: string
  images?: string[]
  currency?: string
  city?: string
  state?: string
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

export default function OrganizerDashboardSimplified({ organizerId }: OrganizerDashboardPageProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { toast } = useToast()
  const { activeSection, setActiveSection } = useDashboard()
  const [expandedGroups, setExpandedGroups] = useState<string[]>(["main", "event-management", "network"])
  const [organizerData, setOrganizerData] = useState<OrganizerData | null>(null)
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    const fetchOrganizerData = async () => {
      try {
        setLoading(true)
        const data = await apiFetch<{ organizer: OrganizerData }>(
          `/api/organizers/${encodeURIComponent(organizerId)}`,
          {
            auth: true,
          },
        )

        setOrganizerData(data.organizer)

        // 👇 If the organizer has no events, default to Create Event
        if (data.organizer?.totalEvents === 0) {
          setActiveSection("create-event")
        } else {
          setActiveSection("dashboard")
        }
      } catch (error) {
        console.error("Error fetching organizer data:", error)
        setError("Failed to load organizer data")
        toast({
          title: "Error",
          description: "Failed to load organizer data",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    if (organizerId) {
      fetchOrganizerData()
    }
  }, [organizerId, toast, setActiveSection])

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const data = await apiFetch<{ success?: boolean; events: Event[] }>(
          `/api/organizers/${encodeURIComponent(organizerId)}/events`,
          { auth: true }
        )
        setEvents(data.events ?? [])
      } catch (error) {
        console.error("Error fetching events:", error)
      }
    }

    if (organizerId) {
      fetchEvents()
    }
  }, [organizerId])

  useEffect(() => {
    if (!organizerData?.id) return
    const sessionUser = getCurrentUserId()
    if (sessionUser && sessionUser !== organizerData.id) {
      toast({
        title: "Access denied",
        description: "You can only open your own organizer dashboard.",
        variant: "destructive",
      })
      router.replace("/login")
    }
  }, [organizerData?.id, router, toast])

  useEffect(() => {
    if (!organizerData?.id) return
    const canonical = getOrganizerDashboardPath(organizerData.id, {
      publicSlug: organizerData.publicSlug,
      organizationName: organizerData.organizationName,
      company: organizerData.company,
      firstName: organizerData.firstName,
      lastName: organizerData.lastName,
    })
    if (pathname && canonical !== pathname) {
      router.replace(canonical)
    }
  }, [
    organizerData?.id,
    organizerData?.publicSlug,
    organizerData?.organizationName,
    organizerData?.company,
    organizerData?.firstName,
    organizerData?.lastName,
    pathname,
    router,
  ])

  const toggleGroup = (groupId: string) => {
    setExpandedGroups((prev) => (prev.includes(groupId) ? prev.filter((id) => id !== groupId) : [...prev, groupId]))
  }

  const sidebarGroups: SidebarGroup[] = [
    {
      id: "main",
      label: "Main",
      items: [
        {
          title: "Dashboard",
          icon: LayoutDashboard,
          id: "dashboard",
        },
        {
          title: "My Info",
          icon: User,
          id: "info",
        },
      ],
    },
    {
      id: "event-management",
      label: "Event Management",
      items: [
        {
          title: "My Events",
          icon: Calendar,
          id: "events",
        },
        {
          title: "Create Event",
          icon: Plus,
          id: "create-event",
        },
      ],
    },
    {
      id: "network",
      label: "Network",
      items: [
        {
          title: "Connect",
          icon: Users,
          id: "connect",
        },
        {
          title: "Messages",
          icon: MessageSquare,
          id: "messages",
        },
        {
          title: "Venue Booking",
          icon: Calendar,
          id: "venue-booking",
        },
      ],
    },
    {
      id: "feedback",
      label: "Feedback",
      items: [
        {
          title: "Reviews & Feedback",
          icon: Star,
          id: "feed-back",
        }
      ]
    }
  ]

  const individualSidebarItems: SidebarItem[] = [
    {
      title: "Pricing & plans",
      icon: Crown,
      id: "subscription-plans",
    },
    {
      title: "Help & Support",
      icon: HelpCircle,
      id: "help-support",
    },
    {
      title: "Settings",
      icon: Settings,
      id: "settings",
    },
  ]

  const dashboardStats = organizerData
    ? [
        {
          title: "Total Events",
          value: organizerData.totalEvents.toString(),
          change: "+12%",
          trend: "up" as const,
          icon: Calendar,
        },
        {
          title: "Active Events",
          value: organizerData.activeEvents.toString(),
          change: "+3",
          trend: "up" as const,
          icon: Calendar,
        },
        {
          title: "Total Attendees",
          value: organizerData.totalAttendees >= 1000
            ? `${(organizerData.totalAttendees / 1000).toFixed(1)}K`
            : organizerData.totalAttendees.toString(),
          change: "+18%",
          trend: "up" as const,
          icon: User,
        },
        {
          title: "Revenue",
          value: `₹${(organizerData.totalRevenue / 100000).toFixed(1)}L`,
          change: "+25%",
          trend: "up" as const,
          icon: User,
        },
      ]
    : []

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-[#004A96]" />
          <span className="ml-2 text-gray-600">Loading...</span>
        </div>
      )
    }

    if (error || !organizerData) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error || "Failed to load data"}</p>
            <Button onClick={() => window.location.reload()}>Retry</Button>
          </div>
        </div>
      )
    }

    switch (activeSection) {
      case "dashboard":
        return (
          <DashboardOverview
            organizerName={organizerData.displayName ?? organizerData.name}
            dashboardStats={dashboardStats}
            recentEvents={events}
            organizerId={organizerData.id}
            onCreateEventClick={() => setActiveSection("create-event")}
            onViewAllEventsClick={() => setActiveSection("events")}
            onManageAttendeesClick={() => {
              window.location.href = `/organizers/${organizerData.id}/total-attendees`
            }}
            onViewAnalyticsClick={() => {
              const ev = events?.[0]
              if (!ev) return
              const ref = ev.slug || ev.id
              window.location.href = `/event-dashboard/${ref}?section=analytics`
            }}
            onSendMessageClick={() => setActiveSection("messages")}
            onVenueBookingClick={() => setActiveSection("venue-booking")}
            onProfileClick={() => setActiveSection("info")}
            onUpgradeClick={() => setActiveSection("subscription-plans")}
          />
        )
      case "info":
        return (
          <OrganizerInfo
            organizerData={organizerData}
            onOrganizerUpdated={(updated) =>
  setOrganizerData((prev) => (prev ? { ...prev, ...updated } : prev))
}
          />
        )
      case "venue-booking":
        return <MyAppointments userId={organizerData.id} />
      case "events":
        return <MyEvents organizerId={organizerData.id} />
      case "create-event":
        return <CreateEvent organizerId={organizerData.id} />
      case "settings":
        return <OrganizerSettings/>
      case "help-support":
        return <OrganizerHelpSupport />
      case "connect":
        return <ConnectionsSection userId={organizerData.id} />
      case "messages":
        return <MessagesCenter organizerId={organizerData.id} />
      case "feed-back":
        return <FeedbackSection organizerId={organizerData.id} />
      case "subscription-plans":
        return <DashboardPricingPlansView role="ORGANIZER" />
      default:
        return <div>Select a section from the sidebar</div>
    }
  }

  // const getCurrentSectionTitle = () => {
  //   for (const group of sidebarGroups) {
  //     const item = group.items.find((item) => item.id === activeSection)
  //     if (item) return item.title
  //   }
  //   const individualItem = individualSidebarItems.find((item) => item.id === activeSection)
  //   if (individualItem) return individualItem.title

  //   return "Dashboard"
  // }

  return (
    <div className={cn("relative flex min-h-0 flex-1 w-full overflow-hidden", orgPageBg)}>
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "fixed z-50 flex h-full w-[260px] shrink-0 flex-col transform transition-transform duration-300 ease-in-out md:static md:translate-x-0",
          orgSidebarSurface,
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        {/* Mobile Header */}
        <div className="flex items-center justify-between border-b border-slate-200 p-4 md:hidden">
          <h2 className="text-lg font-semibold text-slate-900">Menu</h2>
          <Button variant="ghost" size="sm" onClick={() => setSidebarOpen(false)} className="text-gray-600">
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="scrollbar-hover flex-1 overflow-y-auto px-3 py-4">
          {/* Sidebar Groups */}
          {sidebarGroups.map((group) => (
            <div key={group.id} className="mb-5">
              <div
                className={cn("mb-1 flex cursor-pointer items-center justify-between px-2 py-1.5", orgNavGroupLabel)}
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
                <span className="normal-case tracking-normal text-[11px] font-semibold uppercase text-slate-400">{group.label}</span>
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

          {/* Individual Sidebar Items */}
          <div className="mt-4 space-y-0.5 border-t border-slate-200 pt-4">
            {individualSidebarItems.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setActiveSection(item.id)
                  setSidebarOpen(false)
                }}
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
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 space-y-3 border-t border-slate-200 p-4">
          <div className={orgUpgradeCard}>
            <div className="flex items-start gap-2">
              <Crown className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
              <div>
                <p className="text-sm font-bold text-[#004A96]">Upgrade to Pro</p>
                <p className="mt-0.5 text-xs text-slate-600">Unlock advanced features and visibility.</p>
              </div>
            </div>
            <Button
              type="button"
              size="sm"
              className={cn("mt-3 h-9 w-full rounded-lg", orgPrimaryBtn)}
              onClick={() => setActiveSection("subscription-plans")}
            >
              Upgrade Now
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
          <Button
            onClick={() => {
              markLogoutSuccessBanner()
              clearTokens()
              router.push("/login")
            }}
            className={cn("h-10 w-full rounded-lg", orgPrimaryBtn)}
          >
            <LogOut className="mr-2 h-4 w-4" />
            <span>Logout</span>
          </Button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <div className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 md:hidden">
          <Button variant="ghost" size="sm" onClick={() => setSidebarOpen(true)} className="text-[#004A96]">
            <Menu className="h-5 w-5" />
          </Button>
          <span className="text-sm font-semibold text-[#004A96]">Organizer</span>
          <div className="w-9" />
        </div>

        <main className="min-h-0 flex-1 overflow-auto p-0">
          <div className="min-h-0 w-full px-6 py-6">{renderContent()}</div>
        </main>
      </div>
    </div>
  )
}
