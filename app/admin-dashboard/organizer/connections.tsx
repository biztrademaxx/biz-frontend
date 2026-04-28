"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Search, Users, TrendingUp, UserPlus, Eye, Mail, Calendar, Building } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { apiFetch } from "@/lib/api"

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

export default function OrganizerConnectionsPage() {
  const [organizers, setOrganizers] = useState<Organizer[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedOrganizer, setSelectedOrganizer] = useState<ConnectionDetail | null>(null)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [loadingDetails, setLoadingDetails] = useState(false)

  // Fetch organizers
  useEffect(() => {
    fetchOrganizers()
  }, [])

  const fetchOrganizers = async () => {
    try {
      setLoading(true)
      const data = await apiFetch<Organizer[] | { data?: Organizer[] }>(
        "/api/admin/organizers/organizer-connections",
        { auth: true },
      )
      const list = Array.isArray(data) ? data : data.data ?? []
      setOrganizers(list)
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

  const filteredOrganizers = organizers.filter(
    (organizer) =>
      organizer.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      organizer.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      organizer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      organizer.organizationName?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // Calculate statistics
  const stats = {
    totalOrganizers: organizers.length,
    totalFollowers: organizers.reduce((sum, org) => sum + org.totalFollowers, 0),
    avgFollowersPerOrganizer:
      organizers.length > 0
        ? Math.round(organizers.reduce((sum, org) => sum + org.totalFollowers, 0) / organizers.length)
        : 0,
    topOrganizer:
      organizers.length > 0
        ? organizers.reduce((max, org) => (org.totalFollowers > max.totalFollowers ? org : max), organizers[0])
        : null,
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading organizer connections...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Organizer Connections</h1>
        <p className="text-gray-600 mt-1">Manage and monitor organizer followers and connections</p>
      </div>

      {/* Statistics Cards */}
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
              {stats.topOrganizer ? `${stats.topOrganizer.firstName} ${stats.topOrganizer.lastName}` : "N/A"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
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
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Organizers Table */}
      <Card>
        <CardHeader>
          <CardTitle>Organizers & Their Followers</CardTitle>
          <CardDescription>
            Showing {filteredOrganizers.length} of {organizers.length} organizers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Organizer</TableHead>
                {/* <TableHead>Organization</TableHead> */}
                <TableHead>Email</TableHead>
                <TableHead>Total Followers</TableHead>
                <TableHead>Events</TableHead>
                <TableHead>Joined</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrganizers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                    No organizers found
                  </TableCell>
                </TableRow>
              ) : (
                filteredOrganizers.map((organizer) => (
                  <TableRow key={organizer.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={organizer.avatar || "/placeholder.svg"} />
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
                    {/* <TableCell>
                      <div className="flex items-center gap-2">
                        <Building className="h-4 w-4 text-gray-400" />
                        {organizer.organizationName || "N/A"}
                      </div>
                    </TableCell> */}
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
        </CardContent>
      </Card>

      {/* Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Organizer Followers</DialogTitle>
            <DialogDescription>Detailed view of all followers for this organizer</DialogDescription>
          </DialogHeader>

          {loadingDetails ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : selectedOrganizer ? (
            <div className="space-y-6">
              {/* Organizer Info */}
              <Card>
                <CardHeader>
                  <CardTitle>Organizer Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-start gap-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={selectedOrganizer.organizer.avatar || "/placeholder.svg"} />
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

              {/* Followers List */}
              <Card>
                <CardHeader>
                  <CardTitle>Followers ({selectedOrganizer.followers.length})</CardTitle>
                  <CardDescription>All users following this organizer</CardDescription>
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
                              <AvatarImage src={follower.avatar || "/placeholder.svg"} />
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
