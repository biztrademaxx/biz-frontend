"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { apiFetch, isAuthenticated } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
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
  Trash2,
  X,
} from "lucide-react"
import Image from "next/image"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface Connection {
  id: string
  firstName: string
  lastName: string
  email: string
  avatar: string
  role: string
  company: string
  jobTitle: string
  lastLogin?: string | null
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

const ONLINE_THRESHOLD_MS = 5 * 60 * 1000 // 5 minutes

function isOnlineFromLastLogin(lastLogin?: string | null): boolean {
  if (!lastLogin) return false
  const t = new Date(lastLogin).getTime()
  return Date.now() - t < ONLINE_THRESHOLD_MS
}

interface Conversation {
  id: string
  contactId: string
  contact?: {
    id?: string
    firstName?: string | null
    lastName?: string | null
    avatar?: string | null
    role?: string
    company?: string | null
    lastLogin?: string | null
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
  const [deleteMessageId, setDeleteMessageId] = useState<string | null>(null)
  const [deleteConversationId, setDeleteConversationId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [])

  const fetchConversations = useCallback(async () => {
    if (!isAuthenticated()) {
      setConversations([])
      return
    }
    try {
      setLoading(true)
      const data = await apiFetch<{ conversations?: Conversation[] }>("/api/conversations", { auth: true })
      setConversations(Array.isArray(data?.conversations) ? data.conversations : [])
    } catch (error: unknown) {
      const err = error as { message?: string; status?: number }
      if (err?.message?.includes("Authorization") || err?.status === 401) {
        setConversations([])
        return
      }
      console.error("Error fetching conversations:", error)
      toast({
        title: "Error",
        description: "Failed to load conversations",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchConnections = useCallback(async () => {
    if (!isAuthenticated()) {
      setConnections([])
      return
    }
    try {
      const data = await apiFetch<{ connections?: Array<{ id: string; firstName?: string; lastName?: string; email?: string; avatar?: string; role?: string; company?: string; status?: string; lastLogin?: string | null }> }>("/api/connections", { auth: true })
      const list = Array.isArray(data?.connections) ? data.connections : []
      const connected = list.filter((c) => c.status === "connected")
      setConnections(
        connected.map((c) => ({
          id: c.id,
          firstName: c.firstName ?? "",
          lastName: c.lastName ?? "",
          email: c.email ?? "",
          avatar: c.avatar ?? "",
          role: c.role ?? "",
          company: c.company ?? "",
          jobTitle: "",
          lastLogin: c.lastLogin ?? null,
          isOnline: isOnlineFromLastLogin(c.lastLogin),
        }))
      )
    } catch (err: unknown) {
      const e = err as { message?: string; status?: number }
      if (e?.message?.includes("Authorization") || e?.status === 401) {
        setConnections([])
        return
      }
      console.error("Error fetching connections:", err)
      toast({
        title: "Error",
        description: "Failed to load connections",
        variant: "destructive",
      })
    }
  }, [])

  const fetchMessages = useCallback(async (conversationId: string) => {
    try {
      setLoading(true)
      const data = await apiFetch<{ messages?: Message[] }>(`/api/messages/${conversationId}`, { auth: true })
      setMessages(Array.isArray(data?.messages) ? data.messages : [])
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
  }, [])

  const markMessagesAsRead = useCallback(async (conversationId: string) => {
    try {
      await apiFetch("/api/messages/read", {
        method: "POST",
        body: { conversationId },
        auth: true,
      })
      setMessages((prev) => prev.map((msg) => ({ ...msg, isRead: true })))
      setConversations((prev) =>
        prev.map((conv) => (conv.id === conversationId ? { ...conv, unreadCount: 0 } : conv))
      )
    } catch (error) {
      console.error("Error marking messages as read:", error)
    }
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  useEffect(() => {
    fetchConversations()
    fetchConnections()
  }, [organizerId, fetchConversations, fetchConnections])

  useEffect(() => {
    if (selectedContact) {
      fetchMessages(selectedContact)
      markMessagesAsRead(selectedContact)
    }
  }, [selectedContact, fetchMessages, markMessagesAsRead])

  // Optional: poll for new conversations (no WebSocket required)
  useEffect(() => {
    if (!organizerId) return
    let timeoutId: ReturnType<typeof setTimeout> | null = null
    const pollInterval = 30000 // 30s
    const schedulePoll = () => {
      timeoutId = setTimeout(() => {
        fetchConversations().catch(() => {})
        schedulePoll()
      }, pollInterval)
    }
    schedulePoll()
    return () => {
      if (timeoutId) clearTimeout(timeoutId)
    }
  }, [organizerId, fetchConversations])

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedContact) return

    // Declare tempId outside the try block so it's accessible in catch
    const tempId = Date.now().toString()

    try {
      setSending(true)

      // Optimistically add message to UI
      const optimisticMessage: Message = {
        id: tempId,
        senderId: organizerId,
        receiverId: selectedContact,
        content: newMessage.trim(),
        createdAt: new Date().toISOString(),
        isRead: false,
        sender: {
          firstName: "You",
          lastName: "",
          avatar: "/placeholder.svg"
        }
      }

      setMessages(prev => [...prev, optimisticMessage])
      setNewMessage("")

      // Update conversations list optimistically
      setConversations(prev => {
        const existingConvIndex = prev.findIndex(conv => conv.contactId === selectedContact)
        if (existingConvIndex !== -1) {
          const updatedConvs = [...prev]
          updatedConvs[existingConvIndex] = {
            ...updatedConvs[existingConvIndex],
            lastMessage: newMessage.trim(),
            lastMessageTime: new Date().toISOString()
          }
          return updatedConvs
        }
        return prev
      })

      // Send via backend API (selectedContact is conversation id)
      const data = await apiFetch<{ message?: Message }>("/api/messages", {
        method: "POST",
        body: { conversationId: selectedContact, content: newMessage.trim() },
        auth: true,
      })

      if (data?.message) {
        setMessages((prev) => prev.map((msg) => (msg.id === tempId ? data.message! : msg)))
      }

      toast({
        title: "Success",
        description: "Message sent successfully",
      })
    } catch (error) {
      console.error("Error sending message:", error)
      // Remove optimistic message on error
      setMessages(prev => prev.filter(msg => msg.id !== tempId))
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      })
    } finally {
      setSending(false)
    }
  }

  const startNewChat = async (connection: Connection) => {
    setShowNewChat(false)
    try {
      const data = await apiFetch<{ conversation?: { id: string } }>("/api/conversations/start", {
        method: "POST",
        body: { participantIds: [connection.id] },
        auth: true,
      })
      const conversationId = data?.conversation?.id
      if (conversationId) {
        await fetchConversations()
        setSelectedContact(conversationId)
        await fetchMessages(conversationId)
      }
    } catch (err) {
      console.error("Error starting conversation:", err)
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to start conversation",
        variant: "destructive",
      })
    }
  }

  const getSelectedContactInfo = () => {
    if (!selectedContact) return null

    // selectedContact is conversation id
    const conversation = conversations.find((conv) => conv.id === selectedContact)
    if (conversation?.contact) {
      return {
        firstName: conversation.contact.firstName ?? "",
        lastName: conversation.contact.lastName ?? "",
        avatar: conversation.contact.avatar ?? "",
        role: conversation.contact.role ?? "Unknown",
        company: conversation.contact.company ?? "Unknown",
      }
    }

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

  const deleteMessage = async (messageId: string) => {
    try {
      setDeleting(true)
      // Backend has no delete message endpoint; remove from local state only
      setMessages((prev) => prev.filter((msg) => msg.id !== messageId))
      toast({
        title: "Success",
        description: "Message removed from view",
      })
    } catch (error) {
      console.error("Error deleting message:", error)
      toast({
        title: "Error",
        description: "Failed to delete message",
        variant: "destructive",
      })
    } finally {
      setDeleting(false)
      setDeleteMessageId(null)
    }
  }

  const deleteConversation = async (conversationId: string) => {
    try {
      setDeleting(true)
      // Backend may not have delete conversation; remove from local state only for now
      setConversations((prev) => prev.filter((conv) => conv.id !== conversationId))
      if (selectedContact === conversationId) {
        setSelectedContact(null)
        setMessages([])
      }

      toast({
        title: "Success",
        description: "Conversation deleted successfully",
      })
    } catch (error) {
      console.error("Error deleting conversation:", error)
      toast({
        title: "Error",
        description: "Failed to delete conversation",
        variant: "destructive",
      })
    } finally {
      setDeleting(false)
      setDeleteConversationId(null)
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
                <Button size="sm" className="h-8 w-8 p-0" aria-label="Start new chat">
                  <Plus className="w-4 h-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md" aria-describedby="start-new-chat-desc">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Start New Chat
                  </DialogTitle>
                  <DialogDescription id="start-new-chat-desc">
                    Choose a connection to start a conversation.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search connections..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                      aria-label="Search connections"
                    />
                  </div>
                  <ScrollArea className="h-64">
                    <div className="space-y-2">
                      {filteredConnections.map((connection) => (
                        <div
                          key={connection.id}
                          className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer"
                          onClick={() => startNewChat(connection)}
                          onKeyPress={(e) => e.key === 'Enter' && startNewChat(connection)}
                          tabIndex={0}
                          role="button"
                          aria-label={`Start chat with ${connection.firstName} ${connection.lastName}`}
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
            <Input
              placeholder="Search chats..."
              className="pl-10 h-9"
              aria-label="Search chats"
            />
          </div>
        </div>

        {/* Conversations List */}
        <ScrollArea className="flex-1">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
              <span className="sr-only">Loading conversations</span>
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
                  className={`group relative p-3 hover:bg-gray-50 cursor-pointer ${selectedContact === conversation.id ? "bg-blue-50 border-r-2 border-blue-500" : ""
                    }`}
                >
                  <div
                    className="flex items-start gap-3"
                    onClick={() => setSelectedContact(conversation.id)}
                    onKeyPress={(e) => e.key === "Enter" && setSelectedContact(conversation.id)}
                    tabIndex={0}
                    role="button"
                    aria-label={`Open conversation with ${conversation.contact?.firstName} ${conversation.contact?.lastName}`}
                  >
                    <div className="relative shrink-0">
                      <Image
                        src={conversation.contact?.avatar || "/placeholder.svg?height=40&width=40"}
                        alt="Contact"
                        width={40}
                        height={40}
                        className="rounded-full"
                      />
                      {isOnlineFromLastLogin(conversation.contact?.lastLogin) && (
                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full" title="Online" />
                      )}
                    </div>
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
                  {/* Delete button for conversations */}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute top-2 right-2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => {
                      e.stopPropagation()
                      setDeleteConversationId(conversation.id)
                    }}
                    aria-label="Delete conversation"
                  >
                    <X className="w-3 h-3 text-gray-400 hover:text-red-500" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>

      {/* Chat Area - flex column so messages scroll and input stays at bottom */}
      <div className="flex-1 flex flex-col min-h-0">
        {selectedContact && selectedContactInfo ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b bg-gray-50 shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative shrink-0">
                    <Image
                      src={selectedContactInfo.avatar || "/placeholder.svg"}
                      alt={`${selectedContactInfo.firstName} ${selectedContactInfo.lastName}`}
                      width={40}
                      height={40}
                      className="rounded-full"
                    />
                    {(() => {
                      const conv = conversations.find((c) => c.id === selectedContact)
                      const online = conv?.contact ? isOnlineFromLastLogin(conv.contact.lastLogin) : false
                      return online ? <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full" title="Online" /> : null
                    })()}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      {selectedContactInfo.firstName} {selectedContactInfo.lastName}
                    </h4>
                    <div className="flex items-center gap-2">
                      <Badge className={`text-xs ${getRoleBadgeColor(selectedContactInfo.role)}`}>
                        {selectedContactInfo.role}
                      </Badge>
                      {(() => {
                        const conv = conversations.find((c) => c.id === selectedContact)
                        const online = conv?.contact ? isOnlineFromLastLogin(conv.contact.lastLogin) : false
                        return (
                          <span className={`text-sm ${online ? "text-green-600" : "text-gray-500"}`}>
                            {online ? "Online" : "Offline"}
                          </span>
                        )
                      })()}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" aria-label="Call">
                    <Phone className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" aria-label="Video call">
                    <Video className="w-4 h-4" />
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" aria-label="More options">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        className="text-red-600 focus:text-red-600"
                        onClick={() => setDeleteConversationId(selectedContact)}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete Conversation
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>

            {/* Messages - scrollable, left/right alignment: sent = right, received = left */}
            <ScrollArea className="flex-1 min-h-0 p-4">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                  <span className="sr-only">Loading messages</span>
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center py-8">
                  <MessageCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p className="text-sm text-gray-500">No messages yet</p>
                  <p className="text-xs text-gray-400">Send a message to start the conversation</p>
                </div>
              ) : (
                <div className="space-y-3 flex flex-col">
                  {messages.map((message) => {
                    const isSent = message.senderId === organizerId
                    return (
                    <div
                      key={message.id}
                      className={`group flex w-full ${isSent ? "justify-end pl-8" : "justify-start pr-8"}`}
                    >
                      <div className={`relative max-w-[85%] sm:max-w-md ${isSent ? "order-2" : ""}`}>
                        <div
                          className={`px-4 py-2 rounded-lg ${message.senderId === organizerId ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-900"
                            }`}
                        >
                          <p className="text-sm break-words">{message.content}</p>
                          <div
                            className={`flex items-center justify-end gap-1 mt-1 ${message.senderId === organizerId ? "text-blue-100" : "text-gray-500"
                              }`}
                          >
                            <span className="text-xs">{formatTime(message.createdAt)}</span>
                            {isSent &&
                              (message.isRead ?
                                <CheckCheck className="w-3 h-3" aria-label="Message read" /> :
                                <Check className="w-3 h-3" aria-label="Message sent" />)}
                          </div>
                        </div>
                        {/* Delete button for messages */}
                        {isSent && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="absolute -top-2 -left-8 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => setDeleteMessageId(message.id)}
                            aria-label="Delete message"
                          >
                            <Trash2 className="w-3 h-3 text-gray-400 hover:text-red-500" />
                          </Button>
                        )}
                      </div>
                    </div>
                  )})}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </ScrollArea>

            {/* Message Input - fixed at bottom */}
            <div className="p-4 border-t bg-white shrink-0">
              <div className="flex items-center gap-2">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  onKeyPress={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
                  disabled={sending}
                  aria-label="Type a message"
                />
                <Button
                  onClick={sendMessage}
                  disabled={!newMessage.trim() || sending}
                  aria-label="Send message"
                >
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
              <Button onClick={() => setShowNewChat(true)} aria-label="Start new chat">
                <Plus className="w-4 h-4 mr-2" />
                Start New Chat
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Delete message confirmation dialog */}
      <AlertDialog open={!!deleteMessageId} onOpenChange={() => setDeleteMessageId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Message</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this message? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteMessageId && deleteMessage(deleteMessageId)}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete conversation confirmation dialog */}
      <AlertDialog open={!!deleteConversationId} onOpenChange={() => setDeleteConversationId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Conversation</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this entire conversation? All messages will be permanently deleted and
              this action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteConversationId && deleteConversation(deleteConversationId)}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Delete Conversation
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

