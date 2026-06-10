"use client"

import { devLog } from "@/lib/dev-log"
import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChevronLeft, ChevronRight, Loader2, Send } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { apiFetch } from "@/lib/api"
import { getCountryTimezoneByName } from "@/lib/location-data"
import type { EventFormData, ValidationErrors } from "@/components/organizer-create-event/types"
import { validateOrganizerExhibitorSpaceCosts, slugifyTitle } from "@/components/organizer-create-event/utils"
import { CREATE_EVENT_TABS, CREATE_EVENT_CURRENCIES } from "@/components/organizer-create-event/constants"
import { getDefaultCreateEventFormData } from "@/components/organizer-create-event/default-form-state"
import { uploadEventFileToBackend } from "@/components/organizer-create-event/upload-backend"
import {
  buildExhibitionSpacesFromForm,
  buildOrganizerPublishEventBody,
  buildTicketTypesForPublish,
  computePublishTimes,
  computePublishValidationErrors,
} from "@/components/organizer-create-event/publish-builders"
import { CreateEventBasicTab } from "@/components/organizer-create-event/tabs/CreateEventBasicTab"
import { CreateEventDetailsTab } from "@/components/organizer-create-event/tabs/CreateEventDetailsTab"
import { CreateEventPricingTab } from "@/components/organizer-create-event/tabs/CreateEventPricingTab"
import { CreateEventMediaTab } from "@/components/organizer-create-event/tabs/CreateEventMediaTab"
import { CreateEventPreviewTab } from "@/components/organizer-create-event/tabs/CreateEventPreviewTab"

// Validation function for each tab
const validateBasicTab = (formData: EventFormData): { isValid: boolean; errorField?: string } => {
  if (!formData.title?.trim()) return { isValid: false, errorField: "title" }
  if (!formData.subTitle?.trim()) return { isValid: false, errorField: "eventSubtitle" }
  if (!formData.slug?.trim()) return { isValid: false, errorField: "slug" }
  if (!formData.edition || formData.edition === 0) return { isValid: false, errorField: "edition" }
  if (!formData.eventType?.trim()) return { isValid: false, errorField: "eventType" }
  if (formData.categories.length === 0) return { isValid: false, errorField: "categories" }
  if (!formData.description?.trim()) return { isValid: false, errorField: "description" }
  if (!formData.startDate?.trim()) return { isValid: false, errorField: "startDate" }
  if (!formData.dailyStart?.trim()) return { isValid: false, errorField: "dailyStart" }
  if (!formData.endDate?.trim()) return { isValid: false, errorField: "endDate" }
  if (!formData.dailyEnd?.trim()) return { isValid: false, errorField: "dailyEnd" }
  if (!formData.venue?.trim()) return { isValid: false, errorField: "venue-section" }
  if (!formData.city?.trim()) return { isValid: false, errorField: "venue-section" }
  if (!formData.address?.trim()) return { isValid: false, errorField: "venue-section" }
  return { isValid: true }
}

const validateDetailsTab = (formData: EventFormData): { isValid: boolean; errorField?: string } => {
  if (formData.highlights.length === 0) return { isValid: false, errorField: "highlights" }
  if (formData.tags.length === 0) return { isValid: false, errorField: "tags" }
  if (!formData.dressCode?.trim()) return { isValid: false, errorField: "dressCode" }
  if (!formData.ageLimit?.trim()) return { isValid: false, errorField: "ageLimit" }
  return { isValid: true }
}

const validatePricingTab = (formData: EventFormData): { isValid: boolean; errorField?: string } => {
  if (!formData.currency?.trim()) return { isValid: false, errorField: "currency" }
  if (formData.generalPrice === undefined || formData.generalPrice === null)
    return { isValid: false, errorField: "generalPrice" }
  if (formData.studentPrice === undefined || formData.studentPrice === null)
    return { isValid: false, errorField: "studentPrice" }
  if (formData.vipPrice === undefined || formData.vipPrice === null)
    return { isValid: false, errorField: "vipPrice" }

  const spaceCostsValid = validateOrganizerExhibitorSpaceCosts(formData.spaceCosts) === undefined
  if (!spaceCostsValid) return { isValid: false, errorField: "exhibitor-space-costs-section" }
  return { isValid: true }
}

