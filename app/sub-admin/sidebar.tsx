"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
    LayoutDashboard,
    Calendar,
    Users,
    Building2,
    Mic,
    MapPin,
    UserCircle,
    DollarSign,
    FileText,
    Megaphone,
    BarChart3,
    Plug,
    Shield,
    Settings,
    HelpCircle,
    LogOut,
    ChevronDown,
} from "lucide-react"

import {
    getAccessToken,
    getCurrentUserId,
    getCurrentUserRole,
    getCurrentUserPermissions,
    clearTokens,
} from "@/lib/api"
import SuperAdminManagement from "@/app/admin-dashboard/superadminmanagement"
import SubAdminManagement from "@/app/admin-dashboard/subadmin-management"
import DashboardOverview from "@/app/admin-dashboard/dashboard-overview"
import EventManagement from "@/app/admin-dashboard/event-management"
import OrganizerManagement from "@/app/admin-dashboard/organizer-management"
import ExhibitorManagement from "@/app/admin-dashboard/exhibitor-management"
import SpeakerManagement from "@/app/admin-dashboard/speaker-management"
import VenueManagement from "@/app/admin-dashboard/venue-management"
import ContentManagement from "@/app/admin-dashboard/content-management"
import SystemSettings from "@/app/admin-dashboard/system-settings"
import { CreateEventForm } from "@/app/admin-dashboard/eventManagement/createEvent/create-event"

interface UserData {
    id?: string
    _id?: string
    email: string
    name: string
    role: string
    permissions: string[]
    createdBy?: string
}

