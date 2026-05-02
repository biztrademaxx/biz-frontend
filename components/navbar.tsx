"use client"

import { useState, useRef, useEffect, useCallback, useMemo } from "react"
import Link from "next/link"
import { Calendar, ChevronDown, MapPin, Menu, Search, User, X } from "lucide-react"
import { usePathname, useRouter } from "next/navigation"
import {
  clearTokens,
  getCurrentUserDisplayName,
  getCurrentUserEmail,
  getCurrentUserId,
  getCurrentUserRole,
  isAuthenticated,
} from "@/lib/api"
import { eventPublicPath } from "@/lib/event-path"
import ExploreMegaMenu from "./ExploreMegaMenu"

type SearchEventRow = {
  id: string
  slug?: string | null
  title: string
  startDate: string
  isVIP?: boolean
  isFeatured?: boolean
  venue?: { venueCity?: string | null; venueCountry?: string | null }
  type?: string
}

type SearchVenueRow = {
  id: string
  venueName: string
  location?: string
  type?: string
}

type SearchSpeakerRow = {
  id: string
  displayName: string
  type?: string
}

type SearchApiResponse = {
  events?: SearchEventRow[]
  venues?: SearchVenueRow[]
  speakers?: SearchSpeakerRow[]
  allResults?: unknown[]
}

