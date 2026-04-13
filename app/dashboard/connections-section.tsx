"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { Search, Users, UserPlus, UserCheck, UserX, Send, Inbox } from "lucide-react"
import { apiFetch, getCurrentUserId } from "@/lib/api"

interface Connection {
  id: string
  firstName?: string
  lastName?: string
  jobTitle?: string
  company?: string
  avatar?: string
  mutualConnections?: number
  status: "connected" | "pending" | "request_received"
  connectionId?: string
  createdAt?: string
}

interface ConnectionsSectionProps {
  userId: string
}

function connectionName(c: Connection) {
  return [c.firstName, c.lastName].filter(Boolean).join(" ").trim() || "Unknown"
}

function searchMatch(c: Connection, term: string) {
  if (!term.trim()) return true
  const q = term.toLowerCase()
  const name = connectionName(c).toLowerCase()
  const company = (c.company ?? "").toLowerCase()
  const job = (c.jobTitle ?? "").toLowerCase()
  return name.includes(q) || company.includes(q) || job.includes(q)
}

export function ConnectionsSection({ userId: _userId }: ConnectionsSectionProps) {
  const [connections, setConnections] = useState<Connection[]>([])
  const [connectionRequests, setConnectionRequests] = useState<Connection[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<"connected" | "sent" | "received">("connected")
  const [showFindPeople, setShowFindPeople] = useState(false)
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [searchLoading, setSearchLoading] = useState(false)

  const fetchConnections = async () => {
    try {
      setLoading(true)
      setError(null)
      const [listRes, requestsRes] = await Promise.all([
        apiFetch<{ connections?: any[]; data?: any[] }>("/api/connections", { auth: true }),
        apiFetch<{ connections?: any[]; data?: any[] }>("/api/connections/requests", { auth: true }),
      ])
      setConnections(listRes.connections ?? listRes.data ?? [])
      setConnectionRequests(requestsRes.connections ?? requestsRes.data ?? [])
    } catch (err) {
      console.error("Error fetching connections:", err)
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchConnections()
  }, [])

  const handleConnectionAction = async (
    targetId: string,
    action: "accept" | "reject" | "connect" | "cancel"
  ) => {
    try {
      if (action === "connect") {
        const data = await apiFetch<{ connection?: any }>("/api/connections/request", {
          method: "POST",
          auth: true,
          body: { receiverId: targetId },
        })
        if (data.connection) {
          const conn = data.connection as Connection
          setConnections((prev) => [
            ...prev,
            {
              ...conn,
              connectionId: conn.connectionId ?? conn.id,
              status: "pending" as const,
            },
          ])
          setSearchResults((prev) => prev.filter((u: any) => u.id !== targetId))
        }
      } else {
        const all = [
          ...connections.map((c) => ({ ...c, connectionId: c.connectionId ?? c.id })),
          ...connectionRequests.map((c) => ({ ...c, connectionId: c.connectionId ?? c.id })),
        ]
        const connection = all.find(
          (conn) => conn.connectionId === targetId || conn.id === targetId
        )
        if (!connection) throw new Error("Connection not found")
        const connectionId = connection.connectionId ?? connection.id

        if (action === "accept") {
          await apiFetch(`/api/connections/${connectionId}/accept`, { method: "POST", auth: true })
          setConnectionRequests((prev) =>
            prev.filter((c) => (c.connectionId ?? c.id) !== connectionId)
          )
          fetchConnections()
        } else if (action === "reject") {
          await apiFetch(`/api/connections/${connectionId}/reject`, { method: "POST", auth: true })
          setConnectionRequests((prev) =>
            prev.filter((c) => (c.connectionId ?? c.id) !== connectionId)
          )
        } else if (action === "cancel") {
          await apiFetch(`/api/connections/${connectionId}`, { method: "DELETE", auth: true })
          setConnections((prev) =>
            prev.filter((c) => (c.connectionId ?? c.id) !== connectionId)
          )
        }
      }
    } catch (err) {
      console.error("Connection action error:", err)
      setError(err instanceof Error ? err.message : "Action failed")
    }
  }

  const searchUsers = useCallback(
    async (query: string) => {
      const trimmed = query.trim()
      if (!trimmed) {
        setSearchResults([])
        return
      }
      setSearchLoading(true)
      try {
        const data = await apiFetch<{ users?: any[]; data?: any[] }>(
          `/api/users/search?q=${encodeURIComponent(trimmed)}`,
          { auth: true }
        )
        const list = data.users ?? data.data ?? []
        const currentId = getCurrentUserId()
        const connectedOrPendingIds = new Set([
          ...connections.map((c) => c.id),
          ...connectionRequests.map((c) => c.id),
        ])
        const filtered = list.filter(
          (user: any) => user.id !== currentId && !connectedOrPendingIds.has(user.id)
        )
        setSearchResults(filtered)
      } catch {
        setSearchResults([])
      } finally {
        setSearchLoading(false)
      }
    },
    [connections, connectionRequests]
  )

  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current)
    if (!value.trim()) {
      setSearchResults([])
      return
    }
    searchDebounceRef.current = setTimeout(() => searchUsers(value), 300)
  }

  const connectedList = connections.filter((c) => c.status === "connected")
  const sentList = connections.filter((c) => c.status === "pending")
  const receivedList = connectionRequests

  const getFilteredList = () => {
    const list =
      activeTab === "connected"
        ? connectedList
        : activeTab === "sent"
          ? sentList
          : receivedList
    return list.filter((c) => searchMatch(c, searchTerm))
  }

  const filteredList = getFilteredList()

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-40 rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <p className="text-red-600 mb-4">{error}</p>
        <Button onClick={fetchConnections} variant="outline">
          Try again
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-xl font-semibold text-gray-900">Connections</h2>
        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-56">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by name, company..."
              className="pl-9 h-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFindPeople(!showFindPeople)}
            className="shrink-0"
          >
            <UserPlus className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">{showFindPeople ? "Back" : "Find people"}</span>
          </Button>
        </div>
      </div>

      {showFindPeople ? (
        <Card className="border border-gray-200">
          <CardContent className="p-6">
            <h3 className="font-medium text-gray-900 mb-4">Find people to connect with</h3>
            <div className="relative max-w-md mb-6">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by name, company, or job title..."
                className="pl-9"
                onChange={handleSearchInputChange}
              />
            </div>
            {searchLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <Skeleton className="h-36 rounded-xl" />
                <Skeleton className="h-36 rounded-xl" />
                <Skeleton className="h-36 rounded-xl" />
              </div>
            ) : searchResults.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {searchResults.map((user) => (
                  <Card key={user.id} className="border border-gray-100">
                    <CardContent className="p-4 flex items-center gap-4">
                      <Avatar className="h-12 w-12 shrink-0">
                        <AvatarImage src={user.avatar} />
                        <AvatarFallback>
                          {user.firstName?.[0] ?? ""}{user.lastName?.[0] ?? "?"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-gray-900 truncate">
                          {user.firstName ?? ""} {user.lastName ?? ""}
                        </p>
                        {user.company && (
                          <p className="text-sm text-gray-500 truncate">{user.company}</p>
                        )}
                      </div>
                      <Button
                        size="sm"
                        onClick={() => handleConnectionAction(user.id, "connect")}
                        className="shrink-0"
                      >
                        <UserPlus className="h-4 w-4 mr-1" />
                        Connect
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Users className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                <p>Type to search for people to connect with.</p>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="flex border-b border-gray-200 gap-1">
            <button
              type="button"
              onClick={() => setActiveTab("connected")}
              className={`px-4 py-2.5 text-sm font-medium rounded-t-lg transition-colors ${
                activeTab === "connected"
                  ? "bg-white border border-b-0 border-gray-200 text-blue-600 -mb-px"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              My connections ({connectedList.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("sent")}
              className={`px-4 py-2.5 text-sm font-medium rounded-t-lg transition-colors ${
                activeTab === "sent"
                  ? "bg-white border border-b-0 border-gray-200 text-blue-600 -mb-px"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <Send className="h-4 w-4 inline-block mr-1.5 align-middle" />
              Requests sent ({sentList.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("received")}
              className={`px-4 py-2.5 text-sm font-medium rounded-t-lg transition-colors ${
                activeTab === "received"
                  ? "bg-white border border-b-0 border-gray-200 text-blue-600 -mb-px"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <Inbox className="h-4 w-4 inline-block mr-1.5 align-middle" />
              Requests received ({receivedList.length})
            </button>
          </div>

          <Card className="border border-gray-200 rounded-t-none">
            <CardContent className="p-6">
              {filteredList.length > 0 ? (
                <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredList.map((c) => (
                    <li key={c.connectionId ?? c.id}>
                      <Card className="border border-gray-100 overflow-hidden">
                        <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center gap-4">
                          <Avatar className="h-14 w-14 shrink-0 mx-auto sm:mx-0">
                            <AvatarImage src={c.avatar} />
                            <AvatarFallback className="bg-gray-100 text-gray-600">
                              {connectionName(c)
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                                .slice(0, 2)
                                .toUpperCase() || "?"}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0 flex-1 text-center sm:text-left">
                            <p className="font-medium text-gray-900 truncate">
                              {connectionName(c)}
                            </p>
                            {c.company && (
                              <p className="text-sm text-gray-500 truncate">{c.company}</p>
                            )}
                            {c.jobTitle && (
                              <p className="text-xs text-gray-400 truncate">{c.jobTitle}</p>
                            )}
                          </div>
                          <div className="flex justify-center sm:justify-end gap-2 shrink-0">
                            {activeTab === "connected" && (
                              <span className="inline-flex items-center gap-1 text-sm text-green-600 font-medium">
                                <UserCheck className="h-4 w-4" />
                                Connected
                              </span>
                            )}
                            {activeTab === "sent" && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  handleConnectionAction(c.connectionId ?? c.id, "cancel")
                                }
                              >
                                <UserX className="h-4 w-4 mr-1" />
                                Cancel
                              </Button>
                            )}
                            {activeTab === "received" && (
                              <>
                                <Button
                                  size="sm"
                                  onClick={() =>
                                    handleConnectionAction(c.connectionId ?? c.id, "accept")
                                  }
                                >
                                  <UserCheck className="h-4 w-4 mr-1" />
                                  Accept
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() =>
                                    handleConnectionAction(c.connectionId ?? c.id, "reject")
                                  }
                                >
                                  <UserX className="h-4 w-4 mr-1" />
                                  Reject
                                </Button>
                              </>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <Users className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p className="font-medium text-gray-700">
                    {activeTab === "connected" && (searchTerm ? "No connections match your search." : "No connections yet.")}
                    {activeTab === "sent" && (searchTerm ? "No sent requests match your search." : "No pending requests sent.")}
                    {activeTab === "received" && (searchTerm ? "No received requests match your search." : "No pending requests received.")}
                  </p>
                  {!searchTerm && (
                    <Button
                      variant="outline"
                      className="mt-4"
                      onClick={() => setShowFindPeople(true)}
                    >
                      <UserPlus className="h-4 w-4 mr-2" />
                      Find people to connect
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
