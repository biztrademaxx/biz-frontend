"use client"

import { useState, useEffect } from "react"
import { Search, Users, UserPlus, TrendingUp, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

interface Exhibitor {
  id: string
  name: string
  email: string
  company: string
  avatar: string | null
  totalFollowers: number
  totalEvents: number
  activeEvents: number
  joinedDate: string
}

interface Follower {
  id: string
  name: string
  email: string
  avatar: string | null
  role: string
  followedAt: string
}

interface ExhibitorWithFollowers extends Exhibitor {
  followers: Follower[]
}

export default function ExhibitorFollowersPage() {
  const [exhibitors, setExhibitors] = useState<Exhibitor[]>([])
  const [filteredExhibitors, setFilteredExhibitors] = useState<Exhibitor[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)
  const [selectedExhibitor, setSelectedExhibitor] = useState<ExhibitorWithFollowers | null>(null)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)

  useEffect(() => {
    fetchExhibitors()
  }, [])

  useEffect(() => {
    if (searchQuery) {
      const filtered = exhibitors.filter(
        (exhibitor) =>
          exhibitor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          exhibitor.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          exhibitor.company.toLowerCase().includes(searchQuery.toLowerCase()),
      )
      setFilteredExhibitors(filtered)
    } else {
      setFilteredExhibitors(exhibitors)
    }
  }, [searchQuery, exhibitors])

  const fetchExhibitors = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/admin/exhibitor/exhibitor-followers")
      if (!response.ok) throw new Error("Failed to fetch exhibitors")
      const data = await response.json()
      setExhibitors(data.exhibitors)
      setFilteredExhibitors(data.exhibitors)
    } catch (error) {
      console.error("Error fetching exhibitors:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleViewFollowers = async (exhibitorId: string) => {
    try {
      const response = await fetch(`/api/admin/exhibitor/exhibitor-followers/${exhibitorId}`)
      if (!response.ok) throw new Error("Failed to fetch exhibitor details")
      const data = await response.json()
      setSelectedExhibitor(data)
      setViewDialogOpen(true)
    } catch (error) {
      console.error("Error fetching exhibitor details:", error)
    }
  }

  const totalFollowers = exhibitors.reduce((sum, exhibitor) => sum + exhibitor.totalFollowers, 0)
  const avgFollowers = exhibitors.length > 0 ? (totalFollowers / exhibitors.length).toFixed(1) : 0
  const topExhibitor = exhibitors.reduce(
    (max, exhibitor) => (exhibitor.totalFollowers > (max?.totalFollowers || 0) ? exhibitor : max),
    null as Exhibitor | null,
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-500">Loading exhibitors...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Exhibitor Followers</h1>
        <p className="text-gray-500 mt-1">Manage and monitor exhibitor follower relationships</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Exhibitors</CardTitle>
            <Users className="w-4 h-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{exhibitors.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Followers</CardTitle>
            <UserPlus className="w-4 h-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{totalFollowers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Average Followers</CardTitle>
            <TrendingUp className="w-4 h-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{avgFollowers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Top Exhibitor</CardTitle>
            <TrendingUp className="w-4 h-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-sm font-semibold text-gray-900 truncate">{topExhibitor?.name || "N/A"}</div>
            <p className="text-xs text-gray-500 mt-1">{topExhibitor?.totalFollowers || 0} followers</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Search Exhibitors</CardTitle>
          <CardDescription>Find exhibitors by name, email, or company</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search exhibitors..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Exhibitors Table */}
      <Card>
        <CardHeader>
          <CardTitle>Exhibitors ({filteredExhibitors.length})</CardTitle>
          <CardDescription>All exhibitors with their follower statistics</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Exhibitor</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Total Followers</TableHead>
                <TableHead>Total Events</TableHead>
                <TableHead>Active Events</TableHead>
                <TableHead>Joined Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredExhibitors.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-gray-500 py-8">
                    No exhibitors found
                  </TableCell>
                </TableRow>
              ) : (
                filteredExhibitors.map((exhibitor) => (
                  <TableRow key={exhibitor.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={exhibitor.avatar || ""} />
                          <AvatarFallback>
                            {exhibitor.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium text-gray-900">{exhibitor.name}</div>
                          <div className="text-sm text-gray-500">{exhibitor.email}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{exhibitor.company}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{exhibitor.totalFollowers}</Badge>
                    </TableCell>
                    <TableCell>{exhibitor.totalEvents}</TableCell>
                    <TableCell>{exhibitor.activeEvents}</TableCell>
                    <TableCell>{new Date(exhibitor.joinedDate).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm" onClick={() => handleViewFollowers(exhibitor.id)}>
                        <Eye className="w-4 h-4 mr-2" />
                        View Followers
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* View Followers Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Followers - {selectedExhibitor?.name}</DialogTitle>
            <DialogDescription>
              All users following this exhibitor ({selectedExhibitor?.totalFollowers || 0} total)
            </DialogDescription>
          </DialogHeader>

          {selectedExhibitor && (
            <div className="space-y-6">
              {/* Exhibitor Info */}
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <Avatar className="w-16 h-16">
                      <AvatarImage src={selectedExhibitor.avatar || ""} />
                      <AvatarFallback>
                        {selectedExhibitor.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold text-lg">{selectedExhibitor.name}</h3>
                      <p className="text-sm text-gray-500">{selectedExhibitor.email}</p>
                      <p className="text-sm text-gray-500">{selectedExhibitor.company}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Followers List */}
              <div>
                <h4 className="font-semibold mb-4">Followers</h4>
                {selectedExhibitor.followers.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No followers yet</p>
                ) : (
                  <div className="space-y-3">
                    {selectedExhibitor.followers.map((follower) => (
                      <Card key={follower.id}>
                        <CardContent className="pt-6">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Avatar className="w-10 h-10">
                                <AvatarImage src={follower.avatar || ""} />
                                <AvatarFallback>
                                  {follower.name
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium">{follower.name}</div>
                                <div className="text-sm text-gray-500">{follower.email}</div>
                              </div>
                            </div>
                            <div className="text-right">
                              <Badge variant="outline">{follower.role}</Badge>
                              <p className="text-xs text-gray-500 mt-1">
                                Followed on {new Date(follower.followedAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
