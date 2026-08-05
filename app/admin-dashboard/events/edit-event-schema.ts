// app/admin-dashboard/events/edit-event-schema.ts

import { z } from "zod"

export const editEventStatusEnum = z.enum([
  "Approved",
  "Pending Review",
  "Flagged",
  "Rejected",
  "Draft",
])

export const editEventFormSchema = z
  .object({
    title: z.string().trim().min(1, "Event title is required"),
    slug: z.string().trim().min(1, "Slug is required"),
    description: z.string().trim().min(1, "Full description is required"),
    shortDescription: z.string().max(200, "Max 200 characters").default(""),
    subTitle: z.string().max(200, "Max 200 characters").default(""),
    edition: z.string().default(""),
    date: z.string().min(1, "Start date is required"),
    endDate: z.string().min(1, "End date is required"),
    timezone: z.string().min(1, "Timezone is required"),
    maxCapacity: z.coerce.number().int().min(1, "Max capacity must be at least 1"),
    attendees: z.coerce.number().int().min(0).default(0),
    ticketPrice: z.coerce.number().min(0).default(0),
    eventType: z.string().min(1, "Event type is required"),
    currency: z.string().min(1, "Currency is required"),
    categoryNames: z.array(z.string()).min(1, "Select at least one category"),
    tagsInput: z.string().default(""),
    status: editEventStatusEnum,
    featured: z.boolean().default(false),
    vip: z.boolean().default(false),
    isPublic: z.boolean().default(true),
    isVerified: z.boolean().default(false),
    youtubeVideoUrl: z
      .string()
      .default("")
      .refine((v) => !v.trim() || /^https?:\/\//i.test(v.trim()), "Enter a valid URL"),
    bannerImage: z.string().default(""),
    thumbnailImage: z.string().default(""),
    vipImage: z.string().default(""),
    brochure: z.string().default(""),
    layout: z.string().default(""),
  })
  .superRefine((data, ctx) => {
    if (data.date && data.endDate && data.endDate < data.date) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "End date must be on or after start date",
        path: ["endDate"],
      })
    }
  })

export type EditEventFormValues = z.infer<typeof editEventFormSchema>

export type EditEventCategory = {
  id: string
  name: string
  color?: string
  isActive: boolean
}

export type EditEventRecord = {
  id: string
  title: string
  organizer: string
  organizerId: string
  date: string
  endDate: string
  location: string
  venue: string
  status: "Approved" | "Pending Review" | "Flagged" | "Rejected" | "Draft"
  attendees: number
  maxCapacity: number
  ticketPrice: number
  category: string
  featured: boolean
  vip: boolean
  description: string
  shortDescription: string
  subTitle?: string
  slug: string
  edition: string
  tags: string[]
  eventType: string
  timezone: string
  currency: string
  bannerImage: string
  vipImage?: string | null
  thumbnailImage: string
  images: string[]
  videos: string[]
  youtubeVideoUrl?: string | null
  brochure: string
  layout: string
  documents: string[]
  isVerified: boolean
  isPublic?: boolean
  verifiedBadgeImage: string | null
}

// Utility functions
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

export function mapPatchedEventToEditRecord(
  raw: Record<string, unknown>,
  previous?: Partial<EditEventRecord>,
): EditEventRecord {
  const organizer =
    raw.organizer && typeof raw.organizer === "object"
      ? String(
          (raw.organizer as { company?: string; organizationName?: string; name?: string }).company ||
            (raw.organizer as { organizationName?: string }).organizationName ||
            (raw.organizer as { name?: string }).name ||
            previous?.organizer ||
            "",
        )
      : String(raw.organizer ?? previous?.organizer ?? "")

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
    organizerId: String(raw.organizerId ?? previous?.organizerId ?? ""),
    date: toDateOnly(String(raw.startDate ?? raw.date ?? previous?.date ?? "")),
    endDate: toDateOnly(String(raw.endDate ?? previous?.endDate ?? "")),
    location: String(raw.city ?? raw.location ?? previous?.location ?? ""),
    venue: String(
      typeof raw.venue === "string"
        ? raw.venue
        : (raw.venue as { venueName?: string } | null)?.venueName ?? previous?.venue ?? "",
    ),
    status: (raw.status as EditEventRecord["status"]) ?? previous?.status ?? "Draft",
    attendees: Number(raw.currentAttendees ?? raw.attendees ?? previous?.attendees ?? 0),
    maxCapacity: Number(raw.maxAttendees ?? raw.maxCapacity ?? previous?.maxCapacity ?? 0),
    ticketPrice: Number(previous?.ticketPrice ?? 0),
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