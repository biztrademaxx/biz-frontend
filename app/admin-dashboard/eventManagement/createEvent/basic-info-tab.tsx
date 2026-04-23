"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Clock, Loader2 } from "lucide-react"
import { EVENT_FORMAT_SELECT_OPTIONS } from "@/lib/explore-event-types"
import type { EventFormData, ValidationErrors } from "./types"

interface BasicInfoTabProps {
  formData: EventFormData
  validationErrors: ValidationErrors
  eventCategories: string[]
  isLoadingCategories?: boolean
  onFormChange: (updates: Partial<EventFormData>) => void
  onCategoryToggle: (category: string) => void
  onVenueChange: (venueData: {
    venueId?: string
    venueName: string
    venueAddress: string
    city: string
    state?: string
    country?: string
  }) => void
}

export function BasicInfoTab({
  formData,
  validationErrors,
  eventCategories,
  isLoadingCategories = false,
  onFormChange,
  onCategoryToggle,
}: BasicInfoTabProps) {
  return (
    <div className="space-y-6">
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
                onChange={(e) => onFormChange({ title: e.target.value })}
                placeholder="Enter event title"
              />
              {validationErrors.title && <p className="text-sm text-red-500 mt-1">{validationErrors.title}</p>}
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="slug">Event Slug *</Label>
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) => onFormChange({ slug: e.target.value })}
                placeholder="auto-generated-from-title"
              />
              {validationErrors.slug && <p className="text-sm text-red-500 mt-1">{validationErrors.slug}</p>}
            </div>

            <div>
              <Label htmlFor="edition">Edition</Label>
              <Input
                id="edition"
                type="number"
                value={formData.edition === 0 ? "" : formData.edition}
                onChange={(e) =>
                  onFormChange({
                    edition: e.target.value === "" ? 0 : Number(e.target.value),
                  })
                }
                placeholder="e.g., 1, 2, 3"
                min="0"
              />
              <p className="text-xs text-muted-foreground mt-1">Optional: Specify the edition number</p>
            </div>

            <div>
              <Label htmlFor="eventType">Event Type *</Label>
              <Select value={formData.eventType} onValueChange={(value) => onFormChange({ eventType: value })}>
                <SelectTrigger>
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
              {validationErrors.eventType && <p className="text-sm text-red-500 mt-1">{validationErrors.eventType}</p>}
            </div>

            <div className="md:col-span-2">
              <Label>Event Categories</Label>
              {isLoadingCategories ? (
                <div className="flex items-center space-x-2 mt-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm text-muted-foreground">Loading categories...</span>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 mt-2">
                  {eventCategories.map((category) => (
                    <div key={category} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={`category-${category}`}
                        checked={formData.categories.includes(category)}
                        onChange={() => onCategoryToggle(category)}
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
              )}
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="description">Event Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => onFormChange({ description: e.target.value })}
                placeholder="Describe your event"
                rows={4}
              />
              {validationErrors.description && (
                <p className="text-sm text-red-500 mt-1">{validationErrors.description}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Event Timing & Venue
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="venue">Venue Name</Label>
              <Input
                id="venue"
                value={formData.venue}
                onChange={(e) => onFormChange({ venue: e.target.value })}
                placeholder="Enter venue name"
              />
            </div>

            <div>
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => onFormChange({ city: e.target.value })}
                placeholder="Enter city"
              />
            </div>

            <div>
              <Label htmlFor="state">State</Label>
              <Input
                id="state"
                value={formData.state}
                onChange={(e) => onFormChange({ state: e.target.value })}
                placeholder="Enter state"
              />
            </div>

            <div>
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                value={formData.country}
                onChange={(e) => onFormChange({ country: e.target.value })}
                placeholder="Enter country"
              />
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => onFormChange({ address: e.target.value })}
                placeholder="Enter venue address"
              />
            </div>

            <div>
              <Label htmlFor="startDate">Start Date *</Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate ? formData.startDate.split("T")[0] : ""}
                onChange={(e) => {
                  const dateValue = e.target.value
                  const timeValue = formData.startDate.includes("T")
                    ? formData.startDate.split("T")[1]
                    : "00:00:00.000+00:00"
                  const newStartDate = dateValue ? `${dateValue}T${timeValue.split(":00.000+")[0]}:00.000+00:00` : ""
                  onFormChange({ startDate: newStartDate })
                }}
              />
              {validationErrors.startDate && <p className="text-sm text-red-500 mt-1">{validationErrors.startDate}</p>}
            </div>

            <div>
              <Label htmlFor="startTime">Start Time</Label>
              <Input
                id="startTime"
                type="time"
                value={
                  formData.startDate && formData.startDate.includes("T")
                    ? formData.startDate.split("T")[1].slice(0, 5)
                    : "09:00"
                }
                onChange={(e) => {
                  const timeValue = e.target.value
                  const dateValue = formData.startDate
                    ? formData.startDate.split("T")[0]
                    : new Date().toISOString().split("T")[0]
                  const newStartDate = timeValue ? `${dateValue}T${timeValue}:00.000+00:00` : formData.startDate
                  onFormChange({ startDate: newStartDate })
                }}
              />
            </div>

            <div>
              <Label htmlFor="endDate">End Date *</Label>
              <Input
                id="endDate"
                type="date"
                value={formData.endDate ? formData.endDate.split("T")[0] : ""}
                onChange={(e) => {
                  const dateValue = e.target.value
                  const timeValue = formData.endDate.includes("T")
                    ? formData.endDate.split("T")[1]
                    : "00:00:00.000+00:00"
                  const newEndDate = dateValue ? `${dateValue}T${timeValue.split(":00.000+")[0]}:00.000+00:00` : ""
                  onFormChange({ endDate: newEndDate })
                }}
              />
              {validationErrors.endDate && <p className="text-sm text-red-500 mt-1">{validationErrors.endDate}</p>}
            </div>

            <div>
              <Label htmlFor="endTime">End Time</Label>
              <Input
                id="endTime"
                type="time"
                value={
                  formData.endDate && formData.endDate.includes("T")
                    ? formData.endDate.split("T")[1].slice(0, 5)
                    : "18:00"
                }
                onChange={(e) => {
                  const timeValue = e.target.value
                  const dateValue = formData.endDate
                    ? formData.endDate.split("T")[0]
                    : new Date().toISOString().split("T")[0]
                  const newEndDate = timeValue ? `${dateValue}T${timeValue}:00.000+00:00` : formData.endDate
                  onFormChange({ endDate: newEndDate })
                }}
              />
            </div>

            <div>
              <Label htmlFor="timezone">Timezone</Label>
              <Select value={formData.timezone} onValueChange={(value) => onFormChange({ timezone: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Asia/Kolkata">Asia/Kolkata (IST)</SelectItem>
                  <SelectItem value="America/New_York">America/New_York (EST)</SelectItem>
                  <SelectItem value="Europe/London">Europe/London (GMT)</SelectItem>
                  <SelectItem value="Asia/Tokyo">Asia/Tokyo (JST)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}