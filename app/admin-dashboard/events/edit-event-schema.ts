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
    shortDescription: z.string().max(200, "Max 200 characters").optional().default(""),
    subTitle: z.string().max(200, "Max 200 characters").optional().default(""),
    edition: z.string().optional().default(""),
    date: z.string().min(1, "Start date is required"),
    endDate: z.string().min(1, "End date is required"),
    timezone: z.string().min(1, "Timezone is required"),
    maxCapacity: z.coerce.number().int().min(1, "Max capacity must be at least 1"),
    attendees: z.coerce.number().int().min(0).optional().default(0),
    ticketPrice: z.coerce.number().min(0).optional().default(0),
    eventType: z.string().min(1, "Event type is required"),
    currency: z.string().min(1, "Currency is required"),
    categoryNames: z.array(z.string()).min(1, "Select at least one category"),
    tagsInput: z.string().optional().default(""),
    status: editEventStatusEnum,
    featured: z.boolean(),
    vip: z.boolean(),
    isPublic: z.boolean(),
    isVerified: z.boolean(),
    youtubeVideoUrl: z
      .string()
      .optional()
      .default("")
      .refine((v) => !v.trim() || /^https?:\/\//i.test(v.trim()), "Enter a valid URL"),
    bannerImage: z.string().optional().default(""),
    thumbnailImage: z.string().optional().default(""),
    vipImage: z.string().optional().default(""),
    brochure: z.string().optional().default(""),
    layout: z.string().optional().default(""),
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
