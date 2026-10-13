import { z } from "zod"
import { requiredTrimmed } from "./common"

export const createEventFormSchema = z
  .object({
    title: requiredTrimmed("Event title"),
    slug: requiredTrimmed("Event slug"),
    description: requiredTrimmed("Event description"),
    eventType: requiredTrimmed("Event type"),
    categories: z.array(z.string()).min(1, "Select at least one category"),
    subTitle: z.string().max(10, "Max 10 characters").optional().default(""),
    edition: z.coerce.number().int().min(0).optional().default(1),
    startDate: requiredTrimmed("Start date"),
    endDate: requiredTrimmed("End date"),
    timezone: z.string().optional().default("Asia/Kolkata"),
    venueId: z.string().optional().default(""),
    venue: z.string().optional().default(""),
    city: requiredTrimmed("City"),
    state: z.string().optional().default(""),
    country: requiredTrimmed("Country"),
    address: z.string().optional().default(""),
    registrationStart: z.string().optional().default(""),
    registrationEnd: z.string().optional().default(""),
    organizerId: z.string().optional().default(""),
  })
  .superRefine((data, ctx) => {
    if (data.startDate && data.endDate && data.endDate < data.startDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "End date must be on or after start date",
        path: ["endDate"],
      })
    }
  })

export type CreateEventFormValues = z.infer<typeof createEventFormSchema>

/** Map first validation error to the create-event tab that should open. */
export function createEventErrorTab(field: string): string {
  const basic = new Set([
    "title",
    "slug",
    "description",
    "eventType",
    "categories",
    "subTitle",
    "edition",
    "startDate",
    "endDate",
    "timezone",
    "venue",
    "city",
    "state",
    "country",
    "address",
  ])
  if (field === "organizerId") return "organizer"
  if (basic.has(field)) return "basic"
  return "basic"
}
