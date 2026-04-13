"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"

interface Speaker {
  id: string
  firstName: string
  lastName: string
  email: string
  avatar: string | null
  company: string | null
  jobTitle: string | null
}

interface Event {
  id: string
  title: string
  startDate: string
  endDate: string
  organizerId: string
}

interface SpeakerSession {
  id: string
  title: string
  description: string | null
  sessionType: string
  duration: number
  startTime: string
  endTime: string
  room: string | null
  abstract: string | null
  learningObjectives: string[]
  targetAudience: string | null
  materials: string[]
  speaker: Speaker
  event: Event
}

export default function SpeakerSessionsTable({
  eventId,
}: {
  eventId: string
}) {
  const [sessions, setSessions] = useState<SpeakerSession[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchSessions() {
      try {
        setLoading(true)
        const res = await fetch(`/api/events/speakers?eventId=${eventId}`)
        const data = await res.json().catch(() => ({ success: false, sessions: [] }))
        if (data.success && Array.isArray(data.sessions)) {
          setSessions(data.sessions)
        } else {
          setSessions([])
        }
      } catch (error) {
        console.error("Failed to fetch sessions:", error)
        setSessions([])
      } finally {
        setLoading(false)
      }
    }

    fetchSessions()
  }, [eventId])

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Speaker Sessions</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-6 w-full" />
            ))}
          </div>
        ) : sessions.length === 0 ? (
          <p className="text-muted-foreground">No speaker sessions found.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Speaker</TableHead>
                <TableHead>Event</TableHead>
                <TableHead>Session Type</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Room</TableHead>
                <TableHead>Start Time</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sessions.map((session) => (
                <TableRow key={session.id}>
                  <TableCell className="font-medium">{session.title}</TableCell>
                  <TableCell>
                    {session.speaker.firstName} {session.speaker.lastName}
                    <br />
                    <span className="text-sm text-muted-foreground">
                      {session.speaker.company} – {session.speaker.jobTitle}
                    </span>
                  </TableCell>
                  <TableCell>{session.event.title}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{session.sessionType}</Badge>
                  </TableCell>
                  <TableCell>{session.duration} min</TableCell>
                  <TableCell>{session.room || "-"}</TableCell>
                  <TableCell>{new Date(session.startTime).toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
