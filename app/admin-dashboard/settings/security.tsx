"use client"

import { useState, useEffect } from "react"
import {
  Shield,
  Key,
  Lock,
  Smartphone,
  AlertTriangle,
  Clock,
  Users,
  RefreshCw,
  CheckCircle,
  XCircle,
  Settings,
  Monitor,
  MapPin,
  Trash2,
  Ban,
  Search,
  Download,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
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

interface SecuritySettings {
  passwordPolicy: {
    minLength: number
    requireUppercase: boolean
    requireLowercase: boolean
    requireNumbers: boolean
    requireSpecialChars: boolean
    expiryDays: number
    preventReuse: number
  }
  twoFactor: {
    enabled: boolean
    required: boolean
    methods: string[]
    gracePeriod: number
  }
  session: {
    maxConcurrent: number
    timeout: number
    extendOnActivity: boolean
    rememberMeDays: number
  }
  loginSecurity: {
    maxAttempts: number
    lockoutDuration: number
    captchaAfterAttempts: number
    ipBlocking: boolean
    geoBlocking: boolean
    blockedCountries: string[]
  }
  audit: {
    enabled: boolean
    retentionDays: number
    logSuccessfulLogins: boolean
    logFailedLogins: boolean
    logPasswordChanges: boolean
    logPermissionChanges: boolean
  }
}

interface ActiveSession {
  id: string
  userId: string
  userName: string
  userEmail: string
  userType: string
  deviceInfo: string
  ipAddress: string
  location: string
  browser: string
  os: string
  lastActivity: string
  createdAt: string
  isCurrent: boolean
}

interface SecurityEvent {
  id: string
  type: string
  severity: "low" | "medium" | "high" | "critical"
  description: string
  userId?: string
  userName?: string
  ipAddress: string
  location: string
  timestamp: string
  resolved: boolean
}

export default function SettingsSecurityPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [settings, setSettings] = useState<SecuritySettings | null>(null)
  const [sessions, setSessions] = useState<ActiveSession[]>([])
  const [events, setEvents] = useState<SecurityEvent[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [eventFilter, setEventFilter] = useState("all")
  const [showPassword, setShowPassword] = useState(false)
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean
    title: string
    description: string
    action: () => void
  }>({ open: false, title: "", description: "", action: () => {} })

  useEffect(() => {
    fetchSecurityData()
  }, [])

  const fetchSecurityData = async () => {
    try {
      const response = await fetch("/api/admin/settings/security")
      const data = await response.json()
      setSettings(data.settings)
      setSessions(data.sessions)
      setEvents(data.events)
    } catch (error) {
      console.error("Error fetching security data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveSettings = async () => {
    setSaving(true)
    try {
      await fetch("/api/admin/settings/security", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      })
    } catch (error) {
      console.error("Error saving settings:", error)
    } finally {
      setSaving(false)
    }
  }

  const handleTerminateSession = async (sessionId: string) => {
    try {
      await fetch(`/api/admin/settings/security/sessions/${sessionId}`, {
        method: "DELETE",
      })
      setSessions(sessions.filter((s) => s.id !== sessionId))
    } catch (error) {
      console.error("Error terminating session:", error)
    }
  }

  const handleTerminateAllSessions = async () => {
    try {
      await fetch("/api/admin/settings/security/sessions", {
        method: "DELETE",
      })
      setSessions(sessions.filter((s) => s.isCurrent))
    } catch (error) {
      console.error("Error terminating sessions:", error)
    }
  }

  const handleResolveEvent = async (eventId: string) => {
    try {
      await fetch(`/api/admin/settings/security/events/${eventId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resolved: true }),
      })
      setEvents(events.map((e) => (e.id === eventId ? { ...e, resolved: true } : e)))
    } catch (error) {
      console.error("Error resolving event:", error)
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "bg-red-100 text-red-800 border-red-200"
      case "high":
        return "bg-orange-100 text-orange-800 border-orange-200"
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "low":
        return "bg-blue-100 text-blue-800 border-blue-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const filteredEvents = events.filter((event) => {
    const matchesSearch =
      event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.userName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.ipAddress.includes(searchQuery)
    const matchesFilter = eventFilter === "all" || event.severity === eventFilter
    return matchesSearch && matchesFilter
  })

  const stats = {
    activeSessions: sessions.length,
    unresolvedEvents: events.filter((e) => !e.resolved).length,
    criticalEvents: events.filter((e) => e.severity === "critical" && !e.resolved).length,
    blockedIPs: 12,
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Security Settings</h1>
          <p className="text-gray-600">Manage platform security policies and monitor threats</p>
        </div>
        <Button onClick={handleSaveSettings} disabled={saving}>
          {saving ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Shield className="w-4 h-4 mr-2" />
              Save Changes
            </>
          )}
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Sessions</p>
                <p className="text-2xl font-bold text-gray-900">{stats.activeSessions}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Unresolved Events</p>
                <p className="text-2xl font-bold text-gray-900">{stats.unresolvedEvents}</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-full">
                <AlertTriangle className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Critical Alerts</p>
                <p className="text-2xl font-bold text-red-600">{stats.criticalEvents}</p>
              </div>
              <div className="p-3 bg-red-100 rounded-full">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Blocked IPs</p>
                <p className="text-2xl font-bold text-gray-900">{stats.blockedIPs}</p>
              </div>
              <div className="p-3 bg-gray-100 rounded-full">
                <Ban className="w-6 h-6 text-gray-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="policies" className="space-y-4">
        <TabsList className="grid grid-cols-5 w-full max-w-3xl">
          <TabsTrigger value="policies">Policies</TabsTrigger>
          <TabsTrigger value="authentication">Authentication</TabsTrigger>
          <TabsTrigger value="sessions">Sessions</TabsTrigger>
          <TabsTrigger value="events">Security Events</TabsTrigger>
          <TabsTrigger value="audit">Audit Log</TabsTrigger>
        </TabsList>

        {/* Policies Tab */}
        <TabsContent value="policies" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Password Policy */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="w-5 h-5" />
                  Password Policy
                </CardTitle>
                <CardDescription>Configure password requirements for all users</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Minimum Length</Label>
                    <span className="text-sm font-medium">{settings?.passwordPolicy.minLength} characters</span>
                  </div>
                  <Slider
                    value={[settings?.passwordPolicy.minLength || 8]}
                    min={6}
                    max={20}
                    step={1}
                    onValueChange={(value) =>
                      setSettings((prev) =>
                        prev ? { ...prev, passwordPolicy: { ...prev.passwordPolicy, minLength: value[0] } } : prev,
                      )
                    }
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Require Uppercase</Label>
                    <Switch
                      checked={settings?.passwordPolicy.requireUppercase}
                      onCheckedChange={(checked) =>
                        setSettings((prev) =>
                          prev
                            ? { ...prev, passwordPolicy: { ...prev.passwordPolicy, requireUppercase: checked } }
                            : prev,
                        )
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Require Lowercase</Label>
                    <Switch
                      checked={settings?.passwordPolicy.requireLowercase}
                      onCheckedChange={(checked) =>
                        setSettings((prev) =>
                          prev
                            ? { ...prev, passwordPolicy: { ...prev.passwordPolicy, requireLowercase: checked } }
                            : prev,
                        )
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Require Numbers</Label>
                    <Switch
                      checked={settings?.passwordPolicy.requireNumbers}
                      onCheckedChange={(checked) =>
                        setSettings((prev) =>
                          prev
                            ? { ...prev, passwordPolicy: { ...prev.passwordPolicy, requireNumbers: checked } }
                            : prev,
                        )
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Require Special Characters</Label>
                    <Switch
                      checked={settings?.passwordPolicy.requireSpecialChars}
                      onCheckedChange={(checked) =>
                        setSettings((prev) =>
                          prev
                            ? { ...prev, passwordPolicy: { ...prev.passwordPolicy, requireSpecialChars: checked } }
                            : prev,
                        )
                      }
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Password Expiry (days)</Label>
                    <Input
                      type="number"
                      value={settings?.passwordPolicy.expiryDays}
                      onChange={(e) =>
                        setSettings((prev) =>
                          prev
                            ? {
                                ...prev,
                                passwordPolicy: { ...prev.passwordPolicy, expiryDays: Number.parseInt(e.target.value) },
                              }
                            : prev,
                        )
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Prevent Reuse (last N)</Label>
                    <Input
                      type="number"
                      value={settings?.passwordPolicy.preventReuse}
                      onChange={(e) =>
                        setSettings((prev) =>
                          prev
                            ? {
                                ...prev,
                                passwordPolicy: {
                                  ...prev.passwordPolicy,
                                  preventReuse: Number.parseInt(e.target.value),
                                },
                              }
                            : prev,
                        )
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Login Security */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="w-5 h-5" />
                  Login Security
                </CardTitle>
                <CardDescription>Configure login protection and rate limiting</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Max Login Attempts</Label>
                    <Input
                      type="number"
                      value={settings?.loginSecurity.maxAttempts}
                      onChange={(e) =>
                        setSettings((prev) =>
                          prev
                            ? {
                                ...prev,
                                loginSecurity: { ...prev.loginSecurity, maxAttempts: Number.parseInt(e.target.value) },
                              }
                            : prev,
                        )
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Lockout Duration (min)</Label>
                    <Input
                      type="number"
                      value={settings?.loginSecurity.lockoutDuration}
                      onChange={(e) =>
                        setSettings((prev) =>
                          prev
                            ? {
                                ...prev,
                                loginSecurity: {
                                  ...prev.loginSecurity,
                                  lockoutDuration: Number.parseInt(e.target.value),
                                },
                              }
                            : prev,
                        )
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>CAPTCHA After Failed Attempts</Label>
                  <Input
                    type="number"
                    value={settings?.loginSecurity.captchaAfterAttempts}
                    onChange={(e) =>
                      setSettings((prev) =>
                        prev
                          ? {
                              ...prev,
                              loginSecurity: {
                                ...prev.loginSecurity,
                                captchaAfterAttempts: Number.parseInt(e.target.value),
                              },
                            }
                          : prev,
                      )
                    }
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>IP Blocking</Label>
                      <p className="text-xs text-gray-500">Block IPs after suspicious activity</p>
                    </div>
                    <Switch
                      checked={settings?.loginSecurity.ipBlocking}
                      onCheckedChange={(checked) =>
                        setSettings((prev) =>
                          prev ? { ...prev, loginSecurity: { ...prev.loginSecurity, ipBlocking: checked } } : prev,
                        )
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Geo Blocking</Label>
                      <p className="text-xs text-gray-500">Block logins from specific countries</p>
                    </div>
                    <Switch
                      checked={settings?.loginSecurity.geoBlocking}
                      onCheckedChange={(checked) =>
                        setSettings((prev) =>
                          prev ? { ...prev, loginSecurity: { ...prev.loginSecurity, geoBlocking: checked } } : prev,
                        )
                      }
                    />
                  </div>
                </div>

                {settings?.loginSecurity.geoBlocking && (
                  <div className="space-y-2">
                    <Label>Blocked Countries</Label>
                    <Textarea
                      placeholder="Enter country codes separated by commas (e.g., CN, RU, KP)"
                      value={settings?.loginSecurity.blockedCountries?.join(", ")}
                      onChange={(e) =>
                        setSettings((prev) =>
                          prev
                            ? {
                                ...prev,
                                loginSecurity: {
                                  ...prev.loginSecurity,
                                  blockedCountries: e.target.value.split(",").map((s) => s.trim()),
                                },
                              }
                            : prev,
                        )
                      }
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Authentication Tab */}
        <TabsContent value="authentication" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Two-Factor Authentication */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Smartphone className="w-5 h-5" />
                  Two-Factor Authentication
                </CardTitle>
                <CardDescription>Configure 2FA requirements for the platform</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Enable 2FA</Label>
                    <p className="text-xs text-gray-500">Allow users to enable 2FA</p>
                  </div>
                  <Switch
                    checked={settings?.twoFactor.enabled}
                    onCheckedChange={(checked) =>
                      setSettings((prev) =>
                        prev ? { ...prev, twoFactor: { ...prev.twoFactor, enabled: checked } } : prev,
                      )
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Require 2FA for All Users</Label>
                    <p className="text-xs text-gray-500">Force all users to enable 2FA</p>
                  </div>
                  <Switch
                    checked={settings?.twoFactor.required}
                    onCheckedChange={(checked) =>
                      setSettings((prev) =>
                        prev ? { ...prev, twoFactor: { ...prev.twoFactor, required: checked } } : prev,
                      )
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>Allowed 2FA Methods</Label>
                  <div className="space-y-2">
                    {["authenticator", "sms", "email", "backup_codes"].map((method) => (
                      <div key={method} className="flex items-center gap-2">
                        <Switch
                          checked={settings?.twoFactor.methods?.includes(method)}
                          onCheckedChange={(checked) => {
                            setSettings((prev) => {
                              if (!prev) return prev
                              const methods = checked
                                ? [...(prev.twoFactor.methods || []), method]
                                : prev.twoFactor.methods?.filter((m) => m !== method) || []
                              return { ...prev, twoFactor: { ...prev.twoFactor, methods } }
                            })
                          }}
                        />
                        <Label className="capitalize">{method.replace("_", " ")}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Grace Period (days)</Label>
                  <p className="text-xs text-gray-500">Days before 2FA becomes mandatory</p>
                  <Input
                    type="number"
                    value={settings?.twoFactor.gracePeriod}
                    onChange={(e) =>
                      setSettings((prev) =>
                        prev
                          ? { ...prev, twoFactor: { ...prev.twoFactor, gracePeriod: Number.parseInt(e.target.value) } }
                          : prev,
                      )
                    }
                  />
                </div>
              </CardContent>
            </Card>

            {/* Session Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Session Settings
                </CardTitle>
                <CardDescription>Configure session management and timeouts</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Max Concurrent Sessions</Label>
                    <Input
                      type="number"
                      value={settings?.session.maxConcurrent}
                      onChange={(e) =>
                        setSettings((prev) =>
                          prev
                            ? { ...prev, session: { ...prev.session, maxConcurrent: Number.parseInt(e.target.value) } }
                            : prev,
                        )
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Session Timeout (min)</Label>
                    <Input
                      type="number"
                      value={settings?.session.timeout}
                      onChange={(e) =>
                        setSettings((prev) =>
                          prev
                            ? { ...prev, session: { ...prev.session, timeout: Number.parseInt(e.target.value) } }
                            : prev,
                        )
                      }
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Extend on Activity</Label>
                    <p className="text-xs text-gray-500">Reset timeout on user activity</p>
                  </div>
                  <Switch
                    checked={settings?.session.extendOnActivity}
                    onCheckedChange={(checked) =>
                      setSettings((prev) =>
                        prev ? { ...prev, session: { ...prev.session, extendOnActivity: checked } } : prev,
                      )
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>Remember Me Duration (days)</Label>
                  <Input
                    type="number"
                    value={settings?.session.rememberMeDays}
                    onChange={(e) =>
                      setSettings((prev) =>
                        prev
                          ? { ...prev, session: { ...prev.session, rememberMeDays: Number.parseInt(e.target.value) } }
                          : prev,
                      )
                    }
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Sessions Tab */}
        <TabsContent value="sessions" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Active Sessions</CardTitle>
                <CardDescription>Monitor and manage all active user sessions</CardDescription>
              </div>
              <Button
                variant="destructive"
                onClick={() =>
                  setConfirmDialog({
                    open: true,
                    title: "Terminate All Sessions",
                    description: "This will log out all users except you. Are you sure?",
                    action: handleTerminateAllSessions,
                  })
                }
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Terminate All
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Device</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Last Activity</TableHead>
                    <TableHead>Started</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sessions.map((session) => (
                    <TableRow key={session.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{session.userName}</p>
                          <p className="text-sm text-gray-500">{session.userEmail}</p>
                          <Badge variant="outline" className="mt-1 text-xs">
                            {session.userType}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Monitor className="w-4 h-4 text-gray-400" />
                          <div>
                            <p className="text-sm">{session.browser}</p>
                            <p className="text-xs text-gray-500">{session.os}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          <div>
                            <p className="text-sm">{session.location}</p>
                            <p className="text-xs text-gray-500">{session.ipAddress}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm">{new Date(session.lastActivity).toLocaleString()}</p>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm">{new Date(session.createdAt).toLocaleString()}</p>
                      </TableCell>
                      <TableCell className="text-right">
                        {session.isCurrent ? (
                          <Badge className="bg-green-100 text-green-800">Current</Badge>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-700"
                            onClick={() => handleTerminateSession(session.id)}
                          >
                            <XCircle className="w-4 h-4" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Events Tab */}
        <TabsContent value="events" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <CardTitle>Security Events</CardTitle>
                  <CardDescription>Monitor security threats and incidents</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search events..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 w-64"
                    />
                  </div>
                  <Select value={eventFilter} onValueChange={setEventFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Filter by severity" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Severity</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredEvents.map((event) => (
                  <div key={event.id} className={`p-4 rounded-lg border ${event.resolved ? "bg-gray-50" : "bg-white"}`}>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div
                          className={`p-2 rounded-full ${
                            event.severity === "critical"
                              ? "bg-red-100"
                              : event.severity === "high"
                                ? "bg-orange-100"
                                : event.severity === "medium"
                                  ? "bg-yellow-100"
                                  : "bg-blue-100"
                          }`}
                        >
                          <AlertTriangle
                            className={`w-4 h-4 ${
                              event.severity === "critical"
                                ? "text-red-600"
                                : event.severity === "high"
                                  ? "text-orange-600"
                                  : event.severity === "medium"
                                    ? "text-yellow-600"
                                    : "text-blue-600"
                            }`}
                          />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-gray-900">{event.type}</p>
                            <Badge className={getSeverityColor(event.severity)}>{event.severity}</Badge>
                            {event.resolved && <Badge className="bg-green-100 text-green-800">Resolved</Badge>}
                          </div>
                          <p className="text-sm text-gray-600 mt-1">{event.description}</p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                            {event.userName && <span>User: {event.userName}</span>}
                            <span>IP: {event.ipAddress}</span>
                            <span>Location: {event.location}</span>
                            <span>{new Date(event.timestamp).toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                      {!event.resolved && (
                        <Button variant="outline" size="sm" onClick={() => handleResolveEvent(event.id)}>
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Resolve
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Audit Log Tab */}
        <TabsContent value="audit" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Audit Log Settings
              </CardTitle>
              <CardDescription>Configure what security events to log</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Enable Audit Logging</Label>
                  <p className="text-xs text-gray-500">Log security-related events</p>
                </div>
                <Switch
                  checked={settings?.audit.enabled}
                  onCheckedChange={(checked) =>
                    setSettings((prev) => (prev ? { ...prev, audit: { ...prev.audit, enabled: checked } } : prev))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Log Retention (days)</Label>
                <Input
                  type="number"
                  value={settings?.audit.retentionDays}
                  onChange={(e) =>
                    setSettings((prev) =>
                      prev
                        ? { ...prev, audit: { ...prev.audit, retentionDays: Number.parseInt(e.target.value) } }
                        : prev,
                    )
                  }
                />
              </div>

              <div className="space-y-3">
                <Label>Events to Log</Label>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="font-normal">Successful Logins</Label>
                    <Switch
                      checked={settings?.audit.logSuccessfulLogins}
                      onCheckedChange={(checked) =>
                        setSettings((prev) =>
                          prev ? { ...prev, audit: { ...prev.audit, logSuccessfulLogins: checked } } : prev,
                        )
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="font-normal">Failed Logins</Label>
                    <Switch
                      checked={settings?.audit.logFailedLogins}
                      onCheckedChange={(checked) =>
                        setSettings((prev) =>
                          prev ? { ...prev, audit: { ...prev.audit, logFailedLogins: checked } } : prev,
                        )
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="font-normal">Password Changes</Label>
                    <Switch
                      checked={settings?.audit.logPasswordChanges}
                      onCheckedChange={(checked) =>
                        setSettings((prev) =>
                          prev ? { ...prev, audit: { ...prev.audit, logPasswordChanges: checked } } : prev,
                        )
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="font-normal">Permission Changes</Label>
                    <Switch
                      checked={settings?.audit.logPermissionChanges}
                      onCheckedChange={(checked) =>
                        setSettings((prev) =>
                          prev ? { ...prev, audit: { ...prev.audit, logPermissionChanges: checked } } : prev,
                        )
                      }
                    />
                  </div>
                </div>
              </div>

              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Export Audit Logs
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Confirm Dialog */}
      <Dialog open={confirmDialog.open} onOpenChange={(open) => setConfirmDialog({ ...confirmDialog, open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{confirmDialog.title}</DialogTitle>
            <DialogDescription>{confirmDialog.description}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDialog({ ...confirmDialog, open: false })}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                confirmDialog.action()
                setConfirmDialog({ ...confirmDialog, open: false })
              }}
            >
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
