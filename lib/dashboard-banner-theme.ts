/** Hero banner gradients aligned with each dashboard shell (sidebar + navbar). */

export type DashboardBannerPage =
  | "exhibitor-dashboard"
  | "organizer-dashboard"
  | "venue-dashboard"
  | "speaker-dashboard"
  | "visitor-dashboard"

export type DashboardBannerTheme = {
  /** Fallback when no admin image (or image failed). */
  backdrop: string
  /** Tint over photo or backdrop. */
  overlay: string
  descriptionText: string
  badge: string
  badgeLink: string
}

export const DASHBOARD_BANNER_THEMES: Record<DashboardBannerPage, DashboardBannerTheme> = {
  "venue-dashboard": {
    backdrop: "bg-gradient-to-b from-[#004A96] via-[#003d7a] to-[#002f5e]",
    overlay: "bg-gradient-to-r from-[#002f5e]/85 via-[#004A96]/55 to-transparent",
    descriptionText: "text-sky-100",
    badge: "bg-[#004A96]",
    badgeLink: "bg-[#004A96] hover:bg-[#003d7a] shadow-md shadow-[#004A96]/30",
  },
  "exhibitor-dashboard": {
    backdrop: "bg-gradient-to-b from-[#004A96] via-[#003d7a] to-[#002f5e]",
    overlay: "bg-gradient-to-r from-[#002f5e]/85 via-[#004A96]/55 to-transparent",
    descriptionText: "text-sky-100",
    badge: "bg-[#004A96]",
    badgeLink: "bg-[#004A96] hover:bg-[#003d7a] shadow-md shadow-[#004A96]/30",
  },
  "organizer-dashboard": {
    backdrop: "bg-gradient-to-b from-[#004A96] via-[#003d7a] to-[#002f5e]",
    overlay: "bg-gradient-to-r from-[#002f5e]/85 via-[#004A96]/55 to-transparent",
    descriptionText: "text-sky-100",
    badge: "bg-[#004A96]",
    badgeLink: "bg-[#004A96] hover:bg-[#003d7a] shadow-md shadow-[#004A96]/30",
  },
  "speaker-dashboard": {
    backdrop: "bg-gradient-to-br from-[#2563eb] via-[#4f46e5] to-[#7c3aed]",
    overlay: "bg-gradient-to-r from-blue-950/70 via-indigo-900/45 to-transparent",
    descriptionText: "text-blue-100",
    badge: "bg-gradient-to-r from-[#2563eb] to-[#7c3aed]",
    badgeLink: "bg-gradient-to-r from-[#2563eb] to-[#7c3aed] hover:opacity-95 shadow-md shadow-blue-500/25",
  },
  "visitor-dashboard": {
    backdrop: "bg-gradient-to-b from-[#004A96] via-[#003d7a] to-[#002f5e]",
    overlay: "bg-gradient-to-r from-[#002f5e]/85 via-[#004A96]/55 to-transparent",
    descriptionText: "text-sky-100",
    badge: "bg-[#004A96]",
    badgeLink: "bg-[#004A96] hover:bg-[#003d7a] shadow-md shadow-[#004A96]/30",
  },
}

export function getDashboardBannerTheme(page: DashboardBannerPage): DashboardBannerTheme {
  return DASHBOARD_BANNER_THEMES[page]
}
