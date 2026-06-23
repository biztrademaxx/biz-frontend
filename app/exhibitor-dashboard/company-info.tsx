"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"
import { apiFetch } from "@/lib/api"
import {
  Building2,
  Upload,
  Edit,
  Save,
  Facebook,
  Twitter,
  Linkedin,
  Instagram,
  Camera,
  User,
  Mail,
  Phone,
  Globe,
  X,
  Plus,
  CheckCircle,
} from "lucide-react"
import { cn } from "@/lib/utils"
import {
  ProfileLocationFields,
  profileLocationFromLegacy,
} from "@/components/location/ProfileLocationFields"
import { uploadFileViaProxy } from "@/components/organizer-create-event/upload-backend"
import {
  exGlassCardPremium,
  exGlassNested,
  exCompanyGlowLayer,
  exInput,
  exCtaGradient,
} from "./dashboard-theme"

interface ExhibitorData {
  id: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  company?: string | null
  jobTitle?: string
  bio?: string
  website?: string
  linkedin?: string
  twitter?: string
  avatar?: string
  location?: string
  profileCity?: string
  profileState?: string
  profileCountry?: string
  foundedYear?: string
  companySize?: string
  industry?: string
  headquarters?: string
  specialties?: string[]
}

const COMPANY_SIZE_OPTIONS = [
  "1-10 employees",
  "11-50 employees",
  "51-200 employees",
  "201-500 employees",
  "501-1000 employees",
  "1000+ employees",
] as const

interface CompanyInfoProps {
  exhibitorId: string
  exhibitorData: ExhibitorData
  onUpdate: (data: Partial<ExhibitorData>) => void
}

