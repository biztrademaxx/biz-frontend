"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, Building2, Calendar, Link as LinkIcon, TrendingUp, Sparkles } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import Image from "next/image"
import { apiFetch, getCurrentUserId } from "@/lib/api"

interface ExhibitorSuggestion {
  id: string
  name: string
  company: string
  industry: string
  description: string
  avatar: string | null
  website: string | null
  linkedin: string | null
  location: string | null
  bio: string | null
  stats: {
    totalMeetings: number
    followers: number
    products: number
    upcomingEvents: number
  }
  upcomingEvents: Array<{
    id: string
    title: string
    startDate: string
  }>
  relevanceScore: number
}

interface VisitorContext {
  interests: string[]
  industry: string | null
  interactedExhibitorsCount: number
}

interface SuggestionsResponse {
  success: boolean
  data: {
    suggestions: ExhibitorSuggestion[]
    visitorContext: VisitorContext
  }
}

interface TrendingResponse {
  success: boolean
  data: ExhibitorSuggestion[]
}

export function Recommendations() {
  const [suggestions, setSuggestions] = useState<ExhibitorSuggestion[]>([])
  const [visitorContext, setVisitorContext] = useState<VisitorContext | null>(null)
  const [loading, setLoading] = useState(true)
  const [suggestionType, setSuggestionType] = useState<"personalized" | "trending">("personalized")
  const [searchTerm, setSearchTerm] = useState("")
  const { toast } = useToast()

  const fetchSuggestions = async () => {
    const userId = getCurrentUserId()
    
    if (!userId) {
      toast({
        title: "Error",
        description: "User not authenticated",
        variant: "destructive",
      })
      setLoading(false)
      return
    }

    setLoading(true)
    try {
      const params = new URLSearchParams({
        limit: "12",
        type: suggestionType,
        ...(searchTerm && { search: searchTerm }),
      })

      if (suggestionType === "personalized") {
        const response = await apiFetch<SuggestionsResponse>(
          `/api/users/${userId}/suggestions?${params}`,
          { method: "GET", auth: true }
        )
        
        if (response.success) {
          setSuggestions(response.data.suggestions)
          setVisitorContext(response.data.visitorContext)
        } else {
          throw new Error("Failed to load recommendations")
        }
      } else {
        const response = await apiFetch<TrendingResponse>(
          `/api/users/${userId}/suggestions?${params}`,
          { method: "GET", auth: true }
        )
        
        if (response.success) {
          setSuggestions(response.data)
          setVisitorContext(null)
        } else {
          throw new Error("Failed to load trending exhibitors")
        }
      }
    } catch (error: any) {
      console.error("Error fetching suggestions:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to load recommendations",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSuggestions()
  }, [suggestionType, searchTerm])

  const handleConnect = async (exhibitorId: string) => {
    const userId = getCurrentUserId()
    
    if (!userId) {
      toast({
        title: "Error",
        description: "User not authenticated",
        variant: "destructive",
      })
      return
    }

    try {
      const response = await apiFetch<{ success: boolean; message?: string }>(
        `/api/users/${userId}/connections`,
        {
          method: "POST",
          body: { exhibitorId },
          auth: true,
        }
      )

      toast({
        title: "Success!",
        description: response.message || "Connection request sent successfully",
      })
      
      // Remove from suggestions after connecting
      setSuggestions(suggestions.filter((s) => s.id !== exhibitorId))
    } catch (error: any) {
      console.error("Error sending connection request:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to send connection request",
        variant: "destructive",
      })
    }
  }

  const handleScheduleMeeting = async (exhibitorId: string, exhibitorName: string) => {
    // Open meeting scheduling modal
    toast({
      title: "Coming Soon",
      description: `Schedule a meeting with ${exhibitorName}`,
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-yellow-500" />
            Recommended for You
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Personalized exhibitor recommendations based on your interests and activity
          </p>
        </div>
        
        <div className="flex gap-2">
          <Input
            placeholder="Search exhibitors..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-64"
          />
          <Button onClick={fetchSuggestions} variant="outline" disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Refresh"}
          </Button>
        </div>
      </div>

      {/* Visitor Context Card */}
      {visitorContext && suggestionType === "personalized" && visitorContext.interests.length > 0 && (
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-4 items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-700">Based on your interests:</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {visitorContext.interests.slice(0, 5).map((interest) => (
                    <Badge key={interest} variant="secondary" className="bg-white">
                      {interest}
                    </Badge>
                  ))}
                </div>
              </div>
              {visitorContext.industry && (
                <Badge variant="outline" className="bg-white">
                  Industry: {visitorContext.industry}
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <Tabs
        value={suggestionType}
        onValueChange={(v) => setSuggestionType(v as "personalized" | "trending")}
        className="w-full"
      >
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="personalized" className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            Personalized
          </TabsTrigger>
          <TabsTrigger value="trending" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Trending
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Suggestions Grid */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      ) : suggestions.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500">No recommendations available</p>
            <p className="text-sm text-gray-400 mt-1">
              {searchTerm ? "Try a different search term" : "Check back later for personalized suggestions"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {suggestions.map((exhibitor) => (
            <Card
              key={exhibitor.id}
              className="hover:shadow-lg transition-all duration-200 hover:scale-[1.02]"
            >
              <CardContent className="p-5">
                {/* Profile Image */}
                <div className="flex justify-center mb-4">
                  {exhibitor.avatar ? (
                    <Image
                      src={exhibitor.avatar}
                      alt={exhibitor.name}
                      width={80}
                      height={80}
                      className="rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center">
                      <Building2 className="h-10 w-10 text-blue-500" />
                    </div>
                  )}
                </div>

                {/* Name & Company */}
                <div className="text-center mb-3">
                  <h3 className="font-bold text-lg text-blue-600">{exhibitor.name}</h3>
                  <p className="text-sm text-gray-600">{exhibitor.company}</p>
                </div>

                {/* Industry & Location */}
                <div className="space-y-1 text-sm text-gray-600 mb-3">
                  {exhibitor.industry && (
                    <p className="text-center">
                      <span className="font-medium">Industry:</span> {exhibitor.industry}
                    </p>
                  )}
                  {exhibitor.location && (
                    <p className="text-center">
                      <span className="font-medium">Location:</span> {exhibitor.location}
                    </p>
                  )}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-2 mb-4 py-2 border-t border-b">
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
                {(exhibitor.website || exhibitor.linkedin) && (
                  <div className="flex justify-center gap-3 mb-4">
                    {exhibitor.website && (
                      <a
                        href={exhibitor.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-500 hover:text-blue-600 transition"
                      >
                        <LinkIcon className="h-4 w-4" />
                      </a>
                    )}
                    {exhibitor.linkedin && (
                      <a
                        href={exhibitor.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-500 hover:text-blue-600 transition"
                      >
                        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451c.979 0 1.771-.773 1.771-1.729V1.729C24 .774 23.204 0 22.225 0z" />
                        </svg>
                      </a>
                    )}
                  </div>
                )}

                {/* Upcoming Events Badge */}
                {exhibitor.upcomingEvents.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs font-medium text-gray-500 mb-1">Upcoming Events</p>
                    <div className="flex flex-wrap gap-1">
                      {exhibitor.upcomingEvents.slice(0, 2).map((event) => (
                        <Badge key={event.id} variant="outline" className="text-xs">
                          <Calendar className="h-3 w-3 mr-1" />
                          {event.title}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleConnect(exhibitor.id)}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                  >
                    Connect
                  </Button>
                  <Button
                    onClick={() => handleScheduleMeeting(exhibitor.id, exhibitor.name)}
                    variant="outline"
                    className="flex-1 border-blue-500 text-blue-600 hover:bg-blue-50"
                  >
                    Meet
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}