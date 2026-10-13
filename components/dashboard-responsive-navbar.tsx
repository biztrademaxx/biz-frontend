"use client"

import { useEffect, useRef, useState, type ReactNode } from "react"
import Link from "next/link"
import { ChevronDown, Menu, X } from "lucide-react"
import { DashboardNavbarLogo } from "@/components/dashboard-navbar-logo"
import { NAVBAR_ROW_CLASSNAME } from "@/lib/brand-logo"

export type DashboardNavItem = {
  href?: string
  label: string
  onClick?: () => void
}

type DashboardResponsiveNavbarProps = {
  /** Notifications, profile dropdown, etc. */
  actions: ReactNode
  onAddEvent?: () => void
  /** Shown on md+ desktop row (e.g. explore dropdown) */
  exploreLinks?: DashboardNavItem[]
  /** Additional desktop-only links */
  extraDesktopLinks?: DashboardNavItem[]
  /** Extra entries in the mobile drawer */
  extraMobileLinks?: DashboardNavItem[]
  navClassName?: string
}

const linkTextClass =
  "text-sm font-medium text-gray-700 transition-colors hover:text-[#002C71] whitespace-nowrap"

const mobileLinkClass =
  "block w-full px-4 py-3 text-left text-sm font-medium text-gray-800 hover:bg-gray-50"

function NavItemDesktop({ item, onNavigate }: { item: DashboardNavItem; onNavigate?: () => void }) {
  if (item.onClick) {
    return (
      <button type="button" onClick={() => { item.onClick?.(); onNavigate?.() }} className={linkTextClass}>
        {item.label}
      </button>
    )
  }
  if (item.href) {
    return (
      <Link href={item.href} className={linkTextClass} onClick={onNavigate}>
        {item.label}
      </Link>
    )
  }
  return null
}

function NavItemMobile({ item, onNavigate }: { item: DashboardNavItem; onNavigate: () => void }) {
  if (item.onClick) {
    return (
      <button
        type="button"
        className={mobileLinkClass}
        onClick={() => {
          item.onClick?.()
          onNavigate()
        }}
      >
        {item.label}
      </button>
    )
  }
  if (item.href) {
    return (
      <Link href={item.href} className={mobileLinkClass} onClick={onNavigate}>
        {item.label}
      </Link>
    )
  }
  return null
}

const defaultPublicLinks: DashboardNavItem[] = [
  { href: "/event", label: "Top 100 Must Visit" },
  { href: "/speakers", label: "Speakers" },
]

export function DashboardResponsiveNavbar({
  actions,
  onAddEvent,
  exploreLinks,
  extraDesktopLinks = [],
  extraMobileLinks = [],
  navClassName = "sticky top-0 z-50 bg-white shadow-sm",
}: DashboardResponsiveNavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [exploreOpen, setExploreOpen] = useState(false)
  const shellRef = useRef<HTMLDivElement>(null)

  const closeMobile = () => setMobileOpen(false)

  useEffect(() => {
    const onResize = () => {
      if (window.matchMedia("(min-width: 1024px)").matches) {
        setMobileOpen(false)
        setExploreOpen(false)
      }
    }
    window.addEventListener("resize", onResize)
    return () => window.removeEventListener("resize", onResize)
  }, [])

  useEffect(() => {
    if (!mobileOpen) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileOpen(false)
    }
    document.addEventListener("keydown", onKeyDown)
    return () => document.removeEventListener("keydown", onKeyDown)
  }, [mobileOpen])

  useEffect(() => {
    const onPointerDown = (event: MouseEvent) => {
      if (!shellRef.current?.contains(event.target as Node)) {
        setExploreOpen(false)
      }
    }
    document.addEventListener("mousedown", onPointerDown)
    return () => document.removeEventListener("mousedown", onPointerDown)
  }, [])

  return (
    <nav className={navClassName}>
      <div ref={shellRef} className="mx-auto w-full max-w-7xl px-3 sm:px-4 lg:px-6">
        <div className={`${NAVBAR_ROW_CLASSNAME} justify-between gap-2`}>
          <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
            <button
              type="button"
              className="shrink-0 rounded-md p-2 text-gray-700 hover:bg-gray-100 lg:hidden"
              onClick={() => setMobileOpen((v) => !v)}
              aria-expanded={mobileOpen}
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
            >
              {mobileOpen ? <X className="h-6 w-6" strokeWidth={2} /> : <Menu className="h-6 w-6" strokeWidth={2} />}
            </button>
            <DashboardNavbarLogo linkClassName="min-w-0 max-w-[min(52vw,200px)] shrink sm:max-w-[260px] md:max-w-[320px] lg:max-w-[440px]" />
          </div>

          <div className="hidden min-w-0 flex-wrap items-center justify-end gap-3 xl:gap-5 lg:flex">
            {exploreLinks && exploreLinks.length > 0 ? (
              <div className="relative hidden md:block">
                <button
                  type="button"
                  className={`inline-flex items-center gap-1 ${linkTextClass}`}
                  onClick={() => setExploreOpen((v) => !v)}
                  aria-expanded={exploreOpen}
                >
                  Explore
                  <ChevronDown className={`h-4 w-4 transition-transform ${exploreOpen ? "rotate-180" : ""}`} />
                </button>
                {exploreOpen ? (
                  <div className="absolute left-0 top-full z-50 mt-2 w-48 rounded-md border border-gray-200 bg-white py-1 shadow-lg">
                    {exploreLinks.map((item) =>
                      item.href ? (
                        <Link
                          key={item.label}
                          href={item.href}
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          onClick={() => setExploreOpen(false)}
                        >
                          {item.label}
                        </Link>
                      ) : (
                        <button
                          key={item.label}
                          type="button"
                          className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                          onClick={() => {
                            item.onClick?.()
                            setExploreOpen(false)
                          }}
                        >
                          {item.label}
                        </button>
                      ),
                    )}
                  </div>
                ) : null}
              </div>
            ) : null}

            {defaultPublicLinks.map((item) => (
              <NavItemDesktop key={item.label} item={item} />
            ))}

            {onAddEvent ? (
              <button type="button" onClick={onAddEvent} className={linkTextClass}>
                Add Event
              </button>
            ) : null}

            {extraDesktopLinks.map((item) => (
              <NavItemDesktop key={item.label} item={item} />
            ))}

            <div className="flex items-center gap-2 sm:gap-3">{actions}</div>
          </div>

          <div className="flex shrink-0 items-center gap-1 sm:gap-2 lg:hidden">{actions}</div>
        </div>

        {mobileOpen ? (
          <div className="max-h-[min(70vh,520px)] overflow-y-auto border-t border-gray-200 bg-white py-2 lg:hidden">
            {exploreLinks && exploreLinks.length > 0 ? (
              <>
                <p className="px-4 pb-1 pt-2 text-xs font-semibold uppercase tracking-wide text-gray-500">Explore</p>
                {exploreLinks.map((item) => (
                  <NavItemMobile key={`explore-${item.label}`} item={item} onNavigate={closeMobile} />
                ))}
              </>
            ) : null}

            {defaultPublicLinks.map((item) => (
              <NavItemMobile key={item.label} item={item} onNavigate={closeMobile} />
            ))}

            {onAddEvent ? (
              <button
                type="button"
                className={mobileLinkClass}
                onClick={() => {
                  onAddEvent()
                  closeMobile()
                }}
              >
                Add Event
              </button>
            ) : null}

            {extraMobileLinks.map((item) => (
              <NavItemMobile key={`mobile-${item.label}`} item={item} onNavigate={closeMobile} />
            ))}
          </div>
        ) : null}
      </div>
    </nav>
  )
}
