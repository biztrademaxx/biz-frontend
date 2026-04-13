"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Save, User, Building2, Mail, Phone, MapPin, Globe, Linkedin, Twitter } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { apiFetch } from "@/lib/api"

interface AddExhibitorFormProps {
  onSuccess?: () => void
  onCancel?: () => void
}

export default function AddExhibitorForm({ onSuccess, onCancel }: AddExhibitorFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    // Personal Information
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    
    // Company Information
    company: "",
    jobTitle: "",
    companyIndustry: "",
    website: "",
    
    // Social Media
    linkedin: "",
    twitter: "",
    
    // Location
    location: "",
    
    // Business Information
    businessEmail: "",
    businessPhone: "",
    businessAddress: "",
    taxId: "",
    
    // Profile
    bio: "",
    
    // Settings
    isActive: true,
  })

  const industries = [
    "Technology",
    "Healthcare",
    "Energy",
    "Manufacturing",
    "Retail",
    "Finance",
    "Education",
    "Entertainment",
    "Hospitality",
    "Real Estate",
    "Transportation",
    "Other"
  ]

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const validateForm = () => {
    if (!formData.firstName.trim()) {
      toast({ 
        title: "Validation Error", 
        description: "First name is required", 
        variant: "destructive" 
      })
      return false
    }
    if (!formData.lastName.trim()) {
      toast({ 
        title: "Validation Error", 
        description: "Last name is required", 
        variant: "destructive" 
      })
      return false
    }
    if (!formData.email.trim()) {
      toast({ 
        title: "Validation Error", 
        description: "Email is required", 
        variant: "destructive" 
      })
      return false
    }
    if (!formData.email.includes('@')) {
      toast({ 
        title: "Validation Error", 
        description: "Invalid email format", 
        variant: "destructive" 
      })
      return false
    }
    if (!formData.company.trim()) {
      toast({ 
        title: "Validation Error", 
        description: "Company name is required", 
        variant: "destructive" 
      })
      return false
    }
    if (!formData.companyIndustry) {
      toast({ 
        title: "Validation Error", 
        description: "Industry is required", 
        variant: "destructive" 
      })
      return false
    }
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    setLoading(true)

    try {
      // Prepare the data for the backend
      const exhibitorData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone || null,
        company: formData.company,
        jobTitle: formData.jobTitle || null,
        companyIndustry: formData.companyIndustry,
        website: formData.website || null,
        linkedin: formData.linkedin || null,
        twitter: formData.twitter || null,
        location: formData.location || null,
        businessEmail: formData.businessEmail || null,
        businessPhone: formData.businessPhone || null,
        businessAddress: formData.businessAddress || null,
        taxId: formData.taxId || null,
        bio: formData.bio || null,
        isActive: formData.isActive,
      }

      // Use your existing apiFetch function
      const response = await apiFetch('/api/admin/exhibitors', {
        method: 'POST',
        body: exhibitorData,
        auth: true, // This will automatically attach the auth token
      })

      toast({ 
        title: "Success", 
        description: "Exhibitor created successfully!" 
      })
      
      if (onSuccess) {
        onSuccess()
      } else {
        router.push('/admin-dashboard?section=exhibitors&sub=exhibitors-all')
        router.refresh()
      }
    } catch (error: any) {
      console.error('Error creating exhibitor:', error)
      
      // Handle specific error messages from your backend
      let errorMessage = "Failed to create exhibitor. Please try again."
      
      if (error.message) {
        if (error.message.includes("already exists")) {
          errorMessage = "An exhibitor with this email already exists."
        } else {
          errorMessage = error.message
        }
      }
      
      toast({ 
        title: "Error", 
        description: errorMessage,
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {onCancel && (
            <Button 
              variant="outline" 
              size="icon"
              onClick={onCancel}
              type="button"
              disabled={loading}
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
          )}
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Add New Exhibitor</h1>
            <p className="text-gray-600">Create a new exhibitor account</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Personal Information
                </CardTitle>
                <CardDescription>
                  Basic information about the exhibitor contact person
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => handleChange("firstName", e.target.value)}
                      placeholder="Enter first name"
                      required
                      disabled={loading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => handleChange("lastName", e.target.value)}
                      placeholder="Enter last name"
                      required
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address *</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleChange("email", e.target.value)}
                        placeholder="Enter email address"
                        className="pl-10"
                        required
                        disabled={loading}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => handleChange("phone", e.target.value)}
                        placeholder="Enter phone number"
                        className="pl-10"
                        disabled={loading}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="jobTitle">Job Title</Label>
                  <Input
                    id="jobTitle"
                    value={formData.jobTitle}
                    onChange={(e) => handleChange("jobTitle", e.target.value)}
                    placeholder="e.g., Sales Manager, CEO, Marketing Director"
                    disabled={loading}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Company Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="w-5 h-5" />
                  Company Information
                </CardTitle>
                <CardDescription>
                  Details about the exhibitor's company
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="company">Company Name *</Label>
                  <Input
                    id="company"
                    value={formData.company}
                    onChange={(e) => handleChange("company", e.target.value)}
                    placeholder="Enter company name"
                    required
                    disabled={loading}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="companyIndustry">Industry *</Label>
                    <Select
                      value={formData.companyIndustry}
                      onValueChange={(value) => handleChange("companyIndustry", value)}
                      disabled={loading}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select industry" />
                      </SelectTrigger>
                      <SelectContent>
                        {industries.map((industry) => (
                          <SelectItem key={industry} value={industry}>
                            {industry}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="website">Website</Label>
                    <div className="relative">
                      <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        id="website"
                        value={formData.website}
                        onChange={(e) => handleChange("website", e.target.value)}
                        placeholder="https://example.com"
                        className="pl-10"
                        disabled={loading}
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="businessEmail">Business Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        id="businessEmail"
                        type="email"
                        value={formData.businessEmail}
                        onChange={(e) => handleChange("businessEmail", e.target.value)}
                        placeholder="business@company.com"
                        className="pl-10"
                        disabled={loading}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="businessPhone">Business Phone</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        id="businessPhone"
                        value={formData.businessPhone}
                        onChange={(e) => handleChange("businessPhone", e.target.value)}
                        placeholder="Business phone number"
                        className="pl-10"
                        disabled={loading}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="businessAddress">Business Address</Label>
                  <Input
                    id="businessAddress"
                    value={formData.businessAddress}
                    onChange={(e) => handleChange("businessAddress", e.target.value)}
                    placeholder="Enter business address"
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="taxId">Tax ID / VAT Number</Label>
                  <Input
                    id="taxId"
                    value={formData.taxId}
                    onChange={(e) => handleChange("taxId", e.target.value)}
                    placeholder="Enter tax identification number"
                    disabled={loading}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Social Media & Location */}
            <Card>
              <CardHeader>
                <CardTitle>Social Media & Location</CardTitle>
                <CardDescription>
                  Social media profiles and location information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="linkedin">LinkedIn</Label>
                    <div className="relative">
                      <Linkedin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        id="linkedin"
                        value={formData.linkedin}
                        onChange={(e) => handleChange("linkedin", e.target.value)}
                        placeholder="LinkedIn profile URL"
                        className="pl-10"
                        disabled={loading}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="twitter">Twitter</Label>
                    <div className="relative">
                      <Twitter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        id="twitter"
                        value={formData.twitter}
                        onChange={(e) => handleChange("twitter", e.target.value)}
                        placeholder="Twitter profile URL"
                        className="pl-10"
                        disabled={loading}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => handleChange("location", e.target.value)}
                      placeholder="City, Country"
                      className="pl-10"
                      disabled={loading}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Bio */}
            <Card>
              <CardHeader>
                <CardTitle>Bio & Description</CardTitle>
                <CardDescription>
                  Tell us about the exhibitor and their company
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor="bio">Company Bio</Label>
                  <Textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e) => handleChange("bio", e.target.value)}
                    placeholder="Describe the company, products, services, and what makes them unique..."
                    rows={4}
                    disabled={loading}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Settings Card */}
            <Card>
              <CardHeader>
                <CardTitle>Settings</CardTitle>
                <CardDescription>
                  Account status and verification
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="isActive">Active Account</Label>
                    <div className="text-sm text-gray-500">
                      Activate or deactivate this account
                    </div>
                  </div>
                  <Switch
                    id="isActive"
                    checked={formData.isActive}
                    onCheckedChange={(checked) => handleChange("isActive", checked)}
                    disabled={loading}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Actions Card */}
            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Creating...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Create Exhibitor
                    </>
                  )}
                </Button>
                
                {onCancel && (
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="w-full"
                    onClick={onCancel}
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Required Fields Note */}
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="pt-6">
                <div className="text-sm text-blue-800">
                  <p className="font-medium">Required Fields</p>
                  <ul className="mt-2 space-y-1">
                    <li>• First Name</li>
                    <li>• Last Name</li>
                    <li>• Email Address</li>
                    <li>• Company Name</li>
                    <li>• Industry</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  )
}