"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import {
  Camera,
  Edit,
  Save,
  X,
  Plus,
  MapPin,
  Phone,
  Mail,
  Globe,
  Calendar,
  Award,
  Users,
  Building,
  Upload,
  Loader2,
} from "lucide-react"
import Image from "next/image"
import { apiFetch } from "@/lib/api"

interface OrganizerData {
  id: string
  name: string
  description: string
  email: string
  phone: string
  website: string
  headquarters: string
  founded: string
  company: string
  teamSize: string
  avatar: string
  specialties: string[]
  achievements: string[]
  certifications: string[]
  firstName: string
  lastName: string
}

interface OrganizerInfoProps {
  organizerData: OrganizerData
  onOrganizerUpdated?: (data: OrganizerData) => void
}

export default function OrganizerInfo({ organizerData: initialData, onOrganizerUpdated }: OrganizerInfoProps) {
  const [isEditing, setIsEditing] = useState<string | null>(null)
  const [showImageUpload, setShowImageUpload] = useState(false)
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [newSpecialty, setNewSpecialty] = useState("")
  const [newAchievement, setNewAchievement] = useState("")
  const [newCertification, setNewCertification] = useState("")

  const [organizerData, setOrganizerData] = useState<OrganizerData>(initialData)

  // Keep local state in sync if parent data changes (e.g. after refetch)
  useEffect(() => {
    setOrganizerData(initialData)
  }, [initialData])

  type Section = "basic" | "contact" | "company" | "specialties" | "achievements" | "certifications"

  const handleSave = async (section: Section) => {
    let payload: Partial<OrganizerData> = {}

    if (section === "basic") {
      payload = {
        company: organizerData.company,
        description: organizerData.description,
      }
    } else if (section === "contact") {
      payload = {
        email: organizerData.email,
        phone: organizerData.phone,
        website: organizerData.website,
        headquarters: organizerData.headquarters,
      }
    } else if (section === "company") {
      payload = {
        founded: organizerData.founded,
        teamSize: organizerData.teamSize,
      }
    } else {
      payload = { [section]: organizerData[section] as any }
    }

    try {
      setLoading(true)
      await apiFetch(`/api/organizers/${organizerData.id}`, {
        method: "PATCH",
        body: payload,
        auth: true,
      })

      toast.success("Changes saved successfully ✅")
      setIsEditing(null)
      onOrganizerUpdated?.(organizerData)
    } catch (error: any) {
      console.error("Save error:", error)
      toast.error(error.message || "An error occurred while saving changes ❌")
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    setIsEditing(null)
    setOrganizerData(initialData)
  }

  const addSpecialty = () => {
    if (newSpecialty.trim()) {
      setOrganizerData((prev) => ({
        ...prev,
        specialties: [...prev.specialties, newSpecialty.trim()],
      }))
      setNewSpecialty("")
    }
  }

  const removeSpecialty = (index: number) => {
    setOrganizerData((prev) => ({
      ...prev,
      specialties: prev.specialties.filter((_, i) => i !== index),
    }))
  }

  const addAchievement = () => {
    if (newAchievement.trim()) {
      setOrganizerData((prev) => ({
        ...prev,
        achievements: [...prev.achievements, newAchievement.trim()],
      }))
      setNewAchievement("")
    }
  }

  const removeAchievement = (index: number) => {
    setOrganizerData((prev) => ({
      ...prev,
      achievements: prev.achievements.filter((_, i) => i !== index),
    }))
  }

  const addCertification = () => {
    if (newCertification.trim()) {
      setOrganizerData((prev) => ({
        ...prev,
        certifications: [...prev.certifications, newCertification.trim()],
      }))
      setNewCertification("")
    }
  }

  const removeCertification = (index: number) => {
    setOrganizerData((prev) => ({
      ...prev,
      certifications: prev.certifications.filter((_, i) => i !== index),
    }))
  }

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file")
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size should be less than 5MB")
      return
    }

    try {
      setUploading(true)

      // Upload to Cloudinary
      const formData = new FormData()
      formData.append("file", file)
      formData.append("type", "image")

      const uploadData = await apiFetch<{ success: boolean; url: string; publicId?: string }>(
        "/api/upload/cloudinary",
        {
          method: "POST",
          body: formData,
          auth: true,
        },
      )

      // Update local state with Cloudinary URL
      setOrganizerData((prev) => ({
        ...prev,
        avatar: uploadData.url,
      }))

      // Save to database via backend
      await apiFetch(`/api/organizers/${organizerData.id}`, {
        method: "PATCH",
        body: { avatar: uploadData.url },
        auth: true,
      })

      toast.success("Avatar updated successfully ✅")
      setShowImageUpload(false)
      onOrganizerUpdated?.({
        ...organizerData,
        avatar: uploadData.url,
      })
    } catch (error: any) {
      console.error("Avatar upload error:", error)
      toast.error(error.message || "Failed to upload avatar ❌")
    } finally {
      setUploading(false)
    }
  }

  const handleSpecialtiesDone = async () => {
    if (!organizerData.specialties || organizerData.specialties.length === 0) {
      toast.error("Please add at least one specialty before saving")
      return
    }
    await handleSave("specialties")
  }

  const handleAchievementsDone = async () => {
    if (!organizerData.achievements || organizerData.achievements.length === 0) {
      toast.error("Please add at least one achievement before saving")
      return
    }
    await handleSave("achievements")
  }

  const handleCertificationsDone = async () => {
    if (!organizerData.certifications || organizerData.certifications.length === 0) {
      toast.error("Please add at least one certification before saving")
      return
    }
    await handleSave("certifications")
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Organization Information</h2>
          <p className="text-gray-600">Manage your organization profile and details</p>
        </div>
      </div>

      {/* Profile Header */}
    <Card>
  <CardContent className="p-6">
    <div className="flex items-start gap-6">
      <div className="relative">
        {/* Avatar Container */}
        <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
          {organizerData.avatar ? (
            <Image
              src={organizerData.avatar || "/city/c4.jpg"}
              alt="Organization Logo"
              width={128}
              height={128}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
              <span className="text-4xl font-bold text-white">
                {organizerData.firstName?.[0] || ''}{organizerData.lastName?.[0] || ''}
              </span>
            </div>
          )}
        </div>
        
        {/* Camera Button */}
        <Dialog open={showImageUpload} onOpenChange={setShowImageUpload}>
          <DialogTrigger asChild>
            <Button size="sm" className="absolute -bottom-2 -right-2 rounded-full w-8 h-8 p-0 bg-blue-600 hover:bg-blue-700">
              <Camera className="w-4 h-4" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Upload Organization Logo</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                {uploading ? (
                  <div className="flex flex-col items-center">
                    <Loader2 className="w-12 h-12 mx-auto text-blue-600 mb-4 animate-spin" />
                    <p className="text-gray-600">Uploading avatar...</p>
                  </div>
                ) : (
                  <>
                    <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-600 mb-2">Drag and drop your logo here, or click to browse</p>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="image-upload"
                      disabled={uploading}
                    />
                    <label
                      htmlFor="image-upload"
                      className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 cursor-pointer"
                    >
                      Choose Image
                    </label>
                  </>
                )}
              </div>
              <p className="text-sm text-gray-500">
                Recommended: Square image, at least 200x200px, PNG or JPG format
              </p>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex-1">
        {isEditing === "basic" ? (
          <div className="space-y-4">
            <div>
              <Label htmlFor="company">Organization Name</Label>
              <Input
                id="company"
                value={organizerData.company}
                onChange={(e) => setOrganizerData((prev) => ({ ...prev, company: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={organizerData.description}
                onChange={(e) => setOrganizerData((prev) => ({ ...prev, description: e.target.value }))}
                rows={3}
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={() => handleSave("basic")} disabled={loading}>
                {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                Save
              </Button>
              <Button variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-2xl font-bold text-gray-900">{organizerData.company}</h3>
              <Button variant="outline" size="sm" onClick={() => setIsEditing("basic")}>
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
            </div>
            <p className="text-gray-600 leading-relaxed">{organizerData.description}</p>
          </div>
        )}
      </div>
    </div>
  </CardContent>
</Card>

      {/* Contact Information */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Phone className="w-5 h-5" />
              Contact Information
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(isEditing === "contact" ? null : "contact")}
            >
              <Edit className="w-4 h-4 mr-2" />
              {isEditing === "contact" ? "Cancel" : "Edit"}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isEditing === "contact" ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  {/* <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={organizerData.email}
                    onChange={(e) => setOrganizerData((prev) => ({ ...prev, email: e.target.value }))}
                  /> */}
                </div>
                <div>
                  {/* <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={organizerData.phone}
                    onChange={(e) => setOrganizerData((prev) => ({ ...prev, phone: e.target.value }))}
                  /> */}
                </div>
                <div>
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    value={organizerData.website}
                    onChange={(e) => setOrganizerData((prev) => ({ ...prev, website: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="headquarters">Headquarters</Label>
                  <Input
                    id="headquarters"
                    value={organizerData.headquarters}
                    onChange={(e) => setOrganizerData((prev) => ({ ...prev, headquarters: e.target.value }))}
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={() => handleSave("contact")} disabled={loading}>
                  {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                  Save Changes
                </Button>
                <Button variant="outline" onClick={handleCancel}>
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-medium">{organizerData.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Phone</p>
                  <p className="font-medium">{organizerData.phone}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Globe className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Website</p>
                  <p className="font-medium text-blue-600">{organizerData.website}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Headquarters</p>
                  <p className="font-medium">{organizerData.headquarters}</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Company Information */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Building className="w-5 h-5" />
              Company Information
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(isEditing === "company" ? null : "company")}
            >
              <Edit className="w-4 h-4 mr-2" />
              {isEditing === "company" ? "Cancel" : "Edit"}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isEditing === "company" ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="founded">Founded Year</Label>
                  <Input
                    id="founded"
                    value={organizerData.founded}
                    onChange={(e) => setOrganizerData((prev) => ({ ...prev, founded: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="teamSize">Team Size</Label>
                  <Input
                    id="teamSize"
                    value={organizerData.teamSize}
                    onChange={(e) => setOrganizerData((prev) => ({ ...prev, teamSize: e.target.value }))}
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={() => handleSave("company")} disabled={loading}>
                  {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                  Save Changes
                </Button>
                <Button variant="outline" onClick={handleCancel}>
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Founded</p>
                  <p className="font-medium">{organizerData.founded}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Team Size</p>
                  <p className="font-medium">{organizerData.teamSize} employees</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Specialties */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CardTitle>Event Specialties</CardTitle>
              <p className="text-xs text-gray-500 whitespace-nowrap">
                (Please click on the plus button to add, then click on Done)
              </p>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (isEditing === "specialties") {
                  handleSpecialtiesDone()
                } else {
                  setIsEditing("specialties")
                }
              }}
            >
              <Edit className="w-4 h-4 mr-2" />
              {isEditing === "specialties" ? "Done" : "Edit"}
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          <div className="flex flex-wrap gap-2 mb-4">
            {organizerData.specialties.map((specialty, index) => (
              <Badge key={index} variant="secondary" className="flex items-center gap-1">
                {specialty}
                {isEditing === "specialties" && (
                  <X
                    className="w-3 h-3 cursor-pointer hover:text-red-500"
                    onClick={(e) => {
                      e.stopPropagation()
                      removeSpecialty(index)
                    }}
                  />
                )}
              </Badge>
            ))}
          </div>

          {isEditing === "specialties" && (
            <div className="flex gap-2">
              <Input
                value={newSpecialty}
                onChange={(e) => setNewSpecialty(e.target.value)}
                placeholder="Add new specialty"
                onKeyPress={(e) => e.key === "Enter" && addSpecialty()}
              />
              <Button onClick={addSpecialty}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Achievements */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CardTitle className="flex items-center gap-2">
                <Award className="w-5 h-5" />
                Achievements & Awards
              </CardTitle>
              <p className="text-xs text-gray-500 whitespace-nowrap">
                (Please click on the plus button to add, then click on Done)
              </p>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (isEditing === "achievements") {
                  handleAchievementsDone()
                } else {
                  setIsEditing("achievements")
                }
              }}
            >
              <Edit className="w-4 h-4 mr-2" />
              {isEditing === "achievements" ? "Done" : "Edit"}
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          <div className="space-y-3 mb-4">
            {organizerData.achievements.map((achievement, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2" />
                <div className="flex-1">
                  <p className="text-gray-800">{achievement}</p>
                </div>
                {isEditing === "achievements" && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeAchievement(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                )}
              </div>
            ))}
          </div>

          {isEditing === "achievements" && (
            <div className="flex gap-2">
              <Input
                value={newAchievement}
                onChange={(e) => setNewAchievement(e.target.value)}
                placeholder="Add new achievement"
                onKeyPress={(e) => e.key === "Enter" && addAchievement()}
              />
              <Button onClick={addAchievement}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Certifications */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CardTitle>Certifications & Licenses</CardTitle>
              <p className="text-xs text-gray-500 whitespace-nowrap">
                (Please click on the plus button to add, then click on Done)
              </p>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (isEditing === "certifications") {
                  handleCertificationsDone()
                } else {
                  setIsEditing("certifications")
                }
              }}
            >
              <Edit className="w-4 h-4 mr-2" />
              {isEditing === "certifications" ? "Done" : "Edit"}
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          <div className="space-y-3 mb-4">
            {organizerData.certifications.map((certification, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200"
              >
                <div className="flex items-center gap-3">
                  <Award className="w-5 h-5 text-green-600" />
                  <p className="font-medium text-gray-800">{certification}</p>
                </div>
                {isEditing === "certifications" && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeCertification(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                )}
              </div>
            ))}
          </div>

          {isEditing === "certifications" && (
            <div className="flex gap-2">
              <Input
                value={newCertification}
                onChange={(e) => setNewCertification(e.target.value)}
                placeholder="Add new certification"
                onKeyPress={(e) => e.key === "Enter" && addCertification()}
              />
              <Button onClick={addCertification}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
