export interface Speaker {
  id: string
  name: string
  email: string
  phone: string
  avatar: string
  title: string
  company: string
  location: string
  expertise: string[]
  bio: string
  rating: number
  totalSessions: number
  upcomingSessions: number
  totalEarnings: number
  status: "active" | "inactive" | "pending"
  verified: boolean
  joinedDate: string
  website: string
  socialMedia: {
    linkedin: string
    twitter: string
  }
  speakingFee: number
  availability: "available" | "busy" | "unavailable"
  languages: string[]
  experience: string
  lastLogin?: Date
  createdAt: Date
}

export interface SpeakerStats {
  totalSpeakers: number
  activeSpeakers: number
  pendingSpeakers: number
  totalRevenue: number
}

export interface SpeakerFilters {
  search?: string
  status?: string
  page?: number
  limit?: number
}