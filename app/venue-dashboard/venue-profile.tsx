"use client"

import { useState, useEffect, useMemo } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Building2, Star, Users, Camera, Plus, Edit, Trash2, CheckCircle, Upload, Save } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { getCityOptions, getCountryOptions, getStateOptions } from "@/lib/location-data"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import { getIanaTimeZoneOptions } from "@/lib/iana-timezones"

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
  /** IANA time zone for events held at this venue (e.g. Asia/Kolkata). */
  timezone: string
}

interface VenueProfileProps {
  venueData: VenueData
}

const LOCATION_NONE = "__none__"

// Map backend response to VenueData interface
const mapBackendToVenueData = (data: any): VenueData => ({
  id: data.id,
  venueName: data.manager?.venueName || data.name || "",
  logo: data.manager?.avatar || data.images?.[0] || "/city/c4.jpg",
  contactPerson: data.manager?.name || "",
  email: data.manager?.email || data.contact?.email || "",
  mobile: data.manager?.phone || data.contact?.phone || "",
  address: data.location?.address || data.manager?.address || data.address || "",
  city: data.location?.city || "",
  state: data.location?.state || "",
  country: data.location?.country || "",
  zipCode: data.location?.zipCode || "",
  website: data.manager?.website || data.contact?.website || "",
  description: data.manager?.description || data.description || "",
  maxCapacity: data.capacity?.total || 0,
  totalHalls: data.capacity?.halls || 0,
  totalEvents: data.stats?.totalEvents || 0,
  activeBookings: data.stats?.activeBookings || 0,
  averageRating: data.stats?.averageRating || 0,
  totalReviews: data.stats?.totalReviews || 0,
  amenities: data.amenities || [],
  meetingSpaces: data.meetingSpaces || [],
  venueImages: data.images || [],
  venueVideos: data.videos || [],
  floorPlans: data.floorPlans || [],
  virtualTour: data.virtualTour || "",
  latitude: data.location?.coordinates?.lat || 0,
  longitude: data.location?.coordinates?.lng || 0,
  basePrice: data.pricing?.basePrice || 0,
  currency: data.pricing?.currency || "₹",
  timezone: data.location?.timezone ?? "",
})

