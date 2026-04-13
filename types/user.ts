// types/user.ts
export interface UserData {
  companyIndustry: string
  id: string
  email: string
  firstName: string
  lastName: string
  /** From backend getDisplayName(role, …) */
  displayName?: string
  organizationName?: string | null
  phone?: string
  avatar?: string
  role: string
  bio?: string
  website?: string
  linkedin?: string
  twitter?: string
  instagram?: string
  company?: string
  jobTitle?: string
  interests?: string[]
  location?: {
    address: string
    city: string
    state: string
    country: string
  } | string  // optional: allow string for backward compatibility
  isVerified: boolean
  createdAt: string
  lastLogin?: string
  _count?: {
    eventsAttended: number
    eventsOrganized: number
    connections: number
  }
}
