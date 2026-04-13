"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
// import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Calendar, Clock, MapPin, Users, Video, Mic, Monitor, Coffee } from "lucide-react"

interface CoSpeaker {
  id?: string
  name: string
  company?: string
}

interface Session {
  id: string
  title: string
  description: string
  status: string
  sessionType: string
  duration: number
  startTime: string
  endTime: string
  room?: string
  event: { title: string }
  speaker: { firstName: string; lastName: string }
  coSpeakers?: CoSpeaker[]
}

export default function MySessions({ speakerId }: { speakerId: string }) {
  const [filter, setFilter] = useState("all")
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadSessions() {
      try {
        const params = new URLSearchParams({ speakerId }) // ✅ pass speakerId as query param
        const res = await fetch(`/api/events/speakers?${params.toString()}`)
        const data = await res.json()
        if (data.success) {
          setSessions(data.sessions)
        }
      } catch (error) {
        console.error("Failed to fetch sessions:", error)
      } finally {
        setLoading(false)
      }
    }

    if (speakerId) {
      loadSessions()
    }
  }, [speakerId])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
      case "SCHEDULED":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "awaiting_approval":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getFormatIcon = (format: string) => {
    switch (format) {
      case "KEYNOTE":
      case "Keynote":
        return <Mic className="h-4 w-4" />
      case "WORKSHOP":
      case "Workshop":
        return <Monitor className="h-4 w-4" />
      case "PANEL":
      case "Panel Discussion":
        return <Users className="h-4 w-4" />
      case "Fireside Chat":
        return <Coffee className="h-4 w-4" />
      default:
        return <Video className="h-4 w-4" />
    }
  }

  const filteredSessions = sessions.filter((session) => {
    if (filter === "all") return true
    return session.status.toLowerCase() === filter
  })

  if (loading) {
    return <p className="text-gray-600">Loading sessions...</p>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">My Sessions</h2>
        {/* <div className="flex space-x-2">
          <Button variant={filter === "all" ? "default" : "outline"} size="sm" onClick={() => setFilter("all")}>
            All ({sessions.length})
          </Button>
          <Button
            variant={filter === "confirmed" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("confirmed")}
          >
            Confirmed ({sessions.filter((s) => s.status.toLowerCase() === "confirmed").length})
          </Button>
          <Button variant={filter === "pending" ? "default" : "outline"} size="sm" onClick={() => setFilter("pending")}>
            Pending ({sessions.filter((s) => s.status.toLowerCase() === "pending").length})
          </Button>
        </div> */}
      </div>

      <div className="grid gap-6">
        {filteredSessions.map((session) => (
          <Card key={session.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <h3 className="text-xl font-semibold text-gray-900">{session.title}</h3>
                    <Badge className={getStatusColor(session.status)}>
                      {session.status.replace("_", " ").toUpperCase()}
                    </Badge>
                  </div>
                  <p className="text-lg text-blue-600 font-medium">{session.event.title}</p>
                  <p className="text-gray-600">{session.description}</p>
                </div>
                <div className="flex items-center space-x-2 text-gray-500">
                  {getFormatIcon(session.sessionType)}
                  <span className="text-sm font-medium">{session.sessionType}</span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center space-x-2 text-gray-600">
                  <Calendar className="h-4 w-4" />
                  <span>{new Date(session.startTime).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-600">
                  <Clock className="h-4 w-4" />
                  <span>
                    {new Date(session.startTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} -{" "}
                    {new Date(session.endTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
                <div className="flex items-center space-x-2 text-gray-600">
                  <MapPin className="h-4 w-4" />
                  <span>{session.room || "TBD"}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