export default function VenueProfile({ venueData }: VenueProfileProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [profileData, setProfileData] = useState<VenueData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const [amenities, setAmenities] = useState<string[]>([])
  const [meetingSpaces, setMeetingSpaces] = useState<any[]>([])
  const [images, setImages] = useState<string[]>([])
  const [floorPlans, setFloorPlans] = useState<string[]>([])

  const [newAmenity, setNewAmenity] = useState("")
  const [newSpace, setNewSpace] = useState({
    name: "",
    capacity: "",
    area: "",
    hourlyRate: "",
    features: "",
  })
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
    const fetchVenue = async () => {
      try {
        setIsLoading(true)
        const res = await fetch(`/api/venue-manager/${venueData.id}`)
        const data = await res.json()
        if (data.success) {
          const venue = mapBackendToVenueData(data.data)
          setProfileData(venue)
          setAmenities(venue.amenities)
          setMeetingSpaces(venue.meetingSpaces)
          setImages(venue.venueImages)
          setFloorPlans(venue.floorPlans)
        } else {
          toast({
            title: "Error",
            description: "Failed to load venue data",
            variant: "destructive",
          })
        }
      } catch (err) {
        console.error(err)
        toast({
          title: "Error",
          description: "Failed to load venue data",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchVenue()
  }, [venueData.id, toast])

  useEffect(() => {
    setCountryOptions(getCountryOptions())
  }, [])

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
    const row = countryOptions.find((c) => c.name.trim().toLowerCase() === typed)
    return row?.code ?? ""
  }, [countryPick, profileData?.country, countryOptions])

  const stateOptions = useMemo(() => getStateOptions(resolvedCountryCode), [resolvedCountryCode])
  const resolvedStateCode = useMemo(() => {
    if (statePick !== LOCATION_NONE) return statePick
    const typed = (profileData?.state || "").trim().toLowerCase()
    if (!typed) return ""
    const row = stateOptions.find((s) => s.name.trim().toLowerCase() === typed)
    return row?.code ?? ""
  }, [statePick, profileData?.state, stateOptions])
  const cityOptions = useMemo(
    () => getCityOptions(resolvedCountryCode, resolvedStateCode),
    [resolvedCountryCode, resolvedStateCode],
  )

  const tryAutoFillPostalCode = async (cityName: string, stateName: string, countryName: string) => {
    if (!cityName || !countryName) return
    try {
      const params = new URLSearchParams({
        city: cityName,
        state: stateName || "",
        country: countryName,
      })
      const res = await fetch(`/api/location/postal-code?${params.toString()}`)
      const json = (await res.json()) as { success?: boolean; data?: { postalCode?: string | null } }
      const postalCode = json?.success ? (json.data?.postalCode ?? null) : null
      if (postalCode) {
        setProfileData((prev) => (prev ? { ...prev, zipCode: postalCode } : prev))
      }
    } catch {
      // Best-effort only; keep current/manual value when lookup fails.
    }
  }

  const handleImageUpload = async (file: File, type: "venue" | "floorplan" | "logo") => {
    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("type", type)

      const res = await fetch(`/api/venue-manager/${venueData.id}/upload-image`, {
        method: "POST",
        body: formData,
      })

      const data = await res.json()

      if (data.success) {
        const imageUrl = data.data.secure_url

        if (type === "venue") {
          setImages((prev) => [...prev, imageUrl])
        } else if (type === "floorplan") {
          setFloorPlans((prev) => [...prev, imageUrl])
        } else if (type === "logo") {
          setProfileData((prev) => (prev ? { ...prev, logo: imageUrl } : null))
        }

        toast({
          title: "Success",
          description: "Image uploaded successfully",
        })

        return imageUrl
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      console.error("Error uploading image:", error)
      toast({
        title: "Error",
        description: "Failed to upload image",
        variant: "destructive",
      })
      return null
    }
  }

  const handleImageDelete = async (imageUrl: string, type: "venue" | "floorplan") => {
    try {
      const urlParts = imageUrl.split("/")
      const publicIdWithExt = urlParts.slice(-3).join("/")
      const publicId = publicIdWithExt.split(".")[0]

      const res = await fetch(`/api/venue-manager/${venueData.id}/delete-image?publicId=${publicId}`, {
        method: "DELETE",
      })

      const data = await res.json()

      if (data.success) {
        if (type === "venue") {
          setImages((prev) => prev.filter((img) => img !== imageUrl))
        } else if (type === "floorplan") {
          setFloorPlans((prev) => prev.filter((img) => img !== imageUrl))
        }

        toast({
          title: "Success",
          description: "Image deleted successfully",
        })
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      console.error("Error deleting image:", error)
      toast({
        title: "Error",
        description: "Failed to delete image",
        variant: "destructive",
      })
    }
  }

  const handleSave = async () => {
    if (!profileData) return

    try {
      setIsLoading(true)
      const res = await fetch(`/api/venue-manager/${venueData.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...profileData,
          amenities,
          meetingSpaces,
          venueImages: images,
          floorPlans,
        }),
      })

      const data = await res.json()

      if (data.success) {
        setProfileData(data.venue)
        if (Array.isArray(data.venue?.meetingSpaces)) {
          setMeetingSpaces(data.venue.meetingSpaces)
        }
        setIsEditing(false)
        toast({
          title: "Success",
          description: "Venue updated successfully",
        })
      } else {
        throw new Error(data.error)
      }
    } catch (err) {
      console.error("Error updating venue:", err)
      toast({
        title: "Error",
        description: "Failed to update venue",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddAmenity = async () => {
    if (!newAmenity.trim()) return

    const updated = [...amenities, newAmenity.trim()]
    setAmenities(updated)
    setNewAmenity("")
  }

  const handleRemoveAmenity = async (index: number) => {
    const updatedAmenities = amenities.filter((_, i) => i !== index)
    setAmenities(updatedAmenities)
  }

  const handleAddSpace = async () => {
    if (!newSpace.name.trim()) return

    const updatedSpaces = [
      ...meetingSpaces,
      {
        id: Date.now().toString(),
        name: newSpace.name,
        capacity: Number(newSpace.capacity),
        area: Number(newSpace.area),
        hourlyRate: Number(newSpace.hourlyRate),
        features: newSpace.features.split(",").map((f) => f.trim()),
      },
    ]

    setMeetingSpaces(updatedSpaces)
    setNewSpace({ name: "", capacity: "", area: "", hourlyRate: "", features: "" })
  }

  const handleRemoveSpace = async (id: string) => {
    const updatedSpaces = meetingSpaces.filter((space) => space.id !== id)
    setMeetingSpaces(updatedSpaces)
  }

  if (isLoading && !profileData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading venue data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">Venue Profile</h1>
        <div className="flex items-center gap-2">
          {isEditing ? (
            <>
              <Button variant="outline" onClick={() => setIsEditing(false)} disabled={isLoading}>
                Cancel
              </Button>
              <Button onClick={handleSave} className="flex items-center gap-2" disabled={isLoading}>
                <Save className="w-4 h-4" />
                {isLoading ? "Saving..." : "Save Changes"}
              </Button>
            </>
          ) : (
            <Button onClick={() => setIsEditing(true)} className="flex items-center gap-2">
              <Edit className="w-4 h-4" />
              Edit Profile
            </Button>
          )}
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="images">Images</TabsTrigger>
          <TabsTrigger value="amenities">Amenities</TabsTrigger>
          <TabsTrigger value="spaces">Halls</TabsTrigger>
          <TabsTrigger value="floorplan">Floor Plan</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Profile Info */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="w-5 h-5" />
                    Basic Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="venue-name">Venue Name</Label>
                      {isEditing ? (
                        <Input
                          id="venue-name"
                          value={profileData?.venueName}
                          onChange={(e) =>
                            setProfileData({
                              ...(profileData ?? {}),
                              venueName: e.target.value,
                            } as VenueData)
                          }
                        />
                      ) : (
                        <div className="p-2 bg-muted rounded">{profileData?.venueName}</div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="contact-person">Contact Person</Label>
                      {isEditing ? (
                        <Input
                          id="contact-person"
                          value={profileData?.contactPerson}
                          onChange={(e) =>
                            setProfileData(
                              (prev) =>
                                ({
                                  ...(prev ?? {}),
                                  contactPerson: e.target.value,
                                }) as VenueData,
                            )
                          }
                        />
                      ) : (
                        <div className="p-2 bg-muted rounded">{profileData?.contactPerson}</div>
                      )}
                    </div>

 <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <div className="p-2 bg-muted rounded flex items-center justify-between">
          <span>{profileData?.email}</span>
          {!isEditing && (
            <CheckCircle className="w-4 h-4 text-green-500" />
          )}
        </div>
        {isEditing && (
          <p className="text-xs text-muted-foreground">
            Email cannot be edited
          </p>
        )}
      </div>

      {/* Mobile Field - Always Read Only */}
      <div className="space-y-2">
        <Label htmlFor="mobile">Mobile</Label>
        <div className="p-2 bg-muted rounded flex items-center justify-between">
          <span>{profileData?.mobile}</span>
          {!isEditing && (
            <CheckCircle className="w-4 h-4 text-green-500" />
          )}
        </div>
        {isEditing && (
          <p className="text-xs text-muted-foreground">
            Mobile number cannot be edited
          </p>
        )}
      </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="website">Website</Label>
                      {isEditing ? (
                        <Input
                          id="website"
                          value={profileData?.website}
                          onChange={(e) =>
                            setProfileData(
                              (prev) =>
                                ({
                                  ...(prev ?? {}),
                                  website: e.target.value,
                                }) as VenueData,
                            )
                          }
                        />
                      ) : (
                        <div className="p-2 bg-muted rounded">{profileData?.website}</div>
                      )}
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label>Street Address</Label>
                      <div className="p-2 bg-muted rounded">{profileData?.address || "Not specified"}</div>
                    </div>
                  </div>

                  {/* Address Section */}
                  <div className="pt-4 border-t">
                    <h3 className="text-lg font-semibold mb-4">Address Details</h3>
                    <div className="grid grid-cols-1 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="address">Street Address</Label>
                        {isEditing ? (
                          <Input
                            id="address"
                            value={profileData?.address}
                            onChange={(e) =>
                              setProfileData(
                                (prev) =>
                                  ({
                                    ...(prev ?? {}),
                                    address: e.target.value,
                                  }) as VenueData,
                              )
                            }
                            placeholder="Enter street address"
                          />
                        ) : (
                          <div className="p-2 bg-muted rounded">{profileData?.address || "Not specified"}</div>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {isEditing ? (
                          <>
                            <div className="space-y-2">
                              <Label>Choose Your Country</Label>
                              <Select
                                disabled={false}
                                value={countryPick}
                                onValueChange={(value) => {
                                  setCountryPick(value)
                                  if (value === LOCATION_NONE) return
                                  const row = countryOptions.find((c) => c.code === value)
                                  if (row) {
                                    setProfileData((prev) =>
                                      prev
                                        ? {
                                            ...prev,
                                            country: row.name,
                                            state: "",
                                            city: "",
                                          }
                                        : prev,
                                    )
                                    setStatePick(LOCATION_NONE)
                                    setCityPick(LOCATION_NONE)
                                  }
                                }}
                              >
                                <SelectTrigger>
                                  <SelectValue
                                    placeholder="Choose your country"
                                  />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value={LOCATION_NONE}>-- None --</SelectItem>
                                  {countryOptions.map((country) => (
                                    <SelectItem key={country.code} value={country.code}>
                                      {country.name} ({country.code})
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="space-y-2">
                              <Label>Choose Your State</Label>
                              <Select
                                disabled={!resolvedCountryCode}
                                value={statePick}
                                onValueChange={(value) => {
                                  setStatePick(value)
                                  if (value === LOCATION_NONE) return
                                  const state = stateOptions.find((s) => s.code === value)
                                  if (state) {
                                    setProfileData((prev) =>
                                      prev ? { ...prev, state: state.name, city: "" } : prev,
                                    )
                                    setCityPick(LOCATION_NONE)
                                  }
                                }}
                              >
                                <SelectTrigger>
                                  <SelectValue
                                    placeholder={
                                      !resolvedCountryCode ? "Choose country first" : "Choose your state"
                                    }
                                  />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value={LOCATION_NONE}>-- None --</SelectItem>
                                  {stateOptions.map((state) => (
                                    <SelectItem key={state.code} value={state.code}>
                                      {state.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="space-y-2">
                              <Label>Choose Your City</Label>
                              <Select
                                disabled={!resolvedCountryCode || !resolvedStateCode}
                                value={cityPick}
                                onValueChange={async (value) => {
                                  setCityPick(value)
                                  if (value === LOCATION_NONE) return
                                  const city = cityOptions.find((c) => c.name === value)
                                  if (city) {
                                    const nextState =
                                      stateOptions.find((s) => s.code === resolvedStateCode)?.name ||
                                      profileData?.state ||
                                      ""
                                    const nextCountry =
                                      countryOptions.find((c) => c.code === resolvedCountryCode)?.name ||
                                      profileData?.country ||
                                      ""
                                    setProfileData((prev) => (prev ? { ...prev, city: city.name } : prev))
                                    await tryAutoFillPostalCode(city.name, nextState, nextCountry)
                                  }
                                }}
                              >
                                <SelectTrigger>
                                  <SelectValue
                                    placeholder={
                                      !resolvedCountryCode
                                        ? "Pick country first"
                                        : !resolvedStateCode
                                          ? "Pick state first"
                                          : "Choose your city"
                                    }
                                  />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value={LOCATION_NONE}>-- None --</SelectItem>
                                  {cityOptions.map((city) => (
                                    <SelectItem key={city.name} value={city.name}>
                                      {city.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="space-y-2">
                              <Label>Country</Label>
                              <div className="p-2 bg-muted rounded">{profileData?.country || "Not specified"}</div>
                            </div>
                            <div className="space-y-2">
                              <Label>State</Label>
                              <div className="p-2 bg-muted rounded">{profileData?.state || "Not specified"}</div>
                            </div>
                            <div className="space-y-2">
                              <Label>City</Label>
                              <div className="p-2 bg-muted rounded">{profileData?.city || "Not specified"}</div>
                            </div>
                          </>
                        )}

                        <div className="space-y-2">
                          <Label htmlFor="zipCode">Postal Code</Label>
                          {isEditing ? (
                            <Input
                              id="zipCode"
                              value={profileData?.zipCode}
                              onChange={(e) =>
                                setProfileData(
                                  (prev) =>
                                    ({
                                      ...(prev ?? {}),
                                      zipCode: e.target.value,
                                    }) as VenueData,
                                )
                              }
                              placeholder="Enter postal code"
                            />
                          ) : (
                            <div className="p-2 bg-muted rounded">{profileData?.zipCode || "Not specified"}</div>
                          )}
                        </div>

                        <div className="space-y-2 md:col-span-2">
                          <Label>Venue time zone</Label>
                          {isEditing ? (
                            <Popover open={tzPickerOpen} onOpenChange={setTzPickerOpen}>
                              <PopoverTrigger asChild>
                                <Button
                                  type="button"
                                  variant="outline"
                                  className="w-full justify-between font-normal"
                                >
                                  {profileData?.timezone?.trim()
                                    ? profileData.timezone
                                    : "Select IANA time zone"}
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-[min(100vw-2rem,22rem)] p-2" align="start">
                                <Input
                                  placeholder="Search zones..."
                                  value={tzFilter}
                                  onChange={(e) => setTzFilter(e.target.value)}
                                  className="mb-2"
                                />
                                <ScrollArea className="h-64 pr-2">
                                  <div className="flex flex-col gap-0.5">
                                    <button
                                      type="button"
                                      className="rounded px-2 py-1.5 text-left text-sm hover:bg-muted"
                                      onClick={() => {
                                        setProfileData((prev) =>
                                          prev ? { ...prev, timezone: "" } : prev,
                                        )
                                        setTzPickerOpen(false)
                                      }}
                                    >
                                      Clear selection
                                    </button>
                                    {filteredIanaZones.map((z) => (
                                      <button
                                        key={z}
                                        type="button"
                                        className="rounded px-2 py-1.5 text-left text-sm hover:bg-muted"
                                        onClick={() => {
                                          setProfileData((prev) =>
                                            prev ? { ...prev, timezone: z } : prev,
                                          )
                                          setTzPickerOpen(false)
                                          setTzFilter("")
                                        }}
                                      >
                                        {z}
                                      </button>
                                    ))}
                                  </div>
                                </ScrollArea>
                              </PopoverContent>
                            </Popover>
                          ) : (
                            <div className="p-2 bg-muted rounded">
                              {profileData?.timezone?.trim() || "Not specified"}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 pt-4 border-t">
                    <Label htmlFor="description">Description</Label>
                    {isEditing ? (
                      <Textarea
                        id="description"
                        rows={4}
                        value={profileData?.description}
                        onChange={(e) =>
                          setProfileData(
                            (prev) =>
                              ({
                                ...(prev ?? {}),
                                description: e.target.value,
                              }) as VenueData,
                          )
                        }
                        placeholder="Describe your venue, its unique features, and what makes it special..."
                      />
                    ) : (
                      <div className="p-2 bg-muted rounded min-h-[100px]">{profileData?.description}</div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar Stats */}
            <div className="space-y-6">
              {/* Venue Stats */}
              <Card>
                <CardHeader>
                  <CardTitle>Venue Statistics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Total Events</span>
                    <span className="font-semibold">{profileData?.totalEvents}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Active Bookings</span>
                    <span className="font-semibold">{profileData?.activeBookings}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Total Halls</span>
                    <span className="font-semibold">{profileData?.totalHalls}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Max Capacity</span>
                    <span className="font-semibold">{profileData?.maxCapacity?.toLocaleString?.() ?? "N/A"}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Rating */}
              <Card>
                <CardHeader>
                  <CardTitle>Customer Rating</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                    {profileData?.averageRating?.toFixed(1)}
                  </div>
                  <div className="flex items-center justify-center gap-1 mb-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-5 h-5 ${
                          i < Math.floor(profileData?.averageRating || 0)
                            ? "text-yellow-400 fill-current"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-muted-foreground">{profileData?.totalReviews} reviews</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Images Tab */}
        <TabsContent value="images" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="w-5 h-5" />
                Venue Images
              </CardTitle>
              <p className="text-sm text-muted-foreground">Upload high-quality images to showcase your venue</p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                {images.map((image, index) => (
                  <div key={index} className="relative group">
                    <Image
                      src={image || "/city/c4.jpg"}
                      alt={`Venue image ${index + 1}`}
                      width={300}
                      height={200}
                      className="w-full h-48 object-cover rounded-lg"
                    />
                    {isEditing && (
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                        <Button variant="destructive" size="sm" onClick={() => handleImageDelete(image, "venue")}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {isEditing && (
                <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                  <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">Upload Images</h3>
                  <p className="text-muted-foreground mb-4">Drag and drop images here, or click to select files</p>
                  <Input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={async (e) => {
                      const files = Array.from(e.target.files || [])
                      for (const file of files) {
                        await handleImageUpload(file, "venue")
                      }
                    }}
                    className="hidden"
                    id="venue-image-upload"
                  />
                  <Button asChild>
                    <label htmlFor="venue-image-upload" className="cursor-pointer">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Images
                    </label>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Amenities Tab */}
        <TabsContent value="amenities" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Venue Amenities</CardTitle>
              <p className="text-sm text-muted-foreground">Manage the amenities and features available at your venue</p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
                {amenities.map((amenity, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <span className="text-sm">{amenity}</span>
                    {isEditing && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveAmenity(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>

              {isEditing && (
                <div className="flex gap-2">
                  <Input
                    placeholder="Add new amenity..."
                    value={newAmenity}
                    onChange={(e) => setNewAmenity(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleAddAmenity()}
                  />
                  <Button onClick={handleAddAmenity}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Meeting Spaces Tab */}
        <TabsContent value="spaces" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Meeting Spaces</CardTitle>
              <p className="text-sm text-muted-foreground">Manage individual spaces within your venue</p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {meetingSpaces?.map((space) => (
                  <div key={space.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-lg">{space.name}</h3>
                      {isEditing && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveSpace(space.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Capacity:</span>
                        <span className="font-medium">{space.capacity} people</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Area:</span>
                        <span className="font-medium">{space.area} sq ft</span>
                      </div>
                    </div>

                    {space.features && space.features.length > 0 && (
                      <div>
                        <h4 className="font-medium text-sm mb-2">Features:</h4>
                        <div className="flex flex-wrap gap-1">
                          {space.features.map((feature: string, index: number) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {feature}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {isEditing && (
                <div className="border-2 border-dashed border-border rounded-lg p-6">
                  <h3 className="font-semibold mb-4">Add New Meeting Space</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <Input
                      placeholder="Space name"
                      value={newSpace.name}
                      onChange={(e) => setNewSpace({ ...newSpace, name: e.target.value })}
                    />
                    <Input
                      placeholder="Capacity (people)"
                      type="number"
                      value={newSpace.capacity}
                      onChange={(e) => setNewSpace({ ...newSpace, capacity: e.target.value })}
                    />
                    <Input
                      placeholder="Area (sq ft)"
                      type="number"
                      value={newSpace.area}
                      onChange={(e) => setNewSpace({ ...newSpace, area: e.target.value })}
                    />
                  </div>
                  <Input
                    placeholder="Features (comma separated)"
                    value={newSpace.features}
                    onChange={(e) => setNewSpace({ ...newSpace, features: e.target.value })}
                    className="mb-4"
                  />
                  <Button onClick={handleAddSpace}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Space
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Floor Plans Tab */}
        <TabsContent value="floorplan" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                Floor Plans Management
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Upload and manage floor plans for different levels of your venue
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {floorPlans.map((plan, index) => (
                  <div key={index} className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">Floor Plan {index + 1}</h3>
                      <Badge variant="secondary">Active</Badge>
                    </div>
                    <div className="relative aspect-square bg-muted rounded-lg border-2 border-dashed border-border overflow-hidden group">
                      <Image
                        src={plan || "/city/c4.jpg"}
                        alt={`Floor Plan ${index + 1}`}
                        fill
                        className="object-contain p-4"
                      />
                      {isEditing && (
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Button size="sm" variant="destructive" onClick={() => handleImageDelete(plan, "floorplan")}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {isEditing && (
                <div className="mt-6 border-2 border-dashed border-border rounded-lg p-6 text-center">
                  <Building2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">Add New Floor Plan</h3>
                  <p className="text-muted-foreground mb-4">
                    Upload floor plans for additional levels or outdoor spaces
                  </p>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={async (e) => {
                      const file = e.target.files?.[0]
                      if (file) {
                        await handleImageUpload(file, "floorplan")
                      }
                    }}
                    className="hidden"
                    id="floorplan-upload"
                  />
                  <Button asChild>
                    <label htmlFor="floorplan-upload" className="cursor-pointer">
                      <Plus className="w-4 h-4 mr-2" />
                      Upload Floor Plan
                    </label>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}