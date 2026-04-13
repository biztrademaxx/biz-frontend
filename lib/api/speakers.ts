// API functions for speaker data fetching
export interface Speaker {
  id: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  avatar?: string
  bio?: string
  company?: string
  jobTitle?: string
  location?: string
  website?: string
  linkedin?: string
  twitter?: string
  specialties: string[]
  achievements: string[]
  certifications: string[]
  speakingExperience?: string
  createdAt: string
}

export interface SpeakerProfile {
  fullName: string
  designation: string
  company: string
  email: string
  phone: string
  linkedin: string
  website: string
  location: string
  bio: string
  speakingExperience: string
}

export interface SpeakersResponse {
  success: boolean
  speakers: Speaker[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

export interface SpeakerProfileResponse {
  success: boolean
  profile: SpeakerProfile
  error?: string
}

// Fetch all speakers with pagination and search
export async function fetchSpeakers(params?: {
  page?: number
  limit?: number
  search?: string
}): Promise<SpeakersResponse> {
  const searchParams = new URLSearchParams()

  if (params?.page) searchParams.set("page", params.page.toString())
  if (params?.limit) searchParams.set("limit", params.limit.toString())
  if (params?.search) searchParams.set("search", params.search)

  const response = await fetch(`/api/speakers?${searchParams.toString()}`)

  if (!response.ok) {
    throw new Error("Failed to fetch speakers")
  }

  return response.json()
}

// Fetch single speaker profile
export async function fetchSpeakerProfile(id: string): Promise<SpeakerProfileResponse> {
  const response = await fetch(`/api/speakers/${id}`)

  if (!response.ok) {
    throw new Error("Failed to fetch speaker profile")
  }

  return response.json()
}

// Update speaker profile
export async function updateSpeakerProfile(
  id: string,
  profile: Partial<SpeakerProfile>,
): Promise<SpeakerProfileResponse> {
  const response = await fetch(`/api/speakers/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(profile),
  })

  if (!response.ok) {
    throw new Error("Failed to update speaker profile")
  }

  return response.json()
}

// Create new speaker
export async function createSpeaker(
  speakerData: Omit<Speaker, "id" | "createdAt">,
): Promise<{ success: boolean; speaker: Speaker; message: string }> {
  const response = await fetch("/api/speakers", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(speakerData),
  })

  if (!response.ok) {
    throw new Error("Failed to create speaker")
  }

  return response.json()
}
