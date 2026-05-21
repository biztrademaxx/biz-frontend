"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CalendarDays, Users, Heart, TrendingUp, Clock, MapPin, Calendar as CalendarIcon, Building2 } from "lucide-react"
import { DynamicCalendar } from "./DynamicCalander"
import Link from "next/link"
import { eventPublicPath } from "@/lib/event-path"
import { useDashboard } from "@/contexts/dashboard-context"
import { useState, useEffect } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { EVENT_CARD_PLACEHOLDER_IMAGE, getEventCardImageUrl } from "@/lib/event-card-meta"

interface DashboardOverviewProps {
    userId: string
    events: any[]
    userName: string
}

interface SuggestedEvent {
    id: string
    slug?: string | null
    title: string
    description?: string
    shortDescription?: string
    startDate?: string
    endDate?: string
    city?: string
    state?: string
    venue?: string | { venueName?: string; venueCity?: string; venueState?: string; venueCountry?: string } | null
    bannerImage?: string | null
    thumbnailImage?: string | null
    tags?: string[]
}

export function DashboardOverview({ userId, events, userName }: DashboardOverviewProps) {
    const { setActiveSection } = useDashboard()
    const [suggestedEvents, setSuggestedEvents] = useState<SuggestedEvent[]>([])
    const [loadingSuggested, setLoadingSuggested] = useState(false)
    const [selectedEventFilter, setSelectedEventFilter] = useState<string>("all")

    const upcomingEvents = events?.filter(e => new Date(e.startDate) > new Date()).slice(0, 5) || []
    const interestedCount = events?.length || 0
    const upcomingCount = upcomingEvents.length

    // Get venue name helper function with null check
    const getVenueName = (event: SuggestedEvent): string => {
        if (!event.venue) return "Venue TBD"
        if (typeof event.venue === "string") return event.venue
        if (event.venue?.venueName) return event.venue.venueName
        return "Venue TBD"
    }

    // Get location helper function with null check
    const getLocation = (event: SuggestedEvent): string => {
        if (event.city && event.state) return `${event.city}, ${event.state}`
        if (event.city) return event.city
        if (event.state) return event.state
        if (event.venue && typeof event.venue === "object" && event.venue.venueCity) return event.venue.venueCity
        return ""
    }

    // Fetch suggested events based on user interests
    useEffect(() => {
        const fetchSuggestedEvents = async () => {
            try {
                setLoadingSuggested(true)
                const response = await fetch(`/api/events/recommended?userId=${userId}&limit=6`)
                if (response.ok) {
                    const data = await response.json()
                    setSuggestedEvents(Array.isArray(data) ? data : [])
                } else {
                    // Fallback to recent events if recommendations API fails
                    const fallbackResponse = await fetch(`/api/events/recent?limit=6`)
                    if (fallbackResponse.ok) {
                        const fallbackData = await fallbackResponse.json()
                        setSuggestedEvents(Array.isArray(fallbackData) ? fallbackData : [])
                    }
                }
            } catch (error) {
                console.error("Error fetching suggested events:", error)
                // Try to fetch recent events as fallback
                try {
                    const fallbackResponse = await fetch(`/api/events/recent?limit=6`)
                    if (fallbackResponse.ok) {
                        const fallbackData = await fallbackResponse.json()
                        setSuggestedEvents(Array.isArray(fallbackData) ? fallbackData : [])
                    }
                } catch (fallbackError) {
                    console.error("Error fetching fallback events:", fallbackError)
                }
            } finally {
                setLoadingSuggested(false)
            }
        }

        if (userId) {
            fetchSuggestedEvents()
        }
    }, [userId])

    const stats = [
        {
            title: "Upcoming Events",
            value: upcomingCount,
            icon: CalendarDays,
            color: "text-blue-600",
            bgColor: "bg-blue-50",
            borderColor: "border-blue-200",
            section: "upcoming-events"
        },
        {
            title: "Interested Events",
            value: interestedCount,
            icon: Heart,
            color: "text-red-500",
            bgColor: "bg-red-50",
            borderColor: "border-red-200",
            section: "events"
        },
        {
            title: "Network",
            value: "Connect",
            icon: Users,
            color: "text-green-600",
            bgColor: "bg-green-50",
            borderColor: "border-green-200",
            section: "connections"
        },
        {
            title: "Recommendations",
            value: "Explore",
            icon: TrendingUp,
            color: "text-purple-600",
            bgColor: "bg-purple-50",
            borderColor: "border-purple-200",
            section: "Suggested"
        }
    ]

    const quickActions = [
        { label: "Browse Events", section: "/event", icon: CalendarIcon, color: "bg-blue-500", isExternal: true },
        { label: "My Schedule", section: "schedule", icon: Clock, color: "bg-purple-500", isExternal: false },
        { label: "Connections", section: "connections", icon: Users, color: "bg-green-500", isExternal: false },
        { label: "Suggested Exhibitor", section: "Suggested", icon: TrendingUp, color: "bg-orange-500", isExternal: false }
    ]

    const handleNavigation = (section: string, isExternal: boolean = false) => {
        if (isExternal) {
            window.location.href = section
        } else {
            setActiveSection(section)
        }
    }

    // Get unique event titles for filter
    const uniqueEventTitles = Array.from(new Set(suggestedEvents.map(event => event.title)))

    // Filter events based on selection
    const filteredEvents = selectedEventFilter === "all"
        ? suggestedEvents
        : suggestedEvents.filter(event => event.title === selectedEventFilter)

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
                        onClick={() => handleNavigation(stat.section, false)}
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

            {/* Main Content Grid - 3 columns layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Calendar Section */}
                <div className="lg:col-span-1">
                    <Card className="h-full">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-gray-900">Event Calendar</h3>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleNavigation("schedule", false)}
                                    className="text-blue-600"
                                >
                                    View Full →
                                </Button>
                            </div>
                            <DynamicCalendar userId={userId} className="w-full" />
                        </CardContent>
                    </Card>
                </div>

                {/* Upcoming Events Section */}
                <div className="lg:col-span-1">
                    <Card className="h-full">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-gray-900">Upcoming Events</h3>
                                <Clock className="h-5 w-5 text-gray-400" />
                            </div>

                            {upcomingEvents.length > 0 ? (
                                <div className="space-y-4 max-h-[400px] overflow-y-auto hide-scrollbar">
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
                                        onClick={() => handleNavigation("/events", true)}
                                    >
                                        Browse Events
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Suggested Events Section */}
                <div className="lg:col-span-1">
                    <Card className="h-full">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-gray-900">Suggested For You</h3>
                                <TrendingUp className="h-5 w-5 text-purple-500" />
                            </div>

                            {loadingSuggested ? (
                                <div className="space-y-3">
                                    {[1, 2, 3].map((i) => (
                                        <div key={i} className="animate-pulse">
                                            <div className="h-24 bg-gray-100 rounded-lg"></div>
                                        </div>
                                    ))}
                                </div>
                            ) : filteredEvents.length > 0 ? (
                                <>
                                    {/* Filter Dropdown */}
                                    {uniqueEventTitles.length > 1 && (
                                        <div className="mb-3">
                                            <Select value={selectedEventFilter} onValueChange={setSelectedEventFilter}>
                                                <SelectTrigger className="w-full border-gray-200 bg-white/60">
                                                    <SelectValue placeholder="Filter by event" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="all">All Events</SelectItem>
                                                    {uniqueEventTitles.map((title) => (
                                                        <SelectItem key={title} value={title}>
                                                            {title.length > 25 ? `${title.substring(0, 25)}...` : title}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    )}

                                    <div className="space-y-3 max-h-[400px] overflow-y-auto hide-scrollbar">
                                        {filteredEvents.map((event) => {
                                            const venueName = getVenueName(event)
                                            const location = getLocation(event)
                                            const eventDate = event.startDate
                                                ? new Date(event.startDate).toLocaleDateString('en-US', {
                                                    month: 'short',
                                                    day: 'numeric',
                                                    year: 'numeric'
                                                })
                                                : "Date TBD"

                                            return (
                                                <Link
                                                    key={event.id}
                                                    href={eventPublicPath(event)}
                                                    className="block group"
                                                >
                                                    <div className="flex gap-3 p-3 rounded-lg border border-gray-100 hover:border-purple-200 hover:bg-purple-50/50 transition-all duration-200">
                                                        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                                                            <img
                                                                src={getEventCardImageUrl(event)}
                                                                alt={event.title}
                                                                className="h-full w-full object-cover"
                                                                loading="lazy"
                                                                onError={(e) => {
                                                                    const target = e.currentTarget
                                                                    if (target.src !== EVENT_CARD_PLACEHOLDER_IMAGE) {
                                                                        target.src = EVENT_CARD_PLACEHOLDER_IMAGE
                                                                    }
                                                                }}
                                                            />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="font-medium text-gray-900 truncate group-hover:text-purple-600 transition">
                                                                {event.title}
                                                            </p>
                                                            <div className="mt-1 space-y-1">
                                                                {venueName && venueName !== "Venue TBD" && (
                                                                    <p className="text-xs text-gray-500 flex items-center gap-1">
                                                                        <Building2 className="h-3 w-3" />
                                                                        <span className="truncate">{venueName}</span>
                                                                    </p>
                                                                )}
                                                                {location && (
                                                                    <p className="text-xs text-gray-500 flex items-center gap-1">
                                                                        <MapPin className="h-3 w-3" />
                                                                        <span className="truncate">{location}</span>
                                                                    </p>
                                                                )}
                                                                <p className="text-xs text-gray-500 flex items-center gap-1">
                                                                    <CalendarDays className="h-3 w-3" />
                                                                    <span>{eventDate}</span>
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </Link>
                                            )
                                        })}
                                    </div>

                                    <Button
                                        variant="link"
                                        className="w-full mt-4 text-purple-600"
                                        onClick={() => handleNavigation("Suggested", false)}
                                    >
                                        View All Recommendations →
                                    </Button>
                                </>
                            ) : (
                                <div className="text-center py-12">
                                    <TrendingUp className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                                    <p className="text-gray-500">No suggestions available</p>
                                    <Button
                                        variant="outline"
                                        className="mt-4"
                                        onClick={() => handleNavigation("/events", true)}
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
                                onClick={() => handleNavigation(action.section, action.isExternal)}
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
                            onClick={() => handleNavigation("Suggested", false)}
                        >
                            View Recommendations →
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}