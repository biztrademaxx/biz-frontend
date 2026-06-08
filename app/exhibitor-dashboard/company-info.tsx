"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
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
}

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
  const [categories, setCategories] = useState<string[]>(["Technology", "Software", "AI/ML"])

  useEffect(() => {
    setFormData(exhibitorData)
  }, [exhibitorData])

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
      await onUpdate(formData)
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

  const handleAddCategory = (newCategory: string) => {
    if (newCategory.trim() && !categories.includes(newCategory.trim())) {
      setCategories([...categories, newCategory.trim()])
    }
  }

  const handleRemoveCategory = (categoryToRemove: string) => {
    setCategories(categories.filter((cat) => cat !== categoryToRemove))
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
    <div className="relative">
      <div className={exCompanyGlowLayer} aria-hidden />
      <div className="relative z-10 space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-2xl font-bold tracking-tight text-slate-800 md:text-3xl">
            Company Information
          </h1>
          <Button
            onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
            className={cn("flex items-center gap-2 shadow-md", exCtaGradient)}
            disabled={loading}
          >
            {isEditing ? <Save className="w-4 h-4" /> : <Edit className="w-4 h-4" />}
            {loading ? "Saving..." : isEditing ? "Save Changes" : "Edit Profile"}
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Company Logo & Banner */}
          <Card className={exGlassCardPremium}>
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
              {isEditing && (
                <Button variant="outline" size="sm" className="w-full border-[#004A96]/30 bg-white/40 backdrop-blur-sm">
                  <Upload className="w-4 h-4" />
                  Upload Banner
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card className={exGlassCardPremium}>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-slate-800">
              <User className="h-5 w-5 text-[#004A96]" />
              Contact Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={cn(exGlassNested, "space-y-4 p-5")}>
            <div className="grid grid-cols-2 gap-4">
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
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-[#004A96]/60" />
                <div className="flex items-center justify-between rounded-md border border-white/60 bg-white/45 p-2 backdrop-blur-sm">
                  <span className="text-sm pl-7">{formData.email}</span>
                  {!isEditing && (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  )}
                </div>
              </div>
              {isEditing && (
                <p className="text-xs text-muted-foreground">
                  Email cannot be edited
                </p>
              )}
            </div>

            {/* Phone Field - Always Read Only */}
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-[#004A96]/60" />
                <div className="flex items-center justify-between rounded-md border border-white/60 bg-white/45 p-2 backdrop-blur-sm">
                  <span className="text-sm pl-7">{formData.phone || "Not provided"}</span>
                  {!isEditing && formData.phone && (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  )}
                </div>
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

        {/* Social Media Links */}
        <Card className={exGlassCardPremium}>
          <CardHeader className="pb-3">
            <CardTitle className="text-slate-800">Social Media Links</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={cn(exGlassNested, "space-y-4 p-5")}>
            {socialLinks.map((social) => (
              <div key={social.name} className="flex items-center gap-3">
                <social.icon className={`w-5 h-5 ${social.color}`} />
                <div className="flex-1">
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
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className={exGlassCardPremium}>
          <CardHeader className="pb-3">
            <CardTitle className="text-slate-800">Product Categories / Services</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={cn(exGlassNested, "space-y-4 p-5")}>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <Badge
                  key={category}
                  variant="secondary"
                  className="flex items-center gap-1 border-[#004A96]/20 bg-[#004A96]/10 text-[#004A96]"
                >
                  {category}
                  {isEditing && (
                    <X
                      className="h-3 w-3 cursor-pointer hover:text-[#004A96]"
                      onClick={() => handleRemoveCategory(category)}
                    />
                  )}
                </Badge>
              ))}
            </div>

            {isEditing && (
              <div className="flex gap-2">
                <Input
                  placeholder="Add new category"
                  className={exInput}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      handleAddCategory(e.currentTarget.value)
                      e.currentTarget.value = ""
                    }
                  }}
                />
                <Button
                  onClick={() => {
                    const input = document.querySelector('input[placeholder="Add new category"]') as HTMLInputElement
                    if (input) {
                      handleAddCategory(input.value)
                      input.value = ""
                    }
                  }}
                  size="sm"
                  className={cn("shadow-md", exCtaGradient)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            )}
            </div>
          </CardContent>
        </Card>

        <Card className={exGlassCardPremium}>
          <CardHeader className="pb-3">
            <CardTitle className="text-slate-800">Company Description</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={cn(exGlassNested, "p-5")}>
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