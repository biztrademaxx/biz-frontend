import type { EditEventRecord } from "./edit-event-schema"
import { getAssignmentName, type EventAssignmentContact } from "./event-assignment"
export type { EditEventCategory, EditEventRecord } from "./edit-event-schema"

export function toDateOnly(value?: string | null): string {
  if (!value) return ""
  const s = value.toString()
  return s.includes("T") ? s.split("T")[0] : s
}

export function slugifyTitle(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
}

export function scalarEventType(raw: unknown): string {
  if (Array.isArray(raw)) {
    const first = raw.find((x) => typeof x === "string" && String(x).trim()) as string | undefined
    return first?.trim() || "in-person"
  }
  if (typeof raw === "string" && raw.trim()) return raw.trim()
  return "in-person"
}

export function normalizeEventCategoryNames(event: EditEventRecord): string[] {
  const raw = (event as unknown as { category?: string | string[] }).category
  if (Array.isArray(raw)) return raw.map((x) => String(x).trim()).filter(Boolean)
  if (typeof raw === "string" && raw.trim()) return [raw.trim()]
  return []
}

/**
 * For PATCH: omit unchanged media, and never send `data:` / `blob:` payloads
 * (those blow past Express JSON limits). Prefer Cloudinary/http(s) URLs only.
 * Returns `undefined` when the field should be left off the request body.
 */
export function mediaFieldForPatch(
  next: string | null | undefined,
  original: string | null | undefined,
): string | null | undefined {
  const n = (next ?? "").trim()
  const o = (original ?? "").trim()
  if (n === o) return undefined
  if (isInlineMediaDataUrl(n)) return undefined
  return n
}

/** True for base64 data URLs or temporary blob: object URLs — never persist these via JSON PATCH. */
export function isInlineMediaDataUrl(value: string | null | undefined): boolean {
  const v = (value ?? "").trim()
  return v.startsWith("data:") || v.startsWith("blob:")
}

/** Keep only http(s) (or other non-inline) URLs for media arrays in PATCH bodies. */
export function httpMediaUrlsOnly(urls: string[] | null | undefined): string[] {
  if (!Array.isArray(urls)) return []
  return urls.map((u) => String(u).trim()).filter((u) => u && !isInlineMediaDataUrl(u))
}

/** Map Express admin PATCH `data` (Prisma shape) onto the edit form / list record. */
export function mapPatchedEventToEditRecord(
  raw: Record<string, unknown>,
  previous?: Partial<EditEventRecord>,
): EditEventRecord {
  const organizerDetails = (raw.organizer && typeof raw.organizer === "object"
    ? raw.organizer : raw.organizerDetails ?? previous?.organizerDetails ?? null) as EventAssignmentContact | null
  const venueDetails = (raw.venueId === null || raw.venue === null ? null
    : raw.venue && typeof raw.venue === "object" ? raw.venue : raw.venueDetails ?? previous?.venueDetails ?? null) as EventAssignmentContact | null
  const organizer = organizerDetails ? getAssignmentName(organizerDetails, "organizers") : String(raw.organizer ?? previous?.organizer ?? "")

  const categoryRaw = raw.category ?? previous?.category
  const category =
    Array.isArray(categoryRaw)
      ? categoryRaw.map((x) => String(x)).filter(Boolean).join(", ")
      : typeof categoryRaw === "string"
        ? categoryRaw
        : ""

  return {
    id: String(raw.id ?? previous?.id ?? ""),
    title: String(raw.title ?? previous?.title ?? ""),
    organizer,
    organizerId: String(raw.organizerId ?? organizerDetails?.id ?? previous?.organizerId ?? ""),
    venueId: raw.venueId === null ? null : String(raw.venueId ?? venueDetails?.id ?? previous?.venueId ?? "") || null,
    organizerDetails,
    venueDetails,
    country: "country" in raw ? String(raw.country ?? "") : String(venueDetails?.venueCountry ?? previous?.country ?? ""),
    state: "state" in raw ? String(raw.state ?? "") : String(venueDetails?.venueState ?? previous?.state ?? ""),
    date: toDateOnly(String(raw.startDate ?? raw.date ?? previous?.date ?? "")),
    endDate: toDateOnly(String(raw.endDate ?? previous?.endDate ?? "")),
    location: "city" in raw ? String(raw.city ?? "") : String(venueDetails?.venueCity ?? raw.location ?? previous?.location ?? ""),
    venue: raw.venueId === null || raw.venue === null ? "" : typeof raw.venue === "string" ? raw.venue : venueDetails ? getAssignmentName(venueDetails, "venues") : previous?.venue ?? "",
    status: (raw.status as EditEventRecord["status"]) ?? previous?.status ?? "Draft",
    attendees: Number(raw.currentAttendees ?? raw.attendees ?? previous?.attendees ?? 0),
    maxCapacity: Number(raw.maxAttendees ?? raw.maxCapacity ?? previous?.maxCapacity ?? 0),
    ticketPrice: Number(raw.ticketPrice ?? previous?.ticketPrice ?? 0),
    category,
    featured: Boolean(raw.isFeatured ?? raw.featured ?? previous?.featured ?? false),
    vip: Boolean(raw.isVIP ?? raw.vip ?? previous?.vip ?? false),
    description: String(raw.description ?? previous?.description ?? ""),
    shortDescription: String(raw.shortDescription ?? previous?.shortDescription ?? ""),
    subTitle: String(raw.subTitle ?? previous?.subTitle ?? ""),
    slug: String(raw.slug ?? previous?.slug ?? ""),
    edition: String(raw.edition ?? previous?.edition ?? ""),
    tags: Array.isArray(raw.tags) ? raw.tags.map((x) => String(x)) : previous?.tags ?? [],
    eventType: scalarEventType(raw.eventType ?? previous?.eventType),
    timezone: String(raw.timezone ?? previous?.timezone ?? ""),
    currency: String(raw.currency ?? previous?.currency ?? ""),
    bannerImage: String(raw.bannerImage ?? previous?.bannerImage ?? ""),
    vipImage:
      typeof raw.vipImage === "string"
        ? raw.vipImage
        : raw.vipImage == null
          ? null
          : previous?.vipImage ?? null,
    thumbnailImage: String(raw.thumbnailImage ?? previous?.thumbnailImage ?? ""),
    images: Array.isArray(raw.images) ? raw.images.map((x) => String(x)) : previous?.images ?? [],
    videos: Array.isArray(raw.videos) ? raw.videos.map((x) => String(x)) : previous?.videos ?? [],
    youtubeVideoUrl:
      typeof raw.youtubeVideoUrl === "string"
        ? raw.youtubeVideoUrl
        : (previous?.youtubeVideoUrl ?? null),
    brochure: String(raw.brochure ?? previous?.brochure ?? ""),
    layout: String(raw.layoutPlan ?? raw.layout ?? previous?.layout ?? ""),
    documents: Array.isArray(raw.documents)
      ? raw.documents.map((x) => String(x))
      : previous?.documents ?? [],
    isVerified: Boolean(raw.isVerified ?? previous?.isVerified ?? false),
    isPublic: Boolean(raw.isPublic ?? previous?.isPublic ?? true),
    verifiedBadgeImage:
      typeof raw.verifiedBadgeImage === "string"
        ? raw.verifiedBadgeImage
        : previous?.verifiedBadgeImage ?? null,
  }
}

export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = (error) => reject(error)
  })
}
