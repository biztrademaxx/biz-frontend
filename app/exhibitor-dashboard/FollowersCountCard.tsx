import { useState, useEffect } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { apiFetch } from "@/lib/api"

interface FollowersCountCardProps {
  exhibitorId: string
}

/** Leads = people who clicked Follow on this exhibitor or Connect (connection request). */
export function FollowersCountCard({ exhibitorId }: FollowersCountCardProps) {
  const [count, setCount] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!exhibitorId) return

    const fetchLeadsCount = async () => {
      try {
        const data = await apiFetch<{ count?: number; totalLeads?: number }>(
          `/api/exhibitors/${exhibitorId}/leads-count`,
          { auth: true }
        )
        setCount(Number(data?.count ?? data?.totalLeads ?? 0))
      } catch (err) {
        console.error("Failed to fetch leads count:", err)
        setCount(0)
      } finally {
        setLoading(false)
      }
    }

    fetchLeadsCount()
  }, [exhibitorId])

  if (loading) {
    return <Skeleton className="h-24 w-full rounded-lg" />
  }

  return (
    <div className="text-2xl font-bold text-gray-900">{count}</div>
  )
}
