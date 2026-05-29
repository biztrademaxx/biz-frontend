import { adminApi } from "../../shared/services/admin-api"

export interface GetEventsParams {
  page?: number
  limit?: number
  search?: string
  tab?: string
  category?: string
  country?: string
  status?: string
}

export interface AdminCountry {
  id: string
  name: string
  code: string
  isActive?: boolean
}

export interface EventPagination {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}

export interface GetEventsResponse {
  success?: boolean
  events?: unknown[]
  data?: { events?: unknown[] }
  pagination?: EventPagination
}

export interface EventStats {
  total: number
  approved: number
  rejected: number
  pending: number
  featured: number
  vip: number
  live: number
  upcoming: number
  ended: number
}

export interface GetCategoriesResponse {
  data?: unknown[]
}

export async function getEvents(params: GetEventsParams = {}): Promise<GetEventsResponse> {
  const qs = new URLSearchParams()
  if (params.page) qs.set("page", String(params.page))
  if (params.limit) qs.set("limit", String(params.limit))
  if (params.search?.trim()) qs.set("search", params.search.trim())
  if (params.tab && params.tab !== "all") qs.set("tab", params.tab)
  if (params.category && params.category !== "all") qs.set("category", params.category)
  if (params.country && params.country !== "all") qs.set("country", params.country)
  if (params.status && params.status !== "all") qs.set("status", params.status)
  const query = qs.toString()
  return adminApi<GetEventsResponse>(`/events${query ? `?${query}` : ""}`, { auth: true })
}

export async function getEventStats(): Promise<{ stats?: EventStats }> {
  return adminApi<{ success?: boolean; stats?: EventStats }>("/events/stats", { auth: true })
}

export async function getEventById(id: string) {
  return adminApi<{ success?: boolean; data?: unknown }>(`/events/${id}`, { auth: true })
}

export async function updateEvent(id: string, body: Record<string, unknown>) {
  return adminApi<{ success?: boolean; data?: unknown }>(`/events/${id}`, {
    method: "PATCH",
    body,
    auth: true,
  })
}

/** Verify / un-verify; optional `badgeFile` uploads to Cloudinary and stores URL in `verifiedBadgeImage`. Listing uses `/images/VerifiedBadge.png` when verified with no file. */
export async function verifyEvent(id: string, verify: boolean, badgeFile?: File) {
  const fd = new FormData()
  fd.append("isVerified", verify ? "true" : "false")
  if (verify && badgeFile) {
    fd.append("badgeFile", badgeFile)
  }
  return adminApi<{ success?: boolean; data?: unknown }>(`/events/${id}/verify`, {
    method: "POST",
    body: fd,
    auth: true,
  })
}

export async function deleteEvent(id: string) {
  return adminApi(`/events/${id}`, { method: "DELETE", auth: true })
}

export async function getEventCategories(): Promise<unknown[] | GetCategoriesResponse> {
  return adminApi<unknown[] | GetCategoriesResponse>("/event-categories", { auth: true })
}

export async function getCountries(): Promise<AdminCountry[]> {
  const data = await adminApi<AdminCountry[]>("/countries", { auth: true })
  return Array.isArray(data) ? data : []
}

export type EventMailCandidate = {
  source: "SUB_ADMIN" | "BULK_UPLOAD"
  eventTitle: string
  organizerEmail: string
  organizerName: string
  createdAt: string
}

export async function getEventMailCandidates() {
  return adminApi<{ success?: boolean; data?: EventMailCandidate[] }>("/events/mail-candidates", { auth: true })
}

export async function sendEventListingEmail(organizerEmail: string, eventTitles: string[]) {
  return adminApi<{ success?: boolean; message?: string }>("/events/send-listing-email", {
    method: "POST",
    auth: true,
    body: { organizerEmail, eventTitles },
  })
}
