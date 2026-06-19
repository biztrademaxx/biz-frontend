"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  LayoutGrid,
  List,
  MapPin,
  Mic,
  Search,
  Sparkles,
  Star,
  UsersRound,
} from "lucide-react"

import SpeakersListingPageSkeleton from "@/components/SpeakersListingPageSkeleton"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { apiFetch } from "@/lib/api"
import { getPublicProfilePath } from "@/lib/profile-path"

interface Speaker {
  id: string
  publicSlug?: string
  firstName: string
  lastName: string
  email: string
  phone: string
  avatar: string | null
  bio: string | null
  company: string | null
  jobTitle: string | null
  location: string | null
  website: string | null
  linkedin: string | null
  twitter: string | null
  specialties: string[]
  achievements: string[]
  certifications: string[]
  speakingExperience: string | null
  isVerified: boolean
  totalEvents: number
  activeEvents: number
  totalAttendees: number
  totalRevenue: number
  averageRating: number
  totalReviews: number
  createdAt: string
  updatedAt: string
  upcomingEventsCount?: number
  pastEventsCount?: number
}

interface ApiResponse {
  success: boolean
  speakers: Speaker[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

type SortKey = "events" | "upcoming" | "past" | "rating" | "reviews"
type ViewMode = "grid" | "list"

const SORT_OPTIONS: Array<{ value: SortKey; label: string }> = [
  { value: "reviews", label: "Reviews" },
  { value: "rating", label: "Rating" },
  { value: "events", label: "Total Events" },
  { value: "upcoming", label: "Upcoming Events" },
  { value: "past", label: "Past Events" },
]

const SPEAKERS_PER_PAGE = 5

function speakerMatchesSearch(speaker: Speaker, search: string) {
  const q = search.trim().toLowerCase()
  if (!q) return true

  const blob = [
    speaker.firstName,
    speaker.lastName,
    `${speaker.firstName} ${speaker.lastName}`,
    speaker.company,
    speaker.bio,
    speaker.jobTitle,
    speaker.location,
    ...(speaker.specialties || []),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase()

  return blob.includes(q)
}

function formatSpeakerName(speaker: Speaker) {
  return `${speaker.firstName || ""} ${speaker.lastName || ""}`.trim() || "Speaker"
}

function getSpeakerInitials(firstName: string, lastName: string) {
  return `${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase()
}

function getSpeakerAvatarStyles(speaker: Speaker) {
  const seed = formatSpeakerName(speaker)
    .split("")
    .reduce((total, char) => total + char.charCodeAt(0), 0)

  const variants = [
    "bg-[#DCEAFE] text-[#2563EB]",
    "bg-[#D9F0FF] text-[#0F9FB7]",
    "bg-[#E3F0FF] text-[#1D4ED8]",
  ]

  return variants[seed % variants.length]
}

function getSpeakerTotalEvents(speaker: Speaker) {
  return speaker.totalEvents ?? 0
}

function getSpeakerUpcomingEvents(speaker: Speaker) {
  return speaker.upcomingEventsCount || speaker.activeEvents || 0
}

function getSpeakerPastEvents(speaker: Speaker) {
  return speaker.pastEventsCount || Math.max(0, getSpeakerTotalEvents(speaker) - getSpeakerUpcomingEvents(speaker))
}

export default function SpeakersPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState<SortKey>("reviews")
  const [viewMode, setViewMode] = useState<ViewMode>("grid")
  const [currentPage, setCurrentPage] = useState(1)
  const [speakers, setSpeakers] = useState<Speaker[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    let cancelled = false

    async function fetchSpeakers() {
      try {
        setLoading(true)
        const data = await apiFetch<ApiResponse>("/api/speakers", { auth: false })

        if (!data.success) {
          throw new Error("Failed to load speakers")
        }

        const normalizedSpeakers: Speaker[] = data.speakers.map((speaker) => {
          const totalEvents = speaker.totalEvents ?? 0
          const upcomingEvents =
            speaker.upcomingEventsCount ?? speaker.activeEvents ?? 0
          const pastEvents =
            speaker.pastEventsCount ?? Math.max(0, totalEvents - upcomingEvents)

          return {
            ...speaker,
            totalEvents,
            activeEvents: upcomingEvents,
            upcomingEventsCount: upcomingEvents,
            pastEventsCount: pastEvents,
          }
        })

        if (!cancelled) {
          setSpeakers(normalizedSpeakers)
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "An error occurred")
          console.error("Error fetching speakers:", err)
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    fetchSpeakers()

    return () => {
      cancelled = true
    }
  }, [])

  const filteredSpeakers = useMemo(() => {
    const next = speakers.filter((speaker) => speakerMatchesSearch(speaker, searchQuery))

    next.sort((a, b) => {
      switch (sortBy) {
        case "rating":
          return (b.averageRating || 0) - (a.averageRating || 0)
        case "reviews":
          return (b.totalReviews || 0) - (a.totalReviews || 0)
        case "upcoming":
          return getSpeakerUpcomingEvents(b) - getSpeakerUpcomingEvents(a)
        case "past":
          return getSpeakerPastEvents(b) - getSpeakerPastEvents(a)
        case "events":
        default:
          return getSpeakerTotalEvents(b) - getSpeakerTotalEvents(a)
      }
    })

    return next
  }, [searchQuery, sortBy, speakers])

  const totalSpeakerPages = Math.max(1, Math.ceil(filteredSpeakers.length / SPEAKERS_PER_PAGE))

  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, sortBy])

  useEffect(() => {
    if (currentPage > totalSpeakerPages) {
      setCurrentPage(totalSpeakerPages)
    }
  }, [currentPage, totalSpeakerPages])

  const pagedSpeakers = useMemo(() => {
    const start = (currentPage - 1) * SPEAKERS_PER_PAGE
    return filteredSpeakers.slice(start, start + SPEAKERS_PER_PAGE)
  }, [currentPage, filteredSpeakers])

  const totalEvents = useMemo(
    () => filteredSpeakers.reduce((sum, speaker) => sum + getSpeakerTotalEvents(speaker), 0),
    [filteredSpeakers],
  )

  const totalUpcomingEvents = useMemo(
    () => filteredSpeakers.reduce((sum, speaker) => sum + getSpeakerUpcomingEvents(speaker), 0),
    [filteredSpeakers],
  )

  const handleSpeakerClick = (speaker: Speaker) => {
    router.push(
      getPublicProfilePath("speaker", {
        id: speaker.id,
        publicSlug: speaker.publicSlug,
        firstName: speaker.firstName,
        lastName: speaker.lastName,
      }),
    )
  }

  if (loading) {
    return <SpeakersListingPageSkeleton />
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F6F8FC] px-4">
        <div className="rounded-3xl border border-red-100 bg-white px-6 py-8 text-center shadow-sm">
          <p className="text-lg font-semibold text-red-600">Error: {error}</p>
          <Button
            onClick={() => window.location.reload()}
            className="mt-4 bg-[#123D86] hover:bg-[#0E3270]"
          >
            Retry
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(23,76,154,0.08),transparent_24%),linear-gradient(180deg,#FFFFFF_0%,#F8FAFD_100%)] text-[#102A5E]">
      <div className="mx-auto max-w-[1380px] px-4 py-6 sm:px-8 lg:px-14 lg:py-8">
        <div className="px-1 sm:px-2 lg:px-0">
          <section className="border-b border-[#DFE6F1] pb-6 lg:flex lg:items-start lg:justify-between lg:gap-10">
            <div className="max-w-[460px] shrink-0 lg:w-[35%]">
              <p className="text-base font-semibold tracking-[-0.02em] text-[#1C4A95]">
  Connect. Inspire. Grow.
</p>
             <h1 className="font-display text-[40px] font-extrabold leading-[0.96] tracking-[-0.045em]">
  <span className="text-[#0B132B]">Find speakers</span>
  <br />
  <span className="text-[#0B132B]">who </span>
  <span className="text-[#2563EB]">inspire</span>
  <span className="text-[#0B132B]"> and </span>
  <span className="text-[#2563EB]">impact.</span>
</h1>
              <p className="mt-5 max-w-[360px] text-[0.92rem] leading-7 text-[#4A608F]">
                Discover verified speakers and industry leaders for your next event.
              </p>
            </div>

            <div className="space-y-3 pt-6 lg:w-[65%] lg:pt-2">
              <div className="relative overflow-hidden rounded-[20px] bg-[linear-gradient(135deg,#0C2760_0%,#123D86_100%)] shadow-[0_14px_30px_rgba(18,61,134,0.18)]">
                <Search className="pointer-events-none absolute left-6 top-1/2 h-6 w-6 -translate-y-1/2 text-white/80" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Search speakers by name, expertise, company, or bio..."
                  className="h-[54px] w-full bg-transparent pl-16 pr-6 text-[0.96rem] text-white placeholder:text-white/75 focus:outline-none"
                />
              </div>

              <div className="grid gap-3 md:grid-cols-3">
                <div className="rounded-[20px] border border-[#E2E8F4] bg-white px-5 py-3.5 shadow-[0_10px_24px_rgba(16,42,94,0.06)]">
                  <div className="flex items-center gap-4">
                    <div className="flex h-13 w-13 items-center justify-center rounded-full bg-[linear-gradient(180deg,#15458F_0%,#0E2E67_100%)] text-white shadow-[0_10px_20px_rgba(16,42,94,0.16)]">
                      <UsersRound className="h-6 w-6" />
                    </div>
                    <div>
                      <div className="font-sans text-[2.35rem] font-semibold tabular-nums leading-none text-[#102A5E]">
                        {filteredSpeakers.length}
                      </div>
                      <p className="mt-1 font-sans text-[1.05rem] font-semibold leading-none text-[#102A5E]">
                        Speakers
                      </p>
                      <p className="mt-1.5 text-[0.84rem] text-[#5B6F98]">Active in our community</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-[20px] border border-[#E2E8F4] bg-white px-5 py-3.5 shadow-[0_10px_24px_rgba(16,42,94,0.06)]">
                  <div className="flex items-center gap-4">
                    <div className="flex h-13 w-13 items-center justify-center rounded-full bg-[linear-gradient(180deg,#15458F_0%,#0E2E67_100%)] text-white shadow-[0_10px_20px_rgba(16,42,94,0.16)]">
                      <CalendarDays className="h-6 w-6" />
                    </div>
                    <div>
                      <div className="font-sans text-[2.35rem] font-semibold tabular-nums leading-none text-[#102A5E]">
                        {totalEvents}
                      </div>
                      <p className="mt-1 whitespace-nowrap font-sans text-[1.05rem] font-semibold leading-none text-[#102A5E]">
                        Total Events
                      </p>
                      <p className="mt-1.5 text-[0.84rem] text-[#5B6F98]">Hosted by speakers</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-[20px] border border-[#E2E8F4] bg-white px-5 py-3.5 shadow-[0_10px_24px_rgba(16,42,94,0.06)]">
                  <div className="flex items-center gap-4">
                    <div className="flex h-13 w-13 items-center justify-center rounded-full bg-[linear-gradient(180deg,#15458F_0%,#0E2E67_100%)] text-white shadow-[0_10px_20px_rgba(16,42,94,0.16)]">
                      <CalendarDays className="h-6 w-6" />
                    </div>
                    <div>
                      <div className="font-sans text-[2.35rem] font-semibold tabular-nums leading-none text-[#102A5E]">
                        {totalUpcomingEvents}
                      </div>
                      <p className="mt-1 whitespace-nowrap font-sans text-[1.05rem] font-semibold leading-none text-[#102A5E]">
                        Upcoming Events
                      </p>
                      <p className="mt-1.5 text-[0.84rem] text-[#5B6F98]">Speakers joining soon</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="pt-5">
            <div className="flex flex-col gap-5 border-b border-[#DFE6F1] pb-5 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <Sparkles className="h-6 w-6 text-[#123D86]" />
                  <h2 className="font-display text-[1.85rem] font-bold tracking-[-0.035em] text-[#102A5E] lg:text-[2.1rem]">
                    Featured Speakers
                  </h2>
                </div>
                <p className="mt-1 text-[0.98rem] text-[#4F638F] lg:text-[1.02rem]">
                  Top rated and most engaging speakers
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
                <div className="flex items-center gap-3">
                  <span className="text-lg text-[#314978]">Sort by:</span>
                  <div className="relative">
                    <select
                      value={sortBy}
                      onChange={(event) => setSortBy(event.target.value as SortKey)}
                      className="h-[50px] min-w-[190px] appearance-none rounded-2xl border border-[#E2E8F4] bg-white pl-4 pr-12 text-[1.05rem] font-semibold text-[#102A5E] shadow-[0_10px_30px_rgba(16,42,94,0.06)] focus:outline-none"
                    >
                      {SORT_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#102A5E]" />
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setViewMode("grid")}
                    aria-label="Grid view"
                    className={`flex h-[50px] w-[50px] items-center justify-center rounded-2xl border transition-colors ${
                      viewMode === "grid"
                        ? "border-[#123D86] bg-[#123D86] text-white shadow-[0_14px_26px_rgba(18,61,134,0.2)]"
                        : "border-[#E2E8F4] bg-white text-[#102A5E]"
                    }`}
                  >
                    <LayoutGrid className="h-6 w-6" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode("list")}
                    aria-label="List view"
                    className={`flex h-[50px] w-[50px] items-center justify-center rounded-2xl border transition-colors ${
                      viewMode === "list"
                        ? "border-[#123D86] bg-[#123D86] text-white shadow-[0_14px_26px_rgba(18,61,134,0.2)]"
                        : "border-[#E2E8F4] bg-white text-[#102A5E]"
                    }`}
                  >
                    <List className="h-6 w-6" />
                  </button>
                </div>
              </div>
            </div>

            {filteredSpeakers.length === 0 ? (
              <div className="flex min-h-[320px] flex-col items-center justify-center rounded-[30px] border border-dashed border-[#D6E0F0] bg-white/70 px-6 text-center">
                <UsersRound className="h-14 w-14 text-[#9AAACA]" />
                <h3 className="truncate font-display text-[1.24rem] font-semibold leading-none tracking-[-0.03em] text-[#102A5E] lg:text-[1.34rem]">
                  No speakers found
                </h3>
                <p className="mt-2 max-w-md text-lg text-[#5B6F98]">
                  Try a different search term to explore more speakers from our community.
                </p>
                <Button
                  onClick={() => setSearchQuery("")}
                  className="mt-6 rounded-xl bg-[#123D86] px-5 py-2 text-base hover:bg-[#0E3270]"
                >
                  Clear Search
                </Button>
              </div>
            ) : (
              <>
                <div
                  className={`mt-6 grid gap-4 ${
                    viewMode === "grid"
                      ? "grid-cols-1 xl:grid-cols-3"
                      : "grid-cols-1"
                  }`}
                >
                  {pagedSpeakers.map((speaker) => (
                    <article
                      key={speaker.id}
                      className={`group cursor-pointer overflow-hidden rounded-[22px] border border-[#E4EAF5] bg-white p-4 shadow-[0_10px_28px_rgba(16,42,94,0.08)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_16px_40px_rgba(16,42,94,0.12)] ${
                        viewMode === "list" ? "flex flex-col sm:flex-row sm:items-start sm:gap-6" : ""
                      }`}
                      onClick={() => handleSpeakerClick(speaker)}
                    >
                      <div className={viewMode === "list" ? "sm:shrink-0" : ""}>
                        <Avatar className="h-[72px] w-[72px] border border-[#DDE5F3] shadow-[0_8px_18px_rgba(16,42,94,0.08)]">
  <AvatarImage
    src={speaker.avatar || ""}
    alt={formatSpeakerName(speaker)}
    className="object-cover"
  />

  <AvatarFallback
    className={`${getSpeakerAvatarStyles(speaker)} font-semibold`}
  >
    {getSpeakerInitials(speaker.firstName, speaker.lastName)}
  </AvatarFallback>
</Avatar>
                      </div>

                      <div className={`mt-3 flex-1 ${viewMode === "list" ? "sm:mt-0" : ""}`}>
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <h3 className="truncate font-display text-[1.24rem] font-semibold leading-none tracking-[-0.03em] text-[#102A5E] lg:text-[1.34rem]">
                                {formatSpeakerName(speaker)}
                              </h3>
                              {speaker.isVerified ? (
                                <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-[#1F8B4C]" />
                              ) : null}
                            </div>
                            <p className="mt-1.5 text-[0.82rem] leading-none text-[#445C8E] lg:text-[0.88rem]">
                              {speaker.jobTitle || "Industry Speaker"}
                            </p>

                            {speaker.company ? (
                              <div className="mt-2.5 flex items-center gap-2 text-[0.82rem] text-[#123D86] lg:text-[0.88rem]">
                                <Building2 className="h-3.5 w-3.5 shrink-0" />
                                <span className="truncate">{speaker.company}</span>
                              </div>
                            ) : null}

                            {speaker.location ? (
                              <div className="mt-1.5 flex items-center gap-2 text-[0.82rem] text-[#445C8E] lg:text-[0.88rem]">
                                <MapPin className="h-3.5 w-3.5 shrink-0" />
                                <span className="truncate">{speaker.location}</span>
                              </div>
                            ) : null}
                          </div>
                        </div>

                        <div className="mt-4 flex flex-wrap gap-1.5">
                          {(speaker.specialties || []).slice(0, 3).map((specialty) => (
                            <Badge
                              key={specialty}
                              variant="secondary"
                              className="rounded-full border border-[#E2E8F4] bg-[#F3F6FB] px-3 py-1 text-[0.74rem] font-medium text-[#123D86]"
                            >
                              {specialty}
                            </Badge>
                          ))}
                        </div>

                        <div className="mt-4 border-t border-[#E4EAF5] pt-3.5">
                          <div className="grid grid-cols-3 gap-3">
                            <div className="pr-2">
                              <div className="flex items-center gap-1.5 text-[#123D86]">
                                <Star className="h-4 w-4 fill-current" />
                                <span className="text-[0.98rem] font-semibold lg:text-[1.06rem]">
                                  {(speaker.averageRating || 0).toFixed(1)}
                                </span>
                              </div>
                              <p className="mt-1 text-[0.76rem] text-[#445C8E] lg:text-[0.8rem]">
                                ({speaker.totalReviews || 0} reviews)
                              </p>
                            </div>

                            <div className="border-l border-[#E4EAF5] px-3">
                              <div className="flex items-center gap-1.5 text-[#123D86]">
                                <Mic className="h-4 w-4" />
                                <span className="text-[0.98rem] font-semibold lg:text-[1.06rem]">
                                  {getSpeakerTotalEvents(speaker)}
                                </span>
                              </div>
                              <p className="mt-1 text-[0.76rem] text-[#445C8E] lg:text-[0.8rem]">Total Events</p>
                            </div>

                            <div className="border-l border-[#E4EAF5] px-3">
                              <div className="flex items-center gap-1.5 text-[#123D86]">
                                <CalendarDays className="h-4 w-4" />
                                <span className="text-[0.98rem] font-semibold lg:text-[1.06rem]">
                                  {getSpeakerUpcomingEvents(speaker)}
                                </span>
                              </div>
                              <p className="mt-1 text-[0.76rem] text-[#445C8E] lg:text-[0.8rem]">Upcoming</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </article>
                  ))}

                  <aside className="min-h-[220px] overflow-hidden rounded-[22px] bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.08),transparent_32%),linear-gradient(135deg,#0E2E67_0%,#133E8A_100%)] p-5 text-white shadow-[0_18px_50px_rgba(18,61,134,0.2)]">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10">
                      <UsersRound className="h-5 w-5" />
                    </div>
                    <h3 className="mt-4 font-display text-[1.42rem] font-semibold tracking-[-0.03em]">
                      Are you a speaker?
                    </h3>
                    <p className="mt-2.5 max-w-sm text-[0.88rem] leading-6 text-white/88">
                      Join our community and get discovered by event organizers worldwide.
                    </p>

                    <Button
                      type="button"
                     onClick={() => router.push("/signup?role=speaker")}
                      className="mt-4 h-[42px] rounded-2xl bg-white px-4 text-sm font-semibold text-[#123D86] hover:bg-white/95"
                    >
                      Join as a Speaker
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>

                    <div className="mt-5 space-y-2.5 text-[0.82rem] text-white/92">
                      <div className="flex items-center gap-3">
                        <CheckCircle2 className="h-5 w-5 shrink-0" />
                        <span>Showcase your expertise</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <CheckCircle2 className="h-5 w-5 shrink-0" />
                        <span>Connect with global organizers</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <CheckCircle2 className="h-5 w-5 shrink-0" />
                        <span>Grow your speaking career</span>
                      </div>
                    </div>
                  </aside>
                </div>

                <div className="mt-8 flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                    disabled={currentPage === 1}
                    className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#E2E8F4] bg-white text-[#123D86] shadow-sm transition disabled:cursor-not-allowed disabled:opacity-45"
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </button>

                  <div className="flex h-12 min-w-[48px] items-center justify-center rounded-2xl bg-[#123D86] px-4 text-xl font-semibold text-white shadow-[0_14px_30px_rgba(18,61,134,0.2)]">
                    {currentPage}
                  </div>

                  <button
                    type="button"
                    onClick={() => setCurrentPage((page) => Math.min(totalSpeakerPages, page + 1))}
                    disabled={currentPage === totalSpeakerPages}
                    className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#E2E8F4] bg-white text-[#123D86] shadow-sm transition disabled:cursor-not-allowed disabled:opacity-45"
                  >
                    <ArrowRight className="h-5 w-5" />
                  </button>
                </div>
              </>
            )}
          </section>
        </div>
      </div>
    </div>
  )
}
