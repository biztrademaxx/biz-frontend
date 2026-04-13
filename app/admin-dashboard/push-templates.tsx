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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Bell, Plus, Edit, Trash2, Copy, FileText, ImageIcon } from "lucide-react"
import { apiFetch } from "@/lib/api"

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
  const [filterCategory, setFilterCategory] = useState("all")
  const [newTemplate, setNewTemplate] = useState({
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
      if (result.success) {
        setTemplates(result.data ?? [])
      }
    } catch (error) {
      console.error("[v0] Error fetching templates:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateTemplate = async () => {
    try {
      const result = await apiFetch<{ success?: boolean }>(
        "/api/admin/marketing/push-templates",
        {
        method: "POST",
        body: newTemplate,
        auth: true,
      },
      )
      if (result.success) {
        setIsCreateDialogOpen(false)
        fetchTemplates()
        setNewTemplate({
          name: "",
          title: "",
          message: "",
          imageUrl: "",
          category: "promotional",
        })
      }
    } catch (error) {
      console.error("[v0] Error creating template:", error)
    }
  }

  const handleDeleteTemplate = async (id: string) => {
    try {
      await apiFetch(`/api/admin/marketing/push-templates/${id}`, {
        method: "DELETE",
        auth: true,
      })
      fetchTemplates()
    } catch (error) {
      console.error("[v0] Error deleting template:", error)
    }
  }

  const getCategoryColor = (category?: string) => {
    switch (category) {
      case "promotional":
        return "bg-purple-100 text-purple-700"
      case "transactional":
        return "bg-blue-100 text-blue-700"
      case "news":
        return "bg-green-100 text-green-700"
      case "alert":
        return "bg-red-100 text-red-700"
      default:
        return "bg-gray-100 text-gray-700"
    }
  }

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
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Push Template</DialogTitle>
              <DialogDescription>Create a reusable template for your push notifications</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Template Name</Label>
                <Input
                  value={newTemplate.name}
                  onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
                  placeholder="e.g., Flash Sale Alert"
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
                    <SelectItem value="news">News</SelectItem>
                    <SelectItem value="alert">Alert</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Notification Title</Label>
                <Input
                  value={newTemplate.title}
                  onChange={(e) => setNewTemplate({ ...newTemplate, title: e.target.value })}
                  placeholder="e.g., 50% Off Today Only!"
                />
              </div>
              <div>
                <Label>Notification Message</Label>
                <Textarea
                  value={newTemplate.message}
                  onChange={(e) => setNewTemplate({ ...newTemplate, message: e.target.value })}
                  placeholder="Enter notification message..."
                  rows={4}
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
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateTemplate}>Create Template</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

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
                <p className="text-sm text-gray-600">Transactional</p>
                <p className="text-2xl font-bold text-blue-600">
                  {templates.filter((t) => t.category === "transactional").length}
                </p>
              </div>
              <Bell className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">With Images</p>
                <p className="text-2xl font-bold text-green-600">{templates.filter((t) => t.imageUrl).length}</p>
              </div>
              <ImageIcon className="w-8 h-8 text-green-600" />
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
            <SelectItem value="news">News</SelectItem>
            <SelectItem value="alert">Alert</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <Card>
            <CardContent className="p-12 text-center">
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
                  <Badge className={getCategoryColor(template.category)}>{template.category || "uncategorized"}</Badge>
                </div>
                {template.imageUrl && (
                  <div className="mb-3 rounded-lg overflow-hidden bg-gray-100 h-32 flex items-center justify-center">
                    <ImageIcon className="w-8 h-8 text-gray-400" />
                  </div>
                )}
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{template.name}</h3>
                <p className="text-sm font-medium text-gray-700 mb-1">{template.title}</p>
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">{template.message}</p>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" className="gap-1 flex-1 bg-transparent">
                    <Copy className="w-4 h-4" />
                    Use
                  </Button>
                  <Button variant="outline" size="sm" className="gap-1 bg-transparent">
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1 text-red-600 hover:text-red-700 bg-transparent"
                    onClick={() => handleDeleteTemplate(template.id)}
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
