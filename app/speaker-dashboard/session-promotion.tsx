"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Share2, Download, Copy, QrCode, Mail, Twitter, Linkedin, Facebook, Eye, Users, TrendingUp } from "lucide-react"

export function SessionPromotion() {
  const [selectedSession, setSelectedSession] = useState("1")
  const [customMessage, setCustomMessage] = useState("")

  const sessions = [
    {
      id: "1",
      title: "The Future of Cloud Architecture",
      event: "TechConf 2024",
      date: "March 15, 2024",
      attendees: 450,
      views: 1250,
      shares: 89,
    },
    {
      id: "2",
      title: "Machine Learning in Production",
      event: "AI Summit 2024",
      date: "March 22, 2024",
      attendees: 120,
      views: 680,
      shares: 45,
    },
  ]

  const socialTemplates = {
    twitter:
      "🎤 Excited to speak at {event} on '{title}' on {date}! Join me for insights on the latest trends. #TechConf #CloudArchitecture",
    linkedin:
      "I'm thrilled to announce that I'll be speaking at {event} on {date}. My session '{title}' will cover the latest developments and best practices. Looking forward to connecting with fellow professionals!",
    facebook:
      "Join me at {event} where I'll be presenting '{title}' on {date}. It's going to be an exciting discussion about the future of technology!",
  }

  const speakerBadges = [
    {
      id: 1,
      name: "Speaker Badge - Blue",
      preview: "/placeholder.svg?height=200&width=300&text=Speaker+Badge+Blue",
      format: "PNG",
    },
    {
      id: 2,
      name: "Speaker Badge - Dark",
      preview: "/placeholder.svg?height=200&width=300&text=Speaker+Badge+Dark",
      format: "PNG",
    },
    {
      id: 3,
      name: "QR Code Badge",
      preview: "/placeholder.svg?height=200&width=200&text=QR+Code",
      format: "PNG",
    },
  ]

  const currentSession = sessions.find((s) => s.id === selectedSession)

  const generateSocialContent = (platform: string) => {
    if (!currentSession) return ""
    return socialTemplates[platform as keyof typeof socialTemplates]
      .replace("{event}", currentSession.event)
      .replace("{title}", currentSession.title)
      .replace("{date}", currentSession.date)
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    // Show toast notification
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Session Promotion Tools</h2>
        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium text-gray-700">Select Session:</label>
          <select
            value={selectedSession}
            onChange={(e) => setSelectedSession(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-1 text-sm"
          >
            {sessions.map((session) => (
              <option key={session.id} value={session.id}>
                {session.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {currentSession && (
        <>
          {/* Session Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Profile Views</p>
                    <p className="text-2xl font-bold text-gray-900">{currentSession.views}</p>
                  </div>
                  <Eye className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Expected Attendees</p>
                    <p className="text-2xl font-bold text-gray-900">{currentSession.attendees}</p>
                  </div>
                  <Users className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Social Shares</p>
                    <p className="text-2xl font-bold text-gray-900">{currentSession.shares}</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="badges" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="badges">Speaker Badges</TabsTrigger>
              <TabsTrigger value="social">Social Media</TabsTrigger>
              <TabsTrigger value="email">Email Invites</TabsTrigger>
              <TabsTrigger value="links">Share Links</TabsTrigger>
            </TabsList>

            <TabsContent value="badges" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Download Speaker Badges</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {speakerBadges.map((badge) => (
                      <div key={badge.id} className="space-y-3">
                        <div className="border rounded-lg p-4 bg-gray-50">
                          <img
                            src={badge.preview || "/placeholder.svg"}
                            alt={badge.name}
                            className="w-full h-32 object-cover rounded"
                          />
                        </div>
                        <div className="space-y-2">
                          <h3 className="font-medium">{badge.name}</h3>
                          <div className="flex space-x-2">
                            <Button size="sm" className="flex-1">
                              <Download className="h-4 w-4 mr-2" />
                              Download {badge.format}
                            </Button>
                            {badge.id === 3 && (
                              <Button size="sm" variant="outline">
                                <QrCode className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="social" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Twitter */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Twitter className="h-5 w-5 text-blue-400" />
                      <span>Twitter</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Textarea value={generateSocialContent("twitter")} rows={4} className="resize-none" readOnly />
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        onClick={() => copyToClipboard(generateSocialContent("twitter"))}
                        className="flex-1"
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        Copy
                      </Button>
                      <Button size="sm" variant="outline">
                        <Share2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* LinkedIn */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Linkedin className="h-5 w-5 text-blue-600" />
                      <span>LinkedIn</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Textarea value={generateSocialContent("linkedin")} rows={4} className="resize-none" readOnly />
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        onClick={() => copyToClipboard(generateSocialContent("linkedin"))}
                        className="flex-1"
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        Copy
                      </Button>
                      <Button size="sm" variant="outline">
                        <Share2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Facebook */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Facebook className="h-5 w-5 text-blue-800" />
                      <span>Facebook</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Textarea value={generateSocialContent("facebook")} rows={4} className="resize-none" readOnly />
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        onClick={() => copyToClipboard(generateSocialContent("facebook"))}
                        className="flex-1"
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        Copy
                      </Button>
                      <Button size="sm" variant="outline">
                        <Share2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="email" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Email Invitation Campaign</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email Subject</label>
                      <Input value={`Join me at ${currentSession.event} - ${currentSession.title}`} readOnly />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Custom Message</label>
                      <Textarea
                        value={customMessage}
                        onChange={(e) => setCustomMessage(e.target.value)}
                        placeholder="Add a personal message to your invitation..."
                        rows={4}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email List</label>
                      <Textarea placeholder="Enter email addresses separated by commas..." rows={3} />
                    </div>
                    <Button className="w-full">
                      <Mail className="h-4 w-4 mr-2" />
                      Send Invitations
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="links" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Shareable Links</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Speaker Profile Link</label>
                      <div className="flex space-x-2">
                        <Input value="https://tradefairs.com/speaker/john-smith" readOnly className="flex-1" />
                        <Button
                          variant="outline"
                          onClick={() => copyToClipboard("https://tradefairs.com/speaker/john-smith")}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Session Direct Link</label>
                      <div className="flex space-x-2">
                        <Input
                          value={`https://tradefairs.com/session/${currentSession.id}`}
                          readOnly
                          className="flex-1"
                        />
                        <Button
                          variant="outline"
                          onClick={() => copyToClipboard(`https://tradefairs.com/session/${currentSession.id}`)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">QR Code for Session</label>
                      <div className="flex items-center space-x-4">
                        <div className="w-24 h-24 bg-gray-100 border rounded-lg flex items-center justify-center">
                          <QrCode className="h-12 w-12 text-gray-400" />
                        </div>
                        <Button variant="outline">
                          <Download className="h-4 w-4 mr-2" />
                          Download QR Code
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  )
}
