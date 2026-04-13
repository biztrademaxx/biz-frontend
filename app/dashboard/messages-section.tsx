"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useToast } from "@/hooks/use-toast"
import {
  Search,
  Send,
  Phone,
  Video,
  MoreVertical,
  Plus,
  Users,
  MessageCircle,
  CheckCheck,
  Check,
  Loader2,
} from "lucide-react"
import Image from "next/image"

interface Connection {
  id: string
  firstName: string
  lastName: string
  email: string
  avatar: string
  role: string
  company: string
  jobTitle: string
  lastLogin: string
  isOnline: boolean
}

interface Message {
  id: string
  senderId: string
  receiverId: string
  content: string
  createdAt: string
  isRead: boolean
  sender?: {
    firstName: string
    lastName: string
    avatar: string
  }
}

interface Conversation {
  id: string
  contactId: string
  contact?: {
    firstName: string
    lastName: string
    avatar: string
  }
  lastMessage: string
  lastMessageTime: string
  unreadCount: number
}

interface MessagesCenterProps {
  organizerId: string
}

export default function MessagesCenter({ organizerId }: MessagesCenterProps) {
  const { toast } = useToast()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedContact, setSelectedContact] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [connections, setConnections] = useState<Connection[]>([])
  const [showNewChat, setShowNewChat] = useState(false)
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    fetchConversations()
    fetchConnections()
  }, [organizerId])

  useEffect(() => {
    if (selectedContact) {
      fetchMessages(selectedContact)
    }
  }, [selectedContact])

  const fetchConversations = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/organizers/${organizerId}/messages`)
      if (!response.ok) throw new Error("Failed to fetch conversations")
      const data = await response.json()
      setConversations(data.conversations || [])
    } catch (error) {
      console.error("Error fetching conversations:", error)
      toast({
        title: "Error",
        description: "Failed to load conversations",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchConnections = async () => {
    try {
      const response = await fetch(`/api/organizers/${organizerId}/connections`)
      if (!response.ok) throw new Error("Failed to fetch connections")
      const data = await response.json()
      setConnections(data.connections || [])
    } catch (error) {
      console.error("Error fetching connections:", error)
      toast({
        title: "Error",
        description: "Failed to load connections",
        variant: "destructive",
      })
    }
  }

  const fetchMessages = async (contactId: string) => {
    try {
      setLoading(true)
      const response = await fetch(`/api/organizers/${organizerId}/messages?contactId=${contactId}`)
      if (!response.ok) throw new Error("Failed to fetch messages")
      const data = await response.json()
      setMessages(data.messages || [])
    } catch (error) {
      console.error("Error fetching messages:", error)
      toast({
        title: "Error",
        description: "Failed to load messages",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedContact) return

    try {
      setSending(true)
      const response = await fetch(`/api/organizers/${organizerId}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contactId: selectedContact,
          content: newMessage.trim(),
        }),
      })

      if (!response.ok) throw new Error("Failed to send message")

      const data = await response.json()
      setMessages((prev) => [...prev, data.message])
      setNewMessage("")

      // Update conversations list
      fetchConversations()

      toast({
        title: "Success",
        description: "Message sent successfully",
      })
    } catch (error) {
      console.error("Error sending message:", error)
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      })
    } finally {
      setSending(false)
    }
  }

  const startNewChat = (connection: Connection) => {
    setSelectedContact(connection.id)
    setShowNewChat(false)

    // Check if conversation already exists
    const existingConversation = conversations.find((conv) => conv.contactId === connection.id)
    if (!existingConversation) {
      // Add to conversations list
      const newConversation: Conversation = {
        id: [organizerId, connection.id].sort().join("-"),
        contactId: connection.id,
        contact: {
          firstName: connection.firstName,
          lastName: connection.lastName,
          avatar: connection.avatar,
        },
        lastMessage: "",
        lastMessageTime: new Date().toISOString(),
        unreadCount: 0,
      }
      setConversations((prev) => [newConversation, ...prev])
    }
  }

  const getSelectedContactInfo = () => {
    if (!selectedContact) return null

    // First check conversations
    const conversation = conversations.find((conv) => conv.contactId === selectedContact)
    if (conversation?.contact) {
      return {
        firstName: conversation.contact.firstName,
        lastName: conversation.contact.lastName,
        avatar: conversation.contact.avatar,
        role: "Unknown",
        company: "Unknown",
      }
    }

    // Then check connections
    const connection = connections.find((conn) => conn.id === selectedContact)
    if (connection) {
      return {
        firstName: connection.firstName,
        lastName: connection.lastName,
        avatar: connection.avatar,
        role: connection.role,
        company: connection.company,
      }
    }

    return null
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)

    if (diffInHours < 1) {
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    } else if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    } else {
      return date.toLocaleDateString()
    }
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role.toLowerCase()) {
      case "organizer":
        return "bg-blue-100 text-blue-800"
      case "speaker":
        return "bg-green-100 text-green-800"
      case "attendee":
        return "bg-gray-100 text-gray-800"
      case "exhibitor":
        return "bg-purple-100 text-purple-800"
      case "venue_manager":
        return "bg-orange-100 text-orange-800"
      case "admin":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const filteredConnections = connections.filter(
    (connection) =>
      `${connection.firstName} ${connection.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      connection.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      connection.email.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const selectedContactInfo = getSelectedContactInfo()

  return (
    <div className="h-[600px] flex border rounded-lg overflow-hidden bg-white">
      {/* Conversations Sidebar */}
      <div className="w-1/3 border-r flex flex-col">
        {/* Header */}
        <div className="p-4 border-b bg-gray-50">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              Chats
            </h3>
            <Dialog open={showNewChat} onOpenChange={setShowNewChat}>
              <DialogTrigger asChild>
                <Button size="sm" className="h-8 w-8 p-0">
                  <Plus className="w-4 h-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Start New Chat
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search connections..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <ScrollArea className="h-64">
                    <div className="space-y-2">
                      {filteredConnections.map((connection) => (
                        <div
                          key={connection.id}
                          className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer"
                          onClick={() => startNewChat(connection)}
                        >
                          <div className="relative">
                            <Image
                              src={connection.avatar || "/placeholder.svg"}
                              alt={`${connection.firstName} ${connection.lastName}`}
                              width={40}
                              height={40}
                              className="rounded-full"
                            />
                            {connection.isOnline && (
                              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-sm text-gray-900 truncate">
                                {connection.firstName} {connection.lastName}
                              </p>
                              <Badge className={`text-xs px-1.5 py-0.5 ${getRoleBadgeColor(connection.role)}`}>
                                {connection.role}
                              </Badge>
                            </div>
                            <p className="text-xs text-gray-500 truncate">{connection.company}</p>
                          </div>
                        </div>
                      ))}
                      {filteredConnections.length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                          <Users className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                          <p className="text-sm">No connections found</p>
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input placeholder="Search chats..." className="pl-10 h-9" />
          </div>
        </div>

        {/* Conversations List */}
        <ScrollArea className="flex-1">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
            </div>
          ) : conversations.length === 0 ? (
            <div className="text-center py-8 px-4">
              <MessageCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p className="text-sm text-gray-500 mb-2">No conversations yet</p>
              <p className="text-xs text-gray-400">Start a new chat to begin messaging</p>
            </div>
          ) : (
            <div className="divide-y">
              {conversations.map((conversation) => (
                <div
                  key={conversation.id}
                  className={`p-3 hover:bg-gray-50 cursor-pointer ${
                    selectedContact === conversation.contactId ? "bg-blue-50 border-r-2 border-blue-500" : ""
                  }`}
                  onClick={() => setSelectedContact(conversation.contactId)}
                >
                  <div className="flex items-start gap-3">
                    <Image
                      src={conversation.contact?.avatar || "/placeholder.svg?height=40&width=40"}
                      alt="Contact"
                      width={40}
                      height={40}
                      className="rounded-full"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-sm text-gray-900 truncate">
                          {conversation.contact?.firstName} {conversation.contact?.lastName}
                        </p>
                        <span className="text-xs text-gray-500">{formatTime(conversation.lastMessageTime)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-600 truncate">
                          {conversation.lastMessage || "No messages yet"}
                        </p>
                        {conversation.unreadCount > 0 && (
                          <Badge className="bg-blue-500 text-white text-xs h-5 w-5 rounded-full p-0 flex items-center justify-center">
                            {conversation.unreadCount}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedContact && selectedContactInfo ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Image
                    src={selectedContactInfo.avatar || "/placeholder.svg"}
                    alt={`${selectedContactInfo.firstName} ${selectedContactInfo.lastName}`}
                    width={40}
                    height={40}
                    className="rounded-full"
                  />
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      {selectedContactInfo.firstName} {selectedContactInfo.lastName}
                    </h4>
                    <div className="flex items-center gap-2">
                      <Badge className={`text-xs ${getRoleBadgeColor(selectedContactInfo.role)}`}>
                        {selectedContactInfo.role}
                      </Badge>
                      <span className="text-sm text-gray-500">Offline</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm">
                    <Phone className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Video className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center py-8">
                  <MessageCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p className="text-sm text-gray-500">No messages yet</p>
                  <p className="text-xs text-gray-400">Send a message to start the conversation</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.senderId === organizerId ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          message.senderId === organizerId ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-900"
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                        <div
                          className={`flex items-center justify-end gap-1 mt-1 ${
                            message.senderId === organizerId ? "text-blue-100" : "text-gray-500"
                          }`}
                        >
                          <span className="text-xs">{formatTime(message.createdAt)}</span>
                          {message.senderId === organizerId &&
                            (message.isRead ? <CheckCheck className="w-3 h-3" /> : <Check className="w-3 h-3" />)}
                        </div>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </ScrollArea>

            {/* Message Input */}
            <div className="p-4 border-t">
              <div className="flex items-center gap-2">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  onKeyPress={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
                  disabled={sending}
                />
                <Button onClick={sendMessage} disabled={!newMessage.trim() || sending}>
                  {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <MessageCircle className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Select a conversation</h3>
              <p className="text-gray-500 mb-4">Choose from your existing conversations or start a new one</p>
              <Button onClick={() => setShowNewChat(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Start New Chat
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
