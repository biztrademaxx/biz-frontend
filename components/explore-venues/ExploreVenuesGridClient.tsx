"use client"

import { useRouter } from "next/navigation"
import Link from "next/link"
import { Calendar, MapPin, Star } from "lucide-react"
import HomeSectionEmptyState, { homeEmptyDescription } from "@/components/home/HomeSectionEmptyState"
import type { ExploreVenueCard } from "@/lib/venues/types"
import { formatVenueLocationLabel } from "@/lib/venues/format-venue-location"
import { AppImage } from "@/components/app-image"
import { DEFAULT_VENUE_IMAGE } from "@/lib/default-venue-image"
import { getVenuePublicPath } from "@/lib/venue-dashboard-path"

function VenueCard({ venue, onNavigate }: { venue: ExploreVenueCard; onNavigate: () => void }) {
  const showRating = venue.averageRating > 0 || venue.totalReviews > 0
  const locationLabel = formatVenueLocationLabel(venue.city, venue.country)

  return (
    <button
      type="button"
      onClick={onNavigate}
      aria-label={`View venue: ${venue.name}`}
<<<<<<< Updated upstream
      // Updated: Added border and improved shadow
      className="group flex h-full w-full cursor-pointer flex-col overflow-hidden rounded-sm bg-white border border-gray-200 text-left shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_40px_rgba(0,0,0,0.15)] hover:border-[#002C71]/30 focus:outline-none focus:ring-2 focus:ring-[#002C71] focus:ring-offset-2"
=======
      className="group flex h-full w-full cursor-pointer flex-col overflow-hidden rounded-sm  bg-white text-left shadow-[0_4px_20px_rgba(0,0,0,0.12)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_22px_-10px_rgba(0,0,0,0.22)] focus:outline-none focus:ring-2 focus:ring-[#004A96] focus:ring-offset-2"
>>>>>>> Stashed changes
    >
      <div className="relative h-28 w-full shrink-0 overflow-hidden bg-gray-100 sm:h-32">
        <AppImage
          src={venue.imageUrl}
          alt={venue.name}
          fill
          sizes="(max-width: 768px) 100vw, 25vw"
          fallbackSrc={DEFAULT_VENUE_IMAGE}
          className="object-cover transition-transform duration-300 ease-out group-hover:scale-[1.02]"
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
              className="flex shrink-0 items-center gap-0.5 rounded-sm bg-amber-50 px-1.5 py-0.5 text-[11px] font-semibold text-amber-900 sm:text-xs"
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
  homeCity?: string | null
  homeCountry?: string | null
}

export default function ExploreVenuesGridClient({
  venues,
  homeCity,
  homeCountry,
}: ExploreVenuesGridClientProps) {
  const subtitle = homeCountry
    ? homeCity
      ? `Venues across ${homeCountry} — near ${homeCity} first`
      : `Discover event spaces and venues in ${homeCountry}`
    : "Discover event spaces and venues worldwide"
  const router = useRouter()

  // Debug log to see how many venues are being received
  console.log("Total venues received:", venues.length)

  // Only take up to 8 venues
  const displayVenues = venues.slice(0, 8)
  console.log("Display venues (first 8):", displayVenues.length)

  const row1 = displayVenues.slice(0, 4)
  const row2 = displayVenues.slice(4, 8)

  return (
    <section className="home-tt-section mx-auto mb-12 w-full min-w-0 max-w-7xl px-3 sm:px-4 lg:px-6">
      <div className="mb-10 text-start">
        <h2 className="home-tt-h2 mb-3">
          Explore Venues
          <br />
          <span className="home-tt-sub">{subtitle}</span>
        </h2>
      </div>

      <div>
        {venues.length === 0 ? (
          <HomeSectionEmptyState
            icon="venues"
            title="No venues in this region yet"
            description={homeEmptyDescription("venues", homeCity, homeCountry)}
            homeCity={homeCity}
            homeCountry={homeCountry}
            actions={[
              { label: "Browse all venues", href: "/venues" },
              { label: "List your venue", href: "/organizer-signup", variant: "secondary" },
            ]}
          />
        ) : (
          <>
            {row1.length > 0 && (
              <div className="mb-6 grid grid-cols-1 gap-5 sm:gap-6 md:grid-cols-2 lg:grid-cols-4">
                {row1.map((venue) => (
                  <VenueCard
                    key={venue.id}
                    venue={venue}
                    onNavigate={() => router.push(getVenuePublicPath(venue.id, venue.name))}
                  />
                ))}
              </div>
            )}
            {row2.length > 0 && (
              <div className="grid grid-cols-1 gap-5 sm:gap-6 md:grid-cols-2 lg:grid-cols-4">
                {row2.map((venue) => (
                  <VenueCard
                    key={venue.id}
                    venue={venue}
                    onNavigate={() => router.push(getVenuePublicPath(venue.id, venue.name))}
                  />
                ))}
              </div>
            )}
            <div className="mt-10 flex justify-center">
              <Link
                href="/venues"
                className="inline-flex items-center justify-center rounded-sm bg-[#004A96] px-8 py-3 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-[#003a75] hover:shadow-[0_8px_20px_rgba(0,44,113,0.25)] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
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