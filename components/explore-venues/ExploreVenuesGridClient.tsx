"use client"

import { useRouter } from "next/navigation"
import Link from "next/link"
import { Calendar, MapPin, Star } from "lucide-react"
import type { ExploreVenueCard } from "@/lib/venues/types"

function VenueCard({ venue, onNavigate }: { venue: ExploreVenueCard; onNavigate: () => void }) {
  const showRating = venue.averageRating > 0 || venue.totalReviews > 0
  const locationLabel = venue.city.trim() || "Location TBD"

  return (
    <button
      type="button"
      onClick={onNavigate}
      aria-label={`View venue: ${venue.name}`}
      className="group flex h-full w-full cursor-pointer flex-col overflow-hidden rounded-md border border-gray-200 bg-white text-left shadow-sm transition-shadow duration-200 hover:border-gray-300 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
    >
      <div className="relative h-28 w-full shrink-0 overflow-hidden bg-gray-100 sm:h-32">
        <img
          src={venue.imageUrl}
          alt=""
          aria-hidden
          className="h-full w-full object-cover transition-transform duration-300 ease-out group-hover:scale-[1.02]"
          onError={(e) => {
            const t = e.target as HTMLImageElement
            t.src = "/city/c1.jpg"
          }}
        />
        {venue.eventCount > 0 ? (
          <div className="absolute bottom-1.5 left-1.5 flex items-center gap-0.5 rounded bg-black/55 px-1.5 py-0.5 text-[10px] font-medium text-white backdrop-blur-[2px] sm:text-[11px]">
            <Calendar className="h-2.5 w-2.5 shrink-0 opacity-90 sm:h-3 sm:w-3" strokeWidth={2} aria-hidden />
            <span>
              {venue.eventCount} {venue.eventCount === 1 ? "event" : "events"}
            </span>
          </div>
        ) : null}
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-1.5 p-3 sm:p-3.5">
        <div className="flex items-start justify-between gap-2">
          <h3 className="line-clamp-2 min-w-0 flex-1 text-sm font-bold leading-snug text-gray-900 sm:text-[0.9375rem]">
            {venue.name}
          </h3>
          {showRating ? (
            <div
              className="flex shrink-0 items-center gap-0.5 rounded-md bg-amber-50 px-1.5 py-0.5 text-[11px] font-semibold text-amber-900 sm:text-xs"
              title={`${venue.totalReviews} review${venue.totalReviews === 1 ? "" : "s"}`}
            >
              <Star className="h-3 w-3 fill-amber-400 text-amber-500 sm:h-3.5 sm:w-3.5" aria-hidden />
              <span>{venue.averageRating.toFixed(1)}</span>
              {venue.totalReviews > 0 ? (
                <span className="font-normal text-amber-800/80">({venue.totalReviews})</span>
              ) : null}
            </div>
          ) : null}
        </div>

        {venue.description.trim() ? (
          <p className="line-clamp-2 text-xs leading-relaxed text-gray-500 sm:text-sm">{venue.description.trim()}</p>
        ) : null}

        <div className="mt-auto flex items-center gap-1 border-t border-gray-100 pt-2 text-xs text-gray-600 sm:text-sm">
          <MapPin className="h-3.5 w-3.5 shrink-0 text-gray-400 sm:h-4 sm:w-4" strokeWidth={2} aria-hidden />
          <span className="min-w-0 truncate">{locationLabel}</span>
        </div>
      </div>
    </button>
  )
}

export interface ExploreVenuesGridClientProps {
  venues: ExploreVenueCard[]
}

export default function ExploreVenuesGridClient({ venues }: ExploreVenuesGridClientProps) {
  const router = useRouter()
  const row1 = venues.slice(0, 3)
  const row2 = venues.slice(3, 6)

  return (
    <section className="home-tt-section mx-auto mb-12 w-full max-w-[1320px] px-4 sm:px-6 lg:px-8">
      <div className="mb-10 text-start">
        <h2 className="home-tt-h2 mb-3">
          Explore Venues
          <br />
          <span className="home-tt-sub">Discover event spaces and venues in top cities</span>
        </h2>
      </div>

      <div>
        {venues.length === 0 ? (
          <p className="py-8 text-center text-sm text-gray-500">No venues available yet.</p>
        ) : (
          <>
            <div className="mb-6 grid grid-cols-1 gap-5 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
              {row1.map((venue) => (
                <VenueCard
                  key={venue.id}
                  venue={venue}
                  onNavigate={() => router.push(`/venue/${venue.id}`)}
                />
              ))}
            </div>
            {row2.length > 0 ? (
              <div className="grid grid-cols-1 gap-5 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
                {row2.map((venue) => (
                  <VenueCard
                    key={venue.id}
                    venue={venue}
                    onNavigate={() => router.push(`/venue/${venue.id}`)}
                  />
                ))}
              </div>
            ) : null}
            <div className="mt-10 flex justify-center">
              <Link
                href="/venues"
                className="inline-flex items-center justify-center rounded-md bg-[#002C71] px-8 py-3 text-sm font-semibold text-white shadow-sm transition-colors duration-200 hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                View all venues
              </Link>
            </div>
          </>
        )}
      </div>
    </section>
  )
}
