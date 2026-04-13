"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Send,
  Paperclip,
  Bell,
  AlertTriangle,
  CheckCircle,
  Clock,
  Settings,
  Mic,
  Monitor,
  Wifi,
  Users,
} from "lucide-react"

export function OrganizerCommunication() {
  const [selectedConversation, setSelectedConversation] = useState("1")
  const [newMessage, setNewMessage] = useState("")
  const [showRequirements, setShowRequirements] = useState(false)

  const conversations = [
    {
      id: "1",
      eventName: "TechConf 2024",
      sessionTitle: "The Future of Cloud Architecture",
      organizer: {
        name: "Sarah Johnson",
        role: "Event Coordinator",
        avatar: "/placeholder.svg?height=40&width=40",
      },
      lastMessage: "Hi John! Just confirming the AV setup for your keynote. Do you need a wireless mic?",
      lastMessageTime: "2024-02-22 10:30 AM",
      unreadCount: 2,
      priority: "high",
    },
    {
      id: "2",
      eventName: "AI Summit 2024",
      sessionTitle: "Machine Learning in Production",
      organizer: {
        name: "Mike Chen",
        role: "Technical Director",
        avatar: "/placeholder.svg?height=40&width=40",
      },
      lastMessage: "The demo environment is ready. Login credentials sent to your email.",
      lastMessageTime: "2024-02-21 3:45 PM",
      unreadCount: 0,
      priority: "normal",
    },
  ]

  const messages = [
    {
      id: 1,
      conversationId: "1",
      sender: "organizer",
      senderName: "Sarah Johnson",
      message: "Hi John! Welcome to TechConf 2024. We're excited to have you as our keynote speaker.",
      timestamp: "2024-02-20 9:00 AM",
      attachments: [],
    },
    {
      id: 2,
      conversationId: "1",
      sender: "speaker",
      senderName: "John Smith",
      message: "Thank you! I'm looking forward to it. Could you please send me the final agenda?",
      timestamp: "2024-02-20 9:15 AM",
      attachments: [],
    },
    {
      id: 3,
      conversationId: "1",
      sender: "organizer",
      senderName: "Sarah Johnson",
      message: "Here's the final agenda and speaker guidelines.",
      timestamp: "2024-02-20 9:30 AM",
      attachments: [
        { name: "TechConf_2024_Agenda.pdf", size: "2.1 MB" },
        { name: "Speaker_Guidelines.pdf", size: "1.5 MB" },
      ],
    },
    {
      id: 4,
      conversationId: "1",
      sender: "organizer",
      senderName: "Sarah Johnson",
      message: "Hi John! Just confirming the AV setup for your keynote. Do you need a wireless mic?",
      timestamp: "2024-02-22 10:30 AM",
      attachments: [],
    },
  ]

  const notifications = [
    {
      id: 1,
      type: "reminder",
      title: "Presentation Upload Deadline",
      message: "Don't forget to upload your presentation materials by March 10th",
      timestamp: "2024-02-22 8:00 AM",
      read: false,
    },
    {
      id: 2,
      type: "update",
      title: "Schedule Change",
      message: "Your session time has been moved to 10:00 AM (previously 11:00 AM)",
      timestamp: "2024-02-21 2:00 PM",
      read: false,
    },
    {
      id: 3,
      type: "info",
      title: "Venue Information",
      message: "Parking instructions and venue map have been updated",
      timestamp: "2024-02-20 4:30 PM",
      read: true,
    },
  ]

  const requirements = {
    technical: {
      microphone: "wireless",
      presentation: "HDMI connection required",
      internet: "High-speed WiFi needed for live demo",
      lighting: "Standard stage lighting",
    },
    seating: {
      arrangement: "Theater style",
      capacity: "450 attendees",
      accessibility: "Wheelchair accessible stage",
    },
    special: {
      notes: "Need water bottle on stage, prefer handheld mic over lapel",
    },
  }

  const currentConversation = conversations.find((c) => c.id === selectedConversation)
  const conversationMessages = messages.filter((m) => m.conversationId === selectedConversation)

  const sendMessage = () => {
    if (newMessage.trim()) {
      // Handle message sending logic
      setNewMessage("")
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800"
      case "medium":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "reminder":
        return <Clock className="h-4 w-4 text-orange-500" />
      case "update":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case "info":
        return <CheckCircle className="h-4 w-4 text-blue-500" />
      default:
        return <Bell className="h-4 w-4 text-gray-500" />
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Event Organizer Communication</h2>
        <Button
          onClick={() => setShowRequirements(!showRequirements)}
          variant="outline"
          className="flex items-center space-x-2"
        >
          <Settings className="h-4 w-4" />
          <span>Special Requirements</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Conversations List */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Conversations</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="space-y-1">
                {conversations.map((conversation) => (
                  <button
                    key={conversation.id}
                    onClick={() => setSelectedConversation(conversation.id)}
                    className={`w-full text-left p-4 hover:bg-gray-50 border-b transition-colors ${
                      selectedConversation === conversation.id ? "bg-blue-50 border-blue-200" : ""
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={conversation.organizer.avatar || "/placeholder.svg"} />
                        <AvatarFallback>
                          {conversation.organizer.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-sm text-gray-900 truncate">{conversation.organizer.name}</h4>
                          {conversation.unreadCount > 0 && (
                            <Badge variant="destructive" className="text-xs">
                              {conversation.unreadCount}
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-gray-600">{conversation.organizer.role}</p>
                        <p className="text-xs text-blue-600 font-medium truncate">{conversation.eventName}</p>
                        <p className="text-xs text-gray-500 truncate mt-1">{conversation.lastMessage}</p>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-xs text-gray-400">{conversation.lastMessageTime}</span>
                          {conversation.priority !== "normal" && (
                            <Badge className={getPriorityColor(conversation.priority)}>{conversation.priority}</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Messages */}
        <div className="lg:col-span-2">
          <Card className="h-[600px] flex flex-col">
            <CardHeader className="border-b">
              {currentConversation && (
                <div>
                  <CardTitle className="text-lg">{currentConversation.organizer.name}</CardTitle>
                  <p className="text-sm text-gray-600">{currentConversation.organizer.role}</p>
                  <p className="text-sm text-blue-600 font-medium">{currentConversation.eventName}</p>
                </div>
              )}
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
              {conversationMessages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === "speaker" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      message.sender === "speaker" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-900"
                    }`}
                  >
                    <p className="text-sm">{message.message}</p>
                    {message.attachments.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {message.attachments.map((attachment, index) => (
                          <div
                            key={index}
                            className={`flex items-center space-x-2 p-2 rounded ${
                              message.sender === "speaker" ? "bg-blue-700" : "bg-gray-200"
                            }`}
                          >
                            <Paperclip className="h-3 w-3" />
                            <span className="text-xs">{attachment.name}</span>
                            <span className="text-xs opacity-75">({attachment.size})</span>
                          </div>
                        ))}
                      </div>
                    )}
                    <p className={`text-xs mt-1 ${message.sender === "speaker" ? "text-blue-200" : "text-gray-500"}`}>
                      {message.timestamp}
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
            <div className="border-t p-4">
              <div className="flex space-x-2">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1"
                  onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                />
                <Button size="sm" variant="outline">
                  <Paperclip className="h-4 w-4" />
                </Button>
                <Button size="sm" onClick={sendMessage}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Notifications & Alerts */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Bell className="h-5 w-5" />
                <span>Notifications</span>
                {notifications.filter((n) => !n.read).length > 0 && (
                  <Badge variant="destructive">{notifications.filter((n) => !n.read).length}</Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-3 rounded-lg border ${
                    !notification.read ? "bg-blue-50 border-blue-200" : "bg-gray-50 border-gray-200"
                  }`}
                >
                  <div className="flex items-start space-x-2">
                    {getNotificationIcon(notification.type)}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm text-gray-900">{notification.title}</h4>
                      <p className="text-xs text-gray-600 mt-1">{notification.message}</p>
                      <p className="text-xs text-gray-400 mt-1">{notification.timestamp}</p>
                    </div>
                    {!notification.read && <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 mt-1"></div>}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Special Requirements Modal */}
      {showRequirements && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Special Requirements</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setShowRequirements(false)}>
                ×
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Technical Requirements */}
              <div className="space-y-4">
                <h3 className="font-medium text-gray-900 flex items-center space-x-2">
                  <Monitor className="h-4 w-4" />
                  <span>Technical Setup</span>
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Mic className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium">Microphone</p>
                      <p className="text-xs text-gray-600">{requirements.technical.microphone}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Monitor className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium">Presentation</p>
                      <p className="text-xs text-gray-600">{requirements.technical.presentation}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Wifi className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium">Internet</p>
                      <p className="text-xs text-gray-600">{requirements.technical.internet}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Seating & Accessibility */}
              <div className="space-y-4">
                <h3 className="font-medium text-gray-900 flex items-center space-x-2">
                  <Users className="h-4 w-4" />
                  <span>Seating & Accessibility</span>
                </h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium">Arrangement</p>
                    <p className="text-xs text-gray-600">{requirements.seating.arrangement}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Capacity</p>
                    <p className="text-xs text-gray-600">{requirements.seating.capacity}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Accessibility</p>
                    <p className="text-xs text-gray-600">{requirements.seating.accessibility}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Special Notes */}
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Special Notes</h3>
              <Textarea
                value={requirements.special.notes}
                rows={3}
                className="resize-none"
                placeholder="Add any special requirements or notes..."
              />
            </div>

            <div className="flex space-x-2">
              <Button className="flex-1">Update Requirements</Button>
              <Button variant="outline" onClick={() => setShowRequirements(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
