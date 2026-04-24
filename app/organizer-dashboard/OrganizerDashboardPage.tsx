"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
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
  Star
} from "lucide-react"
import { clearTokens } from "@/lib/api"
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
import { apiFetch } from "@/lib/api"
import { DashboardManagedBanner } from "@/components/dashboard-managed-banner"

interface OrganizerDashboardPageProps {
  organizerId: string
}

interface OrganizerData {
  id: string
  name: string
  displayName?: string
  firstName: string
  lastName: string
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
  headquarters: string
  specialties: string[]
  achievements: string[]
  certifications: string[]
}

interface Event {
  id: number
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
  const params = useParams()
  const router = useRouter()
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
        const data = await apiFetch<{ organizer: OrganizerData }>(`/api/organizers/${organizerId}`, {
          auth: true,
        })

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
          `/api/organizers/${organizerId}/events`,
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
          <Loader2 className="w-8 h-8 animate-spin" />
          <span className="ml-2">Loading...</span>
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
            organizerId={organizerId}
            onCreateEventClick={() => setActiveSection("create-event")}
            onManageAttendeesClick={() => {
              window.location.href = `/organizers/${organizerId}/total-attendees`
            }}
            onViewAnalyticsClick={() => {
              window.location.href = `/event-dashboard/${organizerId}?section=analytics`
            }}
            onSendMessageClick={() => {
              window.location.href = `/event-dashboard/${organizerId}?section=messages`
            }}
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
        return <MyAppointments userId={organizerId} />
      case "events":
        return <MyEvents organizerId={organizerId} />
      case "create-event":
        return <CreateEvent organizerId={organizerId} />
      case "settings":
        return <OrganizerSettings/>
      case "help-support":
        return <OrganizerHelpSupport />
      case "connect":
        return <ConnectionsSection userId={organizerData.id} />
      case "messages":
        return <MessagesCenter organizerId={organizerId} />
      case "feed-back":
        return <FeedbackSection organizerId={organizerId} />
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
    <div className="flex min-h-screen w-full bg-gray-50">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <div
        className={`
          fixed md:relative
          w-64 min-h-screen bg-white border-r border-gray-200 z-50
          transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0
          flex flex-col
        `}
      >
        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">Menu</h2>
          <Button variant="ghost" size="sm" onClick={() => setSidebarOpen(false)}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {/* Sidebar Groups */}
          {sidebarGroups.map((group) => (
            <div key={group.id} className="mb-6">
              <div
                className="flex items-center justify-between cursor-pointer hover:bg-gray-100 px-2 py-2 rounded text-sm font-medium text-gray-700"
                onClick={() => toggleGroup(group.id)}
              >
                <span>{group.label}</span>
                {expandedGroups.includes(group.id) ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </div>
              {expandedGroups.includes(group.id) && (
                <div className="mt-2 space-y-1">
                  {group.items.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveSection(item.id)
                        setSidebarOpen(false)
                      }}
                      className={`
                        w-full flex items-center gap-3 px-3 py-2 text-sm rounded-sm transition-colors
                        ${
                          activeSection === item.id
                            ? "bg-blue-50 text-blue-700 border-l-4 border-blue-700"
                            : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                        }
                      `}
                    >
                      <item.icon className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate">{item.title}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}

          {/* Individual Sidebar Items */}
          <div className="mt-8 space-y-1">
            {individualSidebarItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveSection(item.id)
                  setSidebarOpen(false)
                }}
                className={`
                  w-full flex items-center gap-3 px-3 py-2 text-sm rounded-sm transition-colors
                  ${
                    activeSection === item.id
                      ? "bg-blue-50 text-blue-700 border-l-4 border-blue-700"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  }
                `}
              >
                <item.icon className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">{item.title}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Footer with Logout */}
        <div className="border-t border-gray-200 p-4 flex-shrink-0">
          <Button
            onClick={() => { clearTokens(); router.push("/login"); }}
            className="w-full bg-red-600 hover:bg-red-700 text-white"
          >
            <User className="mr-2 h-4 w-4" />
            <span>Logout</span>
          </Button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Mobile Top Bar */}
        <div className="md:hidden flex items-center justify-between p-4 bg-white border-b border-gray-200 shadow-sm">
          <Button variant="ghost" size="sm" onClick={() => setSidebarOpen(true)}>
            <Menu className="h-5 w-5" />
          </Button>
          <div className="w-9" />
        </div>

        {/* Main Content */}
        <main className="flex-1 p-6 overflow-auto">
          <DashboardManagedBanner page="organizer-dashboard" />
          <div className="max-w-7xl mx-auto">
            {/* Dynamic Content */}
            <div className="">
              {renderContent()}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}