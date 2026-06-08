import { z } from "zod"
import { emailSchema, optionalEmailSchema, requiredTrimmed } from "./common"

export const addOrganizerFormSchema = z.object({
  firstName: requiredTrimmed("First name"),
  lastName: requiredTrimmed("Last name"),
  email: emailSchema,
  phone: z.string().optional().default(""),
  organizationName: requiredTrimmed("Organization name"),
  description: z.string().optional().default(""),
  headquarters: z.string().optional().default(""),
  country: z.string().optional().default(""),
  state: z.string().optional().default(""),
  city: z.string().optional().default(""),
  founded: z.string().optional().default(""),
  teamSize: z.string().optional().default(""),
  specialties: z.array(z.string()).optional().default([]),
  businessEmail: optionalEmailSchema,
  businessPhone: z.string().optional().default(""),
  businessAddress: z.string().optional().default(""),
  taxId: z.string().optional().default(""),
})

export type AddOrganizerFormValues = z.infer<typeof addOrganizerFormSchema>
