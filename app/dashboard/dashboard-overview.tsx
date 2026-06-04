"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CalendarDays, Users, Heart, TrendingUp, MapPin, Store } from "lucide-react"
import { DynamicCalendar } from "./DynamicCalander"
import Link from "next/link"
import { eventPublicPath } from "@/lib/event-path"
import { useDashboard } from "@/contexts/dashboard-context"
import { useState, useEffect } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AppImage } from "@/components/app-image"
import { EVENT_CARD_PLACEHOLDER_IMAGE, getEventCardImageUrl } from "@/lib/event-card-meta"
import { cn } from "@/lib/utils"

interface DashboardOverviewProps {
  userId: string
  events: any[]
  userName: string
  interests?: string[]
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
  categories?: string[]
}

const CATEGORY_BADGE_STYLES = [
  "bg-blue-600",
  "bg-emerald-600",
  "bg-orange-500",
  "bg-purple-600",
]

function formatEventDateRange(start?: string, end?: string): string {
  if (!start) return "Date TBD"
  const startD = new Date(start)
  const opts: Intl.DateTimeFormatOptions = { month: "short", day: "numeric", year: "numeric" }
  if (!end) return startD.toLocaleDateString("en-US", opts)
  const endD = new Date(end)
  const sameYear = startD.getFullYear() === endD.getFullYear()
  const startStr = startD.toLocaleDateString("en-US", { month: "short", day: "numeric" })
  const endStr = endD.toLocaleDateString("en-US", sameYear ? { month: "short", day: "numeric", year: "numeric" } : opts)
  return `${startStr}–${endStr}`
}

