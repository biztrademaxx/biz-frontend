"use client"

import { devLog } from "@/lib/dev-log"

import type React from "react"

import { useState, useEffect, useCallback, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
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
  Camera,
  MapPin,
} from "lucide-react"
import {
  ProfileLocationFields,
  formatProfileLocationLine,
  profileLocationFromLegacy,
  type ProfileLocationValue,
} from "@/components/location/ProfileLocationFields"
import type { UserData } from "@/types/user"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { apiFetch } from "@/lib/api"
import { cn } from "@/lib/utils"
import { useDashboard } from "@/contexts/dashboard-context"

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
  profileCity: string
  profileState: string
  profileCountry: string
}

function getProfileLocationFromUser(user: UserData): ProfileLocationValue {
  const loc = user.location
  if (loc && typeof loc === "object") {
    return profileLocationFromLegacy(null, {
      city: loc.city,
      state: loc.state,
      country: loc.country,
    })
  }
  return profileLocationFromLegacy(typeof loc === "string" ? loc : null, {
    city: user.profileCity ?? "",
    state: user.profileState ?? "",
    country: user.profileCountry ?? "",
  })
}

export function ProfileSection({ organizerId, userData, onUpdate }: ProfileSectionProps) {
  const { setActiveSection } = useDashboard()

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
    ...(() => {
      const loc = getProfileLocationFromUser(userData)
      return { profileCity: loc.city, profileState: loc.state, profileCountry: loc.country }
    })(),
  }

  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState<FormData>(initialFormData)
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [localUserData, setLocalUserData] = useState<UserData>(userData)
  const [connectionsCount, setConnectionsCount] = useState<number>(0)
  const [interestedEventsCount, setInterestedEventsCount] = useState<number>(0)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)

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
        profileCity: userData.profileCity,
        profileState: userData.profileState,
        profileCountry: userData.profileCountry,
        location: userData.location,
      }),
    [userData],
  )

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
      ...(() => {
        const loc = getProfileLocationFromUser(localUserData)
        return { profileCity: loc.city, profileState: loc.state, profileCountry: loc.country }
      })(),
    })
  }, [localUserData, userDataSyncKey, userData])

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
      ...(() => {
        const loc = getProfileLocationFromUser(localUserData)
        return { profileCity: loc.city, profileState: loc.state, profileCountry: loc.country }
      })(),
    })
    setIsEditing(false)
    setSaveError(null)
  }, [localUserData, userData])

  const fetchConnectionsCount = useCallback(async () => {
    try {
      const data = await apiFetch<{ connections?: any[]; data?: any[] }>("/api/connections", { auth: true })
      const list = data.connections ?? data.data ?? []
      const connected = Array.isArray(list) ? list.filter((c: any) => c.status === "connected") : []
      setConnectionsCount(connected.length)
    } catch (error) {
      console.error("Error fetching connections:", error)
    }
  }, [])

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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">Profile</h1>
          <p className="mt-1 text-sm text-slate-500">Your details and activity summary</p>
        </div>
        {!isEditing ? (
          <Button
            variant="outline"
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 border-[#004A96]/35 bg-white/55 text-[#004A96] shadow-sm backdrop-blur-sm hover:bg-[#004A96]/10"
          >
            <Edit className="h-4 w-4" /> Edit profile
          </Button>
        ) : (
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={handleSave}
              className="flex items-center gap-2 bg-[#004A96] text-white hover:bg-[#003d7a]"
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" /> Save
                </>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={handleCancel}
              className="flex items-center gap-2 border-slate-200/80 bg-white/50 backdrop-blur-sm"
              disabled={isSaving}
            >
              <X className="h-4 w-4" /> Cancel
            </Button>
          </div>
        )}
      </div>

      {saveError && (
        <div className="rounded-xl border border-[#FF131C]/35 bg-[#FF131C]/10 px-4 py-3 text-sm text-red-800">
          {saveError}
        </div>
      )}

      {/* Stats Cards Row - 3 cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <button
          type="button"
          onClick={() => setActiveSection("upcoming-events")}
          className="group flex min-h-[8.5rem] flex-col justify-between rounded-2xl border border-white/70 bg-white/50 p-4 text-left shadow-[0_4px_24px_rgba(0,74,150,0.06)] backdrop-blur-md transition hover:border-[#004A96]/35 hover:bg-white/65 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#004A96]/30"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#004A96] to-[#003566] text-white shadow-md">
            <Calendar className="h-5 w-5" />
          </span>
          <div>
            <h3 className="text-sm font-semibold text-slate-800">Upcoming events</h3>
            <p className="mt-1 text-lg font-bold text-[#004A96]">{interestedEventsCount}</p>
            <p className="text-xs text-slate-500">Interested with future dates</p>
          </div>
        </button>
        <button
          type="button"
          onClick={() => setActiveSection("events")}
          className="group flex min-h-[8.5rem] flex-col justify-between rounded-2xl border border-white/70 bg-white/50 p-4 text-left shadow-[0_4px_24px_rgba(0,74,150,0.06)] backdrop-blur-md transition hover:border-[#004A96]/35 hover:bg-white/65 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#004A96]/30"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-xl border-2 border-[#004A96]/25 bg-[#004A96]/10 text-[#004A96]">
            <CalendarDays className="h-5 w-5" />
          </span>
          <div>
            <h3 className="text-sm font-semibold text-slate-800">Events</h3>
            <p className="mt-1 text-lg font-bold text-[#004A96]">{interestedEventsCount}</p>
            <p className="text-xs text-slate-500">Interested events</p>
          </div>
        </button>
        <button
          type="button"
          onClick={() => setActiveSection("connections")}
          className="group flex min-h-[8.5rem] flex-col justify-between rounded-2xl border border-white/70 bg-white/50 p-4 text-left shadow-[0_4px_24px_rgba(0,74,150,0.06)] backdrop-blur-md transition hover:border-[#FF131C]/35 hover:bg-white/65 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF131C]/25"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-xl border-2 border-[#FF131C]/25 bg-[#FF131C]/10 text-[#FF131C]">
            <UserIcon className="h-5 w-5" />
          </span>
          <div>
            <h3 className="text-sm font-semibold text-slate-800">Connections</h3>
            <p className="mt-1 text-lg font-bold text-[#FF131C]">{connectionsCount}</p>
            <p className="text-xs text-slate-500">Connected profiles</p>
          </div>
        </button>
      </div>

      {/* Profile Card */}
      <Card className="rounded-2xl border border-white/70 bg-white/55 shadow-[0_4px_24px_rgba(0,74,150,0.08)] backdrop-blur-md overflow-hidden">
        <CardContent className="p-6">
          {/* Avatar and Name */}
          <div className="flex items-center gap-6 mb-6">
            <div className="relative">
              <Avatar className="h-24 w-24 ring-4 ring-[#004A96]/20 ring-offset-2 ring-offset-white/50">
                <AvatarImage src={localUserData.avatar || "/image/Ellipse 72.png"} />
                <AvatarFallback className="bg-[#004A96]/10 text-2xl font-semibold text-[#004A96]">
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
                    className="absolute bottom-0 right-0 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-[#004A96] shadow-lg transition-colors hover:bg-[#003d7a]"
                  >
                    {uploadingAvatar ? (
                      <Loader2 className="h-4 w-4 animate-spin text-white" />
                    ) : (
                      <Camera className="h-4 w-4 text-white" />
                    )}
                  </label>
                </>
              )}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900">
                {localUserData.firstName} {localUserData.lastName}
              </h2>
              <p className="text-slate-600 mt-1">
                {localUserData.jobTitle || (localUserData.role === "ATTENDEE" ? "Visitor" : localUserData.role)}
              </p>
              {localUserData.isVerified && (
                <Badge variant="secondary" className="mt-2 border-[#004A96]/20 bg-[#004A96]/10 text-[#004A96]">
                  Verified
                </Badge>
              )}
            </div>
          </div>

          {/* Social Links */}
          {!isEditing ? (
            <div className="flex gap-3 mb-6">
              <a
                href={localUserData.linkedin || "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-[#004A96] text-white shadow-sm transition hover:bg-[#003d7a]"
              >
                <Linkedin size={18} />
              </a>
              <a
                href={localUserData.twitter || "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-sky-500 text-white shadow-sm transition hover:bg-sky-600"
              >
                <Twitter size={18} />
              </a>
              <a
                href={localUserData.instagram || "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-tr from-purple-500 via-pink-500 to-amber-400 text-white shadow-sm"
              >
                <Instagram size={18} />
              </a>
              <a
                href={localUserData.website || "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200/80 bg-white/60 text-slate-700 shadow-sm backdrop-blur-sm transition hover:border-[#004A96]/30 hover:text-[#004A96]"
              >
                <Globe size={18} />
              </a>
            </div>
          ) : (
            <div className="space-y-3 mb-6">
              <Input
                placeholder="LinkedIn URL"
                value={formData.linkedin}
                onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                className="border-white/60 bg-white/60 backdrop-blur-sm"
              />
              <Input
                placeholder="Twitter URL"
                value={formData.twitter}
                onChange={(e) => setFormData({ ...formData, twitter: e.target.value })}
                className="border-white/60 bg-white/60 backdrop-blur-sm"
              />
              <Input
                placeholder="Instagram URL"
                value={formData.instagram}
                onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                className="border-white/60 bg-white/60 backdrop-blur-sm"
              />
              <Input
                placeholder="Website URL"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                className="border-white/60 bg-white/60 backdrop-blur-sm"
              />
            </div>
          )}

          {/* Profile Details */}
          {!isEditing ? (
            <div className="space-y-0 overflow-hidden rounded-xl border border-white/50 bg-white/35">
              <div className="flex items-center gap-3 border-b border-white/50 px-4 py-3">
                <Mail size={16} className="shrink-0 text-[#004A96]" />
                <span className="text-sm font-medium text-slate-700 w-32">Email Address</span>
                <span className="flex-1 truncate text-sm text-slate-600">{localUserData.email}</span>
              </div>
              <div className="flex items-center gap-3 border-b border-white/50 px-4 py-3">
                <Phone size={16} className="shrink-0 text-[#004A96]" />
                <span className="text-sm font-medium text-slate-700 w-32">Contact</span>
                <span className="flex-1 truncate text-sm text-slate-600">{localUserData.phone || "Not provided"}</span>
              </div>
              <div className="flex items-center gap-3 border-b border-white/50 px-4 py-3">
                <Briefcase size={16} className="shrink-0 text-[#004A96]" />
                <span className="text-sm font-medium text-slate-700 w-32">Position</span>
                <span className="flex-1 truncate text-sm text-slate-600">{localUserData.jobTitle || "Not specified"}</span>
              </div>
              <div className="flex items-center gap-3 border-b border-white/50 px-4 py-3">
                <Building2 size={16} className="shrink-0 text-[#004A96]" />
                <span className="text-sm font-medium text-slate-700 w-32">Company</span>
                <span className="flex-1 truncate text-sm text-slate-600">{localUserData.company || "N/A"}</span>
              </div>
              <div className="flex items-center gap-3 border-b border-white/50 px-4 py-3">
                <BriefcaseBusiness size={16} className="shrink-0 text-[#004A96]" />
                <span className="text-sm font-medium text-slate-700 w-32">Industry</span>
                <span className="flex-1 truncate text-sm text-slate-600">{localUserData.companyIndustry || "N/A"}</span>
              </div>
              <div className="flex items-center gap-3 border-b border-white/50 px-4 py-3">
                <MapPin size={16} className="shrink-0 text-[#004A96]" />
                <span className="text-sm font-medium text-slate-700 w-32">Location</span>
                <span className="flex-1 truncate text-sm text-slate-600">{displayLocation || "Not specified"}</span>
              </div>
              <div className="flex items-center gap-3 border-b border-white/50 px-4 py-3">
                <UserIcon size={16} className="shrink-0 text-[#004A96]" />
                <span className="text-sm font-medium text-slate-700 w-32">Interests</span>
                <div className="flex-1 flex flex-wrap gap-2">
                  {(localUserData.interests && localUserData.interests.length > 0
                    ? localUserData.interests
                    : ["All Interests"]
                  ).map((int, idx) => (
                    <Badge
                      key={idx}
                      variant="secondary"
                      className="border-[#004A96]/15 bg-[#004A96]/10 text-[#004A96]"
                    >
                      {int}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="flex items-start gap-3 px-4 py-4">
                <UserIcon size={16} className="mt-0.5 shrink-0 text-[#004A96]" />
                <span className="text-sm font-medium text-slate-700 w-32">Bio</span>
                <p className="flex-1 text-sm leading-relaxed text-slate-600">
                  {localUserData.bio || "No bio provided"}
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>First Name</Label>
                  <Input
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="border-white/60 bg-white/60 backdrop-blur-sm"
                  />
                </div>
                <div>
                  <Label>Last Name</Label>
                  <Input
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="border-white/60 bg-white/60 backdrop-blur-sm"
                  />
                </div>
              </div>
              <div>
                <Label>Position</Label>
                <Input
                  value={formData.jobTitle}
                  onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                  className="border-white/60 bg-white/60 backdrop-blur-sm"
                />
              </div>
              <div>
                <Label>Company</Label>
                <Input
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  className="border-white/60 bg-white/60 backdrop-blur-sm"
                />
              </div>
              <div>
                <Label>Industry</Label>
                <Input
                  value={formData.companyIndustry}
                  onChange={(e) => setFormData({ ...formData, companyIndustry: e.target.value })}
                  placeholder="e.g. Fintech, Education"
                  className="border-white/60 bg-white/60 backdrop-blur-sm"
                />
              </div>
              <div>
                <Label>Location</Label>
                <ProfileLocationFields
                  value={{
                    city: formData.profileCity,
                    state: formData.profileState,
                    country: formData.profileCountry,
                  }}
                  onChange={(next) =>
                    setFormData({
                      ...formData,
                      profileCity: next.city,
                      profileState: next.state,
                      profileCountry: next.country,
                    })
                  }
                  className="mt-1"
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
                  <SelectTrigger className="border-white/60 bg-white/60 backdrop-blur-sm">
                    <SelectValue placeholder="Add interest" />
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
                      className="cursor-pointer border-[#004A96]/20 bg-[#004A96]/10 text-[#004A96]"
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
              <div>
                <Label>Bio</Label>
                <Textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  rows={4}
                  className="border-white/60 bg-white/60 backdrop-blur-sm"
                  placeholder="Tell us about yourself..."
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}