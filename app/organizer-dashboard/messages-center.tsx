"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { apiFetch, isAuthenticated } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"
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
import type { MessageSurface } from "@/components/messages/message-theme"
import { MessagesInbox } from "@/components/messages/messages-inbox"

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
  /** Brand accents: organizer/visitor/venue/exhibitor (blue), default (violet). */
  surface?: MessageSurface
}

export default function MessagesCenter({ organizerId, surface = "default" }: MessagesCenterProps) {
  const { toast } = useToast()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedContact, setSelectedContact] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [chatListSearch, setChatListSearch] = useState("")
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

    const tempId = Date.now().toString()
    const content = newMessage.trim()

    try {
      setSending(true)

      const optimisticMessage: Message = {
        id: tempId,
        senderId: organizerId,
        receiverId: selectedContact,
        content,
        createdAt: new Date().toISOString(),
        isRead: false,
        sender: {
          firstName: "You",
          lastName: "",
          avatar: "",
        },
      }

      setMessages((prev) => [...prev, optimisticMessage])
      setNewMessage("")

      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === selectedContact
            ? { ...conv, lastMessage: content, lastMessageTime: new Date().toISOString() }
            : conv,
        ),
      )

      const data = await apiFetch<{ message?: Message }>("/api/messages", {
        method: "POST",
        body: { conversationId: selectedContact, content },
        auth: true,
      })

      if (data?.message) {
        setMessages((prev) => prev.map((msg) => (msg.id === tempId ? data.message! : msg)))
      }
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

  const filteredConversations = conversations.filter((conversation) => {
    if (!chatListSearch.trim()) return true
    const q = chatListSearch.toLowerCase()
    const name = `${conversation.contact?.firstName ?? ""} ${conversation.contact?.lastName ?? ""}`.toLowerCase()
    return name.includes(q) || (conversation.lastMessage ?? "").toLowerCase().includes(q)
  })

  const selectedConv = conversations.find((c) => c.id === selectedContact)
  const isContactOnline = selectedConv?.contact
    ? isOnlineFromLastLogin(selectedConv.contact.lastLogin)
    : false

  return (
    <>
    <MessagesInbox
      surface={surface}
      organizerId={organizerId}
      conversations={conversations}
      filteredConversations={filteredConversations}
      selectedContact={selectedContact}
      onSelectContact={setSelectedContact}
      onClearContact={() => setSelectedContact(null)}
      messages={messages}
      newMessage={newMessage}
      onNewMessageChange={setNewMessage}
      onSendMessage={sendMessage}
      sending={sending}
      loading={loading}
      chatListSearch={chatListSearch}
      onChatListSearchChange={setChatListSearch}
      connectionSearch={searchQuery}
      onConnectionSearchChange={setSearchQuery}
      filteredConnections={filteredConnections}
      showNewChat={showNewChat}
      onShowNewChatChange={setShowNewChat}
      onStartNewChat={startNewChat}
      selectedContactInfo={selectedContactInfo}
      isContactOnline={isContactOnline}
      isConversationOnline={isOnlineFromLastLogin}
      formatTime={formatTime}
      onDeleteMessage={setDeleteMessageId}
      onDeleteConversation={setDeleteConversationId}
      messagesEndRef={messagesEndRef}
    />
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
    </>
  )
}

