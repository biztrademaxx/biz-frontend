/** CMS banner placement values (stored in banner `position` / extras). */

export type BannerPositionOption = {
  value: string
  label: string
}

export const BANNER_POSITION_OPTIONS_COMMON: BannerPositionOption[] = [
  { value: "hero", label: "Hero Banner (Top)" },
  { value: "middle", label: "Middle Section" },
  { value: "bottom", label: "Bottom Section" },
  { value: "sidebar", label: "Sidebar" },
]

/** Homepage-only slots between major sections (see app/page.tsx). */
export const BANNER_POSITION_OPTIONS_HOMEPAGE: BannerPositionOption[] = [
  { value: "after_city", label: "After City (Browse Events by City)" },
  { value: "after_country", label: "After Country (Browse by Country)" },
  {
    value: "after_featured_organizers",
    label: "After Featured Organizers",
  },
]

export function getBannerPositionOptionsForPage(page: string): BannerPositionOption[] {
  if (page === "homepage") {
    return [...BANNER_POSITION_OPTIONS_COMMON, ...BANNER_POSITION_OPTIONS_HOMEPAGE]
  }
  return BANNER_POSITION_OPTIONS_COMMON
}

export function getBannerPositionLabel(position: string): string {
  const all = [...BANNER_POSITION_OPTIONS_COMMON, ...BANNER_POSITION_OPTIONS_HOMEPAGE]
  return all.find((p) => p.value === position)?.label ?? position
}
