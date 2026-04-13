"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Star, Download, Award, MessageSquare, BarChart3, Users, ThumbsUp, Filter } from "lucide-react"

export function FeedbackRatings() {
  const [selectedSession, setSelectedSession] = useState("all")
  const [filterType, setFilterType] = useState("all")

  const sessions = [
    {
      id: "1",
      title: "The Future of Cloud Architecture",
      event: "TechConf 2024",
      date: "2024-01-15",
      status: "completed",
      averageRating: 4.8,
      totalRatings: 128,
      attendees: 450,
      feedbackCount: 89,
    },
    {
      id: "2",
      title: "Machine Learning in Production",
      event: "AI Summit 2024",
      date: "2024-01-20",
      status: "completed",
      averageRating: 4.6,
      totalRatings: 95,
      attendees: 120,
      feedbackCount: 67,
    },
    {
      id: "3",
      title: "Scaling DevOps Culture",
      event: "DevOps Days",
      date: "2024-04-05",
      status: "upcoming",
      averageRating: 0,
      totalRatings: 0,
      attendees: 200,
      feedbackCount: 0,
    },
  ]

  const ratingBreakdown = {
    5: { count: 78, percentage: 61 },
    4: { count: 35, percentage: 27 },
    3: { count: 12, percentage: 9 },
    2: { count: 3, percentage: 2 },
    1: { count: 0, percentage: 0 },
  }

  const feedback = [
    {
      id: 1,
      sessionId: "1",
      attendee: {
        name: "Sarah Johnson",
        title: "Senior Developer",
        company: "TechCorp",
        avatar: "/placeholder.svg?height=40&width=40",
      },
      rating: 5,
      comment:
        "Excellent session! John's insights on cloud architecture were incredibly valuable. The practical examples really helped me understand the concepts better.",
      timestamp: "2024-01-15 2:30 PM",
      helpful: 12,
      category: "content",
    },
    {
      id: 2,
      sessionId: "1",
      attendee: {
        name: "Mike Chen",
        title: "Tech Lead",
        company: "StartupXYZ",
        avatar: "/placeholder.svg?height=40&width=40",
      },
      rating: 4,
      comment:
        "Great presentation style and very engaging. Would love to see more on monitoring strategies in future sessions.",
      timestamp: "2024-01-15 2:45 PM",
      helpful: 8,
      category: "delivery",
    },
    {
      id: 3,
      sessionId: "2",
      attendee: {
        name: "Emily Rodriguez",
        title: "Data Scientist",
        company: "AI Labs",
        avatar: "/placeholder.svg?height=40&width=40",
      },
      rating: 5,
      comment: "Outstanding workshop! The hands-on approach made complex ML deployment concepts easy to understand.",
      timestamp: "2024-01-20 4:15 PM",
      helpful: 15,
      category: "content",
    },
  ]

  const organizerFeedback = [
    {
      id: 1,
      sessionId: "1",
      organizer: "Sarah Johnson",
      role: "Event Coordinator",
      rating: 5,
      comment:
        "John was fantastic to work with. Professional, well-prepared, and delivered exactly what was promised. Audience engagement was exceptional.",
      timestamp: "2024-01-16 10:00 AM",
    },
    {
      id: 2,
      sessionId: "2",
      organizer: "Mike Chen",
      role: "Technical Director",
      rating: 4,
      comment:
        "Great technical content and delivery. Minor AV issues but John handled them professionally. Would definitely invite back.",
      timestamp: "2024-01-21 9:30 AM",
    },
  ]

  const certificates = [
    {
      id: 1,
      sessionId: "1",
      title: "Certificate of Appreciation",
      event: "TechConf 2024",
      date: "2024-01-15",
      type: "appreciation",
      downloadUrl: "#",
    },
    {
      id: 2,
      sessionId: "2",
      title: "Speaker Excellence Award",
      event: "AI Summit 2024",
      date: "2024-01-20",
      type: "excellence",
      downloadUrl: "#",
    },
  ]

  const completedSessions = sessions.filter((s) => s.status === "completed")
  const selectedSessionData = selectedSession === "all" ? null : sessions.find((s) => s.id === selectedSession)

  const filteredFeedback = feedback.filter((f) => {
    if (selectedSession !== "all" && f.sessionId !== selectedSession) return false
    if (filterType === "all") return true
    if (filterType === "high-rating") return f.rating >= 4
    if (filterType === "recent") {
      const feedbackDate = new Date(f.timestamp)
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)
      return feedbackDate >= weekAgo
    }
    return true
  })

  const overallStats = {
    averageRating: completedSessions.reduce((acc, s) => acc + s.averageRating, 0) / completedSessions.length || 0,
    totalRatings: completedSessions.reduce((acc, s) => acc + s.totalRatings, 0),
    totalFeedback: completedSessions.reduce((acc, s) => acc + s.feedbackCount, 0),
    totalAttendees: completedSessions.reduce((acc, s) => acc + s.attendees, 0),
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Feedback & Ratings</h2>
        <div className="flex items-center space-x-2">
          <Button variant="outline" className="flex items-center space-x-2 bg-transparent">
            <Download className="h-4 w-4" />
            <span>Export Report</span>
          </Button>
        </div>
      </div>

      {/* Overall Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Average Rating</p>
                <p className="text-2xl font-bold text-gray-900">{overallStats.averageRating.toFixed(1)}</p>
              </div>
              <Star className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Ratings</p>
                <p className="text-2xl font-bold text-gray-900">{overallStats.totalRatings}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Feedback Comments</p>
                <p className="text-2xl font-bold text-gray-900">{overallStats.totalFeedback}</p>
              </div>
              <MessageSquare className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Attendees</p>
                <p className="text-2xl font-bold text-gray-900">{overallStats.totalAttendees}</p>
              </div>
              <Users className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Session Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Session Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {completedSessions.map((session) => (
              <div key={session.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{session.title}</h3>
                  <p className="text-sm text-blue-600">{session.event}</p>
                  <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                    <span>{new Date(session.date).toLocaleDateString()}</span>
                    <span>{session.attendees} attendees</span>
                    <span>{session.feedbackCount} feedback</span>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 text-yellow-500" />
                      <span className="font-medium">{session.averageRating}</span>
                      <span className="text-sm text-gray-500">({session.totalRatings})</span>
                    </div>
                    <div className="flex items-center space-x-1 mt-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-3 w-3 ${
                            i < Math.floor(session.averageRating) ? "text-yellow-400 fill-current" : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => setSelectedSession(session.id)}>
                    View Details
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">Session:</label>
              <select
                value={selectedSession}
                onChange={(e) => setSelectedSession(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-1 text-sm"
              >
                <option value="all">All Sessions</option>
                {completedSessions.map((session) => (
                  <option key={session.id} value={session.id}>
                    {session.title}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-1 text-sm"
              >
                <option value="all">All Feedback</option>
                <option value="high-rating">High Rating (4+)</option>
                <option value="recent">Recent (Last 7 days)</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Rating Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Rating Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {Object.entries(ratingBreakdown)
              .reverse()
              .map(([rating, data]) => (
                <div key={rating} className="flex items-center space-x-3">
                  <div className="flex items-center space-x-1 w-12">
                    <span className="text-sm">{rating}</span>
                    <Star className="h-3 w-3 text-yellow-400" />
                  </div>
                  <Progress value={data.percentage} className="flex-1 h-2" />
                  <span className="text-sm text-gray-600 w-12 text-right">{data.count}</span>
                </div>
              ))}
          </CardContent>
        </Card>

        {/* Certificates */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Award className="h-5 w-5" />
              <span>Certificates</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {certificates.map((cert) => (
              <div key={cert.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <h4 className="font-medium text-sm text-gray-900">{cert.title}</h4>
                  <p className="text-xs text-gray-600">{cert.event}</p>
                  <p className="text-xs text-gray-500">{new Date(cert.date).toLocaleDateString()}</p>
                </div>
                <Button size="sm" variant="outline">
                  <Download className="h-4 w-4 mr-1" />
                  Download
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Organizer Feedback */}
        <Card>
          <CardHeader>
            <CardTitle>Organizer Reviews</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {organizerFeedback.map((feedback) => (
              <div key={feedback.id} className="p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h4 className="font-medium text-sm text-gray-900">{feedback.organizer}</h4>
                    <p className="text-xs text-gray-600">{feedback.role}</p>
                  </div>
                  <div className="flex items-center space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-3 w-3 ${i < feedback.rating ? "text-yellow-400 fill-current" : "text-gray-300"}`}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-sm text-gray-800">{feedback.comment}</p>
                <p className="text-xs text-gray-500 mt-2">{feedback.timestamp}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Audience Feedback */}
      <Card>
        <CardHeader>
          <CardTitle>Audience Comments & Suggestions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredFeedback.map((feedback) => (
              <div key={feedback.id} className="p-4 border rounded-lg">
                <div className="flex items-start space-x-3">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={feedback.attendee.avatar || "/placeholder.svg"} />
                    <AvatarFallback>
                      {feedback.attendee.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">{feedback.attendee.name}</h4>
                        <p className="text-sm text-gray-600">{feedback.attendee.title}</p>
                        <p className="text-sm text-gray-500">{feedback.attendee.company}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="flex items-center space-x-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < feedback.rating ? "text-yellow-400 fill-current" : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {feedback.category}
                        </Badge>
                      </div>
                    </div>
                    <p className="text-gray-800 mt-2">{feedback.comment}</p>
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-xs text-gray-500">{feedback.timestamp}</span>
                      <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="sm" className="text-xs">
                          <ThumbsUp className="h-3 w-3 mr-1" />
                          Helpful ({feedback.helpful})
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {filteredFeedback.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <MessageSquare className="h-8 w-8 mx-auto mb-2 text-gray-400" />
              <p>No feedback found</p>
              {selectedSession !== "all" && <p className="text-sm">Try selecting a different session</p>}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
