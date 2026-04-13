"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Building2, Calendar, Link as LinkIcon, Sparkles, Search, Send, Check, X, Tag, Users, CalendarDays, Mail, Clock } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { adminApi } from "@/lib/admin-api"

interface Exhibitor {
  id: string
  name: string
  company: string
  description: string
  avatar: string | null
  website: string | null
  linkedin: string | null
  location: string | null
  categories: string[]
  matchingCategories: string[]
  matchScore: number
  stats: {
    totalMeetings: number
    followers: number
    upcomingEvents: number
  }
  upcomingEvents: Array<{
    id: string
    title: string
    startDate: string
    endDate: string
    categories: string[]
  }>
}

interface VisitorData {
  id: string
  name: string
  company: string | null
  interests: string[]
  location: string | null
  categories: string[]
  alreadySuggestedCount: number
}

interface VisitorSuggestionsAdminProps {
  visitorId: string
  visitorName: string
  onClose?: () => void
  onSuggestionsSent?: () => void
}

export function VisitorSuggestionsAdmin({ visitorId, visitorName, onClose, onSuggestionsSent }: VisitorSuggestionsAdminProps) {
  const [visitor, setVisitor] = useState<VisitorData | null>(null)
  const [exhibitors, setExhibitors] = useState<Exhibitor[]>([])
  const [selectedExhibitors, setSelectedExhibitors] = useState<Set<string>>(new Set())
  const [note, setNote] = useState("")
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [filters, setFilters] = useState({
    limit: 20,
    category: "",
    search: "",
  })
  const [availableCategories, setAvailableCategories] = useState<Array<{ id: string; name: string }>>([])
  const { toast } = useToast()

  const fetchCategories = async () => {
    try {
      const response = await adminApi("/visitors/categories")
      const result = response as unknown as { success: boolean; data?: Array<{ id: string; name: string }> }
      
      if (result.success && result.data) {
        setAvailableCategories(result.data)
      }
    } catch (error) {
      console.error("Error fetching categories:", error)
    }
  }

  const fetchVisitorData = async () => {
    try {
      const response = await adminApi(`/visitors/${visitorId}/suggestions/visitor`)
      const result = response as unknown as { success: boolean; data?: VisitorData }
      
      if (result.success && result.data) {
        setVisitor(result.data)
      }
    } catch (error) {
      console.error("Error fetching visitor data:", error)
      toast({
        title: "Error",
        description: "Failed to load visitor data",
        variant: "destructive",
      })
    }
  }

  const fetchExhibitors = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        limit: filters.limit.toString(),
        ...(filters.category && filters.category !== "all" && { category: filters.category }),
        ...(filters.search && { search: filters.search }),
      })

      const response = await adminApi(`/visitors/${visitorId}/suggestions/available?${params}`)
      const result = response as unknown as { success: boolean; data?: Exhibitor[] }
      
      if (result.success && result.data) {
        setExhibitors(result.data)
      } else {
        toast({
          title: "Error",
          description: "Failed to load exhibitors",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error fetching exhibitors:", error)
      toast({
        title: "Error",
        description: "Failed to load exhibitors",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const sendSuggestions = async () => {
    if (selectedExhibitors.size === 0) {
      toast({
        title: "No selection",
        description: "Please select at least one exhibitor to suggest",
        variant: "destructive",
      })
      return
    }

    setSending(true)
    try {
      const response = await adminApi(`/visitors/${visitorId}/suggestions/send`, {
        method: "POST",
        body: {
          exhibitorIds: Array.from(selectedExhibitors),
          note: note.trim() || undefined,
        },
      })
      
      const result = response as unknown as { success: boolean; message?: string }
      
      if (result.success) {
        toast({
          title: "Success",
          description: result.message || `Suggestions sent to ${visitorName}`,
        })
        setSelectedExhibitors(new Set())
        setNote("")
        if (onSuggestionsSent) onSuggestionsSent()
        fetchVisitorData() // Refresh visitor data to update suggested count
        fetchExhibitors() // Refresh exhibitors list
      } else {
        toast({
          title: "Error",
          description: "Failed to send suggestions",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error sending suggestions:", error)
      toast({
        title: "Error",
        description: "Failed to send suggestions",
        variant: "destructive",
      })
    } finally {
      setSending(false)
    }
  }

  const toggleSelectAll = () => {
    if (selectedExhibitors.size === exhibitors.length) {
      setSelectedExhibitors(new Set())
    } else {
      setSelectedExhibitors(new Set(exhibitors.map(e => e.id)))
    }
  }

  const toggleSelectExhibitor = (id: string) => {
    const newSelected = new Set(selectedExhibitors)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedExhibitors(newSelected)
  }

  useEffect(() => {
    fetchCategories()
    fetchVisitorData()
  }, [visitorId])

  useEffect(() => {
    fetchExhibitors()
  }, [visitorId, filters.category, filters.search, filters.limit])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-purple-500" />
            Send Exhibitor Suggestions to {visitorName}
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Select exhibitors based on categories and send personalized suggestions to the visitor's dashboard
          </p>
        </div>
        {onClose && (
          <Button variant="outline" onClick={onClose}>
            Back to Visitors
          </Button>
        )}
      </div>

      {/* Visitor Info Card */}
      {visitor && (
        <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm font-medium text-purple-700">Visitor</p>
                <p className="text-lg font-semibold text-gray-900">{visitor.name}</p>
                {visitor.company && (
                  <p className="text-sm text-gray-600">{visitor.company}</p>
                )}
                {visitor.location && (
                  <p className="text-sm text-gray-500 mt-1">{visitor.location}</p>
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-purple-700">Previously Suggested</p>
                <p className="text-2xl font-bold text-gray-900">{visitor.alreadySuggestedCount}</p>
                <p className="text-xs text-gray-500">exhibitors already sent</p>
              </div>
              <div>
                <p className="text-sm font-medium text-purple-700">Categories from Events</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {visitor.categories.slice(0, 5).map((category) => (
                    <Badge key={category} variant="secondary" className="bg-white text-purple-700">
                      {category}
                    </Badge>
                  ))}
                  {visitor.categories.length > 5 && (
                    <Badge variant="secondary">+{visitor.categories.length - 5}</Badge>
                  )}
                  {visitor.categories.length === 0 && (
                    <span className="text-sm text-gray-500">No categories found</span>
                  )}
                </div>
              </div>
            </div>
            
            {visitor.interests && visitor.interests.length > 0 && (
              <div className="mt-4 pt-4 border-t border-purple-200">
                <p className="text-sm font-medium text-purple-700">Interests</p>
                <div className="flex flex-wrap gap-2 mt-1">
                  {visitor.interests.map((interest) => (
                    <Badge key={interest} variant="secondary" className="bg-white">
                      {interest}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Message Input */}
      <Card>
        <CardContent className="pt-6">
          <label className="text-sm font-medium text-gray-700 mb-2 block">
            Personal Note (Optional)
          </label>
          <Textarea
            placeholder="Add a personal note to accompany these suggestions..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="h-24"
          />
          <p className="text-xs text-gray-500 mt-2">
            This note will be visible to the visitor along with the suggestions
          </p>
        </CardContent>
      </Card>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start">
        <div className="flex flex-wrap gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search exhibitors..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="pl-9 w-64"
            />
          </div>
          <Select
            value={filters.category}
            onValueChange={(v) => setFilters({ ...filters, category: v })}
          >
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {availableCategories.map((cat) => (
                <SelectItem key={cat.id} value={cat.name}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={filters.limit.toString()}
            onValueChange={(v) => setFilters({ ...filters, limit: parseInt(v) })}
          >
            <SelectTrigger className="w-24">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="50">50</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={toggleSelectAll}
            disabled={exhibitors.length === 0}
          >
            {selectedExhibitors.size === exhibitors.length && exhibitors.length > 0 ? "Deselect All" : "Select All"}
          </Button>
          <Button
            onClick={sendSuggestions}
            disabled={selectedExhibitors.size === 0 || sending}
            className="bg-purple-600 hover:bg-purple-700"
          >
            {sending ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Send className="h-4 w-4 mr-2" />
            )}
            Send to Visitor ({selectedExhibitors.size})
          </Button>
        </div>
      </div>

      {/* Exhibitors Grid */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      ) : exhibitors.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500">No exhibitors available to suggest</p>
            <p className="text-sm text-gray-400 mt-1">
              {visitor?.categories.length === 0 
                ? "Visitor hasn't shown interest in any categories yet" 
                : "All available exhibitors have been suggested already"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {exhibitors.map((exhibitor) => (
              <Card 
                key={exhibitor.id} 
                className={`hover:shadow-lg transition-all cursor-pointer ${
                  selectedExhibitors.has(exhibitor.id) 
                    ? "ring-2 ring-purple-500 shadow-lg" 
                    : ""
                }`}
                onClick={() => toggleSelectExhibitor(exhibitor.id)}
              >
                <CardContent className="p-6">
                  {/* Selection Checkbox */}
                  <div className="flex justify-end mb-2">
                    <Checkbox
                      checked={selectedExhibitors.has(exhibitor.id)}
                      onCheckedChange={() => toggleSelectExhibitor(exhibitor.id)}
                      className="h-5 w-5"
                    />
                  </div>

                  {/* Header */}
                  <div className="flex items-start space-x-3">
                    {exhibitor.avatar ? (
                      <img
                        src={exhibitor.avatar}
                        alt={exhibitor.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
                        <Building2 className="h-6 w-6 text-purple-500" />
                      </div>
                    )}
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{exhibitor.name}</h3>
                      <p className="text-sm text-gray-600">{exhibitor.company}</p>
                    </div>
                  </div>

                  {/* Match Score */}
                  {exhibitor.matchScore > 0 && (
                    <div className="mt-2 flex items-center gap-1">
                      <Badge className="bg-green-100 text-green-700">
                        {exhibitor.matchScore} matching categories
                      </Badge>
                    </div>
                  )}

                  {/* Location */}
                  {exhibitor.location && (
                    <p className="text-sm text-gray-600 mt-2">
                      <span className="font-medium">📍</span> {exhibitor.location}
                    </p>
                  )}

                  {/* Matching Categories */}
                  {exhibitor.matchingCategories.length > 0 && (
                    <div className="mt-2">
                      <p className="text-xs font-medium text-purple-600 mb-1">Matches visitor's interests:</p>
                      <div className="flex flex-wrap gap-1">
                        {exhibitor.matchingCategories.slice(0, 3).map((category) => (
                          <Badge key={category} variant="secondary" className="text-xs bg-purple-50 text-purple-700">
                            {category}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Description */}
                  {exhibitor.description && (
                    <p className="text-sm text-gray-600 mt-3 line-clamp-2">
                      {exhibitor.description}
                    </p>
                  )}

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-2 mt-4 py-3 border-y">
                    <div className="text-center">
                      <p className="text-sm font-semibold">{exhibitor.stats.followers}</p>
                      <p className="text-xs text-gray-500">Followers</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-semibold">{exhibitor.stats.totalMeetings}</p>
                      <p className="text-xs text-gray-500">Meetings</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-semibold">{exhibitor.stats.upcomingEvents}</p>
                      <p className="text-xs text-gray-500">Events</p>
                    </div>
                  </div>

                  {/* Social Links */}
                  <div className="flex gap-2 mt-3">
                    {exhibitor.website && (
                      <a
                        href={exhibitor.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-500 hover:text-purple-600 transition"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <LinkIcon className="h-4 w-4" />
                      </a>
                    )}
                    {exhibitor.linkedin && (
                      <a
                        href={exhibitor.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-500 hover:text-purple-600 transition"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451c.979 0 1.771-.773 1.771-1.729V1.729C24 .774 23.204 0 22.225 0z" />
                        </svg>
                      </a>
                    )}
                  </div>

                  {/* Upcoming Events */}
                  {exhibitor.upcomingEvents.length > 0 && (
                    <div className="mt-3">
                      <p className="text-xs font-medium text-gray-500 mb-2">Upcoming Events</p>
                      <div className="space-y-1">
                        {exhibitor.upcomingEvents.slice(0, 2).map((event) => (
                          <div key={event.id} className="flex items-center gap-2 text-xs text-gray-600">
                            <Calendar className="h-3 w-3" />
                            <span className="truncate">{event.title}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Selection Summary */}
          {selectedExhibitors.size > 0 && (
            <div className="sticky bottom-4 bg-white border rounded-lg shadow-lg p-4 flex justify-between items-center">
              <div>
                <p className="font-semibold">{selectedExhibitors.size} exhibitor(s) selected</p>
                <p className="text-sm text-gray-500">Click "Send to Visitor" to publish these suggestions</p>
              </div>
              <Button onClick={sendSuggestions} disabled={sending} className="bg-purple-600 hover:bg-purple-700">
                {sending ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Send className="h-4 w-4 mr-2" />
                )}
                Send to Visitor ({selectedExhibitors.size})
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}