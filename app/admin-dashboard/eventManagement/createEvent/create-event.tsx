"use client"

import { useState, useRef, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Save, Eye, Loader2 } from "lucide-react"
import { FormProgress } from "./form-progress"
import { BasicInfoTab } from "./basic-info-tab"
import { EventDetailsTab } from "./event-details-tab"
import { PricingTab } from "./pricing-tab"
import { MediaTab } from "./media-tab"
import { PreviewTab } from "./preview-tab"
import { SelectOrganizer } from "./select-organizer"
import { SelectVenue } from "./select-venue"
import { SelectSpeakers } from "./select-speakers"
import { SelectExhibitors } from "./select-exhibitors"
import type { EventFormData, SpaceCost, ExhibitorBooth } from "./types"
import { apiFetch } from "@/lib/api"
import { getCountryTimezoneByName } from "@/lib/location-data"

const slugifyTitle = (value: string): string =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")

export function CreateEventForm() {
  const [activeTab, setActiveTab] = useState("basic")
  const [formData, setFormData] = useState<EventFormData>({
    title: "",
    slug: "",
    description: "",
    eventType: "CONFERENCE",
    categories: [],
    edition: 1,
    startDate: "",
    endDate: "",
    dailyStart: "",
    dailyEnd: "",
    timezone: "UTC",
    venueId: "",
    venue: "",
    city: "",
    state: "",
    country: "",
    address: "",
    registrationStart: "",
    registrationEnd: "",
    currency: "USD",
    generalPrice: 0,
    studentPrice: 0,
    vipPrice: 0,
    groupPrice: 0,
    highlights: [""],
    tags: [],
    dressCode: "",
    ageLimit: "",
    featured: false,
    vip: false,
    spaceCosts: [],
    ticketTypes: [],
    images: [],
    brochure: "",
    layoutPlan: "",
    featuredHotels: [],
    travelPartners: [],
    touristAttractions: [],
    ageRestriction: "",
    accessibility: "",
    parking: "",
    publicTransport: "",
    foodBeverage: "",
    wifi: "",
    photography: "",
    recording: "",
    liveStreaming: "",
    socialMedia: "",
    networking: "",
    certificates: "",
    materials: "",
    followUp: "",
  })

  const [validationErrors, setValidationErrors] = useState({})
  const [newHighlight, setNewHighlight] = useState("")
  const [newTag, setNewTag] = useState("")
  const [isUploadingImages, setIsUploadingImages] = useState(false)
  const [isUploadingBrochure, setIsUploadingBrochure] = useState(false)
  const [isUploadingLayoutPlan, setIsUploadingLayoutPlan] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false)
  
  // New state for organizer, venue, speakers, and exhibitors
  const [organizerId, setOrganizerId] = useState("")
  const [speakerSessions, setSpeakerSessions] = useState<any[]>([])
  const [exhibitorBooths, setExhibitorBooths] = useState<ExhibitorBooth[]>([])
  
  // State for categories from backend
  const [eventCategories, setEventCategories] = useState<string[]>([])
  const [isLoadingCategories, setIsLoadingCategories] = useState(true)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const brochureInputRef = useRef<HTMLInputElement>(null)
  const layoutPlanInputRef = useRef<HTMLInputElement>(null)

  // Fetch categories from backend on component mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setIsLoadingCategories(true)
        const data = await apiFetch<Array<{ name: string }>>("/api/admin/event-categories", { auth: true })
        const list = Array.isArray(data) ? data : (data as any)?.data ?? []
        const categoryNames = list.map((c: any) => c.name)
        setEventCategories(categoryNames.length ? categoryNames : ["Technology", "Healthcare", "Finance", "Education", "Entertainment"])
      } catch (error) {
        console.error("Error fetching categories:", error)
        setEventCategories(["Technology", "Healthcare", "Finance", "Education", "Entertainment"])
      } finally {
        setIsLoadingCategories(false)
      }
    }

    fetchCategories()
  }, [])

  const handleFormChange = (updates: Partial<EventFormData>) => {
    setFormData((prev) => {
      const merged = { ...prev, ...updates }
      if ("slug" in updates && updates.slug !== undefined) {
        const normalized = slugifyTitle(String(updates.slug))
        setSlugManuallyEdited(normalized.length > 0)
        merged.slug = normalized
      }
      if ("country" in updates && updates.country !== undefined) {
        const tz = getCountryTimezoneByName(String(updates.country))
        if (tz) merged.timezone = tz
      }
      if ("title" in updates && !slugManuallyEdited) {
        merged.slug = slugifyTitle(String(merged.title ?? ""))
      }
      return merged
    })
  }

  const handleCategoryToggle = (category: string) => {
    setFormData((prev) => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter((c) => c !== category)
        : [...prev.categories, category],
    }))
  }

  const handleVenueChange = (venueData: {
    venueId?: string
    venueName: string
    venueAddress: string
    city: string
    state?: string
    country?: string
  }) => {
    setFormData((prev) => ({
      ...prev,
      venueId: venueData.venueId || "",
      venue: venueData.venueName,
      address: venueData.venueAddress,
      city: venueData.city,
      state: venueData.state || "",
      country: venueData.country || "",
      timezone: venueData.country ? getCountryTimezoneByName(venueData.country) || prev.timezone : prev.timezone,
    }))
  }

  const handleOrganizerChange = (organizerId: string, organizerEmail?: string) => {
    setOrganizerId(organizerId)
  }

  const handleSpeakerSessionsChange = (sessions: any[]) => {
    setSpeakerSessions(sessions)
  }

  const handleExhibitorBoothsChange = (booths: ExhibitorBooth[]) => {
    setExhibitorBooths(booths)
  }

  // Highlight handlers
  const handleAddHighlight = () => {
    if (newHighlight.trim()) {
      setFormData((prev) => ({
        ...prev,
        highlights: [...prev.highlights, newHighlight.trim()],
      }))
      setNewHighlight("")
    }
  }

  const handleRemoveHighlight = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      highlights: prev.highlights.filter((_, i) => i !== index),
    }))
  }

  // Tag handlers
  const handleAddTag = () => {
    if (newTag.trim()) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()],
      }))
      setNewTag("")
    }
  }

  const handleRemoveTag = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((_, i) => i !== index),
    }))
  }

  // Space cost handlers
  const handleAddCustomSpaceCost = () => {
    setFormData((prev) => ({
      ...prev,
      spaceCosts: [
        ...prev.spaceCosts,
        {
          type: "",
          description: "",
          pricePerSqm: 0,
          minArea: 0,
          isFixed: false,
        },
      ],
    }))
  }

  const handleUpdateSpaceCost = (index: number, field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      spaceCosts: prev.spaceCosts.map((cost, i) => (i === index ? { ...cost, [field]: value } : cost)),
    }))
  }

  const handleRemoveSpaceCost = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      spaceCosts: prev.spaceCosts.filter((_, i) => i !== index),
    }))
  }

  // Image handlers
  const handleRemoveImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }))
  }

  const handleUploadStatusChange = (type: 'images' | 'brochure' | 'layout', status: boolean) => {
    switch (type) {
      case 'images':
        setIsUploadingImages(status)
        break
      case 'brochure':
        setIsUploadingBrochure(status)
        break
      case 'layout':
        setIsUploadingLayoutPlan(status)
        break
    }
  }

  const handlePublish = async () => {
    console.log("Publishing event:", formData)
    
    // Validate required fields
    const errors: any = {}
    if (!formData.title) errors.title = "Title is required"
    if (!formData.description) errors.description = "Description is required"
    if (!formData.startDate) errors.startDate = "Start date is required"
    if (!formData.endDate) errors.endDate = "End date is required"
    
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors)
      setActiveTab("basic")
      return
    }

    setIsSubmitting(true)

    try {
      const eventData = {
        ...formData,
        organizerId: organizerId,
        speakerSessions: speakerSessions,
        exhibitorBooths: exhibitorBooths,
        eventType: formData.eventType ? [formData.eventType] : [],
        // Convert dates to ISO string if needed
        startDate: new Date(formData.startDate).toISOString(),
        endDate: new Date(formData.endDate).toISOString(),
        registrationStart: formData.registrationStart ? new Date(formData.registrationStart).toISOString() : new Date(formData.startDate).toISOString(),
        registrationEnd: formData.registrationEnd ? new Date(formData.registrationEnd).toISOString() : new Date(formData.endDate).toISOString(),
      }

      const result = await apiFetch<{ success?: boolean; event?: any; error?: string }>("/api/admin/events", {
        method: "POST",
        body: eventData,
        auth: true,
      })

      if (result?.event || result?.success !== false) {
        alert("Event created successfully!")
        // Redirect or reset form
      } else {
        alert(`Error creating event: ${(result as any)?.error ?? "Unknown error"}`)
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Error creating event. Please try again."
      console.error("Error creating event:", error)
      alert(msg)
    } finally {
      setIsSubmitting(false)
    }
  }

  const calculateProgress = () => {
    const fields = [
      formData.title,
      formData.startDate,
      formData.endDate,
      formData.venue,
      formData.description,
      formData.highlights.filter((h) => h.trim()).length > 0,
    ]
    const completed = fields.filter(Boolean).length
    return Math.round((completed / fields.length) * 100)
  }

  const currencies = ["USD", "EUR", "GBP", "INR", "JPY"]

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Create New Event</CardTitle>
              <CardDescription>Fill in the details to create a new event on the platform</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Save className="h-4 w-4 mr-2" />
                Save Draft
              </Button>
              <Button 
                size="sm" 
                onClick={handlePublish}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Eye className="h-4 w-4 mr-2" />
                )}
                {isSubmitting ? "Publishing..." : "Publish Event"}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <FormProgress completionPercentage={calculateProgress()} />

          <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
            <TabsList className="grid w-full grid-cols-9">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="organizer">Organizer</TabsTrigger>
              <TabsTrigger value="venue">Venue</TabsTrigger>
              <TabsTrigger value="speakers">Speakers</TabsTrigger>
              <TabsTrigger value="exhibitors">Exhibitors</TabsTrigger>
              <TabsTrigger value="details">Event Details</TabsTrigger>
              <TabsTrigger value="pricing">Pricing</TabsTrigger>
              <TabsTrigger value="media">Media</TabsTrigger>
              <TabsTrigger value="preview">Preview</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-6 mt-6">
              <BasicInfoTab
                formData={formData}
                validationErrors={validationErrors}
                eventCategories={eventCategories}
                isLoadingCategories={isLoadingCategories}
                onFormChange={handleFormChange}
                onCategoryToggle={handleCategoryToggle}
                onVenueChange={handleVenueChange}
              />
            </TabsContent>

            <TabsContent value="organizer" className="space-y-6 mt-6">
              <SelectOrganizer
                selectedOrganizerId={organizerId}
                onOrganizerChange={handleOrganizerChange}
              />
            </TabsContent>

            <TabsContent value="venue" className="space-y-6 mt-6">
              <SelectVenue
                selectedVenueId={formData.venueId}
                onVenueChange={handleVenueChange}
              />
            </TabsContent>

            <TabsContent value="speakers" className="space-y-6 mt-6">
              <SelectSpeakers
                speakerSessions={speakerSessions}
                onSpeakerSessionsChange={handleSpeakerSessionsChange}
              />
            </TabsContent>

            <TabsContent value="exhibitors" className="space-y-6 mt-6">
              <SelectExhibitors
                exhibitorBooths={exhibitorBooths}
                onExhibitorBoothsChange={handleExhibitorBoothsChange}
              />
            </TabsContent>

            <TabsContent value="details" className="space-y-6 mt-6">
              <EventDetailsTab
                formData={formData}
                validationErrors={validationErrors}
                newHighlight={newHighlight}
                newTag={newTag}
                onFormChange={handleFormChange}
                onNewHighlightChange={setNewHighlight}
                onNewTagChange={setNewTag}
                onAddHighlight={handleAddHighlight}
                onRemoveHighlight={handleRemoveHighlight}
                onAddTag={handleAddTag}
                onRemoveTag={handleRemoveTag}
              />
            </TabsContent>

            <TabsContent value="pricing" className="space-y-6 mt-6">
              <PricingTab
                formData={formData}
                currencies={currencies}
                onFormChange={handleFormChange}
                onAddCustomSpaceCost={handleAddCustomSpaceCost}
                onUpdateSpaceCost={handleUpdateSpaceCost}
                onRemoveSpaceCost={handleRemoveSpaceCost}
              />
            </TabsContent>

            <TabsContent value="media" className="space-y-6 mt-6">
              <MediaTab
                formData={formData}
                isUploadingImages={isUploadingImages}
                isUploadingBrochure={isUploadingBrochure}
                isUploadingLayoutPlan={isUploadingLayoutPlan}
                fileInputRef={fileInputRef}
                brochureInputRef={brochureInputRef}
                layoutPlanInputRef={layoutPlanInputRef}
                onFormChange={handleFormChange}
                onRemoveImage={handleRemoveImage}
                onUploadStatusChange={handleUploadStatusChange}
              />
            </TabsContent>

            <TabsContent value="preview" className="space-y-6 mt-6">
              <PreviewTab formData={formData} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}