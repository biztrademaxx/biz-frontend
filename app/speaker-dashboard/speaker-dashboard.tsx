"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/use-auth"
import { useRouter } from "next/navigation"
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
  X
} from "lucide-react"

import MyProfile from "./my-profile"
import MySessions from "./my-sessions"
import { PresentationMaterials } from "./presentation-materials"
import MessagesCenter from "@/app/organizer-dashboard/messages-center"
import { SpeakerSettings } from "./speaker-settings"
import { HelpSupport } from "@/components/HelpSupport"
import { useDashboard } from "@/contexts/dashboard-context"
import { SpeakerHelpSupport } from "./help-support"
import { apiFetch } from "@/lib/api"

interface SpeakerData {
  id: string
  firstName: string
  lastName: string
  displayName?: string
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
  userId: string
}

export function SpeakerDashboard({ userId }: UserDashboardProps) {
  const [speaker, setSpeaker] = useState<SpeakerData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { activeSection, setActiveSection } = useDashboard()
  const [openMenus, setOpenMenus] = useState<string[]>(["speaker-management", "communication"])
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const { userId: authUserId, role, loading: authLoading, logout } = useAuth({
    requireAuth: true,
    allowedRoles: ["SPEAKER"],
  })
  const router = useRouter()
  const { toast } = useToast()

  // ✅ Set MyProfile as default section when dashboard loads
  useEffect(() => {
    if (!activeSection) {
      setActiveSection("myprofile")
    }
  }, [activeSection, setActiveSection])

  useEffect(() => {
    if (authLoading) return
    const roleUpper = (role || "").toUpperCase()
    if (roleUpper !== "SPEAKER") return
    fetchSpeakerData()
  }, [userId, role, authLoading, router, toast])

  const fetchSpeakerData = async () => {
    try {
      setLoading(true)
      setError(null)

      const data = await apiFetch<{ user?: SpeakerData }>(`/api/users/${userId}`, {
        method: "GET",
        auth: true,
      })

      const u = data.user
      if (!u) {
        throw new Error("Speaker not found")
      }
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

  // Helper function for menu styling
  const menuItemClass = (sectionId: string) => {
    return `cursor-pointer pl-3 py-2 text-sm rounded-md transition-colors w-full text-left ${
      activeSection === sectionId 
        ? "bg-blue-50 text-blue-700 border-l-4 border-blue-700 font-medium" 
        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 border-l-4 border-transparent"
    }`
  }

  // ✅ Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  // ✅ Error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={fetchSpeakerData} className="w-full">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // ✅ No speaker data
  if (!speaker) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>No Data</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">No speaker data found.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // ✅ Dynamic content switch
  const renderContent = () => {
    switch (activeSection) {
      case "myprofile":
        return <MyProfile speakerId={speaker.id} />
      case "mysessions":
        return <MySessions speakerId={speaker.id} />
      case "materials":
        return <PresentationMaterials speakerId={speaker.id} />
      case "message":
        return <MessagesCenter organizerId={speaker.id} />
      case "connection":
        return <ConnectionsSection userId={speaker.id} />
      case "help":
        return <SpeakerHelpSupport />
      case "settings":
        return <SpeakerSettings />
      default:
        return <MyProfile speakerId={speaker.id} /> // 👈 Default fallback
    }
  }

  return (
    <div className="flex min-h-screen w-full bg-gray-50">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed md:relative w-64 min-h-screen bg-white border-r border-gray-200 z-50
        transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        md:translate-x-0 flex flex-col shadow-sm`}
      >
        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Speaker Menu</h2>
          <Button variant="ghost" size="sm" onClick={() => setSidebarOpen(false)}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex-1 p-4 overflow-y-auto">
          {/* Speaker Management */}
          <div className="mb-4">
            <button
              className="flex items-center justify-between w-full py-2 font-medium text-sm text-gray-700 hover:text-gray-900"
              onClick={() => toggleMenu("speaker-management")}
            >
              <span className="flex items-center gap-2">
                <User size={16} />
                Speaker Management
              </span>
              {openMenus.includes("speaker-management") ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </button>

            {openMenus.includes("speaker-management") && (
              <div className="ml-2 mt-2 space-y-1">
                <button onClick={() => setActiveSection("myprofile")} className={menuItemClass("myprofile")}>
                  My Profile
                </button>
                <button onClick={() => setActiveSection("mysessions")} className={menuItemClass("mysessions")}>
                  My Sessions
                </button>
                <button onClick={() => setActiveSection("materials")} className={menuItemClass("materials")}>
                  Presentation Materials
                </button>
              </div>
            )}
          </div>

          {/* Communication */}
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
                <button onClick={() => setActiveSection("message")} className={menuItemClass("message")}>
                  Messages
                </button>
                <button onClick={() => setActiveSection("connection")} className={menuItemClass("connection")}>
                  Connections
                </button>
              </div>
            )}
          </div>

          {/* Help & Support */}
          <button
            onClick={() => setActiveSection("help")}
            className={`flex items-center w-full py-2 gap-2 font-medium text-sm rounded-md transition-colors ${
              activeSection === "help"
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
          <Button
            onClick={() => logout()}
            className="w-full bg-red-500 hover:bg-red-600 text-white mt-8"
          >
            Logout
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        <main className="flex-1 p-6 overflow-auto">
          <div className="max-w-7xl mx-auto">
            <div className="">
              {renderContent()}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
