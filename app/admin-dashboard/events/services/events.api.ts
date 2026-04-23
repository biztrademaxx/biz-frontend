import { adminApi } from "../../shared/services/admin-api"

export interface GetEventsResponse {
  success?: boolean
  events?: unknown[]
  data?: { events?: unknown[] }
}

export interface GetCategoriesResponse {
  data?: unknown[]
}

export async function getEvents(): Promise<GetEventsResponse> {
  return adminApi<GetEventsResponse>("/events", { auth: true })
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

/** Verify / un-verify; optional `badgeFile` uploads to Cloudinary and stores URL in `verifiedBadgeImage` (no dummy default). */
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
