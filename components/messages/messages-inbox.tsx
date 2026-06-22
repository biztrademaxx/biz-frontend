"use client"

import type { RefObject } from "react"
import Image from "next/image"
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
  // Trash2,
  // X,
  ArrowLeft,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { getMessageTheme, roleBadgeClass, type MessageSurface } from "./message-theme"

export type InboxConnection = {
  id: string
  firstName: string
  lastName: string
  email: string
  avatar: string
  role: string
  company: string
  isOnline: boolean
}

export type InboxConversation = {
  id: string
  contact?: {
    firstName?: string | null
    lastName?: string | null
    avatar?: string | null
    role?: string
    lastLogin?: string | null
  }
  lastMessage: string
  lastMessageTime: string
  unreadCount: number
}

export type InboxMessage = {
  id: string
  senderId: string
  content: string
  createdAt: string
  isRead: boolean
}

export type InboxContactInfo = {
  firstName: string
  lastName: string
  avatar: string
  role: string
  company: string
}

type MessagesInboxProps = {
  surface: MessageSurface
  organizerId: string
  conversations: InboxConversation[]
  filteredConversations: InboxConversation[]
  selectedContact: string | null
  onSelectContact: (id: string) => void
  onClearContact: () => void
  messages: InboxMessage[]
  newMessage: string
  onNewMessageChange: (value: string) => void
  onSendMessage: () => void
  sending: boolean
  loading: boolean
  chatListSearch: string
  onChatListSearchChange: (value: string) => void
  connectionSearch: string
  onConnectionSearchChange: (value: string) => void
  filteredConnections: InboxConnection[]
  showNewChat: boolean
  onShowNewChatChange: (open: boolean) => void
  onStartNewChat: (connection: InboxConnection) => void
  selectedContactInfo: InboxContactInfo | null
  isContactOnline: boolean
  isConversationOnline: (lastLogin?: string | null) => boolean
  formatTime: (date: string) => string
  onDeleteMessage: (id: string) => void
  onDeleteConversation: (id: string) => void
  messagesEndRef: RefObject<HTMLDivElement | null>
}

function ContactAvatar({
  src,
  alt,
  online,
  size = 44,
}: {
  src: string
  alt: string
  online?: boolean
  size?: number
}) {
  const url = src?.trim()
  const initials = alt
    .split(/\s+/)
    .filter(Boolean)
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()
  return (
    <div className="relative shrink-0">
      {url ? (
        <Image
          src={url}
          alt={alt}
          width={size}
          height={size}
          className="rounded-full object-cover ring-2 ring-background shadow-sm"
        />
      ) : (
        <div
          className="flex items-center justify-center rounded-full bg-slate-200 text-xs font-semibold text-slate-600 ring-2 ring-background"
          style={{ width: size, height: size }}
          aria-hidden
        >
          {initials || "?"}
        </div>
      )}
      {online && (
        <span
          className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-background bg-emerald-500"
          title="Online"
        />
      )}
    </div>
  )
}

function AvatarWrap({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("relative shrink-0", className)}>{children}</div>
}

