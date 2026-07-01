"use client"

import { useState, useEffect, useMemo } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Building2, Star, Camera, Plus, Edit, Trash2, CheckCircle, Upload, Save,
  MapPin, Globe, Phone, Mail, Users, Calendar, Wifi, Car, Utensils, Shield,
  Wind, ArrowRight,
  BookmarkCheck
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { getCityOptions, getCountryOptions, getStateOptions } from "@/lib/location-data"
import { getIanaTimeZoneOptions } from "@/lib/iana-timezones"
import { safeResponseJson, apiFetch } from "@/lib/api"
import {
  IMAGE_UPLOAD_HINT,
  parseUploadErrorMessage,
  prepareImageFileForUpload,
} from "@/lib/prepare-image-upload"
import { isLegacyDummyImage } from "@/lib/placeholder"
import { cn } from "@/lib/utils"
import { venueTabsList, venueTabsScrollWrapper, venueTabsTrigger } from "./venue-dashboard-theme"

interface VenueData {
  id: string
  venueName: string
  logo: string
  contactPerson: string
  email: string
  mobile: string
  address: string
  city: string
  state: string
  country: string
  zipCode: string
  website: string
  description: string
  maxCapacity: number
  totalHalls: number
  totalEvents: number
  activeBookings: number
  averageRating: number
  totalReviews: number
  amenities: string[]
  meetingSpaces: any[]
  venueImages: string[]
  venueVideos: string[]
  floorPlans: string[]
  virtualTour: string
  latitude: number
  longitude: number
  basePrice: number
  currency: string
  timezone?: string
}

interface VenueProfileProps {
  venueData: VenueData
}

const LOCATION_NONE = "__none__"

function sanitizeImageList(list: string[] | undefined | null): string[] {
  return (list ?? [])
    .map((item) => (typeof item === "string" ? item.trim() : ""))
    .filter((item) => item && !isLegacyDummyImage(item))
}

