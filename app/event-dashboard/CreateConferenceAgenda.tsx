"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Plus, Trash2, CheckCircle, XCircle } from "lucide-react"
import { useRouter } from "next/navigation"

type SessionType = "SESSION" | "BREAK" | "KEYNOTE" | "PANEL" | "NETWORKING"

interface Session {
  id: string
  time: string
  type: SessionType
  title: string
  description: string
  speaker: string
}

interface ConferenceAgenda {
  date: string
  day: string
  theme: string
  sessions: Session[]
}

interface CreateConferenceAgendaProps {
  eventId: string
  conferenceId?: string
  initialData?: ConferenceAgenda
  onSuccess?: () => void
}

export function CreateConferenceAgenda({ eventId, conferenceId, initialData, onSuccess }: CreateConferenceAgendaProps) {
  const [agenda, setAgenda] = useState<ConferenceAgenda>(
    initialData || {
      date: "",
      day: "",
      theme: "",
      sessions: [
        {
          id: "1",
          time: "",
          type: "SESSION",
          title: "",
          description: "",
          speaker: "",
        },
      ],
    },
  )
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const router = useRouter()

  const addSession = () => {
    const newSession: Session = {
      id: Date.now().toString(),
      time: "",
      type: "SESSION",
      title: "",
      description: "",
      speaker: "",
    }
    setAgenda((prev) => ({
      ...prev,
      sessions: [...prev.sessions, newSession],
    }))
  }

  const removeSession = (id: string) => {
    setAgenda((prev) => ({
      ...prev,
      sessions: prev.sessions.filter((session) => session.id !== id),
    }))
  }

  const updateSession = (id: string, field: keyof Session, value: string) => {
    setAgenda((prev) => ({
      ...prev,
      sessions: prev.sessions.map((session) => (session.id === id ? { ...session, [field]: value } : session)),
    }))
  }

  const resetForm = () => {
    setAgenda({
      date: "",
      day: "",
      theme: "",
      sessions: [
        {
          id: Date.now().toString(),
          time: "",
          type: "SESSION",
          title: "",
          description: "",
          speaker: "",
        },
      ],
    })
  }

  const handleSave = async () => {
    // Clear any previous messages
    setMessage(null)

    // Validate required fields
    if (!agenda.date || !agenda.day || !agenda.theme) {
      setMessage({
        type: "error",
        text: "Please fill in all day information fields",
      })
      return
    }

    // Validate at least one session with required fields
    const hasValidSession = agenda.sessions.some((session) => session.time && session.title)
    if (!hasValidSession) {
      setMessage({
        type: "error",
        text: "Please add at least one session with time and title",
      })
      return
    }

    setIsLoading(true)

    try {
      const url = conferenceId ? `/api/conferences/${conferenceId}` : "/api/conferences"

      const method = conferenceId ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          eventId,
          date: agenda.date,
          day: agenda.day,
          theme: agenda.theme,
          sessions: agenda.sessions.map(({ id, ...session }) => session),
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to save conference")
      }

      const savedConference = await response.json()

      // Show success message
      setMessage({
        type: "success",
        text: conferenceId ? "Agenda updated successfully!" : "Agenda created successfully!",
      })

      // Reset form only if creating new (not editing)
      if (!conferenceId) {
        resetForm()
      }

      // Call onSuccess callback if provided
      if (onSuccess) {
        onSuccess()
      }

      // Auto-clear success message after 3 seconds
      if (!conferenceId) {
        setTimeout(() => {
          setMessage(null)
        }, 3000)
      }
    } catch (error) {
      console.error("[v0] Error saving conference:", error)
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Failed to save conference agenda",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    router.back()
  }

  return (
    <div className="space-y-6">
      {/* Message Display */}
      {message && (
        <div
          className={`flex items-center gap-2 rounded-lg border p-4 ${
            message.type === "success"
              ? "border-green-200 bg-green-50 text-green-800"
              : "border-red-200 bg-red-50 text-red-800"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle className="h-5 w-5" />
          ) : (
            <XCircle className="h-5 w-5" />
          )}
          <span className="text-sm font-medium">{message.text}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-foreground">{conferenceId ? "Edit" : "Create"} Conference Agenda</h1>
        <div className="flex gap-3">
          <Button variant="outline" onClick={handleCancel} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading ? "Saving..." : conferenceId ? "Update Agenda" : "Save Agenda"}
          </Button>
        </div>
      </div>

      {/* Day Information */}
      <Card>
        <CardContent className="pt-6">
          <h2 className="mb-4 text-base font-medium text-foreground">Day Information</h2>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="text"
                placeholder="e.g., 20 November 2025"
                value={agenda.date}
                onChange={(e) => setAgenda({ ...agenda, date: e.target.value })}
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="day">Day</Label>
              <Input
                id="day"
                type="text"
                placeholder="e.g., Thursday, 20 November 2025"
                value={agenda.day}
                onChange={(e) => setAgenda({ ...agenda, day: e.target.value })}
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="theme">Theme</Label>
              <Input
                id="theme"
                type="text"
                placeholder="e.g., Future-ready Manufacturing"
                value={agenda.theme}
                onChange={(e) => setAgenda({ ...agenda, theme: e.target.value })}
                disabled={isLoading}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sessions */}
      <Card>
        <CardContent className="pt-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-medium text-foreground">Sessions</h2>
            <Button variant="ghost" size="sm" onClick={addSession} disabled={isLoading}>
              <Plus className="mr-2 h-4 w-4" />
              Add Session
            </Button>
          </div>

          <div className="space-y-6">
            {agenda.sessions.map((session, index) => (
              <div key={session.id} className="space-y-4 rounded-lg border border-border p-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-foreground">Session {index + 1}</h3>
                  {agenda.sessions.length > 1 && (
                    <Button variant="ghost" size="icon" onClick={() => removeSession(session.id)} disabled={isLoading}>
                      <Trash2 className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  )}
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor={`time-${session.id}`}>Time</Label>
                    <Input
                      id={`time-${session.id}`}
                      type="text"
                      placeholder="e.g., 09:00 – 09:35"
                      value={session.time}
                      onChange={(e) => updateSession(session.id, "time", e.target.value)}
                      disabled={isLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`type-${session.id}`}>Session Type</Label>
                    <Select
                      value={session.type}
                      onValueChange={(value) => updateSession(session.id, "type", value)}
                      disabled={isLoading}
                    >
                      <SelectTrigger id={`type-${session.id}`}>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="SESSION">Session</SelectItem>
                        <SelectItem value="BREAK">Break</SelectItem>
                        <SelectItem value="KEYNOTE">Keynote</SelectItem>
                        <SelectItem value="PANEL">Panel</SelectItem>
                        <SelectItem value="NETWORKING">Networking</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`title-${session.id}`}>Title</Label>
                  <Input
                    id={`title-${session.id}`}
                    type="text"
                    placeholder="e.g., Registration & Hi Tea"
                    value={session.title}
                    onChange={(e) => updateSession(session.id, "title", e.target.value)}
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`description-${session.id}`}>Description (Optional)</Label>
                  <Textarea
                    id={`description-${session.id}`}
                    placeholder="e.g., Speaker: MD, Maxx Business Media Pvt.Ltd.&#10;&#10;Include speaker information, bullet points, or additional details"
                    value={session.description}
                    onChange={(e) => updateSession(session.id, "description", e.target.value)}
                    rows={4}
                    className="resize-none"
                    disabled={isLoading}
                  />
                  <p className="text-xs text-muted-foreground">
                    Include speaker information, bullet points, or additional details
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`speaker-${session.id}`}>Speaker (Optional)</Label>
                  <Input
                    id={`speaker-${session.id}`}
                    type="text"
                    placeholder="e.g., John Doe, CEO of Company"
                    value={session.speaker}
                    onChange={(e) => updateSession(session.id, "speaker", e.target.value)}
                    disabled={isLoading}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Footer Actions */}
      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={handleCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={isLoading}>
          {isLoading ? "Saving..." : conferenceId ? "Update Agenda" : "Create Agenda"}
        </Button>
      </div>
    </div>
  )
}