const validateMediaTab = (formData: EventFormData): { isValid: boolean; errorField?: string } => {
  if (formData.images.length === 0) return { isValid: false, errorField: "images" }
  if (!formData.brochure) return { isValid: false, errorField: "brochure" }
  if (!formData.layoutPlan) return { isValid: false, errorField: "layoutPlan" }
  return { isValid: true }
}

const validateTab = (tabId: string, formData: EventFormData): { isValid: boolean; errorField?: string } => {
  switch (tabId) {
    case "basic":
      return validateBasicTab(formData)
    case "details":
      return validateDetailsTab(formData)
    case "pricing":
      return validatePricingTab(formData)
    case "media":
      return validateMediaTab(formData)
    default:
      return { isValid: true }
  }
}

// Function to scroll to a specific field
const scrollToField = (fieldId: string) => {
  setTimeout(() => {
    const element = document.getElementById(fieldId)
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "center" })
      element.focus()
      // Add a temporary highlight effect
      element.classList.add("ring-2", "ring-red-500", "ring-offset-2")
      setTimeout(() => {
        element.classList.remove("ring-2", "ring-red-500", "ring-offset-2")
      }, 2000)
    }
  }, 100)
}

export default function CreateEvent({ organizerId }: { organizerId: string }) {
  const [activeTab, setActiveTab] = useState("basic")
  const [completionPercentage, setCompletionPercentage] = useState(0)
  const { toast } = useToast()
  const [showValidationErrors, setShowValidationErrors] = useState(false)
  const [isUploadingImages, setIsUploadingImages] = useState(false)
  const [isUploadingBrochure, setIsUploadingBrochure] = useState(false)
  const [isUploadingLayoutPlan, setIsUploadingLayoutPlan] = useState(false)
  const [selectedVenueId, setSelectedVenueId] = useState<string>("")
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false)
  const [tabValidationErrors, setTabValidationErrors] = useState<Record<string, boolean>>({})

  const [formData, setFormData] = useState<EventFormData>(() => getDefaultCreateEventFormData())

  const [newHighlight, setNewHighlight] = useState("")
  const [newTag, setNewTag] = useState("")
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>(() => ({} as ValidationErrors))
  const [isPublishing, setIsPublishing] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const brochureInputRef = useRef<HTMLInputElement>(null)
  const layoutPlanInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (slugManuallyEdited) return
    setFormData((prev) => {
      const nextSlug = slugifyTitle(prev.title || "")
      if (prev.slug === nextSlug) return prev
      return { ...prev, slug: nextSlug }
    })
  }, [formData.title, slugManuallyEdited])

  const tabs = [...CREATE_EVENT_TABS]

  const handleVenueChange = (venueData: {
    venueId?: string
    venueName: string
    venueAddress: string
    city: string
    state?: string
    country?: string
    timezone?: string
  }) => {
    const id = venueData.venueId || ""
    setSelectedVenueId(id)
    const tzFromVenue = venueData.timezone?.trim()
    const tzFromCountry = venueData.country ? getCountryTimezoneByName(venueData.country) || "" : ""
    setFormData((prev) => ({
      ...prev,
      venueId: id,
      venue: venueData.venueName,
      address: venueData.venueAddress,
      city: venueData.city,
      state: venueData.state || "",
      country: venueData.country || "",
      timezone: tzFromVenue || tzFromCountry || "",
    }))
  }

  const [eventCategoryNames, setEventCategoryNames] = useState<string[]>([])
  const [eventCategoriesLoading, setEventCategoriesLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
      ; (async () => {
        try {
          setEventCategoriesLoading(true)
          const res = await apiFetch<
            { success?: boolean; data?: Array<{ name: string }> } | Array<{ name: string }>
          >("/api/event-categories", { auth: false })
          const raw = Array.isArray(res) ? res : res?.data
          const names = (Array.isArray(raw) ? raw : [])
            .map((c) => (typeof c?.name === "string" ? c.name.trim() : ""))
            .filter(Boolean)
          if (!cancelled) setEventCategoryNames(names)
        } catch {
          if (!cancelled) setEventCategoryNames([])
        } finally {
          if (!cancelled) setEventCategoriesLoading(false)
        }
      })()
    return () => {
      cancelled = true
    }
  }, [])

  const addHighlight = () => {
    if (newHighlight.trim()) {
      setFormData((prev) => ({
        ...prev,
        highlights: [...prev.highlights, newHighlight.trim()],
      }))
      setNewHighlight("")
      // Clear validation error for highlights if any
      if (tabValidationErrors.details) {
        setTabValidationErrors(prev => ({ ...prev, details: false }))
      }
    }
  }

  const removeHighlight = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      highlights: prev.highlights.filter((_: string, i: number) => i !== index),
    }))
  }

  const addTag = () => {
    if (newTag.trim()) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()],
      }))
      setNewTag("")
      // Clear validation error for tags if any
      if (tabValidationErrors.details) {
        setTabValidationErrors(prev => ({ ...prev, details: false }))
      }
    }
  }

  const removeTag = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((_: string, i: number) => i !== index),
    }))
  }

  const updateSpaceCost = (index: number, field: string, value: unknown) => {
    setValidationErrors((prev) => ({ ...prev, spaceCosts: undefined }))
    setFormData((prev) => ({
      ...prev,
      spaceCosts: prev.spaceCosts.map((cost, i) => (i === index ? { ...cost, [field]: value } : cost)),
    }))
    // Clear validation error for pricing tab if space costs become valid
    if (validateOrganizerExhibitorSpaceCosts(formData.spaceCosts) === undefined) {
      setTabValidationErrors(prev => ({ ...prev, pricing: false }))
    }
  }

  const handleCategoryToggle = (category: string) => {
    setFormData((prev) => {
      const currentCategories = prev.categories
      if (currentCategories.includes(category)) {
        return { ...prev, categories: currentCategories.filter((c) => c !== category) }
      }
      if (currentCategories.length < 2) {
        return { ...prev, categories: [...currentCategories, category] }
      }
      return prev
    })
    // Clear validation error for categories if any
    if (tabValidationErrors.basic) {
      setTabValidationErrors(prev => ({ ...prev, basic: false }))
    }
  }

  const calculateCompletionPercentage = () => {
    const basicValid = validateBasicTab(formData).isValid
    const detailsValid = validateDetailsTab(formData).isValid
    const pricingValid = validatePricingTab(formData).isValid
    const mediaValid = validateMediaTab(formData).isValid

    const totalTabs = 4
    const completedTabs = [basicValid, detailsValid, pricingValid, mediaValid].filter(Boolean).length

    return Math.round((completedTabs / totalTabs) * 100)
  }

  useEffect(() => {
    setCompletionPercentage(calculateCompletionPercentage())
  }, [formData])

  const handleTabChange = async (newTabId: string) => {
    // Validate current tab before allowing navigation
    const currentTabId = activeTab
    const validation = validateTab(currentTabId, formData)

    if (!validation.isValid) {
      setShowValidationErrors(true)
      setTabValidationErrors(prev => ({ ...prev, [currentTabId]: true }))

      toast({
        title: "Cannot Navigate",
        description: `Please complete all required fields in the ${currentTabId.charAt(0).toUpperCase() + currentTabId.slice(1)} tab before proceeding.`,
        variant: "destructive",
      })

      // Scroll to the invalid field
      if (validation.errorField) {
        scrollToField(validation.errorField)
      }
      return
    }

    // Clear validation error for this tab
    setTabValidationErrors(prev => ({ ...prev, [currentTabId]: false }))
    setActiveTab(newTabId)
  }

  const handleNextTab = () => {
    const currentIndex = tabs.findIndex((tab) => tab.id === activeTab)
    if (currentIndex < tabs.length - 1) {
      handleTabChange(tabs[currentIndex + 1].id)
    }
  }

  const handlePreviousTab = () => {
    const currentIndex = tabs.findIndex((tab) => tab.id === activeTab)
    if (currentIndex > 0) {
      setActiveTab(tabs[currentIndex - 1].id)
    }
  }

  const handlePublishEvent = async () => {
    if (isUploadingBrochure || isUploadingLayoutPlan || isUploadingImages) {
      toast({
        title: "Please Wait",
        description: "File uploads are still in progress. Please wait for them to complete.",
        variant: "destructive",
      })
      return
    }

    // Validate all tabs before publishing
    const allTabs = ["basic", "details", "pricing", "media"]
    let firstInvalidTab = ""
    let firstInvalidField = ""

    for (const tabId of allTabs) {
      const validation = validateTab(tabId, formData)
      if (!validation.isValid) {
        firstInvalidTab = tabId
        firstInvalidField = validation.errorField || ""
        setTabValidationErrors(prev => ({ ...prev, [tabId]: true }))
        break
      }
    }

    if (firstInvalidTab) {
      setActiveTab(firstInvalidTab)
      setShowValidationErrors(true)
      toast({
        title: "Form Incomplete",
        description: `Please complete all required fields in the ${firstInvalidTab.charAt(0).toUpperCase() + firstInvalidTab.slice(1)} tab.`,
        variant: "destructive",
      })
      if (firstInvalidField) {
        scrollToField(firstInvalidField)
      }
      return
    }

    // Additional validation for date/time logic
    if (!formData.dailyStart.trim()) {
      scrollToField("dailyStart")
      toast({
        title: "Time Required",
        description: "Daily start time is required",
        variant: "destructive",
      })
      return
    }
    if (!formData.dailyEnd.trim()) {
      scrollToField("dailyEnd")
      toast({
        title: "Time Required",
        description: "Daily end time is required",
        variant: "destructive",
      })
      return
    }

    // Validate start date is before end date
    const startDate = new Date(formData.startDate)
    const endDate = new Date(formData.endDate)
    if (startDate > endDate) {
      scrollToField("startDate")
      toast({
        title: "Invalid Dates",
        description: "Start date must be before end date",
        variant: "destructive",
      })
      return
    }

    const newValidationErrors = computePublishValidationErrors(formData)
    setValidationErrors(newValidationErrors)

    if (Object.keys(newValidationErrors).length > 0) {
      toast({
        title: "Form Incomplete",
        description: "Please fill in all required fields correctly.",
        variant: "destructive",
      })
      if (newValidationErrors.spaceCosts) {
        setActiveTab("pricing")
        scrollToField("exhibitor-space-costs-section")
      } else {
        const firstErrorField = Object.keys(newValidationErrors)[0]
        scrollToField(firstErrorField)
      }
      return
    }

    setIsPublishing(true)

    try {
      devLog("🚀 Starting event submission process...")
      const exhibitionSpaces = buildExhibitionSpacesFromForm(formData)
      const { tz, startDateWithTime, endDateWithTime } = computePublishTimes(formData)
      const ticketTypes = buildTicketTypesForPublish(formData)
      const eventData = buildOrganizerPublishEventBody(
        formData,
        exhibitionSpaces,
        ticketTypes,
        startDateWithTime,
        endDateWithTime,
        tz,
      )

      devLog("📤 Submitting event data to API...")
      await apiFetch(`/api/organizers/${organizerId}/events`, {
        method: "POST",
        body: eventData,
        auth: true,
      })

      toast({
        title: "✅ Success!",
        description: (
          <div className="space-y-2">
            <p className="font-semibold">Event submitted for admin approval!</p>
            <p className="text-sm text-gray-600">
              Your event <span className="font-medium">&quot;{formData.title}&quot;</span> has been submitted. You will
              receive a notification when your event is approved. It typically takes 24-48 hours for review.
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={() => {
                window.location.href = `/organizer/${organizerId}/events`
              }}
            >
              View My Events
            </Button>
          </div>
        ),
        variant: "default",
        duration: 10000,
      })

      // Reset form after successful submission
      setFormData(getDefaultCreateEventFormData())
      setValidationErrors({} as ValidationErrors)
      setSelectedVenueId("")
      setCompletionPercentage(0)
      setActiveTab("basic")
      setTabValidationErrors({})
      setNewHighlight("")
      setNewTag("")
    } catch (error: unknown) {
      console.error("❌ Error submitting event:", error)
      const err = error as { message?: string }
      let errorMessage = err.message || "Failed to submit event. Please try again."
      let errorTitle = "Submission Failed"
      const msg = err.message || ""
      if (msg.includes("slug")) {
        errorTitle = "Slug Conflict"
        errorMessage = "An event with this slug already exists. Please choose a different slug."
      } else if (msg.includes("venue")) {
        errorTitle = "Venue Error"
        errorMessage = "The selected venue is not available. Please choose another venue."
      } else if (msg.includes("validation")) {
        errorTitle = "Validation Error"
        errorMessage = "Please check all required fields and try again."
      } else if (msg.includes("P2002")) {
        errorTitle = "Duplicate Entry"
        errorMessage = "An event with this title or slug already exists."
      } else if (msg.includes("network")) {
        errorTitle = "Network Error"
        errorMessage = "Unable to connect to the server. Please check your internet connection."
      }
      toast({
        title: errorTitle,
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsPublishing(false)
    }
  }

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return
    setIsUploadingImages(true)
    try {
      const uploadPromises = Array.from(files).map((file) => uploadEventFileToBackend(file, "image"))
      const uploadedUrls = await Promise.all(uploadPromises)
      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, ...uploadedUrls],
      }))
      toast({ title: "Success", description: `${uploadedUrls.length} image(s) uploaded successfully` })
      // Clear validation error for images
      if (tabValidationErrors.media) {
        setTabValidationErrors(prev => ({ ...prev, media: false }))
      }
    } catch (error) {
      console.error("Error uploading images:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to upload images. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsUploadingImages(false)
      if (event.target) event.target.value = ""
    }
  }

  const handleBrochureUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ]
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Invalid File Type",
        description: "Please upload a PDF, DOC, or DOCX file",
        variant: "destructive",
      })
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      toast({ title: "File Too Large", description: "File size must be less than 10MB", variant: "destructive" })
      return
    }
    setIsUploadingBrochure(true)
    try {
      const url = await uploadEventFileToBackend(file, "brochure")
      setFormData((prev) => ({ ...prev, brochure: url }))
      toast({ title: "Success", description: "Brochure uploaded successfully" })
      // Clear validation error for brochure
      if (tabValidationErrors.media) {
        setTabValidationErrors(prev => ({ ...prev, media: false }))
      }
    } catch (error) {
      console.error("Error uploading brochure:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to upload brochure. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsUploadingBrochure(false)
      if (event.target) event.target.value = ""
    }
  }

  const handleLayoutPlanUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    const validTypes = ["application/pdf", "image/jpeg", "image/jpg", "image/png"]
    if (!validTypes.includes(file.type)) {
      toast({
        title: "Invalid File Type",
        description: "Please upload a PDF, JPG, or PNG file",
        variant: "destructive",
      })
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Please upload a file smaller than 10MB",
        variant: "destructive",
      })
      return
    }
    setIsUploadingLayoutPlan(true)
    try {
      const url = await uploadEventFileToBackend(file, "layout")
      setFormData((prev) => ({ ...prev, layoutPlan: url }))
      toast({ title: "Success", description: "Layout plan uploaded successfully" })
      // Clear validation error for layout plan
      if (tabValidationErrors.media) {
        setTabValidationErrors(prev => ({ ...prev, media: false }))
      }
    } catch (error) {
      console.error("Error uploading layout plan:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to upload layout plan. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsUploadingLayoutPlan(false)
      if (event.target) event.target.value = ""
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-card border rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">Form Completion</span>
          <span className="text-sm text-muted-foreground">{completionPercentage}%</span>
        </div>
        <Progress value={completionPercentage} className="h-2 bg-gray-200 [&>div]:bg-gradient-to-r [&>div]:from-[#004A96] [&>div]:to-[#003d7a]" />
        <p className="text-xs text-muted-foreground mt-1">
          {completionPercentage < 100 ? `Complete all sections (${completionPercentage}% done) to publish your event` : "Ready to publish!"}
        </p>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Create New Event</h2>
          <p className="text-gray-600">Fill in all details to create your event. All fields are required.</p>
        </div>
        <div className="flex gap-3">
          <Button
            type="button"
            onClick={() => void handlePublishEvent()}
            disabled={isPublishing || completionPercentage < 100}
            className="flex items-center gap-2 bg-[#004A96] hover:bg-[#003d7a] text-white"
          >
            {isPublishing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Submitting for Approval...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Submit for Approval
              </>
            )}
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid w-full grid-cols-5 rounded-xl bg-gray-100 p-1">
          {tabs.map((tab) => (
            <TabsTrigger
              key={tab.id}
              value={tab.id}
              className={`rounded-lg text-gray-600 transition-all duration-200 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#004A96] data-[state=active]:to-[#004A96] data-[state=active]:text-white data-[state=active]:shadow-md ${tabValidationErrors[tab.id] ? "border-2 border-red-500 text-red-600" : ""
                }`}
            >
              {tab.label}
              {tabValidationErrors[tab.id] && (
                <span className="ml-1 text-xs text-red-500">*</span>
              )}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="basic" className="space-y-6">
          <CreateEventBasicTab
            organizerId={organizerId}
            formData={formData}
            setFormData={setFormData}
            showValidationErrors={showValidationErrors}
            setSlugManuallyEdited={setSlugManuallyEdited}
            eventCategoryNames={eventCategoryNames}
            eventCategoriesLoading={eventCategoriesLoading}
            handleCategoryToggle={handleCategoryToggle}
            selectedVenueId={selectedVenueId}
            handleVenueChange={handleVenueChange}
          />
        </TabsContent>

        <TabsContent value="details" className="space-y-6">
          <CreateEventDetailsTab
            formData={formData}
            setFormData={setFormData}
            newHighlight={newHighlight}
            setNewHighlight={setNewHighlight}
            newTag={newTag}
            setNewTag={setNewTag}
            addHighlight={addHighlight}
            removeHighlight={removeHighlight}
            addTag={addTag}
            removeTag={removeTag}
            showValidationErrors={showValidationErrors}
          />
        </TabsContent>

        <TabsContent value="pricing" className="space-y-6">
          <CreateEventPricingTab
            formData={formData}
            setFormData={setFormData}
            currencies={CREATE_EVENT_CURRENCIES}
            validationErrors={validationErrors}
            updateSpaceCost={updateSpaceCost}
          />
        </TabsContent>

        <TabsContent value="media" className="space-y-6">
          <CreateEventMediaTab
            formData={formData}
            setFormData={setFormData}
            fileInputRef={fileInputRef}
            brochureInputRef={brochureInputRef}
            layoutPlanInputRef={layoutPlanInputRef}
            isUploadingImages={isUploadingImages}
            isUploadingBrochure={isUploadingBrochure}
            isUploadingLayoutPlan={isUploadingLayoutPlan}
            showValidationErrors={showValidationErrors}
            handleImageUpload={handleImageUpload}
            handleBrochureUpload={handleBrochureUpload}
            handleLayoutPlanUpload={handleLayoutPlanUpload}
          />
        </TabsContent>

        <TabsContent value="preview" className="space-y-6">
          <CreateEventPreviewTab formData={formData} />
        </TabsContent>
      </Tabs>

      <div className="flex justify-between pt-6 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={handlePreviousTab}
          disabled={activeTab === "basic"}
          className="flex items-center gap-2 bg-transparent"
        >
          <ChevronLeft className="w-4 h-4" />
          Previous
        </Button>

        <div className="flex gap-3">
          {activeTab === "preview" ? (
            <Button
              type="button"
              onClick={() => void handlePublishEvent()}
              disabled={isPublishing || completionPercentage < 100}
              className="bg-[#004A96] hover:bg-[#003d7a]"
            >
              <Send className="w-4 h-4 mr-2" />
              {isPublishing ? "Submitting..." : "Submit for Approval"}
            </Button>
          ) : (
            <Button type="button" onClick={handleNextTab} className="flex items-center gap-2 bg-[#004A96] hover:bg-[#003d7a]">
              Next
              <ChevronRight className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}