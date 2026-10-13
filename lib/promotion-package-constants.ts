export const ALL_CATEGORIES_LABEL = "All Categories"

const PACKAGE_LABELS: Record<string, string> = {
  pkg_starter: "STARTER",
  pkg_professional: "PROFESSIONAL",
  pkg_enterprise: "ENTERPRISE",
  pkg_visitor_reach: "VisitorReach Campaigns",
  pkg_prospector: "Exhibitor & Sponsor Prospector",
  pkg_leadboost: "LeadBoost",
}

/** Human-readable plan name from packageType id or legacy uuid. */
export function resolvePromotionPackageLabel(packageType: string): string {
  const key = packageType?.trim()
  if (!key) return "Promotion"
  if (PACKAGE_LABELS[key]) return PACKAGE_LABELS[key]
  if (key.startsWith("pkg_")) {
    return key
      .replace(/^pkg_/, "")
      .replace(/_/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase())
  }
  if (/^[0-9a-f-]{36}$/i.test(key)) return "Legacy Package"
  return key
}

export function packageTargetsAllCategories(categories: string[] | undefined): boolean {
  if (!categories?.length) return true
  return categories.some((c) => c.toLowerCase().trim() === ALL_CATEGORIES_LABEL.toLowerCase())
}

export function formatPackagePriceInr(price: number, duration?: string): string {
  const suffix = duration ? ` / ${duration}` : ""
  return `₹${price.toLocaleString("en-IN")}${suffix}`
}
