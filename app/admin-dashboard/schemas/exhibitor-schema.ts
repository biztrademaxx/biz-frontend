import { z } from "zod"
import { emailSchema, optionalEmailSchema, requiredTrimmed } from "./common"

export const addExhibitorFormSchema = z.object({
  firstName: requiredTrimmed("First name"),
  lastName: requiredTrimmed("Last name"),
  email: emailSchema,
  phone: z.string().optional().default(""),
  company: requiredTrimmed("Company name"),
  jobTitle: z.string().optional().default(""),
  companyIndustry: requiredTrimmed("Industry"),
  website: z.string().optional().default(""),
  linkedin: z.string().optional().default(""),
  twitter: z.string().optional().default(""),
  location: z.string().optional().default(""),
  country: z.string().optional().default(""),
  state: z.string().optional().default(""),
  city: z.string().optional().default(""),
  businessEmail: optionalEmailSchema,
  businessPhone: z.string().optional().default(""),
  businessAddress: z.string().optional().default(""),
  taxId: z.string().optional().default(""),
  bio: z.string().optional().default(""),
  isActive: z.boolean().optional().default(true),
})

export type AddExhibitorFormValues = z.infer<typeof addExhibitorFormSchema>
