import { z } from "zod"
import { emailSchema, requiredTrimmed } from "./common"

export const addSpeakerFormSchema = z.object({
  firstName: requiredTrimmed("First name"),
  lastName: requiredTrimmed("Last name"),
  email: emailSchema,
  phone: z.string().optional().default(""),
  bio: z.string().optional().default(""),
  company: z.string().optional().default(""),
  jobTitle: z.string().optional().default(""),
  location: z.string().optional().default(""),
  country: z.string().optional().default(""),
  state: z.string().optional().default(""),
  city: z.string().optional().default(""),
  website: z.string().optional().default(""),
  linkedin: z.string().optional().default(""),
  twitter: z.string().optional().default(""),
  instagram: z.string().optional().default(""),
  facebook: z.string().optional().default(""),
  speakingExperience: z.string().optional().default(""),
})

export type AddSpeakerFormValues = z.infer<typeof addSpeakerFormSchema>
