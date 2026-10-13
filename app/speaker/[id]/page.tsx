"use client"

import Image from "next/image"
import { AppImage } from "@/components/app-image"
import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn, FaYoutube, FaPlay, FaFileAlt, FaExternalLinkAlt, FaMapMarkerAlt, FaGlobe, FaPhoneAlt } from "react-icons/fa"
import { ShareButton } from "@/components/share-button"
import Link from "next/link"
import { apiFetch } from "@/lib/api"
import { eventPublicPath } from "@/lib/event-path"
import SpeakerProfilePageSkeleton from "@/components/SpeakerProfilePageSkeleton"

interface Speaker {
  id: string
  name: string
  title: string
  bio: string
  image: string
  location: string
  mobileNumber: string
  website: string
  socialLinks: {
    facebook: string
    twitter: string
    instagram: string
    linkedin: string
  }
}

interface Event {
  currentAttendees: number
  averageRating: any
  id: string
  slug?: string
  title: string
  date: string
  location: string
  image: string
}

interface SessionMaterial {
  id: string
  fileName: string
  fileUrl: string
  fileSize: number
  fileType: string
  mimeType: string
  allowDownload: boolean
  uploadedAt: string
}

interface Session {
  id: string
  title: string
  description: string
  startTime: string
  endTime: string
  sessionType: string
  youtube: string[]
  materials?: SessionMaterial[]
  event: {
    id: string
    slug: string
    startDate: string
    endDate: string
  } | null
}

interface Banner {
  id: string
  title: string
  imageUrl: string
  page: string
  position: string
  link?: string
  isActive: boolean
  order: number
}

interface SpeakerPageProps {
  params: Promise<{ id?: string; slug?: string }>
}

