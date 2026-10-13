"use client"

import { useState, useEffect } from "react"
import { apiFetch } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { CalendarDays, Presentation, Users, Building2, Sparkles, Mic } from "lucide-react"

interface Session {
    id: string
    title: string
    status: string
    sessionType: string
    startTime: string
    endTime: string
    event: { title: string }
}

interface Material {
    id: string
    fileName: string
    viewCount: number
    downloadCount: number
}

interface SpeakerProfile {
    fullName: string
    designation: string
    company: string
}

interface Connection {
    id: string
    createdAt?: string
    created_at?: string
}

interface OverviewProps {
    speakerId: string
}

export default function SpeakerOverview({ speakerId }: OverviewProps) {
    const [sessions, setSessions] = useState<Session[]>([])
    const [materials, setMaterials] = useState<Material[]>([])
    const [profile, setProfile] = useState<SpeakerProfile | null>(null)
    const [connections, setConnections] = useState<Connection[]>([])
    const [loading, setLoading] = useState(true)
    const { toast } = useToast()

    useEffect(() => {
        if (speakerId) fetchAllData()
    }, [speakerId])

    const fetchAllData = async () => {
        try {
            setLoading(true)

            // Sessions
            const sessionsRes = await fetch(`/api/events/speakers?speakerId=${speakerId}`)
            const sessionsData = await sessionsRes.json()
            if (sessionsData.success) setSessions(sessionsData.sessions || [])

            // Profile
            try {
                const profileData = await apiFetch<{ success: boolean; profile: SpeakerProfile }>(
                    `/api/speakers/${speakerId}`, { auth: true }
                )
                if (profileData.success && profileData.profile) setProfile(profileData.profile)
            } catch (e) { console.error("Profile fetch error:", e) }

            // Materials
            try {
                const materialsData = await apiFetch<{ sessions?: any[] }>(
                    `/api/speakers/${speakerId}/sessions`, { auth: true }
                )
                if (materialsData.sessions) {
                    setMaterials(materialsData.sessions.flatMap((s: any) => s.materials || []))
                }
            } catch (e) { console.error("Materials fetch error:", e) }

            // Connections
            try {
                const connectionsData = await apiFetch<any>("/api/connections", { auth: true, method: "GET" })
                let arr: Connection[] = []
                if (Array.isArray(connectionsData)) arr = connectionsData
                else if (connectionsData.connections && Array.isArray(connectionsData.connections)) arr = connectionsData.connections
                else if (connectionsData.data && Array.isArray(connectionsData.data)) arr = connectionsData.data
                setConnections(arr)
            } catch (e) {
                console.error("Connections fetch error:", e)
                setConnections([])
            }

        } catch (error) {
            console.error("Error fetching overview data:", error)
            toast({ title: "Unable to load data", description: "Please check your connection and try again.", variant: "destructive" })
        } finally {
            setLoading(false)
        }
    }

    const fmt = (n?: number) => (n ?? 0).toLocaleString()

    const totalSessions = sessions.length
    const completedSessions = sessions.filter(s => ["confirmed", "SCHEDULED", "completed"].includes(s.status)).length
    const upcomingSessions = sessions.filter(s => new Date(s.startTime) > new Date()).length
    const totalPresentations = materials.length
    const totalViews = materials.reduce((sum, m) => sum + (m.viewCount || 0), 0)
    const totalDownloads = materials.reduce((sum, m) => sum + (m.downloadCount || 0), 0)
    const totalConnections = connections.length
    const newThisMonth = connections.filter(c => {
        const d = new Date(c.createdAt || c.created_at || Date.now())
        const ago = new Date(); ago.setMonth(ago.getMonth() - 1)
        return d > ago
    }).length
    const totalEvents = new Set(sessions.map(s => s.event?.title)).size
    const activeEvents = new Set(sessions.filter(s => new Date(s.startTime) > new Date()).map(s => s.event?.title)).size

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
                        style={{ background: "linear-gradient(135deg, #dbeafe, #ede9fe)" }}>
                        <Mic className="w-6 h-6 text-blue-500 animate-pulse" />
                    </div>
                    <p className="text-sm font-medium text-slate-500">Loading dashboard…</p>
                </div>
            </div>
        )
    }

    /* ─────────────────────────────────────────────────────────────────
     * Card colour configs
     * Each card has:
     *   gradTop   – top-left corner gradient colour (the "glow")
     *   gradMid   – soft mid colour
     *   iconBg    – icon circle background
     *   iconColor – icon stroke colour
     *   pillBg / pillText – pill badge colours
     * ───────────────────────────────────────────────────────────────── */
    const cards = [
        {
            label: "Total sessions",
            value: fmt(totalSessions),
            icon: <CalendarDays className="w-5 h-5" style={{ color: "#2563eb" }} />,
            // Blue-sky glow matching reference card exactly
            gradTop: "rgba(186, 218, 255, 0.85)",
            gradMid: "rgba(219, 234, 254, 0.45)",
            glowColor: "rgba(147, 197, 253, 0.6)",
            iconBg: "rgba(219, 234, 254, 0.9)",
            pills: [
                { text: `${fmt(completedSessions)} completed`, bg: "rgba(220,252,231,0.8)", color: "#15803d", border: "rgba(167,243,208,0.5)" },
                { text: `${fmt(upcomingSessions)} upcoming`, bg: "rgba(254,243,199,0.8)", color: "#b45309", border: "rgba(252,211,77,0.4)" },
            ],
        },
        {
            label: "Presentations",
            value: fmt(totalPresentations),
            icon: <Presentation className="w-5 h-5" style={{ color: "#7c3aed" }} />,
            // Violet/purple glow
            gradTop: "rgba(221, 214, 254, 0.85)",
            gradMid: "rgba(237, 233, 254, 0.45)",
            glowColor: "rgba(196, 181, 253, 0.6)",
            iconBg: "rgba(237, 233, 254, 0.9)",
            pills: [
                { text: `${fmt(totalViews)} views`, bg: "rgba(238,242,255,0.8)", color: "#4338ca", border: "rgba(165,180,252,0.4)" },
                { text: `${fmt(totalDownloads)} downloads`, bg: "rgba(238,242,255,0.8)", color: "#4338ca", border: "rgba(165,180,252,0.4)" },
            ],
        },
        {
            label: "Connections",
            value: fmt(totalConnections),
            icon: <Users className="w-5 h-5" style={{ color: "#0891b2" }} />,
            // Cyan/teal glow
            gradTop: "rgba(186, 230, 255, 0.85)",
            gradMid: "rgba(207, 250, 254, 0.45)",
            glowColor: "rgba(125, 211, 252, 0.6)",
            iconBg: "rgba(207, 250, 254, 0.9)",
            pills: newThisMonth > 0
                ? [{ text: `+${fmt(newThisMonth)} this month`, bg: "rgba(220,252,231,0.8)", color: "#15803d", border: "rgba(167,243,208,0.5)" }]
                : [],
        },
        {
            label: "Events",
            value: fmt(totalEvents),
            icon: <Building2 className="w-5 h-5" style={{ color: "#ea580c" }} />,
            // Orange/amber glow
            gradTop: "rgba(254, 215, 170, 0.85)",
            gradMid: "rgba(255, 237, 213, 0.45)",
            glowColor: "rgba(253, 186, 116, 0.6)",
            iconBg: "rgba(255, 237, 213, 0.9)",
            pills: [
                { text: `${fmt(activeEvents)} active`, bg: "rgba(220,252,231,0.8)", color: "#15803d", border: "rgba(167,243,208,0.5)" },
            ],
        },
    ]

    return (
        <div className="min-w-0 space-y-4 sm:space-y-6">

            {/* ── Stat cards ── */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 xl:grid-cols-4">
                {cards.map((card) => (
                    <div
                        key={card.label}
                        className="relative overflow-hidden rounded-[20px] min-w-0"
                        style={{
                            background: "#ffffff",
                            border: "1px solid rgba(226,232,240,0.8)",
                            boxShadow: "0 2px 16px rgba(15,23,42,0.06), 0 1px 3px rgba(15,23,42,0.04)",
                        }}
                    >
                        {/* ── Top gradient band — this is the key visual from the reference card ── */}
                        <div
                            style={{
                                position: "absolute",
                                inset: 0,
                                /* Gradient: strong colour at top-left, fades to white at bottom-right */
                                background: `linear-gradient(160deg, ${card.gradTop} 0%, ${card.gradMid} 38%, #ffffff 68%)`,
                                pointerEvents: "none",
                            }}
                        />

                        {/* ── Soft radial glow in top-left corner (the "bloom") ── */}
                        <div
                            style={{
                                position: "absolute",
                                top: "-24px",
                                left: "-24px",
                                width: "140px",
                                height: "140px",
                                borderRadius: "50%",
                                background: `radial-gradient(circle, ${card.glowColor} 0%, transparent 70%)`,
                                pointerEvents: "none",
                            }}
                        />

                        {/* ── Second softer glow top-right ── */}
                        <div
                            style={{
                                position: "absolute",
                                top: "-10px",
                                right: "-20px",
                                width: "100px",
                                height: "100px",
                                borderRadius: "50%",
                                background: `radial-gradient(circle, ${card.glowColor.replace("0.6", "0.25")} 0%, transparent 70%)`,
                                pointerEvents: "none",
                            }}
                        />

                        {/* ── Card content ── */}
                        <div className="relative z-10 p-5">

                            {/* Icon + label row */}
                            <div className="flex items-start justify-between mb-3">
                                <p
                                    className="text-[11px] font-bold uppercase tracking-[0.1em]"
                                    style={{ color: "rgba(100,116,139,0.9)" }}
                                >
                                    {card.label}
                                </p>
                                <div
                                    className="flex items-center justify-center w-10 h-10 rounded-2xl flex-shrink-0"
                                    style={{ background: card.iconBg, backdropFilter: "blur(4px)" }}
                                >
                                    {card.icon}
                                </div>
                            </div>

                            {/* Big number */}
                            <p
                                className="text-[2.4rem] font-extrabold leading-none tracking-tight"
                                style={{ color: "#0f172a" }}
                            >
                                {card.value}
                            </p>

                            {/* Pills */}
                            {/* {card.pills.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-4">
                                    {card.pills.map((pill) => (
                                        <span
                                            key={pill.text}
                                            className="text-[11px] font-semibold px-3 py-1 rounded-full"
                                            style={{
                                                background: pill.bg,
                                                color: pill.color,
                                                border: `1px solid ${pill.border}`,
                                                backdropFilter: "blur(4px)",
                                            }}
                                        >
                                            {pill.text}
                                        </span>
                                    ))}
                                </div>
                            )} */}

                        </div>

                        {/* ── Bottom progress bar (subtle) — like the reference card bar ── */}
                        <div
                            style={{
                                position: "absolute",
                                bottom: 0,
                                left: 0,
                                right: 0,
                                height: "3px",
                                background: "rgba(226,232,240,0.6)",
                            }}
                        >
                            <div
                                style={{
                                    height: "100%",
                                    width: totalSessions > 0 ? `${Math.min(100, (parseInt(card.value.replace(/,/g, "")) / Math.max(totalSessions, totalPresentations, totalConnections, totalEvents)) * 100)}%` : "30%",
                                    background: `linear-gradient(90deg, ${card.glowColor.replace("0.6", "0.9")}, ${card.gradTop})`,
                                    borderRadius: "0 2px 2px 0",
                                    transition: "width 0.8s ease",
                                }}
                            />
                        </div>

                    </div>
                ))}
            </div>

            {/* ── Recent sessions list ── */}
            {sessions.length > 0 && (
                <div
                    className="rounded-2xl overflow-hidden"
                    style={{
                        background: "rgba(255,255,255,0.80)",
                        border: "1px solid rgba(226,232,240,0.7)",
                        boxShadow: "0 2px 12px rgba(15,23,42,0.04)",
                    }}
                >
                    <div
                        className="px-4 py-3.5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-5"
                        style={{ borderBottom: "1px solid rgba(226,232,240,0.6)" }}
                    >
                        <div className="flex items-center gap-3">
                            <div
                                className="w-8 h-8 rounded-xl flex items-center justify-center"
                                style={{ background: "linear-gradient(135deg, #dbeafe, #ede9fe)" }}
                            >
                                <CalendarDays className="w-4 h-4" style={{ color: "#2563eb" }} />
                            </div>
                            <p className="text-sm font-bold text-slate-800">Recent sessions</p>
                        </div>
                        <span
                            className="text-[11px] font-semibold px-3 py-1 rounded-full"
                            style={{ background: "#f1f5f9", color: "#64748b" }}
                        >
                            {totalSessions} total
                        </span>
                    </div>

                    <div className="divide-y divide-slate-100/70">
                        {sessions.slice(0, 5).map((session) => {
                            const isPast = new Date(session.startTime) < new Date()
                            const isUpcoming = !isPast

                            const statusStyle = session.status === "confirmed" || session.status === "SCHEDULED"
                                ? { bg: "rgba(220,252,231,0.8)", color: "#15803d", border: "rgba(167,243,208,0.5)" }
                                : session.status === "pending"
                                    ? { bg: "rgba(254,243,199,0.8)", color: "#b45309", border: "rgba(252,211,77,0.4)" }
                                    : { bg: "rgba(241,245,249,0.8)", color: "#64748b", border: "rgba(226,232,240,0.6)" }

                            return (
                                <div key={session.id} className="px-4 py-3.5 sm:px-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4 hover:bg-slate-50/50 transition-colors">
                                    <div className="min-w-0 flex-1">
                                        <p className="text-sm font-semibold text-slate-800 break-words">{session.title}</p>
                                        <p className="text-xs text-slate-400 mt-0.5 break-words">{session.event?.title}</p>
                                    </div>
                                    <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
                                        <span className="text-[11px] text-slate-400">
                                            {new Date(session.startTime).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                                        </span>
                                        <span
                                            className="text-[11px] font-semibold px-2.5 py-1 rounded-full capitalize"
                                            style={{ background: statusStyle.bg, color: statusStyle.color, border: `1px solid ${statusStyle.border}` }}
                                        >
                                            {session.status.replace("_", " ").toLowerCase()}
                                        </span>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            )}

            {/* ── Welcome footer ── */}
            <div className="flex items-start gap-2 text-slate-400 text-xs pt-1 break-words">
                <Sparkles className="w-3.5 h-3.5 shrink-0" />
                <span>Welcome back, {profile?.fullName?.split(" ")[0] || "Speaker"}! Your dashboard is ready.</span>
            </div>

        </div>
    )
}