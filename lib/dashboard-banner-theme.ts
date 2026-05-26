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
    backdrop: "bg-gradient-to-br from-[#4F46E5] via-[#6366F1] to-[#0EA5E9]",
    overlay: "bg-gradient-to-r from-indigo-950/70 via-violet-900/45 to-transparent",
    descriptionText: "text-violet-100",
    badge: "bg-gradient-to-r from-violet-600 to-sky-500",
    badgeLink:
      "bg-gradient-to-r from-violet-600 to-sky-500 hover:from-violet-500 hover:to-sky-400 shadow-md shadow-violet-500/25",
  },
  "exhibitor-dashboard": {
    backdrop: "bg-gradient-to-br from-[#8E54E9] via-[#6B4FCC] to-[#4776E6]",
    overlay: "bg-gradient-to-r from-[#5b21b6]/75 via-[#4c1d95]/45 to-transparent",
    descriptionText: "text-purple-100",
    badge: "bg-gradient-to-r from-[#8E54E9] to-[#4776E6]",
    badgeLink: "bg-gradient-to-r from-[#8E54E9] to-[#4776E6] hover:opacity-95 shadow-md shadow-[#8E54E9]/25",
  },
  "organizer-dashboard": {
    backdrop: "bg-gradient-to-br from-[#4776E6] via-[#6366f1] to-[#c4b5fd]",
    overlay: "bg-gradient-to-r from-[#5b21b6]/70 via-[#6366f1]/40 to-transparent",
    descriptionText: "text-indigo-100",
    badge: "bg-gradient-to-r from-[#8E54E9] to-[#4776E6]",
    badgeLink: "bg-gradient-to-r from-[#8E54E9] to-[#4776E6] hover:opacity-95 shadow-md shadow-[#8E54E9]/20",
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
