// components/exhibitors-tab.tsx
"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { getCurrentUserId } from "@/lib/api"
import { useRouter } from "next/navigation"
import { apiFetch } from "@/lib/api"
import { getPublicProfilePath } from "@/lib/profile-path"

interface Exhibitor {
  id: string
  publicSlug?: string
  boothId: string
  company: string
  organizationName?: string
  firstName?: string
  lastName?: string
  name: string
  email: string
  phone?: string
  logo: string
  description?: string
  boothNumber: string
  status: string
  totalCost: number
  spaceReference?: string
  userId?: string
}

// Add proper interface for props
interface ExhibitorsTabProps {
  eventId: string
}

export default function ExhibitorsTab({ eventId }: ExhibitorsTabProps) {
  const [exhibitors, setExhibitors] = useState<Exhibitor[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)
  const { toast } = useToast()
  const userId = getCurrentUserId()
  const router = useRouter()

  useEffect(() => {
    const fetchExhibitors = async () => {
      try {
        setLoading(true)
        setError(null)

        const data = await apiFetch<{ success: boolean; data: { exhibitors: Array<{
          id: string
          exhibitorId: string
          boothNumber: string
          companyName: string | null
          description: string | null
          totalCost: number
          status?: string
          exhibitor: { id: string; firstName: string; lastName: string; email: string; phone: string | null; avatar: string | null; company: string | null; organizationName?: string | null; jobTitle: string | null; publicSlug?: string }
          space?: { id: string; name: string; spaceType: string }
        }> } }>(`/api/events/${eventId}/exhibitors`, { auth: true })

        const list = data?.data?.exhibitors ?? []
        const mapped: Exhibitor[] = list.map((booth) => ({
          id: booth.exhibitor.id,
          boothId: booth.id,
          company: booth.companyName ?? booth.exhibitor.company ?? booth.exhibitor.organizationName ?? "",
          organizationName: booth.exhibitor.organizationName ?? booth.exhibitor.company ?? undefined,
          firstName: booth.exhibitor.firstName,
          lastName: booth.exhibitor.lastName,
          publicSlug: booth.exhibitor.publicSlug,
          name: [booth.exhibitor.firstName, booth.exhibitor.lastName].filter(Boolean).join(" ").trim() || "—",
          email: booth.exhibitor.email,
          phone: booth.exhibitor.phone ?? undefined,
          logo: booth.exhibitor.avatar ?? "",
          description: booth.description ?? undefined,
          boothNumber: booth.boothNumber ?? "",
          status: booth.status ?? "BOOKED",
          totalCost: booth.totalCost ?? 0,
          spaceReference: booth.space?.name,
          userId: booth.exhibitor.id,
        }))
        setExhibitors(mapped)
      } catch (err) {
        console.error("Error fetching exhibitors:", err)
        setError(err instanceof Error ? err.message : "Failed to load exhibitors")
      } finally {
        setLoading(false)
      }
    }

    if (eventId) {
      fetchExhibitors()
    }
  }, [eventId])

  const handleExhibitorClick = (exhibitor: Exhibitor) => {
    const userId = exhibitor.userId || exhibitor.id
    router.push(
      getPublicProfilePath("exhibitor", {
        id: userId,
        // Prefer server slug from DB; fall back to UUID so resolution always succeeds
        publicSlug: exhibitor.publicSlug || userId,
        organizationName: exhibitor.organizationName,
        company: exhibitor.company,
        firstName: exhibitor.firstName,
        lastName: exhibitor.lastName,
      }),
    )
  }

  const handleDelete = async (exhibitor: Exhibitor, e: React.MouseEvent) => {
    e.stopPropagation() // Prevent triggering the card click when deleting
    
    if (!confirm(`Are you sure you want to delete ${exhibitor.company}? This action cannot be undone.`)) {
      return
    }

    try {
      setDeleting(exhibitor.id)

      await apiFetch(`/api/events/${eventId}/exhibitors/${exhibitor.id}`, {
        method: "DELETE",
        auth: true,
      })

      setExhibitors((prev) => prev.filter((e) => e.id !== exhibitor.id))

      toast({
        title: "Success",
        description: `${exhibitor.company} has been removed.`,
      })
    } catch (err) {
      console.error("Error deleting exhibitor:", err)
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to delete exhibitor",
        variant: "destructive",
      })
    } finally {
      setDeleting(null)
    }
  }

  if (loading) {
    return (
      <div className="py-12 flex justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading exhibitors...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="py-12">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error: {error}</p>
          <Button onClick={() => window.location.reload()} variant="outline">
            Retry
          </Button>
        </div>
      </div>
    )
  }

  if (exhibitors.length === 0) {
    return (
      <div className="py-12 text-center text-gray-500">
        <p>No exhibitors have registered for this event yet.</p>
      </div>
    )
  }
