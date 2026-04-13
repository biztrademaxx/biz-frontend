"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, X } from "lucide-react"
import type { EventFormData, ValidationErrors } from "./types"

interface EventDetailsTabProps {
  formData: EventFormData
  validationErrors: ValidationErrors
  newHighlight: string
  newTag: string
  onFormChange: (updates: Partial<EventFormData>) => void
  onNewHighlightChange: (value: string) => void
  onNewTagChange: (value: string) => void
  onAddHighlight: () => void
  onRemoveHighlight: (index: number) => void
  onAddTag: () => void
  onRemoveTag: (index: number) => void
}

export function EventDetailsTab({
  formData,
  validationErrors,
  newHighlight,
  newTag,
  onFormChange,
  onNewHighlightChange,
  onNewTagChange,
  onAddHighlight,
  onRemoveHighlight,
  onAddTag,
  onRemoveTag,
}: EventDetailsTabProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Event Highlights</CardTitle>
          <p className="text-sm text-muted-foreground">
            Only Event Tags & Keywords are required for publishing in this section.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={newHighlight}
              onChange={(e) => onNewHighlightChange(e.target.value)}
              placeholder="Add event highlight"
              onKeyPress={(e) => e.key === "Enter" && onAddHighlight()}
            />
            <Button onClick={onAddHighlight}>
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {formData.highlights.map((highlight, index) => (
              <Badge key={index} variant="secondary" className="flex items-center gap-1">
                {highlight}
                <X className="w-3 h-3 cursor-pointer" onClick={() => onRemoveHighlight(index)} />
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Event Tags & Keywords *</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label>Event Tags & Keywords *</Label>
              <div className="flex flex-wrap gap-2 mb-2">
                {formData.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    {tag}
                    <X className="w-3 h-3 cursor-pointer" onClick={() => onRemoveTag(index)} />
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  value={newTag}
                  onChange={(e) => onNewTagChange(e.target.value)}
                  placeholder="Add tags (press Enter)"
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      onAddTag()
                    }
                  }}
                />
                <Button type="button" onClick={onAddTag} variant="outline">
                  Add
                </Button>
              </div>
              {validationErrors.tags && <p className="text-sm text-red-500 mt-1">{validationErrors.tags}</p>}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Event Guidelines</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="dressCode">Dress Code</Label>
              <Select value={formData.dressCode} onValueChange={(value) => onFormChange({ dressCode: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Casual">Casual</SelectItem>
                  <SelectItem value="Business Casual">Business Casual</SelectItem>
                  <SelectItem value="Formal">Formal</SelectItem>
                  <SelectItem value="Black Tie">Black Tie</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="ageLimit">Age Limit</Label>
              <Select value={formData.ageLimit} onValueChange={(value) => onFormChange({ ageLimit: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All Ages">All Ages</SelectItem>
                  <SelectItem value="18+">18+</SelectItem>
                  <SelectItem value="21+">21+</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Event Features</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Featured Event</Label>
              <p className="text-sm text-gray-600">Mark this event as featured</p>
            </div>
            <Switch checked={formData.featured} onCheckedChange={(checked) => onFormChange({ featured: checked })} />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>VIP Event</Label>
              <p className="text-sm text-gray-600">Mark this as a VIP event</p>
            </div>
            <Switch checked={formData.vip} onCheckedChange={(checked) => onFormChange({ vip: checked })} />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}