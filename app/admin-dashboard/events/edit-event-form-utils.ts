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

export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = (error) => reject(error)
  })
}
