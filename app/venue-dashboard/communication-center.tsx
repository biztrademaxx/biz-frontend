"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import MessagesCenter from "@/app/organizer-dashboard/messages-center"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"
import { safeResponseJson } from "@/lib/api"
import { Send, Bell, CheckCircle, Clock, MessageSquare, Calendar, Megaphone, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  venueAccentText,
  venueCardShell,
  venuePrimaryBtn,
  venueTabsList,
  venueTabsScrollWrapper,
  venueTabsTrigger,
} from "./venue-dashboard-theme"

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
      const data = await safeResponseJson<{ success?: boolean; conversations?: Conversation[] }>(response)
      if (data?.success && Array.isArray(data.conversations)) {
        setConversations(data.conversations)
      } else {
        setConversations([])
      }
    } catch (error) {
      console.error("Error fetching conversations:", error)
      setConversations([])
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
      const data = await safeResponseJson<{ success?: boolean; messages?: Message[] }>(response)
      if (data?.success && Array.isArray(data.messages)) {
        setMessages(data.messages)
      } else {
        setMessages([])
      }
    } catch (error) {
      console.error("Error fetching messages:", error)
      setMessages([])
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
      const data = await safeResponseJson<{
        notifications?: Array<Record<string, unknown>>
      }>(response)
      if (data?.notifications && Array.isArray(data.notifications)) {
        const mapped: Notification[] = data.notifications.map((notif: Record<string, unknown>) => ({
          id: String(notif.id ?? ""),
          type: typeof notif.type === "string" ? notif.type : "push",
          title: typeof notif.title === "string" ? notif.title : "",
          message: typeof notif.message === "string" ? notif.message : "",
          timestamp:
            typeof notif.createdAt === "string"
              ? notif.createdAt
              : typeof notif.timestamp === "string"
                ? notif.timestamp
                : new Date().toISOString(),
          read: Boolean(notif.isRead ?? notif.read ?? false),
          priority: typeof notif.priority === "string" ? notif.priority : "medium",
        }))
        setNotifications(mapped)
      } else {
        setNotifications([])
      }
    } catch (error) {
      console.error("Error fetching notifications:", error)
      setNotifications([])
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
      const data = await safeResponseJson<{ success?: boolean; organizers?: Organizer[] }>(response)
      if (data?.success && Array.isArray(data.organizers)) {
        setOrganizers(data.organizers)
      } else {
        setOrganizers([])
      }
    } catch (error) {
      console.error("Error fetching organizers:", error)
      setOrganizers([])
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

      const data = await safeResponseJson<{ success?: boolean; message?: Message }>(response)

      if (response.ok && data?.success && data.message) {
        setMessages((prev) => [...prev, data.message!])
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

      const data = await safeResponseJson<{ success?: boolean; message?: string; error?: string }>(response)

      if (response.ok && data?.success) {
        setBroadcastMessage("")
        setSelectedOrganizers([])
        toast({
          title: "Success",
          description: data.message || "Broadcast sent",
        })
      } else {
        toast({
          title: "Error",
          description: data?.error || "Failed to send broadcast",
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
        return <Calendar className="h-4 w-4 text-blue-600" />
      case "payment":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "reminder":
        return <Clock className="h-4 w-4 text-orange-500" />
      case "inquiry":
        return <MessageSquare className="h-4 w-4 text-blue-500" />
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
    <div className="min-w-0 space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl font-bold text-gray-900 sm:text-2xl md:text-3xl">Communication Center</h1>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-red-600">
            {notifications.filter((n) => !n.read).length} Unread
          </Badge>
        </div>
      </div>

      <div className="space-y-6">
        {/* Messages Section */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Messages</h2>
          <MessagesCenter organizerId={id} surface="venue" />
        </div>

       
      </div>
    </div>
  )
}