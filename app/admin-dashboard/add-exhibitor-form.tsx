"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { ArrowLeft, Save, User, Building2, Mail, Phone, Globe, Linkedin, Twitter } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { apiFetch } from "@/lib/api"
import { getCityOptions, getCountryOptions, getStateOptions } from "@/lib/location-data"
import { addExhibitorFormSchema, type AddExhibitorFormValues } from "./schemas/exhibitor-schema"

interface AddExhibitorFormProps {
  onSuccess?: () => void
  onCancel?: () => void
}

export default function AddExhibitorForm({ onSuccess, onCancel }: AddExhibitorFormProps) {
  const LOCATION_NONE = "__none__"
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const form = useForm<AddExhibitorFormValues>({
    resolver: zodResolver(addExhibitorFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      company: "",
      jobTitle: "",
      companyIndustry: "",
      website: "",
      linkedin: "",
      twitter: "",
      location: "",
      country: "",
      state: "",
      city: "",
      businessEmail: "",
      businessPhone: "",
      businessAddress: "",
      taxId: "",
      bio: "",
      isActive: true,
    },
  })
  const formData = form.watch()

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
  const [countryPick, setCountryPick] = useState<string>(LOCATION_NONE)
  const [statePick, setStatePick] = useState<string>(LOCATION_NONE)
  const [cityPick, setCityPick] = useState<string>(LOCATION_NONE)
  const countryOptions = useMemo(() => getCountryOptions(), [])
  const resolvedCountryCode = useMemo(() => {
    if (countryPick !== LOCATION_NONE) return countryPick
    const typed = formData.country.trim().toLowerCase()
    if (!typed) return ""
    const row = countryOptions.find((c) => c.name.trim().toLowerCase() === typed)
    return row?.code ?? ""
  }, [countryPick, formData.country, countryOptions])
  const stateOptions = useMemo(() => getStateOptions(resolvedCountryCode), [resolvedCountryCode])
  const resolvedStateCode = useMemo(() => {
    if (statePick !== LOCATION_NONE) return statePick
    const typed = formData.state.trim().toLowerCase()
    if (!typed) return ""
    const row = stateOptions.find((s) => s.name.trim().toLowerCase() === typed)
    return row?.code ?? ""
  }, [statePick, formData.state, stateOptions])
  const cityOptions = useMemo(
    () => getCityOptions(resolvedCountryCode, resolvedStateCode),
    [resolvedCountryCode, resolvedStateCode],
  )

  const handleChange = (field: keyof AddExhibitorFormValues, value: unknown) => {
    form.setValue(field, value as never, { shouldValidate: true })
  }

  const onSubmit = async (values: AddExhibitorFormValues) => {
    setLoading(true)

    try {
      const exhibitorData = {
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        phone: values.phone || null,
        company: values.company,
        jobTitle: values.jobTitle || null,
        companyIndustry: values.companyIndustry,
        website: values.website || null,
        linkedin: values.linkedin || null,
        twitter: values.twitter || null,
        location: [values.city, values.state, values.country].filter(Boolean).join(", ") || values.location || null,
        businessEmail: values.businessEmail || null,
        businessPhone: values.businessPhone || null,
        businessAddress: values.businessAddress || null,
        taxId: values.taxId || null,
        bio: values.bio || null,
        isActive: values.isActive,
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

      <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
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
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter first name" disabled={loading} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter last name" disabled={loading} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address *</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <Input
                              type="email"
                              placeholder="Enter email address"
                              className="pl-10"
                              disabled={loading}
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
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
                <FormField
                  control={form.control}
                  name="company"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter company name" disabled={loading} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="companyIndustry"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Industry *</FormLabel>
                        <Select value={field.value} onValueChange={field.onChange} disabled={loading}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select industry" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {industries.map((industry) => (
                              <SelectItem key={industry} value={industry}>
                                {industry}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
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
                  <Label>Country</Label>
                  <Select
                    value={countryPick}
                    onValueChange={(value) => {
                      setCountryPick(value)
                      if (value === LOCATION_NONE) return
                      const row = countryOptions.find((c) => c.code === value)
                      if (!row) return
                      setStatePick(LOCATION_NONE)
                      setCityPick(LOCATION_NONE)
                      setFormData((prev) => ({ ...prev, country: row.name, state: "", city: "", location: row.name }))
                    }}
                    disabled={loading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={LOCATION_NONE}>-- None --</SelectItem>
                      {countryOptions.map((country) => (
                        <SelectItem key={country.code} value={country.code}>
                          {country.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>State</Label>
                  <Select
                    value={statePick}
                    onValueChange={(value) => {
                      setStatePick(value)
                      if (value === LOCATION_NONE) return
                      const row = stateOptions.find((s) => s.code === value)
                      if (!row) return
                      setCityPick(LOCATION_NONE)
                      setFormData((prev) => ({ ...prev, state: row.name, city: "" }))
                    }}
                    disabled={loading || !resolvedCountryCode}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={!resolvedCountryCode ? "Select country first" : "Select state"} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={LOCATION_NONE}>-- None --</SelectItem>
                      {stateOptions.map((state) => (
                        <SelectItem key={state.code} value={state.code}>
                          {state.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>City</Label>
                  <Select
                    value={cityPick}
                    onValueChange={(value) => {
                      setCityPick(value)
                      if (value === LOCATION_NONE) return
                      const row = cityOptions.find((c) => c.name === value)
                      if (row) {
                        setFormData((prev) => ({
                          ...prev,
                          city: row.name,
                          location: [row.name, prev.state, prev.country].filter(Boolean).join(", "),
                        }))
                      }
                    }}
                    disabled={loading || !resolvedCountryCode || !resolvedStateCode}
                  >
                    <SelectTrigger>
                      <SelectValue
                        placeholder={
                          !resolvedCountryCode ? "Select country first" : !resolvedStateCode ? "Select state first" : "Select city"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={LOCATION_NONE}>-- None --</SelectItem>
                      {cityOptions.map((city) => (
                        <SelectItem key={city.name} value={city.name}>
                          {city.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
      </Form>
    </div>
  )
}