"use client"

// components/exhibitors-tab.tsx
import { devLog } from "@/lib/dev-log"

import { useEffect, useState } from "react"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { getCurrentUserId } from "@/lib/api"
import Link from "next/link"
import ScheduleMeetingButton from "@/components/ScheduleMeetingButton"
import { apiFetch } from "@/lib/api"
import { getPublicProfilePath } from "@/lib/profile-path"

interface Exhibitor {
  exhibitorId: string
  publicSlug?: string
  boothId: string
  company: string
  name: string
  email: string
  phone?: string
  avatar: string
  description?: string
  boothNumber: string
  status: string
  totalCost: number
  totalAppointmentsReceived: number
  followersCount?: number
  followerPreview?: Array<{
    id: string
    avatar?: string | null
    firstName?: string
    lastName?: string
  }>
  spaceReference?: string
  isSample?: boolean
  userId?: string
}

interface ExhibitorsTabProps {
  eventId: string
}

export default function ExhibitorsTab({ eventId }: ExhibitorsTabProps) {
  const [exhibitors, setExhibitors] = useState<Exhibitor[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()
  const userId = getCurrentUserId()

  useEffect(() => {
    const fetchExhibitors = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await apiFetch<{ data?: { exhibitors?: Exhibitor[] }; booths?: Exhibitor[] }>(`/api/events/${eventId}/exhibitors`, { auth: false })
        const list = data.booths ?? data.data?.exhibitors ?? []
        devLog("Fetched exhibitors:", list)
        const normalized = Array.isArray(list)
          ? list.map((item: any) => {
              const nestedExhibitor = item?.exhibitor ?? {}
              const companyName =
                (nestedExhibitor?.company && String(nestedExhibitor.company).trim()) ||
                (item?.companyName && String(item.companyName).trim()) ||
                ""
              const fallbackName = `${nestedExhibitor?.firstName || ""} ${nestedExhibitor?.lastName || ""}`.trim()
              return {
                exhibitorId: item?.exhibitorId || nestedExhibitor?.id || "",
                publicSlug: nestedExhibitor?.publicSlug,
                boothId: item?.id || item?.boothId || "",
                company: companyName,
                name: fallbackName || companyName || "Exhibitor",
                email: nestedExhibitor?.email || item?.email || "",
                phone: nestedExhibitor?.phone || item?.phone || "",
                avatar: nestedExhibitor?.avatar || item?.avatar || "",
                description: nestedExhibitor?.bio || item?.description || "",
                boothNumber: item?.boothNumber || "No.",
                status: item?.status || "ACTIVE",
                totalCost: Number(item?.totalCost ?? 0),
                totalAppointmentsReceived: Number(item?.totalAppointmentsReceived ?? 0),
                followersCount: Number(item?.followersCount ?? 0),
                followerPreview: Array.isArray(item?.followerPreview) ? item.followerPreview : [],
                spaceReference: item?.spaceReference || item?.space?.name || undefined,
                isSample: Boolean(item?.isSample),
                userId: nestedExhibitor?.id || item?.userId,
              } as Exhibitor
            })
          : []
        setExhibitors(normalized)
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

  const realExhibitors = exhibitors.filter((e) => !e.isSample)
  const hasRealExhibitors = realExhibitors.length > 0
  const getDisplayCompanyName = (exhibitor: Exhibitor) => {
    const company = (exhibitor.company || "").trim()
    if (company) return company
    const name = (exhibitor.name || "").trim()
    if (name) return name
    return "Exhibitor"
  }

  return (
    <div className="py-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-1">Exhibitor List</h2>
        <p className="text-sm text-gray-500">
          {hasRealExhibitors
            ? `${realExhibitors.length} Exhibitors of Current Edition`
            : "Participating exhibitors for this edition"}
        </p>
      </div>

      {!hasRealExhibitors ? (
        <div className="rounded-lg border border-gray-200 bg-muted/40 px-6 py-14 text-center">
          <p className="text-base font-medium text-foreground">Exhibitor list will be updated shortly.</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Check back later for confirmed exhibitors and booth details.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {realExhibitors.map((exhibitor) => (
            <Card
              key={exhibitor.exhibitorId}
              className="border hover:shadow-lg transition-shadow cursor-pointer rounded-xl overflow-hidden p-0"
            >
              <CardContent className="p-0">
                {/* Banner with gradient + company name text */}
                <div className="h-24 relative flex items-center justify-center bg-gradient-to-br from-[#004A96] via-[#003d7a] to-[#002f5e] px-4 text-center font-semibold text-white">
                  <span className="drop-shadow-sm text-sm">{getDisplayCompanyName(exhibitor)}</span>

                  {/* Verified badge */}
                  <div className="absolute top-3 right-3 bg-green-500 text-white rounded-full p-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>

                  {/* Profile image overlapping banner */}
                  <div className="absolute left-1/2 -translate-x-1/2 bottom-0 translate-y-1/2">
                    <div className="w-20 h-20 rounded-full border-4 border-white shadow-md overflow-hidden bg-white">
                      {exhibitor.avatar ? (
                        <Image
                          src={exhibitor.avatar}
                          alt={`${getDisplayCompanyName(exhibitor)} logo`}
                          width={80}
                          height={80}
                          className="object-cover w-full h-full rounded-full"
                        />
                      ) : (
                        <div className="w-full h-full bg-blue-50 flex items-center justify-center">
                          <span className="text-[10px] font-semibold text-blue-700 px-1 text-center leading-tight line-clamp-3">
                            {getDisplayCompanyName(exhibitor)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Card body */}
                <div className="pt-12 pb-4 px-4">
                  {/* Followers */}
                  <div className="flex justify-center items-center gap-1 mb-2">
                    <div className="flex -space-x-2">
                      {(exhibitor.followerPreview ?? []).slice(0, 3).map((f) => (
                        <div key={f.id} className="w-6 h-6 rounded-full border border-white overflow-hidden bg-gray-200">
                          {f.avatar ? (
                            <Image
                              src={f.avatar}
                              alt={`${f.firstName ?? ""} ${f.lastName ?? ""}`.trim() || "Follower"}
                              width={24}
                              height={24}
                              className="w-6 h-6 object-cover"
                            />
                          ) : (
                            <div className="w-6 h-6 flex items-center justify-center text-[10px] font-semibold text-gray-700">
                              {`${f.firstName?.[0] ?? ""}${f.lastName?.[0] ?? ""}`.toUpperCase() || "U"}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                    <span className="text-xs text-gray-500 ml-1">
                      {exhibitor.followersCount ?? 0} Followers
                    </span>
                  </div>

                  {/* Company name */}
                  <h3 className="text-base font-bold text-gray-900 text-center">
                    {getDisplayCompanyName(exhibitor)}
                  </h3>

                  {/* Booth + Status on same row */}
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-sm text-gray-600">
                      Booth: <span className="font-medium">{exhibitor.boothNumber || "No."}</span>
                    </p>
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

                  {/* Person name */}
                  {exhibitor.name && (
                    <p className="text-sm text-gray-600 mt-1">{exhibitor.name}</p>
                  )}

                  {/* Divider */}
                  <hr className="my-3 border-gray-200" />

                  {/* Details block */}
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

                  {/* Schedule Meeting Button */}
                  <div className="mb-3" onClick={(e) => e.stopPropagation()}>
                    <ScheduleMeetingButton
                      exhibitor={{
                        id: exhibitor.exhibitorId,
                        companyName: exhibitor.company,
                        isSample: Boolean(exhibitor.isSample),
                      }}
                      eventId={eventId}
                    />
                  </div>

                  {/* Divider + View Profile button */}
                  <hr className="border-gray-200 mb-3" />
                  <div className="flex justify-center">
                    <Link
                      href={getPublicProfilePath("exhibitor", {
                        id: exhibitor.exhibitorId,
                        publicSlug: exhibitor.publicSlug,
                        company: exhibitor.company,
                      })}
                      className="flex-1 py-2 rounded-full font-semibold text-sm bg-blue-600 text-white hover:bg-blue-700 transition text-center"
                      aria-label={`View ${exhibitor.company} details`}
                    >
                      View Profile
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {hasRealExhibitors && realExhibitors.length > 6 && (
        <div className="mt-6 text-center">
          <Button variant="outline" className="px-6 bg-transparent">
            Load More Exhibitors
          </Button>
        </div>
      )}
    </div>
  ) 
} 