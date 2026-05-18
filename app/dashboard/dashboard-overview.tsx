"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CalendarDays, Users, Heart, TrendingUp, Clock, MapPin, Calendar as CalendarIcon } from "lucide-react"
import { DynamicCalendar } from "./DynamicCalander"
import Link from "next/link"
import { eventPublicPath } from "@/lib/event-path"

interface DashboardOverviewProps {
    userId: string
    events: any[]
    userName: string
}

export function DashboardOverview({ userId, events, userName }: DashboardOverviewProps) {
    const upcomingEvents = events?.filter(e => new Date(e.startDate) > new Date()).slice(0, 5) || []
    const interestedCount = events?.length || 0
    const upcomingCount = upcomingEvents.length

    const stats = [
        {
            title: "Upcoming Events",
            value: upcomingCount,
            icon: CalendarDays,
            color: "text-blue-600",
            bgColor: "bg-blue-50",
            borderColor: "border-blue-200"
        },
        {
            title: "Interested Events",
            value: interestedCount,
            icon: Heart,
            color: "text-red-500",
            bgColor: "bg-red-50",
            borderColor: "border-red-200"
        },
        {
            title: "Network",
            value: "Connect",
            icon: Users,
            color: "text-green-600",
            bgColor: "bg-green-50",
            borderColor: "border-green-200"
        },
        {
            title: "Recommendations",
            value: "Explore",
            icon: TrendingUp,
            color: "text-purple-600",
            bgColor: "bg-purple-50",
            borderColor: "border-purple-200"
        }
    ]

    const quickActions = [
        { label: "Browse Events", section: "events", icon: CalendarIcon, color: "bg-blue-500" },
        { label: "My Schedule", section: "schedule", icon: Clock, color: "bg-purple-500" },
        { label: "Connections", section: "connections", icon: Users, color: "bg-green-500" },
        { label: "Recommendations", section: "Suggested", icon: TrendingUp, color: "bg-orange-500" }
    ]

    const handleNavigation = (section: string) => {
        window.dispatchEvent(new CustomEvent('dashboard-navigate', { detail: { section } }))
    }

    return (
        <div className="space-y-8">
            {/* Welcome Section */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                    Welcome back, {userName}! 👋
                </h1>
                <p className="text-gray-600 mt-2">
                    Discover events, connect with exhibitors, and make the most of your networking journey.
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, index) => (
                    <Card
                        key={index}
                        className={`hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer border-2 ${stat.borderColor}`}
                        onClick={() => {
                            if (stat.title === "Upcoming Events") handleNavigation("events")
                            if (stat.title === "Interested Events") handleNavigation("events")
                            if (stat.title === "Network") handleNavigation("connections")
                            if (stat.title === "Recommendations") handleNavigation("Suggested")
                        }}
                    >
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                                </div>
                                <div className={`${stat.bgColor} p-3 rounded-full`}>
                                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Calendar - Takes 2/3 of space */}
                <div className="lg:col-span-2">
                    <Card className="h-full">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-gray-900">Event Calendar</h3>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleNavigation("schedule")}
                                    className="text-blue-600"
                                >
                                    View Full Schedule →
                                </Button>
                            </div>
                            <DynamicCalendar userId={userId} className="w-full" />
                        </CardContent>
                    </Card>
                </div>

                {/* Upcoming Events - Takes 1/3 of space */}
                <div className="lg:col-span-1">
                    <Card className="h-full">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-gray-900">Upcoming Events</h3>
                                <Clock className="h-5 w-5 text-gray-400" />
                            </div>

                            {upcomingEvents.length > 0 ? (
                                <div className="space-y-4 max-h-[500px] overflow-y-auto">
                                    {upcomingEvents.map((event) => (
                                        <Link
                                            key={event.id}
                                            href={eventPublicPath(event)}
                                            className="block group"
                                        >
                                            <div className="p-3 rounded-lg border border-gray-100 hover:border-blue-200 hover:bg-blue-50/50 transition-all duration-200">
                                                <div className="flex items-start gap-3">
                                                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-blue-200 transition">
                                                        <CalendarDays className="h-5 w-5 text-blue-600" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-medium text-gray-900 truncate group-hover:text-blue-600 transition">
                                                            {event.title}
                                                        </p>
                                                        <p className="text-sm text-gray-500 mt-1">
                                                            {new Date(event.startDate).toLocaleDateString('en-US', {
                                                                month: 'short',
                                                                day: 'numeric',
                                                                year: 'numeric'
                                                            })}
                                                        </p>
                                                        {event.city && (
                                                            <p className="text-xs text-gray-400 truncate mt-1 flex items-center gap-1">
                                                                <MapPin className="h-3 w-3" />
                                                                {event.city}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <CalendarDays className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                                    <p className="text-gray-500">No upcoming events</p>
                                    <Button
                                        variant="outline"
                                        className="mt-4"
                                        onClick={() => handleNavigation("events")}
                                    >
                                        Browse Events
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Quick Actions */}
            <Card>
                <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {quickActions.map((action, index) => (
                            <button
                                key={index}
                                onClick={() => handleNavigation(action.section)}
                                className="group p-4 text-center hover:bg-gray-50 rounded-xl transition-all duration-200 border border-transparent hover:border-gray-200"
                            >
                                <div className={`${action.color} w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform`}>
                                    <action.icon className="h-6 w-6 text-white" />
                                </div>
                                <p className="text-sm font-medium text-gray-700">{action.label}</p>
                            </button>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Tips Section */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-100">
                <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <TrendingUp className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                        <h4 className="font-semibold text-gray-900">Pro Tip</h4>
                        <p className="text-sm text-gray-600 mt-1">
                            Connect with exhibitors before the event to schedule meetings and make the most of your time.
                            Check out our recommendations based on your interests!
                        </p>
                        <Button
                            variant="link"
                            className="px-0 text-purple-600 mt-2"
                            onClick={() => handleNavigation("Suggested")}
                        >
                            View Recommendations →
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}