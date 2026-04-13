"use client"

import { useState, useEffect } from "react"
import { apiFetch } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  Users,
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Star,
  Calendar,
  DollarSign,
  UserCheck,
  UserX,
  Mail,
  Phone,
  MapPin,
  Globe,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react"

// Types based on your API response
interface Speaker {
  id: string
  name: string
  email: string
  phone: string
  avatar: string
  title: string
  company: string
  location: string
  expertise: string[]
  bio: string
  rating: number
  totalSessions: number
  upcomingSessions: number
  completedSessions: number
  totalEarnings: number
  status: "active" | "inactive" | "pending"
  verified: boolean
  joinedDate: string
  website: string
  socialMedia: {
    linkedin: string
    twitter: string
  }
  speakingFee: number
  availability: string
  languages: string[]
  experience: string
  lastLogin?: string
  createdAt: string
}

interface SpeakersResponse {
  success: boolean
  speakers: Speaker[]
  pagination: {
    page: number
    limit: number
    totalCount: number
    totalPages: number
  }
  statistics?: {
    totalSpeakers: number
    activeSpeakers: number
    pendingSpeakers: number
    totalRevenue: number
  }
}

export default function SpeakerManagement() {
  const [speakers, setSpeakers] = useState<Speaker[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedSpeaker, setSelectedSpeaker] = useState<Speaker | null>(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [statistics, setStatistics] = useState({
    totalSpeakers: 0,
    activeSpeakers: 0,
    pendingSpeakers: 0,
    totalRevenue: 0,
  })

  // Fetch speakers from API (backend only)
  const fetchSpeakers = async (search = "", status = "all") => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (search) params.append("search", search)
      if (status !== "all") params.append("status", status)
      
      const data = await apiFetch(`/api/admin/speakers?${params.toString()}`, { auth: true })
      const list = Array.isArray(data?.data) ? data.data : []
      const pagination = data?.pagination ?? { page: 1, limit: 20, total: 0, totalPages: 0 }
      
      const safeSpeakers: Speaker[] = list.map((s: Record<string, unknown>) => {
        const name = ((s.name as string) ?? [s.firstName, s.lastName].filter(Boolean).join(" ").trim()) || "Unknown Speaker"
        const isActive = s.isActive !== false
        return {
          id: (s.id as string) ?? "",
          name,
          email: (s.email as string) ?? "",
          phone: (s.phone as string) ?? "",
          avatar: (s.avatar as string) ?? "/placeholder.svg",
          title: (s.title as string) ?? "",
          company: (s.company as string) ?? "",
          location: (s.location as string) ?? "",
          expertise: Array.isArray(s.expertise) ? s.expertise as string[] : [],
          bio: (s.bio as string) ?? "",
          rating: 0,
          totalSessions: 0,
          upcomingSessions: 0,
          completedSessions: 0,
          totalEarnings: 0,
          status: isActive ? "active" as const : "inactive" as const,
          verified: true,
          joinedDate: (s.createdAt as string)?.toString().split("T")[0] ?? "",
          website: "",
          socialMedia: { linkedin: "", twitter: "" },
          speakingFee: 0,
          availability: "unknown",
          languages: ["English"],
          experience: "",
          lastLogin: undefined,
          createdAt: (s.createdAt as string) ?? new Date().toISOString(),
        }
      })
      setSpeakers(safeSpeakers)
      
      setStatistics({
        totalSpeakers: pagination.total ?? safeSpeakers.length,
        activeSpeakers: safeSpeakers.filter(s => s.status === "active").length,
        pendingSpeakers: 0,
        totalRevenue: 0,
      })
    } catch (error) {
      console.error("Error fetching speakers:", error)
      setSpeakers([])
      setStatistics({
        totalSpeakers: 0,
        activeSpeakers: 0,
        pendingSpeakers: 0,
        totalRevenue: 0,
      })
    } finally {
      setLoading(false)
    }
  }

  // Initial fetch
  useEffect(() => {
    fetchSpeakers()
  }, [])

  // Fetch when search or filter changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchSpeakers(searchTerm, statusFilter)
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [searchTerm, statusFilter])

  // Filter speakers based on search and status
  const filteredSpeakers = speakers.filter((speaker) => {
    const searchLower = searchTerm.toLowerCase()
    const matchesSearch =
      speaker.name.toLowerCase().includes(searchLower) ||
      speaker.email.toLowerCase().includes(searchLower) ||
      (speaker.company && speaker.company.toLowerCase().includes(searchLower)) ||
      (speaker.title && speaker.title.toLowerCase().includes(searchLower)) ||
      (speaker.location && speaker.location.toLowerCase().includes(searchLower))
    
    const matchesStatus = statusFilter === "all" || speaker.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const handleStatusChange = async (speakerId: string, newStatus: string) => {
    try {
      const isActive = newStatus === "active";
      
      await apiFetch(`/api/admin/speakers/${speakerId}`, {
        method: "PATCH",
        body: { isActive },
        auth: true,
      });
      {
        // Update locally for immediate feedback
        setSpeakers(speakers.map((speaker) => 
          speaker.id === speakerId ? { ...speaker, status: newStatus as any } : speaker
        ))
        
        // Refresh statistics
        fetchSpeakers(searchTerm, statusFilter);
      }
    } catch (error) {
      console.error("Error updating speaker status:", error);
      alert("Error updating speaker status. Please try again.");
      fetchSpeakers(searchTerm, statusFilter);
    }
  }

  const handleVerificationToggle = async (speakerId: string) => {
    try {
      const speaker = speakers.find(s => s.id === speakerId);
      if (!speaker) return;
      const newVerifiedStatus = !speaker.verified;
      await apiFetch(`/api/admin/speakers/${speakerId}`, {
        method: "PATCH",
        body: { isVerified: newVerifiedStatus },
        auth: true,
      });
      setSpeakers(
        speakers.map((s) =>
          s.id === speakerId ? { ...s, verified: newVerifiedStatus } : s
        )
      );
    } catch (error) {
      console.error("Error toggling verification:", error);
      alert("Error toggling verification. Please try again.");
      fetchSpeakers(searchTerm, statusFilter);
    }
  }

  const handleDeleteSpeaker = async (speakerId: string) => {
    try {
      await apiFetch(`/api/admin/speakers/${speakerId}`, { method: "DELETE", auth: true });
      setSpeakers(speakers.filter((s) => s.id !== speakerId));
      fetchSpeakers(searchTerm, statusFilter);
    } catch (error) {
      console.error("Error deleting speaker:", error);
      alert("Error deleting speaker. Please try again.");
      fetchSpeakers(searchTerm, statusFilter);
    }
  }

  const handleAddSpeaker = async (formData: any) => {
    try {
      await apiFetch("/api/admin/speakers", {
        method: "POST",
        body: {
          firstName: formData.name.split(" ")[0],
          lastName: formData.name.split(" ").slice(1).join(" ") || "",
          email: formData.email,
          phone: formData.phone,
          bio: formData.bio,
          company: formData.company,
          jobTitle: formData.title,
          location: formData.location,
          website: formData.website,
          linkedin: formData.linkedin,
          twitter: formData.twitter,
          instagram: formData.instagram,
          specialties: formData.expertise?.split(",").map((item: string) => item.trim()).filter(Boolean) ?? [],
          speakingExperience: formData.experience,
        },
        auth: true,
      });
      setIsAddDialogOpen(false);
      alert("Speaker created successfully.");
      fetchSpeakers(searchTerm, statusFilter);
    } catch (error) {
      console.error("Error adding speaker:", error);
      alert(error instanceof Error ? error.message : "Error adding speaker. Please try again.");
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800">Active</Badge>
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
      case "inactive":
        return <Badge className="bg-gray-100 text-gray-800">Inactive</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getAvailabilityBadge = (availability: string) => {
    switch (availability) {
      case "available":
        return <Badge className="bg-green-100 text-green-800">Available</Badge>
      case "busy":
        return <Badge className="bg-orange-100 text-orange-800">Busy</Badge>
      case "unavailable":
        return <Badge className="bg-red-100 text-red-800">Unavailable</Badge>
      default:
        return <Badge variant="secondary">{availability}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Speaker Management</h1>
          <p className="text-gray-600">Manage speakers, applications, and performance</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Speaker
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Speaker</DialogTitle>
              <DialogDescription>Add a new speaker to the platform</DialogDescription>
            </DialogHeader>
            <AddSpeakerForm onSubmit={handleAddSpeaker} onCancel={() => setIsAddDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Speakers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics.totalSpeakers}</div>
            <p className="text-xs text-muted-foreground">All registered speakers</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Speakers</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics.activeSpeakers}</div>
            <p className="text-xs text-muted-foreground">
              {statistics.totalSpeakers > 0 ? Math.round((statistics.activeSpeakers / statistics.totalSpeakers) * 100) : 0}% of total
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Applications</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics.pendingSpeakers}</div>
            <p className="text-xs text-muted-foreground">Awaiting approval</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${statistics.totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">All speaker earnings</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>Speaker Directory</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search speakers by name, email, or company..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
              <p className="text-gray-600 mt-2">Loading speakers...</p>
            </div>
          )}

          {/* Speakers List */}
          {!loading && (
            <div className="space-y-4">
              {filteredSpeakers.map((speaker) => (
                <SpeakerCard
                  key={speaker.id}
                  speaker={speaker}
                  onView={() => {
                    setSelectedSpeaker(speaker)
                    setIsViewDialogOpen(true)
                  }}
                  onEdit={() => {
                    setSelectedSpeaker(speaker)
                    setIsEditDialogOpen(true)
                  }}
                  onStatusChange={handleStatusChange}
                  onVerificationToggle={handleVerificationToggle}
                  onDelete={handleDeleteSpeaker}
                  getStatusBadge={getStatusBadge}
                  getAvailabilityBadge={getAvailabilityBadge}
                />
              ))}
            </div>
          )}

          {!loading && filteredSpeakers.length === 0 && (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No speakers found</h3>
              <p className="text-gray-600">Try adjusting your search or filter criteria.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* View Speaker Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Speaker Details</DialogTitle>
          </DialogHeader>
          {selectedSpeaker && (
            <SpeakerDetails speaker={selectedSpeaker} getStatusBadge={getStatusBadge} />
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Speaker Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Speaker</DialogTitle>
            <DialogDescription>Update speaker information</DialogDescription>
          </DialogHeader>
          {selectedSpeaker && (
            <EditSpeakerForm 
              speaker={selectedSpeaker} 
              onSave={() => {
                setIsEditDialogOpen(false)
                fetchSpeakers(searchTerm, statusFilter)
              }}
              onCancel={() => setIsEditDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
// Component for Add Speaker Form
function AddSpeakerForm({ onSubmit, onCancel }: { onSubmit: (formData: any) => void, onCancel: () => void }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    title: "",
    company: "",
    location: "",
    fee: "",
    experience: "",
    bio: "",
    expertise: "",
    website: "",
    linkedin: "",
    twitter: "",
    instagram: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid grid-cols-2 gap-4 py-4">
        <div className="space-y-2">
          <Label htmlFor="name">Full Name *</Label>
          <Input 
            id="name" 
            placeholder="Enter speaker name" 
            value={formData.name}
            onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email *</Label>
          <Input 
            id="email" 
            type="email" 
            placeholder="Enter email address" 
            value={formData.email}
            onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <Input 
            id="phone" 
            placeholder="Enter phone number" 
            value={formData.phone}
            onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="title">Professional Title</Label>
          <Input 
            id="title" 
            placeholder="Enter job title" 
            value={formData.title}
            onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="company">Company</Label>
          <Input 
            id="company" 
            placeholder="Enter company name" 
            value={formData.company}
            onChange={(e) => setFormData((prev) => ({ ...prev, company: e.target.value }))}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="location">Location</Label>
          <Input 
            id="location" 
            placeholder="Enter location" 
            value={formData.location}
            onChange={(e) => setFormData((prev) => ({ ...prev, location: e.target.value }))}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="website">Website</Label>
          <Input 
            id="website" 
            placeholder="Enter website URL" 
            value={formData.website}
            onChange={(e) => setFormData((prev) => ({ ...prev, website: e.target.value }))}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="linkedin">LinkedIn</Label>
          <Input
            id="linkedin"
            placeholder="LinkedIn URL"
            value={formData.linkedin}
            onChange={(e) => setFormData((prev) => ({ ...prev, linkedin: e.target.value }))}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="twitter">Twitter / X</Label>
          <Input
            id="twitter"
            placeholder="Profile URL"
            value={formData.twitter}
            onChange={(e) => setFormData((prev) => ({ ...prev, twitter: e.target.value }))}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="instagram">Instagram</Label>
          <Input
            id="instagram"
            placeholder="Profile URL"
            value={formData.instagram}
            onChange={(e) => setFormData((prev) => ({ ...prev, instagram: e.target.value }))}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="experience">Experience</Label>
          <Select
            value={formData.experience || undefined}
            onValueChange={(value) => setFormData((prev) => ({ ...prev, experience: value }))}
          >
            <SelectTrigger id="experience">
              <SelectValue placeholder="Select experience level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1-3">1-3 years</SelectItem>
              <SelectItem value="3-5">3-5 years</SelectItem>
              <SelectItem value="5-10">5-10 years</SelectItem>
              <SelectItem value="10+">10+ years</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="col-span-2 space-y-2">
          <Label htmlFor="bio">Biography</Label>
          <Textarea 
            id="bio" 
            placeholder="Enter speaker biography" 
            value={formData.bio}
            onChange={(e) => setFormData((prev) => ({ ...prev, bio: e.target.value }))}
            rows={4}
          />
        </div>
        <div className="col-span-2 space-y-2">
          <Label htmlFor="expertise">Expertise (comma-separated)</Label>
          <Input 
            id="expertise" 
            placeholder="e.g., AI, Machine Learning, Data Science" 
            value={formData.expertise}
            onChange={(e) => setFormData((prev) => ({ ...prev, expertise: e.target.value }))}
          />
        </div>
      </div>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">Add Speaker</Button>
      </DialogFooter>
    </form>
  )
}

// Component for Speaker Card
function SpeakerCard({ 
  speaker, 
  onView, 
  onEdit, 
  onStatusChange, 
  onVerificationToggle, 
  onDelete, 
  getStatusBadge, 
  getAvailabilityBadge 
}: any) {
  return (
    <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
      <div className="flex items-center gap-4">
        <Avatar className="w-12 h-12">
          <AvatarImage src={speaker.avatar} />
          <AvatarFallback>
            {speaker.name
              ?.split(" ")
              .map((n: string) => n[0])
              .join("")}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-lg">{speaker.name}</h3>
            {speaker.verified && <CheckCircle className="w-4 h-4 text-green-500" />}
            {getStatusBadge(speaker.status)}
            {getAvailabilityBadge(speaker.availability)}
          </div>
          <p className="text-gray-600 mb-1">
            {speaker.title} {speaker.company && `at ${speaker.company}`}
          </p>
          <div className="flex items-center gap-4 text-sm text-gray-500">
            {speaker.location && (
              <div className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {speaker.location}
              </div>
            )}
            <div className="flex items-center gap-1">
              <Star className="w-3 h-3 text-yellow-400 fill-current" />
              {speaker.rating}
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {speaker.totalSessions} sessions
            </div>
            <div className="flex items-center gap-1">
              <DollarSign className="w-3 h-3" />${speaker.speakingFee.toLocaleString()}
            </div>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={onView}>
          <Eye className="w-4 h-4 mr-1" />
          View
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem onClick={onEdit}>
              <Edit className="w-4 h-4 mr-2" />
              Edit Speaker
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onVerificationToggle(speaker.id)}>
              {speaker.verified ? (
                <>
                  <XCircle className="w-4 h-4 mr-2" />
                  Remove Verification
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Verify Speaker
                </>
              )}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => onStatusChange(speaker.id, speaker.status === "active" ? "inactive" : "active")}
            >
              {speaker.status === "active" ? (
                <>
                  <UserX className="w-4 h-4 mr-2" />
                  Deactivate
                </>
              ) : (
                <>
                  <UserCheck className="w-4 h-4 mr-2" />
                  Activate
                </>
              )}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Speaker
                </DropdownMenuItem>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete the speaker and remove their
                    data from our servers.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => onDelete(speaker.id)}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}

// Component for Speaker Details
function SpeakerDetails({ speaker, getStatusBadge }: any) {
  return (
    <Tabs defaultValue="profile" className="w-full">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="profile">Profile</TabsTrigger>
        <TabsTrigger value="sessions">Sessions</TabsTrigger>
        <TabsTrigger value="earnings">Earnings</TabsTrigger>
        <TabsTrigger value="reviews">Reviews</TabsTrigger>
      </TabsList>

      <TabsContent value="profile" className="space-y-4">
        <div className="flex items-start gap-6">
          <Avatar className="w-24 h-24">
            <AvatarImage src={speaker.avatar} />
            <AvatarFallback className="text-2xl">
              {speaker.name
                ?.split(" ")
                .map((n: string) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-2xl font-bold">{speaker.name}</h2>
              {speaker.verified && <CheckCircle className="w-6 h-6 text-green-500" />}
              {getStatusBadge(speaker.status)}
            </div>
            <p className="text-lg text-gray-600 mb-2">{speaker.title}</p>
            <p className="text-gray-600 mb-4">{speaker.company}</p>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-gray-400" />
                <span>{speaker.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-gray-400" />
                <span>{speaker.phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-gray-400" />
                <span>{speaker.location}</span>
              </div>
              {speaker.website && (
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-gray-400" />
                  <a href={speaker.website} className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">
                    Website
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">Biography</h3>
            <p className="text-gray-600">{speaker.bio}</p>
          </div>

          {speaker.expertise && speaker.expertise.length > 0 && (
            <div>
              <h3 className="font-semibold mb-2">Expertise</h3>
              <div className="flex flex-wrap gap-2">
                {speaker.expertise.map((skill: string, index: number) => (
                  <Badge key={index} variant="secondary">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-3 gap-4">
            <div>
              <h4 className="font-medium text-sm text-gray-600">Experience</h4>
              <p className="font-semibold">{speaker.experience}</p>
            </div>
            <div>
              <h4 className="font-medium text-sm text-gray-600">Speaking Fee</h4>
              <p className="font-semibold">${speaker.speakingFee.toLocaleString()}</p>
            </div>
            <div>
              <h4 className="font-medium text-sm text-gray-600">Languages</h4>
              <p className="font-semibold">{speaker.languages.join(", ")}</p>
            </div>
          </div>
        </div>
      </TabsContent>

      <TabsContent value="sessions" className="space-y-4">
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{speaker.totalSessions}</div>
              <p className="text-sm text-gray-600">Total Sessions</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{speaker.upcomingSessions}</div>
              <p className="text-sm text-gray-600">Upcoming Sessions</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{speaker.completedSessions}</div>
              <p className="text-sm text-gray-600">Completed Sessions</p>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-3">
          <h3 className="font-semibold">Recent Sessions</h3>
          {[1, 2, 3].map((session) => (
            <div key={session} className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <h4 className="font-medium">AI in Healthcare Summit</h4>
                <p className="text-sm text-gray-600">March 15, 2024 • 2:00 PM - 3:00 PM</p>
              </div>
              <Badge className="bg-green-100 text-green-800">Completed</Badge>
            </div>
          ))}
        </div>
      </TabsContent>

      <TabsContent value="earnings" className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">${speaker.totalEarnings.toLocaleString()}</div>
              <p className="text-sm text-gray-600">Total Earnings</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">${(speaker.totalEarnings / 12).toFixed(0)}</div>
              <p className="text-sm text-gray-600">Monthly Average</p>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-3">
          <h3 className="font-semibold">Recent Payments</h3>
          {[1, 2, 3].map((payment) => (
            <div key={payment} className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <h4 className="font-medium">Payment for AI Summit Session</h4>
                <p className="text-sm text-gray-600">March 20, 2024</p>
              </div>
              <div className="text-right">
                <div className="font-semibold">$5,000</div>
                <Badge className="bg-green-100 text-green-800">Paid</Badge>
              </div>
            </div>
          ))}
        </div>
      </TabsContent>

      <TabsContent value="reviews" className="space-y-4">
        <div className="text-center">
          <div className="text-4xl font-bold mb-2">{speaker.rating}</div>
          <div className="flex items-center justify-center gap-1 mb-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`w-5 h-5 ${
                  i < Math.floor(speaker.rating) ? "text-yellow-400 fill-current" : "text-gray-300"
                }`}
              />
            ))}
          </div>
          <p className="text-gray-600">Based on {speaker.totalSessions} sessions</p>
        </div>

        <div className="space-y-3">
          <h3 className="font-semibold">Recent Reviews</h3>
          {[1, 2, 3].map((review) => (
            <div key={review} className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                  ))}
                </div>
                <span className="text-sm text-gray-600">March 15, 2024</span>
              </div>
              <p className="text-gray-700">
                "Excellent presentation on AI applications in healthcare. Very knowledgeable and engaging
                speaker."
              </p>
              <p className="text-sm text-gray-600 mt-2">- Event Organizer</p>
            </div>
          ))}
        </div>
      </TabsContent>
    </Tabs>
  )
}

// Component for Edit Speaker Form
function EditSpeakerForm({ speaker, onSave, onCancel }: any) {
  const [formData, setFormData] = useState({
    firstName: speaker.name.split(' ')[0] || '',
    lastName: speaker.name.split(' ').slice(1).join(' ') || '',
    email: speaker.email || '',
    phone: speaker.phone || '',
    jobTitle: speaker.title || '',
    company: speaker.company || '',
    location: speaker.location || '',
    speakingFee: speaker.speakingFee || 0,
    status: speaker.status || 'inactive',
    bio: speaker.bio || '',
    website: speaker.website || '',
    linkedin: speaker.socialMedia?.linkedin || '',
    twitter: speaker.socialMedia?.twitter || '',
    specialties: speaker.expertise?.join(', ') || '',
    speakingExperience: speaker.experience || '',
  })

  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await apiFetch(`/api/admin/speakers/${speaker.id}`, {
        method: "PATCH",
        body: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          bio: formData.bio,
          company: formData.company,
          isActive: formData.status === "active",
        },
        auth: true,
      });
      onSave();
    } catch (error) {
      console.error("Error updating speaker:", error);
      alert("Error updating speaker. Please try again.");
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid grid-cols-2 gap-4 py-4">
        <div className="space-y-2">
          <Label htmlFor="firstName">First Name *</Label>
          <Input 
            id="firstName" 
            value={formData.firstName} 
            onChange={(e) => setFormData({...formData, firstName: e.target.value})}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName">Last Name *</Label>
          <Input 
            id="lastName" 
            value={formData.lastName} 
            onChange={(e) => setFormData({...formData, lastName: e.target.value})}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email *</Label>
          <Input 
            id="email" 
            type="email" 
            value={formData.email} 
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <Input 
            id="phone" 
            value={formData.phone} 
            onChange={(e) => setFormData({...formData, phone: e.target.value})}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="jobTitle">Professional Title</Label>
          <Input 
            id="jobTitle" 
            value={formData.jobTitle} 
            onChange={(e) => setFormData({...formData, jobTitle: e.target.value})}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="company">Company</Label>
          <Input 
            id="company" 
            value={formData.company} 
            onChange={(e) => setFormData({...formData, company: e.target.value})}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="location">Location</Label>
          <Input 
            id="location" 
            value={formData.location} 
            onChange={(e) => setFormData({...formData, location: e.target.value})}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="website">Website</Label>
          <Input 
            id="website" 
            value={formData.website} 
            onChange={(e) => setFormData({...formData, website: e.target.value})}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="linkedin">LinkedIn</Label>
          <Input 
            id="linkedin" 
            value={formData.linkedin} 
            onChange={(e) => setFormData({...formData, linkedin: e.target.value})}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="twitter">Twitter</Label>
          <Input 
            id="twitter" 
            value={formData.twitter} 
            onChange={(e) => setFormData({...formData, twitter: e.target.value})}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="speakingFee">Speaking Fee ($)</Label>
          <Input 
            id="speakingFee" 
            type="number" 
            value={formData.speakingFee} 
            onChange={(e) => setFormData({...formData, speakingFee: Number(e.target.value)})}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select value={formData.status} onValueChange={(value) => setFormData({...formData, status: value})}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="col-span-2 space-y-2">
          <Label htmlFor="specialties">Expertise (comma-separated)</Label>
          <Input 
            id="specialties" 
            placeholder="e.g., AI, Machine Learning, Data Science"
            value={formData.specialties} 
            onChange={(e) => setFormData({...formData, specialties: e.target.value})}
          />
        </div>
        <div className="col-span-2 space-y-2">
          <Label htmlFor="speakingExperience">Speaking Experience</Label>
          <Textarea 
            id="speakingExperience" 
            placeholder="Describe the speaker's experience"
            value={formData.speakingExperience} 
            onChange={(e) => setFormData({...formData, speakingExperience: e.target.value})}
            rows={3}
          />
        </div>
        <div className="col-span-2 space-y-2">
          <Label htmlFor="bio">Biography</Label>
          <Textarea 
            id="bio" 
            value={formData.bio} 
            onChange={(e) => setFormData({...formData, bio: e.target.value})}
            rows={4}
          />
        </div>
      </div>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : "Save Changes"}
        </Button>
      </DialogFooter>
    </form>
  )
}