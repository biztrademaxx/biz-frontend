"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Users, UserPlus, UserMinus } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { apiFetch } from "@/lib/api"
import { exGlassCard, exPageTitle } from "./dashboard-theme"

interface FollowUser {
  id: string
  firstName: string
  lastName: string
  email: string
  avatar?: string
  jobTitle?: string
  followedAt: string
}

interface FollowManagementProps {
  userId: string
}

export function FollowManagement({ userId }: FollowManagementProps) {
  const [followers, setFollowers] = useState<FollowUser[]>([])
  const [following, setFollowing] = useState<FollowUser[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ followersCount: 0, followingCount: 0 })
  const { toast } = useToast()

  useEffect(() => {
    fetchFollowData()
  }, [userId])

  const fetchFollowData = async () => {
    if (!userId) return
    try {
      setLoading(true)

      const [followersData, followingData, statsData] = await Promise.all([
        apiFetch<{ success?: boolean; followers?: FollowUser[] }>(`/api/follow/followers/${userId}`, { auth: true }).catch(() => ({ success: false, followers: [] })),
        apiFetch<{ success?: boolean; following?: FollowUser[] }>(`/api/follow/following/${userId}`, { auth: true }).catch(() => ({ success: false, following: [] })),
        apiFetch<{ success?: boolean; stats?: { followersCount: number; followingCount: number } }>(`/api/follow/stats/${userId}`, { auth: true }).catch(() => ({ success: false, stats: { followersCount: 0, followingCount: 0 } })),
      ])

      if (followersData?.success && Array.isArray(followersData.followers)) setFollowers(followersData.followers)
      if (followingData?.success && Array.isArray(followingData.following)) setFollowing(followingData.following)
      if (statsData?.success && statsData.stats) setStats(statsData.stats)
    } catch (error) {
      console.error("Error fetching follow data:", error)
      toast({
        title: "Error",
        description: "Failed to load follow data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleUnfollow = async (targetUserId: string) => {
    try {
      await apiFetch(`/api/follow/${targetUserId}`, {
        method: "DELETE",
        auth: true,
      })
      toast({
        title: "Success",
        description: "Unfollowed successfully",
      })
      fetchFollowData()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to unfollow user",
        variant: "destructive",
      })
    }
  }

  const handleRemoveFollower = async (_followerUserId: string) => {
    toast({
      title: "Not available",
      description: "Remove follower is not supported yet.",
      variant: "destructive",
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-[#004A96]" />
      </div>
    )
  }

  return (
    <div className="min-w-0 space-y-6">
      <div>
        <h1 className={exPageTitle}>Follow Management</h1>
        <p className="text-slate-600">Manage your followers and following</p>
      </div>

      {/* Stats Cards */}
      {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Followers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.followersCount}</div>
            <p className="text-xs text-muted-foreground">People following you</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Following</CardTitle>
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.followingCount}</div>
            <p className="text-xs text-muted-foreground">People you follow</p>
          </CardContent>
        </Card>
      </div> */}

      {/* Tabs for Followers and Following */}
      <Tabs defaultValue="followers" className="w-full">
        {/* <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="followers">Followers ({followers.length})</TabsTrigger>
          <TabsTrigger value="following">Following ({following.length})</TabsTrigger>
        </TabsList> */}

        <TabsContent value="followers" className="space-y-4">
          <Card className={exGlassCard}>
            <CardHeader>
              <CardTitle>Your Followers</CardTitle>
            </CardHeader>
            <CardContent>
              {followers.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No followers yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {followers.map((follower) => (
                    <div
                      key={follower.id}
                      className="flex flex-col gap-3 rounded-xl border border-white/60 bg-white/35 p-4 backdrop-blur-sm transition-colors hover:bg-white/50 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="flex items-center space-x-4 min-w-0">
                        <Avatar className="h-12 w-12 shrink-0">
                          <AvatarImage src={follower.avatar } />
                          <AvatarFallback>
                            {follower.firstName[0]}
                            {follower.lastName[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <h3 className="font-semibold break-words">
                            {follower.firstName} {follower.lastName}
                          </h3>
                          <p className="text-sm text-gray-600 break-all">{follower.jobTitle || follower.email}</p>
                          <p className="text-xs text-gray-400">
                            Following since {new Date(follower.followedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      {/* <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRemoveFollower(follower.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <UserMinus className="h-4 w-4 mr-2" />
                        Remove
                      </Button> */}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="following" className="space-y-4">
          <Card className={exGlassCard}>
            <CardHeader>
              <CardTitle>People You Follow</CardTitle>
            </CardHeader>
            <CardContent>
              {following.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <UserPlus className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Not following anyone yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {following.map((user) => (
                    <div
                      key={user.id}
                      className="flex flex-col gap-3 rounded-xl border border-white/60 bg-white/35 p-4 backdrop-blur-sm transition-colors hover:bg-white/50 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="flex items-center space-x-4 min-w-0">
                        <Avatar className="h-12 w-12 shrink-0">
                          <AvatarImage src={user.avatar } />
                          <AvatarFallback>
                            {user.firstName[0]}
                            {user.lastName[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <h3 className="font-semibold break-words">
                            {user.firstName} {user.lastName}
                          </h3>
                          <p className="text-sm text-gray-600 break-all">{user.jobTitle || user.email}</p>
                          <p className="text-xs text-gray-400">
                            Following since {new Date(user.followedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleUnfollow(user.id)}
                        className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 sm:w-auto"
                      >
                        <UserMinus className="h-4 w-4 mr-2" />
                        Unfollow
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
