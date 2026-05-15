import type { EventFormData, ValidationErrors } from "./types"
import {
  convertLocalToUTC,
  getDatePart,
  getEffectiveEventCreationTimezone,
  validateOrganizerExhibitorSpaceCosts,
} from "./utils"

export function computePublishTimes(formData: EventFormData): {
  tz: string
  startDateWithTime: string
  endDateWithTime: string
} {
  const tz = getEffectiveEventCreationTimezone(formData)
  const startDateWithTime =
    convertLocalToUTC(formData.dailyStart, getDatePart(formData.startDate), tz) || formData.startDate
  const endDateWithTime =
    convertLocalToUTC(formData.dailyEnd, getDatePart(formData.endDate), tz) || formData.endDate
  return { tz, startDateWithTime, endDateWithTime }
}

export function buildExhibitionSpacesFromForm(formData: EventFormData) {
  return formData.spaceCosts
    .filter((cost) => cost.type.trim() !== "")
    .map((cost) => {
      let spaceType = "CUSTOM"
      const spaceName = cost.type?.toLowerCase() || ""

      if (spaceName.includes("shell space") || spaceName.includes("standard booth")) {
        spaceType = "SHELL_SPACE"
      } else if (spaceName.includes("raw space")) {
        spaceType = "RAW_SPACE"
      } else if (spaceName.includes("2 side open")) {
        spaceType = "TWO_SIDE_OPEN"
      } else if (spaceName.includes("3 side open")) {
        spaceType = "THREE_SIDE_OPEN"
      } else if (spaceName.includes("4 side open")) {
        spaceType = "FOUR_SIDE_OPEN"
      } else if (spaceName.includes("mezzanine")) {
        spaceType = "MEZZANINE"
      } else if (spaceName.includes("additional power")) {
        spaceType = "ADDITIONAL_POWER"
      } else if (spaceName.includes("compressed air")) {
        spaceType = "COMPRESSED_AIR"
      }

      return {
        spaceType,
        name: (cost.hallName && String(cost.hallName).trim()) || cost.type,
        description: cost.description || "",
        area: cost.minArea || 0,
        dimensions: cost.minArea ? `${cost.minArea} sq.m` : "",
        location: null,
        basePrice: (Number(cost.pricePerSqm) || 0) * (Number(cost.minArea) || 0),
        pricePerSqm: cost.pricePerSqm || null,
        minArea: cost.minArea || null,
        pricePerUnit: cost.pricePerUnit || null,
        unit: cost.unit || null,
        currency: formData.currency,
        powerIncluded: false,
        additionalPowerRate: cost.type.toLowerCase().includes("power") ? cost.pricePerUnit || 0 : null,
        compressedAirRate: cost.type.toLowerCase().includes("air") ? cost.pricePerUnit || 0 : null,
        isFixed: cost.isFixed || false,
        isAvailable: true,
        maxBooths: null,
        bookedBooths: 0,
        setupRequirements: null,
      }
    })
}

export function buildTicketTypesForPublish(formData: EventFormData) {
  return [
    {
      name: "General",
      description: "General admission ticket",
      price: formData.generalPrice,
      quantity: 1000,
      isActive: formData.generalPrice > 0,
    },
    {
      name: "Student",
      description: "Student discount ticket",
      price: formData.studentPrice,
      quantity: 500,
      isActive: formData.studentPrice > 0,
    },
    {
      name: "VIP",
      description: "VIP access ticket",
      price: formData.vipPrice,
      quantity: 100,
      isActive: formData.vipPrice > 0,
    },
  ].filter((ticket) => ticket.isActive)
}

export function buildOrganizerPublishEventBody(
  formData: EventFormData,
  exhibitionSpaces: ReturnType<typeof buildExhibitionSpacesFromForm>,
  ticketTypes: ReturnType<typeof buildTicketTypesForPublish>,
  startDateWithTime: string,
  endDateWithTime: string,
  tz: string,
) {
  return {
    title: formData.title,
    slug: formData.slug,
    subTitle: (formData.subTitle ?? "").slice(0, 10),
    description: formData.description,
    shortDescription: formData.description.substring(0, 200),
    category: formData.categories,
    edition: formData.edition ? String(formData.edition) : null,
    tags: formData.tags,
    startDate: startDateWithTime,
    endDate: endDateWithTime,
    registrationStart: startDateWithTime,
    registrationEnd: endDateWithTime,
    timezone: tz,
    isVirtual: false,
    venueId: formData.venueId || null,
    city: formData.city || null,
    state: formData.state || null,
    country: formData.country || null,
    currency: formData.currency,
    images: formData.images,
    documents: [formData.brochure, formData.layoutPlan].filter(Boolean),
    brochure: formData.brochure || null,
    layoutPlan: formData.layoutPlan || null,
    bannerImage: formData.images[0] || null,
    thumbnailImage: formData.images[0] || null,
    isPublic: false,
    requiresApproval: false,
    allowWaitlist: false,
    status: "PENDING_APPROVAL",
    isFeatured: formData.featured,
    isVIP: formData.vip,
    exhibitionSpaces,
    eventType: [formData.eventType],
    maxAttendees: null,
    ticketTypes,
  }
}

export function computePublishValidationErrors(formData: EventFormData): ValidationErrors {
  const newValidationErrors: ValidationErrors = {}
  if (!formData.title.trim()) newValidationErrors.title = "Event title is required"
  if (!formData.slug.trim()) newValidationErrors.slug = "Event slug is required"
  if (!formData.description.trim()) newValidationErrors.description = "Event description is required"
  if (!formData.eventType.trim()) newValidationErrors.eventType = "Please select an event type"
  if (!formData.startDate.trim()) newValidationErrors.startDate = "Start date is required"
  if (!formData.endDate.trim()) newValidationErrors.endDate = "End date is required"
  if (!formData.venue.trim()) newValidationErrors.venue = "Venue is required"
  if (!formData.venueId.trim()) newValidationErrors.venueId = "Please select a venue before creating the event"
  if (formData.tags.length === 0) newValidationErrors.tags = "Add at least one tag for better discoverability"

  const spaceCostsErr = validateOrganizerExhibitorSpaceCosts(formData.spaceCosts)
  if (spaceCostsErr) newValidationErrors.spaceCosts = spaceCostsErr

  if (formData.startDate && formData.endDate) {
    const start = new Date(formData.startDate)
    const end = new Date(formData.endDate)
    if (end < start) newValidationErrors.endDate = "End date cannot be before start date"
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    if (start < today) newValidationErrors.startDate = "Event must be in the future"
  }

  return newValidationErrors
}
