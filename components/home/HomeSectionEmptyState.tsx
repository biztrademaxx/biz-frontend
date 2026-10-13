import Link from "next/link"
import type { LucideIcon } from "lucide-react"
import { Building2, CalendarDays, MapPin, Mic2, Sparkles, Users } from "lucide-react"
import { homeLocationScopeLabel } from "@/lib/city-country"

const ICONS: Record<string, LucideIcon> = {
  events: CalendarDays,
  venues: Building2,
  trending: Sparkles,
  speakers: Mic2,
  organizers: Users,
  location: MapPin,
}

export type HomeSectionEmptyIcon = keyof typeof ICONS

export type HomeSectionEmptyAction = {
  label: string
  href: string
  variant?: "primary" | "secondary"
}

export type HomeSectionEmptyStateProps = {
  icon?: HomeSectionEmptyIcon
  title: string
  description: string
  homeCity?: string | null
  homeCountry?: string | null
  actions?: HomeSectionEmptyAction[]
  className?: string
}

export function homeEmptyDescription(
  section: string,
  homeCity?: string | null,
  homeCountry?: string | null,
): string {
  const where = homeLocationScopeLabel(homeCity, homeCountry)
  return `We could not find ${section} for ${where} right now. Try another city from the location menu, or browse all listings.`
}

export default function HomeSectionEmptyState({
  icon = "events",
  title,
  description,
  homeCity,
  homeCountry,
  actions = [],
  className = "",
}: HomeSectionEmptyStateProps) {
  const Icon = ICONS[icon] ?? CalendarDays
  const where = homeLocationScopeLabel(homeCity, homeCountry)

  return (
    <div
      className={`flex min-h-[200px] flex-col items-center justify-center rounded-xl border border-dashed border-[#002C71]/25 bg-gradient-to-br from-slate-50 via-white to-[#002C71]/[0.04] px-6 py-10 text-center shadow-sm sm:min-h-[220px] sm:px-10 ${className}`}
      role="status"
    >
      <div
        className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#002C71]/10 ring-4 ring-[#002C71]/5"
        aria-hidden
      >
        <Icon className="h-7 w-7 text-[#002C71]" strokeWidth={1.75} />
      </div>
      <h3 className="max-w-md text-base font-semibold text-gray-900 sm:text-lg">{title}</h3>
      <p className="mt-2 max-w-lg text-sm leading-relaxed text-gray-600">{description}</p>
      {where !== "your region" ? (
        <p className="mt-1 text-xs font-medium uppercase tracking-wide text-[#002C71]/70">
          Showing results for {where}
        </p>
      ) : null}
      {actions.length > 0 ? (
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          {actions.map((action) => (
            <Link
              key={action.href + action.label}
              href={action.href}
              className={
                action.variant === "secondary"
                  ? "inline-flex items-center justify-center rounded-md border border-[#002C71] px-4 py-2 text-sm font-medium text-[#002C71] transition-colors hover:bg-[#002C71]/5"
                  : "inline-flex items-center justify-center rounded-md bg-[#002C71] px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#001a48]"
              }
            >
              {action.label}
            </Link>
          ))}
        </div>
      ) : null}
    </div>
  )
}
