"use client"

export const ADMIN_LIST_QUERY_KEYS = ["page", "search", "status", "category", "country", "industry", "tab"] as const

export type AdminListUrlState = {
  page: number
  search: string
  status: string
  category: string
  country: string
  industry: string
  tab: string
}

export function parseAdminListPage(value: unknown): number {
  const page = typeof value === "string" ? Number(value) : value
  return typeof page === "number" && Number.isSafeInteger(page) && page > 0 ? page : 1
}

function isAdminListUrl(section: string): boolean {
  const params = new URLSearchParams(window.location.search)
  const currentSection = params.get("section")
  const sub = params.get("sub")
  return (!currentSection || currentSection === section) && (!sub || sub === section + "-all")
}

// A page link describes its own filters; saved filters only apply without URL list state.
export function readAdminListUrl(section: string): AdminListUrlState | null {
  const params = new URLSearchParams(window.location.search)
  if (!isAdminListUrl(section) || !ADMIN_LIST_QUERY_KEYS.some((key) => params.has(key))) return null
  return {
    page: parseAdminListPage(params.get("page")),
    search: params.get("search") || "",
    status: params.get("status") || "all",
    category: params.get("category") || "all",
    country: params.get("country") || "all",
    industry: params.get("industry") || "all",
    tab: params.get("tab") || "all",
  }
}

export function writeAdminListUrl(
  section: string,
  state: Pick<AdminListUrlState, "page"> & Partial<Omit<AdminListUrlState, "page">>,
): void {
  if (!isAdminListUrl(section)) return
  const url = new URL(window.location.href)
  for (const key of ADMIN_LIST_QUERY_KEYS) {
    const value = state[key]
    if (key === "page") url.searchParams.set(key, String(parseAdminListPage(value)))
    else if (value && value !== "all") url.searchParams.set(key, String(value))
    else url.searchParams.delete(key)
  }
  if (url.href !== window.location.href) window.history.replaceState(window.history.state, "", url)
}

export function listenForAdminListNavigation(section: string, restore: () => void): () => void {
  const handlePopState = () => { if (isAdminListUrl(section)) restore() }
  window.addEventListener("popstate", handlePopState)
  return () => window.removeEventListener("popstate", handlePopState)
}
