"use client"

import { useState, useEffect } from "react"
import { apiFetch } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Search, Users, Briefcase, Calendar, Eye, TrendingUp } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface Follower {
  id: string
  userId: string
  name: string
  email: string
  avatar: string | null
  role: string
  followedAt: string
}

interface Speaker {
  id: string
  name: string
  email: string
  avatar: string | null
  totalFollowers: number
  totalSessions: number
  activeSessions: number
}

interface SpeakerWithFollowers extends Speaker {
  followers: Follower[]
}

export default function SpeakerFollowersPage() {
  const [speakers, setSpeakers] = useState<Speaker[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedSpeaker, setSelectedSpeaker] = useState<SpeakerWithFollowers | null>(null)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [loadingFollowers, setLoadingFollowers] = useState(false)

  // Statistics
  const totalSpeakers = speakers.length
  const totalFollowers = speakers.reduce((sum, speaker) => sum + speaker.totalFollowers, 0)
  const avgFollowersPerSpeaker = totalSpeakers > 0 ? Math.round(totalFollowers / totalSpeakers) : 0
  const topSpeaker =
    speakers.length > 0
      ? speakers.reduce((max, speaker) => (speaker.totalFollowers > max.totalFollowers ? speaker : max), speakers[0])
      : null

  useEffect(() => {
    fetchSpeakers()
  }, [])

  const fetchSpeakers = async () => {
    try {
      setLoading(true)
      const data = await apiFetch<Speaker[]>("/api/admin/speaker/speaker-followers", { auth: true })
      setSpeakers(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error("Error fetching speakers:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchSpeakerFollowers = async (speakerId: string) => {
    try {
      setLoadingFollowers(true)
      const data = await apiFetch<SpeakerWithFollowers>(
        `/api/admin/speaker/speaker-followers/${speakerId}`,
        { auth: true }
      )
      setSelectedSpeaker(data as SpeakerWithFollowers)
      setViewDialogOpen(true)
    } catch (error) {
      console.error("Error fetching speaker followers:", error)
    } finally {
      setLoadingFollowers(false)
    }
  }

  const filteredSpeakers = speakers.filter((speaker) => {
    const query = searchQuery.toLowerCase()
    return (
      speaker.name.toLowerCase().includes(query) ||
      speaker.email.toLowerCase().includes(query) ||
      speaker.id.toLowerCase().includes(query)
    )
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading speakers...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Speaker Followers</h1>
        <p className="text-gray-600 mt-2">Manage and view speaker follower relationships</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Speakers</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{totalSpeakers}</div>
            <p className="text-xs text-gray-500 mt-1">Registered speakers</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Followers</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{totalFollowers}</div>
            <p className="text-xs text-gray-500 mt-1">Across all speakers</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Avg per Speaker</CardTitle>
            <Briefcase className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{avgFollowersPerSpeaker}</div>
            <p className="text-xs text-gray-500 mt-1">Average followers</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Top Speaker</CardTitle>
            <Calendar className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{topSpeaker?.totalFollowers || 0}</div>
            <p className="text-xs text-gray-500 mt-1 truncate">{topSpeaker?.name || "N/A"}</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search by speaker name, email, or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Speakers Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Speakers ({filteredSpeakers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Speaker</TableHead>
                <TableHead>Email</TableHead>
                {/* <TableHead>Total Followers</TableHead> */}
                <TableHead>Sessions</TableHead>
                <TableHead>Active Sessions</TableHead>
                {/* <TableHead>Actions</TableHead> */}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSpeakers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                    No speakers found matching your criteria
                  </TableCell>
                </TableRow>
              ) : (
                filteredSpeakers.map((speaker) => (
                  <TableRow key={speaker.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={speaker.avatar || ""} />
                          <AvatarFallback>{speaker.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium text-gray-900">{speaker.name}</div>
                          <div className="text-sm text-gray-500">ID: {speaker.id.slice(0, 8)}...</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-gray-600">{speaker.email}</span>
                    </TableCell>
                    {/* <TableCell>
                      <Badge variant="secondary" className="font-semibold">
                        {speaker.totalFollowers} Followers
                      </Badge>
                    </TableCell> */}
                    <TableCell>
                      <span className="text-gray-600">{speaker.totalSessions}</span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-green-600 border-green-600">
                        {speaker.activeSessions} Active
                      </Badge>
                    </TableCell>
                    {/* <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => fetchSpeakerFollowers(speaker.id)}
                        disabled={loadingFollowers}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View Followers
                      </Button>
                    </TableCell> */}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* View Followers Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Speaker Followers</DialogTitle>
            <DialogDescription>
              {selectedSpeaker && (
                <>
                  Viewing followers for <strong>{selectedSpeaker.name}</strong>
                </>
              )}
            </DialogDescription>
          </DialogHeader>

          {selectedSpeaker && (
            <div className="space-y-6">
              {/* Speaker Info */}
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={selectedSpeaker.avatar || ""} />
                      <AvatarFallback>{selectedSpeaker.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg text-gray-900">{selectedSpeaker.name}</h3>
                      <p className="text-gray-600">{selectedSpeaker.email}</p>
                      <div className="flex gap-4 mt-2">
                        <span className="text-sm text-gray-500">
                          <strong>{selectedSpeaker.totalFollowers}</strong> Followers
                        </span>
                        <span className="text-sm text-gray-500">
                          <strong>{selectedSpeaker.totalSessions}</strong> Sessions
                        </span>
                        <span className="text-sm text-gray-500">
                          <strong>{selectedSpeaker.activeSessions}</strong> Active
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Followers List */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-4">Followers ({selectedSpeaker.followers.length})</h4>
                {selectedSpeaker.followers.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">No followers yet</div>
                ) : (
                  <div className="space-y-3">
                    {selectedSpeaker.followers.map((follower) => (
                      <Card key={follower.id}>
                        <CardContent className="pt-6">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Avatar>
                                <AvatarImage src={follower.avatar || ""} />
                                <AvatarFallback>{follower.name.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium text-gray-900">{follower.name}</div>
                                <div className="text-sm text-gray-500">{follower.email}</div>
                              </div>
                            </div>
                            <div className="text-right">
                              <Badge variant="outline">{follower.role}</Badge>
                              <div className="text-sm text-gray-500 mt-1">
                                Followed: {new Date(follower.followedAt).toLocaleDateString()}
                              </div>
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
