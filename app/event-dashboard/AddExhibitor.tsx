"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter, useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Building, Mail, Phone, MapPin, Globe, Linkedin, Twitter, AlertCircle, ArrowRight } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { apiFetch } from "@/lib/api"
import { cn } from "@/lib/utils"
import { getCountryOptions } from "@/lib/location-data"

const FILTER_ALL_COUNTRIES = "__all__"

interface Exhibitor {
  id: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  avatar?: string
  bio?: string
  company?: string
  jobTitle?: string
  location?: string
  profileCity?: string
  profileState?: string
  profileCountry?: string
  website?: string
  linkedin?: string
  twitter?: string
  businessEmail?: string
  businessPhone?: string
  businessAddress?: string
  taxId?: string
}

interface Event {
  id: string
  title: string
  startDate: string
  endDate: string
}

interface ExhibitionSpace {
  id: string
  name: string
  spaceType: string
  dimensions: string
  area: number
  basePrice: number
  currency?: string
  additionalPowerRate?: number
  compressedAirRate?: number
  location?: string
  isAvailable: boolean
  maxBooths?: number
  bookedBooths: number
}

interface AddExhibitorProps {
  eventId: string
}

export default function AddExhibitor({ eventId }: AddExhibitorProps) {
  const [exhibitors, setExhibitors] = useState<Exhibitor[]>([])
  const [exhibitionSpaces, setExhibitionSpaces] = useState<ExhibitionSpace[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [countryFilter, setCountryFilter] = useState(FILTER_ALL_COUNTRIES)
  const [selectedExhibitor, setSelectedExhibitor] = useState<Exhibitor | null>(null)
  const [selectedSpace, setSelectedSpace] = useState("")
  const [eventCurrency, setEventCurrency] = useState("")
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("existing")
  const [registeredExhibitors, setRegisteredExhibitors] = useState<Set<string>>(new Set())
  const { toast } = useToast()
  const router = useRouter()
  const routeParams = useParams()
  /** URL segment (slug preferred); keeps links on pretty path when APIs use UUID. */
  const dashboardPathSegment =
    typeof routeParams?.slug === "string" && routeParams.slug.trim() ? routeParams.slug : eventId

  const [newExhibitor, setNewExhibitor] = useState<Exhibitor>({
    id: "",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    bio: "",
    company: "",
    jobTitle: "",
    location: "",
    website: "",
    linkedin: "",
    twitter: "",
    businessEmail: "",
    businessPhone: "",
    businessAddress: "",
    taxId: "",
  })

  const [boothDetails, setBoothDetails] = useState({
    boothNumber: "",
    companyName: "",
    description: "",
    additionalPower: "",
    compressedAir: "",
    setupRequirements: "",
    specialRequests: "",
  })

  const selectedSpaceData = exhibitionSpaces.find((s) => s.id === selectedSpace)
  const normalizeCurrencyCode = (value?: string) => {
    const raw = String(value || "").trim()
    if (!raw) return ""
    const upper = raw.toUpperCase()

    const aliasMap: Record<string, string> = {
      "₹": "INR",
      INR: "INR",
      RUPEE: "INR",
      RUPEES: "INR",
      "INDIAN RUPEE": "INR",
      "$": "USD",
      USD: "USD",
      DOLLAR: "USD",
      DOLLARS: "USD",
      "US DOLLAR": "USD",
      "US DOLLARS": "USD",
      "€": "EUR",
      EUR: "EUR",
      EURO: "EUR",
      EUROS: "EUR",
      "£": "GBP",
      GBP: "GBP",
      POUND: "GBP",
      POUNDS: "GBP",
    }

    return aliasMap[upper] || upper
  }
  const selectedCurrencyCode =
    normalizeCurrencyCode(selectedSpaceData?.currency) ||
    normalizeCurrencyCode(eventCurrency) ||
    "USD"
  const selectedAdditionalPowerRate = selectedSpaceData?.additionalPowerRate ?? 50
  const selectedCompressedAirRate = selectedSpaceData?.compressedAirRate ?? 100

  const formatCurrency = (amount: number) => {
    try {
      return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: selectedCurrencyCode,
        maximumFractionDigits: 2,
      }).format(Number.isFinite(amount) ? amount : 0)
    } catch {
      const symbol =
        selectedCurrencyCode === "INR"
          ? "₹"
          : selectedCurrencyCode === "USD"
            ? "$"
            : selectedCurrencyCode === "EUR"
              ? "€"
              : selectedCurrencyCode === "GBP"
                ? "£"
                : ""
      return `${symbol}${Number.isFinite(amount) ? amount : 0}`
    }
  }

  useEffect(() => {
    fetchExhibitors()
    if (eventId) {
      fetchRegisteredExhibitors()
      fetchEventCurrency()
    }
  }, [eventId])

  useEffect(() => {
    if (eventId && selectedExhibitor) {
      fetchExhibitionSpaces(eventId)
    }
  }, [eventId, selectedExhibitor])

  // Reset dependent booth pricing selections when exhibitor changes.
  useEffect(() => {
    setSelectedSpace("")
    setBoothDetails((prev) => ({
      ...prev,
      additionalPower: "",
      compressedAir: "",
    }))
  }, [selectedExhibitor?.id])

  const fetchExhibitors = async () => {
    try {
      const data = await apiFetch<{ exhibitors?: Exhibitor[] }>("/api/exhibitors")
      setExhibitors(data.exhibitors || [])
    } catch (error) {
      console.error("Error fetching exhibitors:", error)
      setExhibitors([])
    }
  }

  const fetchExhibitionSpaces = async (eventId: string) => {
    try {
      const data = await apiFetch<{ exhibitionSpaces?: ExhibitionSpace[] }>(`/api/events/${eventId}/exhibition-spaces`)
      setExhibitionSpaces(data.exhibitionSpaces || [])
    } catch (error: unknown) {
      const err = error as { status?: number }
      if (err?.status !== 404) {
        console.error("Error fetching exhibition spaces:", error)
      }
      setExhibitionSpaces([])
    }
  }

  const fetchEventCurrency = async () => {
    try {
      const data = await apiFetch<{ currency?: string }>(`/api/events/${eventId}`, { auth: true })
      setEventCurrency(typeof data?.currency === "string" ? data.currency : "")
    } catch {
      setEventCurrency("")
    }
  }

  const fetchRegisteredExhibitors = async () => {
    try {
      const data = await apiFetch<{ success?: boolean; data?: { exhibitors?: { exhibitor?: { id: string } }[] } }>(
        `/api/events/${eventId}/exhibitors`
      )
      const list = data.data?.exhibitors ?? (data as any).exhibitors ?? (data as any).booths ?? []
      const exhibitorIds = new Set<string>(
        list.map((b: any) => b.exhibitor?.id ?? b.userId ?? b.exhibitorId).filter(Boolean)
      )
      setRegisteredExhibitors(exhibitorIds)
    } catch (error) {
      console.error("Error fetching registered exhibitors:", error)
      setRegisteredExhibitors(new Set())
    }
  }

  const countryOptions = useMemo(() => getCountryOptions(), [])

  const exhibitorCountryLabel = (exhibitor: Exhibitor) => {
    const fromProfile = (exhibitor.profileCountry || "").trim()
    if (fromProfile) return fromProfile
    const loc = (exhibitor.location || "").trim()
    if (!loc) return ""
    const segments = loc.split(",").map((s) => s.trim()).filter(Boolean)
    return segments.length > 0 ? segments[segments.length - 1] : loc
  }

  const exhibitorMatchesCountry = (exhibitor: Exhibitor, countryName: string) => {
    const target = countryName.trim().toLowerCase()
    if (!target) return true
    const country = exhibitorCountryLabel(exhibitor).toLowerCase()
    if (country === target || country.includes(target) || target.includes(country)) return true
    const loc = (exhibitor.location || "").toLowerCase()
    return loc.includes(target)
  }

  const selectedCountryName =
    countryFilter === FILTER_ALL_COUNTRIES
      ? ""
      : countryOptions.find((c) => c.code === countryFilter)?.name ?? ""

  const filteredExhibitors = exhibitors.filter((exhibitor) => {
    const matchesSearch =
      !searchTerm.trim() ||
      `${exhibitor.firstName} ${exhibitor.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exhibitor.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exhibitor.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exhibitor.businessEmail?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesCountry = exhibitorMatchesCountry(exhibitor, selectedCountryName)

    return matchesSearch && matchesCountry
  })

  const handleCreateExhibitor = async () => {
    if (!newExhibitor.firstName || !newExhibitor.lastName || !newExhibitor.email || !newExhibitor.company) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      const data = await apiFetch<{ exhibitor: Exhibitor }>("/api/exhibitors", {
        method: "POST",
        body: newExhibitor,
      })
      toast({
        title: "Success",
        description: "Exhibitor created successfully.",
      })
      setNewExhibitor({
        id: "",
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        bio: "",
        company: "",
        jobTitle: "",
        location: "",
        website: "",
        linkedin: "",
        twitter: "",
        businessEmail: "",
        businessPhone: "",
        businessAddress: "",
        taxId: "",
      })
      fetchExhibitors()
      setActiveTab("existing")
      setSelectedExhibitor(data.exhibitor)
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create exhibitor.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const calculateTotalCost = () => {
    const space = exhibitionSpaces.find((s) => s.id === selectedSpace)
    if (!space) return 0

    const baseCost = space.basePrice
    const powerRate = space.additionalPowerRate ?? 50
    const airRate = space.compressedAirRate ?? 100
    const powerCost = Number.parseFloat(boothDetails.additionalPower) * powerRate || 0
    const airCost = Number.parseFloat(boothDetails.compressedAir) * airRate || 0

    return baseCost + powerCost + airCost
  }

  const handleAddExhibitorToEvent = async () => {
    if (!selectedExhibitor || !selectedSpace || !boothDetails.boothNumber || !boothDetails.companyName) {
      toast({
        title: "Missing Information",
        description: "Please select an exhibitor, space, and fill in booth details.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      const payload = {
        exhibitorId: selectedExhibitor.id,
        spaceId: selectedSpace,
        boothNumber: boothDetails.boothNumber,
        companyName: boothDetails.companyName,
        description: boothDetails.description || undefined,
        additionalPower: Number(boothDetails.additionalPower) || 0,
        compressedAir: Number(boothDetails.compressedAir) || 0,
        setupRequirements: boothDetails.setupRequirements || undefined,
        specialRequests: boothDetails.specialRequests || undefined,
        totalCost: calculateTotalCost(),
      }
      await apiFetch(`/api/events/${eventId}/exhibitors`, {
        method: "POST",
        body: payload,
      })
      toast({
        title: "Success",
        description: "Exhibitor added to event successfully.",
      })
      fetchRegisteredExhibitors()
      setSelectedExhibitor(null)
      setSelectedSpace("")
      setBoothDetails({
        boothNumber: "",
        companyName: "",
        description: "",
        additionalPower: "",
        compressedAir: "",
        setupRequirements: "",
        specialRequests: "",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add exhibitor to event.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const isExhibitorRegistered = selectedExhibitor ? registeredExhibitors.has(selectedExhibitor.id) : false

  return (
    <div className="w-full min-w-0 max-w-full space-y-4 sm:space-y-6">
      <Card className="gap-0 py-0 min-w-0 overflow-hidden">
        <CardHeader className="px-4 sm:px-6">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Building className="w-5 h-5 shrink-0" />
            <span className="min-w-0">Add Exhibitor to Event</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 sm:px-6 min-w-0">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 sm:space-y-6 min-w-0">
            <TabsList className="flex h-auto w-full flex-col gap-2 bg-muted p-1 sm:grid sm:grid-cols-2 sm:gap-1">
              <TabsTrigger value="existing" className="w-full whitespace-normal px-3 py-2.5 text-xs sm:text-sm text-center leading-snug">
                Select Existing Exhibitor
              </TabsTrigger>
              <TabsTrigger value="new" className="w-full whitespace-normal px-3 py-2.5 text-xs sm:text-sm text-center leading-snug">
                Create New Exhibitor
              </TabsTrigger>
            </TabsList>

            <TabsContent value="existing" className="space-y-4 sm:space-y-6 min-w-0">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end min-w-0">
                <div className="relative min-w-0 flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search by name, email, or company..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-full min-w-0"
                  />
                </div>
                <div className="w-full sm:w-56 shrink-0 space-y-1">
                  <Label htmlFor="exhibitorCountryFilter" className="text-xs text-muted-foreground">
                    Country
                  </Label>
                  <Select value={countryFilter} onValueChange={setCountryFilter}>
                    <SelectTrigger id="exhibitorCountryFilter" className="w-full">
                      <SelectValue placeholder="All countries" />
                    </SelectTrigger>
                    <SelectContent className="max-h-[280px]">
                      <SelectItem value={FILTER_ALL_COUNTRIES}>All countries</SelectItem>
                      {countryOptions.map((country) => (
                        <SelectItem key={country.code} value={country.code}>
                          {country.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <p className="text-xs text-muted-foreground">
                Showing {filteredExhibitors.length} of {exhibitors.length} exhibitors
              </p>

              <div className="grid gap-3 sm:gap-4 min-h-[28rem] max-h-[min(70vh,48rem)] overflow-y-auto min-w-0 pr-1">
                {filteredExhibitors.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center text-gray-500">
                    <MapPin className="h-10 w-10 text-gray-300 mb-3" />
                    <p className="font-medium text-gray-700">No exhibitors match your filters</p>
                    <p className="text-sm mt-1">Try a different search term or country.</p>
                  </div>
                ) : (
                filteredExhibitors.map((exhibitor) => {
                  const isRegistered = registeredExhibitors.has(exhibitor.id)

                  return (
                    <Card
                      key={exhibitor.id}
                      className={cn(
                        "cursor-pointer transition-colors min-w-0 overflow-hidden gap-0 py-0",
                        selectedExhibitor?.id === exhibitor.id
                          ? "ring-2 ring-blue-500 bg-blue-50"
                          : isRegistered
                            ? "opacity-50 cursor-not-allowed"
                            : "hover:bg-gray-50",
                      )}
                      onClick={() => !isRegistered && setSelectedExhibitor(exhibitor)}
                    >
                      <CardContent className="p-3 sm:p-4 min-w-0">
                        {isRegistered && (
                          <div className="mb-2">
                            <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded">
                              <AlertCircle className="w-3 h-3" />
                              Already Registered
                            </span>
                          </div>
                        )}
                        <div className="flex items-start gap-3 sm:gap-4 min-w-0">
                          <Avatar className="w-12 h-12 sm:w-16 sm:h-16 shrink-0">
                            <AvatarImage src={exhibitor.avatar } />
                            <AvatarFallback>
                              {exhibitor.firstName[0]}
                              {exhibitor.lastName[0]}
                            </AvatarFallback>
                          </Avatar>

                          <div className="flex-1 min-w-0 space-y-2">
                            <div className="min-w-0">
                              <h3 className="text-base sm:text-lg font-semibold break-words">
                                {exhibitor.firstName} {exhibitor.lastName}
                              </h3>
                              <p className="text-sm text-gray-600 break-words">
                                {exhibitor.jobTitle} {exhibitor.company && `at ${exhibitor.company}`}
                              </p>
                            </div>

                            <div className="flex flex-col gap-1.5 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-4 sm:gap-y-1 text-sm text-gray-500">
                              <div className="flex items-start gap-1 min-w-0">
                                <Mail className="w-3 h-3 shrink-0 mt-0.5" />
                                <span className="break-all">{exhibitor.email}</span>
                              </div>
                              {exhibitor.phone && (
                                <div className="flex items-center gap-1 min-w-0">
                                  <Phone className="w-3 h-3 shrink-0" />
                                  <span className="break-words">{exhibitor.phone}</span>
                                </div>
                              )}
                              {exhibitor.location && (
                                <div className="flex items-start gap-1 min-w-0">
                                  <MapPin className="w-3 h-3 shrink-0 mt-0.5" />
                                  <span className="break-words">{exhibitor.location}</span>
                                </div>
                              )}
                            </div>

                            {exhibitor.bio && <p className="text-sm text-gray-600 line-clamp-2 break-words">{exhibitor.bio}</p>}

                            <div className="flex flex-col gap-1.5 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-4 text-sm text-gray-500">
                              {exhibitor.businessEmail && (
                                <div className="flex items-start gap-1 min-w-0">
                                  <Building className="w-3 h-3 shrink-0 mt-0.5" />
                                  <span className="break-all">{exhibitor.businessEmail}</span>
                                </div>
                              )}
                              {exhibitor.businessPhone && (
                                <div className="flex items-center gap-1 min-w-0">
                                  <Phone className="w-3 h-3 shrink-0" />
                                  <span className="break-words">{exhibitor.businessPhone}</span>
                                </div>
                              )}
                            </div>

                            <div className="flex items-center gap-2">
                              {exhibitor.website && (
                                <Button variant="ghost" size="sm" className="h-6 px-2">
                                  <Globe className="w-3 h-3" />
                                </Button>
                              )}
                              {exhibitor.linkedin && (
                                <Button variant="ghost" size="sm" className="h-6 px-2">
                                  <Linkedin className="w-3 h-3" />
                                </Button>
                              )}
                              {exhibitor.twitter && (
                                <Button variant="ghost" size="sm" className="h-6 px-2">
                                  <Twitter className="w-3 h-3" />
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })
                )}
              </div>
            </TabsContent>

            <TabsContent value="new" className="space-y-6">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Personal Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">First Name *</Label>
                      <Input
                        id="firstName"
                        value={newExhibitor.firstName}
                        onChange={(e) => setNewExhibitor({ ...newExhibitor, firstName: e.target.value })}
                        placeholder="John"
                      />
                    </div>

                    <div>
                      <Label htmlFor="lastName">Last Name *</Label>
                      <Input
                        id="lastName"
                        value={newExhibitor.lastName}
                        onChange={(e) => setNewExhibitor({ ...newExhibitor, lastName: e.target.value })}
                        placeholder="Doe"
                      />
                    </div>

                    <div>
                      <Label htmlFor="email">Personal Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={newExhibitor.email}
                        onChange={(e) => setNewExhibitor({ ...newExhibitor, email: e.target.value })}
                        placeholder="john.doe@example.com"
                      />
                    </div>

                    <div>
                      <Label htmlFor="phone">Personal Phone</Label>
                      <Input
                        id="phone"
                        value={newExhibitor.phone}
                        onChange={(e) => setNewExhibitor({ ...newExhibitor, phone: e.target.value })}
                        placeholder="+1 (555) 123-4567"
                      />
                    </div>

                    <div>
                      <Label htmlFor="jobTitle">Job Title</Label>
                      <Input
                        id="jobTitle"
                        value={newExhibitor.jobTitle}
                        onChange={(e) => setNewExhibitor({ ...newExhibitor, jobTitle: e.target.value })}
                        placeholder="Sales Manager"
                      />
                    </div>

                    <div>
                      <Label htmlFor="location">Location</Label>
                      <Input
                        id="location"
                        value={newExhibitor.location}
                        onChange={(e) => setNewExhibitor({ ...newExhibitor, location: e.target.value })}
                        placeholder="San Francisco, CA"
                      />
                    </div>
                  </div>

                  <div className="mt-4">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      value={newExhibitor.bio}
                      onChange={(e) => setNewExhibitor({ ...newExhibitor, bio: e.target.value })}
                      placeholder="Brief biography and background..."
                      rows={3}
                    />
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4">Business Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="company">Company Name *</Label>
                      <Input
                        id="company"
                        value={newExhibitor.company}
                        onChange={(e) => setNewExhibitor({ ...newExhibitor, company: e.target.value })}
                        placeholder="Tech Corp Inc."
                      />
                    </div>

                    <div>
                      <Label htmlFor="businessEmail">Business Email</Label>
                      <Input
                        id="businessEmail"
                        type="email"
                        value={newExhibitor.businessEmail}
                        onChange={(e) => setNewExhibitor({ ...newExhibitor, businessEmail: e.target.value })}
                        placeholder="contact@techcorp.com"
                      />
                    </div>

                    <div>
                      <Label htmlFor="businessPhone">Business Phone</Label>
                      <Input
                        id="businessPhone"
                        value={newExhibitor.businessPhone}
                        onChange={(e) => setNewExhibitor({ ...newExhibitor, businessPhone: e.target.value })}
                        placeholder="+1 (555) 987-6543"
                      />
                    </div>

                    <div>
                      <Label htmlFor="taxId">Tax ID</Label>
                      <Input
                        id="taxId"
                        value={newExhibitor.taxId}
                        onChange={(e) => setNewExhibitor({ ...newExhibitor, taxId: e.target.value })}
                        placeholder="12-3456789"
                      />
                    </div>

                    <div>
                      <Label htmlFor="website">Website</Label>
                      <Input
                        id="website"
                        value={newExhibitor.website}
                        onChange={(e) => setNewExhibitor({ ...newExhibitor, website: e.target.value })}
                        placeholder="https://techcorp.com"
                      />
                    </div>

                    <div>
                      <Label htmlFor="linkedin">LinkedIn</Label>
                      <Input
                        id="linkedin"
                        value={newExhibitor.linkedin}
                        onChange={(e) => setNewExhibitor({ ...newExhibitor, linkedin: e.target.value })}
                        placeholder="https://linkedin.com/company/techcorp"
                      />
                    </div>
                  </div>

                  <div className="mt-4">
                    <Label htmlFor="businessAddress">Business Address</Label>
                    <Textarea
                      id="businessAddress"
                      value={newExhibitor.businessAddress}
                      onChange={(e) => setNewExhibitor({ ...newExhibitor, businessAddress: e.target.value })}
                      placeholder="123 Business St, Suite 100, City, State 12345"
                      rows={3}
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
                  <Button onClick={handleCreateExhibitor} disabled={loading} className="w-full sm:w-auto">
                    {loading ? "Creating..." : "Create Exhibitor"}
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {selectedExhibitor && (
            <Card className="border-blue-200 bg-blue-50/50 dark:bg-blue-950/20 dark:border-blue-800 mt-4 sm:mt-6 gap-0 py-0 min-w-0 overflow-hidden">
              <CardHeader className="px-4 sm:px-6">
                <CardTitle className="text-base sm:text-lg break-words leading-snug">
                  Booth Details for{" "}
                  {selectedExhibitor.company || `${selectedExhibitor.firstName} ${selectedExhibitor.lastName}`}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 sm:space-y-6 px-4 sm:px-6 min-w-0">
                {isExhibitorRegistered && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Already Registered</AlertTitle>
                    <AlertDescription>
                      This exhibitor is already registered for this event. Please select a different exhibitor.
                    </AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="exhibitionSpace" className="text-sm font-medium">
                    Exhibition Space *
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Select the space type and location for this exhibitor&apos;s booth.
                  </p>
                  <Select value={selectedSpace} onValueChange={setSelectedSpace} disabled={isExhibitorRegistered}>
                    <SelectTrigger
                      id="exhibitionSpace"
                      className="w-full min-h-10 h-auto py-2.5 text-left"
                    >
                      <SelectValue placeholder="Choose exhibition space" />
                    </SelectTrigger>
                    <SelectContent className="max-h-[280px]" sideOffset={4}>
                      {exhibitionSpaces.length === 0 ? (
                        <div className="py-6 px-4 space-y-3">
                          <p className="text-sm text-muted-foreground text-center">
                            No exhibition spaces yet. Create them in Event Info → Space Cost.
                          </p>
                          <Button
                            type="button"
                            variant="outline"
                            className="w-full h-auto min-h-9 whitespace-normal py-2 text-center leading-snug"
                            onClick={() => router.push(`/event-dashboard/${dashboardPathSegment}?tab=space-cost`)}
                          >
                            <span className="break-words">Go to Event Info → Space Cost</span>
                            <ArrowRight className="ml-2 h-4 w-4 shrink-0" />
                          </Button>
                        </div>
                      ) : (
                        exhibitionSpaces.map((space) => (
                          <SelectItem
                            key={space.id}
                            value={space.id}
                            disabled={!space.isAvailable}
                            className="py-2.5"
                          >
                            <span className="block truncate">
                              {space.name} — {space.spaceType} · {formatCurrency(space.basePrice)}
                              {!space.isAvailable && " · Unavailable"}
                            </span>
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  {exhibitionSpaces.length === 0 && (
                    <div className="mt-3 p-3 sm:p-4 rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-800 space-y-3 min-w-0 overflow-hidden">
                      <p className="text-sm text-amber-800 dark:text-amber-200 break-words">
                        No exhibition spaces yet. Add them in <strong>Event Info</strong> → <strong>Space Cost</strong> tab, then return here to assign a space.
                      </p>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="w-full h-auto min-h-9 whitespace-normal py-2 text-center leading-snug"
                        onClick={() => router.push(`/event-dashboard/${dashboardPathSegment}?tab=space-cost`)}
                      >
                        <span className="break-words">Go to Event Info → Space Cost</span>
                        <ArrowRight className="ml-2 h-4 w-4 shrink-0" />
                      </Button>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="boothNumber">Booth Number *</Label>
                    <Input
                      id="boothNumber"
                      value={boothDetails.boothNumber}
                      onChange={(e) => setBoothDetails({ ...boothDetails, boothNumber: e.target.value })}
                      placeholder="A-101"
                    />
                  </div>

                  <div>
                    <Label htmlFor="companyName">Company Display Name *</Label>
                    <Input
                      id="companyName"
                      value={boothDetails.companyName}
                      onChange={(e) => setBoothDetails({ ...boothDetails, companyName: e.target.value })}
                      placeholder="Tech Corp Inc."
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Booth Description</Label>
                  <Textarea
                    id="description"
                    value={boothDetails.description}
                    onChange={(e) => setBoothDetails({ ...boothDetails, description: e.target.value })}
                    placeholder="Description of products/services to be showcased..."
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="additionalPower">Additional Power (KW)</Label>
                    <Input
                      id="additionalPower"
                      type="number"
                      step="0.1"
                      value={boothDetails.additionalPower}
                      onChange={(e) => setBoothDetails({ ...boothDetails, additionalPower: e.target.value })}
                      placeholder="0"
                    />
                    <p className="text-xs text-gray-500 mt-1">{formatCurrency(selectedAdditionalPowerRate)} per KW</p>
                  </div>

                  <div>
                    <Label htmlFor="compressedAir">Compressed Air (HP)</Label>
                    <Input
                      id="compressedAir"
                      type="number"
                      step="0.1"
                      value={boothDetails.compressedAir}
                      onChange={(e) => setBoothDetails({ ...boothDetails, compressedAir: e.target.value })}
                      placeholder="0"
                    />
                    <p className="text-xs text-gray-500 mt-1">{formatCurrency(selectedCompressedAirRate)} per HP</p>
                  </div>
                </div>

                <div>
                  <Label htmlFor="setupRequirements">Setup Requirements</Label>
                  <Textarea
                    id="setupRequirements"
                    value={boothDetails.setupRequirements}
                    onChange={(e) => setBoothDetails({ ...boothDetails, setupRequirements: e.target.value })}
                    placeholder="Special setup requirements, equipment needs, etc."
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="specialRequests">Special Requests</Label>
                  <Textarea
                    id="specialRequests"
                    value={boothDetails.specialRequests}
                    onChange={(e) => setBoothDetails({ ...boothDetails, specialRequests: e.target.value })}
                    placeholder="Any special requests or accommodations needed..."
                    rows={3}
                  />
                </div>
                {selectedSpace && (
                  <div className="p-4 bg-white rounded-lg border">
                    <h4 className="font-semibold mb-2">Cost Summary</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>Base space cost</span>
                        <span>{formatCurrency(selectedSpaceData?.basePrice || 0)}</span>
                      </div>
                      {boothDetails.additionalPower && (
                        <div className="flex justify-between">
                          <span>Additional power ({boothDetails.additionalPower} KW)</span>
                          <span>{formatCurrency(Number.parseFloat(boothDetails.additionalPower) * selectedAdditionalPowerRate)}</span>
                        </div>
                      )}
                      {boothDetails.compressedAir && (
                        <div className="flex justify-between">
                          <span>Compressed air ({boothDetails.compressedAir} HP)</span>
                          <span>{formatCurrency(Number.parseFloat(boothDetails.compressedAir) * selectedCompressedAirRate)}</span>
                        </div>
                      )}
                      <div className="border-t pt-1 flex justify-between font-semibold">
                        <span>Total</span>
                        <span>{formatCurrency(calculateTotalCost())}</span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                  <Button
                    onClick={handleAddExhibitorToEvent}
                    disabled={loading || isExhibitorRegistered}
                    className="w-full sm:w-auto"
                  >
                    {loading ? "Adding..." : "Add Exhibitor to Event"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
