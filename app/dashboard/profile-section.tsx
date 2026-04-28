"use client"


import { devLog } from "@/lib/dev-log"

import type React from "react"

import { useState, useEffect, useCallback, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  Edit,
  Mail,
  Phone,
  Globe,
  Save,
  X,
  Briefcase,
  UserIcon,
  Linkedin,
  Twitter,
  Instagram,
  Calendar,
  CalendarDays,
  Loader2,
  BriefcaseBusiness,
  Building2,
  Filter,
  Camera,
} from "lucide-react"
import { DynamicCalendar } from "./DynamicCalander"
import type { UserData } from "@/types/user"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"
import { apiFetch } from "@/lib/api"
import { eventPublicPath } from "@/lib/event-path"

interface ProfileSectionProps {
  userData: UserData
  organizerId: string
  onUpdate: (data: Partial<UserData>) => void
}

const INTEREST_OPTIONS = [
  "Education & Training",
  "Medical & Pharma",
  "IT & Technology",
  "Banking & Finance",
  "Business Services",
  "Industrial Engineering",
  "Building & Construction",
  "Power & Energy",
  "Entertainment & Media",
  "Wellness, Health & Fitness",
  "Science & Research",
  "Environment & Waste",
  "Agriculture & Forestry",
  "Food & Beverages",
  "Logistics & Transportation",
  "Electric & Electronics",
  "Arts & Crafts",
  "Auto & Automotive",
  "Home & Office",
  "Security & Defense",
  "Fashion & Beauty",
  "Travel & Tourism",
  "Telecommunication",
  "Apparel & Clothing",
  "Animals & Pets",
  "Baby, Kids & Maternity",
  "Hospitality",
  "Packing & Packaging",
  "Miscellaneous",
]

interface FormData {
  email: string
  firstName: string
  lastName: string
  avatar: string
  phone: string
  bio: string
  website: string
  company: string
  jobTitle: string
  companyIndustry: string
  linkedin: string
  twitter: string
  instagram: string
  interests: string[]
}

interface Event {
  tags: any
  id: string
  title: string
  description: string
  date: string
  organizer?: string
}

