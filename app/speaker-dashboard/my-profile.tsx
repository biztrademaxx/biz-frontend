"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Edit, Save, Camera, MapPin, Mail, Phone, Linkedin, Globe } from "lucide-react"
import { apiFetch } from "@/lib/api"

type SpeakerProfile = {
  fullName: string
  designation: string
  company: string
  email: string
  phone: string
  linkedin: string
  website: string
  location: string
  bio: string
  speakingExperience: string
  avatar?: string
}

export default function MyProfile({ speakerId }: { speakerId: string }) {
  const [isEditing, setIsEditing] = useState(false)
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [profile, setProfile] = useState<SpeakerProfile | null>(null)
  const [newExpertise, setNewExpertise] = useState("")
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith("image/")) {
      toast({
        title: "Error",
        description: "Please select an image file",
        variant: "destructive",
      })
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Error",
        description: "Image size should be less than 5MB",
        variant: "destructive",
      })
      return
    }

    try {
      setUploadingAvatar(true)

      const formData = new FormData()
      formData.append("file", file)
      formData.append("folder", "avatars")

      const data = await apiFetch<{ success: boolean; url: string; publicId?: string }>(
        "/api/upload/cloudinary",
        {
          method: "POST",
          body: formData,
          auth: true,
        },
      )

      setProfile((prev) => (prev ? { ...prev, avatar: data.url } : null))

      toast({
        title: "Success",
        description: "Avatar uploaded successfully",
      })
    } catch (error) {
      console.error("Error uploading avatar:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to upload avatar",
        variant: "destructive",
      })
    } finally {
      setUploadingAvatar(false)
    }
  }

  const handleSave = async () => {
    if (!profile) return
    try {
      setLoading(true)
      const data = await apiFetch<{ success: boolean; profile: SpeakerProfile; error?: string }>(
        `/api/speakers/${speakerId}`,
        {
          method: "PUT",
          body: profile,
          auth: true,
        },
      )

      if (data.success && data.profile) {
        setProfile(data.profile)
        toast({
          title: "Success",
          description: "Profile updated successfully",
        })
        setIsEditing(false)
      } else {
        throw new Error(data.error || "Update failed")
      }
    } catch (error) {
      console.error("Error updating profile:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update profile",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const data = await apiFetch<{ success: boolean; profile: SpeakerProfile }>(
          `/api/speakers/${speakerId}`,
          { auth: true },
        )
        if (data.success) {
          setProfile(data.profile)
        }
      } catch (err) {
        console.error(err)
      }
    }
    loadProfile()
  }, [speakerId])

  if (!profile) {
    return <p>Loading profile...</p>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">My Profile</h2>
        <Button
          onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
          className="flex items-center space-x-2"
          disabled={loading}
        >
          {isEditing ? <Save className="h-4 w-4" /> : <Edit className="h-4 w-4" />}
          <span>{isEditing ? "Save Changes" : "Edit Profile"}</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Profile Picture</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                <Avatar className="w-32 h-32">
                  <AvatarImage src={profile.avatar || "/city/c4.jpg"} alt={profile.fullName} />
                  <AvatarFallback className="text-2xl">{profile.fullName?.charAt(0)}</AvatarFallback>
                </Avatar>
                {isEditing && (
                  <>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      className="hidden"
                    />
                    <Button
                      size="sm"
                      className="absolute bottom-0 right-0 rounded-full w-8 h-8 p-0"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingAvatar}
                    >
                      <Camera className="h-4 w-4" />
                    </Button>
                  </>
                )}
              </div>
              <div className="text-center">
                <h3 className="font-semibold text-lg">{profile.fullName}</h3>
                <p className="text-gray-600">{profile.designation}</p>
                <p className="text-gray-500">{profile.company}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                {
                  id: "fullName",
                  label: "Full Name",
                  value: profile.fullName,
                },
                {
                  id: "designation",
                  label: "Designation",
                  value: profile.designation,
                },
                {
                  id: "company",
                  label: "Company/Institution",
                  value: profile.company,
                },
                {
                  id: "location",
                  label: "Location",
                  value: profile.location,
                  icon: <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />,
                },
                {
                  id: "email",
                  label: "Email",
                  value: profile.email,
                  type: "email",
                  icon: <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />,
                  readOnly: true, // 👈 make this field read-only
                },
                {
                  id: "phone",
                  label: "Phone",
                  value: profile.phone,
                  icon: <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />,
                  readOnly: true, // 👈 make this field read-only
                },
                {
                  id: "linkedin",
                  label: "LinkedIn",
                  value: profile.linkedin,
                  icon: <Linkedin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />,
                },
                {
                  id: "website",
                  label: "Website",
                  value: profile.website,
                  icon: <Globe className="absolute left-3 top-3 h-4 w-4 text-gray-400" />,
                },
              ].map((field) => (
                <div key={field.id} className="space-y-2">
                  <Label htmlFor={field.id}>{field.label}</Label>
                  <div className="relative">
                    {field.icon}
                    <Input
                      id={field.id}
                      type={field.type || "text"}
                      value={field.value || ""}
                      onChange={(e) =>
                        !field.readOnly && setProfile({ ...profile, [field.id]: e.target.value })
                      }
                      disabled={!isEditing || field.readOnly} // 👈 disable permanently for read-only
                      className={field.icon ? "pl-10" : ""}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Professional Bio</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={profile.bio}
              onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
              disabled={!isEditing}
              rows={6}
              className="resize-none"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Speaking Experience</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={profile.speakingExperience}
              onChange={(e) => setProfile({ ...profile, speakingExperience: e.target.value })}
              disabled={!isEditing}
              rows={6}
              className="resize-none"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
