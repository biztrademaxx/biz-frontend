"use client"

import type React from "react"
import { Clock, Loader2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { EVENT_FORMAT_SELECT_OPTIONS } from "@/lib/explore-event-types"
import AddVenue from "@/app/organizer-dashboard/add-venue"
import type { EventFormData } from "../types"
import {
  formatTimeTo12Hour,
  getDatePart,
  getTimePart,
  convertLocalToUTC,
  getEffectiveEventCreationTimezone,
  slugifyTitle,
} from "../utils"

export type CreateEventBasicTabProps = {
  organizerId: string
  formData: EventFormData
  setFormData: React.Dispatch<React.SetStateAction<EventFormData>>
  showValidationErrors: boolean
  setSlugManuallyEdited: (v: boolean) => void
  eventCategoryNames: string[]
  eventCategoriesLoading: boolean
  handleCategoryToggle: (category: string) => void
  selectedVenueId: string
  handleVenueChange: (venueData: {
    venueId?: string
    venueName: string
    venueAddress: string
    city: string
    state?: string
    country?: string
    timezone?: string
  }) => void
}

export function CreateEventBasicTab({
  organizerId,
  formData,
  setFormData,
  showValidationErrors,
  setSlugManuallyEdited,
  eventCategoryNames,
  eventCategoriesLoading,
  handleCategoryToggle,
  selectedVenueId,
  handleVenueChange,
}: CreateEventBasicTabProps) {
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
          <p className="text-sm text-muted-foreground">
            All fields in this section are required for publishing your event.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Label htmlFor="title">Event Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                placeholder="Enter event title"
                className={showValidationErrors && (!formData.title || formData.title.trim() === "") ? "border-red-500" : ""}
              />
              {showValidationErrors && (!formData.title || formData.title.trim() === "") && (
                <p className="text-sm text-red-500 mt-1">Event title is required</p>
              )}
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="eventSubtitle">Event Subtitle *</Label>
              <Input
                id="eventSubtitle"
                name="eventSubtitle"
                autoComplete="off"
                maxLength={10}
                value={formData.subTitle ?? ""}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    subTitle: e.target.value.slice(0, 10),
                  }))
                }
                placeholder="tagline (max 10 characters)"
                className={showValidationErrors && (!formData.subTitle || formData.subTitle.trim() === "") ? "border-red-500" : ""}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Up to 10 characters. Separate from the full description below.
              </p>
              {showValidationErrors && (!formData.subTitle || formData.subTitle.trim() === "") && (
                <p className="text-sm text-red-500 mt-1">Event subtitle is required</p>
              )}
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="slug">Event Slug *</Label>
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) => {
                  const next = slugifyTitle(e.target.value)
                  setSlugManuallyEdited(next.length > 0)
                  setFormData((prev) => ({ ...prev, slug: next }))
                }}
                placeholder="auto-generated-from-title"
                className={showValidationErrors && (!formData.slug || formData.slug.trim() === "") ? "border-red-500" : ""}
              />
              {showValidationErrors && (!formData.slug || formData.slug.trim() === "") && (
                <p className="text-sm text-red-500 mt-1">Event slug is required</p>
              )}
            </div>

            <div>
              <Label htmlFor="edition">Edition *</Label>
              <Input
                id="edition"
                type="number"
                value={formData.edition === 0 ? "" : formData.edition}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    edition: e.target.value === "" ? 0 : Number(e.target.value),
                  }))
                }
                placeholder="e.g., 1, 2, 3"
                min="1"
                className={showValidationErrors && (!formData.edition || formData.edition === 0) ? "border-red-500" : ""}
              />
              <p className="text-xs text-muted-foreground mt-1">Specify the edition number (e.g., 1, 2, 3)</p>
              {showValidationErrors && (!formData.edition || formData.edition === 0) && (
                <p className="text-sm text-red-500 mt-1">Edition number is required</p>
              )}
            </div>

            <div>
              <Label htmlFor="eventType">Event Type *</Label>
              <Select
                value={formData.eventType}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, eventType: value }))}
              >
                <SelectTrigger id="eventType" className={showValidationErrors && (!formData.eventType || formData.eventType.trim() === "") ? "border-red-500" : ""}>
                  <SelectValue placeholder="Select event type" />
                </SelectTrigger>
                <SelectContent>
                  {EVENT_FORMAT_SELECT_OPTIONS.map(({ value, label }) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {showValidationErrors && (!formData.eventType || formData.eventType.trim() === "") && (
                <p className="text-sm text-red-500 mt-1">Event type is required</p>
              )}
            </div>

            <div className="md:col-span-2">
              <Label>Event Categories *</Label>
              <p className="text-xs text-muted-foreground mt-1 mb-2">
                Categories are managed by the admin. Select at least one category (maximum two).
              </p>
              {eventCategoriesLoading ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading categories…
                </div>
              ) : eventCategoryNames.length === 0 ? (
                <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-md p-3">
                  No active categories yet. Ask your administrator to add them under Admin → Events → Event Categories.
                </p>
              ) : (
                <>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 mt-2">
                    {eventCategoryNames.map((category) => (
                      <div key={category} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={`category-${category}`}
                          checked={formData.categories.includes(category)}
                          onChange={() => handleCategoryToggle(category)}
                          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <label
                          htmlFor={`category-${category}`}
                          className="text-sm font-medium text-gray-700 cursor-pointer"
                        >
                          {category}
                        </label>
                      </div>
                    ))}
                  </div>
                  {showValidationErrors && formData.categories.length === 0 && (
                    <p className="text-sm text-red-500 mt-1">At least one category is required</p>
                  )}
                </>
              )}
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="description">Event Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="Describe your event"
                rows={4}
                className={showValidationErrors && (!formData.description || formData.description.trim() === "") ? "border-red-500" : ""}
              />
              {showValidationErrors && (!formData.description || formData.description.trim() === "") && (
                <p className="text-sm text-red-500 mt-1">Event description is required</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Event Timing
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="startDate">Start Date *</Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate ? getDatePart(formData.startDate) : ""}
                onChange={(e) => {
                  const dateValue = e.target.value
                  const timeValue = getTimePart(formData.startDate)
                  const newStartDate = dateValue ? `${dateValue}T${timeValue}:00.000Z` : ""
                  setFormData((prevData) => ({ ...prevData, startDate: newStartDate }))
                }}
                className={showValidationErrors && (!formData.startDate || formData.startDate.trim() === "") ? "border-red-500" : ""}
              />
              {showValidationErrors && (!formData.startDate || formData.startDate.trim() === "") && (
                <p className="text-sm text-red-500 mt-1">Start date is required</p>
              )}
            </div>

            <div>
              <Label htmlFor="dailyStart">Daily Start Time *</Label>
              <Input
                id="dailyStart"
                type="time"
                value={formData.dailyStart}
                onChange={(e) => {
                  const timeValue = e.target.value
                  setFormData((prevData) => {
                    const dateValue = getDatePart(prevData.startDate) || new Date().toISOString().split("T")[0]
                    const tz = getEffectiveEventCreationTimezone(prevData)
                    const utcTime = convertLocalToUTC(timeValue, dateValue, tz)
                    return {
                      ...prevData,
                      dailyStart: timeValue,
                      ...(utcTime ? { startDate: utcTime } : {}),
                    }
                  })
                }}
                className={showValidationErrors && (!formData.dailyStart || formData.dailyStart.trim() === "") ? "border-red-500" : ""}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Time when the event starts each day - Display: {formatTimeTo12Hour(formData.dailyStart)}
              </p>
              {showValidationErrors && (!formData.dailyStart || formData.dailyStart.trim() === "") && (
                <p className="text-sm text-red-500 mt-1">Daily start time is required</p>
              )}
            </div>

            <div>
              <Label htmlFor="endDate">End Date *</Label>
              <Input
                id="endDate"
                type="date"
                value={formData.endDate ? getDatePart(formData.endDate) : ""}
                onChange={(e) => {
                  const dateValue = e.target.value
                  const timeValue = getTimePart(formData.endDate)
                  const newEndDate = dateValue ? `${dateValue}T${timeValue}:00.000Z` : ""
                  setFormData((prevData) => ({ ...prevData, endDate: newEndDate }))
                }}
                className={showValidationErrors && (!formData.endDate || formData.endDate.trim() === "") ? "border-red-500" : ""}
              />
              {showValidationErrors && (!formData.endDate || formData.endDate.trim() === "") && (
                <p className="text-sm text-red-500 mt-1">End date is required</p>
              )}
            </div>

            <div>
              <Label htmlFor="dailyEnd">Daily End Time *</Label>
              <Input
                id="dailyEnd"
                type="time"
                value={formData.dailyEnd}
                onChange={(e) => {
                  const timeValue = e.target.value
                  setFormData((prevData) => {
                    const dateValue = getDatePart(prevData.endDate) || new Date().toISOString().split("T")[0]
                    const tz = getEffectiveEventCreationTimezone(prevData)
                    const utcTime = convertLocalToUTC(timeValue, dateValue, tz)
                    return {
                      ...prevData,
                      dailyEnd: timeValue,
                      ...(utcTime ? { endDate: utcTime } : {}),
                    }
                  })
                }}
                className={showValidationErrors && (!formData.dailyEnd || formData.dailyEnd.trim() === "") ? "border-red-500" : ""}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Time when the event ends each day - Display: {formatTimeTo12Hour(formData.dailyEnd)}
              </p>
              {showValidationErrors && (!formData.dailyEnd || formData.dailyEnd.trim() === "") && (
                <p className="text-sm text-red-500 mt-1">Daily end time is required</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <div id="venue-section">
        <AddVenue organizerId={organizerId} onVenueChange={handleVenueChange} selectedVenueId={selectedVenueId} />
        {showValidationErrors && (!formData.venue || !formData.city || !formData.address) && (
          <p className="text-sm text-red-500 mt-2">Venue details (Venue Name, City, and Address) are required</p>
        )}
      </div>
    </>
  )
}