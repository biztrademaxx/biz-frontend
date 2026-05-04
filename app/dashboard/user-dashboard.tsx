"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/use-auth"
import { apiFetch, clearTokens } from "@/lib/api"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Loader2,
  ChevronDown,
  ChevronRight,
  LayoutDashboard,
  Calendar,
  Network,
  Settings,
  LogOut,
  SidebarIcon,
  Store,
  HelpCircle,
  List,
  Menu,
} from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"

import { ProfileSection } from "./profile-section"
import { EventsSection } from "./events-section"
import { ConnectionsSection } from "./connections-section"
import MessagesSection from "@/app/organizer-dashboard/messages-center"
import { VisitorSettings } from "./settings-section"
import type { UserData } from "@/types/user"
import TravelAccommodation from "./TravelAccommodation"
import { PastEvents } from "./PastEvents"
import { SavedEvents } from "./SavedEvents"
import { UpcomingEvents } from "./UpcomingEvents"
import { MyAppointments } from "./my-appointments"
import { ExhibitorSchedule } from "./ExhibitorSchedule"
import { Favourites } from "./Favourites"
import { Recommendations } from "./Recommendations"
import RecommendedEvents from "./recommended-events"
import Schedule from "./Schedule"
import { HelpSupport } from "@/components/HelpSupport"
import { useDashboard } from "@/contexts/dashboard-context"
import { DashboardManagedBanner } from "@/components/dashboard-managed-banner"

interface UserDashboardProps {
  userId: string
}

