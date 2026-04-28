"use client"


import { devLog } from "@/lib/dev-log"

import { useState, useEffect } from "react"
import { apiFetch } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Search, Plus, X, Building, Users } from "lucide-react"
import type { ExhibitorBooth } from "./types"

interface Exhibitor {
  id: string
  companyName: string
  contactPerson: string
  email: string
  phone: string
  website: string
  industry: string
  location: string
  description: string
  avatar?: string
}

interface SelectExhibitorsProps {
  exhibitorBooths: ExhibitorBooth[]
  onExhibitorBoothsChange: (booths: ExhibitorBooth[]) => void
}

export function SelectExhibitors({ exhibitorBooths, onExhibitorBoothsChange }: SelectExhibitorsProps) {
  const [exhibitors, setExhibitors] = useState<Exhibitor[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newExhibitor, setNewExhibitor] = useState({
    companyName: "",
    contactPerson: "",
    email: "",
    phone: "",
    website: "",
    industry: "",
    location: "",
    description: ""
  })
  const [newBooth, setNewBooth] = useState<ExhibitorBooth>({
    exhibitorId: "",
    boothNumber: "",
    spaceType: "STANDARD",
    // specialRequirements: [],
    // notes: "",
    totalCost: 0
  })
  const [newRequirement, setNewRequirement] = useState("")

  useEffect(() => {
    fetchExhibitors()
  }, [])

  const fetchExhibitors = async () => {
    try {
      setIsLoading(true)
      const data = await apiFetch<{ data?: Array<{ id: string; name?: string; firstName?: string; lastName?: string; email?: string; company?: string; phone?: string; industry?: string; location?: string; description?: string }>; exhibitors?: Exhibitor[] }>(
        "/api/admin/exhibitors?limit=500",
        { auth: true }
      )
      const raw = Array.isArray(data?.data) ? data.data : data?.exhibitors ?? []
      const list: Exhibitor[] = raw.map((u: any) => ({
        id: u.id,
        companyName: u.company ?? u.companyName ?? "",
        contactPerson: (u.name ?? [u.firstName, u.lastName].filter(Boolean).join(" ").trim()) || "—",
        email: u.email ?? "",
        phone: u.phone ?? "",
        website: u.website ?? "",
        industry: u.industry ?? u.companyIndustry ?? "",
        location: u.location ?? "",
        description: u.description ?? "",
        avatar: u.avatar,
      }))
      setExhibitors(list)
    } catch (error) {
      console.error("Error fetching exhibitors:", error)
      setExhibitors([])
    } finally {
      setIsLoading(false)
    }
  }

  const filteredExhibitors = exhibitors.filter((exhibitor) => {
    const q = searchTerm.toLowerCase()
    return (
      (exhibitor.companyName ?? "").toLowerCase().includes(q) ||
      (exhibitor.contactPerson ?? "").toLowerCase().includes(q) ||
      (exhibitor.email ?? "").toLowerCase().includes(q) ||
      (exhibitor.industry ?? "").toLowerCase().includes(q)
    )
  })

 const handleCreateExhibitor = async () => {
  if (!newExhibitor.companyName || !newExhibitor.contactPerson || !newExhibitor.email) {
    alert("Please fill in all required fields")
    return
  }

  try {
    // Extract first and last name from contactPerson
    const [firstName, ...lastNameParts] = newExhibitor.contactPerson.split(' ')
    const lastName = lastNameParts.join(' ') || "Exhibitor"
    
    // Prepare data according to API requirements
    const exhibitorData = {
      firstName: firstName || "Exhibitor",
      lastName: lastName,
      email: newExhibitor.email,
      phone: newExhibitor.phone || "",
      company: newExhibitor.companyName,
      jobTitle: "Contact Person", // Default value
      bio: newExhibitor.description || "",
      location: newExhibitor.location || "",
      website: newExhibitor.website || "",
      companyIndustry: newExhibitor.industry || "Other",
      // Optional fields with default values
      linkedin: "",
      twitter: "",
      businessEmail: newExhibitor.email,
      businessPhone: newExhibitor.phone || "",
      businessAddress: newExhibitor.location || "",
      taxId: "",
      isVerified: false,
      isActive: true,
    }

    devLog("Sending exhibitor data:", exhibitorData)

    const response = await fetch('/api/admin/exhibitors', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(exhibitorData),
    })

    const data = await response.json()
    
    if (response.ok) {
      setNewBooth(prev => ({ ...prev, exhibitorId: data.exhibitor.id }))
      setShowCreateForm(false)
      setNewExhibitor({
        companyName: "",
        contactPerson: "",
        email: "",
        phone: "",
        website: "",
        industry: "",
        location: "",
        description: ""
      })
      fetchExhibitors()
      alert(data?.message ?? "Exhibitor created successfully!")
    } else {
      alert(`Error creating exhibitor: ${(data as { error?: string; message?: string })?.error ?? (data as { message?: string })?.message ?? "Unknown error"}`)
    }
  } catch (error) {
    console.error("Error creating exhibitor:", error)
    alert("Error creating exhibitor. Please try again.")
  }
}

  const handleAddRequirement = () => {
    if (newRequirement.trim()) {
      setNewBooth(prev => ({
        ...prev,
        // specialRequirements: [...prev.specialRequirements, newRequirement.trim()]
      }))
      setNewRequirement("")
    }
  }

  const handleRemoveRequirement = (index: number) => {
    setNewBooth(prev => ({
      ...prev,
    //   specialRequirements: prev.specialRequirements.filter((_, i) => i !== index)
    }))
  }

  const handleAddBooth = () => {
    if (!newBooth.exhibitorId || !newBooth.boothNumber) {
      alert("Please fill in all required booth fields")
      return
    }

    onExhibitorBoothsChange([...exhibitorBooths, newBooth])
    setNewBooth({
      exhibitorId: "",
      boothNumber: "",
      spaceType: "STANDARD",
    //   specialRequirements: [],
    //   notes: "",
      totalCost: 0
    })
  }

  const handleRemoveBooth = (index: number) => {
    onExhibitorBoothsChange(exhibitorBooths.filter((_, i) => i !== index))
  }

  const getExhibitorName = (exhibitorId: string) => {
    const exhibitor = exhibitors.find(e => e.id === exhibitorId)
    return exhibitor ? exhibitor.companyName : "Unknown Exhibitor"
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building className="w-5 h-5" />
          Exhibitor Booths
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Add exhibitors and their booth assignments to your event
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Add New Booth */}
        <div className="p-4 border rounded-lg space-y-4">
          <h4 className="font-medium">Add Exhibitor Booth</h4>
          
          {/* Exhibitor Selection */}
          <div className="space-y-3">
            <Label>Select Exhibitor *</Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search exhibitors..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Button
                variant="outline"
                onClick={() => setShowCreateForm(!showCreateForm)}
              >
                <Plus className="w-4 h-4 mr-2" />
                New Exhibitor
              </Button>
            </div>

            {!showCreateForm && (
              <Select 
                value={newBooth.exhibitorId} 
                onValueChange={(value) => setNewBooth(prev => ({ ...prev, exhibitorId: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select an exhibitor" />
                </SelectTrigger>
                <SelectContent>
                  {isLoading ? (
                    <SelectItem value="loading" disabled>Loading...</SelectItem>
                  ) : filteredExhibitors.length === 0 ? (
                    <SelectItem value="no-results" disabled>No exhibitors found</SelectItem>
                  ) : (
                    filteredExhibitors.map((exhibitor) => (
                      <SelectItem key={exhibitor.id} value={exhibitor.id}>
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          <div>
                            <div className="font-medium">{exhibitor.companyName}</div>
                            <div className="text-xs text-muted-foreground">
                              {exhibitor.contactPerson} • {exhibitor.industry}
                            </div>
                          </div>
                        </div>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            )}

            {/* Create New Exhibitor Form */}
            {showCreateForm && (
              <div className="p-4 border rounded-lg space-y-4">
                <h5 className="font-medium">Create New Exhibitor</h5>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <Label htmlFor="companyName">Company Name *</Label>
                    <Input
                      id="companyName"
                      value={newExhibitor.companyName}
                      onChange={(e) => setNewExhibitor(prev => ({ ...prev, companyName: e.target.value }))}
                      placeholder="Tech Corp Inc."
                    />
                  </div>
                  <div>
                    <Label htmlFor="contactPerson">Contact Person *</Label>
                    <Input
                      id="contactPerson"
                      value={newExhibitor.contactPerson}
                      onChange={(e) => setNewExhibitor(prev => ({ ...prev, contactPerson: e.target.value }))}
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <Label htmlFor="exhibitorEmail">Email *</Label>
                    <Input
                      id="exhibitorEmail"
                      type="email"
                      value={newExhibitor.email}
                      onChange={(e) => setNewExhibitor(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="john@techcorp.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="exhibitorPhone">Phone</Label>
                    <Input
                      id="exhibitorPhone"
                      value={newExhibitor.phone}
                      onChange={(e) => setNewExhibitor(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                  <div>
                    <Label htmlFor="exhibitorIndustry">Industry</Label>
                    <Input
                      id="exhibitorIndustry"
                      value={newExhibitor.industry}
                      onChange={(e) => setNewExhibitor(prev => ({ ...prev, industry: e.target.value }))}
                      placeholder="Technology"
                    />
                  </div>
                  <div>
                    <Label htmlFor="exhibitorLocation">Location</Label>
                    <Input
                      id="exhibitorLocation"
                      value={newExhibitor.location}
                      onChange={(e) => setNewExhibitor(prev => ({ ...prev, location: e.target.value }))}
                      placeholder="New York, NY"
                    />
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor="exhibitorWebsite">Website</Label>
                    <Input
                      id="exhibitorWebsite"
                      value={newExhibitor.website}
                      onChange={(e) => setNewExhibitor(prev => ({ ...prev, website: e.target.value }))}
                      placeholder="https://techcorp.com"
                    />
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor="exhibitorDescription">Description</Label>
                    <Textarea
                      id="exhibitorDescription"
                      value={newExhibitor.description}
                      onChange={(e) => setNewExhibitor(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Company description..."
                      rows={3}
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleCreateExhibitor}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Exhibitor
                  </Button>
                  <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Booth Details */}
          {newBooth.exhibitorId && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="boothNumber">Booth Number *</Label>
                <Input
                  id="boothNumber"
                  value={newBooth.boothNumber}
                  onChange={(e) => setNewBooth(prev => ({ ...prev, boothNumber: e.target.value }))}
                  placeholder="A-101"
                />
              </div>
              <div>
                <Label htmlFor="spaceType">Space Type</Label>
                <Select 
                  value={newBooth.spaceType} 
                  onValueChange={(value) => setNewBooth(prev => ({ ...prev, spaceType: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="STANDARD">Standard</SelectItem>
                    <SelectItem value="PREMIUM">Premium</SelectItem>
                    <SelectItem value="CORNER">Corner</SelectItem>
                    <SelectItem value="ISLAND">Island</SelectItem>
                    <SelectItem value="PENINSULA">Peninsula</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2">
                <Label htmlFor="totalCost">Total Cost</Label>
                <Input
                  id="totalCost"
                  type="number"
                  value={newBooth.totalCost}
                  onChange={(e) => setNewBooth(prev => ({ ...prev, totalCost: Number(e.target.value) }))}
                  placeholder="0"
                />
              </div>
              {/* <div className="col-span-2">
                <Label htmlFor="boothNotes">Notes</Label>
                <Textarea
                  id="boothNotes"
                  value={newBooth.notes}
                  onChange={(e) => setNewBooth(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Additional notes about the booth..."
                  rows={2}
                />
              </div> */}
              
              {/* Special Requirements */}
              <div className="col-span-2">
                <Label>Special Requirements</Label>
                <div className="flex gap-2 mb-2">
                  <Input
                    value={newRequirement}
                    onChange={(e) => setNewRequirement(e.target.value)}
                    placeholder="Add special requirement"
                    onKeyPress={(e) => e.key === "Enter" && handleAddRequirement()}
                  />
                  <Button onClick={handleAddRequirement} variant="outline">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {/* {newBooth.specialRequirements.map((requirement, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      {requirement}
                      <X 
                        className="w-3 h-3 cursor-pointer" 
                        onClick={() => handleRemoveRequirement(index)} 
                      />
                    </Badge>
                  ))} */}
                </div>
              </div>
            </div>
          )}

          <Button onClick={handleAddBooth} disabled={!newBooth.exhibitorId}>
            <Plus className="w-4 h-4 mr-2" />
            Add Booth
          </Button>
        </div>

        {/* Current Booths */}
        {exhibitorBooths.length > 0 && (
          <div className="space-y-3">
            <Label>Current Booths ({exhibitorBooths.length})</Label>
            {exhibitorBooths.map((booth, index) => (
              <div key={index} className="p-3 border rounded-lg flex items-center justify-between">
                <div className="flex-1">
                  <div className="font-medium">Booth {booth.boothNumber}</div>
                  <div className="text-sm text-muted-foreground">
                    {getExhibitorName(booth.exhibitorId)} • {booth.spaceType}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Cost: ${booth.totalCost}
                    {/* {booth.specialRequirements.length > 0 && 
                      ` • ${booth.specialRequirements.length} special requirements`
                    } */}
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleRemoveBooth(index)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}