"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { apiFetch } from "@/lib/api"
import { Progress } from "@/components/ui/progress"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Upload, FileText, Video, ImageIcon, Download, Trash2, Eye,
  AlertCircle, Calendar, Youtube, Plus, X, Loader2, ChevronRight,
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
  const [sessions, setSessions] = useState<SessionWithMaterials[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [youtubeInput, setYoutubeInput] = useState<{ [sessionId: string]: string }>({})
  const [addingYoutube, setAddingYoutube] = useState<string | null>(null)
  const [activeModal, setActiveModal] = useState<string | null>(null)

  useEffect(() => { fetchSessions() }, [speakerId])

  const fetchSessions = async () => {
    if (!speakerId) return
    try {
      setLoading(true); setError(null)
      const data = await apiFetch<{ success?: boolean; sessions?: SessionWithMaterials[] }>(`/api/speakers/${speakerId}/sessions`, { auth: true })
      const sessionsData = Array.isArray(data?.sessions) ? data.sessions : []
      setSessions(sessionsData)
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
      setActiveModal(null)
    } catch (err) { setError(err instanceof Error ? err.message : "Upload failed") }
    finally { setUploading(false); setUploadProgress(0) }
  }

  const handleToggleDownload = async (materialId: string, currentValue: boolean) => {
    try {
      await apiFetch(`/api/materials/${materialId}`, { method: "PATCH", body: { allowDownload: !currentValue }, auth: true })
      setSessions((prev) => prev.map((s) => ({ ...s, materials: s.materials.map((m) => m.id === materialId ? { ...m, allowDownload: !currentValue } : m) })))
    } catch (err) { setError(err instanceof Error ? err.message : "Failed to update") }
  }

const handleDownload = async (
  materialId: string,
  fileName: string
) => {
  const confirmed = window.confirm(
    `Do you want to download ${fileName}?`
  );

  if (!confirmed) return;

  try {
    const data = await apiFetch<{ fileUrl?: string }>(
      `/api/materials/${materialId}/download`,
      { auth: true }
    );

    if (!data?.fileUrl) {
      setError("Download failed");
      return;
    }

    const link = document.createElement("a");
    link.href = data.fileUrl;
    link.download = fileName;
    link.click();
  } catch (err) {
    setError(err instanceof Error ? err.message : "Download failed");
  }
};

  const handleDelete = async (materialId: string) => {
    if (!confirm("Delete this file?")) return
    try {
      await apiFetch(`/api/materials/${materialId}`, { method: "DELETE", auth: true })
      setSessions((prev) => prev.map((s) => ({ ...s, materials: s.materials.filter((m) => m.id !== materialId) })))
    } catch (err) { setError(err instanceof Error ? err.message : "Failed to delete") }
  }

  const handleView = async (materialId: string, fileUrl: string) => {
    try { await apiFetch(`/api/materials/${materialId}/view`, { method: "POST", auth: true }) } catch (err) { console.error(err) }
    window.open(fileUrl, "_blank")
  }

  const getFileIcon = (type: string) => {
    const icons = {
      presentation: <FileText className="w-3.5 h-3.5 text-amber-500" />,
      video: <Video className="w-3.5 h-3.5 text-purple-500" />,
      document: <FileText className="w-3.5 h-3.5 text-blue-500" />,
      image: <ImageIcon className="w-3.5 h-3.5 text-emerald-500" />,
    }
    return icons[type as keyof typeof icons] || <FileText className="w-3.5 h-3.5 text-slate-400" />
  }

  const getStatusBadge = (status: string) => {
    const styles = {
      final: "bg-emerald-50 text-emerald-700",
      draft: "bg-amber-50 text-amber-700",
      pending: "bg-slate-100 text-slate-600",
    }
    return `text-[9px] font-semibold px-1.5 py-0.5 rounded-full ${styles[status as keyof typeof styles] || styles.pending}`
  }

  const getDaysUntilDeadline = (deadline: string) => {
    return Math.ceil((new Date(deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 B"
    const k = 1024, sizes = ["B", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${(bytes / Math.pow(k, i)).toFixed(0)} ${sizes[i]}`
  }

  const getYoutubeVideoId = (url: string) => {
    const patterns = [/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/]
    for (const p of patterns) { const m = url.match(p); if (m?.[1]) return m[1] }
    return null
  }

  const handleAddYoutubeLink = async (sessionId: string) => {
    const url = youtubeInput[sessionId]?.trim(); if (!url) return
    setAddingYoutube(sessionId)
    try {
      const session = sessions.find((s) => s.id === sessionId)
      if (!session) throw new Error("Session not found")
      const updatedLinks = [...(session.youtube || []), url]
      await apiFetch(`/api/sessions/${sessionId}`, { method: "PATCH", body: { youtube: updatedLinks }, auth: true })
      setSessions((prev) => prev.map((s) => s.id === sessionId ? { ...s, youtube: updatedLinks } : s))
      setYoutubeInput((prev) => ({ ...prev, [sessionId]: "" }))
    } catch (err) { setError(err instanceof Error ? err.message : "Failed to add YouTube link") }
    finally { setAddingYoutube(null) }
  }

  const handleRemoveYoutubeLink = async (sessionId: string, urlToRemove: string) => {
    try {
      const session = sessions.find((s) => s.id === sessionId)
      if (!session) throw new Error("Session not found")
      const updatedLinks = session.youtube.filter((u) => u !== urlToRemove)
      await apiFetch(`/api/sessions/${sessionId}`, { method: "PATCH", body: { youtube: updatedLinks }, auth: true })
      setSessions((prev) => prev.map((s) => s.id === sessionId ? { ...s, youtube: updatedLinks } : s))
    } catch (err) { setError(err instanceof Error ? err.message : "Failed to remove YouTube link") }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-6 h-6 animate-spin text-indigo-400" />
      </div>
    )
  }

  if (sessions.length === 0) {
    return (
      <div className="rounded-xl py-12 flex flex-col items-center gap-3 bg-slate-50/50 border-2 border-dashed border-slate-200">
        <Calendar className="w-8 h-8 text-slate-300" />
        <div className="text-center">
          <p className="text-sm font-medium text-slate-500">No sessions yet</p>
          <p className="text-xs text-slate-400 mt-0.5">You'll see sessions here once assigned</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-800">Materials</h2>
          <p className="text-xs text-slate-400">Manage session files & videos</p>
        </div>
        <div className="text-xs text-slate-400">
          {sessions.reduce((acc, s) => acc + s.materials.length, 0)} total files
        </div>
      </div>

      {/* Error Toast */}
      {error && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs">
          <AlertCircle className="w-3.5 h-3.5" />
          <p>{error}</p>
        </div>
      )}

      {/* Upload Progress */}
      {uploading && (
        <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 space-y-1.5">
          <div className="flex items-center justify-between text-xs font-medium text-blue-700">
            <span>Uploading...</span>
            <span>{Math.round(uploadProgress)}%</span>
          </div>
          <Progress value={uploadProgress} className="h-1" />
        </div>
      )}

      {/* Horizontal Scroll Cards */}
      <div className="w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {sessions.map((session) => {
            const daysLeft = getDaysUntilDeadline(session.deadline)
            const hasMaterials = session.materials.length > 0
            const hasVideos = session.youtube?.length > 0
            const isModalOpen = activeModal === session.id

            return (
              <div
                key={session.id}
                className="w-full rounded-xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-all overflow-hidden"
              >
                {/* Card Header */}
                <div className="p-3 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-bold text-slate-800 truncate">{session.title}</h3>
                      <p className="text-[10px] text-slate-500 mt-0.5">{session.event.name}</p>
                      {session.room && (
                        <p className="text-[10px] text-slate-400 mt-0.5">{session.room}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] text-slate-400">
                        {new Date(session.deadline).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </div>
                      {daysLeft <= 7 && daysLeft > 0 && (
                        <div className="text-[9px] font-semibold text-amber-600 mt-0.5">
                          {daysLeft}d left
                        </div>
                      )}
                      {daysLeft <= 0 && (
                        <div className="text-[9px] font-semibold text-red-600 mt-0.5">
                          Overdue
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Stats Row */}
                  <div className="flex items-center gap-3 mt-2 pt-1 text-[10px] text-slate-400">
                    <span>{hasMaterials ? `${session.materials.length} file${session.materials.length > 1 ? 's' : ''}` : 'No files'}</span>
                    {hasVideos && <span>• {session.youtube.length} video{session.youtube.length > 1 ? 's' : ''}</span>}
                  </div>
                </div>

                {/* Card Content - Preview */}
                <div className="p-3 space-y-2">
                  {/* Materials Preview */}
                  {hasMaterials ? (
                    <div className="space-y-1">
                      {session.materials.slice(0, 2).map((file) => (
                        <div key={file.id} className="flex items-center justify-between p-1.5 rounded-lg bg-slate-50">
                          <div className="flex items-center gap-1.5 min-w-0 flex-1">
                            {getFileIcon(file.fileType)}
                            <span className="text-[10px] font-medium text-slate-700 truncate">{file.fileName}</span>
                          </div>
                          <div className="flex items-center gap-0.5">
                            <button onClick={() => handleView(file.id, file.fileUrl)} className="p-1 rounded hover:bg-white text-slate-400 hover:text-blue-500 transition">
                              <Eye className="w-3 h-3" />
                            </button>
                            {/* <button onClick={() => handleDownload(file.id, file.fileName)} disabled={!file.allowDownload} className="p-1 rounded hover:bg-white text-slate-400 hover:text-blue-500 transition disabled:opacity-30">
                              <Download className="w-3 h-3" />
                            </button> */}
                          </div>
                        </div>
                      ))}
                      {session.materials.length > 2 && (
                        <p className="text-[9px] text-slate-400 text-center pt-0.5">
                          +{session.materials.length - 2} more
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-3">
                      <Upload className="w-4 h-4 mx-auto text-slate-300 mb-1" />
                      <p className="text-[10px] text-slate-400">No files yet</p>
                    </div>
                  )}

                  {/* YouTube Preview */}
                  {hasVideos && (
                    <div className="flex items-center gap-1.5 pt-1">
                      <Youtube className="w-3 h-3 text-red-500" />
                      <span className="text-[10px] text-slate-500">{session.youtube.length} video link{session.youtube.length > 1 ? 's' : ''}</span>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => setActiveModal(isModalOpen ? null : session.id)}
                      className="flex-1 py-1.5 rounded-lg text-[10px] font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition"
                    >
                      {isModalOpen ? "Close" : "Manage Files"}
                    </button>
                  </div>
                </div>

                {/* Modal/Dropdown for Full Management */}
                {isModalOpen && (
                  <div className="border-t border-slate-100 p-3 space-y-3 bg-slate-50/50 max-h-96 overflow-y-auto">
                    {/* Full Materials List */}
                    {hasMaterials ? (
                      <div className="space-y-1.5">
                        <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Files</p>
                        {session.materials.map((file) => (
                          <div key={file.id} className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-100">
                            <div className="flex items-center gap-2 min-w-0 flex-1">
                              {getFileIcon(file.fileType)}
                              <div className="min-w-0 flex-1">
                                <p className="text-[10px] font-medium text-slate-700 truncate">{file.fileName}</p>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                  <span className="text-[9px] text-slate-400">{formatFileSize(file.fileSize)}</span>
                                  <span className={getStatusBadge(file.status)}>{file.status}</span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-0.5">
                              <div className="flex items-center gap-0.5 mr-1">
                                <Switch
                                  id={`dl-${file.id}`}
                                  checked={file.allowDownload}
                                  onCheckedChange={() => handleToggleDownload(file.id, file.allowDownload)}
                                  className="scale-75"
                                />
                                <Label htmlFor={`dl-${file.id}`} className="text-[8px] text-slate-400">DL</Label>
                              </div>
                              <button onClick={() => handleView(file.id, file.fileUrl)} className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-blue-500 transition">
                                <Eye className="w-3 h-3" />
                              </button>
                              <button onClick={() => handleDownload(file.id, file.fileName)} disabled={!file.allowDownload} className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-blue-500 transition disabled:opacity-30">
                                <Download className="w-3 h-3" />
                              </button>
                              <button onClick={() => handleDelete(file.id)} className="p-1 rounded hover:bg-red-50 text-slate-400 hover:text-red-500 transition">
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-2">
                        <p className="text-[10px] text-slate-400">No files uploaded</p>
                      </div>
                    )}

                    {/* YouTube Management */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-1.5">
                        <Youtube className="w-3 h-3 text-red-500" />
                        <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Videos</p>
                      </div>

                      {hasVideos && (
                        <div className="space-y-1">
                          {session.youtube.map((url, idx) => {
                            const videoId = getYoutubeVideoId(url)
                            return (
                              <div key={idx} className="flex items-center justify-between p-1.5 rounded-lg bg-white border border-slate-100">
                                {videoId ? (
                                  <iframe className="w-20 h-12 rounded" src={`https://www.youtube.com/embed/${videoId}`} title="YouTube" allowFullScreen />
                                ) : (
                                  <a href={url} target="_blank" rel="noopener noreferrer" className="text-[9px] text-blue-500 hover:underline truncate flex-1">{url}</a>
                                )}
                                <button onClick={() => handleRemoveYoutubeLink(session.id, url)} className="p-1 rounded hover:bg-red-50">
                                  <Trash2 className="w-3 h-3 text-slate-400 hover:text-red-500" />
                                </button>
                              </div>
                            )
                          })}
                        </div>
                      )}

                      <div className="flex gap-1.5">
                        <Input
                          placeholder="Paste YouTube URL"
                          value={youtubeInput[session.id] || ""}
                          onChange={(e) => setYoutubeInput(prev => ({ ...prev, [session.id]: e.target.value }))}
                          onKeyDown={(e) => e.key === "Enter" && handleAddYoutubeLink(session.id)}
                          className="flex-1 h-7 text-[10px] rounded-lg border-slate-200"
                        />
                        <button
                          onClick={() => handleAddYoutubeLink(session.id)}
                          disabled={!youtubeInput[session.id]?.trim() || addingYoutube === session.id}
                          className="px-2 h-7 rounded-lg text-[10px] font-medium text-white disabled:opacity-50 bg-gradient-to-r from-blue-600 to-indigo-600"
                        >
                          {addingYoutube === session.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Plus className="w-3 h-3" />}
                        </button>
                      </div>
                    </div>

                    {/* Upload Zone */}
                    <div
                      className="rounded-lg p-2 text-center border-2 border-dashed border-slate-200 bg-white cursor-pointer hover:border-blue-300 transition"
                      onClick={() => document.getElementById(`upload-${session.id}`)?.click()}
                    >
                      <Upload className="w-3 h-3 mx-auto text-slate-300" />
                      <p className="text-[9px] text-slate-400 mt-0.5">Click to upload</p>
                      <input
                        type="file"
                        id={`upload-${session.id}`}
                        className="hidden"
                        multiple
                        onChange={(e) => e.target.files && handleFileUpload(e.target.files, session.id)}
                        accept=".ppt,.pptx,.pdf,.mp4,.mov,.doc,.docx,.jpg,.jpeg,.png"
                      />
                    </div>
                  </div>
                )}
              </div>
            )
          })}

          {/* Add Session Placeholder (Optional) */}
          <div className="w-full rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/30 flex flex-col items-center justify-center p-6 min-h-[280px]">
            <Calendar className="w-8 h-8 text-slate-300 mb-2" />
            <p className="text-xs font-medium text-slate-500">More sessions</p>
            <p className="text-[10px] text-slate-400 text-center mt-1">New sessions will<br />appear here</p>
          </div>
        </div>
      </div>
    </div>
  )
}