export default function Navbar() {
  const router = useRouter()
  const pathname = usePathname()

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [showMobileSearch, setShowMobileSearch] = useState(false)

  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<{
    events: SearchEventRow[]
    venues: SearchVenueRow[]
    speakers: SearchSpeakerRow[]
  }>({ events: [], venues: [], speakers: [] })
  const [showSearchResults, setShowSearchResults] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [hydrated, setHydrated] = useState(false)
  const [showAccountMenu, setShowAccountMenu] = useState(false)
  const [exploreOpen, setExploreOpen] = useState(false)

  const mobileMenuRef = useRef<HTMLDivElement>(null)
  const exploreRef = useRef<HTMLDivElement>(null)
  const exploreMobileRef = useRef<HTMLButtonElement>(null)
  const searchRef = useRef<HTMLDivElement>(null)
  const mobileSearchRef = useRef<HTMLDivElement>(null)
  const desktopAccountRef = useRef<HTMLDivElement>(null)
  const mobileAccountRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  const closeSearchUi = useCallback(() => {
    setShowSearchResults(false)
    setShowMobileSearch(false)
  }, [])

  const handleEventClick = useCallback(
    (ev: { id: string; slug?: string | null }) => {
      router.push(eventPublicPath(ev))
      setSearchQuery("")
      closeSearchUi()
      setMobileMenuOpen(false)
      setExploreOpen(false)
    },
    [router, closeSearchUi],
  )

  const handleVenueClick = useCallback(
    (venueId: string) => {
      router.push(`/venue/${venueId}`)
      setSearchQuery("")
      closeSearchUi()
      setMobileMenuOpen(false)
      setExploreOpen(false)
    },
    [router, closeSearchUi],
  )

  const handleViewAll = useCallback(() => {
    const q = searchQuery.trim()
    if (q.length < 2) return
    router.push(`/event?search=${encodeURIComponent(q)}`)
    setSearchQuery("")
    closeSearchUi()
    setMobileMenuOpen(false)
  }, [router, searchQuery, closeSearchUi])

  const handleSearchInput = useCallback((value: string) => {
    setSearchQuery(value)
    const query = value.trim()

    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (abortRef.current) abortRef.current.abort()

    if (query.length < 2) {
      setSearchResults({ events: [], venues: [], speakers: [] })
      setShowSearchResults(false)
      return
    }

    debounceRef.current = setTimeout(async () => {
      abortRef.current = new AbortController()
      setIsSearching(true)
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}&limit=8`, {
          signal: abortRef.current.signal,
        })
        if (!res.ok) return
        const data = (await res.json()) as SearchApiResponse
        setSearchResults({
          events: Array.isArray(data.events) ? data.events : [],
          venues: Array.isArray(data.venues) ? data.venues : [],
          speakers: Array.isArray(data.speakers) ? data.speakers : [],
        })
        setShowSearchResults(true)
      } catch (e: unknown) {
        if (e instanceof Error && e.name !== "AbortError") {
          console.error("Search error:", e)
        }
      } finally {
        setIsSearching(false)
      }
    }, 400)
  }, [])

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
      if (abortRef.current) abortRef.current.abort()
    }
  }, [])

  useEffect(() => {
    setHydrated(true)
  }, [])

  // Re-evaluate auth after navigation (e.g. return from login)
  useEffect(() => {
    if (hydrated) setShowAccountMenu(false)
  }, [pathname, hydrated])

  const authenticated = hydrated && isAuthenticated()
  const userId = getCurrentUserId()
  const role = getCurrentUserRole()
  const displayName = getCurrentUserDisplayName()
  const userEmail = getCurrentUserEmail()

  const handleDashboard = useCallback(() => {
    const roleUpper = (role || "").toUpperCase()
    if (roleUpper === "ORGANIZER") {
      router.push(userId ? `/organizer-dashboard/${userId}` : "/organizer-signup")
    } else if (roleUpper === "SPEAKER") {
      router.push(userId ? `/speaker-dashboard/${userId}` : "/login")
    } else if (roleUpper === "EXHIBITOR") {
      router.push(userId ? `/exhibitor-dashboard/${userId}` : "/login")
    } else if (roleUpper === "SUPER_ADMIN" || roleUpper === "SUB_ADMIN") {
      router.push("/admin-dashboard")
    } else if (roleUpper === "ATTENDEE") {
      router.push(userId ? `/dashboard/${userId}` : "/login")
    } else if (roleUpper === "VENUE_MANAGER") {
      router.push(userId ? `/venue-dashboard/${userId}` : "/venue-dashboard")
    } else {
      router.push("/login")
    }
    setShowAccountMenu(false)
    setMobileMenuOpen(false)
  }, [router, role, userId])

  const handleLogout = useCallback(() => {
    clearTokens()
    router.push("/login")
    setShowAccountMenu(false)
    setMobileMenuOpen(false)
  }, [router])

  const searchResultItems = useMemo(() => {
    const events = searchResults.events.map((ev) => ({ kind: "event" as const, ev }))
    const venues = searchResults.venues.map((v) => ({ kind: "venue" as const, v }))
    return [...events.slice(0, 6), ...venues.slice(0, 4)]
  }, [searchResults.events, searchResults.venues])

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        setMobileMenuOpen(false)
      }
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchResults(false)
      }
      if (mobileSearchRef.current && !mobileSearchRef.current.contains(event.target as Node)) {
        setShowSearchResults(false)
      }
      const t = event.target as Node
      const inDesktopAccount = desktopAccountRef.current?.contains(t)
      const inMobileAccount = mobileAccountRef.current?.contains(t)
      if (!inDesktopAccount && !inMobileAccount) {
        setShowAccountMenu(false)
      }
      const inDesktopExplore = exploreRef.current?.contains(t)
      const inMobileExploreBtn = exploreMobileRef.current?.contains(t)
      const mega = typeof document !== "undefined" ? document.getElementById("explore-mega-root") : null
      const inMega = mega?.contains(t)
      if (!inDesktopExplore && !inMobileExploreBtn && !inMega) {
        setExploreOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const navLinkClass = "text-gray-700 transition-colors hover:text-gray-900"

  const renderSearchHits = (compact: boolean) => (
    <>
      {isSearching ? (
        <div className={compact ? "p-3 text-center text-sm text-gray-600" : "p-4 text-center text-sm text-gray-600"}>
          Searching…
        </div>
      ) : searchResultItems.length === 0 ? (
        <div className={compact ? "p-3 text-center text-sm text-gray-600" : "p-4 text-center text-sm text-gray-600"}>
          No results found. Try different keywords.
        </div>
      ) : (
        searchResultItems.map((item) =>
          item.kind === "venue" ? (
            <button
              key={`v-${item.v.id}`}
              type="button"
              onClick={() => handleVenueClick(item.v.id)}
              className="flex w-full items-start gap-3 border-b border-gray-100 p-3 text-left hover:bg-gray-50"
            >
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-gray-900">{item.v.venueName}</p>
                {item.v.location ? <p className="mt-0.5 text-sm text-gray-600">{item.v.location}</p> : null}
                <p className="mt-0.5 text-xs font-medium text-green-700">Venue</p>
              </div>
            </button>
          ) : (
            <button
              key={`e-${item.ev.id}`}
              type="button"
              onClick={() => handleEventClick(item.ev)}
              className="flex w-full items-start gap-3 border-b border-gray-100 p-3 text-left hover:bg-gray-50"
            >
              <Calendar className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-gray-900">{item.ev.title}</p>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-gray-600">
                  {item.ev.venue?.venueCity && item.ev.venue?.venueCountry ? (
                    <span>
                      {item.ev.venue.venueCity}, {item.ev.venue.venueCountry}
                    </span>
                  ) : (
                    <span>Online event</span>
                  )}
                  {item.ev.startDate ? (
                    <span className="text-xs text-gray-500">{new Date(item.ev.startDate).toLocaleDateString()}</span>
                  ) : null}
                </div>
              </div>
            </button>
          ),
        )
      )}
    </>
  )

  const accountMenuInner = authenticated ? (
    <>
      <div className="border-b border-gray-100 px-4 py-3">
        <p className="truncate text-sm font-semibold text-gray-900">{displayName}</p>
        {userEmail ? <p className="truncate text-xs text-gray-500">{userEmail}</p> : null}
      </div>
      <button
        type="button"
        role="menuitem"
        onClick={handleDashboard}
        className="block w-full px-4 py-2.5 text-left text-sm text-gray-700 transition-colors hover:bg-gray-50"
      >
        Dashboard
      </button>
      <button
        type="button"
        role="menuitem"
        onClick={handleLogout}
        className="block w-full px-4 py-2.5 text-left text-sm text-red-600 transition-colors hover:bg-red-50"
      >
        Logout
      </button>
    </>
  ) : (
    <>
      <Link
        href="/login"
        className="block px-4 py-2.5 text-sm text-gray-700 transition-colors hover:bg-gray-50"
        onClick={() => setShowAccountMenu(false)}
      >
        Sign in
      </Link>
      <Link
        href="/signup"
        className="block px-4 py-2.5 text-sm text-gray-700 transition-colors hover:bg-gray-50"
        onClick={() => setShowAccountMenu(false)}
      >
        Create an account
      </Link>
    </>
  )

  return (
    <nav className="sticky top-0 z-50 bg-white shadow-[0_4px_12px_rgba(0,0,0,0.12)]">
      <div className="mx-auto max-w-7xl px-3 sm:px-4 lg:px-6">
        <div className="flex h-[5.5rem] min-h-[5.5rem] items-center justify-between gap-2 sm:gap-3">
          <div className="flex min-w-0 items-center gap-3 sm:gap-4">
            <button
              type="button"
              className="rounded-md p-2 text-gray-700 hover:bg-gray-100 hover:text-gray-900 lg:hidden"
              onClick={() => setMobileMenuOpen((v) => !v)}
              aria-expanded={mobileMenuOpen}
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" strokeWidth={2} /> : <Menu className="h-6 w-6" strokeWidth={2} />}
            </button>
            <Link
              href="/"
              className="flex min-w-0 max-w-[300px] shrink-0 items-center sm:max-w-[360px] lg:max-w-[440px]"
            >
              {/* SVG shipped in public/images — avoids 404 on missing PNG */}
              <img
                src="/images/biztradefairs.svg"
                alt="BizTradeFairs.com"
                width={440}
                height={120}
                className="h-[52px] w-full max-h-[52px] object-contain object-left sm:h-[60px] sm:max-h-[60px] lg:h-[72px] lg:max-h-[72px]"
                fetchPriority="high"
              />
            </Link>
            <div className="relative ml-3 shrink-0 sm:ml-4 lg:ml-5" ref={exploreRef}>
              <button
                type="button"
                className={`inline-flex items-center gap-0.5 rounded-md px-1 py-1 text-sm lg:px-0 lg:py-0 ${navLinkClass}`}
                onClick={() => setExploreOpen((v) => !v)}
                aria-expanded={exploreOpen}
                aria-haspopup="true"
                aria-label="Explore menu"
              >
                Explore
                <ChevronDown className={`h-4 w-4 transition-transform ${exploreOpen ? "rotate-180" : ""}`} />
              </button>
            </div>
          </div>

          <div className="hidden min-w-0 flex-1 justify-center px-2 lg:flex">
            <div className="relative w-full max-w-md xl:max-w-lg" ref={searchRef}>
              <div
                className={`group flex w-full items-stretch rounded-none border transition-[border-color,box-shadow,background-color] duration-150 ${
                  showSearchResults
                    ? "border-[#002C71]/35 bg-white shadow-[0_1px_0_rgba(0,44,113,0.06)]"
                    : "border-gray-300 bg-gray-50 hover:border-gray-400"
                } focus-within:border-[#002C71] focus-within:bg-white focus-within:shadow-[0_0_0_1px_rgba(0,44,113,0.12)]`}
              >
                <span
                  className="flex shrink-0 items-center border-r border-gray-200/90 bg-gray-100/60 px-3 text-gray-500 transition-colors group-focus-within:border-[#002C71]/20 group-focus-within:bg-white group-focus-within:text-[#002C71]"
                  aria-hidden
                >
                  <Search className="h-4 w-4" strokeWidth={2} />
                </span>
                <input
                  type="text"
                  placeholder="Search events, venues, speakers…"
                  className="min-w-0 flex-1 rounded-none border-0 bg-transparent py-2.5 pl-3 pr-3 text-sm text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-0"
                  value={searchQuery}
                  onChange={(e) => handleSearchInput(e.target.value)}
                  onFocus={() => searchQuery.trim().length >= 2 && setShowSearchResults(true)}
                  onKeyDown={(e) => e.key === "Enter" && handleViewAll()}
                  aria-label="Search"
                />
              </div>
              {showSearchResults && (
                <div className="absolute left-0 right-0 top-full z-[100] mt-1 max-h-80 overflow-hidden rounded-none border border-gray-300 bg-white shadow-[0_8px_24px_rgba(0,0,0,0.08)]">
                  <div className="max-h-72 overflow-y-auto">{renderSearchHits(false)}</div>
                  <div className="border-t border-gray-200 bg-gray-50/80 p-2">
                    <button
                      type="button"
                      onClick={handleViewAll}
                      className="w-full py-2 text-center text-sm font-semibold text-[#002C71] transition-colors hover:text-blue-900"
                    >
                      View all events →
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="hidden shrink-0 items-center gap-6 lg:flex">
            <Link href="/event" className={navLinkClass}>
              <span className="text-sm">Top 100 Must Visit</span>
            </Link>
            <Link href="/speakers" className={navLinkClass}>
              <span className="text-sm">Speakers</span>
            </Link>
            <Link href="/organizer-signup" className={navLinkClass}>
              <span className="text-sm">Add Event</span>
            </Link>
            <div className="relative inline-block text-left" ref={desktopAccountRef}>
              <button
                type="button"
                onClick={() => setShowAccountMenu((v) => !v)}
                className="rounded-full bg-[#002C71] p-2 text-white transition-colors hover:bg-[#001a48] focus:outline-none"
                aria-expanded={showAccountMenu}
                aria-haspopup="menu"
                aria-label="Account menu"
              >
                <User className="h-5 w-5" strokeWidth={2} />
              </button>
              {showAccountMenu ? (
                <div
                  className="absolute right-0 z-[100] mt-2 hidden w-56 rounded-lg border border-gray-200 bg-white py-1 shadow-lg lg:block"
                  role="menu"
                >
                  {accountMenuInner}
                </div>
              ) : null}
            </div>
          </div>

          <div className="flex items-center gap-2 lg:hidden">
            <button
              type="button"
              onClick={() => setShowMobileSearch((v) => !v)}
              className="rounded-full p-2 text-gray-700 hover:bg-gray-100 hover:text-gray-900"
              aria-label="Search"
            >
              <Search className="h-5 w-5" strokeWidth={2} />
            </button>
            <div className="relative inline-block text-left" ref={mobileAccountRef}>
              <button
                type="button"
                onClick={() => setShowAccountMenu((v) => !v)}
                className="rounded-full bg-[#002C71] p-2 text-white transition-colors hover:bg-[#001a48]"
                aria-expanded={showAccountMenu}
                aria-label="Account menu"
              >
                <User className="h-5 w-5" strokeWidth={2} />
              </button>
              {showAccountMenu ? (
                <div
                  className="absolute right-0 z-[100] mt-2 w-56 rounded-lg border border-gray-200 bg-white py-1 shadow-lg lg:hidden"
                  role="menu"
                >
                  {accountMenuInner}
                </div>
              ) : null}
            </div>
          </div>
        </div>

        {showMobileSearch && (
          <div ref={mobileSearchRef} className="border-t border-gray-100 py-3 lg:hidden">
            <div className="relative">
              <div
                className={`group flex w-full items-stretch rounded-none border transition-[border-color,box-shadow,background-color] duration-150 ${
                  showSearchResults
                    ? "border-[#002C71]/35 bg-white shadow-[0_1px_0_rgba(0,44,113,0.06)]"
                    : "border-gray-300 bg-gray-50 hover:border-gray-400"
                } focus-within:border-[#002C71] focus-within:bg-white focus-within:shadow-[0_0_0_1px_rgba(0,44,113,0.12)]`}
              >
                <span
                  className="flex shrink-0 items-center border-r border-gray-200/90 bg-gray-100/60 px-3 text-gray-500 transition-colors group-focus-within:border-[#002C71]/20 group-focus-within:bg-white group-focus-within:text-[#002C71]"
                  aria-hidden
                >
                  <Search className="h-5 w-5" strokeWidth={2} />
                </span>
                <input
                  type="text"
                  placeholder="Search events, venues, speakers…"
                  className="min-w-0 flex-1 rounded-none border-0 bg-transparent py-2.5 pl-3 pr-3 text-[15px] text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-0"
                  value={searchQuery}
                  onChange={(e) => handleSearchInput(e.target.value)}
                  onFocus={() => searchQuery.trim().length >= 2 && setShowSearchResults(true)}
                  onKeyDown={(e) => e.key === "Enter" && handleViewAll()}
                  aria-label="Search"
                />
              </div>
              {showSearchResults && (
                <div className="absolute left-0 right-0 top-full z-[100] mt-1 max-h-72 overflow-y-auto rounded-none border border-gray-300 bg-white shadow-[0_8px_24px_rgba(0,0,0,0.08)]">
                  {renderSearchHits(true)}
                  <button
                    type="button"
                    onClick={handleViewAll}
                    className="w-full border-t border-gray-200 bg-gray-50/80 py-2.5 text-center text-sm font-semibold text-[#002C71] transition-colors hover:text-blue-900"
                  >
                    View all events →
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {mobileMenuOpen && (
          <div ref={mobileMenuRef} className="space-y-0 border-t border-gray-200 bg-[#f3f2f0] py-2 lg:hidden">
            <button
              ref={exploreMobileRef}
              type="button"
              className="flex w-full items-center justify-between px-4 py-2.5 text-left text-sm font-semibold text-gray-800 hover:bg-white/80"
              onClick={() => {
                setExploreOpen((v) => !v)
                setMobileMenuOpen(false)
              }}
            >
              Explore
              <ChevronDown className="h-4 w-4" />
            </button>
            <Link
              href="/event"
              className="block px-4 py-2.5 text-sm font-semibold text-gray-800 hover:bg-white/80"
              onClick={() => setMobileMenuOpen(false)}
            >
              Top 100 Must Visit
            </Link>
            <Link
              href="/speakers"
              className="block px-4 py-2.5 text-sm font-semibold text-gray-800 hover:bg-white/80"
              onClick={() => setMobileMenuOpen(false)}
            >
              Speakers
            </Link>
            <Link
              href="/event"
              className="block px-4 py-2.5 text-sm font-semibold text-gray-800 hover:bg-white/80"
              onClick={() => setMobileMenuOpen(false)}
            >
              Add Event
            </Link>
            <Link
              href="/event"
              className="block px-4 py-2.5 text-sm font-semibold text-gray-800 hover:bg-white/80"
              onClick={() => setMobileMenuOpen(false)}
            >
              Exhibitions
            </Link>
            <Link
              href="/organizer-signup"
              className="block px-4 py-2.5 text-sm font-semibold text-gray-800 hover:bg-white/80"
              onClick={() => setMobileMenuOpen(false)}
            >
              Buyer Services
            </Link>
            <Link
              href="/venues"
              className="block px-4 py-2.5 text-sm font-semibold text-gray-800 hover:bg-white/80"
              onClick={() => setMobileMenuOpen(false)}
            >
              Supplier Services
            </Link>
            <Link
              href="/about"
              className="block px-4 py-2.5 text-sm font-semibold text-gray-800 hover:bg-white/80"
              onClick={() => setMobileMenuOpen(false)}
            >
              About Us
            </Link>
          </div>
        )}
      </div>

      <ExploreMegaMenu open={exploreOpen} onClose={() => setExploreOpen(false)} />
    </nav>
  )
}