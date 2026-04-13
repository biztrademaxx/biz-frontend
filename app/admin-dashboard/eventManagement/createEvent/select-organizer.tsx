"use client"

import { useState, useEffect } from "react"
import { apiFetch } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Search, Plus, User, Building } from "lucide-react"

interface Organizer {
  id: string
  firstName: string
  lastName: string
  email: string
  organizationName?: string
  company?: string
  role: string
}

interface SelectOrganizerProps {
  selectedOrganizerId: string
  onOrganizerChange: (organizerId: string, organizerEmail?: string) => void
}

export function SelectOrganizer({ selectedOrganizerId, onOrganizerChange }: SelectOrganizerProps) {
  const [organizers, setOrganizers] = useState<Organizer[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newOrganizer, setNewOrganizer] = useState({
    firstName: "",
    lastName: "",
    email: "",
    organizationName: "",
    phone: ""
  })

  useEffect(() => {
    fetchOrganizers()
  }, [])

  const fetchOrganizers = async () => {
    try {
      setIsLoading(true)
      const data = await apiFetch<{ data?: Organizer[]; users?: Organizer[] }>(
        "/api/admin/users?role=ORGANIZER&limit=500",
        { auth: true }
      )
      const list = Array.isArray(data?.data) ? data.data : data?.users ?? []
      setOrganizers(list)
    } catch (error) {
      console.error("Error fetching organizers:", error)
      setOrganizers([])
    } finally {
      setIsLoading(false)
    }
  }

  const filteredOrganizers = organizers.filter((organizer) => {
    const q = searchTerm.toLowerCase()
    return (
      (organizer.firstName ?? "").toLowerCase().includes(q) ||
      (organizer.lastName ?? "").toLowerCase().includes(q) ||
      (organizer.email ?? "").toLowerCase().includes(q) ||
      (organizer.organizationName ?? organizer.company ?? "").toLowerCase().includes(q)
    )
  })

  const handleCreateOrganizer = async () => {
    if (!newOrganizer.firstName || !newOrganizer.lastName || !newOrganizer.email) {
      alert("Please fill in all required fields")
      return
    }

    try {
      const data = await apiFetch<{ user?: { id: string; email?: string }; data?: { id: string; email?: string } }>(
        "/api/admin/users",
        {
          method: "POST",
          auth: true,
          body: {
            ...newOrganizer,
            role: "ORGANIZER",
          },
        }
      )
      const user = data?.user ?? data?.data
      if (user?.id) {
        onOrganizerChange(user.id, user.email)
        setShowCreateForm(false)
        setNewOrganizer({ firstName: "", lastName: "", email: "", organizationName: "", phone: "" })
        fetchOrganizers()
      } else {
        alert("Error creating organizer")
      }
    } catch (error) {
      console.error("Error creating organizer:", error)
      alert("Error creating organizer")
    }
  }

  const selectedOrganizer = organizers.find(org => org.id === selectedOrganizerId)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building className="w-5 h-5" />
          Event Organizer
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Select an existing organizer or create a new one
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search and Select */}
        <div className="space-y-3">
          <Label>Select Organizer</Label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search organizers..."
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
              New
            </Button>
          </div>

          {!showCreateForm && (
            <Select value={selectedOrganizerId} onValueChange={onOrganizerChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select an organizer" />
              </SelectTrigger>
              <SelectContent>
                {isLoading ? (
                  <SelectItem value="loading" disabled>Loading...</SelectItem>
                ) : filteredOrganizers.length === 0 ? (
                  <SelectItem value="no-results" disabled>No organizers found</SelectItem>
                ) : (
                  filteredOrganizers.map((organizer) => (
                    <SelectItem key={organizer.id} value={organizer.id}>
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        <div>
                          <div className="font-medium">
                            {organizer.firstName} {organizer.lastName}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {organizer.organizationName || organizer.company} • {organizer.email}
                          </div>
                        </div>
                      </div>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          )}

          {selectedOrganizer && !showCreateForm && (
            <div className="p-3 border rounded-lg bg-muted/50">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">
                    {selectedOrganizer.firstName} {selectedOrganizer.lastName}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {selectedOrganizer.organizationName || selectedOrganizer.company}
                  </div>
                  <div className="text-sm text-muted-foreground">{selectedOrganizer.email}</div>
                </div>
                <Badge variant="secondary">Selected</Badge>
              </div>
            </div>
          )}
        </div>

        {/* Create New Organizer Form */}
        {showCreateForm && (
          <div className="p-4 border rounded-lg space-y-4">
            <h4 className="font-medium">Create New Organizer</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  value={newOrganizer.firstName}
                  onChange={(e) => setNewOrganizer(prev => ({ ...prev, firstName: e.target.value }))}
                  placeholder="John"
                />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  value={newOrganizer.lastName}
                  onChange={(e) => setNewOrganizer(prev => ({ ...prev, lastName: e.target.value }))}
                  placeholder="Doe"
                />
              </div>
              <div className="col-span-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={newOrganizer.email}
                  onChange={(e) => setNewOrganizer(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="john@example.com"
                />
              </div>
              <div className="col-span-2">
                <Label htmlFor="organizationName">Organization Name</Label>
                <Input
                  id="organizationName"
                  value={newOrganizer.organizationName}
                  onChange={(e) => setNewOrganizer(prev => ({ ...prev, organizationName: e.target.value }))}
                  placeholder="Company Inc."
                />
              </div>
              <div className="col-span-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={newOrganizer.phone}
                  onChange={(e) => setNewOrganizer(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="+1 (555) 123-4567"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleCreateOrganizer}>
                <Plus className="w-4 h-4 mr-2" />
                Create Organizer
              </Button>
              <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                Cancel
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}