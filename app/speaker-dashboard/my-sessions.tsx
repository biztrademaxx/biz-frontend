"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, MapPin, Users, Video, Mic, Monitor, Coffee, CalendarX } from "lucide-react"

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
        const params = new URLSearchParams({ speakerId })
        const res = await fetch(`/api/events/speakers?${params.toString()}`)
        const data = await res.json()
        if (data.success) setSessions(data.sessions)
      } catch (error) {
        console.error("Failed to fetch sessions:", error)
      } finally {
        setLoading(false)
      }
    }
    if (speakerId) loadSessions()
  }, [speakerId])

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "confirmed":
      case "SCHEDULED":
        return { background: "rgba(209,250,229,0.8)", color: "#15803d", border: "1px solid rgba(167,243,208,0.6)" }
      case "pending":
        return { background: "rgba(254,243,199,0.8)", color: "#b45309", border: "1px solid rgba(252,211,77,0.4)" }
      case "awaiting_approval":
        return { background: "rgba(219,234,254,0.8)", color: "#1d4ed8", border: "1px solid rgba(147,197,253,0.5)" }
      default:
        return { background: "rgba(241,245,249,0.8)", color: "#475569", border: "1px solid rgba(226,232,240,0.6)" }
    }
  }

  const getFormatIcon = (format: string) => {
    switch (format) {
      case "KEYNOTE": case "Keynote": return <Mic className="h-4 w-4" />
      case "WORKSHOP": case "Workshop": return <Monitor className="h-4 w-4" />
      case "PANEL": case "Panel Discussion": return <Users className="h-4 w-4" />
      case "Fireside Chat": return <Coffee className="h-4 w-4" />
      default: return <Video className="h-4 w-4" />
    }
  }

  const getTypeGradient = (format: string) => {
    switch (format) {
      case "KEYNOTE": case "Keynote": return "linear-gradient(135deg, #fef3c7, #fde68a)"
      case "WORKSHOP": case "Workshop": return "linear-gradient(135deg, #dbeafe, #bfdbfe)"
      case "PANEL": case "Panel Discussion": return "linear-gradient(135deg, #d1fae5, #a7f3d0)"
      default: return "linear-gradient(135deg, #ede9fe, #ddd6fe)"
    }
  }

  const getTypeColor = (format: string) => {
    switch (format) {
      case "KEYNOTE": case "Keynote": return "#b45309"
      case "WORKSHOP": case "Workshop": return "#1d4ed8"
      case "PANEL": case "Panel Discussion": return "#15803d"
      default: return "#6d28d9"
    }
  }

  const filteredSessions = sessions.filter((session) => {
    if (filter === "all") return true
    return session.status.toLowerCase() === filter
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-2xl animate-pulse" style={{ background: "linear-gradient(135deg, #dbeafe, #ede9fe)" }} />
          <p className="text-sm text-slate-400 font-medium">Loading sessions…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">My Sessions</h2>
          <p className="text-xs text-slate-400 mt-0.5 font-medium">{sessions.length} session{sessions.length !== 1 ? "s" : ""} scheduled</p>
        </div>
      </div>

      {/* Empty state */}
      {filteredSessions.length === 0 && (
        <div
          className="rounded-2xl p-16 flex flex-col items-center gap-4"
          style={{ background: "rgba(241,245,249,0.5)", border: "2px dashed rgba(203,213,225,0.6)" }}
        >
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #dbeafe, #ede9fe)" }}>
            <CalendarX className="w-7 h-7 text-blue-400" />
          </div>
          <div className="text-center">
            <p className="text-base font-bold text-slate-600">No sessions found</p>
            <p className="text-sm text-slate-400 mt-1">You don't have any sessions assigned yet</p>
          </div>
        </div>
      )}

      {/* Session cards */}
      <div className="grid gap-4">
        {filteredSessions.map((session) => (
          <div
            key={session.id}
            className="rounded-2xl p-6 hover:shadow-md transition-all duration-200 group"
            style={{
              background: "rgba(255,255,255,0.75)",
              border: "1px solid rgba(255,255,255,0.9)",
              boxShadow: "0 2px 12px rgba(99,102,241,0.04)",
            }}
          >
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="space-y-2 flex-1 min-w-0">
                <div className="flex items-center gap-3 flex-wrap">
                  <h3 className="text-base font-bold text-slate-800 leading-tight">{session.title}</h3>
                  <span
                    className="inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider"
                    style={getStatusStyle(session.status)}
                  >
                    {session.status.replace("_", " ")}
                  </span>
                </div>
                <p className="text-sm font-semibold" style={{ color: "#2563eb" }}>{session.event.title}</p>
                {session.description && (
                  <p className="text-sm text-slate-500 leading-relaxed line-clamp-2">{session.description}</p>
                )}
              </div>

              {/* Session type badge */}
              <div
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold flex-shrink-0"
                style={{ background: getTypeGradient(session.sessionType), color: getTypeColor(session.sessionType) }}
              >
                {getFormatIcon(session.sessionType)}
                <span>{session.sessionType}</span>
              </div>
            </div>

            {/* Meta row */}
            <div
              className="flex items-center gap-6 mt-4 pt-4 flex-wrap"
              style={{ borderTop: "1px solid rgba(241,245,249,0.8)" }}
            >
              <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: "rgba(219,234,254,0.6)" }}>
                  <Calendar className="h-3.5 w-3.5 text-blue-500" />
                </div>
                {new Date(session.startTime).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: "rgba(237,233,254,0.6)" }}>
                  <Clock className="h-3.5 w-3.5 text-purple-500" />
                </div>
                {new Date(session.startTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                {" – "}
                {new Date(session.endTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: "rgba(209,250,229,0.6)" }}>
                  <MapPin className="h-3.5 w-3.5 text-emerald-500" />
                </div>
                {session.room || "TBD"}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}