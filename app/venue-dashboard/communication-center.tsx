"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import MessagesCenter from "@/app/organizer-dashboard/messages-center"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"
import { Send, Bell, CheckCircle, Clock, MessageSquare, Calendar, Megaphone, Loader2 } from "lucide-react"

interface Conversation {
  id: string
  eventName: string
  organizer: {
    name: string
    company: string
    role: string
    avatar: string
  }
  lastMessage: string
  lastMessageTime: string
  unreadCount: number
  priority: string
  status: string
}

interface Message {
  id: number | string
  conversationId: string
  sender: string
  senderName: string
  message: string
  timestamp: string
  attachments: Array<{ name: string; size: string }>
}

interface Notification {
  id: number | string
  type: string
  title: string
  message: string
  timestamp: string
  read: boolean
  priority: string
}

interface Organizer {
  id: string
  name: string
  company: string
  event: string
}

interface CommunicationCenterProps {
  params: { id: string }
}

export default function CommunicationCenter({ params }: CommunicationCenterProps) {
  const { id } = params
  const { toast } = useToast()
  const [selectedConversation, setSelectedConversation] = useState("1")
  const [newMessage, setNewMessage] = useState("")
  const [broadcastMessage, setBroadcastMessage] = useState("")
  const [selectedOrganizers, setSelectedOrganizers] = useState<string[]>([])
  const [broadcastType, setBroadcastType] = useState("email")

  // Data states
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [organizers, setOrganizers] = useState<Organizer[]>([])

  // Loading states
  const [loadingConversations, setLoadingConversations] = useState(true)
  const [loadingMessages, setLoadingMessages] = useState(false)
  const [loadingNotifications, setLoadingNotifications] = useState(true)
  const [loadingOrganizers, setLoadingOrganizers] = useState(true)
  const [sendingMessage, setSendingMessage] = useState(false)
  const [sendingBroadcast, setSendingBroadcast] = useState(false)

  // Fetch conversations
  const fetchConversations = async () => {
    try {
      setLoadingConversations(true)
      const response = await fetch("/api/conversations")
      const data = await response.json()

      if (data.success) {
        setConversations(data.conversations)
      } else {
        toast({
          title: "Error",
          description: "Failed to load conversations",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error fetching conversations:", error)
      toast({
        title: "Error",
        description: "Failed to load conversations",
        variant: "destructive",
      })
    } finally {
      setLoadingConversations(false)
    }
  }

  // Fetch messages for a conversation
  const fetchMessages = async (conversationId: string) => {
    try {
      setLoadingMessages(true)
      const response = await fetch(`/api/conversations/${conversationId}/messages`)
      const data = await response.json()

      if (data.success) {
        setMessages(data.messages)
      } else {
        toast({
          title: "Error",
          description: "Failed to load messages",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error fetching messages:", error)
      toast({
        title: "Error",
        description: "Failed to load messages",
        variant: "destructive",
      })
    } finally {
      setLoadingMessages(false)
    }
  }

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      setLoadingNotifications(true)
      const response = await fetch("/api/notifications")
      const data = await response.json()

      if (data.success) {
        setNotifications(data.notifications)
      } else {
        toast({
          title: "Error",
          description: "Failed to load notifications",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error fetching notifications:", error)
      toast({
        title: "Error",
        description: "Failed to load notifications",
        variant: "destructive",
      })
    } finally {
      setLoadingNotifications(false)
    }
  }

  // Fetch organizers
  const fetchOrganizers = async () => {
    try {
      setLoadingOrganizers(true)
      const response = await fetch("/api/organizers/list")
      const data = await response.json()

      if (data.success) {
        setOrganizers(data.organizers)
      } else {
        toast({
          title: "Error",
          description: "Failed to load organizers",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error fetching organizers:", error)
      toast({
        title: "Error",
        description: "Failed to load organizers",
        variant: "destructive",
      })
    } finally {
      setLoadingOrganizers(false)
    }
  }

  // Send message
  const sendMessage = async () => {
    if (!newMessage.trim()) return

    try {
      setSendingMessage(true)
      const response = await fetch(`/api/organizers/${selectedConversation}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: newMessage,
        }),
      })

      const data = await response.json()

      if (data.success) {
        setMessages((prev) => [...prev, data.message])
        setNewMessage("")
        toast({
          title: "Success",
          description: "Message sent successfully",
        })
      } else {
        toast({
          title: "Error",
          description: "Failed to send message",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error sending message:", error)
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      })
    } finally {
      setSendingMessage(false)
    }
  }

  // Send broadcast
  const sendBroadcast = async () => {
    if (!broadcastMessage.trim() || selectedOrganizers.length === 0) return

    try {
      setSendingBroadcast(true)
      const response = await fetch("/api/broadcasts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          recipientIds: selectedOrganizers,
          message: broadcastMessage,
          broadcastType,
          title: `Broadcast - ${new Date().toLocaleDateString()}`,
        }),
      })

      const data = await response.json()

      if (data.success) {
        setBroadcastMessage("")
        setSelectedOrganizers([])
        toast({
          title: "Success",
          description: data.message,
        })
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to send broadcast",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error sending broadcast:", error)
      toast({
        title: "Error",
        description: "Failed to send broadcast",
        variant: "destructive",
      })
    } finally {
      setSendingBroadcast(false)
    }
  }

  // Load data on component mount
  useEffect(() => {
    fetchConversations()
    fetchNotifications()
    fetchOrganizers()
  }, [])

  // Load messages when conversation changes
  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation)
    }
  }, [selectedConversation])

  const currentConversation = conversations.find((c) => c.id === selectedConversation)
  const conversationMessages = messages.filter((m) => m.conversationId === selectedConversation)

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800"
      case "medium":
        return "bg-yellow-100 text-yellow-800"
      case "low":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "booking":
        return <Calendar className="h-4 w-4 text-blue-500" />
      case "payment":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "reminder":
        return <Clock className="h-4 w-4 text-orange-500" />
      case "inquiry":
        return <MessageSquare className="h-4 w-4 text-purple-500" />
      default:
        return <Bell className="h-4 w-4 text-gray-500" />
    }
  }

  const handleOrganizerSelection = (organizerId: string, checked: boolean) => {
    if (checked) {
      setSelectedOrganizers([...selectedOrganizers, organizerId])
    } else {
      setSelectedOrganizers(selectedOrganizers.filter((id) => id !== organizerId))
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Communication Center</h1>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-red-600">
            {notifications.filter((n) => !n.read).length} Unread
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="messages" className="space-y-6">
        <TabsList>
          <TabsTrigger value="messages">Messages</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="broadcast">Broadcast</TabsTrigger>
        </TabsList>

        <TabsContent value="messages" className="space-y-6">
          <div className="">
            <MessagesCenter organizerId={id} />
          </div>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Bell className="h-5 w-5" />
                <span>Notification Logs</span>
                {notifications.filter((n) => !n.read).length > 0 && (
                  <Badge variant="destructive">{notifications.filter((n) => !n.read).length}</Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {loadingNotifications ? (
                <div className="flex items-center justify-center p-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 rounded-lg border ${
                      !notification.read ? "bg-blue-50 border-blue-200" : "bg-gray-50 border-gray-200"
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      {getNotificationIcon(notification.type)}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-sm text-gray-900">{notification.title}</h4>
                          <Badge className={getPriorityColor(notification.priority)} variant="outline">
                            {notification.priority}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                        <p className="text-xs text-gray-400 mt-2">{notification.timestamp}</p>
                      </div>
                      {!notification.read && (
                        <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 mt-1"></div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="broadcast" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Megaphone className="h-5 w-5" />
                <span>Broadcast to Organizers</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Select Recipients</label>
                    <div className="space-y-2 max-h-48 overflow-y-auto border rounded-lg p-3">
                      {loadingOrganizers ? (
                        <div className="flex items-center justify-center p-4">
                          <Loader2 className="h-4 w-4 animate-spin" />
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center space-x-2 pb-2 border-b">
                            <Checkbox
                              id="select-all"
                              checked={selectedOrganizers.length === organizers.length}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setSelectedOrganizers(organizers.map((o) => o.id))
                                } else {
                                  setSelectedOrganizers([])
                                }
                              }}
                            />
                            <label htmlFor="select-all" className="text-sm font-medium">
                              Select All Organizers
                            </label>
                          </div>
                          {organizers.map((organizer) => (
                            <div key={organizer.id} className="flex items-center space-x-2">
                              <Checkbox
                                id={organizer.id}
                                checked={selectedOrganizers.includes(organizer.id)}
                                onCheckedChange={(checked) =>
                                  handleOrganizerSelection(organizer.id, checked as boolean)
                                }
                              />
                              <label htmlFor={organizer.id} className="text-sm flex-1">
                                <div className="font-medium">{organizer.name}</div>
                                <div className="text-gray-600">{organizer.company}</div>
                                <div className="text-blue-600 text-xs">{organizer.event}</div>
                              </label>
                            </div>
                          ))}
                        </>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Broadcast Method</label>
                    <Select value={broadcastType} onValueChange={setBroadcastType}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="sms">SMS</SelectItem>
                        <SelectItem value="whatsapp">WhatsApp</SelectItem>
                        <SelectItem value="all">All Methods</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Message</label>
                    <Textarea
                      value={broadcastMessage}
                      onChange={(e) => setBroadcastMessage(e.target.value)}
                      placeholder="Type your broadcast message here..."
                      rows={8}
                      className="resize-none"
                      disabled={sendingBroadcast}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600">{selectedOrganizers.length} recipient(s) selected</div>
                    <Button
                      onClick={sendBroadcast}
                      disabled={!broadcastMessage.trim() || selectedOrganizers.length === 0 || sendingBroadcast}
                      className="flex items-center space-x-2"
                    >
                      {sendingBroadcast ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                      <span>{sendingBroadcast ? "Sending..." : "Send Broadcast"}</span>
                    </Button>
                  </div>
                </div>
              </div>

              {/* Quick Message Templates */}
              <div className="border-t pt-4">
                <h4 className="font-medium mb-3">Quick Templates</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Button
                    variant="outline"
                    className="text-left h-auto p-3 bg-transparent"
                    onClick={() =>
                      setBroadcastMessage(
                        "Reminder: Please confirm your event setup requirements by [date]. Contact us if you need any assistance.",
                      )
                    }
                    disabled={sendingBroadcast}
                  >
                    <div>
                      <div className="font-medium text-sm">Setup Reminder</div>
                      <div className="text-xs text-gray-600">Remind about setup requirements</div>
                    </div>
                  </Button>
                  <Button
                    variant="outline"
                    className="text-left h-auto p-3 bg-transparent"
                    onClick={() =>
                      setBroadcastMessage(
                        "Important: Due to maintenance work, parking will be limited on [date]. Please inform your attendees about alternative parking options.",
                      )
                    }
                    disabled={sendingBroadcast}
                  >
                    <div>
                      <div className="font-medium text-sm">Facility Update</div>
                      <div className="text-xs text-gray-600">Notify about facility changes</div>
                    </div>
                  </Button>
                  <Button
                    variant="outline"
                    className="text-left h-auto p-3 bg-transparent"
                    onClick={() =>
                      setBroadcastMessage(
                        "Payment reminder: Your event payment is due on [date]. Please complete the payment to confirm your booking.",
                      )
                    }
                    disabled={sendingBroadcast}
                  >
                    <div>
                      <div className="font-medium text-sm">Payment Reminder</div>
                      <div className="text-xs text-gray-600">Send payment reminders</div>
                    </div>
                  </Button>
                  <Button
                    variant="outline"
                    className="text-left h-auto p-3 bg-transparent"
                    onClick={() =>
                      setBroadcastMessage(
                        "Thank you for choosing our venue for your event. We look forward to making your event a great success!",
                      )
                    }
                    disabled={sendingBroadcast}
                  >
                    <div>
                      <div className="font-medium text-sm">Welcome Message</div>
                      <div className="text-xs text-gray-600">Welcome new organizers</div>
                    </div>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
