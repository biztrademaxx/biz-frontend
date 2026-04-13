"use client"

import { useState, useEffect } from "react"
import {
  Globe,
  Plus,
  Search,
  Edit,
  Trash2,
  Check,
  Upload,
  Download,
  Languages,
  Calendar,
  DollarSign,
  MoreHorizontal,
  RefreshCw,
  FileText,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { adminApi } from "@/lib/admin-api"

interface Language {
  id: string
  code: string
  name: string
  nativeName: string
  flag: string
  isDefault: boolean
  isEnabled: boolean
  translationProgress: number
  lastUpdated: string
  direction: "ltr" | "rtl"
}

interface Translation {
  id: string
  key: string
  category: string
  translations: Record<string, string>
  lastUpdated: string
}

interface LocaleSettings {
  defaultLanguage: string
  fallbackLanguage: string
  autoDetect: boolean
  showLanguageSwitcher: boolean
  dateFormat: string
  timeFormat: string
  timezone: string
  currency: string
  currencyPosition: "before" | "after"
  numberFormat: string
  firstDayOfWeek: number
}

const DEFAULT_LOCALE_SETTINGS: LocaleSettings = {
  defaultLanguage: "en",
  fallbackLanguage: "en",
  autoDetect: true,
  showLanguageSwitcher: true,
  dateFormat: "MM/DD/YYYY",
  timeFormat: "12h",
  timezone: "UTC",
  currency: "USD",
  currencyPosition: "before",
  numberFormat: "1,234.56",
  firstDayOfWeek: 0,
}

export default function SettingsLanguagePage() {
  const [languages, setLanguages] = useState<Language[]>([])
  const [translations, setTranslations] = useState<Translation[]>([])
  const [settings, setSettings] = useState<LocaleSettings>(DEFAULT_LOCALE_SETTINGS)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [showAddLanguageDialog, setShowAddLanguageDialog] = useState(false)
  const [showEditTranslationDialog, setShowEditTranslationDialog] = useState(false)
  const [selectedTranslation, setSelectedTranslation] = useState<Translation | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchLanguageSettings()
  }, [])

  const fetchLanguageSettings = async () => {
    try {
      const data = await adminApi<{
        languages?: Language[]
        translations?: Translation[]
        settings?: LocaleSettings
      }>("/settings/language")
      setLanguages(Array.isArray(data.languages) ? data.languages : [])
      setTranslations(Array.isArray(data.translations) ? data.translations : [])
      if (data.settings) setSettings(data.settings)
    } catch (error) {
      console.error("Error fetching language settings:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleToggleLanguage = async (languageId: string, enabled: boolean) => {
    try {
      await adminApi(`/settings/language/${languageId}`, {
        method: "PATCH",
        body: { isEnabled: enabled },
      })
      await fetchLanguageSettings()
    } catch (error) {
      console.error("Error toggling language:", error)
    }
  }

  const handleSetDefault = async (languageId: string) => {
    try {
      await adminApi(`/settings/language/${languageId}`, {
        method: "PATCH",
        body: { isDefault: true },
      })
      await fetchLanguageSettings()
    } catch (error) {
      console.error("Error setting default language:", error)
    }
  }

  const handleSaveSettings = async () => {
    setSaving(true)
    try {
      await adminApi("/settings/language", {
        method: "PATCH",
        body: settings,
      })
      await fetchLanguageSettings()
    } catch (error) {
      console.error("Error saving settings:", error)
    } finally {
      setSaving(false)
    }
  }

  const handleSaveTranslation = async () => {
    if (!selectedTranslation) return
    try {
      await adminApi(`/settings/language/translation/${selectedTranslation.id}`, {
        method: "PATCH",
        body: selectedTranslation,
      })
      await fetchLanguageSettings()
      setShowEditTranslationDialog(false)
    } catch (error) {
      console.error("Error saving translation:", error)
    }
  }

  const translationCategories = [
    { value: "all", label: "All Categories" },
    { value: "common", label: "Common" },
    { value: "auth", label: "Authentication" },
    { value: "events", label: "Events" },
    { value: "users", label: "Users" },
    { value: "navigation", label: "Navigation" },
    { value: "errors", label: "Errors" },
    { value: "notifications", label: "Notifications" },
  ]

  const filteredTranslations = (translations ?? []).filter((t) => {
    const values = t.translations && typeof t.translations === "object" ? Object.values(t.translations) : []
    const matchesSearch =
      (t.key ?? "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      values.some((v) => String(v).toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesCategory = selectedCategory === "all" || t.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const stats = {
    totalLanguages: languages.length,
    enabledLanguages: languages.filter((l) => l.isEnabled).length,
    totalTranslations: translations.length,
    avgProgress:
      languages.length > 0
        ? Math.round(languages.reduce((acc, l) => acc + l.translationProgress, 0) / languages.length)
        : 0,
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Language & Localization</h1>
          <p className="text-gray-600 mt-1">Manage supported languages, translations, and regional settings</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="gap-2 bg-transparent">
            <Download className="w-4 h-4" />
            Export
          </Button>
          <Button variant="outline" className="gap-2 bg-transparent">
            <Upload className="w-4 h-4" />
            Import
          </Button>
          <Button onClick={() => setShowAddLanguageDialog(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            Add Language
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Languages</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalLanguages}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Globe className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Enabled Languages</p>
                <p className="text-2xl font-bold text-green-600">{stats.enabledLanguages}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Check className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Translation Keys</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalTranslations}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Languages className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg. Completion</p>
                <p className="text-2xl font-bold text-gray-900">{stats.avgProgress}%</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="languages" className="space-y-4">
        <TabsList>
          <TabsTrigger value="languages">Languages</TabsTrigger>
          <TabsTrigger value="translations">Translations</TabsTrigger>
          <TabsTrigger value="regional">Regional Settings</TabsTrigger>
        </TabsList>

        {/* Languages Tab */}
        <TabsContent value="languages" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Supported Languages</CardTitle>
              <CardDescription>Manage the languages available on your platform</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Language</TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead>Direction</TableHead>
                    <TableHead>Translation Progress</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Updated</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {languages.map((language) => (
                    <TableRow key={language.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{language.flag}</span>
                          <div>
                            <p className="font-medium text-gray-900">{language.name}</p>
                            <p className="text-sm text-gray-500">{language.nativeName}</p>
                          </div>
                          {language.isDefault && (
                            <Badge variant="secondary" className="ml-2">
                              Default
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <code className="px-2 py-1 bg-gray-100 rounded text-sm">{language.code}</code>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{language.direction === "rtl" ? "RTL" : "LTR"}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="w-32">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm text-gray-600">{language.translationProgress}%</span>
                          </div>
                          <Progress value={language.translationProgress} className="h-2" />
                        </div>
                      </TableCell>
                      <TableCell>
                        <Switch
                          checked={language.isEnabled}
                          onCheckedChange={(checked) => handleToggleLanguage(language.id, checked)}
                          disabled={language.isDefault}
                        />
                      </TableCell>
                      <TableCell className="text-gray-500 text-sm">{language.lastUpdated}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Edit className="w-4 h-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleSetDefault(language.id)}>
                              <Check className="w-4 h-4 mr-2" />
                              Set as Default
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Download className="w-4 h-4 mr-2" />
                              Export Translations
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600" disabled={language.isDefault}>
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Translations Tab */}
        <TabsContent value="translations" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Translation Keys</CardTitle>
                  <CardDescription>Manage all translatable text strings</CardDescription>
                </div>
                <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                  <Plus className="w-4 h-4" />
                  Add Key
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Filters */}
              <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search translation keys..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {translationCategories.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Translations Table */}
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Key</TableHead>
                    <TableHead>Category</TableHead>
                    {languages
                      .filter((l) => l.isEnabled)
                      .slice(0, 3)
                      .map((lang) => (
                        <TableHead key={lang.code}>
                          <div className="flex items-center gap-2">
                            <span>{lang.flag}</span>
                            <span>{lang.code.toUpperCase()}</span>
                          </div>
                        </TableHead>
                      ))}
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTranslations.slice(0, 20).map((translation) => (
                    <TableRow key={translation.id}>
                      <TableCell>
                        <code className="text-sm text-blue-600">{translation.key}</code>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{translation.category}</Badge>
                      </TableCell>
                      {languages
                        .filter((l) => l.isEnabled)
                        .slice(0, 3)
                        .map((lang) => (
                          <TableCell key={lang.code} className="max-w-xs truncate text-sm text-gray-600">
                            {translation.translations[lang.code] || (
                              <span className="text-orange-500 italic">Missing</span>
                            )}
                          </TableCell>
                        ))}
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedTranslation(translation)
                            setShowEditTranslationDialog(true)
                          }}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Regional Settings Tab */}
        <TabsContent value="regional" className="space-y-4">
          {settings && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Date & Time Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Date & Time
                  </CardTitle>
                  <CardDescription>Configure date, time, and timezone formats</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Date Format</Label>
                    <Select
                      value={settings.dateFormat}
                      onValueChange={(value) => setSettings({ ...settings, dateFormat: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MM/DD/YYYY">MM/DD/YYYY (US)</SelectItem>
                        <SelectItem value="DD/MM/YYYY">DD/MM/YYYY (EU)</SelectItem>
                        <SelectItem value="YYYY-MM-DD">YYYY-MM-DD (ISO)</SelectItem>
                        <SelectItem value="DD.MM.YYYY">DD.MM.YYYY</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Time Format</Label>
                    <Select
                      value={settings.timeFormat}
                      onValueChange={(value) => setSettings({ ...settings, timeFormat: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="12h">12-hour (AM/PM)</SelectItem>
                        <SelectItem value="24h">24-hour</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Default Timezone</Label>
                    <Select
                      value={settings.timezone}
                      onValueChange={(value) => setSettings({ ...settings, timezone: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="UTC">UTC</SelectItem>
                        <SelectItem value="America/New_York">Eastern Time (ET)</SelectItem>
                        <SelectItem value="America/Chicago">Central Time (CT)</SelectItem>
                        <SelectItem value="America/Los_Angeles">Pacific Time (PT)</SelectItem>
                        <SelectItem value="Europe/London">London (GMT)</SelectItem>
                        <SelectItem value="Europe/Paris">Paris (CET)</SelectItem>
                        <SelectItem value="Asia/Tokyo">Tokyo (JST)</SelectItem>
                        <SelectItem value="Asia/Kolkata">India (IST)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>First Day of Week</Label>
                    <Select
                      value={settings.firstDayOfWeek.toString()}
                      onValueChange={(value) => setSettings({ ...settings, firstDayOfWeek: Number.parseInt(value) })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">Sunday</SelectItem>
                        <SelectItem value="1">Monday</SelectItem>
                        <SelectItem value="6">Saturday</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Currency & Number Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5" />
                    Currency & Numbers
                  </CardTitle>
                  <CardDescription>Configure currency and number formatting</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Default Currency</Label>
                    <Select
                      value={settings.currency}
                      onValueChange={(value) => setSettings({ ...settings, currency: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">USD ($)</SelectItem>
                        <SelectItem value="EUR">EUR (€)</SelectItem>
                        <SelectItem value="GBP">GBP (£)</SelectItem>
                        <SelectItem value="INR">INR (₹)</SelectItem>
                        <SelectItem value="JPY">JPY (¥)</SelectItem>
                        <SelectItem value="AUD">AUD (A$)</SelectItem>
                        <SelectItem value="CAD">CAD (C$)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Currency Symbol Position</Label>
                    <Select
                      value={settings.currencyPosition}
                      onValueChange={(value: "before" | "after") =>
                        setSettings({ ...settings, currencyPosition: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="before">Before amount ($100)</SelectItem>
                        <SelectItem value="after">After amount (100$)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Number Format</Label>
                    <Select
                      value={settings.numberFormat}
                      onValueChange={(value) => setSettings({ ...settings, numberFormat: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1,234.56">1,234.56 (US/UK)</SelectItem>
                        <SelectItem value="1.234,56">1.234,56 (EU)</SelectItem>
                        <SelectItem value="1 234,56">1 234,56 (FR)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Language Detection Settings */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="w-5 h-5" />
                    Language Detection
                  </CardTitle>
                  <CardDescription>Configure how the platform handles user language preferences</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label>Default Language</Label>
                      <Select
                        value={settings.defaultLanguage}
                        onValueChange={(value) => setSettings({ ...settings, defaultLanguage: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {languages
                            .filter((l) => l.isEnabled)
                            .map((lang) => (
                              <SelectItem key={lang.code} value={lang.code}>
                                <div className="flex items-center gap-2">
                                  <span>{lang.flag}</span>
                                  <span>{lang.name}</span>
                                </div>
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Fallback Language</Label>
                      <Select
                        value={settings.fallbackLanguage}
                        onValueChange={(value) => setSettings({ ...settings, fallbackLanguage: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {languages
                            .filter((l) => l.isEnabled)
                            .map((lang) => (
                              <SelectItem key={lang.code} value={lang.code}>
                                <div className="flex items-center gap-2">
                                  <span>{lang.flag}</span>
                                  <span>{lang.name}</span>
                                </div>
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">Auto-detect Language</p>
                      <p className="text-sm text-gray-500">Automatically detect user language from browser settings</p>
                    </div>
                    <Switch
                      checked={settings.autoDetect}
                      onCheckedChange={(checked) => setSettings({ ...settings, autoDetect: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">Show Language Switcher</p>
                      <p className="text-sm text-gray-500">Display language selector in the navigation</p>
                    </div>
                    <Switch
                      checked={settings.showLanguageSwitcher}
                      onCheckedChange={(checked) => setSettings({ ...settings, showLanguageSwitcher: checked })}
                    />
                  </div>

                  <div className="flex justify-end pt-4">
                    <Button onClick={handleSaveSettings} disabled={saving}>
                      {saving ? (
                        <>
                          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        "Save Settings"
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Add Language Dialog */}
      <Dialog open={showAddLanguageDialog} onOpenChange={setShowAddLanguageDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Language</DialogTitle>
            <DialogDescription>Add a new language to your platform</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Language</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="es">Spanish (Español)</SelectItem>
                  <SelectItem value="pt">Portuguese (Português)</SelectItem>
                  <SelectItem value="it">Italian (Italiano)</SelectItem>
                  <SelectItem value="nl">Dutch (Nederlands)</SelectItem>
                  <SelectItem value="pl">Polish (Polski)</SelectItem>
                  <SelectItem value="ru">Russian (Русский)</SelectItem>
                  <SelectItem value="ko">Korean (한국어)</SelectItem>
                  <SelectItem value="th">Thai (ไทย)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between">
              <Label>Enable immediately</Label>
              <Switch defaultChecked />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddLanguageDialog(false)}>
              Cancel
            </Button>
            <Button onClick={() => setShowAddLanguageDialog(false)}>Add Language</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Translation Dialog */}
      <Dialog open={showEditTranslationDialog} onOpenChange={setShowEditTranslationDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Translation</DialogTitle>
            <DialogDescription>
              {selectedTranslation && <code className="text-blue-600">{selectedTranslation.key}</code>}
            </DialogDescription>
          </DialogHeader>
          {selectedTranslation && (
            <div className="space-y-4 py-4 max-h-96 overflow-y-auto">
              {languages
                .filter((l) => l.isEnabled)
                .map((lang) => (
                  <div key={lang.code} className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <span>{lang.flag}</span>
                      <span>{lang.name}</span>
                    </Label>
                    <Textarea
                      value={selectedTranslation.translations[lang.code] || ""}
                      onChange={(e) =>
                        setSelectedTranslation({
                          ...selectedTranslation,
                          translations: {
                            ...selectedTranslation.translations,
                            [lang.code]: e.target.value,
                          },
                        })
                      }
                      rows={2}
                    />
                  </div>
                ))}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditTranslationDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveTranslation}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
