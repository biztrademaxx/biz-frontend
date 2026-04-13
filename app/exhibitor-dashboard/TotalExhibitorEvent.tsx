import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

interface ActiveEventsCardProps {
  exhibitorId: string
}

export function ActiveEventsCard({ exhibitorId }: ActiveEventsCardProps) {
  const [count, setCount] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!exhibitorId) return

    const fetchEvents = async () => {
      try {
        const res = await fetch(`/api/events/exhibitors/${exhibitorId}`)
        const data = await res.json()
        // Assuming the API returns an array of events
        setCount(data?.length || 0)
      } catch (err) {
        console.error("Failed to fetch events:", err)
        setCount(0)
      } finally {
        setLoading(false)
      }
    }

    fetchEvents()
  }, [exhibitorId])

  if (loading) {
    return <Skeleton className="h-24 w-full rounded-lg" />
  }

  return (
    <div>
      <CardContent className="text-2xl font-bold text-gray-900">{count}</CardContent>
    </div>
  )
}
