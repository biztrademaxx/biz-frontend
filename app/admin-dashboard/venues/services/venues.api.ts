import { adminApi } from "@/lib/admin-api"
import { mapVenueFromApi } from "../lib/venue-mapper"
import type { Venue, VenueEditFormData } from "../types/venue.types"

const LIST_PAGE_SIZE = 100

export async function fetchAllVenues(): Promise<Venue[]> {
  let page = 1
  let totalPages = 1
  const raw: Record<string, unknown>[] = []

  do {
    const result = await adminApi<{
      success?: boolean
      data?: Record<string, unknown>[]
      venues?: Record<string, unknown>[]
      pagination?: { totalPages?: number }
    }>(`/venues?page=${page}&limit=${LIST_PAGE_SIZE}`)
    const list = result?.data ?? result?.venues ?? []
    if (Array.isArray(list)) raw.push(...list)
    totalPages = Math.max(1, Number(result?.pagination?.totalPages) || 1)
    page += 1
  } while (page <= totalPages)

  return raw.map((v) => mapVenueFromApi(v))
}

export async function fetchVenueById(venueId: string): Promise<Venue | null> {
  const result = await adminApi<{ success?: boolean; data?: Record<string, unknown> }>(
    `/venues/${venueId}`,
  )
  const raw = result?.data ?? (result as Record<string, unknown>)
  if (!raw || typeof raw !== "object" || !raw.id) return null
  return mapVenueFromApi(raw as Record<string, unknown>)
}

export async function patchVenue(venueId: string, body: Record<string, unknown>) {
  return adminApi(`/venues/${venueId}`, { method: "PATCH", body })
}

export async function bulkApproveVenues(ids: string[]) {
  return adminApi<{ success?: boolean; approvedCount?: number }>("/venues/bulk-approve", {
    method: "POST",
    body: { ids },
  })
}

export async function deleteVenue(venueId: string) {
  return adminApi(`/venues/${venueId}`, { method: "DELETE" })
}

export async function createVenue(body: Record<string, unknown>) {
  return adminApi<{ success?: boolean; error?: string }>("/venues", { method: "POST", body })
}

export async function sendVenueAccountEmail(venueId: string) {
  return adminApi("/venues/send-account-email", {
    method: "POST",
    body: { venueId },
  })
}

export function buildVenuePatchBody(formData: VenueEditFormData): Record<string, unknown> {
  const status = formData.status || "active"
  const statusFlags =
    status === "active"
      ? { isVerified: true, isActive: true }
      : status === "pending"
        ? { isVerified: false, isActive: true }
        : { isVerified: false, isActive: false }

  return {
    firstName: formData.contactPerson?.split(" ")[0],
    lastName: formData.contactPerson?.split(" ").slice(1).join(" ") ?? "",
    email: formData.email,
    phone: formData.mobile,
    venueName: formData.venueName,
    venueCity: formData.city,
    venueState: formData.state,
    venueCountry: formData.country,
    venueAddress: formData.address,
    venueWebsite: formData.website || null,
    venueDescription: formData.description || null,
    maxCapacity: formData.maxCapacity,
    totalHalls: formData.totalHalls,
    amenities: Array.isArray(formData.amenities) ? formData.amenities : [],
    ...(formData.logo ? { logo: formData.logo, avatar: formData.logo } : {}),
    ...(formData.venueImages ? { venueImages: formData.venueImages } : {}),
    ...statusFlags,
    ...(status !== "suspended" && formData.isVerified !== undefined
      ? { isVerified: formData.isVerified }
      : {}),
  }
}

export function buildStatusPatchBody(
  newStatus: "active" | "pending" | "suspended",
): Record<string, unknown> {
  if (newStatus === "active") return { isVerified: true, isActive: true }
  return { isVerified: false, isActive: true }
}
