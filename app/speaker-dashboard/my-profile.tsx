"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Edit, Save, Camera, MapPin, Mail, Phone, Linkedin, Globe, User, Briefcase, Building2, Mic2 } from "lucide-react"
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
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith("image/")) {
      toast({ title: "Error", description: "Please select an image file", variant: "destructive" })
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "Error", description: "Image size should be less than 5MB", variant: "destructive" })
      return
    }
    try {
      setUploadingAvatar(true)
      const formData = new FormData()
      formData.append("file", file)
      formData.append("folder", "avatars")
      const data = await apiFetch<{ success: boolean; url: string; publicId?: string }>("/api/upload/cloudinary", {
        method: "POST", body: formData, auth: true,
      })
      setProfile((prev) => (prev ? { ...prev, avatar: data.url } : null))
      toast({ title: "Success", description: "Avatar uploaded successfully" })
    } catch (error) {
      toast({ title: "Error", description: error instanceof Error ? error.message : "Failed to upload avatar", variant: "destructive" })
    } finally {
      setUploadingAvatar(false)
    }
  }

  const handleSave = async () => {
    if (!profile) return
    try {
      setLoading(true)
      const data = await apiFetch<{ success: boolean; profile: SpeakerProfile; error?: string }>(
        `/api/speakers/${speakerId}`, { method: "PUT", body: profile, auth: true }
      )
      if (data.success && data.profile) {
        setProfile(data.profile)
        toast({ title: "Success", description: "Profile updated successfully" })
        setIsEditing(false)
      } else {
        throw new Error(data.error || "Update failed")
      }
    } catch (error) {
      toast({ title: "Error", description: error instanceof Error ? error.message : "Failed to update profile", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const data = await apiFetch<{ success: boolean; profile: SpeakerProfile }>(`/api/speakers/${speakerId}`, { auth: true })
        if (data.success) setProfile(data.profile)
      } catch (err) { console.error(err) }
    }
    loadProfile()
  }, [speakerId])

  if (!profile) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-2xl animate-pulse" style={{ background: "linear-gradient(135deg, #dbeafe, #ede9fe)" }} />
          <p className="text-sm text-slate-400 font-medium">Loading profile…</p>
        </div>
      </div>
    )
  }

  const fields = [
    { id: "fullName", label: "Full Name", value: profile.fullName, icon: <User className="w-4 h-4" /> },
    { id: "designation", label: "Designation", value: profile.designation, icon: <Briefcase className="w-4 h-4" /> },
    { id: "company", label: "Company / Institution", value: profile.company, icon: <Building2 className="w-4 h-4" /> },
    { id: "location", label: "Location", value: profile.location, icon: <MapPin className="w-4 h-4" /> },
    { id: "email", label: "Email", value: profile.email, type: "email", icon: <Mail className="w-4 h-4" />, readOnly: true },
    { id: "phone", label: "Phone", value: profile.phone, icon: <Phone className="w-4 h-4" />, readOnly: true },
    { id: "linkedin", label: "LinkedIn", value: profile.linkedin, icon: <Linkedin className="w-4 h-4" /> },
    { id: "website", label: "Website", value: profile.website, icon: <Globe className="w-4 h-4" /> },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">My Profile</h2>
          <p className="text-xs text-slate-400 mt-0.5 font-medium">Manage your public speaker profile</p>
        </div>
        <button
          onClick={() => isEditing ? handleSave() : setIsEditing(true)}
          disabled={loading}
          className="flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-semibold text-white shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-60"
          style={{ background: "linear-gradient(135deg, #2563eb, #7c3aed)" }}
        >
          {isEditing ? <Save className="w-4 h-4" /> : <Edit className="w-4 h-4" />}
          {isEditing ? "Save Changes" : "Edit Profile"}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Avatar card */}
        <div
          className="rounded-2xl p-6 flex flex-col items-center gap-5"
          style={{
            background: "linear-gradient(135deg, rgba(219,234,254,0.4), rgba(237,233,254,0.4))",
            border: "1px solid rgba(255,255,255,0.8)",
          }}
        >
          <div className="relative">
            <div className="w-28 h-28 rounded-3xl overflow-hidden ring-4 ring-white shadow-lg">
              <Avatar className="w-full h-full rounded-3xl">
                <AvatarImage src={profile.avatar } alt={profile.fullName} className="object-cover" />
                <AvatarFallback
                  className="text-2xl font-bold rounded-3xl"
                  style={{ background: "linear-gradient(135deg, #dbeafe, #ede9fe)", color: "#2563eb" }}
                >
                  {profile.fullName?.charAt(0)}
                </AvatarFallback>
              </Avatar>
            </div>
            {isEditing && (
              <>
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingAvatar}
                  className="absolute -bottom-2 -right-2 w-9 h-9 rounded-xl flex items-center justify-center text-white shadow-lg hover:shadow-xl transition-all"
                  style={{ background: "linear-gradient(135deg, #2563eb, #7c3aed)" }}
                >
                  <Camera className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
          <div className="text-center space-y-1">
            <h3 className="font-bold text-slate-800 text-base">{profile.fullName}</h3>
            <p className="text-sm text-slate-500 font-medium">{profile.designation}</p>
            <p className="text-xs text-slate-400">{profile.company}</p>
          </div>
          <div
            className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-semibold"
            style={{ background: "rgba(255,255,255,0.7)", color: "#2563eb" }}
          >
            <Mic2 className="w-3.5 h-3.5" />
            Speaker
          </div>
        </div>

        {/* Contact info */}
        <div
          className="lg:col-span-2 rounded-2xl p-6"
          style={{
            background: "rgba(255,255,255,0.7)",
            border: "1px solid rgba(255,255,255,0.9)",
          }}
        >
          <h3 className="text-sm font-bold text-slate-700 mb-4 uppercase tracking-wider">Contact Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {fields.map((field) => (
              <div key={field.id} className="space-y-1.5">
                <Label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">{field.label}</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">{field.icon}</span>
                  <Input
                    id={field.id}
                    type={field.type || "text"}
                    value={field.value || ""}
                    onChange={(e) => !field.readOnly && setProfile({ ...profile, [field.id]: e.target.value })}
                    disabled={!isEditing || field.readOnly}
                    className="pl-9 rounded-xl text-sm border-slate-200/60 bg-slate-50/60 focus:bg-white transition-colors disabled:opacity-60 disabled:cursor-default"
                    style={isEditing && !field.readOnly ? { borderColor: "rgba(99,102,241,0.3)", background: "white" } : {}}
                  />
                  {field.readOnly && isEditing && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] font-bold text-slate-300 uppercase tracking-wider">locked</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bio & Experience */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {[
          { title: "Professional Bio", key: "bio", value: profile.bio, placeholder: "Tell your professional story…" },
          { title: "Speaking Experience", key: "speakingExperience", value: profile.speakingExperience, placeholder: "Describe your speaking background…" },
        ].map((section) => (
          <div
            key={section.key}
            className="rounded-2xl p-6"
            style={{ background: "rgba(255,255,255,0.7)", border: "1px solid rgba(255,255,255,0.9)" }}
          >
            <h3 className="text-sm font-bold text-slate-700 mb-3 uppercase tracking-wider">{section.title}</h3>
            <Textarea
              value={section.value || ""}
              onChange={(e) => setProfile({ ...profile, [section.key]: e.target.value })}
              disabled={!isEditing}
              rows={6}
              placeholder={section.placeholder}
              className="resize-none rounded-xl border-slate-200/60 bg-slate-50/60 text-sm text-slate-700 focus:bg-white transition-colors disabled:opacity-70 disabled:cursor-default"
              style={isEditing ? { borderColor: "rgba(99,102,241,0.3)", background: "white" } : {}}
            />
          </div>
        ))}
      </div>
    </div>
  )
}