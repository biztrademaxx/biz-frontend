"use client"

import { useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  MapPin,
  Building2,
  Link,
  Upload,
  X,
  Plus,
  CheckCircle,
  Users,
  Square,
  DoorOpen,
  Shield,
  Mail,
  Phone,
  User,
} from "lucide-react"
import { toast } from "sonner"
import { adminApi } from "@/lib/admin-api"
import { uploadVenueImages, uploadVenueLogo, uploadVenueDocuments } from "@/lib/upload-utils"
import { getCityOptions, getCountryOptions, getStateOptions } from "@/lib/location-data"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface VenueFormData {
  // Venue Profile
  venueName: string
  contactPerson: string
  email: string
  mobile: string
  address: string
  city: string
  state: string
  country: string
  website: string
  googleMapLink: string
  
  // Venue Description
  description: string
  
  // Capacity & Spaces
  minCapacity: number
  maxCapacity: number
  totalHalls: number
  emergencyExits: number
  
  // Amenities
  amenities: string[]
  
  // Photos & Documents
  venuePhotos: File[]
  floorPlans: File[]
  emergencyPlans: File[]
  logo: File | null
  
  // Safety Info
  safetyInfo: string
  safetyCertifications: string[]
  
  // Manager Info
  managerName: string
  managerPhone: string
  
  // Status
  isVerified: boolean
  status: "active" | "suspended"
}

const LOCATION_NONE = "__none__"

