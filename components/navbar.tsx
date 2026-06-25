"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import Image from "next/image"
import Link from "next/link"
import { ChevronDown, Menu, User, X } from "lucide-react"
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
import ExploreMegaMenu from "./ExploreMegaMenu"
import NavbarCountryLabel from "./location/NavbarCountryLabel"
import { DashboardPlanBadge } from "@/components/dashboard-packages"
import { dashboardRoleFromUserRole, useDashboardPlan } from "@/hooks/use-dashboard-plan"

export default function Navbar() {
  const router = useRouter()
  const pathname = usePathname()

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [hydrated, setHydrated] = useState(false)
  const [showAccountMenu, setShowAccountMenu] = useState(false)
  const [exploreOpen, setExploreOpen] = useState(false)

  const navShellRef = useRef<HTMLDivElement>(null)
  const exploreRef = useRef<HTMLDivElement>(null)
  const exploreMobileRef = useRef<HTMLButtonElement>(null)
  const desktopAccountRef = useRef<HTMLDivElement>(null)
  const mobileAccountRef = useRef<HTMLDivElement>(null)

  const brandLogo = getNavbarLogoImageProps()

  useEffect(() => {
    setHydrated(true)
  }, [])

  // Re-evaluate auth after navigation
  useEffect(() => {
    if (hydrated) setShowAccountMenu(false)
  }, [pathname, hydrated])

  const authenticated = hydrated && isAuthenticated()
  const userId = getCurrentUserId()
  const role = getCurrentUserRole()
  const displayName = getCurrentUserDisplayName()
  const userEmail = getCurrentUserEmail()
  const dashboardPlanRole = dashboardRoleFromUserRole(role)
  const { plan: currentPlan, loading: planLoading } = useDashboardPlan(
    authenticated ? dashboardPlanRole : null,
  )

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

  const handleLogout = useCallback(() => {
    markLogoutSuccessBanner()
    clearTokens()
    router.push("/login")
    setShowAccountMenu(false)
    setMobileMenuOpen(false)
  }, [router])

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
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [mobileMenuOpen])

  const navLinkClass = "font-sans font-medium text-gray-700 transition-colors hover:text-gray-900"

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

  return (
    <nav className="sticky top-0 z-50 bg-white shadow-[0_4px_12px_rgba(0,0,0,0.12)]">
      <div ref={navShellRef} className="mx-auto max-w-7xl px-3 sm:px-4 lg:px-6">
        <div className="flex h-[5.5rem] min-h-[5.5rem] items-center justify-between gap-1.5 sm:gap-3">
          {/* Left Section - Logo, Explore, and Mobile Menu */}
          <div className="flex min-w-0 items-center gap-2 sm:gap-4">
            <button
              type="button"
              className="shrink-0 rounded-md p-2 text-gray-700 hover:bg-gray-100 hover:text-gray-900 lg:hidden"
              onClick={() => setMobileMenuOpen((v) => !v)}
              aria-expanded={mobileMenuOpen}
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" strokeWidth={2} /> : <Menu className="h-6 w-6" strokeWidth={2} />}
            </button>
            <Link href="/" className={NAVBAR_LOGO_LINK_CLASSNAME}>
              <Image {...brandLogo} alt="BizTradeFairs.com" priority />
            </Link>
            {/* Country from IP/VPN — visible sm+ */}
            <div className="ml-1 hidden shrink-0 sm:ml-2 sm:flex">
              <NavbarCountryLabel />
            </div>

            {/* Explore Button - Desktop (next to logo) */}
            <div ref={exploreRef} className="hidden lg:ml-4 lg:block">
              <button
                type="button"
                className={`inline-flex items-center gap-0.5 rounded-md px-2 py-1 text-sm font-medium ${navLinkClass}`}
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

          {/* Center Section - Navigation Links (Desktop) - Centered */}
          <div className="hidden lg:flex lg:items-center lg:justify-center lg:flex-1 lg:gap-8">
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
          </div>

          {/* Right Section - Actions */}
          <div className="flex shrink-0 items-center gap-2 sm:gap-4">
            {/* Top 100 Must Visit - Desktop */}
            <Link href="/event" className={`hidden lg:block ${navLinkClass}`}>
              <span className="text-sm whitespace-nowrap">Top 100 Must Visit</span>
            </Link>

            {/* Add Event - Desktop */}
            <Link href="/organizer-signup" className={`hidden lg:block ${navLinkClass}`}>
              <span className="text-sm whitespace-nowrap">Add Event</span>
            </Link>

            {/* Account Menu */}
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
                  className="absolute right-0 z-[100] mt-2 w-56 rounded-lg border border-gray-200 bg-white py-1 shadow-lg"
                  role="menu"
                >
                  {accountMenuInner}
                </div>
              ) : null}
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen ? (
          <div className="max-h-[min(70vh,480px)] overflow-y-auto border-t border-gray-200 bg-white py-2 lg:hidden">
            {/* Explore - Mobile */}
            <button
              ref={exploreMobileRef}
              type="button"
              className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-medium text-gray-800 hover:bg-gray-50"
              onClick={() => {
                setExploreOpen(true)
                setMobileMenuOpen(false)
              }}
            >
              Explore
              <ChevronDown className="h-4 w-4 text-gray-500" />
            </button>

            {/* Country Label - Mobile */}
            <div className="border-b border-gray-100 px-4 py-3 sm:hidden">
              <NavbarCountryLabel className="w-full" />
            </div>

            {/* Mobile Navigation Links */}
            <Link
              href="/organizers"
              className="block px-4 py-3 text-sm font-medium text-gray-800 hover:bg-gray-50"
              onClick={() => setMobileMenuOpen(false)}
            >
              Organizers
            </Link>
            <Link
              href="/venues"
              className="block px-4 py-3 text-sm font-medium text-gray-800 hover:bg-gray-50"
              onClick={() => setMobileMenuOpen(false)}
            >
              Venues
            </Link>
            <Link
              href="/exhibitor"
              className="block px-4 py-3 text-sm font-medium text-gray-800 hover:bg-gray-50"
              onClick={() => setMobileMenuOpen(false)}
            >
              Exhibitors
            </Link>
            <Link
              href="/speakers"
              className="block px-4 py-3 text-sm font-medium text-gray-800 hover:bg-gray-50"
              onClick={() => setMobileMenuOpen(false)}
            >
              Speakers
            </Link>

            {/* Divider */}
            <div className="border-t border-gray-100 my-2"></div>

            {/* Additional Mobile Links */}
            <Link
              href="/event"
              className="block px-4 py-3 text-sm font-medium text-gray-800 hover:bg-gray-50"
              onClick={() => setMobileMenuOpen(false)}
            >
              Top 100 Must Visit
            </Link>
            <Link
              href="/organizer-signup"
              className="block px-4 py-3 text-sm font-medium text-gray-800 hover:bg-gray-50"
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
                  className="block w-full px-4 py-3 text-left text-sm font-medium text-gray-800 hover:bg-gray-50"
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
                  className="block px-4 py-3 text-sm font-medium text-gray-800 hover:bg-gray-50"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign in
                </Link>
                <Link
                  href="/signup"
                  className="block px-4 py-3 text-sm font-medium text-gray-800 hover:bg-gray-50"
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
  )
}