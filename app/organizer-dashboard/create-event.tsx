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

  const [formData, setFormData] = useState<EventFormData>(() => getDefaultCreateEventFormData())

  const [newHighlight, setNewHighlight] = useState("")
  const [newTag, setNewTag] = useState("")
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({})
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
    ;(async () => {
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
  }

  const calculateCompletionPercentage = () => {
    const spaceCostsValid = validateOrganizerExhibitorSpaceCosts(formData.spaceCosts) === undefined
    const requiredFields = [
      formData.title,
      formData.slug,
      formData.description,
      formData.eventType,
      formData.startDate,
      formData.endDate,
      formData.venue,
      formData.city,
      formData.address,
      spaceCostsValid,
    ]
    const optionalFields = [
      formData.categories.length > 0,
      formData.highlights.length > 0,
      formData.tags.length > 0,
      formData.images.length > 0,
    ]
    const requiredCompleted = requiredFields.filter((field) => field && field.toString().trim() !== "").length
    const optionalCompleted = optionalFields.filter(Boolean).length
    const requiredPercentage = (requiredCompleted / requiredFields.length) * 80
    const optionalPercentage = (optionalCompleted / optionalFields.length) * 20
    return Math.round(requiredPercentage + optionalPercentage)
  }

  useEffect(() => {
    setCompletionPercentage(calculateCompletionPercentage())
  }, [formData])

  const handleNextTab = () => {
    const currentIndex = tabs.findIndex((tab) => tab.id === activeTab)
    if (currentIndex < tabs.length - 1) {
      setActiveTab(tabs[currentIndex + 1].id)
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

    if (!formData.dailyStart.trim()) {
      toast({
        title: "Time Required",
        description: "Daily start time is required",
        variant: "destructive",
      })
      return
    }
    if (!formData.dailyEnd.trim()) {
      toast({
        title: "Time Required",
        description: "Daily end time is required",
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
        requestAnimationFrame(() => {
          document.getElementById("exhibitor-space-costs-section")?.scrollIntoView({
            behavior: "smooth",
            block: "center",
          })
        })
      } else {
        const firstErrorField = Object.keys(newValidationErrors)[0]
        const element = document.getElementById(firstErrorField)
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "center" })
        }
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

      setFormData(getDefaultCreateEventFormData())
      setValidationErrors({})
      setSelectedVenueId("")
      setCompletionPercentage(0)
      setActiveTab("basic")
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
          {completionPercentage < 80 ? "Complete required fields to publish your event" : "Ready to publish!"}
        </p>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Create New Event</h2>
          <p className="text-gray-600">Fill in the details to create your event</p>
        </div>
        <div className="flex gap-3">
          <Button
            type="button"
            onClick={() => void handlePublishEvent()}
            disabled={isPublishing || completionPercentage < 80}
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

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5 rounded-xl bg-gray-100 p-1">
          {tabs.map((tab) => (
            <TabsTrigger
              key={tab.id}
              value={tab.id}
              className="rounded-lg text-gray-600 transition-all duration-200 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#004A96] data-[state=active]:to-[#004A96] data-[state=active]:text-white data-[state=active]:shadow-md"
            >
              {tab.label}
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
              disabled={isPublishing || completionPercentage < 80}
            >
              <Send className="w-4 h-4 mr-2" />
              {isPublishing ? "Publishing..." : "Publish Event"}
            </Button>
          ) : (
            <Button type="button" onClick={handleNextTab} className="flex items-center gap-2">
              Next
              <ChevronRight className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

    </div>
  )
}
