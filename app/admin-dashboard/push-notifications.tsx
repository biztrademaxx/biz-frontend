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
import { Bell, Send, Eye, Edit, Trash2, Plus, Clock, TrendingUp, Calendar, Users, FileText } from "lucide-react"

interface PushNotification {
  id: string | number
  title: string
  body: string
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
    failed: number
  }
  engagement: {
    openRate: number
    clickRate: number
    deliveryRate: number
  }
}

interface PushTemplate {
  id: string
  name: string
  title: string
  message: string
  category: string
}

export default function PushNotifications() {
  const [notifications, setNotifications] = useState<PushNotification[]>([])
  const [templates, setTemplates] = useState<PushTemplate[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [filterStatus, setFilterStatus] = useState("all")
  const [selectedTemplate, setSelectedTemplate] = useState<string>("")
  const [newNotification, setNewNotification] = useState({
    title: "",
    bodyText: "",
    targetAudiences: [] as string[],
    priority: "medium" as "low" | "medium" | "high",
    scheduledAt: "",
    sendImmediately: true,
  })

  // Fetch notifications from API
  useEffect(() => {
    fetchNotifications()
  }, [filterStatus])

  useEffect(() => {
    if (isCreateDialogOpen) {
      fetchTemplates()
    }
  }, [isCreateDialogOpen])

  const fetchTemplates = async () => {
    try {
      const result = await apiFetch<{ success?: boolean; data?: PushTemplate[] }>(
        "/api/admin/marketing/push-templates",
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
      setNewNotification({
        ...newNotification,
        title: "",
        bodyText: "",
      })
      return
    }

    const template = templates.find((t) => t.id === templateId)
    if (template) {
      setNewNotification({
        ...newNotification,
        title: template.title,
        bodyText: template.message,
      })
    }
  }

  const fetchNotifications = async () => {
    try {
      setIsLoading(true)
      const result = await apiFetch<{ success?: boolean; data?: PushNotification[] }>(
        `/api/admin/marketing/push-notifications?status=${filterStatus}`,
        { auth: true },
      )
      if (result.success) {
        setNotifications(result.data ?? [])
      }
    } catch (error) {
      console.error("[v0] Error fetching notifications:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateNotification = async () => {
    try {
      const result = await apiFetch<{ success?: boolean }>(
        "/api/admin/marketing/push-notifications",
        {
        method: "POST",
        body: newNotification,
        auth: true,
      },
      )
      if (result.success) {
        setIsCreateDialogOpen(false)
        fetchNotifications()
        // Reset form
        setNewNotification({
          title: "",
          bodyText: "",
          targetAudiences: [],
          priority: "medium",
          scheduledAt: "",
          sendImmediately: true,
        })
        setSelectedTemplate("")
      }
    } catch (error) {
      console.error("[v0] Error creating notification:", error)
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

  const totalStats = notifications.reduce(
    (acc, notification) => ({
      sent: acc.sent + notification.stats.sent,
      delivered: acc.delivered + notification.stats.delivered,
      opened: acc.opened + notification.stats.opened,
      clicked: acc.clicked + notification.stats.clicked,
    }),
    { sent: 0, delivered: 0, opened: 0, clicked: 0 },
  )

  const avgEngagement =
    notifications.length > 0
      ? {
          openRate: notifications.reduce((acc, n) => acc + n.engagement.openRate, 0) / notifications.length,
          clickRate: notifications.reduce((acc, n) => acc + n.engagement.clickRate, 0) / notifications.length,
          deliveryRate: notifications.reduce((acc, n) => acc + n.engagement.deliveryRate, 0) / notifications.length,
        }
      : { openRate: 0, clickRate: 0, deliveryRate: 0 }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Push Notifications</h1>
          <p className="text-gray-600 mt-1">Send instant notifications to your users</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Create Notification
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Push Notification</DialogTitle>
              <DialogDescription>Send instant notifications to engage with your users</DialogDescription>
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
                <p className="text-xs text-gray-500 mt-1">Select a template to auto-fill title and message fields</p>
              </div>
              <div>
                <Label>Notification Title</Label>
                <Input
                  value={newNotification.title}
                  onChange={(e) =>
                    setNewNotification({
                      ...newNotification,
                      title: e.target.value,
                    })
                  }
                  placeholder="e.g., 🎯 Event Starting Soon!"
                />
              </div>
              <div>
                <Label>Notification Body</Label>
                <Textarea
                  value={newNotification.bodyText}
                  onChange={(e) =>
                    setNewNotification({
                      ...newNotification,
                      bodyText: e.target.value,
                    })
                  }
                  placeholder="Enter your notification message..."
                  rows={4}
                />
              </div>
              <div>
                <Label>Priority</Label>
                <Select
                  value={newNotification.priority}
                  onValueChange={(value: any) => setNewNotification({ ...newNotification, priority: value })}
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
                  checked={newNotification.sendImmediately}
                  onCheckedChange={(checked) =>
                    setNewNotification({
                      ...newNotification,
                      sendImmediately: checked,
                    })
                  }
                />
              </div>
              {!newNotification.sendImmediately && (
                <div>
                  <Label>Schedule Date & Time</Label>
                  <Input
                    type="datetime-local"
                    value={newNotification.scheduledAt}
                    onChange={(e) =>
                      setNewNotification({
                        ...newNotification,
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
              <Button onClick={handleCreateNotification}>Create Notification</Button>
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
              <Bell className="w-8 h-8 text-green-600" />
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
            <SelectItem value="all">All Notifications</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="scheduled">Scheduled</SelectItem>
            <SelectItem value="sending">Sending</SelectItem>
            <SelectItem value="sent">Sent</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Notifications List */}
      <div className="space-y-4">
        {isLoading ? (
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-gray-600">Loading notifications...</p>
            </CardContent>
          </Card>
        ) : notifications.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No notifications found</p>
            </CardContent>
          </Card>
        ) : (
          notifications.map((notification) => (
            <Card key={notification.id} className="hover:shadow-lg transition-shadow border-l-4 border-l-blue-500">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Bell className="w-5 h-5 text-blue-600" />
                      <h3 className="text-lg font-semibold text-gray-900">{notification.title}</h3>
                      <Badge className={getStatusColor(notification.status)}>{notification.status}</Badge>
                    </div>
                    <p className="text-gray-600 mb-3">{notification.body}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>Created: {new Date(notification.createdAt).toLocaleDateString()}</span>
                      </div>
                      {notification.scheduledAt && (
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>Scheduled: {new Date(notification.scheduledAt).toLocaleDateString()}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        <span>Audiences: {notification.targetAudiences.join(", ")}</span>
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

                {notification.stats.sent > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 pt-4 border-t">
                    <div className="text-center">
                      <p className="text-xl font-bold text-blue-600">{notification.stats.sent.toLocaleString()}</p>
                      <p className="text-xs text-gray-600">Sent</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xl font-bold text-green-600">
                        {notification.stats.delivered.toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-600">Delivered</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xl font-bold text-purple-600">{notification.stats.opened.toLocaleString()}</p>
                      <p className="text-xs text-gray-600">Opened</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xl font-bold text-orange-600">{notification.stats.clicked.toLocaleString()}</p>
                      <p className="text-xs text-gray-600">Clicked</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xl font-bold text-indigo-600">
                        {notification.engagement.openRate.toFixed(1)}%
                      </p>
                      <p className="text-xs text-gray-600">Open Rate</p>
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
