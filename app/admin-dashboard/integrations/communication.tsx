"use client"

import { useState, useEffect } from "react"
import {
  Mail,
  MessageSquare,
  Settings,
  CheckCircle,
  Send,
  BarChart3,
  RefreshCw,
  Edit,
  TestTube,
  Eye,
  EyeOff,
  Loader2,
  Search,
  Bell,
  Smartphone,
  Globe,
  Zap,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import { apiFetch } from "@/lib/api"

interface EmailProvider {
  id: string
  name: string
  provider: string
  status: "active" | "inactive" | "error"
  type: "transactional" | "marketing" | "both"
  apiKey: string
  fromEmail: string
  fromName: string
  dailyLimit: number
  sentToday: number
  totalSent: number
  successRate: number
  lastSync: string
  webhookUrl?: string
  settings: {
    enableTracking: boolean
    enableUnsubscribe: boolean
    replyTo?: string
  }
}

interface SmsProvider {
  id: string
  name: string
  provider: string
  status: "active" | "inactive" | "error"
  accountSid: string
  authToken: string
  fromNumber: string
  dailyLimit: number
  sentToday: number
  totalSent: number
  successRate: number
  lastSync: string
  settings: {
    enableDeliveryReports: boolean
    defaultCountryCode: string
  }
}

interface CommunicationLog {
  id: string
  type: "email" | "sms"
  provider: string
  recipient: string
  subject?: string
  status: "sent" | "delivered" | "failed" | "bounced" | "opened"
  sentAt: string
  deliveredAt?: string
  error?: string
}

interface Stats {
  totalEmailsSent: number
  totalSmsSent: number
  emailSuccessRate: number
  smsSuccessRate: number
  activeEmailProviders: number
  activeSmsProviders: number
}

export default function CommunicationIntegrationsPage() {
  const [emailProviders, setEmailProviders] = useState<EmailProvider[]>([])
  const [smsProviders, setSmsProviders] = useState<SmsProvider[]>([])
  const [logs, setLogs] = useState<CommunicationLog[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("email")
  const [searchQuery, setSearchQuery] = useState("")
  const [logTypeFilter, setLogTypeFilter] = useState<string>("all")
  const [logStatusFilter, setLogStatusFilter] = useState<string>("all")

  // Dialog states
  const [configureEmailOpen, setConfigureEmailOpen] = useState(false)
  const [configureSmsOpen, setConfigureSmsOpen] = useState(false)
  const [testEmailOpen, setTestEmailOpen] = useState(false)
  const [testSmsOpen, setTestSmsOpen] = useState(false)
  const [selectedEmailProvider, setSelectedEmailProvider] = useState<EmailProvider | null>(null)
  const [selectedSmsProvider, setSelectedSmsProvider] = useState<SmsProvider | null>(null)
  const [showApiKey, setShowApiKey] = useState<Record<string, boolean>>({})

  // Test form states
  const [testEmail, setTestEmail] = useState("")
  const [testEmailSubject, setTestEmailSubject] = useState("Test Email from Admin Dashboard")
  const [testEmailBody, setTestEmailBody] = useState(
    "This is a test email to verify the integration is working correctly.",
  )
  const [testPhone, setTestPhone] = useState("")
  const [testSmsBody, setTestSmsBody] = useState("This is a test SMS from Admin Dashboard.")
  const [testing, setTesting] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const res = await apiFetch<{
        success?: boolean
        data?: {
          emailProviders?: EmailProvider[]
          smsProviders?: SmsProvider[]
          stats?: Stats
          logs?: CommunicationLog[]
        }
      }>("/api/admin/integrations/communication", { auth: true })
      const d = res.data
      if (d) {
        setEmailProviders(d.emailProviders ?? [])
        setSmsProviders(d.smsProviders ?? [])
        setStats(d.stats ?? null)
        setLogs(d.logs ?? [])
      }
    } catch (error) {
      console.error("Error fetching communication data:", error)
    } finally {
      setLoading(false)
    }
  }

  const toggleProvider = async (type: "email" | "sms", id: string, enabled: boolean) => {
    try {
      const res = await apiFetch<{ success?: boolean }>(`/api/admin/integrations/communication/providers/${id}`, {
        method: "PATCH",
        body: { type, status: enabled ? "active" : "inactive" },
        auth: true,
      })

      if (res.success !== false) {
        if (type === "email") {
          setEmailProviders((prev) =>
            prev.map((p) => (p.id === id ? { ...p, status: enabled ? "active" : "inactive" } : p)),
          )
        } else {
          setSmsProviders((prev) =>
            prev.map((p) => (p.id === id ? { ...p, status: enabled ? "active" : "inactive" } : p)),
          )
        }
      }
    } catch (error) {
      console.error("Error toggling provider:", error)
    }
  }

  const handleTestEmail = async () => {
    if (!selectedEmailProvider || !testEmail) return
    setTesting(true)
    try {
      const res = await apiFetch<{ success?: boolean }>(
        `/api/admin/integrations/communication/providers/${selectedEmailProvider.id}/test`,
        {
          method: "POST",
          body: {
            type: "email",
            recipient: testEmail,
            subject: testEmailSubject,
            body: testEmailBody,
          },
          auth: true,
        },
      )

      if (res.success !== false) {
        alert("Test email sent successfully!")
        setTestEmailOpen(false)
        setTestEmail("")
      } else {
        alert("Failed to send test email")
      }
    } catch (error) {
      console.error("Error sending test email:", error)
      alert("Error sending test email")
    } finally {
      setTesting(false)
    }
  }

  const handleTestSms = async () => {
    if (!selectedSmsProvider || !testPhone) return
    setTesting(true)
    try {
      const res = await apiFetch<{ success?: boolean }>(
        `/api/admin/integrations/communication/providers/${selectedSmsProvider.id}/test`,
        {
          method: "POST",
          body: {
            type: "sms",
            recipient: testPhone,
            body: testSmsBody,
          },
          auth: true,
        },
      )

      if (res.success !== false) {
        alert("Test SMS sent successfully!")
        setTestSmsOpen(false)
        setTestPhone("")
      } else {
        alert("Failed to send test SMS")
      }
    } catch (error) {
      console.error("Error sending test SMS:", error)
      alert("Error sending test SMS")
    } finally {
      setTesting(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800">Active</Badge>
      case "inactive":
        return <Badge className="bg-gray-100 text-gray-800">Inactive</Badge>
      case "error":
        return <Badge className="bg-red-100 text-red-800">Error</Badge>
      case "sent":
        return <Badge className="bg-blue-100 text-blue-800">Sent</Badge>
      case "delivered":
        return <Badge className="bg-green-100 text-green-800">Delivered</Badge>
      case "failed":
        return <Badge className="bg-red-100 text-red-800">Failed</Badge>
      case "bounced":
        return <Badge className="bg-orange-100 text-orange-800">Bounced</Badge>
      case "opened":
        return <Badge className="bg-purple-100 text-purple-800">Opened</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  const getProviderIcon = (provider: string) => {
    switch (provider.toLowerCase()) {
      case "sendgrid":
      case "mailgun":
      case "ses":
      case "postmark":
        return <Mail className="h-5 w-5" />
      case "twilio":
      case "nexmo":
      case "messagebird":
        return <Smartphone className="h-5 w-5" />
      default:
        return <Globe className="h-5 w-5" />
    }
  }

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.recipient.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (log.subject && log.subject.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesType = logTypeFilter === "all" || log.type === logTypeFilter
    const matchesStatus = logStatusFilter === "all" || log.status === logStatusFilter
    return matchesSearch && matchesType && matchesStatus
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Communication Integrations</h1>
          <p className="text-muted-foreground">Manage email and SMS provider integrations</p>
        </div>
        <Button onClick={fetchData} variant="outline">
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Emails Sent</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalEmailsSent.toLocaleString() || 0}</div>
            <p className="text-xs text-muted-foreground">{stats?.emailSuccessRate.toFixed(1)}% success rate</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total SMS Sent</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalSmsSent.toLocaleString() || 0}</div>
            <p className="text-xs text-muted-foreground">{stats?.smsSuccessRate.toFixed(1)}% success rate</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Email Providers</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.activeEmailProviders || 0}</div>
            <p className="text-xs text-muted-foreground">of {emailProviders.length} configured</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active SMS Providers</CardTitle>
            <Zap className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.activeSmsProviders || 0}</div>
            <p className="text-xs text-muted-foreground">of {smsProviders.length} configured</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="email">
            <Mail className="mr-2 h-4 w-4" />
            Email Providers
          </TabsTrigger>
          <TabsTrigger value="sms">
            <MessageSquare className="mr-2 h-4 w-4" />
            SMS Providers
          </TabsTrigger>
          <TabsTrigger value="logs">
            <BarChart3 className="mr-2 h-4 w-4" />
            Communication Logs
          </TabsTrigger>
          <TabsTrigger value="templates">
            <Bell className="mr-2 h-4 w-4" />
            Templates
          </TabsTrigger>
        </TabsList>

        {/* Email Providers Tab */}
        <TabsContent value="email" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {emailProviders.map((provider) => (
              <Card key={provider.id} className="relative">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-lg">{getProviderIcon(provider.provider)}</div>
                      <div>
                        <CardTitle className="text-lg">{provider.name}</CardTitle>
                        <CardDescription>{provider.provider}</CardDescription>
                      </div>
                    </div>
                    {getStatusBadge(provider.status)}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Type</p>
                      <p className="font-medium capitalize">{provider.type}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Success Rate</p>
                      <p className="font-medium">{provider.successRate.toFixed(1)}%</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Sent Today</p>
                      <p className="font-medium">{provider.sentToday.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Daily Limit</p>
                      <p className="font-medium">{provider.dailyLimit.toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">API Key</span>
                      <div className="flex items-center gap-2">
                        <code className="text-xs bg-muted px-2 py-1 rounded">
                          {showApiKey[provider.id] ? provider.apiKey : provider.apiKey.replace(/./g, "*").slice(0, 20)}
                        </code>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowApiKey((prev) => ({ ...prev, [provider.id]: !prev[provider.id] }))}
                        >
                          {showApiKey[provider.id] ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                        </Button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">From Email</span>
                      <span className="font-medium">{provider.fromEmail}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={provider.status === "active"}
                        onCheckedChange={(checked) => toggleProvider("email", provider.id, checked)}
                      />
                      <Label className="text-sm">Enabled</Label>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedEmailProvider(provider)
                          setTestEmailOpen(true)
                        }}
                      >
                        <TestTube className="h-3 w-3 mr-1" />
                        Test
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedEmailProvider(provider)
                          setConfigureEmailOpen(true)
                        }}
                      >
                        <Settings className="h-3 w-3 mr-1" />
                        Configure
                      </Button>
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground">
                    Last synced: {new Date(provider.lastSync).toLocaleString()}
                  </p>
                </CardContent>
              </Card>
            ))}

            {/* Add New Email Provider Card */}
            <Card className="border-dashed flex items-center justify-center min-h-[300px]">
              <Button variant="ghost" className="flex flex-col h-auto py-8">
                <Mail className="h-8 w-8 mb-2 text-muted-foreground" />
                <span>Add Email Provider</span>
              </Button>
            </Card>
          </div>
        </TabsContent>

        {/* SMS Providers Tab */}
        <TabsContent value="sms" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {smsProviders.map((provider) => (
              <Card key={provider.id} className="relative">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <Smartphone className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{provider.name}</CardTitle>
                        <CardDescription>{provider.provider}</CardDescription>
                      </div>
                    </div>
                    {getStatusBadge(provider.status)}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">From Number</p>
                      <p className="font-medium">{provider.fromNumber}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Success Rate</p>
                      <p className="font-medium">{provider.successRate.toFixed(1)}%</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Sent Today</p>
                      <p className="font-medium">{provider.sentToday.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Daily Limit</p>
                      <p className="font-medium">{provider.dailyLimit.toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Account SID</span>
                      <code className="text-xs bg-muted px-2 py-1 rounded">{provider.accountSid.slice(0, 10)}...</code>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Default Country</span>
                      <span className="font-medium">{provider.settings.defaultCountryCode}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={provider.status === "active"}
                        onCheckedChange={(checked) => toggleProvider("sms", provider.id, checked)}
                      />
                      <Label className="text-sm">Enabled</Label>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedSmsProvider(provider)
                          setTestSmsOpen(true)
                        }}
                      >
                        <TestTube className="h-3 w-3 mr-1" />
                        Test
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedSmsProvider(provider)
                          setConfigureSmsOpen(true)
                        }}
                      >
                        <Settings className="h-3 w-3 mr-1" />
                        Configure
                      </Button>
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground">
                    Last synced: {new Date(provider.lastSync).toLocaleString()}
                  </p>
                </CardContent>
              </Card>
            ))}

            {/* Add New SMS Provider Card */}
            <Card className="border-dashed flex items-center justify-center min-h-[300px]">
              <Button variant="ghost" className="flex flex-col h-auto py-8">
                <Smartphone className="h-8 w-8 mb-2 text-muted-foreground" />
                <span>Add SMS Provider</span>
              </Button>
            </Card>
          </div>
        </TabsContent>

        {/* Communication Logs Tab */}
        <TabsContent value="logs" className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by recipient or subject..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={logTypeFilter} onValueChange={setLogTypeFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="sms">SMS</SelectItem>
              </SelectContent>
            </Select>
            <Select value={logStatusFilter} onValueChange={setLogStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="sent">Sent</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="bounced">Bounced</SelectItem>
                <SelectItem value="opened">Opened</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Provider</TableHead>
                  <TableHead>Recipient</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Sent At</TableHead>
                  <TableHead>Delivered At</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No communication logs found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {log.type === "email" ? (
                            <Mail className="h-4 w-4 text-blue-500" />
                          ) : (
                            <MessageSquare className="h-4 w-4 text-green-500" />
                          )}
                          <span className="capitalize">{log.type}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{log.provider}</TableCell>
                      <TableCell>{log.recipient}</TableCell>
                      <TableCell className="max-w-[200px] truncate">{log.subject || "-"}</TableCell>
                      <TableCell>{getStatusBadge(log.status)}</TableCell>
                      <TableCell>{new Date(log.sentAt).toLocaleString()}</TableCell>
                      <TableCell>{log.deliveredAt ? new Date(log.deliveredAt).toLocaleString() : "-"}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        {/* Templates Tab */}
        <TabsContent value="templates" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Communication Templates</CardTitle>
              <CardDescription>Manage email and SMS templates for different notification types</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                {[
                  { name: "Welcome Email", type: "email", category: "Onboarding" },
                  { name: "Password Reset", type: "email", category: "Security" },
                  { name: "Event Registration", type: "email", category: "Events" },
                  { name: "Payment Confirmation", type: "email", category: "Billing" },
                  { name: "Appointment Reminder", type: "sms", category: "Reminders" },
                  { name: "Booking Confirmation", type: "sms", category: "Bookings" },
                ].map((template, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {template.type === "email" ? (
                        <Mail className="h-5 w-5 text-blue-500" />
                      ) : (
                        <MessageSquare className="h-5 w-5 text-green-500" />
                      )}
                      <div>
                        <p className="font-medium">{template.name}</p>
                        <p className="text-sm text-muted-foreground">{template.category}</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      <Edit className="h-3 w-3 mr-1" />
                      Edit
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Test Email Dialog */}
      <Dialog open={testEmailOpen} onOpenChange={setTestEmailOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Test Email</DialogTitle>
            <DialogDescription>Send a test email using {selectedEmailProvider?.name}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Recipient Email</Label>
              <Input
                type="email"
                placeholder="test@example.com"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Subject</Label>
              <Input
                placeholder="Email subject"
                value={testEmailSubject}
                onChange={(e) => setTestEmailSubject(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Body</Label>
              <Textarea
                placeholder="Email body"
                value={testEmailBody}
                onChange={(e) => setTestEmailBody(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTestEmailOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleTestEmail} disabled={testing || !testEmail}>
              {testing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Send Test
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Test SMS Dialog */}
      <Dialog open={testSmsOpen} onOpenChange={setTestSmsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Test SMS</DialogTitle>
            <DialogDescription>Send a test SMS using {selectedSmsProvider?.name}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Phone Number</Label>
              <Input
                type="tel"
                placeholder="+1234567890"
                value={testPhone}
                onChange={(e) => setTestPhone(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Message</Label>
              <Textarea
                placeholder="SMS message"
                value={testSmsBody}
                onChange={(e) => setTestSmsBody(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTestSmsOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleTestSms} disabled={testing || !testPhone}>
              {testing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Send Test
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Configure Email Provider Dialog */}
      <Dialog open={configureEmailOpen} onOpenChange={setConfigureEmailOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Configure {selectedEmailProvider?.name}</DialogTitle>
            <DialogDescription>Update email provider settings and credentials</DialogDescription>
          </DialogHeader>
          {selectedEmailProvider && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>API Key</Label>
                <Input type="password" defaultValue={selectedEmailProvider.apiKey} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>From Email</Label>
                  <Input defaultValue={selectedEmailProvider.fromEmail} />
                </div>
                <div className="space-y-2">
                  <Label>From Name</Label>
                  <Input defaultValue={selectedEmailProvider.fromName} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Daily Limit</Label>
                <Input type="number" defaultValue={selectedEmailProvider.dailyLimit} />
              </div>
              <div className="space-y-2">
                <Label>Reply-To Email</Label>
                <Input defaultValue={selectedEmailProvider.settings.replyTo} placeholder="optional" />
              </div>
              <div className="flex items-center justify-between">
                <Label>Enable Tracking</Label>
                <Switch defaultChecked={selectedEmailProvider.settings.enableTracking} />
              </div>
              <div className="flex items-center justify-between">
                <Label>Enable Unsubscribe Link</Label>
                <Switch defaultChecked={selectedEmailProvider.settings.enableUnsubscribe} />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfigureEmailOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => setConfigureEmailOpen(false)}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Configure SMS Provider Dialog */}
      <Dialog open={configureSmsOpen} onOpenChange={setConfigureSmsOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Configure {selectedSmsProvider?.name}</DialogTitle>
            <DialogDescription>Update SMS provider settings and credentials</DialogDescription>
          </DialogHeader>
          {selectedSmsProvider && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Account SID</Label>
                <Input defaultValue={selectedSmsProvider.accountSid} />
              </div>
              <div className="space-y-2">
                <Label>Auth Token</Label>
                <Input type="password" defaultValue={selectedSmsProvider.authToken} />
              </div>
              <div className="space-y-2">
                <Label>From Number</Label>
                <Input defaultValue={selectedSmsProvider.fromNumber} />
              </div>
              <div className="space-y-2">
                <Label>Daily Limit</Label>
                <Input type="number" defaultValue={selectedSmsProvider.dailyLimit} />
              </div>
              <div className="space-y-2">
                <Label>Default Country Code</Label>
                <Input defaultValue={selectedSmsProvider.settings.defaultCountryCode} />
              </div>
              <div className="flex items-center justify-between">
                <Label>Enable Delivery Reports</Label>
                <Switch defaultChecked={selectedSmsProvider.settings.enableDeliveryReports} />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfigureSmsOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => setConfigureSmsOpen(false)}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