export default function SpeakerPage({ params: _params }: SpeakerPageProps) {
  const pathParams = useParams()
  const routeId = typeof pathParams.id === "string" ? pathParams.id : ""
  const identifier = routeId.trim()

  const [speaker, setSpeaker] = useState<Speaker | null>(null)
  const [sessions, setSessions] = useState<Session[]>([])
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([])
  const [pastEvents, setPastEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [heroBanners, setHeroBanners] = useState<Banner[]>([])
  const [heroBannersLoading, setHeroBannersLoading] = useState(false)
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0)

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        if (!identifier) throw new Error("Speaker slug is required")

        const speakerData = await apiFetch<any>(`/api/speakers/${identifier}`, { auth: false })

        const s = speakerData.profile
        setSpeaker({
          id: identifier,
          name: s.fullName,
          title: s.designation,
          bio: s.bio,
          image: s.avatar || "/image/speaker.png",
          location: s.location,
          mobileNumber: s.phone,
          website: s.website,
          socialLinks: {
            facebook: s.linkedin || "#",
            twitter: "#",
            instagram: "#",
            linkedin: s.linkedin || "#",
          },
        })

        const eventsData = await apiFetch<{
          upcoming?: Event[]
          past?: Event[]
        }>(`/api/speakers/${identifier}/events`, { auth: false })
        setUpcomingEvents(eventsData.upcoming || [])
        setPastEvents(eventsData.past || [])

        try {
          const sessionsPayload = await apiFetch<{
            success?: boolean
            sessions?: Session[]
          }>(`/api/speakers/${identifier}/sessions`, { auth: false })
          const raw = sessionsPayload.sessions ?? []
          const normalized: Session[] = raw.map((s) => {
            let yt: string[] = []
            if (Array.isArray(s.youtube)) yt = s.youtube.filter(Boolean).map(String)
            else if (s.youtube && typeof s.youtube === "string") yt = [s.youtube]
            return {
              ...s,
              youtube: yt.map((u) => (/^https?:\/\//i.test(u) ? u : `https://${u}`)),
              materials: Array.isArray(s.materials) ? s.materials : [],
              event: s.event
                ? {
                    id: s.event.id,
                    slug: (s.event as { slug?: string }).slug ?? "",
                    startDate: s.event.startDate,
                    endDate: s.event.endDate,
                  }
                : null,
            }
          })
          setSessions(normalized)
        } catch {
          setSessions([])
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [identifier])

  useEffect(() => {
    let cancelled = false
    let intervalId: ReturnType<typeof setInterval> | undefined

    async function fetchHeroBanners() {
      try {
        setHeroBannersLoading(true)
        const data = await apiFetch<Banner[]>(`/api/content/banners?page=speaker-detail&position=hero`, { auth: false })
        if (cancelled) return
        const list = Array.isArray(data) ? data : []
        const activeHeroBanners = list.filter((banner: Banner) => banner.isActive !== false)
        setHeroBanners(activeHeroBanners)
        if (activeHeroBanners.length > 1) {
          intervalId = setInterval(() => {
            setCurrentBannerIndex((prev) => (prev + 1) % activeHeroBanners.length)
          }, 8000)
        }
      } catch (error) {
        if (!cancelled) console.error("Error fetching hero banners:", error)
      } finally {
        if (!cancelled) setHeroBannersLoading(false)
      }
    }

    fetchHeroBanners()
    return () => {
      cancelled = true
      if (intervalId) clearInterval(intervalId)
    }
  }, [])

  const handleBannerClick = async (bannerId: string) => {
    try {
      const speakerId = speaker?.id || routeId
      await fetch(`/api/analytics/banner-click`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bannerId,
          speakerId,
          timestamp: new Date().toISOString(),
          path: window.location.pathname,
        })
      })
    } catch (error) {
      console.error('Error tracking banner click:', error)
    }
  }

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    } catch (error) {
      return 'Invalid date'
    }
  }

  const formatEventDate = (isoString: string) => {
    if (!isoString) return { datePart: "Invalid date", timePart: "" }
    const date = new Date(isoString)
    if (Number.isNaN(date.getTime())) return { datePart: "Invalid date", timePart: "" }
    const datePart = date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
    const timePart = date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    })
    return { datePart, timePart }
  }

  const extractYouTubeVideoId = (url: string) => {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/
    const match = url.match(regex)
    return match ? match[1] : null
  }

  const getYouTubeThumbnail = (url: string) => {
    const videoId = extractYouTubeVideoId(url)
    return videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : null
  }

  const getInitial = (name: string) => (name?.trim()?.[0] || "?").toUpperCase()

  if (loading) {
    return <SpeakerProfilePageSkeleton />
  }

  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center text-red-600 text-lg font-medium">
        Error: {error}
      </div>
    )

  if (!speaker)
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600 text-lg font-medium">
        Speaker not found.
      </div>
    )

  return (
    <div className="bg-gray-50 min-h-screen overflow-x-hidden">
      {/* HERO BANNER WITH PROFILE OVERLAY (matches reference design) */}
      <div className="relative h-[220px] md:h-[280px] overflow-hidden bg-blue-950">
        {heroBannersLoading ? (
          <div className="w-full h-full bg-gradient-to-r from-gray-200 to-gray-300 animate-pulse"></div>
        ) : heroBanners.length > 0 ? (
          <>
            {heroBanners.map((banner, index) => (
              <div
                key={banner.id}
                className={`absolute inset-0 transition-opacity duration-500 ${
                  index === currentBannerIndex ? 'opacity-100' : 'opacity-0 pointer-events-none'
                }`}
              >
                <Link
                  href={banner.link || "#"}
                  onClick={() => handleBannerClick(banner.id)}
                  target={banner.link?.startsWith('http') ? '_blank' : '_self'}
                  className="block w-full h-full"
                >
                  <Image
                    src={banner.imageUrl || '/images/speaker-bg.png'}
                    alt={banner.title}
                    fill
                    className="object-cover"
                    priority={index === 0}
                    sizes="100vw"
                  />
                </Link>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-950/80 via-blue-950/50 to-blue-950/20" />

                {heroBanners.length > 1 && (
                  <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex space-x-2 z-10">
                    {heroBanners.map((_, idx) => (
                      <button
                        key={idx}
                        className={`w-2.5 h-2.5 rounded-full transition-all ${
                          idx === currentBannerIndex
                            ? "bg-white scale-110"
                            : "bg-white/50 hover:bg-white/75"
                        }`}
                        onClick={() => setCurrentBannerIndex(idx)}
                        aria-label={`Go to banner ${idx + 1}`}
                      />
                    ))}
                  </div>
                )}
              </div>
            ))}
          </>
        ) : (
          <div className="relative w-full h-full">
            <Image
              src="/logo/logo-5.png"
              alt="Speaker Background"
              fill
              className="object-cover"
              sizes="100vw"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-r from-blue-950/85 via-blue-950/55 to-blue-950/25" />
          </div>
        )}

        {/* Profile info overlaid directly on the banner */}
        <div className="absolute inset-0 flex items-center">
          <div className="max-w-6xl mx-auto px-4 w-full">
            <div className="flex items-center gap-5 md:gap-6">
              <div className="w-20 h-20 md:w-28 md:h-28 rounded-full border-4 border-white/90 overflow-hidden shadow-lg shrink-0 bg-blue-600 flex items-center justify-center">
                {speaker.image ? (
                  <Image
                    src={speaker.image}
                    alt={speaker.name}
                    width={112}
                    height={112}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-white text-3xl md:text-4xl font-semibold">
                    {getInitial(speaker.name)}
                  </span>
                )}
              </div>

              <div className="text-white min-w-0">
                <h1 className="text-xl md:text-3xl font-bold truncate">{speaker.name}</h1>
                {speaker.title && (
                  <p className="text-white/80 text-sm md:text-base mt-0.5">{speaker.title}</p>
                )}

                <div className="flex items-center gap-2 mt-2 md:mt-3">
                  {speaker.socialLinks.facebook && speaker.socialLinks.facebook !== "#" && (
                    <a
                      href={speaker.socialLinks.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-8 h-8 flex items-center justify-center rounded-full bg-[#1877F2] text-white hover:opacity-80 transition-opacity"
                    >
                      <FaFacebookF size={13} />
                    </a>
                  )}
                  {speaker.socialLinks.twitter && speaker.socialLinks.twitter !== "#" && (
                    <a
                      href={speaker.socialLinks.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-8 h-8 flex items-center justify-center rounded-full bg-[#1DA1F2] text-white hover:opacity-80 transition-opacity"
                    >
                      <FaTwitter size={13} />
                    </a>
                  )}
                  {speaker.socialLinks.instagram && speaker.socialLinks.instagram !== "#" && (
                    <a
                      href={speaker.socialLinks.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-8 h-8 flex items-center justify-center rounded-full bg-gradient-to-br from-[#F58529] via-[#DD2A7B] to-[#8134AF] text-white hover:opacity-80 transition-opacity"
                    >
                      <FaInstagram size={13} />
                    </a>
                  )}
                  {speaker.socialLinks.linkedin && speaker.socialLinks.linkedin !== "#" && (
                    <a
                      href={speaker.socialLinks.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-8 h-8 flex items-center justify-center rounded-full bg-[#0A66C2] text-white hover:opacity-80 transition-opacity"
                    >
                      <FaLinkedinIn size={13} />
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* TWO COLUMN LAYOUT: sidebar (About Me + contact) | main content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-6 items-start">
          {/* LEFT SIDEBAR */}
          <aside className="w-full lg:w-72 lg:sticky lg:top-6 shrink-0 space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-bold text-blue-900 mb-2 relative inline-block">
                About Me
                <span className="block h-0.5 w-8 bg-blue-600 mt-1" />
              </h2>
              <p className="text-gray-700 text-sm leading-relaxed mt-3">
                {speaker.bio || "No bio available."}
              </p>

              {(speaker.location || speaker.website || speaker.mobileNumber) && (
                <div className="mt-5 pt-5 border-t border-gray-100 space-y-3">
                  {speaker.location && (
                    <div className="flex items-start gap-2 text-sm text-gray-600">
                      <FaMapMarkerAlt className="text-orange-500 mt-0.5 shrink-0" size={13} />
                      <span>{speaker.location}</span>
                    </div>
                  )}
                  {speaker.website && (
                    <div className="flex items-start gap-2 text-sm text-gray-600">
                      <FaGlobe className="text-orange-500 mt-0.5 shrink-0" size={13} />
                      <a
                        href={speaker.website.startsWith("http") ? speaker.website : `https://${speaker.website}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-blue-600 hover:underline break-all"
                      >
                        {speaker.website}
                      </a>
                    </div>
                  )}
                  {speaker.mobileNumber && (
                    <div className="flex items-start gap-2 text-sm text-gray-600">
                      <FaPhoneAlt className="text-orange-500 mt-0.5 shrink-0" size={13} />
                      <span>{speaker.mobileNumber}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </aside>

          {/* MAIN CONTENT */}
          <main className="flex-1 min-w-0 space-y-10">
            {/* SESSION VIDEOS SECTION */}
            <section>
              <h2 className="text-xl font-bold text-blue-900 mb-1 relative inline-block">
                Session Videos
                <span className="block h-0.5 w-8 bg-blue-600 mt-1" />
              </h2>
              <div className="mt-4">
                {sessions.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                    {sessions.map((session) => (
                      <Card key={session.id} className="w-full min-w-0 gap-0 py-0 border border-gray-200 shadow-sm hover:shadow-lg transition-shadow overflow-hidden">
                        <CardContent className="p-3 sm:p-4">
                          {/* Session Header */}
                          <div className="mb-3">
                            <h3 className="font-semibold text-blue-900 text-sm line-clamp-2 mb-1">
                              {session.title}
                            </h3>
                            <div className="flex flex-wrap items-center gap-2 text-xs text-gray-600 mb-2">
                              <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-[10px] font-medium uppercase">
                                {session.sessionType}
                              </span>
                              <span className="text-gray-400">·</span>
                              <span className="text-gray-500">{formatDate(session.startTime)}</span>
                            </div>
                            <p className="text-xs text-gray-500 line-clamp-2">
                              {session.description}
                            </p>
                          </div>

                          {/* YouTube Videos */}
                          {session.youtube && session.youtube.length > 0 ? (
                            <div className="space-y-3">
                              {session.youtube.map((youtubeUrl, index) => {
                                const thumbnail = getYouTubeThumbnail(youtubeUrl)
                                return (
                                  <div key={index} className="group">
                                    <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-200">
                                      {thumbnail ? (
                                        <>
                                          <AppImage
                                            src={thumbnail}
                                            alt={`YouTube thumbnail for ${session.title}`}
                                            fill
                                            sizes="(max-width: 768px) 100vw, 50vw"
                                            className="object-cover transition-transform group-hover:scale-105"
                                          />
                                          <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors" />
                                          <div className="absolute inset-0 flex items-center justify-center">
                                            <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center transform group-hover:scale-110 transition-transform shadow-lg">
                                              <FaPlay className="text-white text-sm ml-1" />
                                            </div>
                                          </div>
                                        </>
                                      ) : (
                                        <div className="absolute inset-0 flex items-center justify-center bg-gray-300">
                                          <FaYoutube className="text-red-600 text-4xl" />
                                        </div>
                                      )}
                                      <a
                                        href={youtubeUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="absolute inset-0"
                                      >
                                        <span className="sr-only">Watch on YouTube</span>
                                      </a>
                                    </div>
                                    <div className="mt-2 flex items-center gap-2">
                                      <FaYoutube className="text-red-600 text-xs" />
                                      <span className="text-xs text-gray-600">Watch on YouTube</span>
                                    </div>
                                  </div>
                                )
                              })}
                            </div>
                          ) : (
                            <div className="text-center py-6">
                              <FaYoutube className="text-gray-400 text-2xl mx-auto mb-2" />
                              <p className="text-gray-500 text-xs">No videos available for this session</p>
                            </div>
                          )}

                          {session.event?.id && (
                            <div className="mt-3 pt-3 border-t border-gray-100">
                              <Link
                                href={eventPublicPath(session.event)}
                                className="text-xs text-blue-600 hover:text-blue-800 inline-flex items-center gap-1 font-medium"
                              >
                                View event <FaExternalLinkAlt className="text-[10px]" />
                              </Link>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card className="gap-0 py-0 border border-gray-200 shadow-sm">
                    <CardContent className="p-6 sm:p-8 text-center">
                      <FaYoutube className="text-gray-400 text-3xl mx-auto mb-3" />
                      <p className="text-gray-500 text-sm sm:text-base">No session videos available.</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </section>

            {/* PRESENTATION MATERIALS */}
            <section>
              <h2 className="text-xl font-bold text-blue-900 mb-1 relative inline-block">
                Presentation Materials
                <span className="block h-0.5 w-8 bg-blue-600 mt-1" />
              </h2>
              <p className="text-gray-600 text-sm mt-3 mb-4">Documents and slides from this speaker&apos;s sessions</p>
              {sessions.some((s) => (s.materials?.length ?? 0) > 0) ? (
                <div className="space-y-6">
                  {sessions.map((session) =>
                    session.materials && session.materials.length > 0 ? (
                      <Card key={`mat-${session.id}`} className="w-full min-w-0 gap-0 py-0 border border-gray-200 shadow-sm">
                        <CardContent className="p-3 sm:p-5">
                          <h3 className="font-semibold text-blue-900 text-sm sm:text-base mb-1 break-words">{session.title}</h3>
                          <p className="text-xs text-gray-500 mb-4 break-words">
                            {session.sessionType} · {formatDate(session.startTime)}
                            {session.event?.id && (
                              <>
                                {" · "}
                                <Link
                                  href={eventPublicPath(session.event)}
                                  className="text-blue-600 hover:underline"
                                >
                                  Event page
                                </Link>
                              </>
                            )}
                          </p>
                          <ul className="space-y-2">
                            {session.materials.map((m) => (
                              <li
                                key={m.id}
                                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 py-2.5 px-3 bg-gray-50 rounded-lg border border-gray-100"
                              >
                                <div className="flex items-start sm:items-center gap-2 min-w-0 flex-1">
                                  <FaFileAlt className="text-orange-500 shrink-0 mt-0.5 sm:mt-0" size={14} />
                                  <div className="min-w-0 flex-1">
                                    <p className="text-sm text-gray-800 break-all sm:break-words leading-snug">{m.fileName}</p>
                                    <span className="text-xs text-gray-400">({m.fileType})</span>
                                  </div>
                                </div>
                                {m.allowDownload !== false && m.fileUrl ? (
                                  <a
                                    href={m.fileUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm text-blue-600 hover:text-blue-800 font-medium shrink-0 self-start sm:self-center pl-6 sm:pl-0"
                                  >
                                    Download
                                  </a>
                                ) : (
                                  <span className="text-xs text-gray-400 shrink-0 self-start sm:self-center pl-6 sm:pl-0">Preview only</span>
                                )}
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>
                    ) : null
                  )}
                </div>
              ) : (
                <Card className="gap-0 py-0 border border-gray-200 shadow-sm">
                  <CardContent className="p-6 sm:p-8 text-center">
                    <FaFileAlt className="text-gray-400 text-3xl mx-auto mb-3" />
                    <p className="text-gray-500 text-sm sm:text-base">No presentation materials uploaded yet.</p>
                  </CardContent>
                </Card>
              )}
            </section>

            {/* EVENTS SECTION */}
            <section>
              <Tabs defaultValue="upcoming" className="w-full">
                <TabsList className="flex flex-wrap justify-start gap-2 mb-6 bg-transparent p-0 h-auto">
                  <TabsTrigger
                    value="upcoming"
                    className="text-sm px-4 py-2 rounded-md data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=inactive]:bg-gray-100 data-[state=inactive]:text-gray-600 transition-colors"
                  >
                    Upcoming
                  </TabsTrigger>
                  <TabsTrigger
                    value="past"
                    className="text-sm px-4 py-2 rounded-md data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=inactive]:bg-gray-100 data-[state=inactive]:text-gray-600 transition-colors"
                  >
                    Past
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="upcoming">
                  {upcomingEvents.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                      {upcomingEvents.map((e) => {
                        const { datePart, timePart } = formatEventDate(e.date)
                        return (
                          <Link
                            key={e.id}
                            href={e.id ? eventPublicPath(e) : "#"}
                            className="w-full min-w-0 border hover:shadow-lg transition-shadow rounded-lg overflow-hidden block cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                          >
                            <CardContent className="p-0">
                              <Image
                                src={(e.image || "/images/gpex.jpg").trim()}
                                alt={e.title}
                                width={400}
                                height={160}
                                className="w-full h-36 sm:h-40 object-cover"
                                sizes="(max-width: 640px) 100vw, 50vw"
                              />
                              <div className="p-3 sm:p-4">
                                <h3 className="font-semibold text-gray-900 text-sm line-clamp-2 break-words">{e.title}</h3>
                                <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">
                                  <span className="block sm:inline">{datePart}</span>
                                  <span className="hidden sm:inline"> at </span>
                                  <span className="block sm:inline text-gray-400 sm:text-gray-500">{timePart}</span>
                                </p>
                                <p className="text-xs text-gray-500 mt-1 line-clamp-2 break-words">{e.location}</p>
                                <div className="flex justify-between items-center gap-2 mt-3">
                                  <span className="bg-green-100 text-green-800 text-[10px] px-2 py-1 rounded shrink-0">
                                    {e.averageRating?.toFixed(1) || 0} ⭐
                                  </span>
                                  <div className="shrink-0" onClick={(ev) => { ev.preventDefault(); ev.stopPropagation() }}>
                                    <ShareButton id={e.id} title={e.title} type="event" />
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Link>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-8 sm:py-12 px-4 bg-gray-50 rounded-lg border border-gray-100">
                      <p className="text-gray-500 text-sm sm:text-base">No upcoming events scheduled.</p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="past">
                  {pastEvents.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                      {pastEvents.map((e) => {
                        const { datePart, timePart } = formatEventDate(e.date)
                        return (
                          <Link
                            key={e.id}
                            href={e.id ? eventPublicPath(e) : "#"}
                            className="w-full min-w-0 border hover:shadow-lg transition-shadow rounded-lg overflow-hidden block cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                          >
                            <CardContent className="p-0">
                              <Image
                                src={(e.image || "/images/gpex.jpg").trim()}
                                alt={e.title}
                                width={400}
                                height={160}
                                className="w-full h-36 sm:h-40 object-cover"
                                sizes="(max-width: 640px) 100vw, 50vw"
                              />
                              <div className="p-3 sm:p-4">
                                <h3 className="font-semibold text-gray-900 text-sm line-clamp-2 break-words">{e.title}</h3>
                                <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">
                                  <span className="block sm:inline">{datePart}</span>
                                  <span className="hidden sm:inline"> at </span>
                                  <span className="block sm:inline text-gray-400 sm:text-gray-500">{timePart}</span>
                                </p>
                                <p className="text-xs text-gray-500 mt-1 line-clamp-2 break-words">{e.location}</p>
                                <div className="flex justify-between items-center gap-2 mt-3">
                                  <span className="bg-green-100 text-green-800 text-[10px] px-2 py-1 rounded shrink-0">
                                    {e.averageRating?.toFixed(1) || 0} ⭐
                                  </span>
                                  <div className="shrink-0" onClick={(ev) => { ev.preventDefault(); ev.stopPropagation() }}>
                                    <ShareButton id={e.id} title={e.title} type="event" />
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Link>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-8 sm:py-12 px-4 bg-gray-50 rounded-lg border border-gray-100">
                      <p className="text-gray-500 text-sm sm:text-base">No past events found.</p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </section>
          </main>
        </div>
      </div>
    </div>
  )
}