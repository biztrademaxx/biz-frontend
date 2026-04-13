"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Users, Plus, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { apiFetch, getCurrentUserId } from "@/lib/api";
import { avatarUrlFromRecord } from "@/lib/user-avatar-url";

interface SavedEvent {
  _id: string;
  userId: string;
  eventId: string;
  savedAt: string;
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    avatar?: string;
    role?: string;
    company?: string;
    jobTitle?: string;
    location?: string;
    country?: string;
  };
}

interface Connection {
  id: string;
  firstName: string;
  lastName: string;
  jobTitle?: string;
  company?: string;
  avatar?: string;
  status: "connected" | "pending" | "request_received" | "rejected" | "blocked";
  connectionId?: string;
  isOutgoing?: boolean;
}

interface EventFollowersProps {
  eventId: string;
}

export default function EventFollowers({ eventId }: EventFollowersProps) {
  const [followers, setFollowers] = useState<SavedEvent[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [connectingUsers, setConnectingUsers] = useState<Set<string>>(new Set());
  const userId = getCurrentUserId();

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        let followerList: SavedEvent[] = [];
        try {
          const followersData = await apiFetch<{ followers?: SavedEvent[] }>(
            `/api/events/${encodeURIComponent(eventId)}/followers`,
            { auth: false },
          );
          followerList = followersData.followers || [];
        } catch {
          followerList = [];
        }
        setFollowers(followerList);

        if (userId) {
          const [listRes, requestsRes] = await Promise.all([
            apiFetch<{ connections?: Connection[] }>("/api/connections", { auth: true }),
            apiFetch<{ connections?: Connection[] }>("/api/connections/requests", { auth: true }),
          ]);
          const list = listRes.connections || [];
          const requests = requestsRes.connections || [];
          const merged: Connection[] = list.map((c) => ({
            ...c,
            status: c.status as Connection["status"],
            isOutgoing: c.status === "pending",
          }));
          requests.forEach((r) => {
            if (!merged.some((m) => m.id === r.id))
              merged.push({ ...r, status: "request_received" as const, isOutgoing: false });
          });
          setConnections(merged);
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    }

    if (eventId) fetchData();
  }, [eventId, userId]);

  const handleConnect = async (follower: SavedEvent) => {
    if (!userId) {
      alert("Please log in to connect with users");
      return;
    }

    const targetUserId = follower.user?.id || (follower as any).userId;
    if (!targetUserId) return;

    try {
      setConnectingUsers(prev => new Set(prev).add(targetUserId));
      const result = await apiFetch<{ connection?: { id: string; connectionId?: string } }>("/api/connections/request", {
        method: "POST",
        body: { receiverId: targetUserId },
        auth: true,
      });

      const conn = result?.connection;
      setConnections(prev => [...prev, {
        id: targetUserId,
        firstName: follower.user?.firstName || "",
        lastName: follower.user?.lastName || "",
        jobTitle: follower.user?.jobTitle,
        company: follower.user?.company,
        avatar: follower.user?.avatar,
        status: "pending",
        connectionId: conn?.connectionId ?? conn?.id,
        isOutgoing: true,
      }]);
    } catch (err) {
      console.error("Error sending connection request:", err);
      alert(err instanceof Error ? err.message : "Failed to send connection request");
    } finally {
      setConnectingUsers(prev => {
        const newSet = new Set(prev);
        newSet.delete(targetUserId);
        return newSet;
      });
    }
  };

  const handleCancelRequest = async (connectionId: string, targetUserId: string) => {
    if (!userId) return;

    try {
      setConnectingUsers(prev => new Set(prev).add(targetUserId));
      await apiFetch(`/api/connections/${connectionId}`, { method: "DELETE", auth: true });
      setConnections(prev => prev.filter(conn => conn.connectionId !== connectionId && conn.id !== targetUserId));
    } catch (err) {
      console.error("Error canceling connection request:", err);
      alert("Failed to cancel connection request");
    } finally {
      setConnectingUsers(prev => {
        const newSet = new Set(prev);
        newSet.delete(targetUserId);
        return newSet;
      });
    }
  };

  const getConnectionStatus = (userId: string) => {
    const connection = connections.find(conn => conn.id === userId);
    return connection;
  };

  const getInitials = (firstName: string, lastName: string) => {
    const s = `${firstName?.charAt(0) || ""}${lastName?.charAt(0) || ""}`.toUpperCase();
    return s || "?";
  };

  const getLocation = (follower: SavedEvent) => {
    if (follower.user?.location && follower.user?.country) {
      return `${follower.user.location}, ${follower.user.country}`;
    }
    return follower.user?.location || follower.user?.country || "Location not specified";
  };

  if (loading)
    return (
      <Card className="border border-gray-100 rounded-2xl shadow-lg bg-gradient-to-br from-blue-50 to-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-700 text-lg font-semibold">
            <Users className="w-5 h-5" />
            Event Followers
          </CardTitle>
        </CardHeader>
        <CardContent className="py-8 text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-blue-600 border-t-transparent mx-auto mb-3"></div>
          <p className="text-gray-600">Loading followers...</p>
        </CardContent>
      </Card>
    );

  if (error)
    return (
      <Card className="border border-gray-100 rounded-2xl shadow-lg bg-red-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-700 text-lg font-semibold">
            <Users className="w-5 h-5" />
            Event Followers
          </CardTitle>
        </CardHeader>
        <CardContent className="py-8 text-center">
          <p className="text-red-600 mb-3">Failed to load followers.</p>
          <Button variant="outline" onClick={() => window.location.reload()}>
            Retry
          </Button>
        </CardContent>
      </Card>
    );

  return (
    <Card className="border border-gray-100 rounded-2xl shadow-xl bg-gradient-to-br from-white via-gray-50 to-blue-50">
      <CardHeader className="border-b border-gray-100 pb-3">
        <CardTitle className="flex items-center gap-2 text-gray-800 text-lg font-semibold">
          <Users className="w-5 h-5 text-blue-600" />
          Followers ({followers.length})
        </CardTitle>
        <p className="text-sm text-gray-500">Users who have shown interest for this Event</p>
        
        {/* Filter Section */}
        <div className="flex flex-wrap gap-2 mt-3">
          <Badge variant="outline" className="bg-white text-gray-700 border-gray-300">
            All Profiles
          </Badge>
          <Badge variant="outline" className="bg-white text-gray-700 border-gray-300">
            All Countries
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pt-5">
        {followers.length === 0 ? (
          <div className="text-center py-10">
            <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No followers yet</p>
            <p className="text-sm text-gray-400 mt-1">
              Be the first to save this event!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {followers.map((follower, index) => {
              const targetUserId = follower.user?.id || follower.userId;
              const connection = getConnectionStatus(targetUserId);
              const isConnecting = connectingUsers.has(targetUserId);
              const isCurrentUser = userId === targetUserId;
              const userRecord =
                follower.user && typeof follower.user === "object"
                  ? (follower.user as unknown as Record<string, unknown>)
                  : {};
              const avatarSrc = avatarUrlFromRecord(userRecord) ?? follower.user?.avatar ?? undefined;

              // Create a unique key by combining _id with index
              const uniqueKey = `${(follower as any).id ?? follower._id}-${index}-${targetUserId}`;

              return (
                <div
                  key={uniqueKey} // Fixed: Use unique key
                  className="p-5 rounded-xl bg-white border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col"
                >
                  <div className="flex flex-col items-center text-center mb-4">
                    <Avatar className="w-16 h-16 ring-4 ring-blue-100 mb-3">
                      <AvatarImage src={avatarSrc} />
                      <AvatarFallback className="bg-blue-100 text-blue-600 font-semibold">
                        {getInitials(
                          follower.user?.firstName || "",
                          follower.user?.lastName || ""
                        )}
                      </AvatarFallback>
                    </Avatar>

                    <h3 className="font-semibold text-gray-900 text-base mb-1">
                      {follower.user?.firstName} {follower.user?.lastName}
                    </h3>

                    {follower.user?.jobTitle && follower.user?.company && (
                      <p className="text-sm text-gray-700 mb-1">
                        {follower.user.jobTitle} at {follower.user.company}
                      </p>
                    )}

                    {/* <p className="text-sm text-gray-500">
                      {getLocation(follower)}
                    </p> */}
                  </div>

                  {!isCurrentUser && (
                    <div className="mt-auto pt-4 border-t border-gray-100">
                      {connection ? (
                        connection.status === "connected" ? (
                          <Button
                            size="sm"
                            variant="outline"
                            className="w-full text-green-600 border-green-200 bg-green-50 hover:bg-green-100 flex items-center gap-2"
                            disabled
                          >
                            <Check className="w-4 h-4" />
                            Connected
                          </Button>
                        ) : connection.status === "pending" && connection.isOutgoing ? (
                          <Button
                            size="sm"
                            variant="outline"
                            className="w-full text-orange-600 border-orange-200 bg-orange-50 hover:bg-orange-100"
                            onClick={() => connection.connectionId && handleCancelRequest(connection.connectionId, targetUserId)}
                            disabled={isConnecting}
                          >
                            {isConnecting ? "Canceling..." : "Cancel Request"}
                          </Button>
                        ) : connection.status === "request_received" ? (
                          <Button
                            size="sm"
                            variant="outline"
                            className="w-full text-blue-600 border-blue-200 bg-blue-50 hover:bg-blue-100"
                            disabled
                          >
                            Respond to Request
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
                            onClick={() => handleConnect(follower)}
                            disabled={isConnecting || !targetUserId}
                          >
                            {isConnecting ? (
                              <>
                                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                                Connecting...
                              </>
                            ) : (
                              <>
                                <Plus className="w-4 h-4" />
                                Connect
                              </>
                            )}
                          </Button>
                        )
                      ) : (
                        <Button
                          size="sm"
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
                          onClick={() => (userId ? handleConnect(follower) : (window.location.href = "/login"))}
                          disabled={isConnecting || !targetUserId}
                        >
                          {!userId ? (
                            <>
                              <Plus className="w-4 h-4" />
                              Log in to connect
                            </>
                          ) : isConnecting ? (
                            <>
                              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                              Connecting...
                            </>
                          ) : (
                            <>
                              <Plus className="w-4 h-4" />
                              Connect
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Add Profile and View More Section */}
        {/* <div className="mt-8 pt-6 border-t border-gray-100">
          <div className="flex flex-col sm:flex-row gap-3 justify-between items-center">
            <Button 
              variant="outline" 
              className="w-full sm:w-auto border-blue-200 text-blue-600 hover:bg-blue-50 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Profile
            </Button>
            
            <Button 
              variant="ghost" 
              className="w-full sm:w-auto text-gray-600 hover:text-gray-800 hover:bg-gray-100"
            >
              View More
            </Button>
          </div>

          {followers.length > 0 && (
            <div className="mt-6 grid grid-cols-2 gap-4 text-sm text-center">
              <div className="p-3 rounded-lg bg-gray-50">
                <p className="font-semibold text-gray-900">
                  {followers.length}
                </p>
                <p className="text-gray-600">Total Followers</p>
              </div>
              <div className="p-3 rounded-lg bg-gray-50">
                <p className="font-semibold text-gray-900">
                  {new Set(followers.map((f) => f.user?.role)).size}
                </p>
                <p className="text-gray-600">Unique Roles</p>
              </div>
            </div>
          )}
        </div> */}
      </CardContent>
    </Card>
  );
}