return (
  <div className="py-6">
    <div className="mb-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-1">Exhibitor List</h2>
      <p className="text-sm text-gray-500">{exhibitors.length} Exhibitors of Current Edition</p>
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      {exhibitors.map((exhibitor) => (
        <Card
  key={exhibitor.id}
  className="border hover:shadow-lg transition-shadow cursor-pointer rounded-xl overflow-hidden p-0"
  onClick={() => handleExhibitorClick(exhibitor)}
>
  <CardContent className="p-0">
    {/* Banner fills top edge */}
    <div className="h-28 relative flex items-center justify-center bg-gradient-to-br from-[#004A96] via-[#003d7a] to-[#002f5e] text-center font-semibold text-white">
      <span className="drop-shadow-sm text-sm">{exhibitor.company || "Company Name"}</span>

      {/* Profile image overlapping banner */}
      <div className="absolute left-1/2 -translate-x-1/2 bottom-0 translate-y-1/2">
        <Image
          src={exhibitor.logo || "/placeholder-logo.png"}
          alt={`${exhibitor.company} logo`}
          width={80}
          height={80}
          className="rounded-full border-4 border-white shadow-md object-cover w-20 h-20"
        />
      </div>
    </div>

    {/* Card body */}
    <div className="pt-12 pb-4 px-4">
      <h3 className="text-lg font-bold text-gray-900 text-center">{exhibitor.company}</h3>

      <div className="flex items-center justify-between mt-2">
        {exhibitor.boothNumber && (
          <p className="text-sm text-gray-600">
            Booth: <span className="font-medium">{exhibitor.boothNumber}</span>
          </p>
        )}
        {exhibitor.status && (
          <span
            className={`text-xs font-semibold px-3 py-1 rounded-full ${
              exhibitor.status === "BOOKED"
                ? "bg-green-100 text-green-700"
                : exhibitor.status === "CANCELLED"
                ? "bg-red-100 text-red-700"
                : "bg-gray-100 text-gray-700"
            }`}
          >
            {exhibitor.status}
          </span>
        )}
      </div>

      {exhibitor.name && <p className="text-sm text-gray-600 mt-1">{exhibitor.name}</p>}

      <hr className="my-3 border-gray-200" />

      <div className="mb-3">
        <p className="text-sm font-bold text-gray-800 mb-1">Details</p>
        <ul className="text-sm text-gray-600 space-y-0.5">
          {exhibitor.company && (
            <li className="flex items-start gap-1">
              <span className="mt-0.5">•</span>
              <span>{exhibitor.company}</span>
            </li>
          )}
          {exhibitor.name && (
            <li className="flex items-start gap-1">
              <span className="mt-0.5">•</span>
              <span>{exhibitor.name}</span>
            </li>
          )}
        </ul>
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            handleExhibitorClick(exhibitor)
          }}
          className="flex-1 py-2 rounded-full font-semibold text-sm bg-blue-600 text-white hover:bg-blue-700 transition"
        >
          View Profile
        </button>

        <button
          type="button"
          onClick={(e) => handleDelete(exhibitor, e)}
          disabled={deleting === exhibitor.id}
          className="flex-1 py-2 rounded-full font-semibold text-sm bg-red-600 text-white hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {deleting === exhibitor.id ? (
            <span className="flex items-center justify-center gap-1">
              <Loader2 className="w-4 h-4 animate-spin" /> Deleting...
            </span>
          ) : (
            "Delete"
          )}
        </button>
      </div>
    </div>
  </CardContent>
</Card>

      ))}
    </div>
  </div>
)
}

