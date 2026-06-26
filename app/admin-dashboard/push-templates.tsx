"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Bell, Plus, Edit, Trash2, Copy, FileText, Loader2 } from "lucide-react"
import { apiFetch } from "@/lib/api"
import { toast } from "sonner"

interface PushTemplate {
  id: string
  name: string
  title: string
  message: string
  imageUrl?: string
  category?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export default function PushTemplates() {
  const [templates, setTemplates] = useState<PushTemplate[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<PushTemplate | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [filterCategory, setFilterCategory] = useState("all")

  const [newTemplate, setNewTemplate] = useState({
    name: "",
    title: "",
    message: "",
    imageUrl: "",
    category: "promotional",
  })

  const [editTemplate, setEditTemplate] = useState({
    name: "",
    title: "",
    message: "",
    imageUrl: "",
    category: "promotional",
  })

  useEffect(() => {
    fetchTemplates()
  }, [filterCategory])

  const fetchTemplates = async () => {
    try {
      setIsLoading(true)
      const result = await apiFetch<{ success?: boolean; data?: PushTemplate[] }>(
        `/api/admin/marketing/push-templates?category=${filterCategory}`,
        { auth: true },
      )

      console.log("Fetch templates response:", result)

      let templatesData: PushTemplate[] = []

      if (result) {
        if (result.success === true && Array.isArray(result.data)) {
          templatesData = result.data
        } else if (Array.isArray(result)) {
          templatesData = result
        } else if (result.data && Array.isArray(result.data)) {
          templatesData = result.data
        }
      }

      setTemplates(templatesData)
    } catch (error) {
      console.error("Error fetching push templates:", error)
      toast.error("Failed to load templates")
      setTemplates([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateTemplate = async () => {
    try {
      setIsSubmitting(true)

      // Validate required fields
      if (!newTemplate.name || !newTemplate.title || !newTemplate.message) {
        toast.error("Name, title, and message are required")
        return
      }

      const result = await apiFetch<{ success?: boolean; data?: PushTemplate }>(
        "/api/admin/marketing/push-templates",
        {
          method: "POST",
          body: newTemplate,
          auth: true,
        },
      )

      console.log("Create template response:", result)

      if (result && (result.success === true || result.data)) {
        toast.success("Template created successfully")
        setIsCreateDialogOpen(false)
        await fetchTemplates()
        setNewTemplate({
          name: "",
          title: "",
          message: "",
          imageUrl: "",
          category: "promotional",
        })
      } else {
        toast.error("Failed to create template")
      }
    } catch (error: any) {
      console.error("Error creating template:", error)
      toast.error(error?.message || "Failed to create template")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEditTemplate = async () => {
    if (!selectedTemplate) {
      toast.error("No template selected")
      return
    }

    if (!selectedTemplate.id) {
      toast.error("Invalid template ID")
      return
    }

    try {
      setIsSubmitting(true)

      console.log(`Updating template with ID: ${selectedTemplate.id}`)
      console.log("Update data:", editTemplate)

      const result = await apiFetch<{ success?: boolean; data?: PushTemplate }>(
        `/api/admin/marketing/push-templates/${selectedTemplate.id}`,
        {
          method: "PUT",
          body: editTemplate,
          auth: true,
        },
      )

      console.log("Update template response:", result)

      if (result && (result.success === true || result.data)) {
        toast.success("Template updated successfully")
        setIsEditDialogOpen(false)
        setSelectedTemplate(null)
        await fetchTemplates()
        setEditTemplate({
          name: "",
          title: "",
          message: "",
          imageUrl: "",
          category: "promotional",
        })
      } else {
        toast.error("Failed to update template")
      }
    } catch (error: any) {
      console.error("Error updating template:", error)

      if (error?.status === 404) {
        toast.error("Template not found. It may have been deleted.")
      } else if (error?.status === 400) {
        toast.error("Invalid data. Please check your input.")
      } else {
        toast.error(error?.message || "Failed to update template")
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteTemplate = async () => {
    if (!selectedTemplate) {
      toast.error("No template selected")
      return
    }

    if (!selectedTemplate.id) {
      toast.error("Invalid template ID")
      return
    }

    try {
      setIsSubmitting(true)

      console.log(`Deleting template with ID: ${selectedTemplate.id}`)

      const result = await apiFetch<{ success?: boolean }>(
        `/api/admin/marketing/push-templates/${selectedTemplate.id}`,
        {
          method: "DELETE",
          auth: true,
        },
      )

      console.log("Delete template response:", result)

      if (result && (result.success === true || typeof result === 'object')) {
        toast.success("Template deleted successfully")
        setIsDeleteDialogOpen(false)
        setSelectedTemplate(null)
        await fetchTemplates()
      } else {
        toast.error("Failed to delete template")
      }
    } catch (error: any) {
      console.error("Error deleting template:", error)
      if (error?.status === 404) {
        toast.error("Template not found. It may have been already deleted.")
      } else {
        toast.error(error?.message || "Failed to delete template")
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const openEditDialog = (template: PushTemplate) => {
    if (!template.id) {
      toast.error("Invalid template data. Please refresh the page.")
      return
    }

    setSelectedTemplate(template)
    setEditTemplate({
      name: template.name,
      title: template.title,
      message: template.message,
      imageUrl: template.imageUrl || "",
      category: template.category || "promotional",
    })
    setIsEditDialogOpen(true)
  }

  const openDeleteDialog = (template: PushTemplate) => {
    if (!template.id) {
      toast.error("Invalid template data. Please refresh the page.")
      return
    }

    setSelectedTemplate(template)
    setIsDeleteDialogOpen(true)
  }

  const getCategoryColor = (category?: string) => {
    switch (category) {
      case "promotional":
        return "bg-purple-100 text-purple-700"
      case "transactional":
        return "bg-blue-100 text-blue-700"
      case "newsletter":
        return "bg-green-100 text-green-700"
      case "announcement":
        return "bg-orange-100 text-orange-700"
      case "engagement":
        return "bg-pink-100 text-pink-700"
      case "marketing":
        return "bg-indigo-100 text-indigo-700"
      default:
        return "bg-gray-100 text-gray-700"
    }
  }

  useEffect(() => {
    if (templates.length > 0) {
      console.log("Templates data structure:", templates[0])
      console.log("Template IDs:", templates.map(t => ({ id: t.id, name: t.name })))
    }
  }, [templates])

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Push Notification Templates</h1>
          <p className="text-gray-600 mt-1">Create and manage reusable push notification templates</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Create Template
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col p-0">
            <DialogHeader className="px-6 pt-6 pb-4 border-b">
              <DialogTitle>Create Push Template</DialogTitle>
              <DialogDescription>Create a reusable template for your push notifications</DialogDescription>
            </DialogHeader>

            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
              <div>
                <Label>Template Name</Label>
                <Input
                  value={newTemplate.name}
                  onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
                  placeholder="e.g., Event Reminder"
                />
              </div>
              <div>
                <Label>Category</Label>
                <Select
                  value={newTemplate.category}
                  onValueChange={(value) => setNewTemplate({ ...newTemplate, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="promotional">Promotional</SelectItem>
                    <SelectItem value="transactional">Transactional</SelectItem>
                    <SelectItem value="newsletter">Newsletter</SelectItem>
                    <SelectItem value="announcement">Announcement</SelectItem>
                    <SelectItem value="engagement">Engagement</SelectItem>
                    <SelectItem value="marketing">Marketing</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Notification Title</Label>
                <Input
                  value={newTemplate.title}
                  onChange={(e) => setNewTemplate({ ...newTemplate, title: e.target.value })}
                  placeholder="e.g., Your event starts soon!"
                />
              </div>
              <div>
                <Label>Notification Message</Label>
                <Textarea
                  value={newTemplate.message}
                  onChange={(e) => setNewTemplate({ ...newTemplate, message: e.target.value })}
                  placeholder="Enter notification message..."
                  rows={4}
                  className="min-h-[100px]"
                />
              </div>
              <div>
                <Label>Image URL (Optional)</Label>
                <Input
                  value={newTemplate.imageUrl}
                  onChange={(e) => setNewTemplate({ ...newTemplate, imageUrl: e.target.value })}
                  placeholder="https://example.com/image.jpg"
                />
              </div>
            </div>

            <DialogFooter className="px-6 py-4 border-t bg-gray-50">
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateTemplate} disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Template"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={(open) => {
        setIsEditDialogOpen(open)
        if (!open) {
          setEditTemplate({
            name: "",
            title: "",
            message: "",
            imageUrl: "",
            category: "promotional",
          })
          setSelectedTemplate(null)
        }
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col p-0">
          <DialogHeader className="px-6 pt-6 pb-4 border-b">
            <DialogTitle>Edit Push Template</DialogTitle>
            <DialogDescription>Update your push notification template</DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
            <div>
              <Label>Template Name</Label>
              <Input
                value={editTemplate.name}
                onChange={(e) => setEditTemplate({ ...editTemplate, name: e.target.value })}
                placeholder="e.g., Event Reminder"
              />
            </div>
            <div>
              <Label>Category</Label>
              <Select
                value={editTemplate.category}
                onValueChange={(value) => setEditTemplate({ ...editTemplate, category: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="promotional">Promotional</SelectItem>
                  <SelectItem value="transactional">Transactional</SelectItem>
                  <SelectItem value="newsletter">Newsletter</SelectItem>
                  <SelectItem value="announcement">Announcement</SelectItem>
                  <SelectItem value="engagement">Engagement</SelectItem>
                  <SelectItem value="marketing">Marketing</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Notification Title</Label>
              <Input
                value={editTemplate.title}
                onChange={(e) => setEditTemplate({ ...editTemplate, title: e.target.value })}
                placeholder="e.g., Your event starts soon!"
              />
            </div>
            <div>
              <Label>Notification Message</Label>
              <Textarea
                value={editTemplate.message}
                onChange={(e) => setEditTemplate({ ...editTemplate, message: e.target.value })}
                placeholder="Enter notification message..."
                rows={4}
                className="min-h-[100px]"
              />
            </div>
            <div>
              <Label>Image URL (Optional)</Label>
              <Input
                value={editTemplate.imageUrl}
                onChange={(e) => setEditTemplate({ ...editTemplate, imageUrl: e.target.value })}
                placeholder="https://example.com/image.jpg"
              />
            </div>
          </div>

          <DialogFooter className="px-6 py-4 border-t bg-gray-50">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditTemplate} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Template"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the template
              "{selectedTemplate?.name}" and remove it from all campaigns.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteTemplate}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete Template"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Templates</p>
                <p className="text-2xl font-bold text-blue-600">{templates.length}</p>
              </div>
              <FileText className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Promotional</p>
                <p className="text-2xl font-bold text-purple-600">
                  {templates.filter((t) => t.category === "promotional").length}
                </p>
              </div>
              <Bell className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Engagement</p>
                <p className="text-2xl font-bold text-pink-600">
                  {templates.filter((t) => t.category === "engagement").length}
                </p>
              </div>
              <Bell className="w-8 h-8 text-pink-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Marketing</p>
                <p className="text-2xl font-bold text-indigo-600">
                  {templates.filter((t) => t.category === "marketing").length}
                </p>
              </div>
              <Bell className="w-8 h-8 text-indigo-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="promotional">Promotional</SelectItem>
            <SelectItem value="transactional">Transactional</SelectItem>
            <SelectItem value="newsletter">Newsletter</SelectItem>
            <SelectItem value="announcement">Announcement</SelectItem>
            <SelectItem value="engagement">Engagement</SelectItem>
            <SelectItem value="marketing">Marketing</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <Card className="col-span-full">
            <CardContent className="p-12 text-center">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
              <p className="text-gray-600">Loading templates...</p>
            </CardContent>
          </Card>
        ) : templates.length === 0 ? (
          <Card className="col-span-full">
            <CardContent className="p-12 text-center">
              <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No templates found</p>
            </CardContent>
          </Card>
        ) : (
          templates.map((template) => (
            <Card key={template.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <Bell className="w-6 h-6 text-blue-600" />
                  <Badge className={getCategoryColor(template.category)}>
                    {template.category || "uncategorized"}
                  </Badge>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{template.name}</h3>
                <p className="text-sm text-gray-600 mb-2">
                  <strong>Title:</strong> {template.title}
                </p>
                <p className="text-sm text-gray-600 mb-4 line-clamp-3">{template.message}</p>
                {template.imageUrl && (
                  <div className="mb-3">
                    <img
                      src={template.imageUrl}
                      alt={template.title}
                      className="w-full h-32 object-cover rounded-md"
                    />
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" className="gap-1 flex-1 bg-transparent">
                    <Copy className="w-4 h-4" />
                    Use
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1 bg-transparent"
                    onClick={() => openEditDialog(template)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1 text-red-600 hover:text-red-700 hover:bg-red-50 bg-transparent"
                    onClick={() => openDeleteDialog(template)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}