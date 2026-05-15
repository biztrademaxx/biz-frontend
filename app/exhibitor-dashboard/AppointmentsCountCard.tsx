import { useState, useEffect } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { apiFetch } from "@/lib/api"

interface AppointmentsCountCardProps {
  exhibitorId: string
}

export function AppointmentsCountCard({ exhibitorId }: AppointmentsCountCardProps) {
  const [count, setCount] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!exhibitorId) return

    const fetchAppointments = async () => {
      try {
        const data = await apiFetch<{ appointments?: unknown[]; total?: number }>(
          `/api/appointments?exhibitorId=${encodeURIComponent(exhibitorId)}`,
          { auth: true }
        )
        setCount(Array.isArray(data?.appointments) ? data.appointments.length : (data?.total ?? 0))
      } catch (err) {
        console.error("Failed to fetch appointments:", err)
        setCount(0)
      } finally {
        setLoading(false)
      }
    }

    fetchAppointments()
  }, [exhibitorId])

  if (loading) {
    return <Skeleton className="h-8 w-14 rounded-md bg-[#004A96]/10" />
  }

  return <div className="text-2xl font-bold text-[#FF131C]">{count}</div>
}
