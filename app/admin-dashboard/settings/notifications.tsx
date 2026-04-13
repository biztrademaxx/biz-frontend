"use client"

import type React from "react"

import { useState, useEffect } from "react"
import {
  Bell,
  Mail,
  Smartphone,
  MessageSquare,
  Search,
  Save,
  RefreshCw,
  Check,
  X,
  Send,
  Clock,
  Eye,
  Edit2,
  Trash2,
  Plus,
  VolumeX,
  Zap,
  Shield,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { adminApi } from "@/lib/admin-api"

interface NotificationChannel {
  id: string
  name: string
  type: "email" | "push" | "sms" | "in_app"
  enabled: boolean
  description: string
  icon: React.ElementType
}

interface NotificationType {
  id: string
  name: string
  description: string
  category: string
  channels: {
    email: boolean
    push: boolean
    sms: boolean
    inApp: boolean
  }
  priority: "low" | "normal" | "high" | "urgent"
  userConfigurable: boolean
}

interface NotificationSchedule {
  id: string
  name: string
  type: string
  frequency: string
  time: string
  timezone: string
  enabled: boolean
  lastRun: string
  nextRun: string
}

const NOTIFICATION_CHANNEL_ICONS: Record<string, React.ElementType> = {
  email: Mail,
  push: Bell,
  sms: Smartphone,
  in_app: MessageSquare,
}

export default function SettingsNotificationsPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState("channels")
  const [searchQuery, setSearchQuery] = useState("")
  const [showEditTypeDialog, setShowEditTypeDialog] = useState(false)
  const [selectedType, setSelectedType] = useState<NotificationType | null>(null)
  const [showTestDialog, setShowTestDialog] = useState(false)
  const [testChannel, setTestChannel] = useState<string>("")

  // Stats
  const [stats, setStats] = useState({
    totalSent: 0,
    deliveryRate: 0,
    openRate: 0,
    activeChannels: 0,
  })

  // Channels
  const [channels, setChannels] = useState<NotificationChannel[]>([
    {
      id: "email",
      name: "Email Notifications",
      type: "email",
      enabled: true,
      description: "Send notifications via email to users",
      icon: Mail,
    },
    {
      id: "push",
      name: "Push Notifications",
      type: "push",
      enabled: true,
      description: "Browser and mobile push notifications",
      icon: Bell,
    },
    {
      id: "sms",
      name: "SMS Notifications",
      type: "sms",
      enabled: false,
      description: "Text message notifications for urgent alerts",
      icon: Smartphone,
    },
    {
      id: "in_app",
      name: "In-App Notifications",
      type: "in_app",
      enabled: true,
      description: "Notifications within the application",
      icon: MessageSquare,
    },
  ])

  // Notification types
  const [notificationTypes, setNotificationTypes] = useState<NotificationType[]>([
    {
      id: "event_reminder",
      name: "Event Reminder",
      description: "Remind users about upcoming events",
      category: "Events",
      channels: { email: true, push: true, sms: false, inApp: true },
      priority: "high",
      userConfigurable: true,
    },
    {
      id: "registration_confirmation",
      name: "Registration Confirmation",
      description: "Confirm event registration to users",
      category: "Events",
      channels: { email: true, push: true, sms: false, inApp: true },
      priority: "high",
      userConfigurable: false,
    },
    {
      id: "payment_confirmation",
      name: "Payment Confirmation",
      description: "Confirm successful payments",
      category: "Payments",
      channels: { email: true, push: true, sms: true, inApp: true },
      priority: "high",
      userConfigurable: false,
    },
    {
      id: "message_received",
      name: "New Message",
      description: "Notify users of new messages",
      category: "Communication",
      channels: { email: true, push: true, sms: false, inApp: true },
      priority: "normal",
      userConfigurable: true,
    },
    {
      id: "booking_confirmation",
      name: "Booking Confirmation",
      description: "Confirm venue or appointment bookings",
      category: "Bookings",
      channels: { email: true, push: true, sms: false, inApp: true },
      priority: "high",
      userConfigurable: false,
    },
    {
      id: "system_update",
      name: "System Update",
      description: "Important system announcements",
      category: "System",
      channels: { email: true, push: false, sms: false, inApp: true },
      priority: "normal",
      userConfigurable: true,
    },
    {
      id: "connection_request",
      name: "Connection Request",
      description: "New connection requests from users",
      category: "Social",
      channels: { email: true, push: true, sms: false, inApp: true },
      priority: "normal",
      userConfigurable: true,
    },
    {
      id: "appointment_reminder",
      name: "Appointment Reminder",
      description: "Remind users about upcoming appointments",
      category: "Appointments",
      channels: { email: true, push: true, sms: true, inApp: true },
      priority: "high",
      userConfigurable: true,
    },
  ])

  // Schedules
  const [schedules, setSchedules] = useState<NotificationSchedule[]>([
    {
      id: "1",
      name: "Daily Digest",
      type: "digest",
      frequency: "daily",
      time: "09:00",
      timezone: "UTC",
      enabled: true,
      lastRun: "2024-01-15T09:00:00Z",
      nextRun: "2024-01-16T09:00:00Z",
    },
    {
      id: "2",
      name: "Event Reminders",
      type: "reminder",
      frequency: "hourly",
      time: "00:00",
      timezone: "UTC",
      enabled: true,
      lastRun: "2024-01-15T14:00:00Z",
      nextRun: "2024-01-15T15:00:00Z",
    },
    {
      id: "3",
      name: "Weekly Summary",
      type: "summary",
      frequency: "weekly",
      time: "10:00",
      timezone: "UTC",
      enabled: true,
      lastRun: "2024-01-08T10:00:00Z",
      nextRun: "2024-01-15T10:00:00Z",
    },
  ])

  // Global settings
  const [globalSettings, setGlobalSettings] = useState({
    quietHoursEnabled: true,
    quietHoursStart: "22:00",
    quietHoursEnd: "08:00",
    batchNotifications: true,
    batchInterval: 15,
    maxNotificationsPerHour: 10,
    respectUserPreferences: true,
    defaultPriority: "normal",
    retryFailedAttempts: 3,
    retryDelayMinutes: 5,
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const res = await adminApi<{
        success?: boolean
        data?: {
          stats?: typeof stats
          channels?: Array<Omit<NotificationChannel, "icon">>
          notificationTypes?: NotificationType[]
          schedules?: NotificationSchedule[]
          globalSettings?: Partial<typeof globalSettings>
        }
      }>("/settings/notifications")
      if (res.success === false || !res.data) return
      const d = res.data
      if (d.stats) setStats(d.stats)
      if (d.channels?.length) {
        setChannels(
          d.channels.map((ch) => ({
            ...ch,
            icon: NOTIFICATION_CHANNEL_ICONS[ch.id] ?? MessageSquare,
          })) as NotificationChannel[],
        )
      }
      if (d.notificationTypes) setNotificationTypes(d.notificationTypes)
      if (d.schedules) setSchedules(d.schedules)
      if (d.globalSettings) setGlobalSettings((prev) => ({ ...prev, ...d.globalSettings }))
    } catch (error) {
      console.error("Error fetching notification settings:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleToggleChannel = (channelId: string) => {
    setChannels((prev) => prev.map((ch) => (ch.id === channelId ? { ...ch, enabled: !ch.enabled } : ch)))
  }

  const handleSaveSettings = async () => {
    setSaving(true)
    try {
      await adminApi("/settings/notifications", {
        method: "PATCH",
        body: {
          channels: channels.map(({ id, name, type, enabled, description }) => ({
            id,
            name,
            type,
            enabled,
            description,
          })),
          notificationTypes,
          schedules,
          globalSettings,
        },
      })
      await fetchData()
    } catch (error) {
      console.error("Error saving settings:", error)
    } finally {
      setSaving(false)
    }
  }

  const handleEditType = (type: NotificationType) => {
    setSelectedType(type)
    setShowEditTypeDialog(true)
  }

  const handleSaveType = () => {
    if (selectedType) {
      setNotificationTypes((prev) => prev.map((t) => (t.id === selectedType.id ? selectedType : t)))
    }
    setShowEditTypeDialog(false)
    setSelectedType(null)
  }

  const handleTestNotification = async () => {
    try {
      await adminApi("/settings/notifications/test", {
        method: "POST",
        body: { channel: testChannel },
      })
      setShowTestDialog(false)
    } catch (error) {
      console.error("Error sending test notification:", error)
    }
  }

  const filteredTypes = notificationTypes.filter(
    (type) =>
      type.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      type.category.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const categories = [...new Set(notificationTypes.map((t) => t.category))]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notification Settings</h1>
          <p className="text-gray-500 mt-1">Configure platform-wide notification preferences and channels</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => {
              setTestChannel("email")
              setShowTestDialog(true)
            }}
          >
            <Send className="w-4 h-4 mr-2" />
            Test Notification
          </Button>
          <Button onClick={handleSaveSettings} disabled={saving}>
            {saving ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            Save Changes
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Sent (30d)</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalSent.toLocaleString()}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Send className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Delivery Rate</p>
                <p className="text-2xl font-bold text-gray-900">{stats.deliveryRate}%</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <Check className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Open Rate</p>
                <p className="text-2xl font-bold text-gray-900">{stats.openRate}%</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <Eye className="w-5 h-5 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Active Channels</p>
                <p className="text-2xl font-bold text-gray-900">
                  {channels.filter((c) => c.enabled).length}/{channels.length}
                </p>
              </div>
              <div className="p-3 bg-orange-100 rounded-lg">
                <Zap className="w-5 h-5 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="channels">Channels</TabsTrigger>
          <TabsTrigger value="types">Notification Types</TabsTrigger>
          <TabsTrigger value="schedules">Schedules</TabsTrigger>
          <TabsTrigger value="settings">Global Settings</TabsTrigger>
        </TabsList>

        {/* Channels Tab */}
        <TabsContent value="channels" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {channels.map((channel) => {
              const Icon = channel.icon
              return (
                <Card key={channel.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-lg ${channel.enabled ? "bg-blue-100" : "bg-gray-100"}`}>
                          <Icon className={`w-6 h-6 ${channel.enabled ? "text-blue-600" : "text-gray-400"}`} />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{channel.name}</h3>
                          <p className="text-sm text-gray-500 mt-1">{channel.description}</p>
                          <div className="flex items-center gap-2 mt-3">
                            <Badge variant={channel.enabled ? "default" : "secondary"}>
                              {channel.enabled ? "Active" : "Disabled"}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <Switch checked={channel.enabled} onCheckedChange={() => handleToggleChannel(channel.id)} />
                    </div>
                    {channel.enabled && (
                      <div className="mt-4 pt-4 border-t">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setTestChannel(channel.type)
                            setShowTestDialog(true)
                          }}
                        >
                          <Send className="w-3 h-3 mr-2" />
                          Send Test
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        {/* Notification Types Tab */}
        <TabsContent value="types" className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search notification types..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {categories.map((category) => {
            const categoryTypes = filteredTypes.filter((t) => t.category === category)
            if (categoryTypes.length === 0) return null

            return (
              <Card key={category}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">{category}</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Notification</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Push</TableHead>
                        <TableHead>SMS</TableHead>
                        <TableHead>In-App</TableHead>
                        <TableHead>Priority</TableHead>
                        <TableHead>User Config</TableHead>
                        <TableHead className="w-[80px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {categoryTypes.map((type) => (
                        <TableRow key={type.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium text-gray-900">{type.name}</p>
                              <p className="text-sm text-gray-500">{type.description}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            {type.channels.email ? (
                              <Check className="w-4 h-4 text-green-600" />
                            ) : (
                              <X className="w-4 h-4 text-gray-300" />
                            )}
                          </TableCell>
                          <TableCell>
                            {type.channels.push ? (
                              <Check className="w-4 h-4 text-green-600" />
                            ) : (
                              <X className="w-4 h-4 text-gray-300" />
                            )}
                          </TableCell>
                          <TableCell>
                            {type.channels.sms ? (
                              <Check className="w-4 h-4 text-green-600" />
                            ) : (
                              <X className="w-4 h-4 text-gray-300" />
                            )}
                          </TableCell>
                          <TableCell>
                            {type.channels.inApp ? (
                              <Check className="w-4 h-4 text-green-600" />
                            ) : (
                              <X className="w-4 h-4 text-gray-300" />
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                type.priority === "urgent"
                                  ? "destructive"
                                  : type.priority === "high"
                                    ? "default"
                                    : "secondary"
                              }
                            >
                              {type.priority}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {type.userConfigurable ? (
                              <Check className="w-4 h-4 text-green-600" />
                            ) : (
                              <X className="w-4 h-4 text-gray-300" />
                            )}
                          </TableCell>
                          <TableCell>
                            <Button variant="ghost" size="icon" onClick={() => handleEditType(type)}>
                              <Edit2 className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )
          })}
        </TabsContent>

        {/* Schedules Tab */}
        <TabsContent value="schedules" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Notification Schedules</CardTitle>
                  <CardDescription>Configure automated notification schedules</CardDescription>
                </div>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Schedule
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Frequency</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Last Run</TableHead>
                    <TableHead>Next Run</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {schedules.map((schedule) => (
                    <TableRow key={schedule.id}>
                      <TableCell className="font-medium">{schedule.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{schedule.type}</Badge>
                      </TableCell>
                      <TableCell className="capitalize">{schedule.frequency}</TableCell>
                      <TableCell>
                        {schedule.time} {schedule.timezone}
                      </TableCell>
                      <TableCell>{new Date(schedule.lastRun).toLocaleDateString()}</TableCell>
                      <TableCell>{new Date(schedule.nextRun).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Badge variant={schedule.enabled ? "default" : "secondary"}>
                          {schedule.enabled ? "Active" : "Paused"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="icon">
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon">
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Global Settings Tab */}
        <TabsContent value="settings" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Quiet Hours */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <VolumeX className="w-5 h-5" />
                  Quiet Hours
                </CardTitle>
                <CardDescription>Prevent non-urgent notifications during specified hours</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Enable Quiet Hours</Label>
                  <Switch
                    checked={globalSettings.quietHoursEnabled}
                    onCheckedChange={(checked) =>
                      setGlobalSettings((prev) => ({ ...prev, quietHoursEnabled: checked }))
                    }
                  />
                </div>
                {globalSettings.quietHoursEnabled && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Start Time</Label>
                      <Input
                        type="time"
                        value={globalSettings.quietHoursStart}
                        onChange={(e) => setGlobalSettings((prev) => ({ ...prev, quietHoursStart: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label>End Time</Label>
                      <Input
                        type="time"
                        value={globalSettings.quietHoursEnd}
                        onChange={(e) => setGlobalSettings((prev) => ({ ...prev, quietHoursEnd: e.target.value }))}
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Batching */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Notification Batching
                </CardTitle>
                <CardDescription>Group notifications to reduce interruptions</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Enable Batching</Label>
                  <Switch
                    checked={globalSettings.batchNotifications}
                    onCheckedChange={(checked) =>
                      setGlobalSettings((prev) => ({ ...prev, batchNotifications: checked }))
                    }
                  />
                </div>
                {globalSettings.batchNotifications && (
                  <div>
                    <Label>Batch Interval (minutes)</Label>
                    <Select
                      value={globalSettings.batchInterval.toString()}
                      onValueChange={(value) =>
                        setGlobalSettings((prev) => ({ ...prev, batchInterval: Number.parseInt(value) }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5">5 minutes</SelectItem>
                        <SelectItem value="15">15 minutes</SelectItem>
                        <SelectItem value="30">30 minutes</SelectItem>
                        <SelectItem value="60">1 hour</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Rate Limiting */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Rate Limiting
                </CardTitle>
                <CardDescription>Prevent notification overload</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Max Notifications Per Hour</Label>
                  <Input
                    type="number"
                    value={globalSettings.maxNotificationsPerHour}
                    onChange={(e) =>
                      setGlobalSettings((prev) => ({
                        ...prev,
                        maxNotificationsPerHour: Number.parseInt(e.target.value),
                      }))
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Respect User Preferences</Label>
                  <Switch
                    checked={globalSettings.respectUserPreferences}
                    onCheckedChange={(checked) =>
                      setGlobalSettings((prev) => ({ ...prev, respectUserPreferences: checked }))
                    }
                  />
                </div>
              </CardContent>
            </Card>

            {/* Retry Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <RefreshCw className="w-5 h-5" />
                  Retry Settings
                </CardTitle>
                <CardDescription>Configure retry behavior for failed notifications</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Retry Attempts</Label>
                  <Select
                    value={globalSettings.retryFailedAttempts.toString()}
                    onValueChange={(value) =>
                      setGlobalSettings((prev) => ({ ...prev, retryFailedAttempts: Number.parseInt(value) }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 attempt</SelectItem>
                      <SelectItem value="2">2 attempts</SelectItem>
                      <SelectItem value="3">3 attempts</SelectItem>
                      <SelectItem value="5">5 attempts</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Retry Delay (minutes)</Label>
                  <Input
                    type="number"
                    value={globalSettings.retryDelayMinutes}
                    onChange={(e) =>
                      setGlobalSettings((prev) => ({
                        ...prev,
                        retryDelayMinutes: Number.parseInt(e.target.value),
                      }))
                    }
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Edit Type Dialog */}
      <Dialog open={showEditTypeDialog} onOpenChange={setShowEditTypeDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Notification Type</DialogTitle>
            <DialogDescription>Configure channels and settings for this notification type</DialogDescription>
          </DialogHeader>
          {selectedType && (
            <div className="space-y-4">
              <div>
                <Label>Name</Label>
                <Input value={selectedType.name} disabled />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea
                  value={selectedType.description}
                  onChange={(e) => setSelectedType((prev) => (prev ? { ...prev, description: e.target.value } : null))}
                />
              </div>
              <div>
                <Label className="mb-3 block">Channels</Label>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span>Email</span>
                    <Switch
                      checked={selectedType.channels.email}
                      onCheckedChange={(checked) =>
                        setSelectedType((prev) =>
                          prev ? { ...prev, channels: { ...prev.channels, email: checked } } : null,
                        )
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Push</span>
                    <Switch
                      checked={selectedType.channels.push}
                      onCheckedChange={(checked) =>
                        setSelectedType((prev) =>
                          prev ? { ...prev, channels: { ...prev.channels, push: checked } } : null,
                        )
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span>SMS</span>
                    <Switch
                      checked={selectedType.channels.sms}
                      onCheckedChange={(checked) =>
                        setSelectedType((prev) =>
                          prev ? { ...prev, channels: { ...prev.channels, sms: checked } } : null,
                        )
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span>In-App</span>
                    <Switch
                      checked={selectedType.channels.inApp}
                      onCheckedChange={(checked) =>
                        setSelectedType((prev) =>
                          prev ? { ...prev, channels: { ...prev.channels, inApp: checked } } : null,
                        )
                      }
                    />
                  </div>
                </div>
              </div>
              <div>
                <Label>Priority</Label>
                <Select
                  value={selectedType.priority}
                  onValueChange={(value: "low" | "normal" | "high" | "urgent") =>
                    setSelectedType((prev) => (prev ? { ...prev, priority: value } : null))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between">
                <Label>Allow User Configuration</Label>
                <Switch
                  checked={selectedType.userConfigurable}
                  onCheckedChange={(checked) =>
                    setSelectedType((prev) => (prev ? { ...prev, userConfigurable: checked } : null))
                  }
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditTypeDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveType}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Test Notification Dialog */}
      <Dialog open={showTestDialog} onOpenChange={setShowTestDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Test Notification</DialogTitle>
            <DialogDescription>Send a test notification to verify the channel is working correctly</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Channel</Label>
              <Select value={testChannel} onValueChange={setTestChannel}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="push">Push Notification</SelectItem>
                  <SelectItem value="sms">SMS</SelectItem>
                  <SelectItem value="in_app">In-App</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Recipient Email</Label>
              <Input placeholder="admin@example.com" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTestDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleTestNotification}>
              <Send className="w-4 h-4 mr-2" />
              Send Test
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
