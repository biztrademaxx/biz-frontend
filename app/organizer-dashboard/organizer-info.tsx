"use client"

import type React from "react"

import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import {
  Camera,
  Edit,
  Save,
  X,
  Plus,
  MapPin,
  Phone,
  Mail,
  Globe,
  Calendar,
  Award,
  Users,
  Building,
  Upload,
  Loader2,
} from "lucide-react"
import Image from "next/image"
import { apiFetch } from "@/lib/api"
import { getCityOptions, getCountryOptions, getStateOptions } from "@/lib/location-data"

const LOCATION_NONE = "__none__"

interface OrganizerData {
  id: string
  name: string
  description: string
  email: string
  phone: string
  website: string
  /** Legacy single-line HQ; prefer organizerCity / State / Country for display. */
  headquarters?: string
  organizerCountry: string
  organizerState: string
  organizerCity: string
  founded: string
  company: string
  teamSize: string
  avatar: string
  specialties: string[]
  achievements: string[]
  certifications: string[]
  firstName: string
  lastName: string
}

interface OrganizerInfoProps {
  organizerData: OrganizerData
  onOrganizerUpdated?: (data: OrganizerData) => void
}

export default function OrganizerInfo({ organizerData: initialData, onOrganizerUpdated }: OrganizerInfoProps) {
  const [isEditing, setIsEditing] = useState<string | null>(null)
  const [showImageUpload, setShowImageUpload] = useState(false)
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [newSpecialty, setNewSpecialty] = useState("")
  const [newAchievement, setNewAchievement] = useState("")
  const [newCertification, setNewCertification] = useState("")

  const [organizerData, setOrganizerData] = useState<OrganizerData>(() => ({
    ...initialData,
    organizerCountry: initialData.organizerCountry ?? "",
    organizerState: initialData.organizerState ?? "",
    organizerCity: initialData.organizerCity ?? "",
  }))

  // Keep local state in sync if parent data changes (e.g. after refetch)
  useEffect(() => {
    setOrganizerData({
      ...initialData,
      organizerCountry: initialData.organizerCountry ?? "",
      organizerState: initialData.organizerState ?? "",
      organizerCity: initialData.organizerCity ?? "",
    })
  }, [initialData])

  const countryOptions = useMemo(() => getCountryOptions(), [])
  const [countryPick, setCountryPick] = useState<string>(LOCATION_NONE)
  const [statePick, setStatePick] = useState<string>(LOCATION_NONE)
  const [cityPick, setCityPick] = useState<string>(LOCATION_NONE)

  useEffect(() => {
    if (isEditing !== "contact") return
    const countryName = (organizerData.organizerCountry || "").trim().toLowerCase()
    const countryCode = countryOptions.find((c) => c.name.trim().toLowerCase() === countryName)?.code
    setCountryPick(countryCode || LOCATION_NONE)
    const statesForCountry = getStateOptions(countryCode || "")
    const stateName = (organizerData.organizerState || "").trim().toLowerCase()
    const stateCode = statesForCountry.find((s) => s.name.trim().toLowerCase() === stateName)?.code
    setStatePick(stateCode || LOCATION_NONE)
    const citiesForState = getCityOptions(countryCode || "", stateCode || "")
    const cityName = (organizerData.organizerCity || "").trim().toLowerCase()
    const cityValue = citiesForState.find((c) => c.name.trim().toLowerCase() === cityName)?.name
    setCityPick(cityValue || LOCATION_NONE)
  }, [
    isEditing,
    organizerData.organizerCountry,
    organizerData.organizerState,
    organizerData.organizerCity,
    countryOptions,
  ])

  const resolvedCountryCode = useMemo(() => {
    if (countryPick !== LOCATION_NONE) return countryPick
    const typed = (organizerData.organizerCountry || "").trim().toLowerCase()
    if (!typed) return ""
    return countryOptions.find((c) => c.name.trim().toLowerCase() === typed)?.code ?? ""
  }, [countryPick, organizerData.organizerCountry, countryOptions])

  const stateOptions = useMemo(() => getStateOptions(resolvedCountryCode), [resolvedCountryCode])

  const resolvedStateCode = useMemo(() => {
    if (statePick !== LOCATION_NONE) return statePick
    const typed = (organizerData.organizerState || "").trim().toLowerCase()
    if (!typed) return ""
    return stateOptions.find((s) => s.name.trim().toLowerCase() === typed)?.code ?? ""
  }, [statePick, organizerData.organizerState, stateOptions])

  const cityOptions = useMemo(
    () => getCityOptions(resolvedCountryCode, resolvedStateCode),
    [resolvedCountryCode, resolvedStateCode],
  )

  type Section = "basic" | "contact" | "company" | "specialties" | "achievements" | "certifications"

  const handleSave = async (section: Section) => {
    let payload: Partial<OrganizerData> = {}

    if (section === "basic") {
      payload = {
        company: organizerData.company,
        description: organizerData.description,
      }
    } else if (section === "contact") {
      payload = {
        email: organizerData.email,
        phone: organizerData.phone,
        website: organizerData.website,
        organizerCountry: organizerData.organizerCountry || null,
        organizerState: organizerData.organizerState || null,
        organizerCity: organizerData.organizerCity || null,
      }
    } else if (section === "company") {
      payload = {
        founded: organizerData.founded,
        teamSize: organizerData.teamSize,
      }
    } else {
      payload = { [section]: organizerData[section] as any }
    }

    try {
      setLoading(true)
      await apiFetch(`/api/organizers/${organizerData.id}`, {
        method: "PATCH",
        body: payload,
        auth: true,
      })

      toast.success("Changes saved successfully ✅")
      setIsEditing(null)
      onOrganizerUpdated?.(organizerData)
    } catch (error: any) {
      console.error("Save error:", error)
      toast.error(error.message || "An error occurred while saving changes ❌")
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    setIsEditing(null)
    setOrganizerData(initialData)
  }

  const addSpecialty = () => {
    if (newSpecialty.trim()) {
      setOrganizerData((prev) => ({
        ...prev,
        specialties: [...prev.specialties, newSpecialty.trim()],
      }))
      setNewSpecialty("")
    }
  }

  const removeSpecialty = (index: number) => {
    setOrganizerData((prev) => ({
      ...prev,
      specialties: prev.specialties.filter((_, i) => i !== index),
    }))
  }

  const addAchievement = () => {
    if (newAchievement.trim()) {
      setOrganizerData((prev) => ({
        ...prev,
        achievements: [...prev.achievements, newAchievement.trim()],
      }))
      setNewAchievement("")
    }
  }

  const removeAchievement = (index: number) => {
    setOrganizerData((prev) => ({
      ...prev,
      achievements: prev.achievements.filter((_, i) => i !== index),
    }))
  }

  const addCertification = () => {
    if (newCertification.trim()) {
      setOrganizerData((prev) => ({
        ...prev,
        certifications: [...prev.certifications, newCertification.trim()],
      }))
      setNewCertification("")
    }
  }

  const removeCertification = (index: number) => {
    setOrganizerData((prev) => ({
      ...prev,
      certifications: prev.certifications.filter((_, i) => i !== index),
    }))
  }

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file")
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size should be less than 5MB")
      return
    }

    try {
      setUploading(true)

      const { uploadFileViaProxy } = await import("@/components/organizer-create-event/upload-backend")
      const avatarUrl = await uploadFileViaProxy(file, "image")

      setOrganizerData((prev) => ({
        ...prev,
        avatar: avatarUrl,
      }))

      await apiFetch(`/api/organizers/${organizerData.id}`, {
        method: "PATCH",
        body: { avatar: avatarUrl },
        auth: true,
      })

      toast.success("Avatar updated successfully ✅")
      setShowImageUpload(false)
      onOrganizerUpdated?.({
        ...organizerData,
        avatar: avatarUrl,
      })
    } catch (error: any) {
      console.error("Avatar upload error:", error)
      toast.error(error.message || "Failed to upload avatar ❌")
    } finally {
      setUploading(false)
    }
  }

  const handleSpecialtiesDone = async () => {
    if (!organizerData.specialties || organizerData.specialties.length === 0) {
      toast.error("Please add at least one specialty before saving")
      return
    }
    await handleSave("specialties")
  }

  const handleAchievementsDone = async () => {
    if (!organizerData.achievements || organizerData.achievements.length === 0) {
      toast.error("Please add at least one achievement before saving")
      return
    }
    await handleSave("achievements")
  }

  const handleCertificationsDone = async () => {
    if (!organizerData.certifications || organizerData.certifications.length === 0) {
      toast.error("Please add at least one certification before saving")
      return
    }
    await handleSave("certifications")
  }

  return (
    <div className="w-full min-w-0 max-w-full space-y-4 sm:space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900 sm:text-2xl">Organization Information</h2>
        <p className="text-sm text-gray-600 sm:text-base">Manage your organization profile and details</p>
      </div>

      {/* Profile Header */}
      <Card className="gap-0 py-0">
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start sm:gap-6">
            <div className="relative shrink-0">
              {/* Avatar Container */}
              <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
                {organizerData.avatar ? (
                  <Image
                    src={organizerData.avatar}
                    alt="Organization Logo"
                    width={128}
                    height={128}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#004A96] to-[#004A96]">
                    <span className="text-4xl font-bold text-white">
                      {organizerData.firstName?.[0] || ''}{organizerData.lastName?.[0] || ''}
                    </span>
                  </div>
                )}
              </div>

              {/* Camera Button */}
              <Dialog open={showImageUpload} onOpenChange={setShowImageUpload}>
                <DialogTrigger asChild>
                  <Button size="sm" className="absolute -bottom-2 -right-2 rounded-full w-8 h-8 p-0 bg-[#004A96] hover:bg-[#003d7a]">
                    <Camera className="w-4 h-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="w-[calc(100vw-2rem)] max-w-lg">
                  <DialogHeader>
                    <DialogTitle>Upload Organization Logo</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                      {uploading ? (
                        <div className="flex flex-col items-center">
                          <Loader2 className="w-12 h-12 mx-auto text-[#004A96] mb-4 animate-spin" />
                          <p className="text-gray-600">Uploading avatar...</p>
                        </div>
                      ) : (
                        <>
                          <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                          <p className="text-gray-600 mb-2">Drag and drop your logo here, or click to browse</p>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="hidden"
                            id="image-upload"
                            disabled={uploading}
                          />
                          <label
                            htmlFor="image-upload"
                            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 cursor-pointer"
                          >
                            Choose Image
                          </label>
                        </>
                      )}
                    </div>
                    <p className="text-sm text-gray-500">
                      Recommended: Square image, at least 200x200px, PNG or JPG format
                    </p>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="flex-1 min-w-0 w-full text-center sm:text-left">
              {isEditing === "basic" ? (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="company">Organization Name</Label>
                    <Input
                      id="company"
                      value={organizerData.company}
                      onChange={(e) => setOrganizerData((prev) => ({ ...prev, company: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={organizerData.description}
                      onChange={(e) => setOrganizerData((prev) => ({ ...prev, description: e.target.value }))}
                      rows={3}
                      className="min-h-24 resize-y"
                    />
                  </div>
                  <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                    <Button onClick={() => handleSave("basic")} disabled={loading} className="w-full sm:w-auto">
                      {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                      Save
                    </Button>
                    <Button variant="outline" onClick={handleCancel} className="w-full sm:w-auto">
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="min-w-0">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between mb-2">
                    <h3 className="text-xl font-bold text-gray-900 sm:text-2xl break-words min-w-0">{organizerData.company}</h3>
                    <Button variant="outline" size="sm" onClick={() => setIsEditing("basic")} className="w-full sm:w-auto shrink-0">
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                  </div>
                  <p className="text-gray-600 leading-relaxed text-sm sm:text-base break-words whitespace-pre-wrap min-w-0">{organizerData.description}</p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card className="gap-0 py-0">
        <CardHeader className="px-4 sm:px-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Phone className="w-5 h-5 shrink-0" />
              Contact Information
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(isEditing === "contact" ? null : "contact")}
              className="w-full sm:w-auto shrink-0"
            >
              <Edit className="w-4 h-4 mr-2" />
              {isEditing === "contact" ? "Cancel" : "Edit"}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="px-4 sm:px-6">
          {isEditing === "contact" ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    value={organizerData.website}
                    onChange={(e) => setOrganizerData((prev) => ({ ...prev, website: e.target.value }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>Country</Label>
                  <Select
                    value={countryPick}
                    onValueChange={(value) => {
                      if (value === LOCATION_NONE) {
                        setOrganizerData((prev) => ({
                          ...prev,
                          organizerCountry: "",
                          organizerState: "",
                          organizerCity: "",
                        }))
                        setCountryPick(LOCATION_NONE)
                        setStatePick(LOCATION_NONE)
                        setCityPick(LOCATION_NONE)
                        return
                      }
                      const row = countryOptions.find((c) => c.code === value)
                      if (row) {
                        setOrganizerData((prev) => ({
                          ...prev,
                          organizerCountry: row.name,
                          organizerState: "",
                          organizerCity: "",
                        }))
                        setCountryPick(value)
                        setStatePick(LOCATION_NONE)
                        setCityPick(LOCATION_NONE)
                      }
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Choose country" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={LOCATION_NONE}>— None —</SelectItem>
                      {countryOptions.map((c) => (
                        <SelectItem key={c.code} value={c.code}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>State / Region</Label>
                  <Select
                    value={statePick}
                    onValueChange={(value) => {
                      if (value === LOCATION_NONE) {
                        setOrganizerData((prev) => ({
                          ...prev,
                          organizerState: "",
                          organizerCity: "",
                        }))
                        setStatePick(LOCATION_NONE)
                        setCityPick(LOCATION_NONE)
                        return
                      }
                      const state = stateOptions.find((s) => s.code === value)
                      if (state) {
                        setOrganizerData((prev) => ({
                          ...prev,
                          organizerState: state.name,
                          organizerCity: "",
                        }))
                        setStatePick(value)
                        setCityPick(LOCATION_NONE)
                      }
                    }}
                    disabled={!resolvedCountryCode}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue
                        placeholder={
                          !resolvedCountryCode ? "Choose country first" : "Choose state / region"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={LOCATION_NONE}>— None —</SelectItem>
                      {stateOptions.map((s) => (
                        <SelectItem key={s.code} value={s.code}>
                          {s.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>City</Label>
                  <Select
                    value={cityPick}
                    onValueChange={(value) => {
                      if (value === LOCATION_NONE) {
                        setOrganizerData((prev) => ({ ...prev, organizerCity: "" }))
                        setCityPick(LOCATION_NONE)
                        return
                      }
                      const city = cityOptions.find((c) => c.name === value)
                      if (city) {
                        setOrganizerData((prev) => ({ ...prev, organizerCity: city.name }))
                        setCityPick(value)
                      }
                    }}
                    disabled={!resolvedCountryCode || !resolvedStateCode}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue
                        placeholder={
                          !resolvedCountryCode
                            ? "Choose country first"
                            : !resolvedStateCode
                              ? "Choose state first"
                              : "Choose city"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={LOCATION_NONE}>— None —</SelectItem>
                      {cityOptions.map((city) => (
                        <SelectItem key={city.name} value={city.name}>
                          {city.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                <Button onClick={() => handleSave("contact")} disabled={loading} className="w-full sm:w-auto">
                  {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                  Save Changes
                </Button>
                <Button variant="outline" onClick={handleCancel} className="w-full sm:w-auto">
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div className="flex items-start gap-3 min-w-0">
                <Mail className="w-5 h-5 text-gray-400 shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-medium break-all">{organizerData.email}</p>
                </div>
              </div>
              <div className="flex items-start gap-3 min-w-0">
                <Phone className="w-5 h-5 text-gray-400 shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <p className="text-sm text-gray-600">Phone</p>
                  <p className="font-medium break-words">{organizerData.phone}</p>
                </div>
              </div>
              <div className="flex items-start gap-3 min-w-0">
                <Globe className="w-5 h-5 text-gray-400 shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <p className="text-sm text-gray-600">Website</p>
                  <p className="font-medium text-[#004A96] break-all">{organizerData.website}</p>
                </div>
              </div>
              <div className="flex items-start gap-3 min-w-0">
                <MapPin className="w-5 h-5 text-gray-400 shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <p className="text-sm text-gray-600">Country</p>
                  <p className="font-medium break-words">{organizerData.organizerCountry || "—"}</p>
                </div>
              </div>
              <div className="flex items-start gap-3 min-w-0">
                <MapPin className="w-5 h-5 text-gray-400 shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <p className="text-sm text-gray-600">State / Region</p>
                  <p className="font-medium break-words">{organizerData.organizerState || "—"}</p>
                </div>
              </div>
              <div className="flex items-start gap-3 min-w-0">
                <MapPin className="w-5 h-5 text-gray-400 shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <p className="text-sm text-gray-600">City</p>
                  <p className="font-medium break-words">{organizerData.organizerCity || "—"}</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Company Information */}
      <Card className="gap-0 py-0">
        <CardHeader className="px-4 sm:px-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Building className="w-5 h-5 shrink-0" />
              Company Information
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(isEditing === "company" ? null : "company")}
              className="w-full sm:w-auto shrink-0"
            >
              <Edit className="w-4 h-4 mr-2" />
              {isEditing === "company" ? "Cancel" : "Edit"}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="px-4 sm:px-6">
          {isEditing === "company" ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="founded">Founded Year</Label>
                  <Input
                    id="founded"
                    value={organizerData.founded}
                    onChange={(e) => setOrganizerData((prev) => ({ ...prev, founded: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="teamSize">Team Size</Label>
                  <Input
                    id="teamSize"
                    value={organizerData.teamSize}
                    onChange={(e) => setOrganizerData((prev) => ({ ...prev, teamSize: e.target.value }))}
                  />
                </div>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                <Button onClick={() => handleSave("company")} disabled={loading} className="w-full sm:w-auto">
                  {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                  Save Changes
                </Button>
                <Button variant="outline" onClick={handleCancel} className="w-full sm:w-auto">
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div className="flex items-start gap-3 min-w-0">
                <Calendar className="w-5 h-5 text-gray-400 shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <p className="text-sm text-gray-600">Founded</p>
                  <p className="font-medium break-words">{organizerData.founded || "—"}</p>
                </div>
              </div>
              <div className="flex items-start gap-3 min-w-0">
                <Users className="w-5 h-5 text-gray-400 shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <p className="text-sm text-gray-600">Team Size</p>
                  <p className="font-medium break-words">{organizerData.teamSize} employees</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Specialties */}
      <Card className="gap-0 py-0">
        <CardHeader className="px-4 sm:px-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0 space-y-1">
              <CardTitle className="text-base sm:text-lg">Event Specialties</CardTitle>
              <p className="text-xs text-gray-500">
                (Please click on the plus button to add, then click on Done)
              </p>
            </div>

            <Button
              variant="outline"
              size="sm"
              className="w-full sm:w-auto shrink-0"
              onClick={() => {
                if (isEditing === "specialties") {
                  handleSpecialtiesDone()
                } else {
                  setIsEditing("specialties")
                }
              }}
            >
              <Edit className="w-4 h-4 mr-2" />
              {isEditing === "specialties" ? "Done" : "Edit"}
            </Button>
          </div>
        </CardHeader>

        <CardContent className="px-4 sm:px-6">
          <div className="flex flex-wrap gap-2 mb-4">
            {organizerData.specialties.map((specialty, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="flex max-w-full items-start gap-1 whitespace-normal break-words text-left"
              >
                <span className="break-words">{specialty}</span>
                {isEditing === "specialties" && (
                  <X
                    className="w-3 h-3 mt-0.5 shrink-0 cursor-pointer hover:text-red-500"
                    onClick={(e) => {
                      e.stopPropagation()
                      removeSpecialty(index)
                    }}
                  />
                )}
              </Badge>
            ))}
          </div>

          {isEditing === "specialties" && (
            <div className="flex flex-col gap-2 sm:flex-row">
              <Input
                value={newSpecialty}
                onChange={(e) => setNewSpecialty(e.target.value)}
                placeholder="Add new specialty"
                onKeyPress={(e) => e.key === "Enter" && addSpecialty()}
                className="min-w-0"
              />
              <Button onClick={addSpecialty} className="w-full sm:w-auto shrink-0">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Achievements */}
      <Card className="gap-0 py-0">
        <CardHeader className="px-4 sm:px-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0 space-y-1">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <Award className="w-5 h-5 shrink-0" />
                Achievements & Awards
              </CardTitle>
              <p className="text-xs text-gray-500">
                (Please click on the plus button to add, then click on Done)
              </p>
            </div>

            <Button
              variant="outline"
              size="sm"
              className="w-full sm:w-auto shrink-0"
              onClick={() => {
                if (isEditing === "achievements") {
                  handleAchievementsDone()
                } else {
                  setIsEditing("achievements")
                }
              }}
            >
              <Edit className="w-4 h-4 mr-2" />
              {isEditing === "achievements" ? "Done" : "Edit"}
            </Button>
          </div>
        </CardHeader>

        <CardContent className="px-4 sm:px-6">
          <div className="space-y-3 mb-4">
            {organizerData.achievements.map((achievement, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg min-w-0">
                <div className="w-2 h-2 bg-[#004A96] rounded-full mt-2 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-gray-800 break-words whitespace-pre-wrap text-sm sm:text-base">{achievement}</p>
                </div>
                {isEditing === "achievements" && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeAchievement(index)}
                    className="text-red-500 hover:text-red-700 shrink-0"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                )}
              </div>
            ))}
          </div>

          {isEditing === "achievements" && (
            <div className="flex flex-col gap-2 sm:flex-row">
              <Input
                value={newAchievement}
                onChange={(e) => setNewAchievement(e.target.value)}
                placeholder="Add new achievement"
                onKeyPress={(e) => e.key === "Enter" && addAchievement()}
                className="min-w-0"
              />
              <Button onClick={addAchievement} className="w-full sm:w-auto shrink-0">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Certifications */}
      <Card className="gap-0 py-0">
        <CardHeader className="px-4 sm:px-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0 space-y-1">
              <CardTitle className="text-base sm:text-lg">Certifications & Licenses</CardTitle>
              <p className="text-xs text-gray-500">
                (Please click on the plus button to add, then click on Done)
              </p>
            </div>

            <Button
              variant="outline"
              size="sm"
              className="w-full sm:w-auto shrink-0"
              onClick={() => {
                if (isEditing === "certifications") {
                  handleCertificationsDone()
                } else {
                  setIsEditing("certifications")
                }
              }}
            >
              <Edit className="w-4 h-4 mr-2" />
              {isEditing === "certifications" ? "Done" : "Edit"}
            </Button>
          </div>
        </CardHeader>

        <CardContent className="px-4 sm:px-6">
          <div className="space-y-3 mb-4">
            {organizerData.certifications.map((certification, index) => (
              <div
                key={index}
                className="flex items-start justify-between gap-3 p-3 bg-green-50 rounded-lg border border-green-200 min-w-0"
              >
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  <Award className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                  <p className="font-medium text-gray-800 break-words whitespace-pre-wrap text-sm sm:text-base">{certification}</p>
                </div>
                {isEditing === "certifications" && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeCertification(index)}
                    className="text-red-500 hover:text-red-700 shrink-0"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                )}
              </div>
            ))}
          </div>

          {isEditing === "certifications" && (
            <div className="flex flex-col gap-2 sm:flex-row">
              <Input
                value={newCertification}
                onChange={(e) => setNewCertification(e.target.value)}
                placeholder="Add new certification"
                onKeyPress={(e) => e.key === "Enter" && addCertification()}
                className="min-w-0"
              />
              <Button onClick={addCertification} className="w-full sm:w-auto shrink-0">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}