function cloudinaryPublicIdFromUrl(imageUrl: string): string | null {
  const trimmed = imageUrl.trim()
  if (!trimmed.includes("cloudinary.com")) return null
  const withoutQuery = trimmed.split("?")[0]
  const uploadIdx = withoutQuery.indexOf("/upload/")
  if (uploadIdx === -1) return null
  let path = withoutQuery.slice(uploadIdx + "/upload/".length)
  path = path.replace(/^v\d+\//, "")
  const dot = path.lastIndexOf(".")
  if (dot === -1) return path || null
  return path.slice(0, dot) || null
}

const mapBackendToVenueData = (data: any): VenueData => {
  // Parse meetingSpaces if it's a JSON string
  let meetingSpaces = data.meetingSpaces || data.halls || []
  if (typeof meetingSpaces === 'string') {
    try {
      meetingSpaces = JSON.parse(meetingSpaces)
    } catch {
      meetingSpaces = []
    }
  }

  // Calculate totalHalls and maxCapacity from meetingSpaces if not provided
  const totalHalls = data.totalHalls || meetingSpaces.length || 0
  const maxCapacity = data.maxCapacity || meetingSpaces.reduce((total: number, space: any) => total + (Number(space.capacity) || 0), 0)

  return {
    id: data.id,
    venueName: data.venueName || data.manager?.venueName || data.name || "",
    logo: data.logo || data.manager?.avatar || data.images?.[0] || "",
    contactPerson: data.contactPerson || data.manager?.name || "",
    email: data.email || data.manager?.email || data.contact?.email || "",
    mobile: data.mobile || data.manager?.phone || data.contact?.phone || "",
    address: data.address || data.location?.address || data.manager?.address || "",
    city: data.city || data.location?.city || "",
    state: data.state || data.location?.state || "",
    country: data.country || data.location?.country || "",
    zipCode: data.zipCode || data.location?.zipCode || "",
    website: data.website || data.manager?.website || data.contact?.website || "",
    description: data.description || data.manager?.description || "",
    maxCapacity: maxCapacity,
    totalHalls: totalHalls,
    totalEvents: data.totalEvents || data.stats?.totalEvents || 0,
    activeBookings: data.activeBookings || data.stats?.activeBookings || 0,
    averageRating: data.averageRating || data.stats?.averageRating || 0,
    totalReviews: data.totalReviews || data.stats?.totalReviews || 0,
    amenities: data.amenities || [],
    meetingSpaces: meetingSpaces,
    venueImages: sanitizeImageList(data.venueImages || data.images),
    venueVideos: data.venueVideos || data.videos || [],
    floorPlans: sanitizeImageList(data.floorPlans || []),
    virtualTour: data.virtualTour || "",
    latitude: data.latitude || data.location?.coordinates?.lat || 0,
    longitude: data.longitude || data.location?.coordinates?.lng || 0,
    basePrice: data.basePrice || data.pricing?.basePrice || 0,
    currency: data.currency || data.pricing?.currency || "₹",
    timezone: data.timezone || data.location?.timezone || "",
  }
}

const AMENITY_ICONS: Record<string, any> = {
  "Parking": Car, "Wi-Fi": Wifi, "Catering": Utensils, "Security": Shield,
  "Air Conditioning": Wind, "WiFi": Wifi,
}

const applyVenueState = (
  venue: VenueData,
  setters: {
    setProfileData: (v: VenueData) => void
    setAmenities: (v: string[]) => void
    setMeetingSpaces: (v: any[]) => void
    setImages: (v: string[]) => void
    setFloorPlans: (v: string[]) => void
  },
) => {
  setters.setProfileData(venue)
  setters.setAmenities(venue.amenities ?? [])
  setters.setMeetingSpaces(venue.meetingSpaces ?? [])
  setters.setImages(sanitizeImageList(venue.venueImages))
  setters.setFloorPlans(sanitizeImageList(venue.floorPlans))
}

export default function VenueProfile({ venueData }: VenueProfileProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [profileData, setProfileData] = useState<VenueData>(() => venueData)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const { toast } = useToast()
  const [amenities, setAmenities] = useState<string[]>([])
  const [meetingSpaces, setMeetingSpaces] = useState<any[]>([])
  const [images, setImages] = useState<string[]>([])
  const [floorPlans, setFloorPlans] = useState<string[]>([])
  const [newAmenity, setNewAmenity] = useState("")
  const [newSpace, setNewSpace] = useState({ name: "", capacity: "", area: "", hourlyRate: "", features: "" })
  const [countryOptions, setCountryOptions] = useState(() => getCountryOptions())
  const [countryPick, setCountryPick] = useState<string>(LOCATION_NONE)
  const [statePick, setStatePick] = useState<string>(LOCATION_NONE)
  const [cityPick, setCityPick] = useState<string>(LOCATION_NONE)
  const ianaZones = useMemo(() => getIanaTimeZoneOptions(), [])
  const [tzPickerOpen, setTzPickerOpen] = useState(false)
  const [tzFilter, setTzFilter] = useState("")
  const filteredIanaZones = useMemo(() => {
    const q = tzFilter.trim().toLowerCase()
    if (!q) return ianaZones
    return ianaZones.filter((z) => z.toLowerCase().includes(q))
  }, [ianaZones, tzFilter])

  useEffect(() => {
    applyVenueState(venueData, {
      setProfileData,
      setAmenities,
      setMeetingSpaces,
      setImages,
      setFloorPlans,
    })
  }, [venueData])

  useEffect(() => {
    const fetchVenue = async () => {
      if (!venueData.id) return
      try {
        setIsRefreshing(true)
        const data = await apiFetch<{ success?: boolean; data?: unknown }>(
          `/api/venue-manager/${encodeURIComponent(venueData.id)}`,
          { auth: true },
        )
        if (data?.success && data.data != null) {
          const mappedData = mapBackendToVenueData(data.data)
          applyVenueState(mappedData, {
            setProfileData,
            setAmenities,
            setMeetingSpaces,
            setImages,
            setFloorPlans,
          })
        }
      } catch (err) {
        console.error("Failed to refresh venue profile:", err)
      } finally {
        setIsRefreshing(false)
      }
    }
    void fetchVenue()
  }, [venueData.id])

  useEffect(() => { setCountryOptions(getCountryOptions()) }, [])

  useEffect(() => {
    if (!isEditing || !profileData) return
    const countryName = (profileData.country || "").trim().toLowerCase()
    const countryCode = countryOptions.find((c) => c.name.trim().toLowerCase() === countryName)?.code
    setCountryPick(countryCode || LOCATION_NONE)
    const statesForCountry = getStateOptions(countryCode || "")
    const stateName = (profileData.state || "").trim().toLowerCase()
    const stateCode = statesForCountry.find((s) => s.name.trim().toLowerCase() === stateName)?.code
    setStatePick(stateCode || LOCATION_NONE)
    const citiesForState = getCityOptions(countryCode || "", stateCode || "")
    const cityName = (profileData.city || "").trim().toLowerCase()
    const cityValue = citiesForState.find((c) => c.name.trim().toLowerCase() === cityName)?.name
    setCityPick(cityValue || LOCATION_NONE)
  }, [isEditing, profileData, countryOptions])

  const resolvedCountryCode = useMemo(() => {
    if (countryPick !== LOCATION_NONE) return countryPick
    const typed = (profileData?.country || "").trim().toLowerCase()
    if (!typed) return ""
    return countryOptions.find((c) => c.name.trim().toLowerCase() === typed)?.code ?? ""
  }, [countryPick, profileData?.country, countryOptions])

  const stateOptions = useMemo(() => getStateOptions(resolvedCountryCode), [resolvedCountryCode])
  const resolvedStateCode = useMemo(() => {
    if (statePick !== LOCATION_NONE) return statePick
    const typed = (profileData?.state || "").trim().toLowerCase()
    if (!typed) return ""
    return stateOptions.find((s) => s.name.trim().toLowerCase() === typed)?.code ?? ""
  }, [statePick, profileData?.state, stateOptions])
  const cityOptions = useMemo(() => getCityOptions(resolvedCountryCode, resolvedStateCode), [resolvedCountryCode, resolvedStateCode])

  const tryAutoFillPostalCode = async (cityName: string, stateName: string, countryName: string) => {
    if (!cityName || !countryName) return
    try {
      const params = new URLSearchParams({ city: cityName, state: stateName || "", country: countryName })
      const res = await fetch(`/api/location/postal-code?${params.toString()}`)
      const json = await safeResponseJson<{ success?: boolean; data?: { postalCode?: string | null } }>(res)
      const postalCode = json?.success ? (json.data?.postalCode ?? null) : null
      if (postalCode) setProfileData((prev) => (prev ? { ...prev, zipCode: postalCode } : prev))
    } catch { }
  }

  const handleImageUpload = async (file: File, type: "venue" | "floorplan" | "logo", skipListUpdate = false) => {
    try {
      const prepared = await prepareImageFileForUpload(file)
      const formData = new FormData()
      formData.append("file", prepared)
      formData.append("type", type)
      const res = await fetch(`/api/venue-manager/${venueData.id}/upload-image`, { method: "POST", body: formData })
      const raw = await res.text()
      if (!res.ok) {
        throw new Error(parseUploadErrorMessage(res.status, raw))
      }
      let data: { success?: boolean; data?: { secure_url?: string }; error?: string } | null = null
      try {
        data = raw.trim() ? JSON.parse(raw) : null
      } catch {
        throw new Error("Upload failed")
      }
      if (data?.success && data.data?.secure_url) {
        const imageUrl = data.data.secure_url
        if (!skipListUpdate) {
          if (type === "venue") setImages((prev) => [...prev, imageUrl])
          else if (type === "floorplan") setFloorPlans((prev) => [...prev, imageUrl])
          else if (type === "logo") setProfileData((prev) => ({ ...prev, logo: imageUrl }))
        }
        toast({ title: "Success", description: "Image uploaded successfully" })
        return imageUrl
      } else throw new Error(data?.error || "Upload failed")
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to upload image",
        variant: "destructive",
      })
      return null
    }
  }

  const handleImageDelete = async (imageUrl: string, type: "venue" | "floorplan", index?: number) => {
    const removeFromList = (prev: string[]) => {
      if (typeof index === "number") return prev.filter((_, i) => i !== index)
      return prev.filter((img) => img !== imageUrl)
    }

    const nextVenueImages = type === "venue" ? removeFromList(images) : images
    const nextFloorPlans = type === "floorplan" ? removeFromList(floorPlans) : floorPlans

    try {
      const publicId = cloudinaryPublicIdFromUrl(imageUrl)
      if (publicId) {
        await fetch(
          `/api/venue-manager/${venueData.id}/delete-image?publicId=${encodeURIComponent(publicId)}`,
          { method: "DELETE" },
        )
      }

      if (type === "venue") setImages(nextVenueImages)
      else setFloorPlans(nextFloorPlans)

      await persistVenueMedia(nextVenueImages, nextFloorPlans)
      toast({ title: "Success", description: "Image removed successfully" })
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to delete image",
        variant: "destructive",
      })
    }
  }

  const handleRemoveCoverImage = () => {
    if (images.length === 0) return
    void handleImageDelete(images[0], "venue", 0)
  }

  const persistVenueMedia = async (nextVenueImages: string[], nextFloorPlans: string[]) => {
    const payload = profileData ?? venueData

    // Calculate totals from meeting spaces
    const totalHalls = meetingSpaces.length
    const maxCapacity = meetingSpaces.reduce((total, space) => total + (Number(space.capacity) || 0), 0)

    const updatePayload = {
      ...payload,
      amenities,
      meetingSpaces: meetingSpaces,
      venueImages: sanitizeImageList(nextVenueImages),
      floorPlans: sanitizeImageList(nextFloorPlans),
      totalHalls: totalHalls,
      maxCapacity: maxCapacity,
    }

    try {
      const data = await apiFetch<{ success?: boolean; venue?: VenueData; error?: string }>(
        `/api/venue-manager/${encodeURIComponent(payload.id)}`,
        {
          method: "PUT",
          body: updatePayload,
          auth: true,
        },
      )

      if (data?.success && data.venue) {
        const mappedData = mapBackendToVenueData(data.venue)
        applyVenueState(mappedData, {
          setProfileData,
          setAmenities,
          setMeetingSpaces,
          setImages,
          setFloorPlans,
        })
      } else {
        throw new Error(data?.error || "Failed to save image changes")
      }
    } catch (err) {
      console.error("Error persisting venue media:", err)
      throw err
    }
  }

  const handleReplaceCoverImage = async (file: File) => {
    const uploaded = await handleImageUpload(file, "venue", true)
    if (!uploaded) return
    const nextImages = images.length === 0 ? [uploaded] : [uploaded, ...images.slice(1)]
    setImages(nextImages)
    try {
      await persistVenueMedia(nextImages, floorPlans)
      toast({ title: "Success", description: "Cover image updated" })
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to update cover image",
        variant: "destructive",
      })
    }
  }

  const handleSave = async () => {
    const payload = profileData ?? venueData
    if (!payload?.id) {
      toast({ title: "Error", description: "Venue profile is not loaded yet.", variant: "destructive" })
      return
    }
    try {
      setIsSaving(true)

      // Calculate totals from meeting spaces
      const totalHalls = meetingSpaces.length
      const maxCapacity = meetingSpaces.reduce((total, space) => total + (Number(space.capacity) || 0), 0)

      // Create a clean payload with proper structure
      const updatePayload = {
        ...payload,
        amenities: amenities,
        meetingSpaces: meetingSpaces,
        venueImages: sanitizeImageList(images),
        floorPlans: sanitizeImageList(floorPlans),
        totalHalls: totalHalls,
        maxCapacity: maxCapacity,
      }

      console.log("Saving meeting spaces:", meetingSpaces)
      console.log("Total Halls:", totalHalls)
      console.log("Max Capacity:", maxCapacity)
      console.log("Update payload:", updatePayload)

      const data = await apiFetch<{ success?: boolean; venue?: VenueData; error?: string }>(
        `/api/venue-manager/${encodeURIComponent(payload.id)}`,
        {
          method: "PUT",
          body: updatePayload,
          auth: true,
        },
      )

      if (data?.success && data.venue) {
        const mappedData = mapBackendToVenueData(data.venue)
        applyVenueState(mappedData, {
          setProfileData,
          setAmenities,
          setMeetingSpaces,
          setImages,
          setFloorPlans,
        })
        setIsEditing(false)
        toast({ title: "Success", description: "Venue updated successfully" })
      } else {
        throw new Error(data?.error || "Update failed")
      }
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to update venue",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleAddAmenity = () => {
    if (!newAmenity.trim()) return
    setAmenities([...amenities, newAmenity.trim()])
    setNewAmenity("")
  }

  const handleRemoveAmenity = (index: number) => setAmenities(amenities.filter((_, i) => i !== index))

  const handleAddSpace = () => {
    if (!newSpace.name.trim()) return
    const newMeetingSpace = {
      id: Date.now().toString(),
      name: newSpace.name,
      capacity: Number(newSpace.capacity) || 0,
      area: Number(newSpace.area) || 0,
      hourlyRate: Number(newSpace.hourlyRate) || 0,
      features: newSpace.features.split(",").map((f) => f.trim()).filter(Boolean),
    }

    const updatedSpaces = [...meetingSpaces, newMeetingSpace]
    setMeetingSpaces(updatedSpaces)

    // Update totalHalls and maxCapacity in profileData
    setProfileData((prev) => ({
      ...prev,
      totalHalls: updatedSpaces.length,
      maxCapacity: updatedSpaces.reduce((total, space) => total + (Number(space.capacity) || 0), 0)
    }))

    setNewSpace({ name: "", capacity: "", area: "", hourlyRate: "", features: "" })
  }

  const handleRemoveSpace = (id: string) => {
    const updatedSpaces = meetingSpaces.filter((s) => s.id !== id)
    setMeetingSpaces(updatedSpaces)

    // Update totalHalls and maxCapacity in profileData
    setProfileData((prev) => ({
      ...prev,
      totalHalls: updatedSpaces.length,
      maxCapacity: updatedSpaces.reduce((total, space) => total + (Number(space.capacity) || 0), 0)
    }))
  }

  if (isRefreshing && !profileData?.id) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-[#004A96] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-[#64748B]">Loading venue data...</p>
        </div>
      </div>
    )
  }

  const heroBg = images[0] || profileData?.venueImages?.[0]

  const profileTabs = [
    { value: "images", label: "Images", shortLabel: "Images" },
    { value: "amenities", label: "Amenities", shortLabel: "Amenities" },
    { value: "spaces", label: "Halls", shortLabel: "Halls" },
    { value: "floorplan", label: "Floor Plans", shortLabel: "Floors" },
    { value: "details", label: "Details", shortLabel: "Details" },
  ] as const

  return (
    <div className="min-w-0 space-y-0">
      {/* Page Header */}
      <div className="mb-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <h1 className="text-xl font-bold text-[#1E293B] sm:text-2xl">Venue Profile</h1>
            <p className="text-sm text-[#64748B] mt-0.5">Manage your venue information and settings</p>
          </div>
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
            {isEditing ? (
              <>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditing(false)}
                  disabled={isSaving}
                  className="w-full rounded-xl border-[#E2E8F0] text-[#64748B] sm:w-auto"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={() => void handleSave()}
                  disabled={isSaving}
                  className="w-full rounded-xl bg-[#004A96] hover:bg-[#003d7a] text-white flex items-center justify-center gap-2 sm:w-auto"
                >
                  <Save className="w-4 h-4" />
                  {isSaving ? "Saving..." : "Save Changes"}
                </Button>
              </>
            ) : (
              <Button
                type="button"
                onClick={() => setIsEditing(true)}
                className="w-full rounded-xl bg-[#004A96] hover:bg-[#003d7a] text-white flex items-center justify-center gap-2 sm:w-auto"
              >
                <Edit className="w-4 h-4" />
                Edit Profile
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Hero Image Card */}
      <div className="relative mb-8">
        <div className="relative w-full h-56 md:h-72 rounded-2xl overflow-hidden">
          {heroBg?.trim() ? (
            <Image src={heroBg.trim()} alt="Venue" fill className="object-cover" />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-slate-200 to-slate-300" aria-hidden />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

          {isEditing && (
            <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
              {heroBg?.trim() ? (
                <button
                  type="button"
                  onClick={handleRemoveCoverImage}
                  className="bg-red-600/90 hover:bg-red-700 backdrop-blur-sm text-white px-3 py-1.5 rounded-lg text-xs flex items-center gap-1 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Remove Cover
                </button>
              ) : null}
              <label className="bg-black/50 hover:bg-black/70 backdrop-blur-sm text-white px-3 py-1.5 rounded-lg text-xs flex items-center gap-1 transition-colors cursor-pointer">
                <Camera className="w-3.5 h-3.5" /> Change Cover
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) void handleReplaceCoverImage(file)
                    e.target.value = ""
                  }}
                />
              </label>
            </div>
          )}
        </div>

        <div className="relative -mt-12 mx-2 sm:mx-4 md:mx-6 z-10">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_220px] gap-4 items-stretch">
            <div className="bg-white rounded-2xl shadow-lg border border-[#E2E8F0] p-4 sm:p-5">
              <div className="flex items-start gap-2 mb-2 min-w-0">
                <h2 className="text-xl font-bold text-[#1E293B] break-words sm:text-2xl">
                  {profileData?.venueName || venueData.venueName}
                </h2>
                <CheckCircle className="w-5 h-5 text-[#10B981]" />
              </div>
              <p className="text-sm text-[#64748B] mb-3 break-words">
                {profileData?.address || venueData.address}
              </p>
              <div className="flex flex-wrap items-center gap-4 text-sm text-[#64748B]">
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4 text-[#004A96]" />
                  {profileData?.city || venueData.city}, {profileData?.country || venueData.country}
                </span>
                {(profileData?.timezone || venueData.timezone) && (
                  <span className="flex items-center gap-1">
                    🕐 {profileData?.timezone || venueData.timezone}
                  </span>
                )}
              </div>
            </div>

            <div className="bg-gradient-to-br from-[#004A96] to-[#003d7a] text-white rounded-2xl shadow-lg p-5 flex flex-col justify-center">
              <p className="text-sm font-medium opacity-90">Customer Rating</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-4xl font-bold">
                  {(profileData?.averageRating || venueData.averageRating || 0).toFixed(1)}
                </span>
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className={cn(
                        "w-4 h-4",
                        s <= Math.floor(profileData?.averageRating || venueData.averageRating || 0)
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-white/40"
                      )}
                    />
                  ))}
                </div>
              </div>
              <p className="text-xs opacity-80 mt-1">
                {profileData?.totalReviews || venueData.totalReviews || 0} Reviews
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* About Venue + Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6 mt-2">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-[#E2E8F0] p-4 sm:p-5 min-w-0">
          <h3 className="text-base font-semibold text-[#1E293B] mb-3">About Venue</h3>
          {isEditing ? (
            <Textarea
              rows={3}
              value={profileData?.description || ""}
              onChange={(e) => setProfileData((prev) => prev ? { ...prev, description: e.target.value } : prev)}
              placeholder="Describe your venue..."
              className="rounded-xl border-[#E2E8F0] text-sm"
            />
          ) : (
            <p className="text-sm text-[#64748B] leading-relaxed">{profileData?.description || venueData.description || "No description added yet."}</p>
          )}

          {/* Amenities */}
          <div className="mt-4">
            <h4 className="text-sm font-semibold text-[#1E293B] mb-2">Amenities</h4>
            <div className="flex flex-wrap gap-2">
              {(amenities.length ? amenities : venueData.amenities).slice(0, 5).map((amenity, i) => {
                const Icon = AMENITY_ICONS[amenity] || CheckCircle
                return (
                  <div key={i} className="flex items-center gap-1.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg px-3 py-1.5 text-sm text-[#475569]">
                    <Icon className="w-3.5 h-3.5 text-[#004A96]" />
                    {amenity}
                    {isEditing && (
                      <button onClick={() => handleRemoveAmenity(i)} className="ml-1 text-[#EF4444] hover:text-red-700">
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                )
              })}
              {((amenities.length > 5) || (venueData.amenities.length > 5)) && (
                <div className="flex items-center gap-1.5 bg-[#EFF6FF] rounded-lg px-3 py-1.5 text-sm text-[#004A96]">
                  +{(amenities.length || venueData.amenities.length) - 5} More
                </div>
              )}
            </div>
            {isEditing && (
              <div className="flex gap-2 mt-2">
                <Input
                  placeholder="Add amenity..."
                  value={newAmenity}
                  onChange={(e) => setNewAmenity(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleAddAmenity()}
                  className="rounded-xl border-[#E2E8F0] text-sm"
                />
                <Button onClick={handleAddAmenity} size="sm" className="rounded-xl bg-[#004A96] text-white">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>

          {/* Contact */}
          <div className="mt-4">
            <h4 className="text-sm font-semibold text-[#1E293B] mb-2">Contact Information</h4>
            <div className="space-y-1.5">
              <div className="flex items-start gap-2 text-sm text-[#64748B] min-w-0">
                <Users className="w-4 h-4 text-[#004A96] shrink-0 mt-0.5" />
                <span className="break-words">{profileData?.contactPerson || venueData.contactPerson}</span>
              </div>
              <div className="flex items-start gap-2 text-sm text-[#64748B] min-w-0">
                <Phone className="w-4 h-4 text-[#004A96] shrink-0 mt-0.5" />
                <span className="break-all">{profileData?.mobile || venueData.mobile}</span>
              </div>
              <div className="flex items-start gap-2 text-sm text-[#64748B] min-w-0">
                <Mail className="w-4 h-4 text-[#004A96] shrink-0 mt-0.5" />
                <span className="break-all">{profileData?.email || venueData.email}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats sidebar */}
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Total Events", value: profileData?.totalEvents ?? venueData.totalEvents, icon: Calendar, color: "text-[#004A96] bg-[#EFF6FF]" },
              { label: "Active Bookings", value: profileData?.activeBookings ?? venueData.activeBookings, icon: BookmarkCheck, color: "text-[#16A34A] bg-[#F0FDF4]" },
              { label: "Max Capacity", value: (profileData?.maxCapacity ?? venueData.maxCapacity)?.toLocaleString() || "0", icon: Users, color: "text-[#0284C7] bg-[#F0F9FF]" },
              { label: "Total Halls", value: profileData?.totalHalls ?? venueData.totalHalls, icon: Building2, color: "text-[#EA580C] bg-[#FFF7ED]" },
            ].map((stat) => (
              <div key={stat.label} className="bg-white rounded-xl border border-[#E2E8F0] p-3">
                <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center mb-2", stat.color)}>
                  <stat.icon className="w-4 h-4" />
                </div>
                <p className="text-lg font-bold text-[#1E293B]">{stat.value}</p>
                <p className="text-xs text-[#94A3B8] mt-0.5">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="images" className="w-full min-w-0">
        <div className={venueTabsScrollWrapper}>
          <TabsList className={cn(venueTabsList, "mb-0")}>
            {profileTabs.map((tab) => (
              <TabsTrigger key={tab.value} value={tab.value} className={venueTabsTrigger}>
                <span className="sm:hidden">{tab.shortLabel}</span>
                <span className="hidden sm:inline">{tab.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>
        </div>
        <div className="mb-5" />

        {/* Images Tab */}
        <TabsContent value="images">
          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-4 sm:p-5 min-w-0">
            <h3 className="text-base font-semibold text-[#1E293B] mb-4">Venue Images</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-4">
              {images.length === 0 ? (
                <p className="col-span-full text-sm text-[#64748B] py-6 text-center border border-dashed border-[#E2E8F0] rounded-xl">
                  No venue images yet. Upload images below.
                </p>
              ) : null}
              {images.map((image, index) => (
                <div key={`${image}-${index}`} className="relative rounded-xl overflow-hidden aspect-video border border-[#E2E8F0] bg-slate-100">
                  {image?.trim() ? (
                    <Image src={image.trim()} alt={`Venue ${index + 1}`} fill className="object-cover" />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-xs text-[#94A3B8]">
                      Empty image slot
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => void handleImageDelete(image, "venue", index)}
                    className="absolute top-2 right-2 z-10 flex items-center gap-1 rounded-lg bg-red-600 px-2 py-1 text-xs font-medium text-white shadow hover:bg-red-700"
                    aria-label={`Delete venue image ${index + 1}`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete
                  </button>
                  {index === 0 ? (
                    <span className="absolute bottom-2 left-2 rounded bg-black/60 px-2 py-0.5 text-[10px] text-white">
                      Cover
                    </span>
                  ) : null}
                </div>
              ))}
            </div>
            {isEditing && (
              <div className="border-2 border-dashed border-[#E2E8F0] rounded-xl p-6 text-center">
                <Upload className="w-8 h-8 text-[#94A3B8] mx-auto mb-2" />
                <p className="text-sm text-[#64748B] mb-1">Drop images here or click to upload</p>
                <p className="text-xs text-[#94A3B8] mb-3">{IMAGE_UPLOAD_HINT}</p>
                <Input type="file" accept="image/*" multiple onChange={async (e) => { for (const f of Array.from(e.target.files || [])) await handleImageUpload(f, "venue") }} className="hidden" id="venue-img-upload" />
                <Button asChild size="sm" className="rounded-xl bg-[#004A96] text-white">
                  <label htmlFor="venue-img-upload" className="cursor-pointer"><Plus className="w-4 h-4 mr-1" />Add Images</label>
                </Button>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Amenities Tab */}
        <TabsContent value="amenities">
          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-4 sm:p-5 min-w-0">
            <h3 className="text-base font-semibold text-[#1E293B] mb-4">Venue Amenities</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
              {amenities.map((amenity, index) => {
                const Icon = AMENITY_ICONS[amenity] || CheckCircle
                return (
                  <div key={index} className="flex items-center justify-between p-3 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4 text-[#004A96]" />
                      <span className="text-sm text-[#475569]">{amenity}</span>
                    </div>
                    {isEditing && (
                      <button onClick={() => handleRemoveAmenity(index)} className="text-[#EF4444] hover:text-red-700">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
            {isEditing && (
              <div className="flex gap-2">
                <Input placeholder="Add new amenity..." value={newAmenity} onChange={(e) => setNewAmenity(e.target.value)} onKeyPress={(e) => e.key === "Enter" && handleAddAmenity()} className="rounded-xl border-[#E2E8F0]" />
                <Button onClick={handleAddAmenity} className="rounded-xl bg-[#004A96] text-white"><Plus className="w-4 h-4 mr-1" />Add</Button>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Spaces Tab */}
        <TabsContent value="spaces">
          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-4 sm:p-5 min-w-0">
            <h3 className="text-base font-semibold text-[#1E293B] mb-4">Meeting Halls</h3>

            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <span className="text-sm text-[#64748B]">
                Total Halls: <strong className="text-[#1E293B]">{meetingSpaces.length}</strong>
              </span>
              <span className="text-sm text-[#64748B]">
                Total Capacity: <strong className="text-[#1E293B]">
                  {meetingSpaces.reduce((total, space) => total + (Number(space.capacity) || 0), 0)}
                </strong>
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
              {meetingSpaces.length === 0 ? (
                <div className="col-span-full text-center py-8 text-[#64748B] border border-dashed border-[#E2E8F0] rounded-xl">
                  No halls added yet. Add your first hall below.
                </div>
              ) : (
                meetingSpaces.map((space, index) => (
                  <div key={space.id || index} className="border border-[#E2E8F0] rounded-xl p-4 hover:border-[#004A96] transition-colors">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-semibold text-[#1E293B]">{space.name || `Hall ${index + 1}`}</h4>
                        {space.id && <p className="text-xs text-[#94A3B8]">ID: {space.id}</p>}
                      </div>
                      {isEditing && (
                        <button
                          onClick={() => handleRemoveSpace(space.id || index.toString())}
                          className="text-[#EF4444] hover:text-red-700 transition-colors p-1 rounded-lg hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm text-[#64748B] mb-3">
                      <span>Capacity: <strong className="text-[#1E293B]">{space.capacity || 0}</strong></span>
                      <span>Area: <strong className="text-[#1E293B]">{space.area || 0} sq ft</strong></span>
                      {space.hourlyRate && (
                        <span className="col-span-2">Hourly Rate: <strong className="text-[#1E293B]">${space.hourlyRate}</strong></span>
                      )}
                    </div>
                    {space.features?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {space.features.map((f: string, i: number) => (
                          <Badge key={i} variant="secondary" className="text-xs bg-[#EFF6FF] text-[#004A96] border-0">
                            {f}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            {isEditing && (
              <div className="border-2 border-dashed border-[#E2E8F0] rounded-xl p-5 hover:border-[#004A96] transition-colors">
                <h4 className="font-semibold text-[#1E293B] mb-3">Add New Hall</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                  <Input
                    placeholder="Hall name"
                    value={newSpace.name}
                    onChange={(e) => setNewSpace({ ...newSpace, name: e.target.value })}
                    className="rounded-xl border-[#E2E8F0] focus:border-[#004A96]"
                  />
                  <Input
                    placeholder="Capacity"
                    type="number"
                    value={newSpace.capacity}
                    onChange={(e) => setNewSpace({ ...newSpace, capacity: e.target.value })}
                    className="rounded-xl border-[#E2E8F0] focus:border-[#004A96]"
                  />
                  <Input
                    placeholder="Area (sq ft)"
                    type="number"
                    value={newSpace.area}
                    onChange={(e) => setNewSpace({ ...newSpace, area: e.target.value })}
                    className="rounded-xl border-[#E2E8F0] focus:border-[#004A96]"
                  />
                  <Input
                    placeholder="Hourly Rate (optional)"
                    type="number"
                    value={newSpace.hourlyRate}
                    onChange={(e) => setNewSpace({ ...newSpace, hourlyRate: e.target.value })}
                    className="rounded-xl border-[#E2E8F0] focus:border-[#004A96]"
                  />
                  <div className="md:col-span-2">
                    <Input
                      placeholder="Features (comma separated)"
                      value={newSpace.features}
                      onChange={(e) => setNewSpace({ ...newSpace, features: e.target.value })}
                      className="rounded-xl border-[#E2E8F0] focus:border-[#004A96]"
                    />
                  </div>
                </div>
                <Button
                  onClick={handleAddSpace}
                  className="rounded-xl bg-[#004A96] hover:bg-[#003d7a] text-white"
                  disabled={!newSpace.name.trim()}
                >
                  <Plus className="w-4 h-4 mr-1" /> Add Hall
                </Button>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Floor Plans Tab */}
        <TabsContent value="floorplan">
          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-4 sm:p-5 min-w-0">
            <h3 className="text-base font-semibold text-[#1E293B] mb-4">Floor Plans</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {floorPlans.map((plan, index) => (
                <div key={index} className="relative rounded-xl overflow-hidden border border-[#E2E8F0] aspect-square bg-[#F8FAFC] group">
                  {plan?.trim() ? (
                    <Image src={plan.trim()} alt={`Floor Plan ${index + 1}`} fill className="object-contain p-4" />
                  ) : (
                    <div className="absolute inset-0 bg-slate-50" aria-hidden />
                  )}
                  <div className="absolute top-2 left-2"><Badge className="bg-[#EFF6FF] text-[#004A96] border-0 text-xs">Floor {index + 1}</Badge></div>
                  <button
                    type="button"
                    onClick={() => void handleImageDelete(plan, "floorplan", index)}
                    className="absolute top-2 right-2 z-10 flex items-center gap-1 rounded-lg bg-red-600 px-2 py-1 text-xs font-medium text-white shadow hover:bg-red-700"
                    aria-label={`Delete floor plan ${index + 1}`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete
                  </button>
                </div>
              ))}
            </div>
            {isEditing && (
              <div className="mt-4 border-2 border-dashed border-[#E2E8F0] rounded-xl p-6 text-center">
                <Building2 className="w-8 h-8 text-[#94A3B8] mx-auto mb-2" />
                <p className="text-sm text-[#64748B] mb-1">Upload floor plans</p>
                <p className="text-xs text-[#94A3B8] mb-3">{IMAGE_UPLOAD_HINT}</p>
                <Input type="file" accept="image/*" onChange={async (e) => { const f = e.target.files?.[0]; if (f) await handleImageUpload(f, "floorplan") }} className="hidden" id="floor-upload" />
                <Button asChild size="sm" className="rounded-xl bg-[#004A96] text-white">
                  <label htmlFor="floor-upload" className="cursor-pointer"><Plus className="w-4 h-4 mr-1" />Upload</label>
                </Button>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Details Tab */}
        <TabsContent value="details">
          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5 space-y-5">
            <h3 className="text-base font-semibold text-[#1E293B]">Venue Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-xs text-[#94A3B8] uppercase tracking-wide">Venue Name</Label>
                {isEditing ? (
                  <Input value={profileData?.venueName || ""} onChange={(e) => setProfileData((prev) => prev ? { ...prev, venueName: e.target.value } : prev)} className="mt-1 rounded-xl border-[#E2E8F0]" />
                ) : (
                  <p className="mt-1 text-sm text-[#1E293B] font-medium">{profileData?.venueName}</p>
                )}
              </div>
              <div>
                <Label className="text-xs text-[#94A3B8] uppercase tracking-wide">Contact Person</Label>
                {isEditing ? (
                  <Input value={profileData?.contactPerson || ""} onChange={(e) => setProfileData((prev) => prev ? { ...prev, contactPerson: e.target.value } : prev)} className="mt-1 rounded-xl border-[#E2E8F0]" />
                ) : (
                  <p className="mt-1 text-sm text-[#1E293B] font-medium">{profileData?.contactPerson}</p>
                )}
              </div>
              <div>
                <Label className="text-xs text-[#94A3B8] uppercase tracking-wide">Email</Label>
                <div className="mt-1 flex items-center gap-2">
                  <p className="text-sm text-[#1E293B] font-medium">{profileData?.email}</p>
                  <CheckCircle className="w-4 h-4 text-green-500" />
                </div>
                {isEditing && <p className="text-xs text-[#94A3B8]">Email cannot be edited</p>}
              </div>
              <div>
                <Label className="text-xs text-[#94A3B8] uppercase tracking-wide">Mobile</Label>
                <div className="mt-1 flex items-center gap-2">
                  <p className="text-sm text-[#1E293B] font-medium">{profileData?.mobile}</p>
                  <CheckCircle className="w-4 h-4 text-green-500" />
                </div>
                {isEditing && <p className="text-xs text-[#94A3B8]">Mobile cannot be edited</p>}
              </div>
              <div className="md:col-span-2">
                <Label className="text-xs text-[#94A3B8] uppercase tracking-wide">Website</Label>
                {isEditing ? (
                  <Input value={profileData?.website || ""} onChange={(e) => setProfileData((prev) => prev ? { ...prev, website: e.target.value } : prev)} className="mt-1 rounded-xl border-[#E2E8F0]" />
                ) : (
                  <p className="mt-1 text-sm text-[#004A96] font-medium">{profileData?.website}</p>
                )}
              </div>
              <div className="md:col-span-2">
                <Label className="text-xs text-[#94A3B8] uppercase tracking-wide">Street Address</Label>
                {isEditing ? (
                  <Input value={profileData?.address || ""} onChange={(e) => setProfileData((prev) => prev ? { ...prev, address: e.target.value } : prev)} className="mt-1 rounded-xl border-[#E2E8F0]" />
                ) : (
                  <p className="mt-1 text-sm text-[#1E293B] font-medium">{profileData?.address}</p>
                )}
              </div>
              {isEditing ? (
                <>
                  <div>
                    <Label className="text-xs text-[#94A3B8] uppercase tracking-wide mb-1 block">Country</Label>
                    <Select value={countryPick} onValueChange={(v) => { setCountryPick(v); if (v !== LOCATION_NONE) { const row = countryOptions.find((c) => c.code === v); if (row) { setProfileData((prev) => prev ? { ...prev, country: row.name, state: "", city: "" } : prev); setStatePick(LOCATION_NONE); setCityPick(LOCATION_NONE) } } }}>
                      <SelectTrigger className="rounded-xl border-[#E2E8F0]"><SelectValue placeholder="Choose country" /></SelectTrigger>
                      <SelectContent><SelectItem value={LOCATION_NONE}>-- None --</SelectItem>{countryOptions.map((c) => <SelectItem key={c.code} value={c.code}>{c.name}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs text-[#94A3B8] uppercase tracking-wide mb-1 block">State</Label>
                    <Select disabled={!resolvedCountryCode} value={statePick} onValueChange={(v) => { setStatePick(v); if (v !== LOCATION_NONE) { const s = stateOptions.find((s) => s.code === v); if (s) { setProfileData((prev) => prev ? { ...prev, state: s.name, city: "" } : prev); setCityPick(LOCATION_NONE) } } }}>
                      <SelectTrigger className="rounded-xl border-[#E2E8F0]"><SelectValue placeholder="Choose state" /></SelectTrigger>
                      <SelectContent><SelectItem value={LOCATION_NONE}>-- None --</SelectItem>{stateOptions.map((s) => <SelectItem key={s.code} value={s.code}>{s.name}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs text-[#94A3B8] uppercase tracking-wide mb-1 block">City</Label>
                    <Select disabled={!resolvedCountryCode || !resolvedStateCode} value={cityPick} onValueChange={async (v) => { setCityPick(v); if (v !== LOCATION_NONE) { const city = cityOptions.find((c) => c.name === v); if (city) { setProfileData((prev) => prev ? { ...prev, city: city.name } : prev); await tryAutoFillPostalCode(city.name, stateOptions.find((s) => s.code === resolvedStateCode)?.name || "", countryOptions.find((c) => c.code === resolvedCountryCode)?.name || "") } } }}>
                      <SelectTrigger className="rounded-xl border-[#E2E8F0]"><SelectValue placeholder="Choose city" /></SelectTrigger>
                      <SelectContent><SelectItem value={LOCATION_NONE}>-- None --</SelectItem>{cityOptions.map((c) => <SelectItem key={c.name} value={c.name}>{c.name}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                </>
              ) : (
                <>
                  <div><Label className="text-xs text-[#94A3B8] uppercase tracking-wide">Country</Label><p className="mt-1 text-sm text-[#1E293B] font-medium">{profileData?.country || "Not specified"}</p></div>
                  <div><Label className="text-xs text-[#94A3B8] uppercase tracking-wide">State</Label><p className="mt-1 text-sm text-[#1E293B] font-medium">{profileData?.state || "Not specified"}</p></div>
                  <div><Label className="text-xs text-[#94A3B8] uppercase tracking-wide">City</Label><p className="mt-1 text-sm text-[#1E293B] font-medium">{profileData?.city || "Not specified"}</p></div>
                </>
              )}
              <div>
                <Label className="text-xs text-[#94A3B8] uppercase tracking-wide">Postal Code</Label>
                {isEditing ? (
                  <Input value={profileData?.zipCode || ""} onChange={(e) => setProfileData((prev) => prev ? { ...prev, zipCode: e.target.value } : prev)} className="mt-1 rounded-xl border-[#E2E8F0]" />
                ) : (
                  <p className="mt-1 text-sm text-[#1E293B] font-medium">{profileData?.zipCode || "Not specified"}</p>
                )}
              </div>
              <div className="md:col-span-2">
                <Label className="text-xs text-[#94A3B8] uppercase tracking-wide">Venue Timezone</Label>
                {isEditing ? (
                  <Popover open={tzPickerOpen} onOpenChange={setTzPickerOpen}>
                    <PopoverTrigger asChild>
                      <Button type="button" variant="outline" className="mt-1 w-full justify-between rounded-xl border-[#E2E8F0] font-normal text-sm">
                        {profileData?.timezone?.trim() ? profileData.timezone : "Select IANA time zone"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-72 p-2">
                      <Input placeholder="Search zones..." value={tzFilter} onChange={(e) => setTzFilter(e.target.value)} className="mb-2 rounded-xl" />
                      <ScrollArea className="h-56">
                        <div className="flex flex-col gap-0.5">
                          <button type="button" className="rounded-lg px-2 py-1.5 text-left text-sm hover:bg-[#F1F5F9]" onClick={() => { setProfileData((prev) => prev ? { ...prev, timezone: "" } : prev); setTzPickerOpen(false) }}>Clear selection</button>
                          {filteredIanaZones.map((z) => (
                            <button key={z} type="button" className="rounded-lg px-2 py-1.5 text-left text-sm hover:bg-[#F1F5F9]" onClick={() => { setProfileData((prev) => prev ? { ...prev, timezone: z } : prev); setTzPickerOpen(false); setTzFilter("") }}>{z}</button>
                          ))}
                        </div>
                      </ScrollArea>
                    </PopoverContent>
                  </Popover>
                ) : (
                  <p className="mt-1 text-sm text-[#1E293B] font-medium">{profileData?.timezone?.trim() || "Not specified"}</p>
                )}
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}