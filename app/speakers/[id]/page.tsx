"use client"

import Image from "next/image"
import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn, FaYoutube, FaPlay, FaFileAlt, FaExternalLinkAlt } from "react-icons/fa"
import { ShareButton } from "@/components/share-button"
import Link from "next/link"
import { apiFetch } from "@/lib/api"
import { eventPublicPath } from "@/lib/event-path"

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

        // Fetch speaker data
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

        // Fetch events (upcoming + past) from backend
        const eventsData = await apiFetch<{
          upcoming?: Event[]
          past?: Event[]
        }>(`/api/speakers/${identifier}/events`, { auth: false })
        setUpcomingEvents(eventsData.upcoming || [])
        setPastEvents(eventsData.past || [])

        // Sessions, videos & materials — direct backend (same origin as profile/events)
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

  // Fetch hero banners for speaker-detail page
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

  // Handle banner click tracking
  const handleBannerClick = async (bannerId: string) => {
    try {
      const speakerId = speaker?.id || routeId
      // Track banner click
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
    if (!isoString) return "Invalid date";
    const date = new Date(isoString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }) + " at " + date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    });
  };

  const extractYouTubeVideoId = (url: string) => {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/
    const match = url.match(regex)
    return match ? match[1] : null
  }

  const getYouTubeThumbnail = (url: string) => {
    const videoId = extractYouTubeVideoId(url)
    return videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : null
  }

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center text-blue-800 text-lg font-medium">
        Loading speaker profile...
      </div>
    )

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
    <div className="bg-white min-h-screen">
      {/* DYNAMIC HERO BANNER SECTION */}
    <div className="relative h-[300px] md:h-[350px] overflow-hidden">
  {heroBannersLoading ? (
    // Loading skeleton
    <div className="w-full h-full bg-gradient-to-r from-gray-200 to-gray-300 animate-pulse"></div>
  ) : heroBanners.length > 0 ? (
    <>
      {/* Banner Display - Only images */}
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
              src={banner.imageUrl || "/city/c4.jpg"}
              alt={banner.title}
              fill
              className="object-cover"
              priority={index === 0}
              sizes="100vw"
            />
          </Link>
          
          {/* Banner indicators if multiple banners */}
          {heroBanners.length > 1 && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
              {heroBanners.map((_, idx) => (
                <button
                  key={idx}
                  className={`w-3 h-3 rounded-full transition-all ${
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
    // Fallback to default background if no banners found (no query string — Next.js Image localPatterns)
    <div className="relative w-full h-full">
      <Image
        src="/logo/logo-5.png"
        alt="Speaker Background"
        fill
        className="object-cover"
        sizes="100vw"
        priority
      />
      <div className="absolute inset-0 bg-black/25" />
    </div>
  )}
</div>

      {/* MAIN CONTENT SECTION */}
      <div className="max-w-6xl mx-auto px-4 mt-7 ml-20 relative z-20">
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* PROFILE CARD - LEFT SIDE */}
          <div className="w-full lg:w-1/3">
            <div className="">
              <CardContent className="p-6">
                <div className="flex flex-col items-center text-center mb-6">
                  <div className="w-32 h-32 rounded-full border-4 border-orange-500 p-1 bg-white overflow-hidden mb-4">
                    <Image
                      src={speaker.image}
                      alt={speaker.name}
                      width={128}
                      height={128}
                      className="w-full h-full rounded-full object-cover"
                    />
                  </div>
                  <h2 className="text-xl font-bold text-blue-900">{speaker.name}</h2>
                  <p className="text-gray-600 text-sm mt-1">{speaker.title}</p>

                  <div className="flex justify-center gap-3 mt-4">
                    <a
                      href={speaker.socialLinks.facebook}
                      target="_blank"
                      className="w-8 h-8 flex items-center justify-center rounded-full bg-blue-600 text-white hover:bg-blue-700 text-sm"
                    >
                      <FaFacebookF />
                    </a>
                    <a
                      href={speaker.socialLinks.twitter}
                      target="_blank"
                      className="w-8 h-8 flex items-center justify-center rounded-full bg-sky-400 text-white hover:bg-sky-500 text-sm"
                    >
                      <FaTwitter />
                    </a>
                    <a
                      href={speaker.socialLinks.instagram}
                      target="_blank"
                      className="w-8 h-8 flex items-center justify-center rounded-full bg-pink-600 text-white hover:bg-pink-700 text-sm"
                    >
                      <FaInstagram />
                    </a>
                    <a
                      href={speaker.socialLinks.linkedin}
                      target="_blank"
                      className="w-8 h-8 flex items-center justify-center rounded-full bg-blue-700 text-white hover:bg-blue-800 text-sm"
                    >
                      <FaLinkedinIn />
                    </a>
                  </div>
                </div>
              </CardContent>
            </div>
          </div>

          {/* ABOUT SECTION - RIGHT SIDE */}
          <div className="w-full lg:w-2/3">
            <div className="">
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold text-blue-900 mb-4">About Me</h2>
                <p className="text-gray-700 leading-relaxed">{speaker.bio}</p>
              </CardContent>
            </div>
          </div>
        </div>
      </div>
      <hr className="border-gray-200 w-3/4 mx-auto my-4 border-t-[1px]" />

      {/* SESSION VIDEOS SECTION */}
      <div className="max-w-6xl mx-auto px-4 py-12 mt-12">
        <h2 className="text-2xl font-bold text-blue-900 mb-6">Session Videos</h2>
        {sessions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sessions.map((session) => (
              <Card key={session.id} className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  {/* Session Header */}
                  <div className="mb-3">
                    <h3 className="font-semibold text-blue-900 text-sm line-clamp-2 mb-1">
                      {session.title}
                    </h3>
                    <div className="flex flex-wrap gap-2 text-xs text-gray-600 mb-2">
                      <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                        {session.sessionType}
                      </span>
                      <span>{formatDate(session.startTime)}</span>
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
                        const videoId = extractYouTubeVideoId(youtubeUrl)
                        return (
                          <div key={index} className="group">
                            <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-200">
                              {thumbnail ? (
                                <>
                                  {/* Use regular img tag for external YouTube images */}
                                  <img
                                    src={thumbnail}
                                    alt={`YouTube thumbnail for ${session.title}`}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                  />
                                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors" />
                                  <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center transform group-hover:scale-110 transition-transform">
                                      <FaPlay className="text-white text-sm ml-1" />
                                    </div>
                                  </div>
                                </>
                              ) : (
                                <div className="absolute inset-0 flex items-center justify-center bg-gray-300">
                                  <FaYoutube className="text-red-600 text-3xl" />
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
          <Card className="border border-gray-200 shadow-sm">
            <CardContent className="p-8 text-center">
              <FaYoutube className="text-gray-400 text-3xl mx-auto mb-3" />
              <p className="text-gray-500">No session videos available.</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* PRESENTATION MATERIALS */}
      <div className="max-w-6xl mx-auto px-4 pb-12">
        <h2 className="text-2xl font-bold text-blue-900 mb-2">Presentation Materials</h2>
        <p className="text-gray-600 text-sm mb-6">Documents and slides from this speaker&apos;s sessions</p>
        {sessions.some((s) => (s.materials?.length ?? 0) > 0) ? (
          <div className="space-y-8">
            {sessions.map((session) =>
              session.materials && session.materials.length > 0 ? (
                <Card key={`mat-${session.id}`} className="border border-gray-200 shadow-sm">
                  <CardContent className="p-5">
                    <h3 className="font-semibold text-blue-900 mb-1">{session.title}</h3>
                    <p className="text-xs text-gray-500 mb-4">
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
                          className="flex flex-wrap items-center justify-between gap-2 py-2 px-3 bg-gray-50 rounded-lg border border-gray-100"
                        >
                          <span className="flex items-center gap-2 text-sm text-gray-800 min-w-0">
                            <FaFileAlt className="text-orange-500 shrink-0" />
                            <span className="truncate">{m.fileName}</span>
                            <span className="text-xs text-gray-400 shrink-0">
                              ({m.fileType})
                            </span>
                          </span>
                          {m.allowDownload !== false && m.fileUrl ? (
                            <a
                              href={m.fileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-blue-600 hover:text-blue-800 font-medium shrink-0"
                            >
                              Download
                            </a>
                          ) : (
                            <span className="text-xs text-gray-400">Preview only</span>
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
          <Card className="border border-gray-200 shadow-sm">
            <CardContent className="p-8 text-center">
              <FaFileAlt className="text-gray-400 text-3xl mx-auto mb-3" />
              <p className="text-gray-500">No presentation materials uploaded yet.</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* EVENTS SECTION */}
      <div className="max-w-6xl mx-auto px-4 pb-16">
        <Tabs defaultValue="upcoming" className="w-full">
          {/* Tabs aligned left and smaller */}
          <TabsList className="flex justify-start space-x-2 mb-4">
            <TabsTrigger
              value="upcoming"
              className="text-sm px-3 py-1 rounded-md data-[state=active]:bg-blue-600 data-[state=active]:text-white"
            >
              Upcoming
            </TabsTrigger>
            <TabsTrigger
              value="past"
              className="text-sm px-3 py-1 rounded-md data-[state=active]:bg-blue-600 data-[state=active]:text-white"
            >
              Past
            </TabsTrigger>
          </TabsList>

          {/* Upcoming Events */}
          <TabsContent value="upcoming">
            {upcomingEvents.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {upcomingEvents.map((e) => (
                  <Link
                    key={e.id}
                    href={e.id ? eventPublicPath(e) : "#"}
                    className="border hover:shadow-lg transition-shadow rounded-lg overflow-hidden block cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <CardContent className="p-0">
                      <Image
                        src={(e.image || "/images/gpex.jpg").trim()}
                        alt={e.title}
                        width={300}
                        height={180}
                        className="w-full h-32 object-cover"
                      />

                      <div className="p-4">
                        <h3 className="font-semibold text-gray-900 text-sm">{e.title}</h3>
                        <p className="text-xs text-gray-500 mt-1">{formatEventDate(e.date)}</p>

                        <p className="text-xs text-gray-500">{e.location}</p>

                        <div className="flex justify-between items-center mt-3">
                          <span className="bg-green-100 text-green-800 text-[10px] px-2 py-1 rounded">
                            {e.averageRating?.toFixed(1) || 0} ⭐
                          </span>

                          <div
                            className="flex items-center gap-2"
                            onClick={(ev) => {
                              ev.preventDefault()
                              ev.stopPropagation()
                            }}
                          >
                            <ShareButton 
                              id={e.id} 
                              title={e.title} 
                              type="event" 
                            />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 py-8">No upcoming events scheduled.</p>
            )}
          </TabsContent>

          {/* Past Events */}
          <TabsContent value="past">
            {pastEvents.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {pastEvents.map((e) => (
                  <Link
                    key={e.id}
                    href={e.id ? eventPublicPath(e) : "#"}
                    className="hover:shadow-lg transition-shadow rounded-lg overflow-hidden block border border-transparent hover:border-gray-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <CardContent className="p-0">
                      <Image
                        src={(e.image || "/images/gpex.jpg").trim()}
                        alt={e.title}
                        width={300}
                        height={180}
                        className="w-full h-32 object-cover"
                      />

                      <div className="p-4">
                        <h3 className="font-semibold text-gray-900 text-sm">{e.title}</h3>
                        <p className="text-xs text-gray-500 mt-1">{formatEventDate(e.date)}</p>

                        <p className="text-xs text-gray-500">{e.location}</p>

                        <div className="flex justify-between items-center mt-3">
                          <div
                            className="flex items-center gap-2"
                            onClick={(ev) => {
                              ev.preventDefault()
                              ev.stopPropagation()
                            }}
                          >
                            <span className="bg-green-100 text-green-800 text-[10px] px-2 py-1 rounded">
                              {e.averageRating?.toFixed(1) || 0} ⭐
                            </span>
                            <ShareButton 
                              id={e.id} 
                              title={e.title} 
                              type="event" 
                            />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 py-8">No past events found.</p>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}