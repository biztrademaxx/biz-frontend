"use client"

import { useState, useRef, useMemo, useEffect, useCallback, type RefObject } from "react"
import Image from "next/image"
import Link from "next/link"
import { Calendar, ChevronDown, MapPin, Menu, Search, User, X } from "lucide-react"
import { usePathname, useRouter } from "next/navigation"
import {
  clearTokens,
  markLogoutSuccessBanner,
  getCurrentUserDisplayName,
  getCurrentUserEmail,
  getCurrentUserId,
  getCurrentUserRole,
  getCurrentVisitorDashboardPath,
  isAuthenticated,

} from "@/lib/api"
import { NAVBAR_LOGO_LINK_CLASSNAME, getNavbarLogoImageProps } from "@/lib/brand-logo"
import { cn } from "@/lib/utils"
import ExploreMegaMenu from "./ExploreMegaMenu"
import NavbarCountryLabel from "./location/NavbarCountryLabel"
import { DashboardPlanBadge } from "@/components/dashboard-packages"
import { dashboardRoleFromUserRole, useDashboardPlan } from "@/hooks/use-dashboard-plan"
import { HERO_SHELL_X_PADDING_CLASS } from "@/lib/hero/hero-surface"
import { eventPublicPath } from "@/lib/event-path"
import { trackSearchClick } from "@/lib/search-click"
// import { getCurrentUserRole } from "@/lib/api";
import { motion } from "framer-motion"

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
  const [hydrated, setHydrated] = useState(false)
  const [showAccountMenu, setShowAccountMenu] = useState(false)
  const [exploreOpen, setExploreOpen] = useState(false)
  const [showMobileSearch, setShowMobileSearch] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const navShellRef = useRef<HTMLDivElement>(null)
  const exploreRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLDivElement>(null)
  const [searchQuery, setSearchQuery] = useState("")

  const [searchResults, setSearchResults] = useState<{
    events: SearchEventRow[]
    venues: SearchVenueRow[]
    speakers: SearchSpeakerRow[]
  }>({ events: [], venues: [], speakers: [] })
  const [showSearchResults, setShowSearchResults] = useState(false)
  const exploreMobileRef = useRef<HTMLButtonElement>(null)
  const desktopAccountRef = useRef<HTMLDivElement>(null)
  const mobileAccountRef = useRef<HTMLDivElement>(null)

  const brandLogo = getNavbarLogoImageProps()
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  // const profileImage = getCurrentUserRole();

  // Mark as hydrated once mounted on the client, so auth state
  // (read from localStorage/cookies via isAuthenticated()) is safe to use
  // for rendering. Without this, `hydrated` stays false forever and the
  // navbar always falls back to "Sign in / Create an account" even when
  // the user is logged in.
  useEffect(() => {
    setHydrated(true)
  }, [])

  // Re-evaluate auth after navigation
  useEffect(() => {
    if (hydrated) setShowAccountMenu(false)
  }, [pathname, hydrated])

  const authenticated = hydrated && isAuthenticated()
  const isHome = pathname === "/"
  const userId = getCurrentUserId()
  const role = getCurrentUserRole()
  const displayName = getCurrentUserDisplayName()
  const userEmail = getCurrentUserEmail()
  const dashboardPlanRole = dashboardRoleFromUserRole(role)
  const { plan: currentPlan, loading: planLoading } = useDashboardPlan(
    authenticated ? dashboardPlanRole : null,
  )
  const profileImage = "";

  const initials = hydrated
    ? (displayName || userEmail || "U")
      .trim()
      .split(/\s+/)
      .map((word) => word[0])
      .join("")
      .substring(0, 2)
      .toUpperCase()
    : "U";

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
      router.push(getCurrentVisitorDashboardPath() ?? (userId ? `/dashboard/${userId}` : "/login"))
    } else if (roleUpper === "VENUE_MANAGER") {
      router.push("/venue-dashboard")
    } else {
      router.push("/login")
    }
    setShowAccountMenu(false)
    setMobileMenuOpen(false)
  }, [router, role, userId])

  const closeSearchUi = useCallback(() => {
    setShowSearchResults(false)
    setShowMobileSearch(false)
  }, [])

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

  const handleLogout = useCallback(() => {
    markLogoutSuccessBanner()
    clearTokens()
    router.push("/login")
    setShowAccountMenu(false)
    setMobileMenuOpen(false)
  }, [router])

  const handleViewAll = useCallback(() => {
    const q = searchQuery.trim()
    if (q.length < 2) return
    router.push(`/event?search=${encodeURIComponent(q)}`)
    setSearchQuery("")
    closeSearchUi()
    setMobileMenuOpen(false)
  }, [router, searchQuery, closeSearchUi])

  const handleEventClick = useCallback(
    (ev: { id: string; slug?: string | null }, position?: number) => {
      trackSearchClick({
        eventId: ev.id,
        query: searchQuery,
        position,
        listingSource: "navbar",
      })
      router.push(eventPublicPath(ev))
      setSearchQuery("")
      closeSearchUi()
      setMobileMenuOpen(false)
      setExploreOpen(false)
    },
    [router, closeSearchUi, searchQuery],
  )

  // Debounced search — fires a request ~300ms after the user stops typing,
  // and aborts any in-flight request when the query changes again.
  const handleSearchInput = useCallback((value: string) => {
    setSearchQuery(value)
    const query = value.trim()

    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (abortRef.current) abortRef.current.abort()

    if (query.length < 2) {
      setSearchResults({ events: [], venues: [], speakers: [] })
      setShowSearchResults(false)
      setIsSearching(false)
      return
    }

    setShowSearchResults(true)
    setIsSearching(true)

    debounceRef.current = setTimeout(() => {
      const controller = new AbortController()
      abortRef.current = controller

      fetch(`/api/search?q=${encodeURIComponent(query)}`, { signal: controller.signal })
        .then((res) => {
          if (!res.ok) throw new Error("Search request failed")
          return res.json() as Promise<SearchApiResponse>
        })
        .then((data) => {
          setSearchResults({
            events: data.events ?? [],
            venues: data.venues ?? [],
            speakers: data.speakers ?? [],
          })
        })
        .catch((err: unknown) => {
          if (err instanceof DOMException && err.name === "AbortError") return
          console.error("Search error:", err)
          setSearchResults({ events: [], venues: [], speakers: [] })
        })
        .finally(() => {
          setIsSearching(false)
        })
    }, 300)
  }, [])

  // Cleanup any pending debounce/in-flight request on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
      if (abortRef.current) abortRef.current.abort()
    }
  }, [])

  const searchResultItems = useMemo(() => {
    const events = searchResults.events.map((ev) => ({ kind: "event" as const, ev }))
    const venues = searchResults.venues.map((v) => ({ kind: "venue" as const, v }))
    return [...events.slice(0, 6), ...venues.slice(0, 4)]
  }, [searchResults.events, searchResults.venues])

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const t = event.target as Node
      if (mobileMenuOpen && !navShellRef.current?.contains(t)) {
        setMobileMenuOpen(false)
      }
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
      const inSearch = searchRef.current?.contains(t)
      if (!inSearch) {
        setShowSearchResults(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [mobileMenuOpen])

  const navLinkClass = isHome
    ? "font-sans font-medium text-[#1a093f] transition-colors hover:text-[#bc1c4f]"
    : "font-sans font-medium text-gray-700 transition-colors hover:text-gray-900"

  const mobileNavItemClass = isHome
    ? "text-[#1a093f] hover:bg-white/40"
    : "text-gray-800 hover:bg-gray-50"

  const mobileMenuItemClass = cn(
    "block px-4 py-3 text-sm font-medium",
    mobileNavItemClass,
  )

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
        searchResultItems.map((item, index) =>
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
              onClick={() => handleEventClick(item.ev, index)}
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
        {dashboardPlanRole ? (
          <div className="mt-2">
            <DashboardPlanBadge plan={currentPlan} loading={planLoading} size="sm" />
          </div>
        ) : null}
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

  const accountButton = (ref: RefObject<HTMLDivElement | null>) => (
    <div className="relative inline-block text-left" ref={ref}>
      <button
        type="button"
        onClick={() => setShowAccountMenu((v) => !v)}
        className="h-10 w-10 overflow-hidden rounded-full bg-[#002C71] focus:outline-none"
      >
        {profileImage ? (
          <Image
            src={profileImage}
            alt={displayName || "Profile"}
            width={40}
            height={40}
            className="h-full w-full object-cover"
          />
        ) : authenticated ? (
          <div className="flex h-full w-full items-center justify-center bg-[#002C71] text-sm font-semibold text-white">
            {initials}
          </div>
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-[#002C71] text-white">
            <User className="h-5 w-5" />
          </div>
        )}
      </button>
      {showAccountMenu ? (
        <div
          className="absolute right-0 z-[100] mt-2 w-56 rounded-lg border border-gray-200 bg-white py-1 shadow-lg"
          role="menu"
        >
          {accountMenuInner}
        </div>
      ) : null}
    </div>
  )

  const centerNavLinks = (
    <>
      <Link href="/organizers" className={navLinkClass}>
        <span className="text-sm font-medium">Organizers</span>
      </Link>
      <Link href="/venues" className={navLinkClass}>
        <span className="text-sm font-medium">Venues</span>
      </Link>
      <Link href="/exhibitor" className={navLinkClass}>
        <span className="text-sm font-medium">Exhibitors</span>
      </Link>
      <Link href="/speakers" className={navLinkClass}>
        <span className="text-sm font-medium">Speakers</span>
      </Link>
    </>
  )

  return (
    <>
      

      <nav
        className={cn(
          isHome ? "relative z-50" : "sticky top-0 z-50",
          // Background is now white on every page (home included) so the
          // navbar looks consistent regardless of route.
          "overflow-visible border-b-0 bg-white shadow-[0_4px_12px_rgba(0,0,0,0.12)]",
        )}
      >
        <div
          ref={navShellRef}
          className={cn(
            "relative z-10 mx-auto w-full",
            // Use the same horizontal padding/width on every page as the
            // home page so alignment stays consistent across the site.
            HERO_SHELL_X_PADDING_CLASS,
          )}
        >
          {/* Mobile / tablet — hamburger, logo, location, account */}
          <div className="flex h-[5.5rem] min-h-[5.5rem] items-center justify-between gap-2 lg:hidden">
            <div className="flex min-w-0 flex-1 items-center gap-1.5 sm:gap-2">
              <button
                type="button"
                className={cn(
                  "shrink-0 rounded-md p-2",
                  isHome
                    ? "text-[#1a093f] hover:bg-white/40"
                    : "text-gray-700 hover:bg-gray-100 hover:text-gray-900",
                )}
                onClick={() => setMobileMenuOpen((v) => !v)}
                aria-expanded={mobileMenuOpen}
                aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
              >
                {mobileMenuOpen ? <X className="h-6 w-6" strokeWidth={2} /> : <Menu className="h-6 w-6" strokeWidth={2} />}
              </button>
              <Link href="/" className={NAVBAR_LOGO_LINK_CLASSNAME}>
                <Image {...brandLogo} alt="BizTradeFairs.com" priority />
              </Link>
              <div className="ml-3 flex items-end pt-4">
                <NavbarCountryLabel />
              </div>
            </div>
            <button
              type="button"
              className={cn(
                "shrink-0 rounded-md p-2",
                isHome
                  ? "text-[#1a093f] hover:bg-white/40"
                  : "text-gray-700 hover:bg-gray-100 hover:text-gray-900",
              )}
              onClick={() => setShowMobileSearch((v) => !v)}
              aria-expanded={showMobileSearch}
              aria-label={showMobileSearch ? "Close search" : "Open search"}
            >
              <Search className="h-5 w-5" strokeWidth={2} />
            </button>
            <div className="flex shrink-0 items-center">{accountButton(mobileAccountRef)}</div>
          </div>

          {/* Mobile search row — toggled by the search icon above */}
          {showMobileSearch ? (
            <div className="pb-3 lg:hidden" ref={searchRef}>
              <div className="relative">
                <div
                  className={`group flex w-full items-stretch rounded-none border transition-[border-color,box-shadow,background-color] duration-150 ${showSearchResults
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
                    autoFocus
                  />
                </div>
                {showSearchResults && (
                  <div className="absolute left-0 right-0 top-full z-[100] mt-1 max-h-80 overflow-hidden rounded-none border border-gray-300 bg-white shadow-[0_8px_24px_rgba(0,0,0,0.08)]">
                    <div className="max-h-72 overflow-y-auto">{renderSearchHits(true)}</div>
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
          ) : null}

          {/* Desktop — left | centered | right (reference layout) */}
          <div className="relative hidden h-[5.5rem] min-h-[5.5rem] w-full lg:flex lg:items-center">
            {/* Left — logo, home, location, explore */}
            <div className="relative z-10 flex min-w-0 items-center gap-2 xl:gap-3">
              <Link href="/" className={NAVBAR_LOGO_LINK_CLASSNAME}>
                <Image {...brandLogo} alt="BizTradeFairs.com" priority />
              </Link>
              <div className="hidden min-w-0 shrink-0 md:flex items-center self-end pb-3 ml-2">
                <NavbarCountryLabel />
              </div>
            </div>

            {/* Middle — search (desktop only) */}
            <div className="relative z-10 mx-6 hidden min-w-0 flex-1 justify-center xl:flex">
              <div className="relative w-full max-w-md xl:max-w-lg" ref={searchRef}>
                <div
                  className={`group flex w-full items-stretch rounded-none border transition-[border-color,box-shadow,background-color] duration-150 ${showSearchResults
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

            {/* Right — CTAs + account */}
            <div className="relative z-10 flex items-center gap-6">
              {centerNavLinks}
              <Link href="/event" className={navLinkClass}>
                <span className="text-sm whitespace-nowrap">Top 100 Must Visit</span>
              </Link>
              <Link href="/organizer-signup" className={navLinkClass}>
                <span className="text-sm whitespace-nowrap">Add Event</span>
              </Link>

              {accountButton(desktopAccountRef)}

            </div>
          </div>

          {/* Mobile drawer */}
          {mobileMenuOpen ? (
            <div
              className={cn(
                "max-h-[min(70vh,480px)] overflow-y-auto py-2 lg:hidden",
                isHome ? "border-t-0 bg-white/35 backdrop-blur-md" : "border-t border-gray-200 bg-white",
              )}
            >
              {/* Explore - Mobile */}
              <button
                ref={exploreMobileRef}
                type="button"
                className={cn(
                  "flex w-full items-center justify-between px-4 py-3 text-left text-sm font-medium",
                  mobileNavItemClass,
                )}
                onClick={() => {
                  setExploreOpen(true)
                  setMobileMenuOpen(false)
                }}
              >
                Explore
                <ChevronDown className={cn("h-4 w-4", isHome ? "text-[#1a093f]/70" : "text-gray-500")} />
              </button>

              {/* Country Label - Mobile */}
              <div className="border-b border-gray-100 px-4 py-3 sm:hidden">
                <NavbarCountryLabel className="w-full" />
              </div>

              {/* Mobile Navigation Links */}
              <Link
                href="/organizers"
                className={mobileMenuItemClass}
                onClick={() => setMobileMenuOpen(false)}
              >
                Organizers
              </Link>
              <Link
                href="/venues"
                className={mobileMenuItemClass}
                onClick={() => setMobileMenuOpen(false)}
              >
                Venues
              </Link>
              <Link
                href="/exhibitor"
                className={mobileMenuItemClass}
                onClick={() => setMobileMenuOpen(false)}
              >
                Exhibitors
              </Link>
              <Link
                href="/speakers"
                className={mobileMenuItemClass}
                onClick={() => setMobileMenuOpen(false)}
              >
                Speakers
              </Link>

              {/* Divider */}
              <div className="border-t border-gray-100 my-2"></div>

              {/* Additional Mobile Links */}
              <Link
                href="/event"
                className={mobileMenuItemClass}
                onClick={() => setMobileMenuOpen(false)}
              >
                Top 100 Must Visit
              </Link>
              <Link
                href="/organizer-signup"
                className={mobileMenuItemClass}
                onClick={() => setMobileMenuOpen(false)}
              >
                Add Event
              </Link>

              {/* Mobile Account Actions */}
              {authenticated ? (
                <>
                  <button
                    type="button"
                    onClick={handleDashboard}
                    className={cn("block w-full px-4 py-3 text-left text-sm font-medium", mobileNavItemClass)}
                  >
                    Dashboard
                  </button>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="block w-full px-4 py-3 text-left text-sm font-medium text-red-600 hover:bg-gray-50"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className={mobileMenuItemClass}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Sign in
                  </Link>
                  <Link
                    href="/signup"
                    className={mobileMenuItemClass}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Create an account
                  </Link>
                </>
              )}
            </div>
          ) : null}
        </div>

        <ExploreMegaMenu open={exploreOpen} onClose={() => setExploreOpen(false)} />
      </nav>
    </>
  )
}