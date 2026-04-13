"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Trash2, Plus, GripVertical } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface FormField {
  id: string
  type: "text" | "email" | "number" | "textarea" | "select" | "date" | "file"
  label: string
  placeholder?: string
  required: boolean
  options?: string[]
}

interface CustomFormBuilderProps {
  organizerId: string
  eventId?: string
  onFormCreated?: () => void
}

export function CustomFormBuilder({ organizerId, eventId, onFormCreated }: CustomFormBuilderProps) {
  const [formTitle, setFormTitle] = useState("")
  const [formDescription, setFormDescription] = useState("")
  const [fields, setFields] = useState<FormField[]>([])
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const addField = () => {
    const newField: FormField = {
      id: `field_${Date.now()}`,
      type: "text",
      label: "",
      placeholder: "",
      required: false,
    }
    setFields([...fields, newField])
  }

  const updateField = (id: string, updates: Partial<FormField>) => {
    setFields(fields.map((field) => (field.id === id ? { ...field, ...updates } : field)))
  }

  const removeField = (id: string) => {
    setFields(fields.filter((field) => field.id !== id))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formTitle.trim()) {
      toast({
        title: "Error",
        description: "Form title is required",
        variant: "destructive",
      })
      return
    }

    if (fields.length === 0) {
      toast({
        title: "Error",
        description: "At least one field is required",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      const response = await fetch("/api/custom-forms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          organizerId,
          eventId,
          title: formTitle,
          description: formDescription,
          fields,
        }),
      })

      if (!response.ok) throw new Error("Failed to create form")

      toast({
        title: "Success",
        description: "Custom form created successfully",
      })

      // Reset form
      setFormTitle("")
      setFormDescription("")
      setFields([])
      onFormCreated?.()
    } catch (error) {
      console.error("Error creating form:", error)
      toast({
        title: "Error",
        description: "Failed to create custom form",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Form Details */}
      <Card>
        <CardHeader>
          <CardTitle>Form Details</CardTitle>
          <CardDescription>Basic information about your custom form</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="formTitle">Form Title *</Label>
            <Input
              id="formTitle"
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              placeholder="Enter form title"
              required
            />
          </div>
          <div>
            <Label htmlFor="formDescription">Form Description</Label>
            <Textarea
              id="formDescription"
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              placeholder="Enter form description (optional)"
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Form Fields */}
      <Card>
        <CardHeader>
          <CardTitle>Form Fields</CardTitle>
          <CardDescription>Add and configure fields for your form</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {fields.map((field, index) => (
            <div key={field.id} className="border rounded-lg p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <GripVertical className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium">Field {index + 1}</span>
                </div>
                <Button type="button" variant="ghost" size="sm" onClick={() => removeField(field.id)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Field Type</Label>
                  <Select
                    value={field.type}
                    onValueChange={(value) => updateField(field.id, { type: value as FormField["type"] })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="text">Text</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="number">Number</SelectItem>
                      <SelectItem value="textarea">Textarea</SelectItem>
                      <SelectItem value="select">Select</SelectItem>
                      <SelectItem value="date">Date</SelectItem>
                      <SelectItem value="file">File Upload</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Field Label</Label>
                  <Input
                    value={field.label}
                    onChange={(e) => updateField(field.id, { label: e.target.value })}
                    placeholder="Enter field label"
                  />
                </div>

                <div>
                  <Label>Placeholder</Label>
                  <Input
                    value={field.placeholder || ""}
                    onChange={(e) => updateField(field.id, { placeholder: e.target.value })}
                    placeholder="Enter placeholder text"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={`required_${field.id}`}
                    checked={field.required}
                    onChange={(e) => updateField(field.id, { required: e.target.checked })}
                  />
                  <Label htmlFor={`required_${field.id}`}>Required field</Label>
                </div>
              </div>

              {field.type === "select" && (
                <div>
                  <Label>Options (one per line)</Label>
                  <Textarea
                    value={field.options?.join("\n") || ""}
                    onChange={(e) =>
                      updateField(field.id, {
                        options: e.target.value.split("\n").filter((opt) => opt.trim()),
                      })
                    }
                    placeholder="Option 1&#10;Option 2&#10;Option 3"
                    rows={3}
                  />
                </div>
              )}
            </div>
          ))}

          <Button type="button" variant="outline" onClick={addField} className="w-full bg-transparent">
            <Plus className="w-4 h-4 mr-2" />
            Add Field
          </Button>
        </CardContent>
      </Card>

      {/* Submit Button */}
      <div className="flex justify-end">
        <Button type="submit" disabled={loading}>
          {loading ? "Creating..." : "Create Form"}
        </Button>
      </div>
    </form>
  )
}
