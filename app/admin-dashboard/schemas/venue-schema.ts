import { z } from "zod"
import { emailSchema, requiredTrimmed } from "./common"

export const addVenueFormSchema = z.object({
  venueName: requiredTrimmed("Venue name"),
  contactPerson: requiredTrimmed("Contact person"),
  email: emailSchema,
  mobile: z.string().optional().default(""),
  address: requiredTrimmed("Address"),
  city: z.string().optional().default(""),
  state: z.string().optional().default(""),
  country: z.string().optional().default(""),
  website: z.string().optional().default(""),
  googleMapLink: z.string().optional().default(""),
  description: requiredTrimmed("Description"),
  minCapacity: z.coerce.number().int().min(1, "Min capacity must be at least 1"),
  maxCapacity: z.coerce.number().int().min(1, "Max capacity must be at least 1"),
  totalHalls: z.coerce.number().int().min(1, "At least 1 hall required"),
  emergencyExits: z.coerce.number().int().min(1, "At least 1 emergency exit required"),
  safetyInfo: z.string().optional().default(""),
  managerName: z.string().optional().default(""),
  managerPhone: z.string().optional().default(""),
  isVerified: z.boolean().optional().default(false),
  status: z.enum(["active", "suspended"]).optional().default("active"),
}).superRefine((data, ctx) => {
  if (data.maxCapacity < data.minCapacity) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Max capacity must be greater than or equal to min capacity",
      path: ["maxCapacity"],
    })
  }
})

export type AddVenueFormValues = z.infer<typeof addVenueFormSchema>
