"use client"

import { useState, useEffect } from "react"
import { apiFetch } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { Search, CalendarDays, Presentation, Users, Building2, TrendingUp, Sparkles, Mic } from "lucide-react"

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
    const [searchQuery, setSearchQuery] = useState("")
    const { toast } = useToast()

    useEffect(() => {
        if (speakerId) {
            fetchAllData()
        }
    }, [speakerId])

    const fetchAllData = async () => {
        try {
            setLoading(true)

            // Fetch sessions - using apiFetch (same as MySessions component)
            const sessionsRes = await fetch(`/api/events/speakers?speakerId=${speakerId}`)
            const sessionsData = await sessionsRes.json()
            if (sessionsData.success) {
                setSessions(sessionsData.sessions || [])
            }

            // Fetch profile - using apiFetch (same as MyProfile component)
            try {
                const profileData = await apiFetch<{ success: boolean; profile: SpeakerProfile }>(
                    `/api/speakers/${speakerId}`,
                    { auth: true }
                )
                if (profileData.success && profileData.profile) {
                    setProfile(profileData.profile)
                }
            } catch (error) {
                console.error("Profile fetch error:", error)
                // Don't fail the whole dashboard if profile fails
            }

            // Fetch sessions with materials - using apiFetch (same as PresentationMaterials)
            try {
                const materialsData = await apiFetch<{ sessions?: any[] }>(
                    `/api/speakers/${speakerId}/sessions`,
                    { auth: true }
                )
                if (materialsData.sessions) {
                    const allMaterials = materialsData.sessions.flatMap((s: any) => s.materials || [])
                    setMaterials(allMaterials)
                }
            } catch (error) {
                console.error("Materials fetch error:", error)
            }

            // Fetch connections - using apiFetch with absolute URL
            try {
                const connectionsData = await apiFetch<any>(
                    "/api/connections",
                    { auth: true, method: "GET" }
                )

                let connectionsArray: Connection[] = []
                if (Array.isArray(connectionsData)) {
                    connectionsArray = connectionsData
                } else if (connectionsData.connections && Array.isArray(connectionsData.connections)) {
                    connectionsArray = connectionsData.connections
                } else if (connectionsData.data && Array.isArray(connectionsData.data)) {
                    connectionsArray = connectionsData.data
                }
                setConnections(connectionsArray)
            } catch (error) {
                console.error("Connections fetch error:", error)
                // Don't fail the dashboard - just show 0 connections
                setConnections([])
            }

        } catch (error) {
            console.error("Error fetching overview data:", error)
            toast({
                title: "Unable to load data",
                description: "Please check your connection and try again.",
                variant: "destructive",
            })
        } finally {
            setLoading(false)
        }
    }

    const formatNumber = (num?: number) => {
        if (num === undefined || num === null) return "0"
        return num.toLocaleString()
    }

    // Calculate stats from actual data
    const totalSessions = sessions.length
    const completedSessions = sessions.filter(s => s.status === "confirmed" || s.status === "SCHEDULED" || s.status === "completed").length
    const upcomingSessions = sessions.filter(s => new Date(s.startTime) > new Date()).length

    const totalPresentations = materials.length
    const totalViews = materials.reduce((sum, m) => sum + (m.viewCount || 0), 0)
    const totalDownloads = materials.reduce((sum, m) => sum + (m.downloadCount || 0), 0)

    const totalConnections = connections.length
    const newConnectionsThisMonth = connections.filter(c => {
        const createdAt = new Date(c.createdAt || c.created_at || Date.now())
        const oneMonthAgo = new Date()
        oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1)
        return createdAt > oneMonthAgo
    }).length

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="flex flex-col items-center gap-3">
                    <div className="relative">
                        <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-gradient-to-br from-blue-100 to-indigo-100">
                            <Mic className="w-6 h-6 text-blue-500 animate-pulse" />
                        </div>
                    </div>
                    <p className="text-sm font-medium text-slate-500">Loading dashboard...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            

            {/* Three Main Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                {/* Sessions Card */}
                <div className="relative overflow-hidden rounded-[22px] border border-slate-200 bg-white p-5 shadow-[0_4px_20px_rgba(15,23,42,0.05)]">

                    {/* Main Gradient */}
                    <div className="absolute inset-0 bg-gradient-to-b from-sky-100 via-blue-50 to-white"></div>

                    {/* Gradient Shades */}
                    <div className="absolute -top-10 right-0 h-40 w-40 rounded-full bg-sky-300/30 blur-3xl"></div>

                    <div className="absolute top-10 right-10 h-24 w-24 rounded-full bg-blue-200/40 blur-2xl"></div>

                    <div className="absolute top-0 right-20 h-32 w-32 rounded-full bg-cyan-100/40 blur-3xl"></div>

                    {/* Content */}
                    <div className="relative z-10">

                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-500 uppercase tracking-wide">
                                    Total Sessions
                                </p>

                                <p className="text-4xl font-extrabold text-slate-800 mt-1">
                                    {formatNumber(totalSessions)}
                                </p>
                            </div>

                            <div className="w-12 h-12 rounded-2xl bg-blue-100/80 backdrop-blur-sm flex items-center justify-center">
                                <CalendarDays className="w-6 h-6 text-blue-600" />
                            </div>
                        </div>

                        <div className="flex gap-3 mt-5 text-xs flex-wrap">

                            <span className="text-emerald-600 bg-white/70 backdrop-blur-sm border border-emerald-100 px-3 py-1 rounded-full">
                                {formatNumber(completedSessions)} completed
                            </span>

                            <span className="text-amber-600 bg-white/70 backdrop-blur-sm border border-amber-100 px-3 py-1 rounded-full">
                                {formatNumber(upcomingSessions)} upcoming
                            </span>

                        </div>

                    </div>
                </div>

                {/* Presentations Card */}
                <div className="relative overflow-hidden rounded-[22px] border border-slate-200 bg-white p-5 shadow-[0_4px_20px_rgba(15,23,42,0.05)]">

                    {/* Main Gradient */}
                    <div className="absolute inset-0 bg-gradient-to-b from-emerald-100 via-emerald-50 to-white"></div>

                    {/* Gradient Shades */}
                    <div className="absolute -top-10 right-0 h-40 w-40 rounded-full bg-emerald-300/30 blur-3xl"></div>

                    <div className="absolute top-10 right-10 h-24 w-24 rounded-full bg-teal-200/40 blur-2xl"></div>

                    <div className="absolute top-0 right-20 h-32 w-32 rounded-full bg-green-100/40 blur-3xl"></div>

                    {/* Content */}
                    <div className="relative z-10">

                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-500 uppercase tracking-wide">
                                    Presentations
                                </p>

                                <p className="text-4xl font-extrabold text-slate-800 mt-1">
                                    {formatNumber(totalPresentations)}
                                </p>
                            </div>

                            <div className="w-12 h-12 rounded-2xl bg-emerald-100/80 backdrop-blur-sm flex items-center justify-center">
                                <Presentation className="w-6 h-6 text-emerald-600" />
                            </div>
                        </div>

                        <div className="flex gap-3 mt-5 text-xs flex-wrap">
                            <span className="text-slate-600 bg-white/70 backdrop-blur-sm border border-slate-100 px-3 py-1 rounded-full">
                                {formatNumber(totalViews)} views
                            </span>

                            <span className="text-slate-600 bg-white/70 backdrop-blur-sm border border-slate-100 px-3 py-1 rounded-full">
                                {formatNumber(totalDownloads)} downloads
                            </span>
                        </div>

                    </div>
                </div>

                {/* Connections Card */}
                <div className="relative overflow-hidden rounded-[22px] border border-slate-200 bg-white p-5 shadow-[0_4px_20px_rgba(15,23,42,0.05)]">

                    {/* Main Gradient */}
                    <div className="absolute inset-0 bg-gradient-to-b from-sky-100 via-blue-50 to-white"></div>

                    {/* Soft Gradient Shades */}
                    <div className="absolute -top-10 right-0 h-40 w-40 rounded-full bg-sky-300/30 blur-3xl"></div>

                    <div className="absolute top-10 right-10 h-24 w-24 rounded-full bg-blue-200/40 blur-2xl"></div>

                    <div className="absolute top-0 right-20 h-32 w-32 rounded-full bg-cyan-100/40 blur-3xl"></div>

                    {/* Content */}
                    <div className="relative z-10">

                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-[0.12em]">
                                    Connections
                                </p>

                                <p className="text-4xl font-extrabold text-slate-900 mt-2 leading-none">
                                    {formatNumber(totalConnections)}
                                </p>
                            </div>

                            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-purple-100/80 backdrop-blur-sm">
                                <Users className="w-5 h-5 text-purple-600" />
                            </div>
                        </div>

                        {newConnectionsThisMonth > 0 && (
                            <div className="mt-5 inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-600">
                                +{formatNumber(newConnectionsThisMonth)} this month
                            </div>
                        )}

                    </div>
                </div>
            </div>

            {/* Events Card Only */}
            <div className="grid grid-cols-1 gap-5">
                <div className="rounded-2xl p-5 bg-white/70 backdrop-blur-sm border border-slate-100 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-100 to-amber-100 flex items-center justify-center">
                                <Building2 className="w-5 h-5 text-orange-600" />
                            </div>
                            <div>
                                <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">Events</p>
                                <p className="text-2xl font-bold text-slate-800">
                                    {formatNumber(new Set(sessions.map(s => s.event?.title)).size)}
                                </p>
                            </div>
                        </div>
                        <div className="text-right">
                            <span className="text-xs text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                                {formatNumber(new Set(sessions.filter(s => new Date(s.startTime) > new Date()).map(s => s.event?.title)).size)} active
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Welcome Message */}
            <div className="flex items-center gap-2 pt-2 text-slate-400 text-xs">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Welcome back, {profile?.fullName?.split(' ')[0] || 'Speaker'}! Your dashboard is ready</span>
            </div>
        </div>
    )
}