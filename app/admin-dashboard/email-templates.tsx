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
import { Mail, Plus, Edit, Trash2, Copy, FileText } from "lucide-react"
import { apiFetch } from "@/lib/api"

interface EmailTemplate {
  id: string
  name: string
  subject: string
  content: string
  htmlContent?: string
  category?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export default function EmailTemplates() {
  const [templates, setTemplates] = useState<EmailTemplate[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [filterCategory, setFilterCategory] = useState("all")
  const [newTemplate, setNewTemplate] = useState({
    name: "",
    subject: "",
    content: "",
    htmlContent: "",
    category: "promotional",
  })

  useEffect(() => {
    fetchTemplates()
  }, [filterCategory])

  const fetchTemplates = async () => {
    try {
      setIsLoading(true)
      const result = await apiFetch<{ success?: boolean; data?: EmailTemplate[] }>(
        `/api/admin/marketing/email-templates?category=${filterCategory}`,
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
        "/api/admin/marketing/email-templates",
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
          subject: "",
          content: "",
          htmlContent: "",
          category: "promotional",
        })
      }
    } catch (error) {
      console.error("[v0] Error creating template:", error)
    }
  }

  const handleDeleteTemplate = async (id: string) => {
    try {
      await apiFetch(`/api/admin/marketing/email-templates/${id}`, {
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
      case "newsletter":
        return "bg-green-100 text-green-700"
      case "announcement":
        return "bg-orange-100 text-orange-700"
      default:
        return "bg-gray-100 text-gray-700"
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Email Templates</h1>
          <p className="text-gray-600 mt-1">Create and manage reusable email templates</p>
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
              <DialogTitle>Create Email Template</DialogTitle>
              <DialogDescription>Create a reusable template for your email campaigns</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Template Name</Label>
                <Input
                  value={newTemplate.name}
                  onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
                  placeholder="e.g., Welcome Email"
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
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Email Subject</Label>
                <Input
                  value={newTemplate.subject}
                  onChange={(e) => setNewTemplate({ ...newTemplate, subject: e.target.value })}
                  placeholder="e.g., Welcome to our platform!"
                />
              </div>
              <div>
                <Label>Email Content (Plain Text)</Label>
                <Textarea
                  value={newTemplate.content}
                  onChange={(e) => setNewTemplate({ ...newTemplate, content: e.target.value })}
                  placeholder="Enter email content..."
                  rows={6}
                />
              </div>
              <div>
                <Label>HTML Content (Optional)</Label>
                <Textarea
                  value={newTemplate.htmlContent}
                  onChange={(e) => setNewTemplate({ ...newTemplate, htmlContent: e.target.value })}
                  placeholder="<html>...</html>"
                  rows={4}
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
              <Mail className="w-8 h-8 text-purple-600" />
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
              <Mail className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Newsletter</p>
                <p className="text-2xl font-bold text-green-600">
                  {templates.filter((t) => t.category === "newsletter").length}
                </p>
              </div>
              <Mail className="w-8 h-8 text-green-600" />
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
              <Mail className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No templates found</p>
            </CardContent>
          </Card>
        ) : (
          templates.map((template) => (
            <Card key={template.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <Mail className="w-6 h-6 text-blue-600" />
                  <Badge className={getCategoryColor(template.category)}>{template.category || "uncategorized"}</Badge>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{template.name}</h3>
                <p className="text-sm text-gray-600 mb-2">
                  <strong>Subject:</strong> {template.subject}
                </p>
                <p className="text-sm text-gray-600 mb-4 line-clamp-3">{template.content}</p>
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