export function MessagesInbox(props: MessagesInboxProps) {
  const { toast } = useToast()
  const theme = getMessageTheme(props.surface)

  const notifyCallFeatureSoon = () => {
    toast({
      title: "Coming soon",
      description: "This feature will be available soon.",
    })
  }

  const {
    organizerId,
    filteredConversations,
    selectedContact,
    onSelectContact,
    onClearContact,
    messages,
    newMessage,
    onNewMessageChange,
    onSendMessage,
    sending,
    loading,
    chatListSearch,
    onChatListSearchChange,
    connectionSearch,
    onConnectionSearchChange,
    filteredConnections,
    showNewChat,
    onShowNewChatChange,
    onStartNewChat,
    selectedContactInfo,
    isContactOnline,
    isConversationOnline,
    formatTime,
    onDeleteMessage,
    onDeleteConversation,
    messagesEndRef,
    conversations,
  } = props

  return (
    <div
      className={cn(
        "flex h-[min(720px,calc(100vh-12rem))] min-h-[min(560px,calc(100vh-10rem))] overflow-hidden rounded-2xl border",
        theme.shell,
      )}
    >
      <aside
        className={cn(
          "flex w-full shrink-0 flex-col border-r md:w-[min(100%,360px)]",
          theme.sidebar,
          selectedContact && "max-md:hidden",
        )}
      >
        <div className={cn("shrink-0 border-b p-4", theme.panel)}>
          <div className="mb-4 flex items-center justify-between gap-2">
            <div className="flex min-w-0 items-center gap-3">
              <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl", theme.accentIcon)}>
                <MessageCircle className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <h3 className="text-base font-semibold tracking-tight text-foreground">Messages</h3>
                <p className="text-xs text-muted-foreground">
                  {conversations.length} conversation{conversations.length === 1 ? "" : "s"}
                </p>
              </div>
            </div>
            <Dialog open={showNewChat} onOpenChange={onShowNewChatChange}>
              <DialogTrigger asChild>
                <Button size="icon" className={cn("h-9 w-9 shrink-0 rounded-xl", theme.btnPrimary)} aria-label="Start new chat">
                  <Plus className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md sm:rounded-2xl" aria-describedby="start-new-chat-desc">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Start new chat
                  </DialogTitle>
                  <DialogDescription id="start-new-chat-desc">
                    Pick someone from your connections to message.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Search connections…"
                      value={connectionSearch}
                      onChange={(e) => onConnectionSearchChange(e.target.value)}
                      className="h-10 rounded-xl pl-10"
                      aria-label="Search connections"
                    />
                  </div>
                  <ScrollArea className="h-72 pr-2">
                    <div className="space-y-1">
                      {filteredConnections.map((connection) => (
                        <button
                          key={connection.id}
                          type="button"
                          className={cn(
                            "flex w-full items-center gap-3 rounded-xl p-3 text-left transition-colors",
                            theme.hoverRow,
                          )}
                          onClick={() => onStartNewChat(connection)}
                        >
                          <ContactAvatar
                            src={connection.avatar}
                            alt={`${connection.firstName} ${connection.lastName}`}
                            online={connection.isOnline}
                            size={40}
                          />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <p className="truncate text-sm font-medium text-foreground">
                                {connection.firstName} {connection.lastName}
                              </p>
                              <Badge className={cn("text-[10px]", roleBadgeClass(connection.role, props.surface))}>
                                {connection.role}
                              </Badge>
                            </div>
                            <p className="truncate text-xs text-muted-foreground">{connection.company || connection.email}</p>
                          </div>
                        </button>
                      ))}
                      {filteredConnections.length === 0 && (
                        <div className="py-10 text-center text-muted-foreground">
                          <Users className="mx-auto mb-2 h-8 w-8 opacity-40" />
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
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search conversations…"
              value={chatListSearch}
              onChange={(e) => onChatListSearchChange(e.target.value)}
              className="h-10 rounded-xl border-border/80 bg-background/80 pl-10"
              aria-label="Search conversations"
            />
          </div>
        </div>

        <ScrollArea className="min-h-0 flex-1">
          {loading && !selectedContact ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="px-4 py-12 text-center">
              <div className={cn("mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl", theme.accentIcon)}>
                <MessageCircle className="h-7 w-7" />
              </div>
              <p className="text-sm font-medium text-foreground">No conversations yet</p>
              <p className="mt-1 text-xs text-muted-foreground">Start a chat with a connection</p>
              <Button className={cn("mt-4 rounded-xl", theme.btnPrimary)} size="sm" onClick={() => onShowNewChatChange(true)}>
                <Plus className="mr-1.5 h-4 w-4" />
                New message
              </Button>
            </div>
          ) : (
            <div className="space-y-1 p-2">
              {filteredConversations.map((conversation) => {
                const active = selectedContact === conversation.id
                const name = `${conversation.contact?.firstName ?? ""} ${conversation.contact?.lastName ?? ""}`.trim()
                return (
                  <div
                    key={conversation.id}
                    className={cn(
                      "group relative rounded-xl transition-colors",
                      active ? theme.activeConv : theme.hoverRow,
                    )}
                  >
                    <button
                      type="button"
                      className="flex w-full items-start gap-3 p-3 text-left"
                      onClick={() => onSelectContact(conversation.id)}
                    >
                      <ContactAvatar
                        src={conversation.contact?.avatar ?? ""}
                        alt={name || "Contact"}
                        online={isConversationOnline(conversation.contact?.lastLogin)}
                        size={44}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-baseline justify-between gap-2">
                          <p className={cn("truncate text-sm font-semibold", active && theme.accentText)}>
                            {name || "Unknown"}
                          </p>
                          <span className="shrink-0 text-[11px] text-muted-foreground">
                            {formatTime(conversation.lastMessageTime)}
                          </span>
                        </div>
                        <div className="mt-0.5 flex items-center justify-between gap-2">
                          <p className="truncate text-sm text-muted-foreground">
                            {conversation.lastMessage || "No messages yet"}
                          </p>
                          {conversation.unreadCount > 0 && (
                            <span
                              className={cn(
                                "flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full px-1.5 text-[10px] font-semibold text-white",
                                theme.unreadBadge,
                              )}
                            >
                              {conversation.unreadCount > 9 ? "9+" : conversation.unreadCount}
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                    {/* <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-1 top-1 h-7 w-7 opacity-0 transition-opacity group-hover:opacity-100"
                      onClick={(e) => {
                        e.stopPropagation()
                        onDeleteConversation(conversation.id)
                      }}
                      aria-label="Delete conversation"
                    >
                      <X className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
                    </Button> */}
                  </div>
                )
              })}
            </div>
          )}
        </ScrollArea>
      </aside>

      <section
        className={cn(
          "flex min-h-0 min-w-0 flex-1 flex-col",
          !selectedContact && "max-md:hidden",
        )}
      >
        {selectedContact && selectedContactInfo ? (
          <>
            <header className={cn("shrink-0 border-b px-3 py-3 sm:px-4 sm:py-4", theme.panel)}>
              <div className="flex items-center justify-between gap-2">
                <div className="flex min-w-0 items-center gap-2 sm:gap-3">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 shrink-0 rounded-full md:hidden"
                    onClick={onClearContact}
                    aria-label="Back to conversations"
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </Button>
                  <ContactAvatar
                    src={selectedContactInfo.avatar}
                    alt={`${selectedContactInfo.firstName} ${selectedContactInfo.lastName}`}
                    online={isContactOnline}
                    size={44}
                  />
                  <div className="min-w-0">
                    <h4 className="truncate text-base font-semibold text-foreground">
                      {selectedContactInfo.firstName} {selectedContactInfo.lastName}
                    </h4>
                    <div className="mt-0.5 flex flex-wrap items-center gap-2">
                      <Badge className={cn("text-[10px]", roleBadgeClass(selectedContactInfo.role, props.surface))}>
                        {selectedContactInfo.role}
                      </Badge>
                      <span className={cn("text-xs font-medium", isContactOnline ? "text-emerald-600" : "text-muted-foreground")}>
                        {isContactOnline ? "Online" : "Offline"}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-0.5">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="hidden h-9 w-9 rounded-full sm:inline-flex"
                    aria-label="Call"
                    onClick={notifyCallFeatureSoon}
                  >
                    <Phone className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="hidden h-9 w-9 rounded-full sm:inline-flex"
                    aria-label="Video call"
                    onClick={notifyCallFeatureSoon}
                  >
                    <Video className="h-4 w-4" />
                  </Button>
                  {/* <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full" aria-label="More options">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="rounded-xl">
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={() => onDeleteConversation(selectedContact)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete conversation
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu> */}
                </div>
              </div>
            </header>

            <ScrollArea className={cn("min-h-0 flex-1", theme.chatBg)}>
              <div className="space-y-1 px-3 py-4 sm:px-5">
                {loading ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="py-16 text-center">
                    <MessageCircle className="mx-auto mb-3 h-12 w-12 text-muted-foreground/30" />
                    <p className="text-sm font-medium text-foreground">No messages yet</p>
                    <p className="mt-1 text-xs text-muted-foreground">Say hello to start the thread</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    {messages.map((message) => {
                      const isSent = message.senderId === organizerId
                      return (
                        <div
                          key={message.id}
                          className={cn("group flex w-full", isSent ? "justify-end pl-6 sm:pl-12" : "justify-start pr-6 sm:pr-12")}
                        >
                          <div className="relative max-w-[min(100%,20rem)] sm:max-w-md">
                            <div
                              className={cn(
                                "rounded-2xl px-4 py-2.5 shadow-sm",
                                isSent ? cn(theme.sentBubble, "rounded-br-md") : cn(theme.receivedBubble, "rounded-bl-md"),
                              )}
                            >
                              <p className="text-sm leading-relaxed break-words">{message.content}</p>
                              <div
                                className={cn(
                                  "mt-1.5 flex items-center justify-end gap-1",
                                  isSent ? "text-white/75" : "text-muted-foreground",
                                )}
                              >
                                <span className="text-[10px] tabular-nums">{formatTime(message.createdAt)}</span>
                                {isSent &&
                                  (message.isRead ? (
                                    <CheckCheck className="h-3 w-3" aria-label="Read" />
                                  ) : (
                                    <Check className="h-3 w-3" aria-label="Sent" />
                                  ))}
                              </div>
                            </div>
                            {/* {isSent && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="absolute -left-9 top-1/2 h-7 w-7 -translate-y-1/2 opacity-0 transition-opacity group-hover:opacity-100"
                                onClick={() => onDeleteMessage(message.id)}
                                aria-label="Delete message"
                              >
                                <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
                              </Button>
                            )} */}
                          </div>
                        </div>
                      )
                    })}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>
            </ScrollArea>

            <footer className={cn("shrink-0 border-t p-3 sm:p-4", theme.composer)}>
              <form
                className="flex items-center gap-2"
                onSubmit={(e) => {
                  e.preventDefault()
                  onSendMessage()
                }}
              >
                <Input
                  value={newMessage}
                  onChange={(e) => onNewMessageChange(e.target.value)}
                  placeholder="Write a message…"
                  disabled={sending}
                  className="h-11 flex-1 rounded-full border-border/80 bg-muted/40 px-5"
                  aria-label="Message"
                />
                <Button
                  type="submit"
                  disabled={!newMessage.trim() || sending}
                  size="icon"
                  className={cn("h-11 w-11 shrink-0 rounded-full", theme.btnPrimary)}
                  aria-label="Send"
                >
                  {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </Button>
              </form>
            </footer>
          </>
        ) : (
          <div className={cn("flex flex-1 flex-col items-center justify-center px-6", theme.emptyBg)}>
            <div className={cn("mb-5 flex h-16 w-16 items-center justify-center rounded-2xl", theme.accentIcon)}>
              <MessageCircle className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">Your inbox</h3>
            <p className="mt-2 max-w-xs text-center text-sm text-muted-foreground">
              Select a conversation or start a new chat with someone from your network.
            </p>
            <Button className={cn("mt-6 rounded-xl", theme.btnPrimary)} onClick={() => onShowNewChatChange(true)}>
              <Plus className="mr-2 h-4 w-4" />
              New message
            </Button>
          </div>
        )}
      </section>
    </div>
  )
}
