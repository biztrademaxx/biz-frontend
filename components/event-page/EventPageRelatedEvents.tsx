"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Calendar, MapPin } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { apiFetch } from "@/lib/api"

type RelatedEvent = {
    thumbnail: string | undefined
    id: string
    title: string
    slug?: string
    city?: string
    startDate: string
    endDate?: string
    image?: string
    categories?: string[]
    _id?: string
}

type Props = {
    currentEventId: string
    categories: string[] | undefined
}

export function EventPageRelatedEvents({ currentEventId, categories }: Props) {
    const [relatedEvents, setRelatedEvents] = useState<RelatedEvent[]>([])
    const [loading, setLoading] = useState(true)

    // Helper function to extract category string from various formats
    const getCategoryString = (category: any): string | null => {
        if (!category) return null
        if (typeof category === 'string') return category
        if (typeof category === 'object') {
            if (category.name && typeof category.name === 'string') return category.name
            if (category.title && typeof category.title === 'string') return category.title
            if (category.value && typeof category.value === 'string') return category.value
        }
        return null
    }

    // Get all valid category strings from the categories array
    const getCategoryStrings = (categories: any[] | undefined): string[] => {
        if (!categories || !Array.isArray(categories) || categories.length === 0) return []
        const strings: string[] = []
        for (const cat of categories) {
            const catStr = getCategoryString(cat)
            if (catStr && !strings.includes(catStr)) {
                strings.push(catStr)
            }
        }
        return strings
    }

    // Fetch all events (fallback)
    const fetchAllEvents = async (): Promise<RelatedEvent[]> => {
        try {
            const data = await apiFetch<{ events?: RelatedEvent[]; data?: RelatedEvent[] }>(
                `/api/events?limit=10`,
                { auth: false }
            )

            let events: RelatedEvent[] = []
            if (data?.events && Array.isArray(data.events)) {
                events = data.events
            } else if (data?.data && Array.isArray(data.data)) {
                events = data.data
            } else if (Array.isArray(data)) {
                events = data
            }

            return events.filter(e => {
                const eventId = e.id || e._id
                return eventId !== currentEventId
            })
        } catch (error) {
            console.error("Error fetching all events:", error)
            return []
        }
    }

    useEffect(() => {
        const fetchRelatedEvents = async () => {
            setLoading(true)

            try {
                // Get all valid category strings
                const categoryStrings = getCategoryStrings(categories)
                let events: RelatedEvent[] = []

                // If there are categories, try to fetch events by category
                if (categoryStrings.length > 0) {
                    const eventsMap = new Map<string, RelatedEvent>()

                    // Fetch events for each category
                    const fetchPromises = categoryStrings.map(async (categoryName) => {
                        try {
                            const data = await apiFetch<{ events?: RelatedEvent[]; data?: RelatedEvent[] }>(
                                `/api/events?category=${encodeURIComponent(categoryName)}&limit=10`,
                                { auth: false }
                            )

                            let categoryEvents: RelatedEvent[] = []
                            if (data?.events && Array.isArray(data.events)) {
                                categoryEvents = data.events
                            } else if (data?.data && Array.isArray(data.data)) {
                                categoryEvents = data.data
                            } else if (Array.isArray(data)) {
                                categoryEvents = data
                            }

                            return categoryEvents
                        } catch (error) {
                            console.error(`Error fetching events for category ${categoryName}:`, error)
                            return []
                        }
                    })

                    // Wait for all category fetches to complete
                    const allEventsArrays = await Promise.all(fetchPromises)

                    // Combine all events and filter out current event
                    for (const eventArray of allEventsArrays) {
                        for (const event of eventArray) {
                            const eventId = event.id || event._id
                            if (!eventId) continue
                            if (eventId !== currentEventId && !eventsMap.has(eventId)) {
                                eventsMap.set(eventId, event)
                            }
                        }
                    }

                    events = Array.from(eventsMap.values())
                }

                // If no events found from categories OR no categories exist, fetch all events
                if (events.length === 0) {
                    console.log("No category-based events found, fetching all events...")
                    events = await fetchAllEvents()
                }

                // Limit to 4 events
                setRelatedEvents(events.slice(0, 4))

            } catch (error) {
                console.error("Error fetching related events:", error)
                // Fallback to all events if anything fails
                try {
                    const allEvents = await fetchAllEvents()
                    setRelatedEvents(allEvents.slice(0, 4))
                } catch (fallbackError) {
                    console.error("Fallback also failed:", fallbackError)
                    setRelatedEvents([])
                }
            } finally {
                setLoading(false)
            }
        }

        fetchRelatedEvents()
    }, [currentEventId, categories])

    if (loading) {
        return (
            <Card className="overflow-hidden rounded-sm border border-gray-300 bg-white shadow-sm">
                <CardHeader className="pb-2">
                    <CardTitle className="text-lg font-semibold">You May Also Like</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="animate-pulse">
                            <div className="flex gap-3">
                                <div className="h-16 w-16 bg-gray-200 rounded-md"></div>
                                <div className="flex-1 space-y-2">
                                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                                    <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                                </div>
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>
        )
    }

    if (relatedEvents.length === 0) {
        return null
    }

    // Determine title based on what we're showing
    const categoryStrings = getCategoryStrings(categories)
    let titleText = "You May Also Like"

    if (categoryStrings.length === 1) {
        titleText = `More ${categoryStrings[0]} Events`
    } else if (categoryStrings.length === 2) {
        titleText = `More ${categoryStrings[0]} & ${categoryStrings[1]} Events`
    } else if (categoryStrings.length > 2) {
        titleText = `Related Events (${categoryStrings.length} categories)`
    }

    // Build URL for "View All" - use categories if available, otherwise general events
    const viewAllUrl = categoryStrings.length > 0
        ? `/events?${categoryStrings.map(c => `category=${encodeURIComponent(c)}`).join('&')}`
        : "/events"

    return (
        <Card className="overflow-hidden rounded-sm border border-gray-300 bg-white shadow-sm">
            <CardHeader className="pb-2">
                <CardTitle className="text-lg font-semibold flex items-center justify-between">
                    <span className="line-clamp-1">{titleText}</span>
                    <Link
                        href={viewAllUrl}
                        className="text-xs font-normal text-[#0f5a8d] hover:text-[#FF131C] transition-colors whitespace-nowrap ml-2"
                    >
                        View All
                    </Link>
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 pt-0">
                {relatedEvents.map((event) => {
                    const eventId = event.id || event._id
                    const eventSlug = event.slug || eventId
                    const imageUrl = event.image || event.thumbnail || null

                    return (
                        <Link
                            key={eventId}
                            href={`/events/${eventSlug}`}
                            className="group block"
                        >
                            <div className="flex gap-3 p-2 rounded-lg transition-all duration-200 hover:bg-gray-50 hover:shadow-sm">
                                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md bg-gray-100">
                                    {imageUrl ? (
                                        <Image
                                            src={imageUrl}
                                            alt={event.title}
                                            fill
                                            sizes="64px"
                                            className="object-cover group-hover:scale-105 transition-transform duration-200"
                                        />
                                    ) : (
                                        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 text-gray-400">
                                            <Calendar className="h-6 w-6" />
                                        </div>
                                    )}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="line-clamp-2 text-sm font-medium text-gray-900 group-hover:text-[#FF131C] transition-colors">
                                        {event.title}
                                    </p>
                                    {event.city && (
                                        <div className="mt-1 flex items-center gap-1 text-xs text-gray-500">
                                            <MapPin className="h-3 w-3 flex-shrink-0" />
                                            <span className="truncate">{event.city}</span>
                                        </div>
                                    )}
                                    {event.startDate && (
                                        <div className="mt-0.5 text-xs text-gray-400">
                                            {new Date(event.startDate).toLocaleDateString('en-US', {
                                                month: 'short',
                                                day: 'numeric'
                                            })}
                                            {event.endDate && event.endDate !== event.startDate &&
                                                ` - ${new Date(event.endDate).toLocaleDateString('en-US', {
                                                    month: 'short',
                                                    day: 'numeric'
                                                })}`
                                            }
                                        </div>
                                    )}
                                </div>
                            </div>
                        </Link>
                    )
                })}
            </CardContent>
        </Card>
    )
}