export default function CompanyInfo({ exhibitorData, onUpdate }: CompanyInfoProps) {
  const { toast } = useToast()
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [formData, setFormData] = useState(exhibitorData)
  const [productTags, setProductTags] = useState<string[]>(exhibitorData.specialties ?? [])
  const [industryOptions, setIndustryOptions] = useState<string[]>([])
  const [customProductTag, setCustomProductTag] = useState("")

  useEffect(() => {
    setFormData(exhibitorData)
    setProductTags(exhibitorData.specialties ?? [])
  }, [exhibitorData])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const data = await apiFetch<{ categories?: Array<{ name?: string }> }>(
          "/api/events/categories/browse",
          { auth: false },
        )
        if (cancelled) return
        const names = (data.categories ?? [])
          .map((c) => (typeof c.name === "string" ? c.name.trim() : ""))
          .filter(Boolean)
        setIndustryOptions(Array.from(new Set(names)).sort((a, b) => a.localeCompare(b)))
      } catch {
        if (!cancelled) setIndustryOptions([])
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])


  const handleBannerUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setUploading(true)

      const bannerUrl = await uploadFileViaProxy(file, "image")

      

      // save banner url here
    } catch (err) {
      console.error(err)
    } finally {
      setUploading(false)
    }
  }
  // const bannerUrl = await uploadFileViaProxy(file, "image")
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file",
        variant: "destructive",
      })
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload an image smaller than 5MB",
        variant: "destructive",
      })
      return
    }

    try {
      setUploading(true)

      const { uploadFileViaProxy } = await import("@/components/organizer-create-event/upload-backend")
      const avatarUrl = await uploadFileViaProxy(file, "image")

      if (avatarUrl) {
        setFormData((prev) => ({ ...prev, avatar: avatarUrl }))
        await onUpdate({ avatar: avatarUrl })

        toast({
          title: "Success",
          description: "Avatar updated successfully",
        })
      } else {
        throw new Error("Upload failed")
      }
    } catch (error) {
      console.error("Error uploading avatar:", error)
      toast({
        title: "Upload failed",
        description: "Failed to upload avatar. Please try again.",
        variant: "destructive",
      })
    } finally {
      setUploading(false)
    }
  }

  const handleSave = async () => {
    try {
      setLoading(true)
      const headquarters =
        formData.headquarters?.trim() ||
        [formData.profileCity, formData.profileCountry].filter(Boolean).join(", ") ||
        undefined
      await onUpdate({
        ...formData,
        foundedYear: formData.foundedYear,
        companySize: formData.companySize,
        industry: formData.industry,
        headquarters,
        specialties: productTags,
      })
      setIsEditing(false)
      toast({
        title: "Success",
        description: "Company information updated successfully",
      })
    } catch (error) {
      console.error("Error updating company info:", error)
      toast({
        title: "Error",
        description: "Failed to update company information. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAddProductTag = (value: string) => {
    const trimmed = value.trim()
    if (!trimmed || productTags.includes(trimmed)) return
    setProductTags([...productTags, trimmed])
    setCustomProductTag("")
  }

  const handleRemoveProductTag = (tag: string) => {
    setProductTags(productTags.filter((t) => t !== tag))
  }

  const socialLinks = [
    { name: "Facebook", icon: Facebook, url: "https://facebook.com/company", color: "text-[#004A96]" },
    { name: "LinkedIn", icon: Linkedin, url: formData.linkedin || "", color: "text-[#004A96]" },
    { name: "Twitter", icon: Twitter, url: formData.twitter || "", color: "text-sky-500" },
    { name: "Instagram", icon: Instagram, url: "https://instagram.com/company", color: "text-pink-500" },
  ]

  if (loading && !formData) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-96" />
          <Skeleton className="h-96" />
          <Skeleton className="h-96" />
        </div>
      </div>
    )
  }

  return (
    <div className="relative min-w-0">
      <div className={exCompanyGlowLayer} aria-hidden />
      <div className="relative z-10 space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-2xl font-bold tracking-tight text-slate-800 md:text-3xl">
            Company Information
          </h1>
          <Button
            onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
            className={cn("flex w-full items-center justify-center gap-2 shadow-md sm:w-auto", exCtaGradient)}
            disabled={loading}
          >
            {isEditing ? <Save className="w-4 h-4" /> : <Edit className="w-4 h-4" />}
            {loading ? "Saving..." : isEditing ? "Save Changes" : "Edit Profile"}
          </Button>
        </div>

        <div className="grid min-w-0 grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-3">
          {/* Company Logo & Banner */}
          <Card className={cn(exGlassCardPremium, "min-w-0 overflow-hidden")}>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-slate-800">
                <Building2 className="h-5 w-5 text-[#004A96]" />
                Company Logo & Banner
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className={cn(exGlassNested, "p-4 text-center")}>
                <div className="relative inline-block">
                  <Avatar className="mx-auto mb-4 h-32 w-32 ring-2 ring-[#004A96]/20 ring-offset-2 ring-offset-white/50">
                    <AvatarImage src={formData.avatar } />
                    <AvatarFallback className="bg-[#004A96]/10 text-2xl font-semibold text-[#004A96]">
                      {formData.firstName?.[0]}
                      {formData.lastName?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  {isEditing && (
                    <label
                      htmlFor="avatar-upload"
                      className="absolute bottom-4 right-1/2 flex translate-x-16 cursor-pointer rounded-full bg-[#004A96] p-2 text-white transition-colors hover:bg-[#003d7a]"
                    >
                      {uploading ? (
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      ) : (
                        <Camera className="h-4 w-4" />
                      )}
                    </label>
                  )}
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                    disabled={uploading}
                  />
                </div>
              </div>

              <div className="space-y-2">
              <Label>Company Banner</Label>
              <div className="flex min-h-[5.5rem] items-center justify-center rounded-2xl bg-gradient-to-br from-[#004A96] via-[#003d7a] to-[#002f5e] px-4 text-center font-semibold text-white shadow-[0_12px_40px_rgba(0,74,150,0.25)]">
                <span className="drop-shadow-sm">{formData.company || "Company Name"}</span>
              </div>
              {/* {isEditing && (
                <Button variant="outline" size="sm" className="w-full border-[#004A96]/30 bg-white/40 backdrop-blur-sm">
                  <Upload className="w-4 h-4" />
                  Upload Banner
                </Button>
              )} */}
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card className={cn(exGlassCardPremium, "min-w-0 overflow-hidden")}>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-slate-800">
              <User className="h-5 w-5 text-[#004A96]" />
              Contact Information
            </CardTitle>
          </CardHeader>
          <CardContent className="min-w-0">
            <div className={cn(exGlassNested, "min-w-0 space-y-4 p-4 sm:p-5")}>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="first-name">First Name</Label>
                <Input
                  id="first-name"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  disabled={!isEditing}
                  className={cn(exInput, "disabled:opacity-60")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="last-name">Last Name</Label>
                <Input
                  id="last-name"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  disabled={!isEditing}
                  className={cn(exInput, "disabled:opacity-60")}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="company">Company Name</Label>
              <Input
                id="company"
                value={formData.company || ""}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                disabled={!isEditing}
                className={cn(exInput, "disabled:opacity-60")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="job-title">Job Title</Label>
              <Input
                id="job-title"
                value={formData.jobTitle || ""}
                onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                disabled={!isEditing}
                className={cn(exInput, "disabled:opacity-60")}
              />
            </div>

            {/* Email Field - Always Read Only */}
            <div className="min-w-0 space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="flex min-w-0 items-start gap-2.5 rounded-md border border-white/60 bg-white/45 p-3 backdrop-blur-sm">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-[#004A96]/60" />
                <span className="min-w-0 flex-1 break-all text-sm leading-snug">{formData.email}</span>
                {!isEditing && (
                  <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />
                )}
              </div>
              {isEditing && (
                <p className="text-xs text-muted-foreground">
                  Email cannot be edited
                </p>
              )}
            </div>

            {/* Phone Field - Always Read Only */}
            <div className="min-w-0 space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <div className="flex min-w-0 items-start gap-2.5 rounded-md border border-white/60 bg-white/45 p-3 backdrop-blur-sm">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-[#004A96]/60" />
                <span className="min-w-0 flex-1 break-all text-sm leading-snug">
                  {formData.phone || "Not provided"}
                </span>
                {!isEditing && formData.phone && (
                  <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />
                )}
              </div>
              {isEditing && (
                <p className="text-xs text-muted-foreground">
                  Phone number cannot be edited
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <div className="relative">
                <Globe className="absolute left-3 top-3 h-4 w-4 text-[#004A96]/60" />
                <Input
                  id="website"
                  value={formData.website || ""}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  disabled={!isEditing}
                  className={cn(exInput, "pl-10 disabled:opacity-60")}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Location</Label>
              <ProfileLocationFields
                value={{
                  city: formData.profileCity ?? "",
                  state: formData.profileState ?? "",
                  country: formData.profileCountry ?? "",
                }}
                onChange={(next) =>
                  setFormData({
                    ...formData,
                    profileCity: next.city,
                    profileState: next.state,
                    profileCountry: next.country,
                  })
                }
                disabled={!isEditing}
                className="mt-1"
              />
            </div>
            </div>
          </CardContent>
        </Card>

        {/* Company Details */}
        <Card className={cn(exGlassCardPremium, "min-w-0 overflow-hidden")}>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-slate-800">
              <Building2 className="h-5 w-5 text-[#004A96]" />
              Company Details
            </CardTitle>
          </CardHeader>
          <CardContent className="min-w-0">
            <div className={cn(exGlassNested, "min-w-0 space-y-4 p-4 sm:p-5")}>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="founded-year">Founded Year</Label>
                  {isEditing ? (
                    <Input
                      id="founded-year"
                      type="number"
                      min={1800}
                      max={2100}
                      placeholder="e.g. 2015"
                      value={formData.foundedYear || ""}
                      onChange={(e) => setFormData({ ...formData, foundedYear: e.target.value })}
                      className={exInput}
                    />
                  ) : (
                    <p className="text-sm font-medium text-slate-800">{formData.foundedYear || "—"}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company-size">Company Size</Label>
                  {isEditing ? (
                    <Select
                      value={formData.companySize || ""}
                      onValueChange={(value) => setFormData({ ...formData, companySize: value })}
                    >
                      <SelectTrigger id="company-size" className={cn(exInput, "w-full")}>
                        <SelectValue placeholder="Select company size" />
                      </SelectTrigger>
                      <SelectContent>
                        {COMPANY_SIZE_OPTIONS.map((size) => (
                          <SelectItem key={size} value={size}>
                            {size}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <p className="text-sm font-medium text-slate-800">{formData.companySize || "—"}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="industry">Industry / Category</Label>
                  {isEditing ? (
                    <Select
                      value={formData.industry || ""}
                      onValueChange={(value) => setFormData({ ...formData, industry: value })}
                    >
                      <SelectTrigger id="industry" className={cn(exInput, "w-full")}>
                        <SelectValue placeholder="Select industry category" />
                      </SelectTrigger>
                      <SelectContent>
                        {(() => {
                          const options =
                            formData.industry && !industryOptions.includes(formData.industry)
                              ? [formData.industry, ...industryOptions]
                              : industryOptions
                          if (options.length === 0) {
                            return (
                              <SelectItem value="__loading__" disabled>
                                Loading categories…
                              </SelectItem>
                            )
                          }
                          return options.map((name) => (
                            <SelectItem key={name} value={name}>
                              {name}
                            </SelectItem>
                          ))
                        })()}
                      </SelectContent>
                    </Select>
                  ) : (
                    <p className="text-sm font-medium text-slate-800">{formData.industry || "—"}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="headquarters">Headquarters</Label>
                  {isEditing ? (
                    <Input
                      id="headquarters"
                      placeholder="e.g. Bangalore, India"
                      value={formData.headquarters || ""}
                      onChange={(e) => setFormData({ ...formData, headquarters: e.target.value })}
                      className={exInput}
                    />
                  ) : (
                    <p className="text-sm font-medium text-slate-800">
                      {formData.headquarters ||
                        [formData.profileCity, formData.profileCountry].filter(Boolean).join(", ") ||
                        "—"}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Social Media Links */}
        <Card className={cn(exGlassCardPremium, "min-w-0 overflow-hidden")}>
          <CardHeader className="pb-3">
            <CardTitle className="text-slate-800">Social Media Links</CardTitle>
          </CardHeader>
          <CardContent className="min-w-0">
            <div className={cn(exGlassNested, "min-w-0 space-y-4 p-4 sm:p-5")}>
            {socialLinks.map((social) => (
              <div key={social.name} className="flex min-w-0 items-center gap-3">
                <social.icon className={`h-5 w-5 shrink-0 ${social.color}`} />
                <div className="min-w-0 flex-1">
                  <Input
                    value={social.url}
                    disabled={!isEditing}
                    placeholder={`${social.name} URL`}
                    className={cn(exInput, "disabled:opacity-60")}
                    onChange={(e) => {
                      if (social.name === "LinkedIn") {
                        setFormData({ ...formData, linkedin: e.target.value })
                      } else if (social.name === "Twitter") {
                        setFormData({ ...formData, twitter: e.target.value })
                      }
                    }}
                  />
                </div>
              </div>
            ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Product Categories & Description */}
      <div className="grid min-w-0 grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-2">
        <Card className={cn(exGlassCardPremium, "min-w-0 overflow-hidden")}>
          <CardHeader className="pb-3">
            <CardTitle className="text-slate-800">Product Categories / Services</CardTitle>
          </CardHeader>
          <CardContent className="min-w-0">
            <div className={cn(exGlassNested, "min-w-0 space-y-4 p-4 sm:p-5")}>
            <div className="flex flex-wrap gap-2">
              {productTags.map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="flex items-center gap-1 border-[#004A96]/20 bg-[#004A96]/10 text-[#004A96]"
                >
                  {tag}
                  {isEditing && (
                    <X
                      className="h-3 w-3 cursor-pointer hover:text-[#004A96]"
                      onClick={() => handleRemoveProductTag(tag)}
                    />
                  )}
                </Badge>
              ))}
              {productTags.length === 0 && !isEditing ? (
                <p className="text-sm text-muted-foreground">No product categories added yet.</p>
              ) : null}
            </div>

            {isEditing && (
              <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                <Select onValueChange={(v) => handleAddProductTag(v)}>
                  <SelectTrigger className={cn(exInput, "w-full sm:flex-1")}>
                    <SelectValue placeholder="Add from event categories" />
                  </SelectTrigger>
                  <SelectContent>
                    {industryOptions
                      .filter((name) => !productTags.includes(name))
                      .map((name) => (
                        <SelectItem key={name} value={name}>
                          {name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                <div className="flex gap-2">
                  <Input
                    placeholder="Or type custom tag"
                    value={customProductTag}
                    onChange={(e) => setCustomProductTag(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault()
                        handleAddProductTag(customProductTag)
                      }
                    }}
                    className={exInput}
                  />
                  <Button
                    type="button"
                    onClick={() => handleAddProductTag(customProductTag)}
                    size="sm"
                    className={cn("shadow-md", exCtaGradient)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
            </div>
          </CardContent>
        </Card>

        <Card className={cn(exGlassCardPremium, "min-w-0 overflow-hidden")}>
          <CardHeader className="pb-3">
            <CardTitle className="text-slate-800">Company Description</CardTitle>
          </CardHeader>
          <CardContent className="min-w-0">
            <div className={cn(exGlassNested, "min-w-0 p-4 sm:p-5")}>
              <Textarea
                value={formData.bio || ""}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                disabled={!isEditing}
                rows={6}
                placeholder="Describe your company, products, and services..."
                className={cn(exInput, "min-h-[140px] disabled:opacity-60")}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      {isEditing && (
        <div className="flex justify-end gap-3">
          <Button
            variant="outline"
            className="rounded-2xl border-[#004A96]/35 bg-white/50 backdrop-blur-sm"
            onClick={() => {
              setIsEditing(false)
              const loc = profileLocationFromLegacy(exhibitorData.location, {
                city: exhibitorData.profileCity,
                state: exhibitorData.profileState,
                country: exhibitorData.profileCountry,
              })
              setFormData({
                ...exhibitorData,
                profileCity: loc.city,
                profileState: loc.state,
                profileCountry: loc.country,
              })
              setProductTags(exhibitorData.specialties ?? [])
            }}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={loading}
            className={cn("rounded-2xl shadow-md", exCtaGradient)}
          >
            {loading ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      )}
      </div>
    </div>
  )
}  