"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { apiFetch } from "@/lib/api"
import { Progress } from "@/components/ui/progress"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import {
  Upload, FileText, Video, ImageIcon, Download, Trash2, Eye,
  AlertCircle, Calendar, Youtube, Plus, X, Loader2,
} from "lucide-react"

interface Material {
  id: string; fileName: string; fileUrl: string; fileSize: number
  fileType: string; mimeType: string; status: string; allowDownload: boolean
  uploadedAt: string; downloadCount: number; viewCount: number
}

interface SessionWithMaterials {
  id: string; title: string; deadline: string; startTime: string
  room: string | null; youtube: string[]
  event: { id: string; name: string }
  materials: Material[]
}

interface PresentationMaterialsProps { speakerId: string }

export function PresentationMaterials({ speakerId }: PresentationMaterialsProps) {
  const [dragActive, setDragActive] = useState(false)
  const [sessions, setSessions] = useState<SessionWithMaterials[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [youtubeInput, setYoutubeInput] = useState<{ [sessionId: string]: string }>({})
  const [addingYoutube, setAddingYoutube] = useState<string | null>(null)

  useEffect(() => { fetchSessions() }, [speakerId])

  const fetchSessions = async () => {
    if (!speakerId) return
    try {
      setLoading(true); setError(null)
      const data = await apiFetch<{ success?: boolean; sessions?: SessionWithMaterials[] }>(`/api/speakers/${speakerId}/sessions`, { auth: true })
      setSessions(Array.isArray(data?.sessions) ? data.sessions : [])
    } catch (err) { setError(err instanceof Error ? err.message : "Failed to load sessions"); setSessions([]) }
    finally { setLoading(false) }
  }

  const handleFileUpload = async (files: FileList, sessionId: string) => {
    if (!files || files.length === 0) return
    setUploading(true); setUploadProgress(0)
    try {
      for (let i = 0; i < files.length; i++) {
        const formData = new FormData()
        formData.append("file", files[i]); formData.append("sessionId", sessionId); formData.append("speakerId", speakerId)
        await apiFetch<{ material?: Material }>("/api/materials", { method: "POST", body: formData, auth: true })
        setUploadProgress(((i + 1) / files.length) * 100)
      }
      await fetchSessions()
    } catch (err) { setError(err instanceof Error ? err.message : "Upload failed") }
    finally { setUploading(false); setUploadProgress(0) }
  }

  const handleToggleDownload = async (materialId: string, currentValue: boolean) => {
    try {
      await apiFetch(`/api/materials/${materialId}`, { method: "PATCH", body: { allowDownload: !currentValue }, auth: true })
      setSessions((prev) => prev.map((s) => ({ ...s, materials: s.materials.map((m) => m.id === materialId ? { ...m, allowDownload: !currentValue } : m) })))
    } catch (err) { setError(err instanceof Error ? err.message : "Failed to update") }
  }

  const handleDownload = async (materialId: string, fileName: string) => {
    try {
      const data = await apiFetch<{ fileUrl?: string }>(`/api/materials/${materialId}/download`, { auth: true })
      if (data?.fileUrl) window.open(data.fileUrl, "_blank"); else setError("Download failed")
    } catch (err) { setError(err instanceof Error ? err.message : "Download failed") }
  }

  const handleDelete = async (materialId: string) => {
    if (!confirm("Are you sure you want to delete this file?")) return
    try {
      await apiFetch(`/api/materials/${materialId}`, { method: "DELETE", auth: true })
      setSessions((prev) => prev.map((s) => ({ ...s, materials: s.materials.filter((m) => m.id !== materialId) })))
    } catch (err) { setError(err instanceof Error ? err.message : "Failed to delete") }
  }

  const handleView = async (materialId: string, fileUrl: string) => {
    try { await apiFetch(`/api/materials/${materialId}/view`, { method: "POST", auth: true }) } catch (err) { console.error("Failed to track view:", err) }
    window.open(fileUrl, "_blank")
  }

  const getFileIcon = (type: string) => {
    const base = "w-9 h-9 p-2 rounded-xl"
    switch (type) {
      case "presentation": return <div className={base} style={{ background: "rgba(254,243,199,0.8)" }}><FileText className="w-5 h-5 text-amber-500" /></div>
      case "video": return <div className={base} style={{ background: "rgba(237,233,254,0.8)" }}><Video className="w-5 h-5 text-purple-500" /></div>
      case "document": return <div className={base} style={{ background: "rgba(219,234,254,0.8)" }}><FileText className="w-5 h-5 text-blue-500" /></div>
      case "image": return <div className={base} style={{ background: "rgba(209,250,229,0.8)" }}><ImageIcon className="w-5 h-5 text-emerald-500" /></div>
      default: return <div className={base} style={{ background: "rgba(241,245,249,0.8)" }}><FileText className="w-5 h-5 text-slate-400" /></div>
    }
  }

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "final": return { background: "rgba(209,250,229,0.8)", color: "#15803d" }
      case "draft": return { background: "rgba(254,243,199,0.8)", color: "#b45309" }
      default: return { background: "rgba(241,245,249,0.8)", color: "#475569" }
    }
  }

  const getDaysUntilDeadline = (deadline: string) => {
    return Math.ceil((new Date(deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 B"
    const k = 1024, sizes = ["B", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${Math.round(bytes / Math.pow(k, i) * 100) / 100} ${sizes[i]}`
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation()
    setDragActive(e.type === "dragenter" || e.type === "dragover")
  }

  const handleDrop = (e: React.DragEvent, sessionId?: string) => {
    e.preventDefault(); e.stopPropagation(); setDragActive(false)
    if (e.dataTransfer.files?.length && sessionId) handleFileUpload(e.dataTransfer.files, sessionId)
  }

  const getYoutubeVideoId = (url: string) => {
    const patterns = [/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/, /youtube\.com\/watch\?.*v=([^&\n?#]+)/]
    for (const p of patterns) { const m = url.match(p); if (m?.[1]) return m[1] }
    return null
  }

  const handleAddYoutubeLink = async (sessionId: string) => {
    const url = youtubeInput[sessionId]?.trim(); if (!url) return
    setAddingYoutube(sessionId)
    try {
      const session = sessions.find((s) => s.id === sessionId); if (!session) throw new Error("Session not found")
      const updatedLinks = [...(session.youtube || []), url]
      const data = await apiFetch<{ session?: { youtube?: string[] } }>(`/api/sessions/${sessionId}`, { method: "PATCH", body: { youtube: updatedLinks }, auth: true })
      setSessions((prev) => prev.map((s) => s.id === sessionId ? { ...s, youtube: data?.session?.youtube ?? updatedLinks } : s))
      setYoutubeInput((prev) => ({ ...prev, [sessionId]: "" })); setError(null)
    } catch (err) { setError(err instanceof Error ? err.message : "Failed to add YouTube link") }
    finally { setAddingYoutube(null) }
  }

  const handleRemoveYoutubeLink = async (sessionId: string, urlToRemove: string) => {
    try {
      const session = sessions.find((s) => s.id === sessionId); if (!session) throw new Error("Session not found")
      const updatedLinks = session.youtube.filter((u) => u !== urlToRemove)
      const data = await apiFetch<{ session?: { youtube?: string[] } }>(`/api/sessions/${sessionId}`, { method: "PATCH", body: { youtube: updatedLinks }, auth: true })
      setSessions((prev) => prev.map((s) => s.id === sessionId ? { ...s, youtube: data?.session?.youtube ?? updatedLinks } : s))
    } catch (err) { setError(err instanceof Error ? err.message : "Failed to remove YouTube link") }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
          <p className="text-sm text-slate-400 font-medium">Loading sessions…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">Presentation Materials</h2>
        <p className="text-xs text-slate-400 mt-0.5 font-medium">Upload and manage your session files and videos</p>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-3 p-4 rounded-2xl text-sm" style={{ background: "rgba(254,226,226,0.6)", border: "1px solid rgba(252,165,165,0.4)", color: "#dc2626" }}>
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {/* Upload progress */}
      {uploading && (
        <div className="p-5 rounded-2xl space-y-3" style={{ background: "rgba(219,234,254,0.4)", border: "1px solid rgba(147,197,253,0.4)" }}>
          <div className="flex items-center justify-between text-xs font-semibold text-blue-700">
            <span>Uploading files…</span>
            <span>{Math.round(uploadProgress)}%</span>
          </div>
          <Progress value={uploadProgress} className="h-1.5" />
        </div>
      )}

      {/* Empty state */}
      {sessions.length === 0 && (
        <div className="rounded-2xl p-16 flex flex-col items-center gap-4" style={{ background: "rgba(241,245,249,0.5)", border: "2px dashed rgba(203,213,225,0.6)" }}>
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #dbeafe, #ede9fe)" }}>
            <Calendar className="w-7 h-7 text-blue-400" />
          </div>
          <div className="text-center">
            <p className="text-base font-bold text-slate-600">No sessions found</p>
            <p className="text-sm text-slate-400 mt-1">You don't have any sessions assigned yet</p>
          </div>
        </div>
      )}

      {/* Session cards */}
      <div className="space-y-5">
        {sessions.map((session) => {
          const daysLeft = getDaysUntilDeadline(session.deadline)
          return (
            <div
              key={session.id}
              className="rounded-2xl overflow-hidden"
              style={{ background: "rgba(255,255,255,0.75)", border: "1px solid rgba(255,255,255,0.9)", boxShadow: "0 2px 12px rgba(99,102,241,0.04)" }}
            >
              {/* Session header */}
              <div className="p-5" style={{ borderBottom: "1px solid rgba(241,245,249,0.8)", background: "linear-gradient(135deg, rgba(219,234,254,0.2), rgba(237,233,254,0.2))" }}>
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div>
                    <h3 className="text-base font-bold text-slate-800">{session.title}</h3>
                    <p className="text-sm font-semibold mt-0.5" style={{ color: "#2563eb" }}>{session.event.name}</p>
                    {session.room && <p className="text-xs text-slate-400 mt-0.5">Room: {session.room}</p>}
                  </div>
                  <div className="text-right space-y-1">
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium justify-end">
                      <Calendar className="w-3.5 h-3.5" />
                      Deadline: {new Date(session.deadline).toLocaleDateString()}
                    </div>
                    {daysLeft <= 7 && daysLeft > 0 && (
                      <div className="flex items-center gap-1 justify-end">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg" style={{ background: "rgba(254,243,199,0.8)", color: "#b45309" }}>
                          {daysLeft} days left
                        </span>
                      </div>
                    )}
                    {daysLeft <= 0 && (
                      <div className="flex items-center gap-1 justify-end">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg" style={{ background: "rgba(254,226,226,0.8)", color: "#dc2626" }}>
                          Deadline passed
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-5 space-y-5">
                {/* Materials list */}
                {session.materials.length > 0 ? (
                  <div className="space-y-2">
                    {session.materials.map((file) => (
                      <div
                        key={file.id}
                        className="flex items-center justify-between p-4 rounded-2xl gap-4 flex-wrap"
                        style={{ background: "rgba(248,250,252,0.8)", border: "1px solid rgba(226,232,240,0.4)" }}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {getFileIcon(file.fileType)}
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-slate-700 truncate">{file.fileName}</p>
                            <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                              <span className="text-[10px] text-slate-400">{formatFileSize(file.fileSize)}</span>
                              <span className="text-[10px] text-slate-400">{new Date(file.uploadedAt).toLocaleDateString()}</span>
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg capitalize" style={getStatusStyle(file.status)}>{file.status}</span>
                              <span className="text-[10px] text-slate-400">{file.downloadCount} downloads · {file.viewCount} views</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <div className="flex items-center gap-1.5">
                            <Label htmlFor={`dl-${file.id}`} className="text-[10px] font-semibold text-slate-500">Allow DL</Label>
                            <Switch id={`dl-${file.id}`} checked={file.allowDownload} onCheckedChange={() => handleToggleDownload(file.id, file.allowDownload)} />
                          </div>
                          <button onClick={() => handleView(file.id, file.fileUrl)} className="p-2 rounded-xl hover:bg-blue-50 text-slate-400 hover:text-blue-500 transition-colors">
                            <Eye className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDownload(file.id, file.fileName)} disabled={!file.allowDownload} className="p-2 rounded-xl hover:bg-blue-50 text-slate-400 hover:text-blue-500 transition-colors disabled:opacity-30">
                            <Download className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDelete(file.id)} className="p-2 rounded-xl hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-slate-400">
                    <Upload className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    <p className="text-sm">No materials uploaded yet</p>
                  </div>
                )}

                {/* YouTube Section */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "rgba(254,226,226,0.6)" }}>
                      <Youtube className="w-4 h-4 text-red-500" />
                    </div>
                    <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider">YouTube Videos</h4>
                  </div>
                  {session.youtube?.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {session.youtube.map((url, index) => {
                        const videoId = getYoutubeVideoId(url)
                        return (
                          <div key={index} className="relative group rounded-xl overflow-hidden">
                            {videoId ? (
                              <>
                                <iframe className="w-full aspect-video rounded-xl" src={`https://www.youtube.com/embed/${videoId}`} title={`YouTube video ${index + 1}`} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
                                <button onClick={() => handleRemoveYoutubeLink(session.id, url)} className="absolute top-2 right-2 w-7 h-7 rounded-lg flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all" style={{ background: "rgba(220,38,38,0.9)" }}>
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </>
                            ) : (
                              <div className="flex items-center justify-between p-3 rounded-xl" style={{ background: "rgba(248,250,252,0.8)", border: "1px solid rgba(226,232,240,0.4)" }}>
                                <a href={url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline truncate flex-1">{url}</a>
                                <button onClick={() => handleRemoveYoutubeLink(session.id, url)} className="p-1 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition ml-2">
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )}
                  <div className="flex gap-2">
                    <Input
                      type="url"
                      placeholder="Paste YouTube URL (e.g. https://youtube.com/watch?v=…)"
                      value={youtubeInput[session.id] || ""}
                      onChange={(e) => setYoutubeInput((prev) => ({ ...prev, [session.id]: e.target.value }))}
                      onKeyDown={(e) => { if (e.key === "Enter") handleAddYoutubeLink(session.id) }}
                      className="flex-1 rounded-xl border-slate-200/60 bg-slate-50/60 text-sm"
                    />
                    <button
                      onClick={() => handleAddYoutubeLink(session.id)}
                      disabled={!youtubeInput[session.id]?.trim() || addingYoutube === session.id}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white disabled:opacity-50 transition-all"
                      style={{ background: "linear-gradient(135deg, #2563eb, #7c3aed)" }}
                    >
                      {addingYoutube === session.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <><Plus className="w-3.5 h-3.5" /> Add</>}
                    </button>
                  </div>
                </div>

                {/* Drop zone */}
                <div
                  className="rounded-2xl p-6 text-center transition-all duration-200 cursor-pointer"
                  style={{
                    border: `2px dashed ${dragActive ? "#2563eb" : "rgba(203,213,225,0.6)"}`,
                    background: dragActive ? "rgba(219,234,254,0.3)" : "rgba(248,250,252,0.5)",
                  }}
                  onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag}
                  onDrop={(e) => handleDrop(e, session.id)}
                >
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-2" style={{ background: dragActive ? "rgba(219,234,254,0.8)" : "rgba(241,245,249,0.8)" }}>
                    <Upload className="w-5 h-5 text-slate-400" />
                  </div>
                  <p className="text-xs text-slate-500 mb-3">Drag & drop files here, or</p>
                  <input type="file" id={`file-upload-${session.id}`} className="hidden" multiple onChange={(e) => { if (e.target.files) handleFileUpload(e.target.files, session.id) }} accept=".ppt,.pptx,.pdf,.mp4,.mov,.doc,.docx,.jpg,.jpeg,.png" />
                  <button
                    onClick={() => document.getElementById(`file-upload-${session.id}`)?.click()}
                    disabled={uploading}
                    className="px-5 py-2 rounded-xl text-xs font-semibold text-white disabled:opacity-50 transition-all"
                    style={{ background: "linear-gradient(135deg, #2563eb, #7c3aed)" }}
                  >
                    {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin inline mr-1" /> : null}
                    Choose Files
                  </button>
                </div>

                {/* Progress */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                    <span>Upload Status</span>
                    <span>{session.materials.length > 0 ? `${session.materials.length} file${session.materials.length > 1 ? "s" : ""} uploaded` : "No materials"}</span>
                  </div>
                  <Progress value={session.materials.length > 0 ? 100 : 0} className="h-1.5" />
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}