export default function Sidebar() {
    const router = useRouter()
    const [activeSection, setActiveSection] = useState("")
    const [activeSubSection, setActiveSubSection] = useState("")
    const [openMenus, setOpenMenus] = useState<Set<string>>(new Set())
    const [permissions, setPermissions] = useState<string[]>([])
    const [role, setRole] = useState<string>("")
    const [isLoading, setIsLoading] = useState(true)
    const [user, setUser] = useState<UserData | null>(null)

    useEffect(() => {
        const loadUserData = () => {
            const token = getAccessToken()
            if (!token) {
                router.push("/sub-admin/login")
                return
            }
            const userRole = getCurrentUserRole()
            if (userRole !== "SUPER_ADMIN" && userRole !== "SUB_ADMIN") {
                router.push("/sub-admin/login")
                return
            }
            const tokenPermissions = getCurrentUserPermissions()
            const userId = getCurrentUserId()

            const subAdminData = localStorage.getItem("subAdmin")
            const superAdminData = localStorage.getItem("superAdmin")
            let userData: UserData | null = null
            if (superAdminData) {
                try {
                    userData = JSON.parse(superAdminData)
                } catch {
                    userData = { id: userId ?? "", email: "", name: "Admin", role: "SUPER_ADMIN", permissions: tokenPermissions }
                }
            } else if (subAdminData) {
                try {
                    userData = JSON.parse(subAdminData)
                } catch {
                    userData = { id: userId ?? "", email: "", name: "Sub Admin", role: "SUB_ADMIN", permissions: tokenPermissions }
                }
            } else {
                userData = {
                    id: userId ?? "",
                    email: "",
                    name: userRole === "SUPER_ADMIN" ? "Super Admin" : "Sub Admin",
                    role: userRole,
                    permissions: tokenPermissions,
                }
            }
            setUser(userData)
            setRole(userRole)
            setPermissions(tokenPermissions)
            setIsLoading(false)
        }

        loadUserData()
    }, [router])

    const handleLogout = () => {
        clearTokens()
        localStorage.removeItem("superAdminToken")
        localStorage.removeItem("superAdmin")
        localStorage.removeItem("subAdminToken")
        localStorage.removeItem("subAdmin")
        router.push("/sub-admin/login")
    }

    const toggleMenu = (menuId: string) => {
        const newOpenMenus = new Set(openMenus)
        newOpenMenus.has(menuId) ? newOpenMenus.delete(menuId) : newOpenMenus.add(menuId)
        setOpenMenus(newOpenMenus)
    }

    const hasPermission = (permissionId: string): boolean => {
        if (role === "SUPER_ADMIN") return true
        return permissions.includes(permissionId)
    }

    const sidebarItems = [
        {
            title: "Dashboard Overview",
            icon: LayoutDashboard,
            id: "dashboard-overview",
            requiredPermission: "dashboard-overview",
        },
        {
            title: "Venue",
            icon: MapPin,
            id: "venues",
            requiredPermission: "venues",
            subItems: [
                { title: "All Venues", id: "venues-all", requiredPermission: "venues-all" },
                { title: "Add Venue", id: "venues-add", requiredPermission: "venues-add" },
            ],
        },
        {
            title: "Reports & Analytics",
            icon: BarChart3,
            id: "reports",
            requiredPermission: "reports",
            subItems: [
                { title: "Event Performance", id: "reports-events", requiredPermission: "reports-events" },
                { title: "User Engagement", id: "reports-engagement", requiredPermission: "reports-engagement" },
            ],
        },
        {
            title: "User Roles & Permissions",
            icon: Shield,
            id: "roles",
            requiredPermission: "roles",
            subItems: [
                { title: "Super Admin", id: "roles-superadmin", requiredPermission: "roles-superadmin" },
                { title: "Sub Admins", id: "roles-subadmins", requiredPermission: "roles-subadmins" },
            ],
        },
        {
            title: "Help & Support",
            icon: HelpCircle,
            id: "support",
            requiredPermission: "support",
            subItems: [
                { title: "Support Tickets", id: "support-tickets", requiredPermission: "support-tickets" },
                { title: "Admin Notes", id: "support-notes", requiredPermission: "support-notes" },
            ],
        },
    ]

    const filteredSidebarItems = sidebarItems
        .map((item) => {
            if (!hasPermission(item.requiredPermission)) return null
            if (item.subItems) {
                const filteredSubItems = item.subItems.filter((subItem) =>
                    hasPermission(subItem.requiredPermission)
                )
                return filteredSubItems.length ? { ...item, subItems: filteredSubItems } : null
            }
            return item
        })
        .filter((item): item is NonNullable<typeof item> => Boolean(item))

    const renderContent = () => {
        if (isLoading) return <div className="flex items-center justify-center h-full">Loading...</div>

        const section = activeSection
        const subSection = activeSubSection

        if (subSection) {
            switch (subSection) {
                case "roles-superadmin":
                    return hasPermission("roles-superadmin") ? <SuperAdminManagement /> : <div>Access Denied</div>
                case "roles-subadmins":
                    return hasPermission("roles-subadmins") ? <SubAdminManagement /> : <div>Access Denied</div>
                case "venues-all":
                case "venues-add":
                    return hasPermission(subSection) ? <VenueManagement /> : <div>Access Denied</div>
                default:
                    return <div>Coming Soon...</div>
            }
        }

        if (section === "dashboard-overview") return <DashboardOverview />
        return <DashboardOverview />
    }

    const handleSectionClick = (id: string) => {
        setActiveSection(id)
        setActiveSubSection("")
    }

    const handleSubSectionClick = (parentId: string, subId: string) => {
        setActiveSection(parentId)
        setActiveSubSection(subId)
    }

    const isMenuOpen = (menuId: string) => openMenus.has(menuId)
    const isActive = (id: string) => activeSection === id
    const isSubActive = (id: string) => activeSubSection === id

    if (isLoading)
        return (
            <div className="flex h-screen bg-gray-50 items-center justify-center">
                <div className="text-lg">Loading dashboard...</div>
            </div>
        )

    return (
        <div className="flex h-screen bg-gray-50">
            {/* Sidebar */}
            <div className="w-80 bg-white border-r border-gray-200 text-sm flex flex-col">
                <div className="flex-1 overflow-y-auto p-4">
                    {filteredSidebarItems.length === 0 ? (
                        <div className="text-center text-gray-500 py-4">
                            No menu items available with your current permissions.
                        </div>
                    ) : (
                        filteredSidebarItems.map((item, index) => (
                            <div key={item.id || index} className="mb-1">
                                {item.subItems ? (
                                    <>
                                        <button
                                            onClick={() => toggleMenu(item.id)}
                                            className={`w-full flex items-center justify-between p-3 rounded-lg ${isActive(item.id)
                                                    ? "bg-blue-50 text-blue-700 border border-blue-200"
                                                    : "text-gray-700 hover:bg-gray-100"
                                                }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <item.icon className="w-4 h-4" />
                                                <span className="font-medium">{item.title}</span>
                                            </div>
                                            <ChevronDown
                                                className={`w-4 h-4 transition-transform ${isMenuOpen(item.id) ? "rotate-180" : ""
                                                    }`}
                                            />
                                        </button>

                                        {isMenuOpen(item.id) && (
                                            <div className="mt-1 ml-4 space-y-1 border-l border-gray-200 pl-2">
                                                {item.subItems.map((subItem) => (
                                                    <button
                                                        key={subItem.id}
                                                        onClick={() => handleSubSectionClick(item.id, subItem.id)}
                                                        className={`w-full text-left p-2 rounded-lg ${isSubActive(subItem.id)
                                                                ? "bg-blue-50 text-blue-700 border border-blue-200"
                                                                : "text-gray-600 hover:bg-gray-100"
                                                            }`}
                                                    >
                                                        {subItem.title}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <button
                                        onClick={() => handleSectionClick(item.id)}
                                        className={`w-full flex items-center gap-3 p-3 rounded-lg ${isActive(item.id)
                                                ? "bg-blue-50 text-blue-700 border border-blue-200"
                                                : "text-gray-700 hover:bg-gray-100"
                                            }`}
                                    >
                                        <item.icon className="w-4 h-4" />
                                        <span className="font-medium">{item.title}</span>
                                    </button>
                                )}
                            </div>
                        ))
                    )}

                    {/* Logout */}
                    <div className="mt-4 pt-4 border-t border-gray-200">
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 p-3 rounded-lg text-red-600 hover:bg-red-50"
                        >
                            <LogOut className="w-4 h-4" />
                            <span className="font-medium">Logout</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <main className="flex-1 overflow-auto bg-gray-50 p-6">{renderContent()}</main>
        </div>
    )
}
