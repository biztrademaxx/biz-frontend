"use client"

import type React from "react"

import { useState, useEffect, createElement } from "react"
import {
  Search,
  MoreVertical,
  Power,
  Settings,
  Users,
  Shield,
  Zap,
  AlertTriangle,
  RefreshCw,
  Eye,
  ToggleLeft,
  ToggleRight,
  Layers,
  Calendar,
  CreditCard,
  Ticket,
  Bell,
  MessageSquare,
  BarChart3,
  FileText,
  Building2,
  Mic,
  UserCheck,
  Megaphone,
  Video,
  Mail,
  Map,
  Globe,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { adminApi } from "@/lib/admin-api"

/** API returns Lucide icon names as strings; map to real components for JSX. */
const MODULE_ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Users,
  Calendar,
  CreditCard,
  Ticket,
  Bell,
  MessageSquare,
  BarChart3,
  FileText,
  Building2,
  Mic2: Mic,
  UserCheck,
  Megaphone,
  Video,
  Mail,
  Map,
  Shield,
  Globe,
  Settings,
}

function resolveModuleIcon(iconName: string): React.ComponentType<{ className?: string }> {
  return MODULE_ICON_MAP[iconName] ?? Layers
}

interface Module {
  id: string
  name: string
  description: string
  /** Lucide icon name from API (e.g. "Users"), not a component reference */
  icon: string
  category: string
  status: "active" | "inactive" | "maintenance"
  isCore: boolean
  version: string
  lastUpdated: string
  dependencies: string[]
  requiredBy: string[]
  settings: {
    key: string
    label: string
    value: boolean | string | number
    type: "toggle" | "text" | "number" | "select"
    options?: string[]
  }[]
  permissions: string[]
  usageStats: {
    activeUsers: number
    apiCalls: number
    lastAccessed: string
  }
}