export function DashboardOverview({ userId, events, userName, interests = [] }: DashboardOverviewProps) {
  const { setActiveSection } = useDashboard()
  const [suggestedEvents, setSuggestedEvents] = useState<SuggestedEvent[]>([])
  const [loadingSuggested, setLoadingSuggested] = useState(false)
  const [selectedEventFilter, setSelectedEventFilter] = useState<string>("all")

  const upcomingEvents = events?.filter((e) => new Date(e.startDate) > new Date()).slice(0, 5) || []
  const interestedCount = events?.length || 0
  const upcomingCount = upcomingEvents.length

  const getVenueName = (event: SuggestedEvent): string => {
    if (!event.venue) return "Venue TBD"
    if (typeof event.venue === "string") return event.venue
    if (event.venue?.venueName) return event.venue.venueName
    return "Venue TBD"
  }

  const getLocation = (event: SuggestedEvent): string => {
    if (event.city && event.state) return `${event.city}, ${event.state}`
    if (event.city) return event.city
    if (event.state) return event.state
    if (event.venue && typeof event.venue === "object" && event.venue.venueCity) return event.venue.venueCity
    return ""
  }

  useEffect(() => {
    const fetchSuggestedEvents = async () => {
      try {
        setLoadingSuggested(true)
        const response = await fetch(`/api/events/recommended?userId=${userId}&limit=8`)
        if (response.ok) {
          const data = await response.json()
          setSuggestedEvents(Array.isArray(data) ? data : [])
        } else {
          const fallbackResponse = await fetch(`/api/events/recent?limit=8`)
          if (fallbackResponse.ok) {
            const fallbackData = await fallbackResponse.json()
            setSuggestedEvents(Array.isArray(fallbackData) ? fallbackData : [])
          }
        }
      } catch (error) {
        console.error("Error fetching suggested events:", error)
        try {
          const fallbackResponse = await fetch(`/api/events/recent?limit=8`)
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
      section: "upcoming-events",
    },
    {
      title: "Interested Events",
      value: interestedCount,
      icon: Heart,
      color: "text-red-500",
      bgColor: "bg-red-50",
      section: "events",
    },
    {
      title: "Network",
      value: "Connect",
      icon: Users,
      color: "text-green-600",
      bgColor: "bg-green-50",
      section: "connections",
    },
    {
      title: "Recommendations",
      value: "Explore",
      icon: TrendingUp,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      section: "Suggested",
    },
  ]

  const handleNavigation = (section: string, isExternal: boolean = false) => {
    if (isExternal) {
      window.location.href = section
    } else {
      setActiveSection(section)
    }
  }

  const statProgressWidth = (stat: (typeof stats)[0]): string => {
    if (typeof stat.value === "number") {
      return `${Math.min(100, Math.max(12, stat.value * 18))}%`
    }
    return "72%"
  }

  const statBarColor = (index: number): string => {
    const colors = ["bg-blue-500", "bg-pink-500", "bg-emerald-500", "bg-purple-500"]
    return colors[index] ?? "bg-blue-500"
  }

  const uniqueEventTitles = Array.from(new Set(suggestedEvents.map((event) => event.title)))

  const filteredEvents =
    selectedEventFilter === "all"
      ? suggestedEvents
      : suggestedEvents.filter((event) => event.title === selectedEventFilter)

  const suggestedPreview = filteredEvents.slice(0, 4)

  const interestsLabel =
    interests.length > 0
      ? interests.slice(0, 3).join(", ")
      : null

  const greetingHour = new Date().getHours()
  const timeGreeting =
    greetingHour < 12 ? "Good morning" : greetingHour < 17 ? "Good afternoon" : "Good evening"

  const getCategoryLabel = (event: SuggestedEvent, index: number): string => {
    const tag = event.tags?.[0] ?? event.categories?.[0]
    if (tag) return String(tag).toUpperCase()
    return "EVENT"
  }

  return (
    <div className="space-y-6">
      <p className="text-xl font-bold text-[#004A96] md:text-2xl">
        {timeGreeting}, {userName}!
      </p>

      <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm md:p-6">
        <h2 className="text-lg font-bold text-slate-900 md:text-xl">
          Welcome back, {userName}! 👋
        </h2>
        <p className="mt-1 text-sm text-slate-600 md:text-base">
          Discover events, connect with exhibitors, and make the most of your networking journey.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <Card
            key={index}
            className="cursor-pointer border border-slate-100 shadow-sm transition hover:shadow-md"
            onClick={() => handleNavigation(stat.section, false)}
          >
            <CardContent className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-3xl font-bold text-slate-900">{stat.value}</p>
                  <p className="mt-1 text-sm font-medium text-slate-600">{stat.title}</p>
                </div>
                <div className={`${stat.bgColor} rounded-xl p-2.5`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
              <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-slate-100">
                <div
                  className={cn("h-full rounded-full transition-all", statBarColor(index))}
                  style={{ width: statProgressWidth(stat) }}
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Calendar + Upcoming — two columns */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="h-full border border-slate-100 shadow-sm">
          <CardContent className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900">Event Calendar</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleNavigation("schedule", false)}
                className="text-[#004A96]"
              >
                View Full →
              </Button>
            </div>
            <DynamicCalendar userId={userId} className="w-full" />
          </CardContent>
        </Card>

        <Card className="h-full border border-slate-100 shadow-sm">
          <CardContent className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900">Upcoming Events</h3>
              <button
                type="button"
                className="text-sm font-medium text-[#004A96] hover:underline"
                onClick={() => handleNavigation("upcoming-events", false)}
              >
                View All
              </button>
            </div>

            {upcomingEvents.length > 0 ? (
              <div className="max-h-[400px] space-y-4 overflow-y-auto hide-scrollbar">
                {upcomingEvents.map((event) => (
                  <Link key={event.id} href={eventPublicPath(event)} className="group block">
                    <div className="rounded-lg border border-slate-100 p-3 transition hover:border-blue-200 hover:bg-blue-50/50">
                      <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-100 group-hover:bg-blue-200">
                          <CalendarDays className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-medium text-slate-900 group-hover:text-[#004A96]">
                            {event.title}
                          </p>
                          <p className="mt-1 text-sm text-slate-500">
                            {new Date(event.startDate).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </p>
                          {event.city ? (
                            <p className="mt-1 flex items-center gap-1 truncate text-xs text-slate-400">
                              <MapPin className="h-3 w-3" />
                              {event.city}
                            </p>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center">
                <CalendarDays className="mx-auto mb-3 h-12 w-12 text-slate-300" />
                <p className="text-slate-500">No upcoming events</p>
                <Button variant="outline" className="mt-4" onClick={() => handleNavigation("/event", true)}>
                  Browse Events
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Suggested For You — full width row */}
      <section className="w-full">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <h3 className="text-xl font-bold text-slate-900">Suggested For You</h3>
            {interestsLabel ? (
              <span className="text-sm text-slate-500">Based on: {interestsLabel}</span>
            ) : null}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {uniqueEventTitles.length > 1 ? (
              <Select value={selectedEventFilter} onValueChange={setSelectedEventFilter}>
                <SelectTrigger className="h-9 w-[140px] border-slate-200 bg-white text-sm">
                  <SelectValue placeholder="All Events" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Events</SelectItem>
                  {uniqueEventTitles.map((title) => (
                    <SelectItem key={title} value={title}>
                      {title.length > 22 ? `${title.substring(0, 22)}...` : title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : null}
            <Button
              variant="outline"
              size="sm"
              className="border-slate-200 text-[#004A96] hover:bg-slate-50"
              onClick={() => handleNavigation("recommended-events", false)}
            >
              Browse All
            </Button>
          </div>
        </div>

        {loadingSuggested ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-[340px] animate-pulse rounded-2xl bg-slate-100" />
            ))}
          </div>
        ) : suggestedPreview.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {suggestedPreview.map((event, index) => {
              const location = getLocation(event)
              const categoryLabel = getCategoryLabel(event, index)
              const badgeColor = CATEGORY_BADGE_STYLES[index % CATEGORY_BADGE_STYLES.length]

              return (
                <Card
                  key={event.id}
                  className="overflow-hidden border border-slate-100 shadow-sm transition hover:shadow-md"
                >
                  <div className="relative aspect-[4/3] w-full bg-slate-100">
                    <AppImage
                      src={getEventCardImageUrl(event)}
                      alt={event.title}
                      fill
                      sizes="(max-width: 640px) 100vw, 25vw"
                      fallbackSrc={EVENT_CARD_PLACEHOLDER_IMAGE}
                      className="object-cover"
                    />
                    <span
                      className={cn(
                        "absolute left-3 top-3 rounded px-2 py-0.5 text-[10px] font-bold tracking-wide text-white",
                        badgeColor,
                      )}
                    >
                      {categoryLabel}
                    </span>
                    <button
                      type="button"
                      className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/95 shadow-sm"
                      aria-label="Save event"
                      onClick={(e) => e.preventDefault()}
                    >
                      <Heart className="h-4 w-4 text-red-500" />
                    </button>
                  </div>
                  <CardContent className="p-4">
                    <p className="line-clamp-2 min-h-[2.5rem] text-sm font-bold leading-snug text-slate-900">
                      {event.title}
                    </p>
                    <ul className="mt-3 space-y-1.5 text-xs text-slate-600">
                      <li className="flex items-center gap-2">
                        <CalendarDays className="h-3.5 w-3.5 shrink-0 text-blue-600" />
                        {formatEventDateRange(event.startDate, event.endDate)}
                      </li>
                      {location ? (
                        <li className="flex items-center gap-2">
                          <MapPin className="h-3.5 w-3.5 shrink-0 text-red-500" />
                          <span className="line-clamp-1">{location}</span>
                        </li>
                      ) : null}
                      <li className="flex items-center gap-2">
                        <Store className="h-3.5 w-3.5 shrink-0 text-emerald-600" />
                        {getVenueName(event) !== "Venue TBD" ? getVenueName(event) : "Explore exhibitors"}
                      </li>
                    </ul>
                    <div className="mt-4 flex items-center justify-between gap-2 border-t border-slate-100 pt-3">
                      <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700">
                        Stalls Open
                      </span>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="h-8 px-3 text-xs" asChild>
                          <Link href={eventPublicPath(event)}>Register</Link>
                        </Button>
                        <Button size="sm" className="h-8 bg-[#004A96] px-3 text-xs hover:bg-[#003d7a]" asChild>
                          <Link href={eventPublicPath(event)}>View</Link>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        ) : (
          <Card className="border border-slate-100 shadow-sm">
            <CardContent className="py-12 text-center">
              <TrendingUp className="mx-auto mb-3 h-12 w-12 text-slate-300" />
              <p className="text-slate-500">No suggestions available</p>
              <Button variant="outline" className="mt-4" onClick={() => handleNavigation("/event", true)}>
                Browse Events
              </Button>
            </CardContent>
          </Card>
        )}
      </section>
    </div>
  )
}
