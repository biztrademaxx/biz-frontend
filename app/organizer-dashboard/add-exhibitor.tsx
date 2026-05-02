"use client"


import { devLog } from "@/lib/dev-log"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Building, Mail, Phone, MapPin, Globe, Linkedin, Twitter } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { apiFetch } from "@/lib/api"

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
  location?: string
  isAvailable: boolean
  maxBooths?: number
  bookedBooths: number
}

interface AddExhibitorProps {
  organizerId: string
}

export default function AddExhibitor({ organizerId }: AddExhibitorProps) {
  const [exhibitors, setExhibitors] = useState<Exhibitor[]>([])
  const [events, setEvents] = useState<Event[]>([])
  const [exhibitionSpaces, setExhibitionSpaces] = useState<ExhibitionSpace[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedExhibitor, setSelectedExhibitor] = useState<Exhibitor | null>(null)
  const [selectedEvent, setSelectedEvent] = useState("")
  const [selectedSpace, setSelectedSpace] = useState("")
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("existing")
  const { toast } = useToast()

  // New exhibitor form state
  const [newExhibitor, setNewExhibitor] = useState({
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

  // Booth details form state
  const [boothDetails, setBoothDetails] = useState({
    boothNumber: "",
    companyName: "",
    description: "",
    additionalPower: "",
    compressedAir: "",
    setupRequirements: "",
    specialRequests: "",
  })

  useEffect(() => {
    fetchExhibitors()
    fetchEvents()
  }, [])

  useEffect(() => {
    if (selectedEvent) {
      fetchExhibitionSpaces(selectedEvent)
    }
  }, [selectedEvent])

  const fetchExhibitors = async () => {
    try {
      const data = await apiFetch<{ exhibitors?: Exhibitor[] }>("/api/exhibitors")
      setExhibitors(data.exhibitors || [])
    } catch (error) {
      console.error("Error fetching exhibitors:", error)
      setExhibitors([])
    }
  }

  const fetchEvents = async () => {
    try {
      const data = await apiFetch<{ events?: Event[] }>(
        `/api/organizers/${organizerId}/events?page=1&limit=100`,
        { auth: true },
      )
      setEvents(data.events || [])
    } catch (error) {
      console.error("Error fetching events:", error)
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

  const filteredExhibitors = exhibitors.filter(
    (exhibitor) =>
      `${exhibitor.firstName} ${exhibitor.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exhibitor.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exhibitor.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exhibitor.businessEmail?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

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
    const powerCost = Number.parseFloat(boothDetails.additionalPower) * 50 || 0 // $50 per KW
    const airCost = Number.parseFloat(boothDetails.compressedAir) * 100 || 0 // $100 per HP

    return baseCost + powerCost + airCost
  }

  const handleAddExhibitorToEvent = async () => {
    devLog("[v0] Add Exhibitor button clicked")
    devLog("[v0] Selected exhibitor:", selectedExhibitor)
    devLog("[v0] Selected event:", selectedEvent)
    devLog("[v0] Selected space:", selectedSpace)
    devLog("[v0] Booth details:", boothDetails)

    if (
      !selectedExhibitor ||
      !selectedEvent ||
      !selectedSpace ||
      !boothDetails.boothNumber ||
      !boothDetails.companyName
    ) {
      devLog("[v0] Validation failed - missing required fields")
      toast({
        title: "Missing Information",
        description: "Please select an exhibitor, event, space, and fill in booth details.",
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
      await apiFetch(`/api/events/${selectedEvent}/exhibitors`, {
        method: "POST",
        body: payload,
      })
      toast({
        title: "Success",
        description: "Exhibitor added to event successfully.",
      })
      setSelectedExhibitor(null)
      setSelectedEvent("")
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

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="w-5 h-5" />
            Add Exhibitor to Event
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="existing">Select Existing Exhibitor</TabsTrigger>
              <TabsTrigger value="new">Create New Exhibitor</TabsTrigger>
            </TabsList>

            <TabsContent value="existing" className="space-y-6">
              {/* Search Exhibitors */}
              <div className="relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search exhibitors by name, email, or company..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Exhibitors List */}
              <div className="grid gap-4 max-h-96 overflow-y-auto">
                {filteredExhibitors.map((exhibitor) => (
                  <Card
                    key={exhibitor.id}
                    className={`cursor-pointer transition-colors ${
                      selectedExhibitor?.id === exhibitor.id ? "ring-2 ring-blue-500 bg-blue-50" : "hover:bg-gray-50"
                    }`}
                    onClick={() => setSelectedExhibitor(exhibitor)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <Avatar className="w-16 h-16">
                          <AvatarImage src={exhibitor.avatar || "/city/c4.jpg"} />
                          <AvatarFallback>
                            {exhibitor.firstName[0]}
                            {exhibitor.lastName[0]}
                          </AvatarFallback>
                        </Avatar>

                        <div className="flex-1 space-y-2">
                          <div>
                            <h3 className="text-lg font-semibold">
                              {exhibitor.firstName} {exhibitor.lastName}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {exhibitor.jobTitle} {exhibitor.company && `at ${exhibitor.company}`}
                            </p>
                          </div>

                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <div className="flex items-center gap-1">
                              <Mail className="w-3 h-3" />
                              {exhibitor.email}
                            </div>
                            {exhibitor.phone && (
                              <div className="flex items-center gap-1">
                                <Phone className="w-3 h-3" />
                                {exhibitor.phone}
                              </div>
                            )}
                            {exhibitor.location && (
                              <div className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {exhibitor.location}
                              </div>
                            )}
                          </div>

                          {exhibitor.bio && <p className="text-sm text-gray-600 line-clamp-2">{exhibitor.bio}</p>}

                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            {exhibitor.businessEmail && (
                              <div className="flex items-center gap-1">
                                <Building className="w-3 h-3" />
                                {exhibitor.businessEmail}
                              </div>
                            )}
                            {exhibitor.businessPhone && (
                              <div className="flex items-center gap-1">
                                <Phone className="w-3 h-3" />
                                {exhibitor.businessPhone}
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
                ))}
              </div>
            </TabsContent>

            <TabsContent value="new" className="space-y-6">
              {/* Create New Exhibitor Form */}
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

                <div className="flex justify-end">
                  <Button onClick={handleCreateExhibitor} disabled={loading}>
                    {loading ? "Creating..." : "Create Exhibitor"}
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {/* Booth Details Form */}
          {selectedExhibitor && (
            <Card className="border-blue-200 bg-blue-50 mt-6">
              <CardHeader>
                <CardTitle className="text-lg">
                  Booth Details for{" "}
                  {selectedExhibitor.company || `${selectedExhibitor.firstName} ${selectedExhibitor.lastName}`}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="event">Select Event *</Label>
                    <Select value={selectedEvent} onValueChange={setSelectedEvent}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose an event" />
                      </SelectTrigger>
                      <SelectContent>
                        {events.map((event) => (
                          <SelectItem key={event.id} value={event.id}>
                            {event.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="exhibitionSpace">Exhibition Space *</Label>
                    <Select value={selectedSpace} onValueChange={setSelectedSpace} disabled={!selectedEvent}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose exhibition space" />
                      </SelectTrigger>
                      <SelectContent>
                        {exhibitionSpaces.map((space) => (
                          <SelectItem key={space.id} value={space.id} disabled={!space.isAvailable}>
                            {space.name} - {space.spaceType} (${space.basePrice})
                            {!space.isAvailable && " - Unavailable"}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
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
                    <p className="text-xs text-gray-500 mt-1">$50 per KW</p>
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
                    <p className="text-xs text-gray-500 mt-1">$100 per HP</p>
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
                        <span>${exhibitionSpaces.find((s) => s.id === selectedSpace)?.basePrice || 0}</span>
                      </div>
                      {boothDetails.additionalPower && (
                        <div className="flex justify-between">
                          <span>Additional power ({boothDetails.additionalPower} KW)</span>
                          <span>${Number.parseFloat(boothDetails.additionalPower) * 50}</span>
                        </div>
                      )}
                      {boothDetails.compressedAir && (
                        <div className="flex justify-between">
                          <span>Compressed air ({boothDetails.compressedAir} HP)</span>
                          <span>${Number.parseFloat(boothDetails.compressedAir) * 100}</span>
                        </div>
                      )}
                      <div className="border-t pt-1 flex justify-between font-semibold">
                        <span>Total</span>
                        <span>${calculateTotalCost()}</span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex justify-end">
                  <Button onClick={handleAddExhibitorToEvent} disabled={loading}>
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
