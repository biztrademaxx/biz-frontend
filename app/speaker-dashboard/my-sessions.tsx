"use client"

import { useState } from "react"
import { useEffect } from "react"
import { Calendar, Clock, MapPin, Users, Video, Mic, Monitor, Coffee, CalendarX, Filter } from "lucide-react"

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

  /* ── status ── */
  const getStatusStyle = (status: string) => {
    switch (status) {
      // case "confirmed":
      case "SCHEDULED":
        return { bg: "rgba(209,250,229,0.9)", color: "#15803d", border: "rgba(167,243,208,0.6)", dot: "#22c55e" }
      // case "pending":
      //   return { bg: "rgba(254,243,199,0.9)", color: "#b45309", border: "rgba(252,211,77,0.4)", dot: "#f59e0b" }
      // case "awaiting_approval":
      //   return { bg: "rgba(219,234,254,0.9)", color: "#1d4ed8", border: "rgba(147,197,253,0.5)", dot: "#3b82f6" }
      default:
        return { bg: "rgba(241,245,249,0.9)", color: "#475569", border: "rgba(226,232,240,0.6)", dot: "#94a3b8" }
    }
  }

  /* ── session type ── */
  const typeConfig: Record<string, { icon: React.ReactNode; gradTop: string; gradMid: string; glowColor: string; color: string; iconBg: string }> = {
    KEYNOTE: { icon: <Mic className="w-4 h-4" />, gradTop: "rgba(254,215,170,0.85)", gradMid: "rgba(255,237,213,0.45)", glowColor: "rgba(253,186,116,0.55)", color: "#c2410c", iconBg: "rgba(255,237,213,0.9)" },
    Keynote: { icon: <Mic className="w-4 h-4" />, gradTop: "rgba(254,215,170,0.85)", gradMid: "rgba(255,237,213,0.45)", glowColor: "rgba(253,186,116,0.55)", color: "#c2410c", iconBg: "rgba(255,237,213,0.9)" },
    WORKSHOP: { icon: <Monitor className="w-4 h-4" />, gradTop: "rgba(186,218,255,0.85)", gradMid: "rgba(219,234,254,0.45)", glowColor: "rgba(147,197,253,0.55)", color: "#1d4ed8", iconBg: "rgba(219,234,254,0.9)" },
    Workshop: { icon: <Monitor className="w-4 h-4" />, gradTop: "rgba(186,218,255,0.85)", gradMid: "rgba(219,234,254,0.45)", glowColor: "rgba(147,197,253,0.55)", color: "#1d4ed8", iconBg: "rgba(219,234,254,0.9)" },
    PANEL: { icon: <Users className="w-4 h-4" />, gradTop: "rgba(167,243,208,0.85)", gradMid: "rgba(209,250,229,0.45)", glowColor: "rgba(110,231,183,0.55)", color: "#15803d", iconBg: "rgba(209,250,229,0.9)" },
    "Panel Discussion": { icon: <Users className="w-4 h-4" />, gradTop: "rgba(167,243,208,0.85)", gradMid: "rgba(209,250,229,0.45)", glowColor: "rgba(110,231,183,0.55)", color: "#15803d", iconBg: "rgba(209,250,229,0.9)" },
    "Fireside Chat": { icon: <Coffee className="w-4 h-4" />, gradTop: "rgba(253,186,116,0.85)", gradMid: "rgba(254,215,170,0.45)", glowColor: "rgba(251,146,60,0.45)", color: "#b45309", iconBg: "rgba(254,215,170,0.9)" },
  }
  const defaultType = { icon: <Video className="w-4 h-4" />, gradTop: "rgba(221,214,254,0.85)", gradMid: "rgba(237,233,254,0.45)", glowColor: "rgba(196,181,253,0.55)", color: "#6d28d9", iconBg: "rgba(237,233,254,0.9)" }

  const getType = (t: string) => typeConfig[t] ?? defaultType

  const filters = [
    { key: "all", label: "All" },
    // { key: "confirmed", label: "Confirmed" },
    { key: "scheduled", label: "Scheduled" },
    // { key: "pending", label: "Pending" },
    // { key: "awaiting_approval", label: "Awaiting" },
  ]

  const filteredSessions = sessions.filter((s) =>
    filter === "all" ? true : s.status.toLowerCase() === filter
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-2xl animate-pulse"
            style={{ background: "linear-gradient(135deg, #dbeafe, #ede9fe)" }} />
          <p className="text-sm text-slate-400 font-medium">Loading sessions…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-w-0 space-y-4 sm:space-y-6">

      {/* ── Header ── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">My Sessions</h2>
          <p className="text-xs text-slate-400 mt-0.5 font-medium">
            {sessions.length} session{sessions.length !== 1 ? "s" : ""} scheduled
          </p>
        </div>

        {/* Filter pills */}
        <div className="flex items-center gap-1.5 flex-wrap w-full sm:w-auto">
          <Filter className="w-3.5 h-3.5 text-slate-300" />
          {filters.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className="text-[11px] font-bold px-3 py-1.5 rounded-full transition-all duration-150"
              style={
                filter === f.key
                  ? { background: "linear-gradient(135deg, #2563eb, #7c3aed)", color: "#fff", boxShadow: "0 2px 8px rgba(99,102,241,0.25)" }
                  : { background: "rgba(241,245,249,0.8)", color: "#64748b", border: "1px solid rgba(226,232,240,0.6)" }
              }
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Empty state ── */}
      {filteredSessions.length === 0 && (
        <div
          className="rounded-2xl p-8 sm:p-16 flex flex-col items-center gap-4 min-w-0"
          style={{ background: "rgba(241,245,249,0.5)", border: "2px dashed rgba(203,213,225,0.6)" }}
        >
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #dbeafe, #ede9fe)" }}
          >
            <CalendarX className="w-7 h-7 text-blue-400" />
          </div>
          <div className="text-center">
            <p className="text-base font-bold text-slate-600">No sessions found</p>
            <p className="text-sm text-slate-400 mt-1">You don't have any sessions assigned yet</p>
          </div>
        </div>
      )}

      {/* ── Session cards ── */}
      <div className="grid gap-4">
        {filteredSessions.map((session) => {
          const type = getType(session.sessionType)
          const status = getStatusStyle(session.status)
          const isPast = new Date(session.startTime) < new Date()

          return (
            <div
              key={session.id}
              className="relative overflow-hidden rounded-[20px] transition-all duration-200 hover:-translate-y-0.5"
              style={{
                background: "#ffffff",
                border: "1px solid rgba(226,232,240,0.8)",
                boxShadow: "0 2px 16px rgba(15,23,42,0.06), 0 1px 3px rgba(15,23,42,0.04)",
              }}
            >
              {/* ── Top gradient band (same technique as overview cards) ── */}
              <div style={{
                position: "absolute", inset: 0, pointerEvents: "none",
                background: `linear-gradient(160deg, ${type.gradTop} 0%, ${type.gradMid} 35%, #ffffff 62%)`,
              }} />

              {/* ── Top-left glow bloom ── */}
              <div style={{
                position: "absolute", top: "-20px", left: "-20px",
                width: "120px", height: "120px", borderRadius: "50%", pointerEvents: "none",
                background: `radial-gradient(circle, ${type.glowColor} 0%, transparent 70%)`,
              }} />

              {/* ── Bottom progress bar ── */}
              <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "3px", background: "rgba(226,232,240,0.5)" }}>
                <div style={{
                  height: "100%", width: isPast ? "100%" : "45%",
                  background: `linear-gradient(90deg, ${type.glowColor.replace("0.55", "0.9")}, ${type.gradTop})`,
                  borderRadius: "0 2px 2px 0", transition: "width 0.8s ease",
                }} />
              </div>

              {/* ── Card content ── */}
              <div className="relative z-10 p-4 sm:p-5">

                {/* Top row: title + type badge */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4 mb-3">
                  <div className="flex-1 min-w-0 space-y-1.5">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:flex-wrap sm:gap-2.5">
                      <h3 className="text-base font-extrabold text-slate-800 leading-tight break-words">{session.title}</h3>

                      {/* Status pill */}
                      <span
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide"
                        style={{ background: status.bg, color: status.color, border: `1px solid ${status.border}` }}
                      >
                        <span
                          className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                          style={{ background: status.dot }}
                        />
                        {session.status.replace(/_/g, " ")}
                      </span>
                    </div>

                    {/* Event name */}
                    <p className="text-sm font-semibold break-words" style={{ color: "#2563eb" }}>{session.event.title}</p>

                    {/* Description */}
                    {session.description && (
                      <p className="text-sm text-slate-500 leading-relaxed line-clamp-2 mt-1">{session.description}</p>
                    )}
                  </div>

                  {/* Session type badge */}
                  <div
                    className="flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-bold flex-shrink-0 self-start"
                    style={{ background: type.iconBg, color: type.color, border: `1px solid ${type.glowColor.replace("0.55", "0.3")}` }}
                  >
                    {type.icon}
                    <span>{session.sessionType}</span>
                  </div>
                </div>

                {/* Divider */}
                <div style={{ height: "1px", background: "rgba(226,232,240,0.5)", margin: "0 0 12px" }} />

                {/* Meta row */}
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-5 sm:flex-wrap">
                  <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                    <div
                      className="w-6 h-6 rounded-lg flex items-center justify-center"
                      style={{ background: "rgba(219,234,254,0.6)" }}
                    >
                      <Calendar className="h-3.5 w-3.5 text-blue-500" />
                    </div>
                    {new Date(session.startTime).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                  </div>

                  <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                    <div
                      className="w-6 h-6 rounded-lg flex items-center justify-center"
                      style={{ background: "rgba(237,233,254,0.6)" }}
                    >
                      <Clock className="h-3.5 w-3.5 text-purple-500" />
                    </div>
                    {new Date(session.startTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    {" – "}
                    {new Date(session.endTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    {session.duration ? <span className="text-slate-400 ml-1">({session.duration} min)</span> : null}
                  </div>

                  <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                    <div
                      className="w-6 h-6 rounded-lg flex items-center justify-center"
                      style={{ background: "rgba(209,250,229,0.6)" }}
                    >
                      <MapPin className="h-3.5 w-3.5 text-emerald-500" />
                    </div>
                    {session.room || "TBD"}
                  </div>

                  {session.coSpeakers && session.coSpeakers.length > 0 && (
                    <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                      <div
                        className="w-6 h-6 rounded-lg flex items-center justify-center"
                        style={{ background: "rgba(254,243,199,0.6)" }}
                      >
                        <Users className="h-3.5 w-3.5 text-amber-500" />
                      </div>
                      {session.coSpeakers.map((cs) => cs.name).join(", ")}
                    </div>
                  )}

                  {/* Past indicator */}
                  {isPast && (
                    <span
                      className="sm:ml-auto text-[10px] font-bold px-2.5 py-1 rounded-full self-start"
                      style={{ background: "rgba(241,245,249,0.9)", color: "#94a3b8", border: "1px solid rgba(226,232,240,0.6)" }}
                    >
                      Completed
                    </span>
                  )}
                </div>

              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}