// app/admin/approvals/page.tsx
"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, Building2, Users, Briefcase, Bell } from "lucide-react"
import EventApprovalDashboard from "../EventApprovalDashboard" // Your existing event approval page
import VenueApprovals from "./components/VenueApprovals"
import OrganizerApprovals from "./components/OrganizerApprovals"
import ExhibitorApprovals from "./components/ExhibitorApprovals"

export default function ApprovalsHub() {
    // Get active tab from URL or default to events
    const [activeTab, setActiveTab] = useState("events")

    const tabs = [
        { id: "events", label: "Event Approvals", icon: Calendar, component: EventApprovalDashboard },
        { id: "venues", label: "Venue Approvals", icon: Building2, component: VenueApprovals },
        { id: "organizers", label: "Organizer Approvals", icon: Users, component: OrganizerApprovals },
        { id: "exhibitors", label: "Exhibitor Approvals", icon: Briefcase, component: ExhibitorApprovals },
    ]

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
            {/* Header Section */}
            <div className="relative overflow-hidden bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 via-transparent to-purple-600/5" />
                <div className="relative px-6 py-8 lg:px-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-xl">
                                    <Bell className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                </div>
                                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Approvals Management</h1>
                            </div>
                            <p className="text-gray-500 dark:text-gray-400">
                                Review and manage pending approvals across all entities
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs Section */}
            <div className="px-6 py-6 lg:px-8">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                    <TabsList className="inline-flex h-auto p-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm">
                        {tabs.map((tab) => (
                            <TabsTrigger
                                key={tab.id}
                                value={tab.id}
                                className="data-[state=active]:bg-blue-600 data-[state=active]:text-white px-4 py-2.5 rounded-lg gap-2"
                            >
                                <tab.icon className="h-4 w-4" />
                                <span>{tab.label}</span>
                            </TabsTrigger>
                        ))}
                    </TabsList>

                    {tabs.map((tab) => (
                        <TabsContent key={tab.id} value={tab.id} className="mt-6">
                            <tab.component />
                        </TabsContent>
                    ))}
                </Tabs>
            </div>
        </div>
    )
}