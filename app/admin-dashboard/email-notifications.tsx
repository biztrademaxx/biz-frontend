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
import { Switch } from "@/components/ui/switch"
import { apiFetch } from "@/lib/api"
import { Mail, Send, Eye, Edit, Trash2, Plus, Clock, TrendingUp, Calendar, Users, FileText } from "lucide-react"

interface EmailCampaign {
  id: string | number
  title: string
  subject: string
  content: string
  status: "draft" | "scheduled" | "sent" | "sending"
  priority: "low" | "medium" | "high"
  targetAudiences: string[]
  createdAt: string
  scheduledAt?: string
  sentAt?: string
  stats: {
    totalRecipients: number
    sent: number
    delivered: number
    opened: number
    clicked: number
    bounced: number
    unsubscribed: number
  }
  engagement: {
    openRate: number
    clickRate: number
    deliveryRate: number
  }
}

interface EmailTemplate {
  id: string
  name: string
  subject: string
  content: string
  category: string
}

export default function EmailCampaigns() {
  const [activeTab, setActiveTab] = useState("overview")
  const [campaigns, setCampaigns] = useState<EmailCampaign[]>([])
  const [templates, setTemplates] = useState<EmailTemplate[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [filterStatus, setFilterStatus] = useState("all")
  const [selectedTemplate, setSelectedTemplate] = useState<string>("")
  const [newCampaign, setNewCampaign] = useState({
    title: "",
    subject: "",
    content: "",
    targetAudiences: [] as string[],
    priority: "medium" as "low" | "medium" | "high",
    scheduledAt: "",
    sendImmediately: true,
  })

  // Fetch campaigns from API
  useEffect(() => {
    fetchCampaigns()
  }, [filterStatus])

  useEffect(() => {
    if (isCreateDialogOpen) {
      fetchTemplates()
    }
  }, [isCreateDialogOpen])

  const fetchTemplates = async () => {
    try {
      const result = await apiFetch<{ success?: boolean; data?: EmailTemplate[] }>(
        "/api/admin/marketing/email-templates",
        { auth: true },
      )
      if (result.success) {
        setTemplates(result.data ?? [])
      }
    } catch (error) {
      console.error("[v0] Error fetching templates:", error)
    }
  }

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId)
    if (templateId === "none") {
      setNewCampaign({
        ...newCampaign,
        subject: "",
        content: "",
      })
      return
    }

    const template = templates.find((t) => t.id === templateId)
    if (template) {
      setNewCampaign({
        ...newCampaign,
        subject: template.subject,
        content: template.content,
        title: newCampaign.title || template.name,
      })
    }
  }

  const fetchCampaigns = async () => {
    try {
      setIsLoading(true)
      const result = await apiFetch<{ success?: boolean; data?: EmailCampaign[] }>(
        `/api/admin/marketing/email-campaigns?status=${filterStatus}`,
        { auth: true },
      )
      if (result.success) {
        setCampaigns(result.data ?? [])
      }
    } catch (error) {
      console.error("[v0] Error fetching campaigns:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateCampaign = async () => {
    try {
      const result = await apiFetch<{ success?: boolean }>(
        "/api/admin/marketing/email-campaigns",
        {
        method: "POST",
        body: newCampaign,
        auth: true,
      },
      )
      if (result.success) {
        setIsCreateDialogOpen(false)
        fetchCampaigns()
        // Reset form
        setNewCampaign({
          title: "",
          subject: "",
          content: "",
          targetAudiences: [],
          priority: "medium",
          scheduledAt: "",
          sendImmediately: true,
        })
        // Added Reset template selection
        setSelectedTemplate("")
      }
    } catch (error) {
      console.error("[v0] Error creating campaign:", error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "draft":
        return "bg-gray-100 text-gray-700"
      case "scheduled":
        return "bg-blue-100 text-blue-700"
      case "sending":
        return "bg-yellow-100 text-yellow-700"
      case "sent":
        return "bg-green-100 text-green-700"
      default:
        return "bg-gray-100 text-gray-700"
    }
  }

  const totalStats = campaigns.reduce(
    (acc, campaign) => ({
      sent: acc.sent + campaign.stats.sent,
      delivered: acc.delivered + campaign.stats.delivered,
      opened: acc.opened + campaign.stats.opened,
      clicked: acc.clicked + campaign.stats.clicked,
    }),
    { sent: 0, delivered: 0, opened: 0, clicked: 0 },
  )

  const avgEngagement =
    campaigns.length > 0
      ? {
          openRate: campaigns.reduce((acc, c) => acc + c.engagement.openRate, 0) / campaigns.length,
          clickRate: campaigns.reduce((acc, c) => acc + c.engagement.clickRate, 0) / campaigns.length,
          deliveryRate: campaigns.reduce((acc, c) => acc + c.engagement.deliveryRate, 0) / campaigns.length,
        }
      : { openRate: 0, clickRate: 0, deliveryRate: 0 }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Email Campaigns</h1>
          <p className="text-gray-600 mt-1">Create and manage email marketing campaigns</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Create Campaign
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Email Campaign</DialogTitle>
              <DialogDescription>Create a new email campaign to engage with your audience</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Use Template (Optional)
                </Label>
                <Select value={selectedTemplate} onValueChange={handleTemplateSelect}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a template or start from scratch" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No Template (Start from scratch)</SelectItem>
                    {templates.map((template) => (
                      <SelectItem key={template.id} value={template.id}>
                        {template.name} - {template.category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500 mt-1">Select a template to auto-fill subject and content fields</p>
              </div>
              <div>
                <Label>Campaign Title</Label>
                <Input
                  value={newCampaign.title}
                  onChange={(e) => setNewCampaign({ ...newCampaign, title: e.target.value })}
                  placeholder="e.g., Welcome New Users"
                />
              </div>
              <div>
                <Label>Email Subject</Label>
                <Input
                  value={newCampaign.subject}
                  onChange={(e) => setNewCampaign({ ...newCampaign, subject: e.target.value })}
                  placeholder="e.g., Welcome to EventHub! 🎉"
                />
              </div>
              <div>
                <Label>Email Content</Label>
                <Textarea
                  value={newCampaign.content}
                  onChange={(e) => setNewCampaign({ ...newCampaign, content: e.target.value })}
                  placeholder="Enter your email content..."
                  rows={6}
                />
              </div>
              <div>
                <Label>Priority</Label>
                <Select
                  value={newCampaign.priority}
                  onValueChange={(value: any) => setNewCampaign({ ...newCampaign, priority: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between">
                <Label>Send Immediately</Label>
                <Switch
                  checked={newCampaign.sendImmediately}
                  onCheckedChange={(checked) => setNewCampaign({ ...newCampaign, sendImmediately: checked })}
                />
              </div>
              {!newCampaign.sendImmediately && (
                <div>
                  <Label>Schedule Date & Time</Label>
                  <Input
                    type="datetime-local"
                    value={newCampaign.scheduledAt}
                    onChange={(e) =>
                      setNewCampaign({
                        ...newCampaign,
                        scheduledAt: e.target.value,
                      })
                    }
                  />
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateCampaign}>Create Campaign</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Sent</p>
                <p className="text-2xl font-bold text-blue-600">{totalStats.sent.toLocaleString()}</p>
              </div>
              <Send className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Delivered</p>
                <p className="text-2xl font-bold text-green-600">{totalStats.delivered.toLocaleString()}</p>
              </div>
              <Mail className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Open Rate</p>
                <p className="text-2xl font-bold text-purple-600">{avgEngagement.openRate.toFixed(1)}%</p>
              </div>
              <Eye className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Click Rate</p>
                <p className="text-2xl font-bold text-orange-600">{avgEngagement.clickRate.toFixed(1)}%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Campaigns</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="scheduled">Scheduled</SelectItem>
            <SelectItem value="sending">Sending</SelectItem>
            <SelectItem value="sent">Sent</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Campaigns List */}
      <div className="space-y-4">
        {isLoading ? (
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-gray-600">Loading campaigns...</p>
            </CardContent>
          </Card>
        ) : campaigns.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Mail className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No campaigns found</p>
            </CardContent>
          </Card>
        ) : (
          campaigns.map((campaign) => (
            <Card key={campaign.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Mail className="w-5 h-5 text-green-600" />
                      <h3 className="text-lg font-semibold text-gray-900">{campaign.title}</h3>
                      <Badge className={getStatusColor(campaign.status)}>{campaign.status}</Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      <strong>Subject:</strong> {campaign.subject}
                    </p>
                    <p className="text-gray-600 mb-3">{campaign.content}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>Created: {new Date(campaign.createdAt).toLocaleDateString()}</span>
                      </div>
                      {campaign.scheduledAt && (
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>Scheduled: {new Date(campaign.scheduledAt).toLocaleDateString()}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        <span>Audiences: {campaign.targetAudiences.join(", ")}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="gap-1 bg-transparent">
                      <Edit className="w-4 h-4" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1 text-red-600 hover:text-red-700 bg-transparent"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </Button>
                  </div>
                </div>

                {campaign.stats.sent > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-6 gap-4 pt-4 border-t">
                    <div className="text-center">
                      <p className="text-xl font-bold text-blue-600">{campaign.stats.sent.toLocaleString()}</p>
                      <p className="text-xs text-gray-600">Sent</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xl font-bold text-green-600">{campaign.stats.delivered.toLocaleString()}</p>
                      <p className="text-xs text-gray-600">Delivered</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xl font-bold text-purple-600">{campaign.stats.opened.toLocaleString()}</p>
                      <p className="text-xs text-gray-600">Opened</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xl font-bold text-orange-600">{campaign.stats.clicked.toLocaleString()}</p>
                      <p className="text-xs text-gray-600">Clicked</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xl font-bold text-indigo-600">{campaign.engagement.openRate.toFixed(1)}%</p>
                      <p className="text-xs text-gray-600">Open Rate</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xl font-bold text-pink-600">{campaign.engagement.clickRate.toFixed(1)}%</p>
                      <p className="text-xs text-gray-600">Click Rate</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
