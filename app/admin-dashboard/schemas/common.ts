import { z } from "zod"

export const requiredTrimmed = (label: string) =>
  z.string().trim().min(1, `${label} is required`)

export const emailSchema = z
  .string()
  .trim()
  .min(1, "Email is required")
  .email("Enter a valid email address")

export const optionalEmailSchema = z
  .string()
  .trim()
  .optional()
  .default("")
  .refine((v) => !v || z.string().email().safeParse(v).success, "Enter a valid email address")

export function zodFieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {}
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "")
    if (key && !out[key]) out[key] = issue.message
  }
  return out
}

export function rhfFieldErrors(
  errors: Record<string, { message?: string } | undefined>
): Record<string, string> {
  const out: Record<string, string> = {}
  for (const [key, err] of Object.entries(errors)) {
    if (err?.message) out[key] = err.message
  }
  return out
}
