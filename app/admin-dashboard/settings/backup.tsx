"use client"

import { useState, useEffect } from "react"
import {
  Database,
  Download,
  Clock,
  HardDrive,
  Cloud,
  AlertTriangle,
  Play,
  Trash2,
  RefreshCw,
  Calendar,
  FileArchive,
  Server,
  Shield,
  Settings,
  RotateCcw,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
import { Progress } from "@/components/ui/progress"
import { Checkbox } from "@/components/ui/checkbox"
import { adminApi } from "@/lib/admin-api"

interface Backup {
  id: string
  name: string
  type: "full" | "incremental" | "differential"
  status: "completed" | "in_progress" | "failed" | "scheduled"
  size: string
  sizeBytes: number
  createdAt: string
  completedAt?: string
  duration?: string
  storage: "local" | "cloud" | "both"
  encryption: boolean
  collections: string[]
  retentionDays: number
}

interface BackupSchedule {
  id: string
  name: string
  type: "full" | "incremental" | "differential"
  frequency: "hourly" | "daily" | "weekly" | "monthly"
  time: string
  dayOfWeek?: number
  dayOfMonth?: number
  enabled: boolean
  lastRun?: string
  nextRun: string
  retention: number
  storage: "local" | "cloud" | "both"
}

interface StorageLocation {
  id: string
  name: string
  type: "local" | "s3" | "gcs" | "azure"
  path: string
  isDefault: boolean
  enabled: boolean
  usedSpace: string
  totalSpace: string
  usagePercent: number
}

export default function SettingsBackupPage() {
  const [backups, setBackups] = useState<Backup[]>([])
  const [schedules, setSchedules] = useState<BackupSchedule[]>([])
  const [storageLocations, setStorageLocations] = useState<StorageLocation[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("backups")

  const [createBackupDialog, setCreateBackupDialog] = useState(false)
  const [restoreDialog, setRestoreDialog] = useState(false)
  const [deleteDialog, setDeleteDialog] = useState(false)
  const [scheduleDialog, setScheduleDialog] = useState(false)
  const [storageDialog, setStorageDialog] = useState(false)

  const [selectedBackup, setSelectedBackup] = useState<Backup | null>(null)
  const [selectedSchedule, setSelectedSchedule] = useState<BackupSchedule | null>(null)
  const [selectedStorage, setSelectedStorage] = useState<StorageLocation | null>(null)

  const [backupInProgress, setBackupInProgress] = useState(false)
  const [backupProgress, setBackupProgress] = useState(0)
  const [restoreInProgress, setRestoreInProgress] = useState(false)
  const [restoreProgress, setRestoreProgress] = useState(0)

  const [newBackup, setNewBackup] = useState({
    name: "",
    type: "full" as "full" | "incremental" | "differential",
    storage: "both" as "local" | "cloud" | "both",
    encryption: true,
    collections: [] as string[],
  })

  const [newSchedule, setNewSchedule] = useState({
    name: "",
    type: "full" as "full" | "incremental" | "differential",
    frequency: "daily" as "hourly" | "daily" | "weekly" | "monthly",
    time: "02:00",
    dayOfWeek: 0,
    dayOfMonth: 1,
    retention: 30,
    storage: "both" as "local" | "cloud" | "both",
  })

  const availableCollections = [
    "users",
    "events",
    "registrations",
    "payments",
    "reviews",
    "notifications",
    "settings",
    "analytics",
    "sessions",
    "logs",
  ]

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const res = await adminApi<{
        success?: boolean
        data?: {
          backups: Backup[]
          schedules: BackupSchedule[]
          storageLocations: StorageLocation[]
        }
      }>("/settings/backup")
      if (res.success !== false && res.data) {
        setBackups(Array.isArray(res.data.backups) ? res.data.backups : [])
        setSchedules(Array.isArray(res.data.schedules) ? res.data.schedules : [])
        setStorageLocations(Array.isArray(res.data.storageLocations) ? res.data.storageLocations : [])
      }
    } catch (error) {
      console.error("Error fetching backup data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateBackup = async () => {
    setBackupInProgress(true)
    setBackupProgress(0)
    setCreateBackupDialog(false)

    // Simulate backup progress
    const interval = setInterval(() => {
      setBackupProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          setBackupInProgress(false)
          fetchData()
          return 100
        }
        return prev + 10
      })
    }, 500)

    try {
      await adminApi("/settings/backup", {
        method: "POST",
        body: newBackup,
      })
    } catch (error) {
      console.error("Error creating backup:", error)
      clearInterval(interval)
      setBackupInProgress(false)
    }
  }

  const handleRestore = async () => {
    if (!selectedBackup) return

    setRestoreInProgress(true)
    setRestoreProgress(0)
    setRestoreDialog(false)

    // Simulate restore progress
    const interval = setInterval(() => {
      setRestoreProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          setRestoreInProgress(false)
          return 100
        }
        return prev + 5
      })
    }, 300)

    try {
      await adminApi(`/settings/backup/${selectedBackup.id}/restore`, {
        method: "POST",
      })
    } catch (error) {
      console.error("Error restoring backup:", error)
      clearInterval(interval)
      setRestoreInProgress(false)
    }
  }

  const handleDeleteBackup = async () => {
    if (!selectedBackup) return

    try {
      await adminApi(`/settings/backup/${selectedBackup.id}`, {
        method: "DELETE",
      })
      setDeleteDialog(false)
      setSelectedBackup(null)
      fetchData()
    } catch (error) {
      console.error("Error deleting backup:", error)
    }
  }

  const handleSaveSchedule = async () => {
    try {
      if (selectedSchedule) {
        await adminApi(`/settings/backup/schedules/${selectedSchedule.id}`, {
          method: "PATCH",
          body: newSchedule,
        })
      } else {
        await adminApi("/settings/backup/schedules", {
          method: "POST",
          body: newSchedule,
        })
      }

      setScheduleDialog(false)
      setSelectedSchedule(null)
      fetchData()
    } catch (error) {
      console.error("Error saving schedule:", error)
    }
  }

  const handleToggleSchedule = async (schedule: BackupSchedule) => {
    try {
      await adminApi(`/settings/backup/schedules/${schedule.id}`, {
        method: "PATCH",
        body: { enabled: !schedule.enabled },
      })
      fetchData()
    } catch (error) {
      console.error("Error toggling schedule:", error)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-100 text-green-800 border-green-200">Completed</Badge>
      case "in_progress":
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">In Progress</Badge>
      case "failed":
        return <Badge className="bg-red-100 text-red-800 border-red-200">Failed</Badge>
      case "scheduled":
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Scheduled</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "full":
        return <Badge className="bg-purple-100 text-purple-800 border-purple-200">Full</Badge>
      case "incremental":
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Incremental</Badge>
      case "differential":
        return <Badge className="bg-orange-100 text-orange-800 border-orange-200">Differential</Badge>
      default:
        return <Badge variant="outline">{type}</Badge>
    }
  }

  const totalBackupSize = backups.reduce((acc, b) => acc + b.sizeBytes, 0)
  const completedBackups = backups.filter((b) => b.status === "completed").length
  const activeSchedules = schedules.filter((s) => s.enabled).length

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Backup & Restore</h1>
          <p className="text-gray-600 mt-1">Manage database backups, schedules, and recovery options</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={fetchData}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={() => setCreateBackupDialog(true)} disabled={backupInProgress}>
            <Database className="w-4 h-4 mr-2" />
            Create Backup
          </Button>
        </div>
      </div>

      {/* Progress Bars */}
      {backupInProgress && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="py-4">
            <div className="flex items-center gap-4">
              <Database className="w-5 h-5 text-blue-600 animate-pulse" />
              <div className="flex-1">
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-blue-700">Creating Backup...</span>
                  <span className="text-sm text-blue-600">{backupProgress}%</span>
                </div>
                <Progress value={backupProgress} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {restoreInProgress && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="py-4">
            <div className="flex items-center gap-4">
              <RotateCcw className="w-5 h-5 text-orange-600 animate-spin" />
              <div className="flex-1">
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-orange-700">Restoring Backup...</span>
                  <span className="text-sm text-orange-600">{restoreProgress}%</span>
                </div>
                <Progress value={restoreProgress} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Backups</p>
                <p className="text-2xl font-bold text-gray-900">{backups.length}</p>
                <p className="text-xs text-gray-500 mt-1">{completedBackups} completed</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Database className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Size</p>
                <p className="text-2xl font-bold text-gray-900">
                  {(totalBackupSize / (1024 * 1024 * 1024)).toFixed(2)} GB
                </p>
                <p className="text-xs text-gray-500 mt-1">Across all backups</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <HardDrive className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Schedules</p>
                <p className="text-2xl font-bold text-gray-900">{activeSchedules}</p>
                <p className="text-xs text-gray-500 mt-1">of {schedules.length} total</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Cloud Storage</p>
                <p className="text-2xl font-bold text-gray-900">
                  {storageLocations.filter((s) => s.type !== "local" && s.enabled).length}
                </p>
                <p className="text-xs text-gray-500 mt-1">Locations configured</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Cloud className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="backups">Backups</TabsTrigger>
          <TabsTrigger value="schedules">Schedules</TabsTrigger>
          <TabsTrigger value="storage">Storage Locations</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="backups" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Backup History</CardTitle>
              <CardDescription>View and manage all database backups</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead>Storage</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {backups.map((backup) => (
                    <TableRow key={backup.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <FileArchive className="w-4 h-4 text-gray-500" />
                          <div>
                            <p className="font-medium">{backup.name}</p>
                            {backup.encryption && (
                              <div className="flex items-center gap-1 text-xs text-gray-500">
                                <Shield className="w-3 h-3" />
                                Encrypted
                              </div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{getTypeBadge(backup.type)}</TableCell>
                      <TableCell>{getStatusBadge(backup.status)}</TableCell>
                      <TableCell>{backup.size}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {backup.storage === "local" || backup.storage === "both" ? (
                            <Server className="w-4 h-4 text-gray-500" />
                          ) : null}
                          {backup.storage === "cloud" || backup.storage === "both" ? (
                            <Cloud className="w-4 h-4 text-blue-500" />
                          ) : null}
                        </div>
                      </TableCell>
                      <TableCell>{new Date(backup.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>{backup.duration || "-"}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="sm" disabled={backup.status !== "completed"}>
                            <Download className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            disabled={backup.status !== "completed"}
                            onClick={() => {
                              setSelectedBackup(backup)
                              setRestoreDialog(true)
                            }}
                          >
                            <RotateCcw className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-700"
                            onClick={() => {
                              setSelectedBackup(backup)
                              setDeleteDialog(true)
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
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

        <TabsContent value="schedules" className="mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Backup Schedules</CardTitle>
                <CardDescription>Configure automated backup schedules</CardDescription>
              </div>
              <Button
                onClick={() => {
                  setSelectedSchedule(null)
                  setNewSchedule({
                    name: "",
                    type: "full",
                    frequency: "daily",
                    time: "02:00",
                    dayOfWeek: 0,
                    dayOfMonth: 1,
                    retention: 30,
                    storage: "both",
                  })
                  setScheduleDialog(true)
                }}
              >
                <Calendar className="w-4 h-4 mr-2" />
                Add Schedule
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {schedules.map((schedule) => (
                  <div
                    key={schedule.id}
                    className={`p-4 border rounded-lg ${schedule.enabled ? "bg-white" : "bg-gray-50"}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Switch checked={schedule.enabled} onCheckedChange={() => handleToggleSchedule(schedule)} />
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">{schedule.name}</h4>
                            {getTypeBadge(schedule.type)}
                          </div>
                          <p className="text-sm text-gray-500 mt-1">
                            {schedule.frequency.charAt(0).toUpperCase() + schedule.frequency.slice(1)} at{" "}
                            {schedule.time}
                            {schedule.frequency === "weekly" &&
                              ` on ${["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][schedule.dayOfWeek || 0]}`}
                            {schedule.frequency === "monthly" && ` on day ${schedule.dayOfMonth}`}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <p className="text-xs text-gray-500">Next Run</p>
                          <p className="text-sm font-medium">{new Date(schedule.nextRun).toLocaleString()}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-500">Retention</p>
                          <p className="text-sm font-medium">{schedule.retention} days</p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedSchedule(schedule)
                              setNewSchedule({
                                name: schedule.name,
                                type: schedule.type,
                                frequency: schedule.frequency,
                                time: schedule.time,
                                dayOfWeek: schedule.dayOfWeek || 0,
                                dayOfMonth: schedule.dayOfMonth || 1,
                                retention: schedule.retention,
                                storage: schedule.storage,
                              })
                              setScheduleDialog(true)
                            }}
                          >
                            <Settings className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" disabled={!schedule.enabled}>
                            <Play className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="storage" className="mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Storage Locations</CardTitle>
                <CardDescription>Configure backup storage destinations</CardDescription>
              </div>
              <Button onClick={() => setStorageDialog(true)}>
                <Cloud className="w-4 h-4 mr-2" />
                Add Storage
              </Button>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {storageLocations.map((location) => (
                  <div
                    key={location.id}
                    className={`p-4 border rounded-lg ${location.enabled ? "bg-white" : "bg-gray-50"}`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        {location.type === "local" ? (
                          <Server className="w-5 h-5 text-gray-600" />
                        ) : location.type === "s3" ? (
                          <Cloud className="w-5 h-5 text-orange-500" />
                        ) : location.type === "gcs" ? (
                          <Cloud className="w-5 h-5 text-blue-500" />
                        ) : (
                          <Cloud className="w-5 h-5 text-cyan-500" />
                        )}
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">{location.name}</h4>
                            {location.isDefault && (
                              <Badge variant="outline" className="text-xs">
                                Default
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-gray-500">{location.path}</p>
                        </div>
                      </div>
                      <Switch checked={location.enabled} />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Used Space</span>
                        <span>
                          {location.usedSpace} / {location.totalSpace}
                        </span>
                      </div>
                      <Progress value={location.usagePercent} className="h-2" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="mt-4">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Backup Settings</CardTitle>
                <CardDescription>Configure global backup preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Default Retention Period (days)</Label>
                    <Input type="number" defaultValue={30} />
                  </div>
                  <div className="space-y-2">
                    <Label>Compression Level</Label>
                    <Select defaultValue="high">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Enable Encryption</Label>
                      <p className="text-sm text-gray-500">Encrypt all backups with AES-256</p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Verify Backup Integrity</Label>
                      <p className="text-sm text-gray-500">Check backup files after creation</p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Email Notifications</Label>
                      <p className="text-sm text-gray-500">Send alerts for backup status changes</p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Auto-cleanup Old Backups</Label>
                      <p className="text-sm text-gray-500">Automatically remove backups past retention</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Restore Settings</CardTitle>
                <CardDescription>Configure restore behavior</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Require Confirmation</Label>
                    <p className="text-sm text-gray-500">Two-step confirmation for restores</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Create Pre-restore Backup</Label>
                    <p className="text-sm text-gray-500">Automatically backup before restoring</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Maintenance Mode on Restore</Label>
                    <p className="text-sm text-gray-500">Enable maintenance mode during restore</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Create Backup Dialog */}
      <Dialog open={createBackupDialog} onOpenChange={setCreateBackupDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Backup</DialogTitle>
            <DialogDescription>Configure and start a new database backup</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Backup Name</Label>
              <Input
                placeholder="e.g., Manual Backup - Dec 2024"
                value={newBackup.name}
                onChange={(e) => setNewBackup({ ...newBackup, name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Backup Type</Label>
              <Select
                value={newBackup.type}
                onValueChange={(value: "full" | "incremental" | "differential") =>
                  setNewBackup({ ...newBackup, type: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="full">Full Backup</SelectItem>
                  <SelectItem value="incremental">Incremental</SelectItem>
                  <SelectItem value="differential">Differential</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Storage Location</Label>
              <Select
                value={newBackup.storage}
                onValueChange={(value: "local" | "cloud" | "both") => setNewBackup({ ...newBackup, storage: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="local">Local Only</SelectItem>
                  <SelectItem value="cloud">Cloud Only</SelectItem>
                  <SelectItem value="both">Both</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Collections to Backup</Label>
              <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto border rounded-lg p-2">
                {availableCollections.map((collection) => (
                  <div key={collection} className="flex items-center gap-2">
                    <Checkbox
                      checked={newBackup.collections.includes(collection)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setNewBackup({
                            ...newBackup,
                            collections: [...newBackup.collections, collection],
                          })
                        } else {
                          setNewBackup({
                            ...newBackup,
                            collections: newBackup.collections.filter((c) => c !== collection),
                          })
                        }
                      }}
                    />
                    <span className="text-sm capitalize">{collection}</span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-500">Leave empty to backup all collections</p>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Enable Encryption</Label>
                <p className="text-xs text-gray-500">AES-256 encryption</p>
              </div>
              <Switch
                checked={newBackup.encryption}
                onCheckedChange={(checked) => setNewBackup({ ...newBackup, encryption: checked })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateBackupDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateBackup} disabled={!newBackup.name}>
              <Database className="w-4 h-4 mr-2" />
              Start Backup
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Restore Dialog */}
      <Dialog open={restoreDialog} onOpenChange={setRestoreDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-orange-600">
              <AlertTriangle className="w-5 h-5" />
              Restore Backup
            </DialogTitle>
            <DialogDescription>
              This action will restore the database to the state captured in this backup. Current data will be
              overwritten.
            </DialogDescription>
          </DialogHeader>
          {selectedBackup && (
            <div className="py-4 space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-500">Backup Name</span>
                  <span className="font-medium">{selectedBackup.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Created</span>
                  <span>{new Date(selectedBackup.createdAt).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Size</span>
                  <span>{selectedBackup.size}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Collections</span>
                  <span>{selectedBackup.collections.length || "All"}</span>
                </div>
              </div>

              <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                <p className="text-sm text-orange-800">
                  <strong>Warning:</strong> A backup of the current database will be created before restoring. This
                  process may take several minutes.
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setRestoreDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleRestore}>
              <RotateCcw className="w-4 h-4 mr-2" />
              Restore Backup
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialog} onOpenChange={setDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <Trash2 className="w-5 h-5" />
              Delete Backup
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this backup? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {selectedBackup && (
            <div className="py-4">
              <div className="p-4 bg-gray-50 rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-500">Backup Name</span>
                  <span className="font-medium">{selectedBackup.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Size</span>
                  <span>{selectedBackup.size}</span>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteBackup}>
              Delete Backup
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Schedule Dialog */}
      <Dialog open={scheduleDialog} onOpenChange={setScheduleDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedSchedule ? "Edit Schedule" : "Create Schedule"}</DialogTitle>
            <DialogDescription>Configure automated backup schedule</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Schedule Name</Label>
              <Input
                placeholder="e.g., Daily Full Backup"
                value={newSchedule.name}
                onChange={(e) => setNewSchedule({ ...newSchedule, name: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Backup Type</Label>
                <Select
                  value={newSchedule.type}
                  onValueChange={(value: "full" | "incremental" | "differential") =>
                    setNewSchedule({ ...newSchedule, type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="full">Full</SelectItem>
                    <SelectItem value="incremental">Incremental</SelectItem>
                    <SelectItem value="differential">Differential</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Frequency</Label>
                <Select
                  value={newSchedule.frequency}
                  onValueChange={(value: "hourly" | "daily" | "weekly" | "monthly") =>
                    setNewSchedule({ ...newSchedule, frequency: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hourly">Hourly</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Time</Label>
                <Input
                  type="time"
                  value={newSchedule.time}
                  onChange={(e) => setNewSchedule({ ...newSchedule, time: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Retention (days)</Label>
                <Input
                  type="number"
                  value={newSchedule.retention}
                  onChange={(e) => setNewSchedule({ ...newSchedule, retention: Number.parseInt(e.target.value) })}
                />
              </div>
            </div>

            {newSchedule.frequency === "weekly" && (
              <div className="space-y-2">
                <Label>Day of Week</Label>
                <Select
                  value={newSchedule.dayOfWeek.toString()}
                  onValueChange={(value) => setNewSchedule({ ...newSchedule, dayOfWeek: Number.parseInt(value) })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].map((day, i) => (
                      <SelectItem key={i} value={i.toString()}>
                        {day}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {newSchedule.frequency === "monthly" && (
              <div className="space-y-2">
                <Label>Day of Month</Label>
                <Input
                  type="number"
                  min={1}
                  max={28}
                  value={newSchedule.dayOfMonth}
                  onChange={(e) => setNewSchedule({ ...newSchedule, dayOfMonth: Number.parseInt(e.target.value) })}
                />
              </div>
            )}

            <div className="space-y-2">
              <Label>Storage Location</Label>
              <Select
                value={newSchedule.storage}
                onValueChange={(value: "local" | "cloud" | "both") =>
                  setNewSchedule({ ...newSchedule, storage: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="local">Local Only</SelectItem>
                  <SelectItem value="cloud">Cloud Only</SelectItem>
                  <SelectItem value="both">Both</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setScheduleDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveSchedule} disabled={!newSchedule.name}>
              {selectedSchedule ? "Update Schedule" : "Create Schedule"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
