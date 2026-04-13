"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
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
import { getCurrentUserId } from "@/lib/api"
import AnalyticsDashboard from "./analytics"
// import Analytics from "./analytics"
// ...create/import other components as needed

interface EventLayoutProps {
  children?: React.ReactNode
  eventId: string
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

export default function EventSidebar({ eventId }: EventLayoutProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const tabParam = searchParams.get("tab")
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [expandedGroups, setExpandedGroups] = useState<string[]>(["main", "lead-management"])
  const [activeSection, setActiveSection] = useState("dashboard")
  const [params, setParams] = useState<{ id: string } | null>(null)
  const userId = getCurrentUserId()

  const [refreshKey, setRefreshKey] = useState(0)
  const [activeTab, setActiveTab] = useState("list")

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
    // Simulate async params resolution
    const resolveParams = async () => {
      const resolvedParams = await Promise.resolve({ id: eventId })
      setParams(resolvedParams)
    }
    resolveParams()
  }, [eventId])

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
    if (!params) {
      return <div>Loading...</div>
    }

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
    <div>

      <div className="flex min-h-screen w-full bg-background">
        {/* Mobile Overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside
          className={`
          fixed md:static
          w-64 min-h-screen bg-card border-r border-border z-50
          transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0
          flex flex-col
        `}
        >
          {/* Mobile Header inside sidebar */}
          <div className="flex items-center justify-between p-4 border-b border-border md:hidden">
            <h2 className="text-lg font-semibold">Event Menu</h2>
            <Button variant="ghost" size="sm" onClick={() => setSidebarOpen(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Sidebar Groups */}
          <div className="flex-1 overflow-y-auto p-4">
            {sidebarGroups.map((group) => (
              <div key={group.id} className="mb-4">
                {/* Group header */}
                <div
                  className="flex items-center justify-between cursor-pointer px-2 py-2 rounded hover:bg-muted"
                  onClick={() => toggleGroup(group.id)}
                >
                  <span className="font-medium">{group.label}</span>
                  {expandedGroups.includes(group.id) ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )}
                </div>

                {/* Items */}
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
    w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-colors
    border-l-4
    ${activeSection === item.id
                            ? "bg-primary/10 text-primary border-primary"
                            : "border-transparent hover:bg-muted"
                          }
  `}
                      >
                        <item.icon className="w-4 h-4 flex-shrink-0" />
                        <span>{item.title}</span>
                      </button>

                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="border-t border-border p-4 flex-shrink-0">
            <Button onClick={() => router.back()} variant="outline" className="w-full">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </div>
        </aside>

        {/* Content */}
        <div className="flex-1 flex flex-col min-h-screen">
          {/* Mobile Top Bar */}
          <div className="md:hidden flex items-center justify-between p-4 bg-card border-b">
            <Button variant="ghost" size="sm" onClick={() => setSidebarOpen(true)}>
              <Menu className="h-4 w-4" />
            </Button>
            <h1 className="text-lg font-semibold truncate">{getCurrentSectionTitle()}</h1>
            <div className="w-8" />
          </div>

          {/* Main Content */}
          <main className="flex-1 p-4 sm:p-6 overflow-auto">{renderContent()}</main>
        </div>
      </div>
    </div>
  )
}