export default function SettingsModulesPage() {
  const [modules, setModules] = useState<Module[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedModule, setSelectedModule] = useState<Module | null>(null)
  const [configDialogOpen, setConfigDialogOpen] = useState(false)
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false)
  const [confirmAction, setConfirmAction] = useState<{ module: Module; action: string } | null>(null)

  useEffect(() => {
    fetchModules()
  }, [])

  const fetchModules = async () => {
    try {
      setLoading(true)
      const res = await adminApi<{ success?: boolean; data?: { modules?: Module[] } }>("/settings/modules")
      const list = res.success !== false && res.data?.modules ? res.data.modules : []
      setModules(Array.isArray(list) ? list : [])
    } catch (error) {
      console.error("Error fetching modules:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleToggleModule = async (module: Module) => {
    if (module.isCore && module.status === "active") {
      setConfirmAction({ module, action: "disable" })
      setConfirmDialogOpen(true)
      return
    }

    await toggleModuleStatus(module)
  }

  const toggleModuleStatus = async (module: Module) => {
    try {
      const newStatus = module.status === "active" ? "inactive" : "active"
      await adminApi(`/settings/modules/${module.id}`, {
        method: "PATCH",
        body: { status: newStatus },
      })
      fetchModules()
    } catch (error) {
      console.error("Error toggling module:", error)
    }
  }

  const handleSaveConfig = async () => {
    if (!selectedModule) return

    try {
      await adminApi(`/settings/modules/${selectedModule.id}`, {
        method: "PATCH",
        body: { settings: selectedModule.settings },
      })
      setConfigDialogOpen(false)
      fetchModules()
    } catch (error) {
      console.error("Error saving config:", error)
    }
  }

  const categories = ["all", "Core", "Events", "Users", "Payments", "Communication", "Analytics", "Content"]

  const filteredModules = modules.filter((module) => {
    const matchesSearch =
      module.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      module.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = categoryFilter === "all" || module.category === categoryFilter
    const matchesStatus = statusFilter === "all" || module.status === statusFilter
    return matchesSearch && matchesCategory && matchesStatus
  })

  const stats = {
    total: modules.length,
    active: modules.filter((m) => m.status === "active").length,
    inactive: modules.filter((m) => m.status === "inactive").length,
    maintenance: modules.filter((m) => m.status === "maintenance").length,
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-700"
      case "inactive":
        return "bg-gray-100 text-gray-700"
      case "maintenance":
        return "bg-yellow-100 text-yellow-700"
      default:
        return "bg-gray-100 text-gray-700"
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Module Management</h1>
          <p className="text-gray-500 mt-1">Configure and manage platform modules and features</p>
        </div>
        <Button variant="outline" onClick={fetchModules}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Modules</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Layers className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Active</p>
                <p className="text-2xl font-bold text-green-600">{stats.active}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <Power className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Inactive</p>
                <p className="text-2xl font-bold text-gray-600">{stats.inactive}</p>
              </div>
              <div className="p-3 bg-gray-100 rounded-full">
                <ToggleLeft className="w-6 h-6 text-gray-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Maintenance</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.maintenance}</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-full">
                <AlertTriangle className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search modules..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category === "all" ? "All Categories" : category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Modules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredModules.map((module) => {
          const IconComponent = resolveModuleIcon(module.icon)
          return (
            <Card key={module.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${module.status === "active" ? "bg-blue-100" : "bg-gray-100"}`}>
                      <IconComponent
                        className={`w-5 h-5 ${module.status === "active" ? "text-blue-600" : "text-gray-500"}`}
                      />
                    </div>
                    <div>
                      <CardTitle className="text-base flex items-center gap-2">
                        {module.name}
                        {module.isCore && (
                          <Badge variant="outline" className="text-xs">
                            Core
                          </Badge>
                        )}
                      </CardTitle>
                      <CardDescription className="text-xs mt-1">{module.category}</CardDescription>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => {
                          setSelectedModule(module)
                          setConfigDialogOpen(true)
                        }}
                      >
                        <Settings className="w-4 h-4 mr-2" />
                        Configure
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => handleToggleModule(module)}
                        className={module.status === "active" ? "text-red-600" : "text-green-600"}
                      >
                        {module.status === "active" ? (
                          <>
                            <ToggleLeft className="w-4 h-4 mr-2" />
                            Disable
                          </>
                        ) : (
                          <>
                            <ToggleRight className="w-4 h-4 mr-2" />
                            Enable
                          </>
                        )}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">{module.description}</p>

                <div className="flex items-center justify-between mb-4">
                  <Badge className={getStatusColor(module.status)}>{module.status}</Badge>
                  <span className="text-xs text-gray-500">v{module.version}</span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs text-gray-500 mb-4">
                  <div className="flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    <span>{module.usageStats.activeUsers} users</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Zap className="w-3 h-3" />
                    <span>{module.usageStats.apiCalls.toLocaleString()} calls</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t">
                  <span className="text-xs text-gray-500">
                    Updated {new Date(module.lastUpdated).toLocaleDateString()}
                  </span>
                  <Switch checked={module.status === "active"} onCheckedChange={() => handleToggleModule(module)} />
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {filteredModules.length === 0 && (
        <Card>
          <CardContent className="py-12">
            <div className="text-center text-gray-500">
              <Layers className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">No modules found</p>
              <p className="text-sm">Try adjusting your search or filter criteria</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Configuration Dialog */}
      <Dialog open={configDialogOpen} onOpenChange={setConfigDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedModule && (
                <>
                  {createElement(resolveModuleIcon(selectedModule.icon), { className: "w-5 h-5" })}
                  Configure {selectedModule.name}
                </>
              )}
            </DialogTitle>
            <DialogDescription>Adjust module settings and permissions</DialogDescription>
          </DialogHeader>

          {selectedModule && (
            <Tabs defaultValue="settings" className="mt-4">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="settings">Settings</TabsTrigger>
                <TabsTrigger value="permissions">Permissions</TabsTrigger>
                <TabsTrigger value="dependencies">Dependencies</TabsTrigger>
              </TabsList>

              <TabsContent value="settings" className="space-y-4 mt-4">
                {selectedModule.settings.map((setting, index) => (
                  <div key={setting.key} className="flex items-center justify-between py-3 border-b">
                    <div>
                      <Label className="font-medium">{setting.label}</Label>
                      <p className="text-xs text-gray-500">{setting.key}</p>
                    </div>
                    {setting.type === "toggle" ? (
                      <Switch
                        checked={setting.value as boolean}
                        onCheckedChange={(checked) => {
                          const updatedSettings = [...selectedModule.settings]
                          updatedSettings[index].value = checked
                          setSelectedModule({ ...selectedModule, settings: updatedSettings })
                        }}
                      />
                    ) : setting.type === "select" ? (
                      <Select
                        value={setting.value as string}
                        onValueChange={(value) => {
                          const updatedSettings = [...selectedModule.settings]
                          updatedSettings[index].value = value
                          setSelectedModule({ ...selectedModule, settings: updatedSettings })
                        }}
                      >
                        <SelectTrigger className="w-[180px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {setting.options?.map((option) => (
                            <SelectItem key={option} value={option}>
                              {option}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input
                        type={setting.type}
                        value={setting.value as string}
                        onChange={(e) => {
                          const updatedSettings = [...selectedModule.settings]
                          updatedSettings[index].value = e.target.value
                          setSelectedModule({ ...selectedModule, settings: updatedSettings })
                        }}
                        className="w-[180px]"
                      />
                    )}
                  </div>
                ))}
              </TabsContent>

              <TabsContent value="permissions" className="mt-4">
                <div className="space-y-2">
                  {selectedModule.permissions.map((permission) => (
                    <div key={permission} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                      <Shield className="w-4 h-4 text-blue-600" />
                      <span className="text-sm">{permission}</span>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="dependencies" className="mt-4 space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Depends On</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedModule.dependencies.length > 0 ? (
                      selectedModule.dependencies.map((dep) => (
                        <Badge key={dep} variant="outline">
                          {dep}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-sm text-gray-500">No dependencies</span>
                    )}
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Required By</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedModule.requiredBy.length > 0 ? (
                      selectedModule.requiredBy.map((dep) => (
                        <Badge key={dep} variant="outline">
                          {dep}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-sm text-gray-500">Not required by other modules</span>
                    )}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setConfigDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveConfig}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirm Dialog */}
      <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-yellow-600">
              <AlertTriangle className="w-5 h-5" />
              Disable Core Module?
            </DialogTitle>
            <DialogDescription>
              {confirmAction?.module.name} is a core module. Disabling it may affect other parts of the platform. Are
              you sure you want to continue?
            </DialogDescription>
          </DialogHeader>

          {confirmAction && (
            <div className="py-4">
              <p className="text-sm text-gray-600 mb-2">The following modules depend on {confirmAction.module.name}:</p>
              <div className="flex flex-wrap gap-2">
                {confirmAction.module.requiredBy.map((dep) => (
                  <Badge key={dep} variant="outline" className="text-red-600">
                    {dep}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (confirmAction) {
                  toggleModuleStatus(confirmAction.module)
                }
                setConfirmDialogOpen(false)
              }}
            >
              Disable Anyway
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
