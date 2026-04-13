"use client"

import { useState, useEffect } from "react"
import { apiFetch } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Search, Plus, X, User, Mic } from "lucide-react"

interface Speaker {
  id: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  company?: string
  jobTitle?: string
  speakingExperience?: string
  bio?: string
  location?: string
  website?: string
  linkedin?: string
  twitter?: string
  specialties?: string[]
  achievements?: string[]
  certifications?: string[]
  isVerified?: boolean
  totalEvents?: number
  activeEvents?: number
  totalAttendees?: number
  totalRevenue?: number
  averageRating?: number
  totalReviews?: number
}

interface SpeakerSession {
  speakerId: string
  title: string
  description: string
  sessionType: string
  duration: number
  startTime: string
  endTime: string
  room?: string
}

interface SelectSpeakersProps {
  speakerSessions: SpeakerSession[]
  onSpeakerSessionsChange: (sessions: SpeakerSession[]) => void
}

export function SelectSpeakers({ speakerSessions, onSpeakerSessionsChange }: SelectSpeakersProps) {
  const [speakers, setSpeakers] = useState<Speaker[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newSpeaker, setNewSpeaker] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    company: "",
    jobTitle: "",
    speakingExperience: "",
    bio: "",
    location: "",
    website: "",
    linkedin: "",
    twitter: "",
    specialties: [] as string[],
    achievements: [] as string[],
    certifications: [] as string[],
  })
  const [newSession, setNewSession] = useState<SpeakerSession>({
    speakerId: "",
    title: "",
    description: "",
    sessionType: "PRESENTATION",
    duration: 60,
    startTime: "",
    endTime: "",
    room: ""
  })

  useEffect(() => {
    fetchSpeakers()
  }, [])

  const fetchSpeakers = async () => {
    try {
      setIsLoading(true)
      const data = await apiFetch<{ success?: boolean; speakers?: Speaker[] }>(
        "/api/speakers",
        { auth: true }
      )
      const list = Array.isArray(data?.speakers) ? data.speakers : []
      setSpeakers(list)
    } catch (error) {
      console.error("Error fetching speakers:", error)
      setSpeakers([])
    } finally {
      setIsLoading(false)
    }
  }

  const filteredSpeakers = speakers.filter(speaker =>
    speaker.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    speaker.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    speaker.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    speaker.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    speaker.jobTitle?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleCreateSpeaker = async () => {
    if (!newSpeaker.firstName || !newSpeaker.lastName || !newSpeaker.email) {
      alert("Please fill in all required fields: First Name, Last Name, and Email")
      return
    }

    try {
      setIsLoading(true)
      const response = await fetch('/api/speakers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newSpeaker),
      })

      const data = await response.json()
      
      if (data.success && data.speaker) {
        const createdSpeaker = data.speaker
        setSpeakers(prev => [...prev, createdSpeaker])
        
        // Set the new session's speaker ID
        setNewSession(prev => ({ ...prev, speakerId: createdSpeaker.id }))
        
        // Reset form
        setShowCreateForm(false)
        setNewSpeaker({
          firstName: "",
          lastName: "",
          email: "",
          phone: "",
          company: "",
          jobTitle: "",
          speakingExperience: "",
          bio: "",
          location: "",
          website: "",
          linkedin: "",
          twitter: "",
          specialties: [],
          achievements: [],
          certifications: [],
        })
        
        alert("Speaker created successfully!")
      } else {
        alert(`Error creating speaker: ${(data as { error?: string })?.error ?? "Unknown error"}`)
      }
    } catch (error) {
      console.error("Error creating speaker:", error)
      alert("Error creating speaker. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddSession = () => {
    if (!newSession.speakerId || !newSession.title || !newSession.startTime || !newSession.endTime) {
      alert("Please fill in all required session fields: Speaker, Title, Start Time, and End Time")
      return
    }

    onSpeakerSessionsChange([...speakerSessions, newSession])
    setNewSession({
      speakerId: "",
      title: "",
      description: "",
      sessionType: "PRESENTATION",
      duration: 60,
      startTime: "",
      endTime: "",
      room: ""
    })
  }

  const handleRemoveSession = (index: number) => {
    onSpeakerSessionsChange(speakerSessions.filter((_, i) => i !== index))
  }

  const getSpeakerName = (speakerId: string) => {
    const speaker = speakers.find(s => s.id === speakerId)
    return speaker ? `${speaker.firstName} ${speaker.lastName}` : "Unknown Speaker"
  }

  const handleSpecialtyChange = (value: string) => {
    const specialties = value.split(',').map(s => s.trim()).filter(s => s)
    setNewSpeaker(prev => ({ ...prev, specialties }))
  }

  const handleAchievementChange = (value: string) => {
    const achievements = value.split(',').map(s => s.trim()).filter(s => s)
    setNewSpeaker(prev => ({ ...prev, achievements }))
  }

  const handleCertificationChange = (value: string) => {
    const certifications = value.split(',').map(s => s.trim()).filter(s => s)
    setNewSpeaker(prev => ({ ...prev, certifications }))
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mic className="w-5 h-5" />
          Speaker Sessions
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Add speakers and their sessions to your event
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Add New Session */}
        <div className="p-4 border rounded-lg space-y-4">
          <h4 className="font-medium">Add Speaker Session</h4>
          
          {/* Speaker Selection */}
          <div className="space-y-3">
            <Label>Select Speaker *</Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search speakers..."
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
                New Speaker
              </Button>
            </div>

            {!showCreateForm && (
              <Select 
                value={newSession.speakerId} 
                onValueChange={(value) => setNewSession(prev => ({ ...prev, speakerId: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a speaker" />
                </SelectTrigger>
                <SelectContent>
                  {isLoading ? (
                    <SelectItem value="loading" disabled>Loading speakers...</SelectItem>
                  ) : filteredSpeakers.length === 0 ? (
                    <SelectItem value="no-results" disabled>No speakers found</SelectItem>
                  ) : (
                    filteredSpeakers.map((speaker) => (
                      <SelectItem key={speaker.id} value={speaker.id}>
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4" />
                          <div>
                            <div className="font-medium">
                              {speaker.firstName} {speaker.lastName}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {speaker.company} • {speaker.jobTitle} • {speaker.email}
                            </div>
                          </div>
                        </div>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            )}

            {/* Create New Speaker Form */}
            {showCreateForm && (
              <div className="p-4 border rounded-lg space-y-4">
                <h5 className="font-medium">Create New Speaker</h5>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="speakerFirstName">First Name *</Label>
                    <Input
                      id="speakerFirstName"
                      value={newSpeaker.firstName}
                      onChange={(e) => setNewSpeaker(prev => ({ ...prev, firstName: e.target.value }))}
                      placeholder="John"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="speakerLastName">Last Name *</Label>
                    <Input
                      id="speakerLastName"
                      value={newSpeaker.lastName}
                      onChange={(e) => setNewSpeaker(prev => ({ ...prev, lastName: e.target.value }))}
                      placeholder="Doe"
                      required
                    />
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor="speakerEmail">Email *</Label>
                    <Input
                      id="speakerEmail"
                      type="email"
                      value={newSpeaker.email}
                      onChange={(e) => setNewSpeaker(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="john@example.com"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="speakerPhone">Phone</Label>
                    <Input
                      id="speakerPhone"
                      value={newSpeaker.phone}
                      onChange={(e) => setNewSpeaker(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                  <div>
                    <Label htmlFor="speakerCompany">Company</Label>
                    <Input
                      id="speakerCompany"
                      value={newSpeaker.company}
                      onChange={(e) => setNewSpeaker(prev => ({ ...prev, company: e.target.value }))}
                      placeholder="Tech Corp"
                    />
                  </div>
                  <div>
                    <Label htmlFor="speakerJobTitle">Job Title</Label>
                    <Input
                      id="speakerJobTitle"
                      value={newSpeaker.jobTitle}
                      onChange={(e) => setNewSpeaker(prev => ({ ...prev, jobTitle: e.target.value }))}
                      placeholder="Senior Developer"
                    />
                  </div>
                  <div>
                    <Label htmlFor="speakerLocation">Location</Label>
                    <Input
                      id="speakerLocation"
                      value={newSpeaker.location}
                      onChange={(e) => setNewSpeaker(prev => ({ ...prev, location: e.target.value }))}
                      placeholder="San Francisco, CA"
                    />
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor="speakerExperience">Speaking Experience</Label>
                    <Input
                      id="speakerExperience"
                      value={newSpeaker.speakingExperience}
                      onChange={(e) => setNewSpeaker(prev => ({ ...prev, speakingExperience: e.target.value }))}
                      placeholder="5+ years in industry conferences"
                    />
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor="speakerSpecialties">Specialties (comma-separated)</Label>
                    <Input
                      id="speakerSpecialties"
                      value={newSpeaker.specialties?.join(', ')}
                      onChange={(e) => handleSpecialtyChange(e.target.value)}
                      placeholder="AI, Machine Learning, Cloud Computing"
                    />
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor="speakerAchievements">Achievements (comma-separated)</Label>
                    <Input
                      id="speakerAchievements"
                      value={newSpeaker.achievements?.join(', ')}
                      onChange={(e) => handleAchievementChange(e.target.value)}
                      placeholder="Published Author, TEDx Speaker, Industry Awards"
                    />
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor="speakerCertifications">Certifications (comma-separated)</Label>
                    <Input
                      id="speakerCertifications"
                      value={newSpeaker.certifications?.join(', ')}
                      onChange={(e) => handleCertificationChange(e.target.value)}
                      placeholder="AWS Certified, PMP, Scrum Master"
                    />
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor="speakerBio">Bio</Label>
                    <Textarea
                      id="speakerBio"
                      value={newSpeaker.bio}
                      onChange={(e) => setNewSpeaker(prev => ({ ...prev, bio: e.target.value }))}
                      placeholder="Brief biography of the speaker..."
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label htmlFor="speakerWebsite">Website</Label>
                    <Input
                      id="speakerWebsite"
                      value={newSpeaker.website}
                      onChange={(e) => setNewSpeaker(prev => ({ ...prev, website: e.target.value }))}
                      placeholder="https://example.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="speakerLinkedin">LinkedIn</Label>
                    <Input
                      id="speakerLinkedin"
                      value={newSpeaker.linkedin}
                      onChange={(e) => setNewSpeaker(prev => ({ ...prev, linkedin: e.target.value }))}
                      placeholder="https://linkedin.com/in/username"
                    />
                  </div>
                  <div>
                    <Label htmlFor="speakerTwitter">Twitter</Label>
                    <Input
                      id="speakerTwitter"
                      value={newSpeaker.twitter}
                      onChange={(e) => setNewSpeaker(prev => ({ ...prev, twitter: e.target.value }))}
                      placeholder="https://twitter.com/username"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleCreateSpeaker} disabled={isLoading}>
                    {isLoading ? "Creating..." : (
                      <>
                        <Plus className="w-4 h-4 mr-2" />
                        Create Speaker
                      </>
                    )}
                  </Button>
                  <Button variant="outline" onClick={() => setShowCreateForm(false)} disabled={isLoading}>
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Session Details */}
          {newSession.speakerId && (
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label htmlFor="sessionTitle">Session Title *</Label>
                <Input
                  id="sessionTitle"
                  value={newSession.title}
                  onChange={(e) => setNewSession(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Introduction to AI and Machine Learning"
                />
              </div>
              <div className="col-span-2">
                <Label htmlFor="sessionDescription">Description</Label>
                <Textarea
                  id="sessionDescription"
                  value={newSession.description}
                  onChange={(e) => setNewSession(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Session description..."
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="sessionType">Session Type</Label>
                <Select 
                  value={newSession.sessionType} 
                  onValueChange={(value) => setNewSession(prev => ({ ...prev, sessionType: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="KEYNOTE">Keynote</SelectItem>
                    <SelectItem value="PRESENTATION">Presentation</SelectItem>
                    <SelectItem value="WORKSHOP">Workshop</SelectItem>
                    <SelectItem value="PANEL">Panel Discussion</SelectItem>
                    <SelectItem value="ROUNDTABLE">Roundtable</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="sessionDuration">Duration (minutes)</Label>
                <Input
                  id="sessionDuration"
                  type="number"
                  value={newSession.duration}
                  onChange={(e) => setNewSession(prev => ({ ...prev, duration: Number(e.target.value) }))}
                  placeholder="60"
                  min="5"
                  max="480"
                />
              </div>
              <div>
                <Label htmlFor="sessionStart">Start Time *</Label>
                <Input
                  id="sessionStart"
                  type="datetime-local"
                  value={newSession.startTime}
                  onChange={(e) => setNewSession(prev => ({ ...prev, startTime: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="sessionEnd">End Time *</Label>
                <Input
                  id="sessionEnd"
                  type="datetime-local"
                  value={newSession.endTime}
                  onChange={(e) => setNewSession(prev => ({ ...prev, endTime: e.target.value }))}
                />
              </div>
              <div className="col-span-2">
                <Label htmlFor="sessionRoom">Room/Location</Label>
                <Input
                  id="sessionRoom"
                  value={newSession.room}
                  onChange={(e) => setNewSession(prev => ({ ...prev, room: e.target.value }))}
                  placeholder="Main Hall, Room A, etc."
                />
              </div>
            </div>
          )}

          <Button onClick={handleAddSession} disabled={!newSession.speakerId}>
            <Plus className="w-4 h-4 mr-2" />
            Add Session
          </Button>
        </div>

        {/* Current Sessions */}
        {speakerSessions.length > 0 && (
          <div className="space-y-3">
            <Label>Current Sessions ({speakerSessions.length})</Label>
            {speakerSessions.map((session, index) => (
              <div key={index} className="p-3 border rounded-lg flex items-center justify-between">
                <div className="flex-1">
                  <div className="font-medium">{session.title}</div>
                  <div className="text-sm text-muted-foreground">
                    {getSpeakerName(session.speakerId)} • {session.sessionType} • {session.duration}min
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {new Date(session.startTime).toLocaleString()} - {new Date(session.endTime).toLocaleString()}
                    {session.room && ` • ${session.room}`}
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleRemoveSession(index)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}