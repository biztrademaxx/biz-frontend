"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { X, Plus, Loader2, Building2, User, Mail, Phone, MapPin, Calendar, Users, AlertTriangle, CheckCircle, Key } from "lucide-react"
import { adminApi } from "@/lib/admin-api"

interface AddOrganizerFormProps {
  onSuccess?: () => void
  onCancel?: () => void
}

const SPECIALTY_OPTIONS = [
  "Corporate Events",
  "Wedding Planning",
  "Conferences",
  "Trade Shows",
  "Music Festivals",
  "Sports Events",
  "Charity Events",
  "Product Launches",
  "Exhibitions",
  "Workshops",
  "Seminars",
  "Networking Events"
]

const TEAM_SIZE_OPTIONS = [
  "1-10",
  "11-50",
  "51-100",
  "101-200",
  "201-500",
  "500+"
]

export default function AddOrganizerForm({ onSuccess, onCancel }: AddOrganizerFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [tempPassword, setTempPassword] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    // Personal Information
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    
    // Organization Information
    organizationName: "",
    description: "",
    headquarters: "",
    founded: "",
    teamSize: "",
    specialties: [] as string[],
    
    // Business Information
    businessEmail: "",
    businessPhone: "",
    businessAddress: "",
    taxId: ""
  })

  const [newSpecialty, setNewSpecialty] = useState("")

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    setError(null)
  }

  const handleAddSpecialty = () => {
    if (newSpecialty.trim() && !formData.specialties.includes(newSpecialty.trim())) {
      setFormData(prev => ({
        ...prev,
        specialties: [...prev.specialties, newSpecialty.trim()]
      }))
      setNewSpecialty("")
    }
  }

  const handleRemoveSpecialty = (specialtyToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      specialties: prev.specialties.filter(s => s !== specialtyToRemove)
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const data = await adminApi<{ success?: boolean; data?: unknown; error?: string; tempPassword?: string }>("/organizers", {
        method: "POST",
        body: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone || undefined,
          company: formData.organizationName || undefined,
        },
      })
      if ((data as any)?.error) throw new Error((data as any).error)
      setTempPassword((data as any)?.tempPassword ?? null)
      router.refresh()
      if (onSuccess) onSuccess()
    } catch (err) {
      console.error('Error creating organizer:', err)
      setError(err instanceof Error ? err.message : 'Failed to create organizer')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      organizationName: "",
      description: "",
      headquarters: "",
      founded: "",
      teamSize: "",
      specialties: [],
      businessEmail: "",
      businessPhone: "",
      businessAddress: "",
      taxId: ""
    })
    setTempPassword(null)
    setError(null)
  }

  if (tempPassword) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="w-6 h-6 text-green-600" />
            Organizer Created Successfully
          </CardTitle>
          <CardDescription>
            The organizer has been added to the system. Please share the temporary password with them.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-yellow-600" />
              <span className="font-medium text-yellow-800">Important</span>
            </div>
            <p className="text-sm text-yellow-700 mb-3">
              Share this temporary password with the organizer. They will need to change it on first login.
            </p>
            <div className="flex items-center gap-2 p-3 bg-white rounded border">
              <Key className="w-4 h-4 text-gray-500" />
              <code className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                {tempPassword}
              </code>
              <Button
                size="sm"
                variant="outline"
                onClick={() => navigator.clipboard.writeText(tempPassword)}
              >
                Copy
              </Button>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button onClick={resetForm}>
              <Plus className="w-4 h-4 mr-2" />
              Add Another Organizer
            </Button>
            <Button variant="outline" onClick={onCancel}>
              Back to Organizers List
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="w-6 h-6" />
          Add New Organizer
        </CardTitle>
        <CardDescription>
          Create a new organizer account. All fields marked with * are required.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Personal Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <User className="w-5 h-5" />
              Personal Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="firstName" className="text-sm font-medium">
                  First Name *
                </label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  placeholder="Enter first name"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="lastName" className="text-sm font-medium">
                  Last Name *
                </label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  placeholder="Enter last name"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">
                  Email Address *
                </label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="Enter email address"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="phone" className="text-sm font-medium">
                  Phone Number
                </label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="Enter phone number"
                />
              </div>
            </div>
          </div>

          {/* Organization Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              Organization Information
            </h3>
            
            <div className="space-y-2">
              <label htmlFor="organizationName" className="text-sm font-medium">
                Organization Name *
              </label>
              <Input
                id="organizationName"
                value={formData.organizationName}
                onChange={(e) => handleInputChange('organizationName', e.target.value)}
                placeholder="Enter organization name"
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-medium">
                Description
              </label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Describe the organization and its services"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="headquarters" className="text-sm font-medium">
                  Headquarters
                </label>
                <Input
                  id="headquarters"
                  value={formData.headquarters}
                  onChange={(e) => handleInputChange('headquarters', e.target.value)}
                  placeholder="Enter headquarters location"
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="founded" className="text-sm font-medium">
                  Year Founded
                </label>
                <Input
                  id="founded"
                  type="number"
                  value={formData.founded}
                  onChange={(e) => handleInputChange('founded', e.target.value)}
                  placeholder="e.g., 2020"
                  min="1900"
                  max={new Date().getFullYear()}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="teamSize" className="text-sm font-medium">
                Team Size
              </label>
              <Select value={formData.teamSize} onValueChange={(value) => handleInputChange('teamSize', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select team size" />
                </SelectTrigger>
                <SelectContent>
                  {TEAM_SIZE_OPTIONS.map((size) => (
                    <SelectItem key={size} value={size}>
                      {size} employees
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Specialties</label>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Input
                    value={newSpecialty}
                    onChange={(e) => setNewSpecialty(e.target.value)}
                    placeholder="Add specialty"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        handleAddSpecialty()
                      }
                    }}
                  />
                  <Button type="button" onClick={handleAddSpecialty} variant="outline">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                
                <Select onValueChange={(value) => {
                  if (!formData.specialties.includes(value)) {
                    setFormData(prev => ({
                      ...prev,
                      specialties: [...prev.specialties, value]
                    }))
                  }
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Or choose from common specialties" />
                  </SelectTrigger>
                  <SelectContent>
                    {SPECIALTY_OPTIONS.map((specialty) => (
                      <SelectItem key={specialty} value={specialty}>
                        {specialty}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.specialties.map((specialty) => (
                    <Badge key={specialty} variant="secondary" className="flex items-center gap-1">
                      {specialty}
                      <button
                        type="button"
                        onClick={() => handleRemoveSpecialty(specialty)}
                        className="hover:text-red-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Business Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <Mail className="w-5 h-5" />
              Business Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="businessEmail" className="text-sm font-medium">
                  Business Email
                </label>
                <Input
                  id="businessEmail"
                  type="email"
                  value={formData.businessEmail}
                  onChange={(e) => handleInputChange('businessEmail', e.target.value)}
                  placeholder="Business email address"
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="businessPhone" className="text-sm font-medium">
                  Business Phone
                </label>
                <Input
                  id="businessPhone"
                  type="tel"
                  value={formData.businessPhone}
                  onChange={(e) => handleInputChange('businessPhone', e.target.value)}
                  placeholder="Business phone number"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="businessAddress" className="text-sm font-medium">
                Business Address
              </label>
              <Textarea
                id="businessAddress"
                value={formData.businessAddress}
                onChange={(e) => handleInputChange('businessAddress', e.target.value)}
                placeholder="Full business address"
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="taxId" className="text-sm font-medium">
                Tax ID / GST Number
              </label>
              <Input
                id="taxId"
                value={formData.taxId}
                onChange={(e) => handleInputChange('taxId', e.target.value)}
                placeholder="Enter tax identification number"
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex gap-2 pt-4 border-t">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating Organizer...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Organizer
                </>
              )}
            </Button>
            
            <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}