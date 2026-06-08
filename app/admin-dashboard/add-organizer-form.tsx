"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { X, Plus, Loader2, Building2, User, Mail, AlertTriangle, CheckCircle, Key } from "lucide-react"
import { adminApi } from "@/lib/admin-api"
import { OrganizerLocationSelects } from "@/components/admin-dashboard/organizer-location-selects"
import { addOrganizerFormSchema, type AddOrganizerFormValues } from "./schemas/organizer-schema"

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

  const form = useForm<AddOrganizerFormValues>({
    resolver: zodResolver(addOrganizerFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      organizationName: "",
      description: "",
      headquarters: "",
      country: "",
      state: "",
      city: "",
      founded: "",
      teamSize: "",
      specialties: [],
      businessEmail: "",
      businessPhone: "",
      businessAddress: "",
      taxId: "",
    },
  })

  const [newSpecialty, setNewSpecialty] = useState("")

  const handleAddSpecialty = () => {
    const trimmed = newSpecialty.trim()
    const current = form.getValues("specialties") ?? []
    if (trimmed && !current.includes(trimmed)) {
      form.setValue("specialties", [...current, trimmed], { shouldValidate: true })
      setNewSpecialty("")
    }
  }

  const handleRemoveSpecialty = (specialtyToRemove: string) => {
    const current = form.getValues("specialties") ?? []
    form.setValue(
      "specialties",
      current.filter((s) => s !== specialtyToRemove),
      { shouldValidate: true }
    )
  }

  const onSubmit = async (values: AddOrganizerFormValues) => {
    setLoading(true)
    setError(null)

    try {
      const data = await adminApi<{ success?: boolean; data?: unknown; error?: string; tempPassword?: string }>("/organizers", {
        method: "POST",
        body: {
          firstName: values.firstName,
          lastName: values.lastName,
          email: values.email,
          phone: values.phone || undefined,
          company: values.organizationName || undefined,
          organizationName: values.organizationName || undefined,
          description: values.description || undefined,
          headquarters: [values.city, values.state, values.country].filter(Boolean).join(", ") || undefined,
          organizerCountry: values.country.trim() || undefined,
          organizerState: values.state.trim() || undefined,
          organizerCity: values.city.trim() || undefined,
          founded: values.founded || undefined,
          teamSize: values.teamSize || undefined,
          specialties: values.specialties,
          businessEmail: values.businessEmail || undefined,
          businessPhone: values.businessPhone || undefined,
          businessAddress: values.businessAddress || undefined,
          taxId: values.taxId || undefined,
        },
      })
      if ((data as any)?.error) throw new Error((data as any).error)
      setTempPassword((data as any)?.tempPassword ?? null)
      router.refresh()
      if (onSuccess) onSuccess()
    } catch (err) {
      console.error("Error creating organizer:", err)
      setError(err instanceof Error ? err.message : "Failed to create organizer")
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    form.reset()
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
        <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter first name" {...field} />
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
                      <Input placeholder="Enter last name" {...field} />
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
                      <Input type="email" placeholder="Enter email address" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input type="tel" placeholder="Enter phone number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Organization Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              Organization Information
            </h3>
            
            <FormField
              control={form.control}
              name="organizationName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Organization Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter organization name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Describe the organization and its services" rows={3} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <OrganizerLocationSelects
              country={form.watch("country")}
              state={form.watch("state")}
              city={form.watch("city")}
              onCountryChange={(name) => form.setValue("country", name, { shouldValidate: true })}
              onStateChange={(name) => form.setValue("state", name, { shouldValidate: true })}
              onCityChange={(name) => form.setValue("city", name, { shouldValidate: true })}
              disabled={loading}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="founded"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Year Founded</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="e.g., 2020"
                        min="1900"
                        max={new Date().getFullYear()}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="teamSize"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Team Size</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select team size" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {TEAM_SIZE_OPTIONS.map((size) => (
                        <SelectItem key={size} value={size}>
                          {size} employees
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

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
                  const current = form.getValues("specialties") ?? []
                  if (!current.includes(value)) {
                    form.setValue("specialties", [...current, value], { shouldValidate: true })
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
                  {(form.watch("specialties") ?? []).map((specialty) => (
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
              <FormField
                control={form.control}
                name="businessEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Business Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="Business email address" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="businessPhone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Business Phone</FormLabel>
                    <FormControl>
                      <Input type="tel" placeholder="Business phone number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="businessAddress"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Business Address</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Full business address" rows={2} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="taxId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tax ID / GST Number</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter tax identification number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
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
        </Form>
      </CardContent>
    </Card>
  )
}