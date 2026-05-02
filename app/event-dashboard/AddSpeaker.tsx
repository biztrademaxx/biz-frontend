"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Plus, User, Mail, Phone, Building, Globe, Linkedin, Twitter } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { apiFetch } from "@/lib/api"

interface Speaker {
  id: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  avatar?: string
  bio?: string
  company?: string
  jobTitle?: string
  location?: string
  website?: string
  linkedin?: string
  twitter?: string
  specialties: string[]
  achievements: string[]
  certifications: string[]
  speakingExperience?: string
}

interface Event {
  id: string
  title: string
  startDate: string
  endDate: string
}

interface AddSpeakerProps {
  eventId: string
}

export default function AddSpeaker({ eventId }: AddSpeakerProps) {
  const [speakers, setSpeakers] = useState<Speaker[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedSpeaker, setSelectedSpeaker] = useState<Speaker | null>(null)
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("existing")
  const { toast } = useToast()

  // New speaker form state
  const [newSpeaker, setNewSpeaker] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    bio: "",
    company: "",
    jobTitle: "",
    location: "",
    website: "",
    linkedin: "",
    twitter: "",
    specialties: [] as string[],
    achievements: [] as string[],
    certifications: [] as string[],
    speakingExperience: "",
  })

  // Session details form state
  const [sessionDetails, setSessionDetails] = useState({
    title: "",
    description: "",
    sessionType: "",
    duration: "",
    startTime: "",
    endTime: "",
    room: "",
    abstract: "",
    learningObjectives: [] as string[],
    targetAudience: "",
    materials: [] as string[],
  })

  const [newSpecialty, setNewSpecialty] = useState("")
  const [newAchievement, setNewAchievement] = useState("")
  const [newCertification, setNewCertification] = useState("")
  const [newObjective, setNewObjective] = useState("")
  const [newMaterial, setNewMaterial] = useState("")

  useEffect(() => {
    fetchSpeakers()
  }, [])

  const fetchSpeakers = async () => {
    try {
      const data = await apiFetch<{ success?: boolean; speakers?: Speaker[] }>("/api/speakers", {
        auth: false,
      })
      setSpeakers(data.speakers || [])
    } catch (error) {
      console.error("Error fetching speakers:", error)
    }
  }

  const filteredSpeakers = speakers.filter(
    (speaker) =>
      `${speaker.firstName} ${speaker.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (speaker.email ?? "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (speaker.company ?? "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (speaker.specialties ?? []).some((s) => String(s).toLowerCase().includes(searchTerm.toLowerCase())),
  )

  const handleCreateSpeaker = async () => {
    if (!newSpeaker.firstName || !newSpeaker.lastName || !newSpeaker.email) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      const data = await apiFetch<{ success?: boolean; speaker?: Speaker; error?: string }>(
        "/api/speakers",
        {
          method: "POST",
          body: newSpeaker,
          auth: true,
        },
      )
      if (data.success && data.speaker) {
        toast({
          title: "Success",
          description: "Speaker created successfully.",
        })
        setNewSpeaker({
          firstName: "",
          lastName: "",
          email: "",
          phone: "",
          bio: "",
          company: "",
          jobTitle: "",
          location: "",
          website: "",
          linkedin: "",
          twitter: "",
          specialties: [],
          achievements: [],
          certifications: [],
          speakingExperience: "",
        })
        fetchSpeakers()
        setActiveTab("existing")
        setSelectedSpeaker(data.speaker)
      } else {
        throw new Error(data.error || "Failed to create speaker")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create speaker.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAddSpeakerToEvent = async () => {
    if (!selectedSpeaker || !sessionDetails.title || !sessionDetails.sessionType) {
      toast({
        title: "Missing Information",
        description: "Please select a speaker and fill in session details.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      await apiFetch("/api/events/speakers", {
        method: "POST",
        body: {
          eventId,
          speakerId: selectedSpeaker.id,
          title: sessionDetails.title,
          description: sessionDetails.description,
          sessionType: sessionDetails.sessionType,
          duration: sessionDetails.duration || 60,
          startTime: sessionDetails.startTime || new Date().toISOString(),
          endTime: sessionDetails.endTime || new Date(Date.now() + 60 * 60 * 1000).toISOString(),
          room: sessionDetails.room,
          abstract: sessionDetails.abstract,
          learningObjectives: sessionDetails.learningObjectives || [],
          targetAudience: sessionDetails.targetAudience,
        },
        auth: true,
      })

      toast({
        title: "Success",
        description: "Speaker added to event successfully.",
      })

      setSelectedSpeaker(null)
      setSessionDetails({
        title: "",
        description: "",
        sessionType: "",
        duration: "",
        startTime: "",
        endTime: "",
        room: "",
        abstract: "",
        learningObjectives: [],
        targetAudience: "",
        materials: [],
      })
    } catch (error) {
      const err = error as { body?: { error?: string }; message?: string }
      const message = err?.body?.error || err?.message || (error instanceof Error ? error.message : "Failed to add speaker to event")
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const addSpecialty = () => {
    if (newSpecialty.trim() && !newSpeaker.specialties.includes(newSpecialty.trim())) {
      setNewSpeaker({
        ...newSpeaker,
        specialties: [...newSpeaker.specialties, newSpecialty.trim()],
      })
      setNewSpecialty("")
    }
  }

  const removeSpecialty = (specialty: string) => {
    setNewSpeaker({
      ...newSpeaker,
      specialties: newSpeaker.specialties.filter((s) => s !== specialty),
    })
  }

  const addAchievement = () => {
    if (newAchievement.trim() && !newSpeaker.achievements.includes(newAchievement.trim())) {
      setNewSpeaker({
        ...newSpeaker,
        achievements: [...newSpeaker.achievements, newAchievement.trim()],
      })
      setNewAchievement("")
    }
  }

  const removeAchievement = (achievement: string) => {
    setNewSpeaker({
      ...newSpeaker,
      achievements: newSpeaker.achievements.filter((a) => a !== achievement),
    })
  }

  const addCertification = () => {
    if (newCertification.trim() && !newSpeaker.certifications.includes(newCertification.trim())) {
      setNewSpeaker({
        ...newSpeaker,
        certifications: [...newSpeaker.certifications, newCertification.trim()],
      })
      setNewCertification("")
    }
  }

  const removeCertification = (certification: string) => {
    setNewSpeaker({
      ...newSpeaker,
      certifications: newSpeaker.certifications.filter((c) => c !== certification),
    })
  }

  const addObjective = () => {
    if (newObjective.trim() && !sessionDetails.learningObjectives.includes(newObjective.trim())) {
      setSessionDetails({
        ...sessionDetails,
        learningObjectives: [...sessionDetails.learningObjectives, newObjective.trim()],
      })
      setNewObjective("")
    }
  }

  const removeObjective = (objective: string) => {
    setSessionDetails({
      ...sessionDetails,
      learningObjectives: sessionDetails.learningObjectives.filter((o) => o !== objective),
    })
  }

  const addMaterial = () => {
    if (newMaterial.trim() && !sessionDetails.materials.includes(newMaterial.trim())) {
      setSessionDetails({
        ...sessionDetails,
        materials: [...sessionDetails.materials, newMaterial.trim()],
      })
      setNewMaterial("")
    }
  }

  const removeMaterial = (material: string) => {
    setSessionDetails({
      ...sessionDetails,
      materials: sessionDetails.materials.filter((m) => m !== material),
    })
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Add Speaker to Event
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="existing">Select Existing Speaker</TabsTrigger>
              <TabsTrigger value="new">Create New Speaker</TabsTrigger>
            </TabsList>

            <TabsContent value="existing" className="space-y-6">
              {/* Search Speakers */}
              <div className="relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search speakers by name, email, company, or specialties..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Speakers List */}
              <div className="grid gap-4 max-h-96 overflow-y-auto">
                {filteredSpeakers.map((speaker) => (
                  <Card
                    key={speaker.id}
                    className={`cursor-pointer transition-colors ${
                      selectedSpeaker?.id === speaker.id ? "ring-2 ring-blue-500 bg-blue-50" : "hover:bg-gray-50"
                    }`}
                    onClick={() => setSelectedSpeaker(speaker)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <Avatar className="w-16 h-16">
                          <AvatarImage src={speaker.avatar || "/city/c4.jpg"} />
                          <AvatarFallback>
                            {speaker.firstName[0]}
                            {speaker.lastName[0]}
                          </AvatarFallback>
                        </Avatar>

                        <div className="flex-1 space-y-2">
                          <div>
                            <h3 className="text-lg font-semibold">
                              {speaker.firstName} {speaker.lastName}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {speaker.jobTitle} {speaker.company && `at ${speaker.company}`}
                            </p>
                          </div>

                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <div className="flex items-center gap-1">
                              <Mail className="w-3 h-3" />
                              {speaker.email}
                            </div>
                            {speaker.phone && (
                              <div className="flex items-center gap-1">
                                <Phone className="w-3 h-3" />
                                {speaker.phone}
                              </div>
                            )}
                            {speaker.location && (
                              <div className="flex items-center gap-1">
                                <Building className="w-3 h-3" />
                                {speaker.location}
                              </div>
                            )}
                          </div>

                          {speaker.bio && <p className="text-sm text-gray-600 line-clamp-2">{speaker.bio}</p>}

                          <div className="flex flex-wrap gap-1">
                            {speaker.specialties.slice(0, 3).map((specialty) => (
                              <Badge key={specialty} variant="secondary" className="text-xs">
                                {specialty}
                              </Badge>
                            ))}
                            {speaker.specialties.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{speaker.specialties.length - 3} more
                              </Badge>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            {speaker.website && (
                              <Button variant="ghost" size="sm" className="h-6 px-2">
                                <Globe className="w-3 h-3" />
                              </Button>
                            )}
                            {speaker.linkedin && (
                              <Button variant="ghost" size="sm" className="h-6 px-2">
                                <Linkedin className="w-3 h-3" />
                              </Button>
                            )}
                            {speaker.twitter && (
                              <Button variant="ghost" size="sm" className="h-6 px-2">
                                <Twitter className="w-3 h-3" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="new" className="space-y-6">
              {/* Create New Speaker Form */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input
                      id="firstName"
                      value={newSpeaker.firstName}
                      onChange={(e) => setNewSpeaker({ ...newSpeaker, firstName: e.target.value })}
                      placeholder="John"
                    />
                  </div>

                  <div>
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input
                      id="lastName"
                      value={newSpeaker.lastName}
                      onChange={(e) => setNewSpeaker({ ...newSpeaker, lastName: e.target.value })}
                      placeholder="Doe"
                    />
                  </div>

                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={newSpeaker.email}
                      onChange={(e) => setNewSpeaker({ ...newSpeaker, email: e.target.value })}
                      placeholder="john.doe@example.com"
                    />
                  </div>

                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={newSpeaker.phone}
                      onChange={(e) => setNewSpeaker({ ...newSpeaker, phone: e.target.value })}
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>

                  <div>
                    <Label htmlFor="company">Company</Label>
                    <Input
                      id="company"
                      value={newSpeaker.company}
                      onChange={(e) => setNewSpeaker({ ...newSpeaker, company: e.target.value })}
                      placeholder="Tech Corp"
                    />
                  </div>

                  <div>
                    <Label htmlFor="jobTitle">Job Title</Label>
                    <Input
                      id="jobTitle"
                      value={newSpeaker.jobTitle}
                      onChange={(e) => setNewSpeaker({ ...newSpeaker, jobTitle: e.target.value })}
                      placeholder="Senior Developer"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={newSpeaker.location}
                      onChange={(e) => setNewSpeaker({ ...newSpeaker, location: e.target.value })}
                      placeholder="San Francisco, CA"
                    />
                  </div>

                  <div>
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      value={newSpeaker.website}
                      onChange={(e) => setNewSpeaker({ ...newSpeaker, website: e.target.value })}
                      placeholder="https://johndoe.com"
                    />
                  </div>

                  <div>
                    <Label htmlFor="linkedin">LinkedIn</Label>
                    <Input
                      id="linkedin"
                      value={newSpeaker.linkedin}
                      onChange={(e) => setNewSpeaker({ ...newSpeaker, linkedin: e.target.value })}
                      placeholder="https://linkedin.com/in/johndoe"
                    />
                  </div>

                  <div>
                    <Label htmlFor="twitter">Twitter</Label>
                    <Input
                      id="twitter"
                      value={newSpeaker.twitter}
                      onChange={(e) => setNewSpeaker({ ...newSpeaker, twitter: e.target.value })}
                      placeholder="https://twitter.com/johndoe"
                    />
                  </div>

                  <div>
                    <Label htmlFor="speakingExperience">Speaking Experience</Label>
                    <Textarea
                      id="speakingExperience"
                      value={newSpeaker.speakingExperience}
                      onChange={(e) => setNewSpeaker({ ...newSpeaker, speakingExperience: e.target.value })}
                      placeholder="Years of speaking experience, notable events, etc."
                      rows={3}
                    />
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={newSpeaker.bio}
                  onChange={(e) => setNewSpeaker({ ...newSpeaker, bio: e.target.value })}
                  placeholder="Brief biography and background..."
                  rows={4}
                />
              </div>

              {/* Specialties */}
              <div>
                <Label>Specialties</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    value={newSpecialty}
                    onChange={(e) => setNewSpecialty(e.target.value)}
                    placeholder="Add specialty"
                    onKeyPress={(e) => e.key === "Enter" && addSpecialty()}
                  />
                  <Button type="button" onClick={addSpecialty} size="sm">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {newSpeaker.specialties.map((specialty) => (
                    <Badge
                      key={specialty}
                      variant="secondary"
                      className="cursor-pointer"
                      onClick={() => removeSpecialty(specialty)}
                    >
                      {specialty} ×
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Achievements */}
              <div>
                <Label>Achievements</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    value={newAchievement}
                    onChange={(e) => setNewAchievement(e.target.value)}
                    placeholder="Add achievement"
                    onKeyPress={(e) => e.key === "Enter" && addAchievement()}
                  />
                  <Button type="button" onClick={addAchievement} size="sm">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {newSpeaker.achievements.map((achievement) => (
                    <Badge
                      key={achievement}
                      variant="secondary"
                      className="cursor-pointer"
                      onClick={() => removeAchievement(achievement)}
                    >
                      {achievement} ×
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Certifications */}
              <div>
                <Label>Certifications</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    value={newCertification}
                    onChange={(e) => setNewCertification(e.target.value)}
                    placeholder="Add certification"
                    onKeyPress={(e) => e.key === "Enter" && addCertification()}
                  />
                  <Button type="button" onClick={addCertification} size="sm">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {newSpeaker.certifications.map((certification) => (
                    <Badge
                      key={certification}
                      variant="secondary"
                      className="cursor-pointer"
                      onClick={() => removeCertification(certification)}
                    >
                      {certification} ×
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={handleCreateSpeaker} disabled={loading}>
                  {loading ? "Creating..." : "Create Speaker"}
                </Button>
              </div>
            </TabsContent>
          </Tabs>

          {/* Session Details Form */}
          {selectedSpeaker && (
            <Card className="border-blue-200 bg-blue-50 mt-6">
              <CardHeader>
                <CardTitle className="text-lg">
                  Session Details for {selectedSpeaker.firstName} {selectedSpeaker.lastName}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="sessionType">Session Type *</Label>
                    <Select
                      value={sessionDetails.sessionType}
                      onValueChange={(value) => setSessionDetails({ ...sessionDetails, sessionType: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Choose session type" />
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
                </div>

                <div>
                  <Label htmlFor="sessionTitle">Session Title *</Label>
                  <Input
                    id="sessionTitle"
                    value={sessionDetails.title}
                    onChange={(e) => setSessionDetails({ ...sessionDetails, title: e.target.value })}
                    placeholder="The Future of Technology"
                  />
                </div>

                <div>
                  <Label htmlFor="sessionDescription">Session Description</Label>
                  <Textarea
                    id="sessionDescription"
                    value={sessionDetails.description}
                    onChange={(e) => setSessionDetails({ ...sessionDetails, description: e.target.value })}
                    placeholder="Detailed description of the session..."
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="duration">Duration (minutes)</Label>
                    <Input
                      id="duration"
                      type="number"
                      value={sessionDetails.duration}
                      onChange={(e) => setSessionDetails({ ...sessionDetails, duration: e.target.value })}
                      placeholder="60"
                    />
                  </div>

                  <div>
                    <Label htmlFor="startTime">Start Time</Label>
                    <Input
                      id="startTime"
                      type="datetime-local"
                      value={sessionDetails.startTime}
                      onChange={(e) => setSessionDetails({ ...sessionDetails, startTime: e.target.value })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="room">Room/Location</Label>
                    <Input
                      id="room"
                      value={sessionDetails.room}
                      onChange={(e) => setSessionDetails({ ...sessionDetails, room: e.target.value })}
                      placeholder="Main Hall, Room A, etc."
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="abstract">Abstract</Label>
                  <Textarea
                    id="abstract"
                    value={sessionDetails.abstract}
                    onChange={(e) => setSessionDetails({ ...sessionDetails, abstract: e.target.value })}
                    placeholder="Brief abstract of the session content..."
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="targetAudience">Target Audience</Label>
                  <Input
                    id="targetAudience"
                    value={sessionDetails.targetAudience}
                    onChange={(e) => setSessionDetails({ ...sessionDetails, targetAudience: e.target.value })}
                    placeholder="Developers, Managers, Students, etc."
                  />
                </div>

                {/* Learning Objectives */}
                <div>
                  <Label>Learning Objectives</Label>
                  <div className="flex gap-2 mt-2">
                    <Input
                      value={newObjective}
                      onChange={(e) => setNewObjective(e.target.value)}
                      placeholder="Add learning objective"
                      onKeyPress={(e) => e.key === "Enter" && addObjective()}
                    />
                    <Button type="button" onClick={addObjective} size="sm">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {sessionDetails.learningObjectives.map((objective) => (
                      <Badge
                        key={objective}
                        variant="secondary"
                        className="cursor-pointer"
                        onClick={() => removeObjective(objective)}
                      >
                        {objective} ×
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Materials */}
                <div>
                  <Label>Materials/Resources</Label>
                  <div className="flex gap-2 mt-2">
                    <Input
                      value={newMaterial}
                      onChange={(e) => setNewMaterial(e.target.value)}
                      placeholder="Add material or resource"
                      onKeyPress={(e) => e.key === "Enter" && addMaterial()}
                    />
                    <Button type="button" onClick={addMaterial} size="sm">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {sessionDetails.materials.map((material) => (
                      <Badge
                        key={material}
                        variant="secondary"
                        className="cursor-pointer"
                        onClick={() => removeMaterial(material)}
                      >
                        {material} ×
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button onClick={handleAddSpeakerToEvent} disabled={loading}>
                    {loading ? "Adding..." : "Add Speaker to Event"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