export default function AddVenueComponent() {
  const [activeTab, setActiveTab] = useState("profile")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState<VenueFormData>({
    venueName: "",
    contactPerson: "",
    email: "",
    mobile: "",
    address: "",
    city: "",
    state: "",
    country: "",
    website: "",
    googleMapLink: "",
    description: "",
    minCapacity: 40,
    maxCapacity: 1000,
    totalHalls: 1,
    emergencyExits: 4,
    amenities: [],
    venuePhotos: [],
    floorPlans: [],
    emergencyPlans: [],
    logo: null,
    safetyInfo: "",
    safetyCertifications: [],
    managerName: "",
    managerPhone: "",
    isVerified: false,
    status: "active",
  })

  const [newAmenity, setNewAmenity] = useState("")
  const [newCertification, setNewCertification] = useState("")

  const [countryPick, setCountryPick] = useState<string>(LOCATION_NONE)
  const [statePick, setStatePick] = useState<string>(LOCATION_NONE)
  const [cityPick, setCityPick] = useState<string>(LOCATION_NONE)
  const [countryOptions, setCountryOptions] = useState(() => getCountryOptions())

  useEffect(() => {
    setCountryOptions(getCountryOptions())
  }, [])

  const resolvedCountryCode = useMemo(() => {
    if (countryPick !== LOCATION_NONE) return countryPick
    const name = formData.country.trim().toLowerCase()
    if (!name) return ""
    const row = countryOptions.find((x) => x.name.trim().toLowerCase() === name)
    return row?.code ?? ""
  }, [countryPick, formData.country, countryOptions])

  const stateOptions = useMemo(() => getStateOptions(resolvedCountryCode), [resolvedCountryCode])
  const resolvedStateCode = useMemo(() => {
    if (statePick !== LOCATION_NONE) return statePick
    const name = formData.state.trim().toLowerCase()
    if (!name) return ""
    const row = stateOptions.find((x) => x.name.trim().toLowerCase() === name)
    return row?.code ?? ""
  }, [statePick, formData.state, stateOptions])
  const cityOptions = useMemo(
    () => getCityOptions(resolvedCountryCode, resolvedStateCode),
    [resolvedCountryCode, resolvedStateCode],
  )

  const handleAddAmenity = () => {
    if (newAmenity.trim() && !formData.amenities.includes(newAmenity.trim())) {
      setFormData({
        ...formData,
        amenities: [...formData.amenities, newAmenity.trim()]
      })
      setNewAmenity("")
    }
  }

  const handleRemoveAmenity = (amenity: string) => {
    setFormData({
      ...formData,
      amenities: formData.amenities.filter(a => a !== amenity)
    })
  }

  const handleAddCertification = () => {
    if (newCertification.trim() && !formData.safetyCertifications.includes(newCertification.trim())) {
      setFormData({
        ...formData,
        safetyCertifications: [...formData.safetyCertifications, newCertification.trim()]
      })
      setNewCertification("")
    }
  }

  const handleRemoveCertification = (certification: string) => {
    setFormData({
      ...formData,
      safetyCertifications: formData.safetyCertifications.filter(c => c !== certification)
    })
  }

  const handleFileUpload = (files: FileList, type: 'venuePhotos' | 'floorPlans' | 'emergencyPlans' | 'logo') => {
    if (type === 'logo') {
      const file = files[0]
      if (file) {
        setFormData({
          ...formData,
          logo: file
        })
      }
    } else {
      const newFiles = Array.from(files)
      setFormData({
        ...formData,
        [type]: [...formData[type], ...newFiles]
      })
    }
  }

  const handleRemoveFile = (index: number, type: 'venuePhotos' | 'floorPlans' | 'emergencyPlans') => {
    setFormData({
      ...formData,
      [type]: formData[type].filter((_, i) => i !== index)
    })
  }

  const handleRemoveLogo = () => {
    setFormData({
      ...formData,
      logo: null
    })
  }

  const handleSubmit = async () => {
    // Validate required fields
    if (!formData.venueName || !formData.contactPerson || !formData.email || !formData.address) {
      toast.error("Please fill in all required fields (Venue Name, Contact Person, Email, and Address)")
      return
    }

    if (!formData.email.includes('@')) {
      toast.error("Please enter a valid email address")
      return
    }

    setIsSubmitting(true)

    try {
      let logoUrl = ""
      let venueImageUrls: string[] = []
      let floorPlanUrls: string[] = []
      let emergencyPlanUrls: string[] = []

      // Upload logo if provided
      if (formData.logo) {
        try {
          logoUrl = await uploadVenueLogo(formData.logo)
          toast.success("Logo uploaded successfully")
        } catch (error) {
          toast.error("Failed to upload logo")
          console.error('Logo upload error:', error)
        }
      }

      // Upload venue photos if provided
      if (formData.venuePhotos.length > 0) {
        try {
          venueImageUrls = await uploadVenueImages(formData.venuePhotos)
          toast.success("Venue photos uploaded successfully")
        } catch (error) {
          toast.error("Failed to upload some venue photos")
          console.error('Venue photos upload error:', error)
        }
      }

      // Upload floor plans if provided
      if (formData.floorPlans.length > 0) {
        try {
          floorPlanUrls = await uploadVenueDocuments(formData.floorPlans)
          toast.success("Floor plans uploaded successfully")
        } catch (error) {
          toast.error("Failed to upload some floor plans")
          console.error('Floor plans upload error:', error)
        }
      }

      // Upload emergency plans if provided
      if (formData.emergencyPlans.length > 0) {
        try {
          emergencyPlanUrls = await uploadVenueDocuments(formData.emergencyPlans)
          toast.success("Emergency plans uploaded successfully")
        } catch (error) {
          toast.error("Failed to upload some emergency plans")
          console.error('Emergency plans upload error:', error)
        }
      }

      // Combine all uploaded images
      const allVenueImages = [...venueImageUrls, ...floorPlanUrls, ...emergencyPlanUrls]

      const venueData = {
        venueName: formData.venueName,
        contactPerson: formData.contactPerson,
        email: formData.email,
        mobile: formData.mobile,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        country: formData.country,
        website: formData.website || formData.googleMapLink,
        description: formData.description,
        maxCapacity: formData.maxCapacity,
        minCapacity: formData.minCapacity,
        totalHalls: formData.totalHalls,
        amenities: formData.amenities,
        isVerified: formData.isVerified,
        status: formData.status,
        mapUrl: formData.googleMapLink,
        managerName: formData.managerName,
        managerPhone: formData.managerPhone,
        emergencyExits: formData.emergencyExits,
        safetyInfo: formData.safetyInfo,
        safetyCertifications: formData.safetyCertifications,
        logo: logoUrl,
        venueImages: allVenueImages,
      }

      const result = await adminApi<{ success?: boolean; error?: string }>("/venues", {
        method: "POST",
        body: {
          email: venueData.email,
          firstName: venueData.contactPerson?.split(" ")[0] ?? "Venue",
          lastName: venueData.contactPerson?.split(" ").slice(1).join(" ") ?? "",
          phone: venueData.mobile,
          venueName: venueData.venueName,
          venueCity: venueData.city,
          venueState: venueData.state,
          venueCountry: venueData.country,
          venueAddress: venueData.address,
          maxCapacity: venueData.maxCapacity,
          isActive: venueData.status === "active",
        },
      })

      if (result?.success !== false) {
        toast.success("Venue added successfully!")
        // Reset form
        setFormData({
          venueName: "",
          contactPerson: "",
          email: "",
          mobile: "",
          address: "",
          city: "",
          state: "",
          country: "",
          website: "",
          googleMapLink: "",
          description: "",
          minCapacity: 40,
          maxCapacity: 1000,
          totalHalls: 1,
          emergencyExits: 4,
          amenities: [],
          venuePhotos: [],
          floorPlans: [],
          emergencyPlans: [],
          logo: null,
          safetyInfo: "",
          safetyCertifications: [],
          managerName: "",
          managerPhone: "",
          isVerified: false,
          status: "active",
        })
        setActiveTab("profile")
      setCountryPick(LOCATION_NONE)
      setStatePick(LOCATION_NONE)
        setCityPick(LOCATION_NONE)
      } else {
        toast.error((result as { error?: string })?.error || "Failed to add venue")
      }
    } catch (error) {
      console.error('Error adding venue:', error)
      toast.error("Failed to add venue")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Add New Venue</h1>
        <p className="text-gray-600 mt-2">
          Complete all sections to add a new venue and venue manager to the platform
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="profile">Venue Profile</TabsTrigger>
          <TabsTrigger value="description">Description</TabsTrigger>
          <TabsTrigger value="photos">Venue Photos</TabsTrigger>
          <TabsTrigger value="spaces">Spaces & Capacity</TabsTrigger>
          <TabsTrigger value="safety">Safety Info</TabsTrigger>
        </TabsList>

        {/* Venue Profile Tab */}
        <TabsContent value="profile" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                Venue Profile & Manager Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Venue Logo Upload */}
              <div className="space-y-4">
                <Label className="text-sm font-medium">Venue Logo</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  {formData.logo ? (
                    <div className="flex flex-col items-center">
                      <img
                        src={URL.createObjectURL(formData.logo)}
                        alt="Venue logo"
                        className="w-32 h-32 object-contain mb-4"
                      />
                      <Button variant="destructive" onClick={handleRemoveLogo}>
                        <X className="w-4 h-4 mr-2" />
                        Remove Logo
                      </Button>
                    </div>
                  ) : (
                    <>
                      <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                      <p className="text-sm text-gray-600 mb-2">Upload venue logo</p>
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) => e.target.files && handleFileUpload(e.target.files, 'logo')}
                        className="hidden"
                        id="logo"
                      />
                      <Label htmlFor="logo">
                        <Button variant="outline" asChild>
                          <span>Browse Files</span>
                        </Button>
                      </Label>
                    </>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="venueName" className="text-sm font-medium">
                    Venue Name *
                  </Label>
                  <Input
                    id="venueName"
                    placeholder="Grand Convention Center"
                    value={formData.venueName}
                    onChange={(e) => setFormData({ ...formData, venueName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contactPerson" className="text-sm font-medium flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Contact Person *
                  </Label>
                  <Input
                    id="contactPerson"
                    placeholder="John Doe"
                    value={formData.contactPerson}
                    onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Email *
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="manager@venue.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mobile" className="text-sm font-medium flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    Mobile
                  </Label>
                  <Input
                    id="mobile"
                    placeholder="+1 234 567 8900"
                    value={formData.mobile}
                    onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address" className="text-sm font-medium flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Full Address *
                </Label>
                <Textarea
                  id="address"
                  placeholder="Enter complete venue address..."
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50/50 p-4 space-y-4">
                <p className="text-sm text-gray-600">
                  <span className="font-medium text-gray-800">Address — location lists</span> come from
                  the database (admin). You can pick below and still edit the text fields manually.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Choose Your Country</Label>
                    <Select
                      value={countryPick}
                      onValueChange={(v) => {
                        setCountryPick(v)
                        if (v === LOCATION_NONE) return
                        const row = countryOptions.find((x) => x.code === v)
                        if (row) {
                          setFormData((fd) => ({ ...fd, country: row.name }))
                          setStatePick(LOCATION_NONE)
                          setCityPick(LOCATION_NONE)
                        }
                      }}
                    >
                      <SelectTrigger className="bg-white">
                        <SelectValue placeholder="Choose your country" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={LOCATION_NONE}>— None —</SelectItem>
                        {countryOptions.map((co) => (
                          <SelectItem key={co.code} value={co.code}>
                            {co.name} ({co.code})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Choose Your State</Label>
                    <Select
                      disabled={!resolvedCountryCode}
                      value={statePick}
                      onValueChange={(v) => {
                        setStatePick(v)
                        if (v === LOCATION_NONE) return
                        const st = stateOptions.find((s) => s.code === v)
                        if (st) {
                          setFormData((fd) => ({ ...fd, state: st.name, city: "" }))
                          setCityPick(LOCATION_NONE)
                        }
                      }}
                    >
                      <SelectTrigger className="bg-white">
                        <SelectValue
                          placeholder={!resolvedCountryCode ? "Pick country first" : "Choose your state"}
                        />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={LOCATION_NONE}>— None —</SelectItem>
                        {stateOptions.map((st) => (
                          <SelectItem key={st.code} value={st.code}>
                            {st.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Choose Your City</Label>
                    <Select
                      disabled={!resolvedCountryCode || !resolvedStateCode}
                      value={cityPick}
                      onValueChange={(v) => {
                        setCityPick(v)
                        if (v === LOCATION_NONE) return
                        const ci = cityOptions.find((c) => c.name === v)
                        if (ci) setFormData((fd) => ({ ...fd, city: ci.name }))
                      }}
                    >
                      <SelectTrigger className="bg-white">
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
                        <SelectItem value={LOCATION_NONE}>— None —</SelectItem>
                        {cityOptions.map((ci) => (
                          <SelectItem key={ci.name} value={ci.name}>
                            {ci.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="googleMapLink" className="text-sm font-medium flex items-center gap-2">
                  <Link className="w-4 h-4" />
                  Google Map Link
                </Label>
                <Input
                  id="googleMapLink"
                  placeholder="https://www.google.com/maps/place/Venue+Name"
                  value={formData.googleMapLink}
                  onChange={(e) => setFormData({ ...formData, googleMapLink: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="managerName" className="text-sm font-medium">
                    Manager Name
                  </Label>
                  <Input
                    id="managerName"
                    placeholder="Venue Manager Name"
                    value={formData.managerName}
                    onChange={(e) => setFormData({ ...formData, managerName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="managerPhone" className="text-sm font-medium">
                    Manager Phone
                  </Label>
                  <Input
                    id="managerPhone"
                    placeholder="Manager contact number"
                    value={formData.managerPhone}
                    onChange={(e) => setFormData({ ...formData, managerPhone: e.target.value })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button onClick={() => setActiveTab("description")}>
              Next: Venue Description
            </Button>
          </div>
        </TabsContent>

        {/* Venue Description Tab */}
        <TabsContent value="description" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Venue Description</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Label htmlFor="description" className="text-sm font-medium">
                  Description *
                </Label>
                <Textarea
                  id="description"
                  placeholder="Describe your venue, its features, amenities, and what makes it special..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={8}
                  className="resize-none"
                />
                
                <div className="p-4 bg-blue-50 rounded-lg border">
                  <p className="text-sm text-blue-700">
                    <strong>Example:</strong> Grand Convention Center is a premier event destination, featuring versatile spaces with capacity ranging from 40 to 1000 guests. Our venue offers state-of-the-art AV systems, high-speed Wi-Fi, ample parking, and professional event management services.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setActiveTab("profile")}>
              Back
            </Button>
            <Button onClick={() => setActiveTab("photos")}>
              Next: Venue Photos
            </Button>
          </div>
        </TabsContent>

        {/* Venue Photos Tab */}
        <TabsContent value="photos" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Venue Photos & Documents</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Venue Photos Upload */}
              <div className="space-y-4">
                <Label className="text-sm font-medium">Venue Photos</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600 mb-2">Drag & drop venue photos here</p>
                  <p className="text-xs text-gray-500 mb-4">or</p>
                  <Input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => e.target.files && handleFileUpload(e.target.files, 'venuePhotos')}
                    className="hidden"
                    id="venuePhotos"
                  />
                  <Label htmlFor="venuePhotos">
                    <Button variant="outline" asChild>
                      <span>Browse Files</span>
                    </Button>
                  </Label>
                </div>
                
                {/* Uploaded Photos Preview */}
                {formData.venuePhotos.length > 0 && (
                  <div className="grid grid-cols-3 gap-2">
                    {formData.venuePhotos.map((file, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={URL.createObjectURL(file)}
                          alt={`Venue photo ${index + 1}`}
                          className="w-full h-20 object-cover rounded"
                        />
                        <Button
                          variant="destructive"
                          size="sm"
                          className="absolute top-1 right-1 w-6 h-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => handleRemoveFile(index, 'venuePhotos')}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Floor Plans Upload */}
              <div className="space-y-4">
                <Label className="text-sm font-medium">Floor Plans</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600 mb-2">Upload floor plans and layouts</p>
                  <Input
                    type="file"
                    multiple
                    accept="image/*,.pdf"
                    onChange={(e) => e.target.files && handleFileUpload(e.target.files, 'floorPlans')}
                    className="hidden"
                    id="floorPlans"
                  />
                  <Label htmlFor="floorPlans">
                    <Button variant="outline" asChild>
                      <span>Browse Files</span>
                    </Button>
                  </Label>
                </div>
              </div>

              {/* Amenities Checklist */}
              <div className="space-y-4">
                <Label className="text-sm font-medium">Amenities & Facilities</Label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    "WiFi Facilities",
                    "Air Conditioning",
                    "Parking",
                    "Catering",
                    "AV Equipment",
                    "Projector",
                    "Sound System",
                    "Lighting",
                    "Stage",
                    "Dressing Rooms",
                    "Green Rooms",
                    "Storage",
                    "Security",
                    "Cleaning",
                    "Technical Support",
                    "Event Planning",
                    "Furniture",
                    "Decoration",
                  ].map((amenity) => (
                    <div key={amenity} className="flex items-center space-x-2">
                      <Switch
                        checked={formData.amenities.includes(amenity)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setFormData({
                              ...formData,
                              amenities: [...formData.amenities, amenity]
                            })
                          } else {
                            handleRemoveAmenity(amenity)
                          }
                        }}
                      />
                      <Label className="text-sm">{amenity}</Label>
                    </div>
                  ))}
                </div>

                {/* Custom Amenities */}
                <div className="flex gap-2">
                  <Input
                    placeholder="Add custom amenity..."
                    value={newAmenity}
                    onChange={(e) => setNewAmenity(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddAmenity()}
                  />
                  <Button onClick={handleAddAmenity} variant="outline">
                    Add
                  </Button>
                </div>

                {/* Selected Amenities */}
                {formData.amenities.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.amenities.map((amenity) => (
                      <Badge key={amenity} variant="secondary" className="flex items-center gap-1">
                        {amenity}
                        <X
                          className="w-3 h-3 cursor-pointer"
                          onClick={() => handleRemoveAmenity(amenity)}
                        />
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setActiveTab("description")}>
              Back
            </Button>
            <Button onClick={() => setActiveTab("spaces")}>
              Next: Spaces & Capacity
            </Button>
          </div>
        </TabsContent>

        {/* Spaces & Capacity Tab */}
        <TabsContent value="spaces" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Capacity & Spaces
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="minCapacity" className="text-sm font-medium flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      Minimum Capacity
                    </Label>
                    <Input
                      id="minCapacity"
                      type="number"
                      value={formData.minCapacity}
                      onChange={(e) => setFormData({ ...formData, minCapacity: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="maxCapacity" className="text-sm font-medium flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      Maximum Capacity *
                    </Label>
                    <Input
                      id="maxCapacity"
                      type="number"
                      value={formData.maxCapacity}
                      onChange={(e) => setFormData({ ...formData, maxCapacity: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="totalHalls" className="text-sm font-medium flex items-center gap-2">
                      <Square className="w-4 h-4" />
                      Total Spaces/Halls
                    </Label>
                    <Input
                      id="totalHalls"
                      type="number"
                      value={formData.totalHalls}
                      onChange={(e) => setFormData({ ...formData, totalHalls: parseInt(e.target.value) || 1 })}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="emergencyExits" className="text-sm font-medium flex items-center gap-2">
                      <DoorOpen className="w-4 h-4" />
                      Emergency Exits
                    </Label>
                    <Input
                      id="emergencyExits"
                      type="number"
                      value={formData.emergencyExits}
                      onChange={(e) => setFormData({ ...formData, emergencyExits: parseInt(e.target.value) || 1 })}
                    />
                  </div>
                </div>
              </div>

              {/* Capacity Range Display */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Capacity Range</span>
                  <span className="text-lg font-bold text-blue-600">
                    {formData.minCapacity} - {formData.maxCapacity} people
                  </span>
                </div>
              </div>

              {/* Status Settings */}
              <div className="space-y-4">
                <Label className="text-sm font-medium">Venue Status</Label>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={formData.isVerified}
                      onCheckedChange={(checked) => setFormData({ ...formData, isVerified: checked })}
                    />
                    <Label>Verified Venue</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={formData.status === "active"}
                      onCheckedChange={(checked) => setFormData({ ...formData, status: checked ? "active" : "suspended" })}
                    />
                    <Label>Active</Label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setActiveTab("photos")}>
              Back
            </Button>
            <Button onClick={() => setActiveTab("safety")}>
              Next: Safety Information
            </Button>
          </div>
        </TabsContent>

        {/* Safety Information Tab */}
        <TabsContent value="safety" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Emergency Exit Plans & Safety Info
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Safety Information */}
              <div className="space-y-4">
                <Label htmlFor="safetyInfo" className="text-sm font-medium">
                  Safety Information & Procedures
                </Label>
                <Textarea
                  id="safetyInfo"
                  placeholder="Describe emergency procedures, safety features, and protocols..."
                  value={formData.safetyInfo}
                  onChange={(e) => setFormData({ ...formData, safetyInfo: e.target.value })}
                  rows={6}
                />
              </div>

              {/* Emergency Plans Upload */}
              <div className="space-y-4">
                <Label className="text-sm font-medium">Emergency Exit Plans</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600 mb-2">Upload emergency exit plans and safety documents</p>
                  <Input
                    type="file"
                    multiple
                    accept="image/*,.pdf"
                    onChange={(e) => e.target.files && handleFileUpload(e.target.files, 'emergencyPlans')}
                    className="hidden"
                    id="emergencyPlans"
                  />
                  <Label htmlFor="emergencyPlans">
                    <Button variant="outline" asChild>
                      <span>Browse Files</span>
                    </Button>
                  </Label>
                </div>
              </div>

              {/* Safety Certifications */}
              <div className="space-y-4">
                <Label className="text-sm font-medium">Safety Certifications</Label>
                <div className="flex gap-2 mb-3">
                  <Input
                    placeholder="Add safety certification..."
                    value={newCertification}
                    onChange={(e) => setNewCertification(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddCertification()}
                  />
                  <Button onClick={handleAddCertification} variant="outline">
                    Add
                  </Button>
                </div>

                {formData.safetyCertifications.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.safetyCertifications.map((certification) => (
                      <Badge key={certification} variant="secondary" className="flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        {certification}
                        <X
                          className="w-3 h-3 cursor-pointer"
                          onClick={() => handleRemoveCertification(certification)}
                        />
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setActiveTab("spaces")}>
              Back
            </Button>
            <Button 
              onClick={handleSubmit} 
              className="bg-green-600 hover:bg-green-700"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Adding Venue...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Add Venue & Create Manager
                </>
              )}
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}