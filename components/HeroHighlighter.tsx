"use client"

  import { useEffect, useState } from "react"
  import Link from "next/link"
  import { motion } from "framer-motion"
  import { ArrowRight, Calendar, ChevronRight, MapPin } from "lucide-react"
  import { apiFetch } from "@/lib/api"
import { eventPublicPath } from "@/lib/event-path"

  const FALLBACK_IMAGE = "/herosection-images/food.jpg"
  const FEATURED_EVENTS_LIMIT = 12
  const FEATURED_ROTATE_MS = 12000
  const VIP_VISIBLE_COUNT = 4
  const VIP_ROTATE_MS = 8000
  /** VIP hero: same idea as GS Swiper — horizontal translate3d, no diagonal (seconds). */
  const VIP_HERO_SLIDE_DURATION_S = 0.45

  /** True if the event has not ended yet (end date ≥ today, local calendar). */
  function isEventStillActive(startIso: string, endIso: string): boolean {
    const end = new Date(endIso || startIso)
    if (Number.isNaN(end.getTime())) return true
    const now = new Date()
    const endDay = new Date(end.getFullYear(), end.getMonth(), end.getDate())
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    return endDay.getTime() >= today.getTime()
  }

  /** Global Sources–style active VIP tab: solid #e72528, white label, soft shadow (see globalsources.com trade show strip). */
  const GS_VIP_TAB_ACTIVE =
    "bg-[#e72528] text-white shadow-[0_2px_10px_rgba(231,37,40,0.38)]"

  /** Per–VIP-event visuals (cycles by index): hero overlay, Register CTA — inspired by multi-show references. */
  type VipEventVisualTheme = {
    overlayCss: string
    registerClass: string
  }

  const VIP_EVENT_THEMES: VipEventVisualTheme[] = [
    {
      overlayCss:
        "linear-gradient(to right, rgba(61, 31, 92, 0.96) 0%, rgba(91, 33, 125, 0.85) 38%, rgba(124, 58, 237, 0.45) 62%, rgba(124, 58, 237, 0.12) 78%, transparent 100%)",
      registerClass: "bg-gradient-to-r from-rose-500 to-orange-500 hover:opacity-95",
    },
    {
      overlayCss:
        "linear-gradient(125deg, rgba(180, 60, 20, 0.95) 0%, rgba(234, 88, 12, 0.82) 32%, rgba(251, 191, 36, 0.5) 58%, rgba(253, 224, 71, 0.15) 80%, transparent 100%)",
      registerClass: "bg-gradient-to-r from-amber-500 to-yellow-400 text-gray-900 hover:opacity-95",
    },
    {
      overlayCss:
        "linear-gradient(155deg, rgba(0, 80, 80, 0.94) 0%, rgba(0, 55, 55, 0.9) 40%, rgba(0, 30, 30, 0.55) 68%, transparent 100%)",
      registerClass: "bg-gradient-to-r from-yellow-400 to-amber-600 text-gray-900 hover:opacity-95",
    },
    {
      overlayCss:
        "linear-gradient(to right, rgba(30, 64, 175, 0.94) 0%, rgba(67, 56, 202, 0.82) 38%, rgba(109, 40, 217, 0.45) 65%, transparent 100%)",
      registerClass: "bg-gradient-to-r from-fuchsia-600 to-pink-500 hover:opacity-95",
    },
    {
      overlayCss:
        "linear-gradient(to right, rgba(4, 80, 60, 0.93) 0%, rgba(13, 116, 110, 0.8) 42%, rgba(20, 184, 166, 0.35) 70%, transparent 100%)",
      registerClass: "bg-gradient-to-r from-cyan-500 to-teal-600 hover:opacity-95",
    },
  ]

  function getVipTheme(index: number): VipEventVisualTheme {
    return VIP_EVENT_THEMES[((index % VIP_EVENT_THEMES.length) + VIP_EVENT_THEMES.length) % VIP_EVENT_THEMES.length]
  }

  /** Normalized item from backend GET /api/events/featured (see {@link getFeaturedEvents}). */
  type FeaturedListEvent = {
    id: string
    title: string
    slug?: string | null
    startDate: string
    endDate: string
    bannerImage: string | null
    venue: {
      venueName?: string | null
      venueCity?: string | null
      venueCountry?: string | null
    } | null
  }

  function parseFeaturedEventsPayload(data: unknown): FeaturedListEvent[] {
    if (data == null) return []
    const raw = Array.isArray(data)
      ? data
      : typeof data === "object" && data !== null && "events" in data && Array.isArray((data as { events: unknown }).events)
        ? (data as { events: unknown[] }).events
        : []
    const out: FeaturedListEvent[] = []
    for (const item of raw) {
      if (!item || typeof item !== "object" || !("id" in item)) continue
      const o = item as Record<string, unknown>
      const id = o.id != null ? String(o.id) : ""
      if (!id) continue
      const images = o.images
      let firstImg: string | null = null
      if (Array.isArray(images) && images.length > 0) {
        const el = images[0]
        if (typeof el === "string") firstImg = el
        else if (el && typeof el === "object" && "url" in el && typeof (el as { url: unknown }).url === "string") {
          firstImg = (el as { url: string }).url
        }
      }
      out.push({
        id,
        title: typeof o.title === "string" ? o.title : "Event",
        slug: typeof o.slug === "string" ? o.slug : null,
        startDate: typeof o.startDate === "string" ? o.startDate : "",
        endDate: typeof o.endDate === "string" ? o.endDate : typeof o.startDate === "string" ? o.startDate : "",
        bannerImage: typeof o.bannerImage === "string" ? o.bannerImage : firstImg,
        venue: o.venue && typeof o.venue === "object" ? (o.venue as FeaturedListEvent["venue"]) : null,
      })
    }
    return out
  }

  function formatFeaturedEventDates(startIso: string, endIso: string): string {
    const start = new Date(startIso)
    const end = new Date(endIso || startIso)
    if (Number.isNaN(start.getTime())) return ""
    const fmt = (d: Date) =>
      d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
    return start.toDateString() === end.toDateString() ? fmt(start) : `${fmt(start)} – ${fmt(end)}`
  }

  function featuredHeroImage(ev: FeaturedListEvent): string {
    return ev.bannerImage || FALLBACK_IMAGE
  }

  function formatFeaturedVenueLine(ev: FeaturedListEvent): string {
    const v = ev.venue
    if (!v) return ""
    const cityCountry = [v.venueCity, v.venueCountry].filter(Boolean).join(", ")
    return [v.venueName, cityCountry].filter(Boolean).join(" · ")
  }

  /** Text-only rows tuned for ~8 visible categories before hover-scroll. */
  const CATEGORY_LIST_MAX_H = "max-h-[20rem] sm:max-h-[20rem] lg:max-h-[20rem]"

  const categoryScrollAreaClass =
    "min-h-0 min-w-0 overflow-visible hover:overflow-y-auto overscroll-y-contain " +
    CATEGORY_LIST_MAX_H +
    " px-0 py-0 [scrollbar-gutter:stable] [scrollbar-width:none] hover:[scrollbar-width:thin] [scrollbar-color:transparent_transparent] hover:[scrollbar-color:rgb(203,213,225)_transparent] " +
    "[&::-webkit-scrollbar]:w-0 hover:[&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent " +
    "[&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-gray-300/55 [&::-webkit-scrollbar-thumb]:hover:bg-gray-300/70"

  type BrowseCategory = {
    id: string
    name: string
    icon: string | null
    color: string
    eventCount: number
  }

  /** Shape returned by GET /api/events/vip and list endpoints (transformed event). */
  type VipEvent = {
    id: string
    title: string
    subTitle?: string | null
    subtitle?: string | null
    slug?: string | null
    startDate: string
    endDate: string
    shortDescription?: string | null
    bannerImage?: string | null
    images?: string[] | null
    category?: string[]
    /** Legacy / alternate key; prefer `youtubeVideoUrl` from API. */
    youtubeUrl?: string | null
    youtubeVideoUrl?: string | null
    tags?: string[]
    venue?: {
      venueName?: string | null
      venueCity?: string | null
      venueCountry?: string | null
    } | null
    city?: string
    country?: string
  }

  function parseVipEventsPayload(data: unknown): VipEvent[] {
    if (!data) return []
    if (Array.isArray(data)) return data as VipEvent[]
    if (typeof data === "object" && data !== null && "events" in data) {
      const ev = (data as { events?: unknown }).events
      return Array.isArray(ev) ? (ev as VipEvent[]) : []
    }
    return []
  }

  /** Date line only, e.g. "22-24 Apr. 2026" — matches reference tab `.date` styling. */
  function vipEventDateRange(e: VipEvent): string {
    const start = new Date(e.startDate)
    const end = new Date(e.endDate)
    const monthShortWithDot = (d: Date) =>
      `${d.toLocaleDateString("en-GB", { month: "short" }).replace(".", "")}.`
    const year = start.getFullYear()
    const sameDay = start.toDateString() === end.toDateString()
    const sameMonth = start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear()

    if (sameDay) {
      return `${start.getDate()} ${monthShortWithDot(start)} ${year}`
    }
    if (sameMonth) {
      return `${start.getDate()}-${end.getDate()} ${monthShortWithDot(start)} ${year}`
    }
    return `${start.getDate()} ${monthShortWithDot(start)} - ${end.getDate()} ${monthShortWithDot(end)} ${end.getFullYear()}`
  }

  function formatTabLabel(e: VipEvent): string {
    const t = e.title.trim()
    const head = t.length > 36 ? `${t.slice(0, 36)}…` : t
    return `${head} (${vipEventDateRange(e)})`
  }

  function vipTabHeadline(e: VipEvent): string {
    const preferred = (e.subTitle || e.subtitle || e.shortDescription || "").trim()
    if (preferred) return preferred
    return e.title.trim()
  }

  function pillsFromEvent(e: VipEvent): string[] {
    const fromCat = (e.category || []).filter(Boolean).slice(0, 3)
    if (fromCat.length > 0) return fromCat
    const fromTags = (e.tags || []).filter(Boolean).slice(0, 3)
    if (fromTags.length > 0) return fromTags
    return ["VIP event"]
  }

  function vipPromoYoutubeUrl(e: VipEvent): string | null {
    const raw = (e.youtubeVideoUrl ?? e.youtubeUrl)?.trim()
    return raw || null
  }

  function extractYouTubeVideoId(url: string): string | null {
    const shorts = url.match(/youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/i)
    if (shorts?.[1]) return shorts[1]
    const regex =
      /(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/
    const match = url.match(regex)
    return match ? match[1] : null
  }

  function youtubeWatchUrlToEmbedSrc(url: string): string | null {
    const id = extractYouTubeVideoId(url)
    if (!id) return null
    // Muted autoplay is required by browsers; modestbranding + controls=0 reduce YouTube chrome.
    // loop needs playlist=id for single-video embeds.
    const q = new URLSearchParams({
      autoplay: "1",
      mute: "1",
      playsinline: "1",
      rel: "0",
      modestbranding: "1",
      controls: "0",
      fs: "0",
      iv_load_policy: "3",
      loop: "1",
      playlist: id,
    })
    return `https://www.youtube.com/embed/${id}?${q.toString()}`
  }

  /** Image only (never a watch URL) — used when no valid YouTube embed. */
  function vipHeroImageUrl(e: VipEvent): string {
    return e.bannerImage || e.images?.[0] || FALLBACK_IMAGE
  }

  /**
   * “Show Opening” countdown (days / hours / minutes until event start).
   * Featured-event hero only; hidden after start time.
   */
  function ShowOpeningCountdown({ startDateIso }: { startDateIso: string }) {
    const [now, setNow] = useState(() => Date.now())
    useEffect(() => {
      setNow(Date.now())
      const id = window.setInterval(() => setNow(Date.now()), 1000)
      return () => window.clearInterval(id)
    }, [startDateIso])

    const target = new Date(startDateIso)
    const ms = target.getTime() - now
    if (Number.isNaN(target.getTime()) || ms <= 0) return null

    const totalSec = Math.floor(ms / 1000)
    const days = Math.floor(totalSec / 86400)
    const hours = Math.floor((totalSec % 86400) / 3600)
    const minutes = Math.floor((totalSec % 3600) / 60)
    const pad = (n: number) => n.toString().padStart(2, "0")

    const units: { value: string; label: string }[] = [
      { value: String(days), label: "Days" },
      { value: pad(hours), label: "Hours" },
      { value: pad(minutes), label: "Minutes" },
    ]

    return (
      <div
        className="pointer-events-none z-[3] flex w-[168px] max-w-[min(168px,calc(100vw-2.5rem))] shrink-0 flex-col gap-2 rounded-xl border border-white/20 bg-slate-950/55 p-2.5 text-white shadow-[0_12px_40px_rgba(0,0,0,0.35)] ring-1 ring-black/20 backdrop-blur-xl sm:w-[184px] sm:max-w-[184px] sm:p-3"
        role="timer"
        aria-live="polite"
        aria-label="Countdown to show opening"
      >
        <p className="mb-0 text-center text-[9px] font-bold uppercase leading-none tracking-[0.14em] text-[#e72528] sm:text-[10px]">
          Show opening
        </p>

        <div className="flex w-full items-stretch justify-center gap-1.5 sm:gap-2">
          {units.map(({ value, label }) => (
            <div
              key={label}
              className="flex min-h-[44px] min-w-0 flex-1 flex-col items-center justify-center rounded-lg bg-white px-0.5 py-1.5 shadow-sm sm:min-h-[48px] sm:py-2"
            >
              <span className="text-sm font-bold tabular-nums leading-none text-slate-900 sm:text-base">
                {value}
              </span>
              <span className="mt-1 text-[7px] font-semibold uppercase leading-none tracking-wide text-slate-500 sm:text-[8px]">
                {label}
              </span>
            </div>
          ))}
        </div>
      </div>
    )
  }

  function CategoryLinkDb({ cat }: { cat: BrowseCategory }) {
    const href = `/event?category=${encodeURIComponent(cat.name)}`

    return (
      <Link
        href={href}
        className="group flex w-full items-center justify-between px-4 py-2.5 text-left text-[15px] font-normal text-[#2d2d2d] transition-colors hover:bg-[#f7f7f7] hover:text-[#e72528]"
      >
        <span className="truncate font-normal leading-snug">{cat.name}</span>
        <ChevronRight
          strokeWidth={2}
          className="h-4 w-4 shrink-0 text-gray-400 transition-colors group-hover:text-[#e72528]"
          aria-hidden
        />
      </Link>
    )
  }

  export default function HeroHighlighter() {
    const [activeTab, setActiveTab] = useState(0)
    const [vipPageStart, setVipPageStart] = useState(0)
    const [featuredCarouselIndex, setFeaturedCarouselIndex] = useState(0)

    const [vipEvents, setVipEvents] = useState<VipEvent[]>([])
    const [vipLoading, setVipLoading] = useState(true)
    const [vipError, setVipError] = useState<string | null>(null)

    const [categories, setCategories] = useState<BrowseCategory[]>([])
    const [categoriesLoading, setCategoriesLoading] = useState(true)
    const [categoriesError, setCategoriesError] = useState<string | null>(null)

    const [featuredEvents, setFeaturedEvents] = useState<FeaturedListEvent[]>([])
    const [featuredLoading, setFeaturedLoading] = useState(true)
    const [featuredError, setFeaturedError] = useState<string | null>(null)

    /** Set only on VIP tab click: rightward tab → LTR slide, leftward → RTL slide. Cleared after animation (auto-rotate = no slide). */
    const [vipSlideUser, setVipSlideUser] = useState<"ltr" | "rtl" | null>(null)

    /** Set when changing featured slide: LTR from the right, RTL from the left (dot navigation). */
    const [featuredSlideUser, setFeaturedSlideUser] = useState<"ltr" | "rtl" | null>(null)

    const handleVipTabClick = (i: number) => {
      if (i === activeTab) return
      setVipSlideUser(i > activeTab ? "ltr" : "rtl")
      setActiveTab(i)
    }

    // Rotate VIP tabs as circular window: abcd -> bcda -> cdab ...
    useEffect(() => {
      if (vipEvents.length <= 1) return

      const interval = window.setInterval(() => {
        setVipPageStart((prev) => (prev + 1) % vipEvents.length)
      }, VIP_ROTATE_MS)

      return () => window.clearInterval(interval)
    }, [vipEvents.length])

    // Featured: auto-advance every FEATURED_ROTATE_MS; slide in from the right (no tab buttons).
    useEffect(() => {
      if (featuredEvents.length <= 1) return

      const interval = window.setInterval(() => {
        setFeaturedSlideUser("ltr")
        setFeaturedCarouselIndex((prev) => (prev + 1) % featuredEvents.length)
      }, FEATURED_ROTATE_MS)

      return () => window.clearInterval(interval)
    }, [featuredEvents.length])

    useEffect(() => {
      setFeaturedCarouselIndex(0)
    }, [featuredEvents.length])

    useEffect(() => {
      let cancelled = false
      ;(async () => {
        try {
          const vipRes = await apiFetch<unknown>("/api/events/vip", { auth: false })
          if (cancelled) return
          let list = parseVipEventsPayload(vipRes)
          if (list.length === 0) {
            const fb = await apiFetch<{ success?: boolean; events?: VipEvent[] }>(
              "/api/events?limit=24&vip=true",
              { auth: false },
            )
            if (cancelled) return
            list = Array.isArray(fb.events) ? fb.events : []
          }
          list = list.filter((e) => isEventStillActive(e.startDate, e.endDate))
          setVipEvents(list)
        } catch (e) {
          if (!cancelled) {
            setVipError(e instanceof Error ? e.message : "Failed to load VIP events")
            setVipEvents([])
          }
        } finally {
          if (!cancelled) setVipLoading(false)
        }
      })()
      return () => {
        cancelled = true
      }
    }, [])

    useEffect(() => {
      let cancelled = false
      ;(async () => {
        try {
          const data = await apiFetch<{ success?: boolean; categories?: BrowseCategory[] }>(
            "/api/events/categories/browse",
            { auth: false },
          )
          if (cancelled) return
          if (data.success !== false && Array.isArray(data.categories)) {
            setCategories(data.categories)
          } else {
            setCategories([])
          }
        } catch (e) {
          if (!cancelled) {
            setCategoriesError(e instanceof Error ? e.message : "Failed to load categories")
            setCategories([])
          }
        } finally {
          if (!cancelled) setCategoriesLoading(false)
        }
      })()
      return () => {
        cancelled = true
      }
    }, [])

    useEffect(() => {
      let cancelled = false
      ;(async () => {
        try {
          const data = await apiFetch<unknown>("/api/events/featured", { auth: false })
          if (cancelled) return
          const parsed = parseFeaturedEventsPayload(data).filter((ev) =>
            isEventStillActive(ev.startDate, ev.endDate),
          )
          setFeaturedEvents(parsed.slice(0, FEATURED_EVENTS_LIMIT))
          setFeaturedError(null)
        } catch (e) {
          if (!cancelled) {
            setFeaturedError(e instanceof Error ? e.message : "Failed to load featured events")
            setFeaturedEvents([])
          }
        } finally {
          if (!cancelled) setFeaturedLoading(false)
        }
      })()
      return () => {
        cancelled = true
      }
    }, [])

    useEffect(() => {
      if (vipEvents.length === 0) {
        setVipPageStart(0)
        setActiveTab(0)
        return
      }
      setVipPageStart((start) => (start >= vipEvents.length ? 0 : start))
    }, [vipEvents.length])

    const vipWindowIndices =
      vipEvents.length === 0
        ? []
        : Array.from({ length: VIP_VISIBLE_COUNT }, (_, i) => (vipPageStart + i) % vipEvents.length)

    const visibleVipEvents = vipWindowIndices.map((idx) => vipEvents[idx]).filter(Boolean)

    useEffect(() => {
      setActiveTab((i) => {
        if (visibleVipEvents.length === 0) return 0
        return Math.min(i, visibleVipEvents.length - 1)
      })
    }, [visibleVipEvents.length])

    const panel = visibleVipEvents[activeTab]
    const vipYoutubeEmbedSrc = panel
      ? youtubeWatchUrlToEmbedSrc(vipPromoYoutubeUrl(panel) ?? "")
      : null

    const featuredPanel =
      featuredEvents.length === 0 ? undefined : featuredEvents[featuredCarouselIndex % featuredEvents.length]
    const activeFeaturedThemeIndex =
      featuredEvents.length === 0 ? 0 : featuredCarouselIndex % featuredEvents.length
    const activeFeaturedTheme = getVipTheme(activeFeaturedThemeIndex)

    const handleFeaturedDotClick = (targetIndex: number) => {
      const n = featuredEvents.length
      if (n <= 1) return
      const cur = ((featuredCarouselIndex % n) + n) % n
      if (targetIndex === cur) return
      setFeaturedSlideUser(targetIndex > cur ? "ltr" : "rtl")
      setFeaturedCarouselIndex(targetIndex)
    }

    return (
      <section
        className="relative w-full min-w-0 bg-cover bg-center bg-no-repeat px-3 py-6 sm:px-6 sm:py-4"
        style={{
          backgroundImage:
            " url('/logo/newbg.png')",
        }}
        aria-label="Featured shows and verified exhibitors"
      >
        <div className="mx-auto w-full min-w-0 max-w-7xl space-y-6 px-3 sm:space-y-8 sm:px-6 lg:px-8">
          {/* Top strip uses same width as VIP content panel. */}
          <div className="-mb-2 -mt-2 sm:-mb-2 lg:ml-[26%] xl:ml-[24%]">
            <div className="flex flex-col items-stretch gap-4 px-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
              <div className="min-w-0 flex-1 text-center sm:text-left">
                <h2 className="line-clamp-1 text-xl font-bold leading-tight text-white sm:text-2xl lg:text-[28px]">
                  April 2026 Global Sources Hong Kong Shows
                </h2>
                <p className="mt-1.5 line-clamp-1 text-sm leading-snug text-white sm:text-base">
                  The Top Destination for Global Sourcing in AI-Integrated Consumer & Mobile Electronics and Lifestyle
                  Products
                </p>
              </div>
              <div className="flex shrink-0 justify-center sm:justify-end">
                <Link
                  href="/event"
                  className="inline-flex items-center justify-center rounded-sm bg-white px-8 py-2.5 text-sm font-semibold text-[#273dbf] shadow-sm transition hover:bg-white/95"
                >
                  Register Now
                </Link>
              </div>
            </div>
          </div>
          <div className="flex min-h-0 flex-col overflow-hidden rounded-sm bg-white mt-4 shadow-[0_4px_24px_rgba(0,0,0,0.08)] lg:flex-row lg:items-stretch lg:min-h-[410px]">
            <aside className="grid min-h-0 w-full grid-rows-[auto_minmax(0,1fr)] overflow-hidden bg-white lg:h-full lg:w-[26%] lg:min-h-0 lg:shrink-0 xl:w-[24%]">
              <h3 className="mb-0 shrink-0 px-4 py-3 text-[15px] font-bold leading-none text-[#2d2d2d]">
                Show Categories
              </h3>
              <div
                role="navigation"
                aria-label="Show categories"
                className={categoryScrollAreaClass}
                style={{ WebkitOverflowScrolling: "touch", msOverflowStyle: "scrollbar" }}
              >
                {categoriesLoading ? (
                  <p className="py-2 text-sm text-gray-500">Loading categories…</p>
                ) : categoriesError ? (
                  <p className="py-2 text-sm text-amber-700">{categoriesError}</p>
                ) : categories.length === 0 ? (
                  <p className="py-2 text-sm text-gray-500">No active categories yet.</p>
                ) : (
                  categories.map((c) => <CategoryLinkDb key={c.id} cat={c} />)
                )}
              </div>
            </aside>

            <div className="flex min-h-[min(320px,max(220px,42vmin))] min-w-0 flex-1 flex-col self-stretch sm:min-h-[380px] lg:min-h-[410px]">
              {vipLoading ? (
                <div className="flex flex-1 items-center justify-center min-h-[220px] sm:min-h-[320px] text-gray-500 text-sm">
                  Loading VIP events…
                </div>
              ) : vipError && vipEvents.length === 0 ? (
                <div className="flex flex-1 items-center justify-center min-h-[220px] sm:min-h-[320px] text-amber-800 text-sm px-4 text-center">
                  {vipError}
                </div>
              ) : vipEvents.length === 0 ? (
                <div className="flex flex-1 items-center justify-center min-h-[220px] sm:min-h-[320px] text-gray-500 text-sm">
                  No VIP events at the moment.
                </div>
              ) : (
                <>
                  {/* Global Sources trade-show strip: active tab = solid brand red, white type (globalsources.com) */}
                  <div className="tradeShow-banner overflow-visible bg-white">
                    <div className="show-tab ant-tabs ant-tabs-top">
                      <div className="overflow-x-auto overscroll-x-contain [-ms-overflow-style:none] [scrollbar-width:none] lg:overflow-visible [&::-webkit-scrollbar]:hidden">
                      <div
                        role="tablist"
                        aria-label="VIP events"
                        className="ant-tabs-nav flex w-max min-w-full gap-1 px-3 pt-1.5 pb-0 font-sans sm:gap-1.5 sm:px-5 sm:pt-2 sm:pb-0 lg:w-full lg:min-w-0 lg:gap-2 lg:px-6"
                        style={{
                          fontSize: 14,
                          lineHeight: 1.5,
                        }}
                      >
                        {visibleVipEvents.map((e, i) => {
                          const isActive = activeTab === i
                          const tabName = vipTabHeadline(e).split(/\s+/).slice(0, 6).join(" ")
                          return (
                            <button
                              key={`${vipPageStart}-${i}-${e.id}`}
                              type="button"
                              role="tab"
                              aria-selected={isActive}
                              onClick={() => handleVipTabClick(i)}
                              className={`
                                ant-tabs-tab relative min-w-0 cursor-pointer rounded-md border-0 text-center outline-none
                                transition-[flex-grow,colors,box-shadow] duration-150
                                focus-visible:ring-2 focus-visible:ring-[#e72528]/35 focus-visible:ring-offset-2
                                px-1.5 py-2 sm:px-2.5 sm:py-2.5
                                shrink-0 lg:shrink
                                ${isActive ? "lg:grow-[1.45] lg:basis-0" : "lg:grow lg:basis-0"}
                                ${
                                  isActive
                                    ? `${GS_VIP_TAB_ACTIVE} z-10 py-2.5 shadow-lg sm:px-3 sm:py-3`
                                    : "bg-white text-[rgba(0,0,0,0.65)] hover:bg-gray-50 hover:text-[rgba(0,0,0,0.85)]"
                                }
                              `}
                            >
                              <div className="tab-title flex flex-col items-center gap-0.5 sm:gap-1">
                                <div
                                  className={`name w-full max-w-full font-semibold leading-snug ${
                                    isActive
                                      ? "line-clamp-3 text-[13px] text-white sm:text-sm md:text-base lg:text-lg"
                                      : "line-clamp-2 text-[11px] font-medium text-[rgba(0,0,0,0.75)] sm:text-xs"
                                  }`}
                                >
                                  {tabName}
                                </div>
                                <div
                                  className={`date font-normal leading-tight ${
                                    isActive
                                      ? "text-[10px] text-white/95 sm:text-xs md:text-sm"
                                      : "text-[9px] text-[rgba(0,0,0,0.45)] sm:text-[10px]"
                                  }`}
                                >
                                  {vipEventDateRange(e)}
                                </div>
                              </div>
                            </button>
                          )
                        })}
                      </div>
                      </div>
                    </div>
                  </div>

                  {panel && (
                    <div className="banner-wrapper relative h-[min(320px,max(220px,42vmin))] w-full min-h-[220px] shrink-0 overflow-hidden px-3 pb-2 pt-0 sm:h-[320px] sm:min-h-0 sm:px-4 sm:pb-3">
                      {/*
                        Swiper-style horizontal slide (globalsources.com banner-swiper):
                        - click tab to the RIGHT (next index): new panel enters from the RIGHT → x 100% → 0 (like translate3d going negative on the strip)
                        - click tab to the LEFT: new panel enters from the LEFT → x -100% → 0
                        Fixed-height shell: image area does not grow/shrink with title or body copy.
                      */}
                      <motion.div
                        key={panel.id}
                        className="relative h-full min-h-0 w-full overflow-hidden rounded-sm"
                        initial={
                          vipSlideUser === "ltr"
                            ? { x: "100%" }
                            : vipSlideUser === "rtl"
                              ? { x: "-100%" }
                              : false
                        }
                        animate={{ x: 0 }}
                        transition={{
                          duration: VIP_HERO_SLIDE_DURATION_S,
                          ease: [0.25, 0.46, 0.45, 0.94],
                        }}
                        onAnimationComplete={() => setVipSlideUser(null)}
                      >
                        <div className="pointer-events-none absolute inset-0 z-0">
                          <div className="absolute inset-3 overflow-hidden rounded-sm sm:inset-4 [container-type:size]">
                            {vipYoutubeEmbedSrc ? (
                              <iframe
                                src={vipYoutubeEmbedSrc}
                                title={panel.title ? `${panel.title} — promo video` : "VIP event video"}
                                className="pointer-events-auto absolute left-1/2 top-1/2 block -translate-x-1/2 -translate-y-1/2 border-0"
                                style={{
                                  width: "max(100cqw, calc(100cqh * 16 / 9))",
                                  height: "calc(max(100cqw, calc(100cqh * 16 / 9)) * 9 / 16)",
                                }}
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                allowFullScreen
                              />
                            ) : (
                              <img
                                src={vipHeroImageUrl(panel)}
                                alt=""
                                className="absolute inset-0 block h-full w-full object-cover"
                              />
                            )}
                          </div>
                        </div>
                      </motion.div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          <div className="overflow-hidden rounded-xl bg-white shadow-[0_8px_40px_rgba(15,23,42,0.08)] ring-1 ring-slate-200/80">
            {featuredLoading ? (
              <div className="flex min-h-[200px] items-center justify-center px-4 py-12 text-sm text-slate-500">
                Loading featured events…
              </div>
            ) : featuredError && featuredEvents.length === 0 ? (
              <div className="flex min-h-[200px] items-center justify-center px-4 py-12 text-sm text-amber-800">
                {featuredError}
              </div>
            ) : featuredEvents.length === 0 ? (
              <div className="flex min-h-[200px] items-center justify-center px-4 py-12 text-sm text-slate-500">
                No featured events at the moment.
              </div>
            ) : (
              <>
                {featuredPanel && (
                  <div className="banner-wrapper relative h-[min(340px,max(200px,48vmin))] w-full min-h-[200px] min-w-0 shrink-0 overflow-hidden rounded-t-xl pb-0 pt-0 sm:h-[340px] sm:min-h-0">
                    <motion.div
                      key={featuredPanel.id}
                      className="relative h-full min-h-0 w-full min-w-0 overflow-hidden rounded-t-xl"
                      initial={
                        featuredSlideUser === "ltr"
                          ? { x: "100%" }
                          : featuredSlideUser === "rtl"
                            ? { x: "-100%" }
                            : false
                      }
                      animate={{ x: 0 }}
                      transition={{
                        duration: VIP_HERO_SLIDE_DURATION_S,
                        ease: [0.25, 0.46, 0.45, 0.94],
                      }}
                      onAnimationComplete={() => setFeaturedSlideUser(null)}
                    >
                      {/* Full-bleed image; copy + countdown sit on top */}
                      <div className="relative h-full min-h-0 w-full min-w-0">
                        <img
                          src={featuredHeroImage(featuredPanel)}
                          alt=""
                          className="absolute inset-0 h-full w-full object-cover"
                        />
                        <div
                          className="absolute inset-0"
                          style={{ background: activeFeaturedTheme.overlayCss }}
                          aria-hidden
                        />
                        <div
                          className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/70 via-black/35 to-transparent sm:from-black/55 sm:via-black/20"
                          aria-hidden
                        />

                        {/* Countdown: top-right of banner, aligned with image top */}
                        <div className="pointer-events-auto absolute right-3 top-3 z-20 sm:right-4 sm:top-3.5 lg:right-5 lg:top-4">
                          <ShowOpeningCountdown startDateIso={featuredPanel.startDate} />
                        </div>

                        {/* Copy + meta: 40% column on sm+ (row flex so width isn’t stretched); floating card on xs */}
                        <div className="relative z-[2] flex h-full min-h-0 w-full min-w-0 flex-col justify-end sm:flex-row sm:items-stretch sm:justify-start">
                          <div className="pointer-events-auto mx-3 mb-3 mt-14 w-[min(100%,28rem)] max-w-full self-center rounded-2xl border border-white/15 bg-slate-950/50 p-4 shadow-[0_20px_50px_rgba(0,0,0,0.4)] backdrop-blur-xl sm:mx-0 sm:mb-0 sm:mt-0 sm:h-full sm:w-[40%] sm:min-w-0 sm:max-w-[40%] sm:shrink-0 sm:grow-0 sm:self-auto sm:rounded-none sm:border-0 sm:border-r sm:border-white/10 sm:bg-gradient-to-b sm:from-slate-950/80 sm:via-slate-950/65 sm:to-slate-950/40 sm:p-5 sm:shadow-[8px_0_32px_rgba(0,0,0,0.2)] lg:p-6">
                            <div className="flex min-h-0 min-w-0 flex-col justify-center gap-0 text-white">
                              <div className="mb-3 flex flex-wrap items-center gap-2">
                                <span className="inline-flex items-center rounded-full bg-[#e72528] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-white shadow-md shadow-[#e72528]/25">
                                  Featured
                                </span>
                                <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-white/60">
                                  Spotlight
                                </span>
                              </div>

                              <h2 className="line-clamp-3 text-balance break-words text-lg font-bold leading-tight tracking-tight text-white sm:text-xl lg:text-2xl">
                                {featuredPanel.title}
                              </h2>

                              <div className="mt-3 space-y-2 sm:mt-4">
                                <div className="flex items-start gap-2.5 rounded-xl border border-white/10 bg-white/[0.07] px-3 py-2.5 transition-colors hover:bg-white/[0.1]">
                                  <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#e72528]/20 text-[#e72528]">
                                    <Calendar className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
                                  </span>
                                  <span className="min-w-0 pt-0.5 text-[12px] font-medium leading-snug text-white/95 sm:text-[13px]">
                                    {formatFeaturedEventDates(featuredPanel.startDate, featuredPanel.endDate) ||
                                      "Dates to be announced"}
                                  </span>
                                </div>
                                <div className="flex items-start gap-2.5 rounded-xl border border-white/10 bg-white/[0.07] px-3 py-2.5 transition-colors hover:bg-white/[0.1]">
                                  <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/10 text-white">
                                    <MapPin className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
                                  </span>
                                  <span className="min-w-0 flex-1 pt-0.5 text-[12px] font-medium leading-snug text-white/95 sm:text-[13px]">
                                    {formatFeaturedVenueLine(featuredPanel) || "Venue to be confirmed"}
                                  </span>
                                </div>
                              </div>

                              <p className="mb-0 mt-3 text-[13px] leading-relaxed text-white/70 sm:mt-4 sm:text-sm">
                                Discover exhibitors, products, and sessions for this show in one place.
                              </p>

                              <div className="mt-4 sm:mt-5">
                                <Link
                                  href={eventPublicPath(featuredPanel)}
                                  className="group inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#e72528] px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-[#e72528]/20 transition hover:bg-[#cf1f24] hover:shadow-xl hover:shadow-[#e72528]/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
                                >
                                  Explore event
                                  <ArrowRight
                                    className="h-4 w-4 shrink-0 transition-transform duration-200 group-hover:translate-x-0.5"
                                    aria-hidden
                                  />
                                </Link>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                )}
                {featuredEvents.length > 0 && (
                  <div
                    role="tablist"
                    aria-label="Featured events"
                    className="relative z-[20] flex flex-wrap items-center justify-center gap-2 border-t border-slate-100 bg-slate-50/90 px-4 py-3.5"
                  >
                    {featuredEvents.map((ev, i) => {
                      const n = featuredEvents.length
                      const active = ((featuredCarouselIndex % n) + n) % n === i
                      return (
                        <button
                          key={ev.id}
                          type="button"
                          role="tab"
                          aria-selected={active}
                          className="flex min-h-9 min-w-9 items-center justify-center rounded-full outline-none transition hover:bg-white/80 focus-visible:ring-2 focus-visible:ring-[#e72528]/45"
                          aria-label={`Show featured event ${i + 1}: ${ev.title}`}
                          onClick={() => handleFeaturedDotClick(i)}
                        >
                          <span
                            className={`block h-2.5 w-2.5 shrink-0 rounded-full transition-all duration-200 ${
                              active
                                ? "scale-110 bg-[#e72528] shadow-[0_2px_8px_rgba(231,37,40,0.5)]"
                                : "bg-slate-300 hover:bg-slate-400"
                            }`}
                            aria-hidden
                          />
                        </button>
                      )
                    })}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </section>
    )
  }  