"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Search, Users, TrendingUp, UserPlus, Mail, Calendar } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { apiFetch } from "@/lib/api"
import { Pagination } from "../shared/components/Pagination"

interface Organizer {
  id: string
  firstName: string
  lastName: string
  email: string
  avatar?: string
  organizationName?: string
  totalFollowers: number
  totalEvents: number
  activeEvents: number
  createdAt: string
}

interface Follower {
  id: string
  firstName: string
  lastName: string
  email: string
  avatar?: string
  role: string
  followedAt: string
}

interface ConnectionDetail {
  organizer: Organizer
  followers: Follower[]
}

interface ConnectionsStats {
  totalOrganizers: number
  totalFollowers: number
  avgFollowersPerOrganizer: number
  topOrganizer: {
    firstName: string | null
    lastName: string | null
    totalFollowers: number
  } | null
}

interface ConnectionsResponse {
  success?: boolean
  data?: Organizer[]
  pagination?: { page: number; limit: number; total: number; totalPages: number }
  stats?: ConnectionsStats
}

const PAGE_SIZE = 15

export default function OrganizerConnectionsPage() {
  const [organizers, setOrganizers] = useState<Organizer[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const [stats, setStats] = useState<ConnectionsStats>({
    totalOrganizers: 0,
    totalFollowers: 0,
    avgFollowersPerOrganizer: 0,
    topOrganizer: null,
  })
  const [selectedOrganizer, setSelectedOrganizer] = useState<ConnectionDetail | null>(null)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [loadingDetails, setLoadingDetails] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      void fetchOrganizers(currentPage, searchTerm)
    }, 250)
    return () => clearTimeout(timer)
  }, [currentPage, searchTerm])

  const fetchOrganizers = async (pageArg?: number, searchArg?: string) => {
    try {
      setLoading(true)
      const page = typeof pageArg === "number" ? pageArg : currentPage
      const query = new URLSearchParams({
        page: String(page),
        limit: String(PAGE_SIZE),
      })
      const trimmedSearch = (searchArg ?? searchTerm ?? "").trim()
      if (trimmedSearch) {
        query.set("search", trimmedSearch)
      }

      const data = await apiFetch<Organizer[] | ConnectionsResponse>(
        `/api/admin/organizers/organizer-connections?${query.toString()}`,
        { auth: true },
      )

      if (Array.isArray(data)) {
        setOrganizers(data)
        setTotalItems(data.length)
        setTotalPages(1)
        return
      }

      const list = data.data ?? []
      setOrganizers(Array.isArray(list) ? list : [])
      const pagination = data.pagination
      setTotalItems(Number(pagination?.total ?? list.length))
      setTotalPages(Math.max(1, Number(pagination?.totalPages ?? 1)))
      if (data.stats) {
        setStats(data.stats)
      }
      if (page > Math.max(1, Number(pagination?.totalPages ?? 1))) {
        setCurrentPage(Math.max(1, Number(pagination?.totalPages ?? 1)))
      }
    } catch (error) {
      console.error("Error fetching organizers:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleViewDetails = async (organizerId: string) => {
    try {
      setLoadingDetails(true)
      setDetailsOpen(true)
      const data = await apiFetch<ConnectionDetail>(
        `/api/admin/organizers/organizer-connections/${organizerId}`,
        { auth: true },
      )
      setSelectedOrganizer(data)
    } catch (error) {
      console.error("Error fetching details:", error)
    } finally {
      setLoadingDetails(false)
    }
  }

  const showFullPageLoader = loading && organizers.length === 0

  if (showFullPageLoader) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading organizer connections...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Organizer Connections</h1>
        <p className="text-gray-600 mt-1">Manage and monitor organizer followers and connections</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Organizers</CardTitle>
            <Users className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalOrganizers}</div>
            <p className="text-xs text-gray-600 mt-1">Active organizers</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Followers</CardTitle>
            <UserPlus className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalFollowers}</div>
            <p className="text-xs text-gray-600 mt-1">All connections</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Avg. Followers</CardTitle>
            <TrendingUp className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgFollowersPerOrganizer}</div>
            <p className="text-xs text-gray-600 mt-1">Per organizer</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Top Organizer</CardTitle>
            <TrendingUp className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.topOrganizer?.totalFollowers || 0}</div>
            <p className="text-xs text-gray-600 mt-1 truncate">
              {stats.topOrganizer
                ? `${stats.topOrganizer.firstName ?? ""} ${stats.topOrganizer.lastName ?? ""}`.trim() || "N/A"
                : "N/A"}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Search Organizers</CardTitle>
          <CardDescription>Find organizers by name, email, or organization</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search by name, email, or organization..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value)
                  setCurrentPage(1)
                }}
                className="pl-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Organizers & Their Followers</CardTitle>
          <CardDescription>
            Showing {organizers.length} of {totalItems} organizers
            {loading ? " — refreshing…" : ""}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className={loading ? "opacity-60 pointer-events-none" : ""}>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Organizer</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Total Followers</TableHead>
                  <TableHead>Events</TableHead>
                  <TableHead>Joined</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {organizers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                      No organizers found
                    </TableCell>
                  </TableRow>
                ) : (
                  organizers.map((organizer) => (
                    <TableRow key={organizer.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={organizer.avatar} />
                            <AvatarFallback>
                              {organizer.firstName?.[0] ?? ""}
                              {organizer.lastName?.[0] ?? ""}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">
                              {organizer.firstName} {organizer.lastName}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{organizer.email}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="font-semibold">
                          {organizer.totalFollowers} followers
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">{organizer.totalEvents}</span>
                        {organizer.activeEvents != null && organizer.activeEvents > 0 && (
                          <span className="text-muted-foreground text-sm ml-1">
                            ({organizer.activeEvents} active)
                          </span>
                        )}
                      </TableCell>
                      <TableCell>{new Date(organizer.createdAt).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          <Pagination page={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
        </CardContent>
      </Card>

      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Organizer Followers</DialogTitle>
            <DialogDescription>Detailed view of followers for this organizer</DialogDescription>
          </DialogHeader>

          {loadingDetails ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : selectedOrganizer ? (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Organizer Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-start gap-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={selectedOrganizer.organizer.avatar} />
                      <AvatarFallback>
                        {selectedOrganizer.organizer.firstName[0]}
                        {selectedOrganizer.organizer.lastName[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Name</p>
                        <p className="font-medium">
                          {selectedOrganizer.organizer.firstName} {selectedOrganizer.organizer.lastName}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Organization</p>
                        <p className="font-medium">{selectedOrganizer.organizer.organizationName || "N/A"}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Email</p>
                        <p className="font-medium">{selectedOrganizer.organizer.email}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Total Followers</p>
                        <p className="font-medium text-blue-600">{selectedOrganizer.organizer.totalFollowers}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>
                    Followers ({selectedOrganizer.followers.length}
                    {selectedOrganizer.organizer.totalFollowers > selectedOrganizer.followers.length
                      ? ` of ${selectedOrganizer.organizer.totalFollowers}`
                      : ""}
                    )
                  </CardTitle>
                  <CardDescription>Recent followers for this organizer</CardDescription>
                </CardHeader>
                <CardContent>
                  {selectedOrganizer.followers.length === 0 ? (
                    <p className="text-center py-8 text-gray-500">No followers yet</p>
                  ) : (
                    <div className="space-y-4">
                      {selectedOrganizer.followers.map((follower) => (
                        <div
                          key={follower.id}
                          className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                        >
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={follower.avatar} />
                              <AvatarFallback>
                                {follower.firstName[0]}
                                {follower.lastName[0]}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">
                                {follower.firstName} {follower.lastName}
                              </div>
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Mail className="h-3 w-3" />
                                {follower.email}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <Badge>{follower.role}</Badge>
                            <div className="text-right">
                              <div className="flex items-center gap-1 text-sm text-gray-600">
                                <Calendar className="h-3 w-3" />
                                Followed on
                              </div>
                              <div className="text-sm font-medium">
                                {new Date(follower.followedAt).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  )
}
