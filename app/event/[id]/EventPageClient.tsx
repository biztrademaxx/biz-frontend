"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { apiFetch } from "@/lib/api"
import EventPageContent from "../EventPageContent"
import EventPageSkeleton from "@/components/EventPageSkeleton"

interface EventPageClientProps {
  params: { id: string }
  initialEvent?: any
  initialError?: string | null
}

export default function EventPageClient({ params, initialEvent, initialError }: EventPageClientProps) {
  const [event, setEvent] = useState<any>(initialEvent)
  const [loading, setLoading] = useState(!initialEvent && !initialError)
  const [error, setError] = useState<string | null>(initialError || null)

  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    // Only fetch if we don't have initial data and no error
    if (!initialEvent && !initialError) {
      fetchEvent()
    }
  }, [params.id])

  useEffect(() => {
    // Update browser tab title only; keep URL as-is (id or slug) so /event/[id] or /event/[slug] doesn't change
    if (event?.title) {
      document.title = `${event.title} | BizTradeFairs`
    }
  }, [event])

  const fetchEvent = async () => {
    try {
      setLoading(true)
      const data = await apiFetch<Record<string, unknown>>(
        `/api/events/${encodeURIComponent(params.id)}`,
        { auth: false },
      )
      setError(null)
      setEvent(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
      toast({
        title: "Error",
        description: "Failed to load event details",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <EventPageSkeleton />
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error: {error}</p>
          <button 
            onClick={fetchEvent}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Event not found</p>
      </div>
    )
  }

  return <EventPageContent 
    event={event} 
    session={null}
    router={router}
    toast={toast}
  />
}