export function UserDashboard({ userId }: UserDashboardProps) {
  const { userId: authUserId, loading: authLoading } = useAuth({ requireAuth: true })
  const router = useRouter()
  const { toast } = useToast()
  const { activeSection, setActiveSection } = useDashboard()

  const [openMenus, setOpenMenus] = useState<string[]>(["dashboard"])
  const [userData, setUserData] = useState<UserData | null>(null)
  const [userInterests, setUserInterests] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)
  const [interestedEvents, setInterestedEvents] = useState<any[]>([])

  useEffect(() => {
    if (authLoading || !userId) return

    fetchUserData()
    fetchInterestedEvents()
  }, [authLoading, userId])

  // Close mobile sidebar when switching sections
  useEffect(() => {
    if (isMobileSidebarOpen) {
      setIsMobileSidebarOpen(false)
    }
  }, [activeSection])

  const fetchUserData = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await apiFetch<{ user?: UserData; data?: UserData }>(`/api/users/${userId}`, { auth: true })
      const user = data?.user ?? data?.data
      if (!user) {
        throw new Error("User data not found")
      }
      setUserData(user as UserData)
      setUserInterests((user as UserData).interests || [])
    } catch (err) {
      console.error("Error fetching user data:", err)
      setError(err instanceof Error ? err.message : "Error loading user data")
      
      toast({
        title: "Error",
        description: "Failed to load user data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchInterestedEvents = async () => {
    try {
      const data = await apiFetch<{ events?: any[]; data?: any[] }>(`/api/users/${userId}/interested-events`, { auth: true })
      const list = data.events ?? data.data ?? []
      // Ensure unique events to prevent duplicate key errors
      const uniqueEvents = Array.isArray(list)
        ? list.filter((event: any, index: number, self: any[]) =>
            index === self.findIndex((e: any) => e.id === event.id)
          )
        : []
        
      setInterestedEvents(uniqueEvents)
    } catch (err) {
      console.error("Error fetching interested events:", err)
      // Don't show toast for this as it's secondary data
    }
  }

  const handleProfileUpdate = (updatedUser: Partial<UserData>) => {
    setUserData((prev) => {
      if (!prev) return updatedUser as UserData
      return { ...prev, ...updatedUser }
    })

    if (updatedUser.interests) {
      setUserInterests(updatedUser.interests)
    }

    toast({
      title: "Profile Updated",
      description: "Your profile has been successfully updated.",
    })
  }

  const toggleMenu = (menu: string) => {
    setOpenMenus((prev) => 
      prev.includes(menu) 
        ? prev.filter((m) => m !== menu) 
        : [...prev, menu]
    )
  }

  const toggleSidebar = () => {
    if (window.innerWidth < 768) {
      setIsMobileSidebarOpen(!isMobileSidebarOpen)
    } else {
      setIsSidebarCollapsed(!isSidebarCollapsed)
    }
  }

  const handleSignOut = () => {
    clearTokens()
    router.push("/login")
  }

  const renderContent = () => {
    if (loading) {
      return (
        <div className="space-y-4">
          <Skeleton className="h-8 w-1/3" />
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      )
    }
    
    if (error) {
      return (
        <div className="text-center py-8">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={fetchUserData} variant="outline">
            Retry
          </Button>
        </div>
      )
    }
    
    if (!userData) {
      return (
        <div className="text-center py-8">
          <p className="text-gray-600">No user data found</p>
        </div>
      )
    }

    switch (activeSection) {
      case "profile":
        return <ProfileSection userData={userData} onUpdate={handleProfileUpdate} organizerId={""} />
      case "events":
        return <EventsSection userId={userId} />
      case "past-events":
        return <PastEvents userId={userId} />
      case "wishlist":
        return <SavedEvents userId={userId} />
      case "upcoming-events":
        return <UpcomingEvents events={interestedEvents} userId={userId} />
      case "my-appointments":
        return <MyAppointments userId={userId} />
      case "exhibitor-schedule":
        return <ExhibitorSchedule userId={userId} />
      case "schedule":
        return <Schedule userId={userId} />
      case "favourites":
        return <Favourites />
      case "recommended-events":
        return <RecommendedEvents userId={userId} interests={userInterests} />
      case "Suggested":
        return <Recommendations />
      case "connections":
        return <ConnectionsSection userId={userId} />
      case "messages":
        return <MessagesSection organizerId={userId} />
      case "settings":
        return <VisitorSettings  />
      case "travel":
        return <TravelAccommodation />
      case "Help & Support":
        return <HelpSupport />
      default:
        return <ProfileSection userData={userData} onUpdate={handleProfileUpdate} organizerId={""} />
    }
  }

  const renderSidebar = () => {
    const sidebarContent = (
      <div className={`${isSidebarCollapsed ? "w-16" : "w-64"} bg-white border-r flex flex-col justify-between transition-all duration-300 h-full`}>
        <div>
          <nav className="p-4 text-sm space-y-2">
            {/* Dashboard */}
            <div>
              <button 
                className="flex items-center justify-between w-full py-2 font-medium hover:text-blue-600 transition-colors" 
                onClick={() => toggleMenu("dashboard")}
              >
                <span className="flex items-center gap-2">
                  <LayoutDashboard size={16} />
                  {!isSidebarCollapsed && "Dashboard"}
                </span>
                {!isSidebarCollapsed &&
                  (openMenus.includes("dashboard") ? <ChevronDown size={16} /> : <ChevronRight size={16} />)}
              </button>
              {openMenus.includes("dashboard") && !isSidebarCollapsed && (
                <ul className="ml-2 mt-2 space-y-2 border-l border-transparent">
                  <li
                    onClick={() => setActiveSection("profile")}
                    className={`cursor-pointer pl-3 py-1 border-l-4 transition-colors ${
                      activeSection === "profile"
                        ? "border-blue-500 text-blue-600 font-medium"
                        : "border-transparent hover:text-blue-600"
                    }`}
                  >
                    Profile
                  </li>
                </ul>
              )}
            </div>

            {/* Event */}
            <div>
              <button 
                className="flex items-center justify-between w-full py-2 font-medium hover:text-blue-600 transition-colors" 
                onClick={() => toggleMenu("event")}
              >
                <span className="flex items-center gap-2">
                  <Calendar size={16} />
                  {!isSidebarCollapsed && "My Events"}
                </span>
                {!isSidebarCollapsed &&
                  (openMenus.includes("event") ? <ChevronDown size={16} /> : <ChevronRight size={16} />)}
              </button>
              {openMenus.includes("event") && !isSidebarCollapsed && (
                <ul className="ml-2 mt-2 space-y-2 border-l">
                  <li onClick={() => setActiveSection("events")} className={menuItemClass(activeSection, "events")}>
                    Interested Events
                  </li>
                  <li onClick={() => setActiveSection("past-events")} className={menuItemClass(activeSection, "past-events")}>
                    Past Events
                  </li>
                  <li onClick={() => setActiveSection("wishlist")} className={menuItemClass(activeSection, "wishlist")}>
                    Saved Events
                  </li>
                </ul>
              )}
            </div>

            {/* Networking */}
            <div>
              <button 
                className="flex items-center justify-between w-full py-2 font-medium hover:text-blue-600 transition-colors" 
                onClick={() => toggleMenu("networking")}
              >
                <span className="flex items-center gap-2">
                  <Network size={16} />
                  {!isSidebarCollapsed && "Networking"}
                </span>
                {!isSidebarCollapsed &&
                  (openMenus.includes("networking") ? <ChevronDown size={16} /> : <ChevronRight size={16} />)}
              </button>
              {openMenus.includes("networking") && !isSidebarCollapsed && (
                <ul className="ml-2 mt-2 space-y-2 border-l">
                  <li onClick={() => setActiveSection("connections")} className={menuItemClass(activeSection, "connections")}>
                    My Connections
                  </li>
                  <li onClick={() => setActiveSection("messages")} className={menuItemClass(activeSection, "messages")}>
                    Messages
                  </li>
                </ul>
              )}
            </div>

            {/* Exhibitor */}
            <div>
              <button 
                className="flex items-center justify-between w-full py-2 font-medium hover:text-blue-600 transition-colors" 
                onClick={() => toggleMenu("exhibitor")}
              >
                <span className="flex items-center gap-2">
                  <Store size={16} />
                  {!isSidebarCollapsed && "My Exhibitors"}
                </span>
                {!isSidebarCollapsed &&
                  (openMenus.includes("exhibitor") ? <ChevronDown size={16} /> : <ChevronRight size={16} />)}
              </button>
              {openMenus.includes("exhibitor") && !isSidebarCollapsed && (
                <ul className="ml-2 mt-2 space-y-2 border-l">
                  <li onClick={() => setActiveSection("my-appointments")} className={menuItemClass(activeSection, "my-appointments")}>
                    Exhibitor Appointments
                  </li>
                  <li onClick={() => setActiveSection("Suggested")} className={menuItemClass(activeSection, "Suggested")}>
                    Suggested
                  </li>
                </ul>
              )}
            </div>

            {/* Event Planning Tools */}
            <div>
              <button 
                className="flex items-center justify-between w-full py-2 font-medium hover:text-blue-600 transition-colors" 
                onClick={() => toggleMenu("tools")}
              >
                <span className="flex items-center gap-2">
                  <List size={16} />
                  {!isSidebarCollapsed && "Event Planning Tools"}
                </span>
                {!isSidebarCollapsed &&
                  (openMenus.includes("tools") ? <ChevronDown size={16} /> : <ChevronRight size={16} />)}
              </button>
              {openMenus.includes("tools") && !isSidebarCollapsed && (
                <ul className="ml-2 mt-2 space-y-2 border-l">
                  <li onClick={() => setActiveSection("travel")} className={menuItemClass(activeSection, "travel")}>
                    Travel & Stay
                  </li>
                  <li onClick={() => setActiveSection("schedule")} className={menuItemClass(activeSection, "schedule")}>
                    Schedule
                  </li>
                </ul>
              )}
            </div>

            {/* Help & Support */}
            <div>
              <button
                onClick={() => setActiveSection("Help & Support")}
                className={`flex items-center gap-2 w-full py-2 font-medium transition-colors ${
                  activeSection === "Help & Support" ? "text-blue-600 font-medium" : "hover:text-blue-600"
                }`}
              >
                <HelpCircle size={16} />
                {!isSidebarCollapsed && "Help & Support"}
              </button>
            </div>

            {/* Settings */}
            <div>
              <button
                onClick={() => setActiveSection("settings")}
                className={`flex items-center gap-2 w-full py-2 font-medium transition-colors ${
                  activeSection === "settings" ? "text-blue-600 font-medium" : "hover:text-blue-600"
                }`}
              >
                <Settings size={16} />
                {!isSidebarCollapsed && "Settings"}
              </button>
            </div>
          </nav>
        </div>

        {/* Collapse & Logout */}
        <div className="p-4 space-y-2 border-t">
          <Button 
            onClick={toggleSidebar} 
            className="w-full flex items-center gap-2 mb-2" 
            variant="outline"
            size="sm"
          >
            <SidebarIcon size={16} />
            {!isSidebarCollapsed && (isSidebarCollapsed ? "Expand" : "Collapse")}
          </Button>
          <Button 
            onClick={handleSignOut} 
            className="w-full flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white"
            size="sm"
          >
            <LogOut size={16} />
            {!isSidebarCollapsed && "Logout"}
          </Button>
        </div>
      </div>
    )

    return (
      <>
        {/* Mobile Sidebar Overlay */}
        {isMobileSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
            onClick={() => setIsMobileSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <div className={`
          fixed md:static inset-y-0 left-0 z-50
          transform transition-transform duration-300 ease-in-out
          ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}>
          {sidebarContent}
        </div>
      </>
    )
  }

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen w-full bg-gray-50">
      {/* Sidebar */}
      {renderSidebar()}

      {/* Main content area — matches organizer-dashboard OrganizerDashboardPage */}
      <div className="flex min-h-screen flex-1 flex-col min-w-0">
        {/* Mobile top bar */}
        <div className="flex items-center justify-between border-b border-gray-200 bg-white p-4 shadow-sm md:hidden">
          <Button variant="ghost" size="sm" onClick={() => setIsMobileSidebarOpen(true)}>
            <Menu className="h-5 w-5" />
          </Button>
          <div className="w-9" />
        </div>

        <main className="flex-1 overflow-auto p-6">
          <DashboardManagedBanner page="visitor-dashboard" />
          <div className="mx-auto max-w-7xl">
            <div className="">{renderContent()}</div>
          </div>
        </main>
      </div>
    </div>
  )
}

// Helper for menu items
function menuItemClass(activeSection: string, id: string) {
  return `cursor-pointer pl-3 py-1 border-l-4 transition-colors ${
    activeSection === id ? "border-blue-500 text-blue-600 font-medium" : "border-transparent hover:text-blue-600"
  }`
}