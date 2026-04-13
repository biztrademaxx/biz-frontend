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