export function ProfileSection({ organizerId, userData, onUpdate }: ProfileSectionProps) {
  const initialFormData: FormData = {
    email: userData?.email || "",
    avatar: userData?.avatar || "",
    firstName: userData?.firstName || "",
    lastName: userData?.lastName || "",
    phone: userData?.phone || "",
    bio: userData?.bio || "",
    website: userData?.website || "",
    company: userData?.company || "",
    jobTitle: userData?.jobTitle || "",
    companyIndustry: userData?.companyIndustry || "",
    linkedin: userData?.linkedin || "",
    twitter: userData?.twitter || "",
    instagram: userData?.instagram || "",
    interests: userData?.interests || [],
  }

  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState<FormData>(initialFormData)
  const [events, setEvents] = useState<Event[]>([])
  const [loadingEvents, setLoadingEvents] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [localUserData, setLocalUserData] = useState<UserData>(userData)
  const [selectedInterests, setSelectedInterests] = useState<string[]>(userData?.interests || [])

  /** Stable when parent passes a new `userData` object reference with the same fields (avoids effect churn). */
  const userDataSyncKey = useMemo(
    () =>
      JSON.stringify({
        id: userData.id,
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        phone: userData.phone,
        avatar: userData.avatar,
        bio: userData.bio,
        website: userData.website,
        company: userData.company,
        companyIndustry: userData.companyIndustry,
        jobTitle: userData.jobTitle,
        linkedin: userData.linkedin,
        twitter: userData.twitter,
        instagram: userData.instagram,
        interests: userData.interests,
      }),
    [userData],
  )
  const [displayedEvents, setDisplayedEvents] = useState<Event[]>([])
  const [selectedEventFilter, setSelectedEventFilter] = useState<string>("all")
  const [connectionsCount, setConnectionsCount] = useState<number>(0)
  const [interestedEventsCount, setInterestedEventsCount] = useState<number>(0)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    devLog("[v0] Avatar upload triggered")
    const file = e.target.files?.[0]
    if (!file) {
      devLog("[v0] No file selected")
      return
    }

    if (!file.type.startsWith("image/")) {
      alert("Please select an image file")
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("Image size should be less than 5MB")
      return
    }

    try {
      setUploadingAvatar(true)
      devLog("[v0] Uploading avatar to Cloudinary...")

      const uploadFormData = new FormData()
      uploadFormData.append("file", file)
      uploadFormData.append("type", "image")

      const uploadData = await apiFetch<{ url: string }>("/api/upload/cloudinary", {
        method: "POST",
        body: uploadFormData,
        auth: true,
      })

      const avatarUrl = uploadData.url
      devLog("[v0] Avatar uploaded successfully:", avatarUrl)

      devLog("[v0] Updating user profile with new avatar...")
      const updatedUser = await apiFetch<{ user?: any; data?: any }>(`/api/users/${localUserData.id}`, {
        method: "PUT",
        body: { avatar: avatarUrl },
        auth: true,
      }).then((r) => r.user ?? r.data)
      if (!updatedUser) {
        throw new Error("Failed to update avatar")
      }
      devLog("[v0] Avatar updated successfully in database")

      setLocalUserData((prev) => ({ ...prev, avatar: avatarUrl }))
      setFormData((prev) => ({ ...prev, avatar: avatarUrl }))
      onUpdate({ avatar: avatarUrl })
    } catch (error) {
      console.error("[v0] Error uploading avatar:", error)
      alert("Failed to upload avatar. Please try again.")
    } finally {
      setUploadingAvatar(false)
    }
  }

  const filteredEvents =
    selectedInterests.length > 0
      ? events.filter((event) => event.tags?.some((tag: string) => selectedInterests.includes(tag)))
      : events

  const titleFilteredEvents =
    selectedEventFilter === "all"
      ? filteredEvents
      : filteredEvents.filter((event) => event.title.toLowerCase().includes(selectedEventFilter.toLowerCase()))

  const uniqueEventTitles = Array.from(new Set(events.map((event) => event.title)))

  const shuffleEvents = useCallback(() => {
    if (titleFilteredEvents.length <= 10) {
      setDisplayedEvents(titleFilteredEvents)
    } else {
      const shuffled = [...titleFilteredEvents].sort(() => Math.random() - 0.5)
      setDisplayedEvents(shuffled.slice(0, 10))
    }
  }, [titleFilteredEvents])

  useEffect(() => {
    shuffleEvents()
  }, [titleFilteredEvents.length, selectedEventFilter])

  useEffect(() => {
    if (titleFilteredEvents.length > 10) {
      const interval = setInterval(() => {
        shuffleEvents()
      }, 180000)

      return () => clearInterval(interval)
    }
  }, [titleFilteredEvents.length])

  useEffect(() => {
    setLocalUserData(userData)
  }, [userDataSyncKey, userData])

  useEffect(() => {
    setFormData({
      email: localUserData?.email || "",
      firstName: localUserData?.firstName || "",
      lastName: localUserData?.lastName || "",
      avatar: localUserData?.avatar || "",
      phone: localUserData?.phone || "",
      bio: localUserData?.bio || "",
      website: localUserData?.website || "",
      company: localUserData?.company || "",
      companyIndustry: localUserData?.companyIndustry ?? userData?.companyIndustry ?? "",
      jobTitle: localUserData?.jobTitle || "",
      linkedin: localUserData?.linkedin || "",
      twitter: localUserData?.twitter || "",
      instagram: localUserData?.instagram || "",
      interests: localUserData?.interests || [],
    })
    setSelectedInterests(localUserData?.interests || [])
  }, [localUserData, userDataSyncKey, userData])

  const handleSave = useCallback(async () => {
    setIsSaving(true)
    setSaveError(null)

    try {
      const response = await apiFetch<{ user?: any; data?: any }>(`/api/users/${localUserData.id}`, {
        method: "PUT",
        body: formData,
        auth: true,
      })
      const updatedUser = response?.user ?? response?.data
      if (!updatedUser) {
        throw new Error("Failed to update profile")
      }
      setLocalUserData((prev) => ({ ...prev, ...updatedUser }))
      setSelectedInterests(updatedUser.interests || [])
      onUpdate(updatedUser)
      setIsEditing(false)
    } catch (error) {
      console.error("Error updating profile:", error)
      setSaveError(error instanceof Error ? error.message : "Failed to update profile")
    } finally {
      setIsSaving(false)
    }
  }, [formData, localUserData.id, onUpdate])

  const handleCancel = useCallback(() => {
    setFormData({
      email: localUserData?.email || "",
      firstName: localUserData?.firstName || "",
      lastName: localUserData?.lastName || "",
      phone: localUserData?.phone || "",
      avatar: localUserData?.avatar || "",
      bio: localUserData?.bio || "",
      website: localUserData?.website || "",
      company: localUserData?.company || "",
      companyIndustry: userData?.companyIndustry || "",
      jobTitle: localUserData?.jobTitle || "",
      linkedin: localUserData?.linkedin || "",
      twitter: localUserData?.twitter || "",
      instagram: localUserData?.instagram || "",
      interests: localUserData?.interests || [],
    })
    setIsEditing(false)
    setSaveError(null)
  }, [localUserData])

  useEffect(() => {
    async function fetchEvents() {
      try {
        setLoadingEvents(true)
        const res = await fetch(`/api/events/recent`)
        if (!res.ok) throw new Error("Failed to fetch events")
        const data = await res.json()
        setEvents(Array.isArray(data) ? data : [])
      } catch (err) {
        console.error("Error fetching recent events:", err)
        setEvents([])
      } finally {
        setLoadingEvents(false)
      }
    }
    fetchEvents()
  }, [])

  const fetchConnectionsCount = useCallback(async () => {
    try {
      const data = await apiFetch<{ connections?: any[]; data?: any[] }>("/api/connections", { auth: true })
      const list = data.connections ?? data.data ?? []
      const connected = Array.isArray(list) ? list.filter((c: any) => c.status === "connected") : []
      setConnectionsCount(connected.length)
    } catch (error) {
      console.error("Error fetching connections:", error)
    }
  }, [userData?.id])

  const fetchInterestedEventsCount = useCallback(async () => {
    try {
      const data = await apiFetch<{ events?: any[]; data?: any[] }>(`/api/users/${userData.id}/interested-events`, { auth: true })
      const list = data.events ?? data.data ?? []
      setInterestedEventsCount(Array.isArray(list) ? list.length : 0)
    } catch (error) {
      console.error("Error fetching interested events:", error)
    }
  }, [userData.id])

  useEffect(() => {
    fetchConnectionsCount()
    fetchInterestedEventsCount()
  }, [fetchConnectionsCount, fetchInterestedEventsCount])

  return (
    <div className="space-y-6 p-6 bg-gray-50 min-h-screen">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
        {!isEditing ? (
          <Button variant="outline" onClick={() => setIsEditing(true)} className="flex items-center gap-2">
            <Edit className="w-4 h-4" /> Edit Profile
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button onClick={handleSave} className="flex items-center gap-2" disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" /> Save
                </>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={handleCancel}
              className="flex items-center gap-2 bg-transparent"
              disabled={isSaving}
            >
              <X className="w-4 h-4" /> Cancel
            </Button>
          </div>
        )}
      </div>

      {saveError && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">{saveError}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardContent className="p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="relative">
                <Avatar className="w-20 h-20">
                  <AvatarImage src={localUserData.avatar || "/image/Ellipse 72.png"} />
                  <AvatarFallback className="text-2xl">
                    {localUserData.firstName?.[0]}
                    {localUserData.lastName?.[0]}
                  </AvatarFallback>
                </Avatar>
                {isEditing && (
                  <>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      className="hidden"
                      id="avatar-upload"
                      disabled={uploadingAvatar}
                    />
                    <label
                      htmlFor="avatar-upload"
                      className="absolute bottom-0 right-0 w-7 h-7 bg-blue-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-blue-700 transition-colors z-10 shadow-lg"
                      onClick={(e) => {
                        devLog("[v0] Camera button clicked")
                        // Ensure the click propagates to trigger the file input
                      }}
                    >
                      {uploadingAvatar ? (
                        <Loader2 className="w-4 h-4 text-white animate-spin" />
                      ) : (
                        <Camera className="w-4 h-4 text-white" />
                      )}
                    </label>
                  </>
                )}
              </div>
              <div>
                <h2 className="text-xl font-semibold">
                  {localUserData.firstName} {localUserData.lastName}
                </h2>
                <p className="text-gray-600">
                  {localUserData.jobTitle || (localUserData.role === "ATTENDEE" ? "Visitor" : localUserData.role)}
                </p>
                {localUserData.isVerified && (
                  <Badge variant="secondary" className="mt-1">
                    Verified
                  </Badge>
                )}
              </div>
            </div>

            {!isEditing ? (
              <div className="flex justify-center gap-3 mb-6">
                <a
                  href={localUserData.linkedin || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Linkedin size={18} />
                </a>
                <a
                  href={localUserData.twitter || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full flex items-center justify-center bg-sky-400 hover:bg-sky-500 text-white"
                >
                  <Twitter size={18} />
                </a>
                <a
                  href={localUserData.instagram || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-tr from-purple-500 via-pink-500 to-yellow-500 text-white"
                >
                  <Instagram size={18} />
                </a>
                <a
                  href={localUserData.website || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-600 hover:bg-gray-700 text-white"
                >
                  <Globe size={18} />
                </a>
              </div>
            ) : (
              <div className="space-y-3 mb-6">
                <div>
                  <Label>LinkedIn</Label>
                  <Input
                    value={formData.linkedin}
                    onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Twitter</Label>
                  <Input
                    value={formData.twitter}
                    onChange={(e) => setFormData({ ...formData, twitter: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Instagram</Label>
                  <Input
                    value={formData.instagram}
                    onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Website</Label>
                  <Input
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  />
                </div>
              </div>
            )}

            {isEditing ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>First Name</Label>
                    <Input
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    />
                  </div>

                  <div>
                    <Label>Last Name</Label>
                    <Input
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    />
                  </div>

                  <div>
                    <Label>Email</Label>
                    <Input
                      type="email"
                      value={formData.email}
                      disabled
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>

                  <div>
                    <Label>Contact Number</Label>
                    <Input
                      value={formData.phone}
                      disabled
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>

                  <div>
                    <Label>Position</Label>
                    <Input
                      value={formData.jobTitle}
                      onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                    />
                  </div>

                  <div>
                    <Label>Company</Label>
                    <Input
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    />
                  </div>

                  <div>
                    <Label>Company Field</Label>
                    <Input
                      value={formData.companyIndustry}
                      onChange={(e) => setFormData({ ...formData, companyIndustry: e.target.value })}
                      placeholder="e.g. Fintech, Education, Healthcare"
                    />
                  </div>

                  <div>
                    <Label>Interests</Label>
                    <Select
                      onValueChange={(value) => {
                        if (!formData.interests.includes(value)) {
                          setFormData({
                            ...formData,
                            interests: [...formData.interests, value],
                          })
                        }
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select interest" />
                      </SelectTrigger>
                      <SelectContent>
                        {INTEREST_OPTIONS.map((option) => (
                          <SelectItem key={option} value={option}>
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <div className="flex gap-2 flex-wrap mt-2">
                      {formData.interests.map((int, idx) => (
                        <Badge
                          key={idx}
                          variant="secondary"
                          className="cursor-pointer"
                          onClick={() =>
                            setFormData({
                              ...formData,
                              interests: formData.interests.filter((i) => i !== int),
                            })
                          }
                        >
                          {int} ✕
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <Label>Bio</Label>
                  <Textarea
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    rows={3}
                  />
                </div>
              </>
            ) : (
              <div className="">
                <div className="flex items-center gap-2">
                  <Mail size={16} className="text-gray-500" />
                  <span className="font-medium">Email Address</span>
                  <span className="ml-auto">{localUserData.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone size={16} className="text-gray-500" />
                  <span className="font-medium">Contact</span>
                  <span className="ml-auto">{localUserData.phone || "9999879543"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Briefcase size={16} className="text-gray-500" />
                  <span className="font-medium">Position</span>
                  <span className="ml-auto">{localUserData.jobTitle || "CEO & Co-Founder"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Building2 size={16} className="text-gray-500" />
                  <span className="font-medium">Company</span>
                  <span className="ml-auto">{localUserData.company || "N/A"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <BriefcaseBusiness size={16} className="text-gray-500" />
                  <span className="font-medium">Industry</span>
                  <span className="ml-auto">{localUserData.companyIndustry || "N/A"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <UserIcon size={16} className="text-gray-500" />
                  <span className="font-medium">Interests</span>
                  <div className="ml-auto flex gap-2 flex-wrap">
                    {(localUserData.interests && localUserData.interests.length > 0
                      ? localUserData.interests
                      : ["All Interests"]
                    ).map((int, idx) => (
                      <Badge key={idx} variant="secondary">
                        {int}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="flex items-start gap-2 mt-4">
                  <UserIcon size={16} className="text-gray-500 mt-1" />
                  <div>
                    <span className="font-medium block mb-1">Bio</span>
                    <p className="text-gray-700">
                      {localUserData.bio ||
                        "The world's deposit sourcing has a commitment to reducing foreign prices at the Paris for Bagnette Collection Centre in Paris, France."}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 min-w-0">
            <Card className="bg-yellow-200 h-32 flex items-center justify-center overflow-hidden">
              <div className="text-center p-4 min-w-0 overflow-hidden">
                <Calendar className="w-8 h-8 mx-auto mb-2" />
                <h3 className="font-semibold truncate">Upcoming Events</h3>
                <p className="text-sm truncate">{interestedEventsCount} events</p>
              </div>
            </Card>
            <Card className="bg-blue-200 h-32 flex items-center justify-center overflow-hidden">
              <div className="text-center p-4 min-w-0 overflow-hidden">
                <CalendarDays className="w-8 h-8 mx-auto mb-2" />
                <h3 className="font-semibold truncate">Events</h3>
                <p className="text-sm truncate">{localUserData._count?.eventsAttended ?? events.length} events</p>
              </div>
            </Card>
            <Card className="bg-red-300 h-32 flex items-center justify-center overflow-hidden">
              <div className="text-center p-4 min-w-0 overflow-hidden">
                <UserIcon className="w-8 h-8 mx-auto mb-2" />
                <h3 className="font-semibold truncate">Connections</h3>
                <p className="text-sm truncate">{connectionsCount} total</p>
              </div>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="h-[500px]">
              <DynamicCalendar userId={userData.id} className="h-full w-full" />
            </div>

            <Card className="h-[500px] flex flex-col">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle>Suggested Events</CardTitle>
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-gray-500" />
                    <Select value={selectedEventFilter} onValueChange={setSelectedEventFilter}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Filter by event" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Events</SelectItem>
                        {uniqueEventTitles.map((title) => (
                          <SelectItem key={title} value={title}>
                            {title.length > 20 ? `${title.substring(0, 20)}...` : title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                {selectedEventFilter !== "all" && (
                  <p className="text-sm text-gray-500">
                    Showing {displayedEvents.length} events matching "{selectedEventFilter}"
                  </p>
                )}
              </CardHeader>
              <CardContent className="flex-1 overflow-y-auto space-y-4">
                {loadingEvents ? (
                  <p className="text-gray-500 text-sm">Loading events...</p>
                ) : displayedEvents.length === 0 ? (
                  <p className="text-gray-500 text-sm">
                    {selectedEventFilter === "all"
                      ? "No events found"
                      : `No events found matching "${selectedEventFilter}"`}
                  </p>
                ) : (
                  displayedEvents.map((event) => (
                    <Link
                      key={event.id}
                      href={eventPublicPath(event)}
                      className="block p-3 rounded-lg border border-gray-200 hover:bg-blue-50 transition-colors"
                    >
                      <p className="font-semibold text-sm truncate">{event.title}</p>
                      <p className="text-xs text-gray-600 line-clamp-2">{event.description}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(event.date).toLocaleDateString()} {event.organizer && `• ${event.organizer}`}
                      </p>
                    </Link>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
