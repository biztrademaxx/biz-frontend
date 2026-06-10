"use client"

import type React from "react"
import { Plus, X } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { EventFormData } from "../types"

export type CreateEventDetailsTabProps = {
  formData: EventFormData
  setFormData: React.Dispatch<React.SetStateAction<EventFormData>>
  newHighlight: string
  setNewHighlight: (v: string) => void
  newTag: string
  setNewTag: (v: string) => void
  addHighlight: () => void
  removeHighlight: (index: number) => void
  addTag: () => void
  removeTag: (index: number) => void
  showValidationErrors: boolean
}

export function CreateEventDetailsTab({
  formData,
  setFormData,
  newHighlight,
  setNewHighlight,
  newTag,
  setNewTag,
  addHighlight,
  removeHighlight,
  addTag,
  removeTag,
  showValidationErrors,
}: CreateEventDetailsTabProps) {
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Event Highlights *</CardTitle>
          <p className="text-sm text-muted-foreground">
            Add at least one highlight to make your event stand out.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={newHighlight}
              onChange={(e) => setNewHighlight(e.target.value)}
              placeholder="Add event highlight"
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault()
                  addHighlight()
                }
              }}
            />
            <Button type="button" onClick={addHighlight}>
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {formData.highlights.map((highlight, index) => (
              <Badge key={index} variant="secondary" className="flex items-center gap-1 px-3 py-1.5">
                <span>{highlight}</span>
                <button
                  type="button"
                  onClick={() => removeHighlight(index)}
                  className="ml-1 hover:bg-gray-300 rounded-full p-0.5 transition-colors"
                  aria-label={`Remove ${highlight}`}
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
          </div>
          {showValidationErrors && formData.highlights.length === 0 && (
            <p className="text-sm text-red-500 mt-1">At least one event highlight is required</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Event Tags & Keywords *</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div id="tags">
              <Label>Event Tags & Keywords *</Label>
              <div className="flex flex-wrap gap-2 mb-2">
                {formData.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-2 px-3 py-1.5">
                    <span>{tag}</span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        removeTag(index)
                      }}
                      className="hover:bg-gray-300 rounded-full p-0.5 transition-colors"
                      aria-label={`Remove ${tag}`}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>

              <div className="flex gap-2">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Add tags (press Enter)"
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      addTag()
                    }
                  }}
                  className={showValidationErrors && formData.tags.length === 0 ? "border-red-500" : ""}
                />
                <Button type="button" onClick={addTag} variant="outline">
                  Add
                </Button>
              </div>
              {showValidationErrors && formData.tags.length === 0 && (
                <p className="text-sm text-red-500 mt-1">At least one tag is required</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Event Guidelines *</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="dressCode">Dress Code *</Label>
              <Select
                value={formData.dressCode}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, dressCode: value }))}
              >
                <SelectTrigger id="dressCode" className={showValidationErrors && (!formData.dressCode || formData.dressCode.trim() === "") ? "border-red-500" : ""}>
                  <SelectValue placeholder="Select dress code" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Casual">Casual</SelectItem>
                  <SelectItem value="Business Casual">Business Casual</SelectItem>
                  <SelectItem value="Formal">Formal</SelectItem>
                </SelectContent>
              </Select>
              {showValidationErrors && (!formData.dressCode || formData.dressCode.trim() === "") && (
                <p className="text-sm text-red-500 mt-1">Dress code is required</p>
              )}
            </div>

            <div>
              <Label htmlFor="ageLimit">Age Limit *</Label>
              <Select
                value={formData.ageLimit}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, ageLimit: value }))}
              >
                <SelectTrigger id="ageLimit" className={showValidationErrors && (!formData.ageLimit || formData.ageLimit.trim() === "") ? "border-red-500" : ""}>
                  <SelectValue placeholder="Select age limit" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All Ages">All Ages</SelectItem>
                  <SelectItem value="18+">18+</SelectItem>
                  <SelectItem value="21+">21+</SelectItem>
                </SelectContent>
              </Select>
              {showValidationErrors && (!formData.ageLimit || formData.ageLimit.trim() === "") && (
                <p className="text-sm text-red-500 mt-1">Age limit is required</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  )
}