"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { apiFetch } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import {
  Upload,
  FileText,
  Video,
  ImageIcon,
  Download,
  Trash2,
  Eye,
  AlertCircle,
  Calendar,
  Youtube,
  Plus,
  X,
} from "lucide-react"
import { Loader2 } from "lucide-react"

interface Material {
  id: string
  fileName: string
  fileUrl: string
  fileSize: number
  fileType: string
  mimeType: string
  status: string
  allowDownload: boolean
  uploadedAt: string
  downloadCount: number
  viewCount: number
}

interface SessionWithMaterials {
  id: string
  title: string
  deadline: string
  startTime: string
  room: string | null
  youtube: string[]
  event: {
    id: string
    name: string
  }
  materials: Material[]
}

interface PresentationMaterialsProps {
  speakerId: string
}

export function PresentationMaterials({ speakerId }: PresentationMaterialsProps) {
  const [dragActive, setDragActive] = useState(false)
  const [sessions, setSessions] = useState<SessionWithMaterials[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [youtubeInput, setYoutubeInput] = useState<{ [sessionId: string]: string }>({})
  const [addingYoutube, setAddingYoutube] = useState<string | null>(null)

  useEffect(() => {
    fetchSessions()
  }, [speakerId])

  const fetchSessions = async () => {
    if (!speakerId) return
    try {
      setLoading(true)
      setError(null)
      const data = await apiFetch<{ success?: boolean; sessions?: SessionWithMaterials[] }>(
        `/api/speakers/${speakerId}/sessions`,
        { auth: true }
      )
      const list = Array.isArray(data?.sessions) ? data.sessions : []
      setSessions(list)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load sessions")
      setSessions([])
    } finally {
      setLoading(false)
    }
  }

  const handleFileUpload = async (files: FileList, sessionId: string) => {
    if (!files || files.length === 0) return

    setUploading(true)
    setUploadProgress(0)

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const formData = new FormData()
        formData.append("file", file)
        formData.append("sessionId", sessionId)
        formData.append("speakerId", speakerId)

        await apiFetch<{ material?: Material }>("/api/materials", {
          method: "POST",
          body: formData,
          auth: true,
        })

        setUploadProgress(((i + 1) / files.length) * 100)
      }

      await fetchSessions()
    } catch (err) {
      console.error("[v0] Upload error:", err)
      setError(err instanceof Error ? err.message : "Upload failed")
    } finally {
      setUploading(false)
      setUploadProgress(0)
    }
  }

  const handleToggleDownload = async (materialId: string, currentValue: boolean) => {
    try {
      await apiFetch(`/api/materials/${materialId}`, {
        method: "PATCH",
        body: { allowDownload: !currentValue },
        auth: true,
      })

      setSessions((prevSessions) =>
        prevSessions.map((session) => ({
          ...session,
          materials: session.materials.map((material) =>
            material.id === materialId ? { ...material, allowDownload: !currentValue } : material,
          ),
        })),
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update")
    }
  }

  const handleDownload = async (materialId: string, fileName: string) => {
    try {
      const data = await apiFetch<{ fileUrl?: string }>(`/api/materials/${materialId}/download`, {
        auth: true,
      })
      const url = data?.fileUrl
      if (url) window.open(url, "_blank")
      else setError("Download failed")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Download failed")
    }
  }

  const handleDelete = async (materialId: string) => {
    if (!confirm("Are you sure you want to delete this file?")) return

    try {
      await apiFetch(`/api/materials/${materialId}`, {
        method: "DELETE",
        auth: true,
      })

      setSessions((prevSessions) =>
        prevSessions.map((session) => ({
          ...session,
          materials: session.materials.filter((material) => material.id !== materialId),
        })),
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete")
    }
  }

  const handleView = async (materialId: string, fileUrl: string) => {
    try {
      await apiFetch(`/api/materials/${materialId}/view`, { method: "POST", auth: true })
    } catch (err) {
      console.error("Failed to track view:", err)
    }
    window.open(fileUrl, "_blank")
  }

  const getFileIcon = (type: string) => {
    switch (type) {
      case "presentation":
        return <FileText className="h-8 w-8 text-orange-500" />
      case "video":
        return <Video className="h-8 w-8 text-purple-500" />
      case "document":
        return <FileText className="h-8 w-8 text-blue-500" />
      case "image":
        return <ImageIcon className="h-8 w-8 text-green-500" />
      default:
        return <FileText className="h-8 w-8 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "final":
        return "bg-green-100 text-green-800"
      case "draft":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getDaysUntilDeadline = (deadline: string) => {
    const today = new Date()
    const deadlineDate = new Date(deadline)
    const diffTime = deadlineDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i]
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent, sessionId?: string) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0 && sessionId) {
      handleFileUpload(e.dataTransfer.files, sessionId)
    }
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>, sessionId: string) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileUpload(e.target.files, sessionId)
    }
  }

  const getYoutubeVideoId = (url: string): string | null => {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /youtube\.com\/watch\?.*v=([^&\n?#]+)/,
    ]

    for (const pattern of patterns) {
      const match = url.match(pattern)
      if (match && match[1]) {
        return match[1]
      }
    }
    return null
  }

  const handleAddYoutubeLink = async (sessionId: string) => {
    const url = youtubeInput[sessionId]?.trim()
    if (!url) return

    setAddingYoutube(sessionId)
    try {
      const session = sessions.find((s) => s.id === sessionId)
      if (!session) throw new Error("Session not found")

      const updatedYoutubeLinks = [...(session.youtube || []), url]

      const data = await apiFetch<{ session?: { youtube?: string[] } }>(`/api/sessions/${sessionId}`, {
        method: "PATCH",
        body: { youtube: updatedYoutubeLinks },
        auth: true,
      })

      setSessions((prevSessions) =>
        prevSessions.map((s) =>
          s.id === sessionId ? { ...s, youtube: data?.session?.youtube ?? updatedYoutubeLinks } : s,
        ),
      )

      setYoutubeInput((prev) => ({ ...prev, [sessionId]: "" }))
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add YouTube link")
    } finally {
      setAddingYoutube(null)
    }
  }

  const handleRemoveYoutubeLink = async (sessionId: string, urlToRemove: string) => {
    try {
      const session = sessions.find((s) => s.id === sessionId)
      if (!session) throw new Error("Session not found")

      const updatedYoutubeLinks = session.youtube.filter((url) => url !== urlToRemove)

      const data = await apiFetch<{ session?: { youtube?: string[] } }>(`/api/sessions/${sessionId}`, {
        method: "PATCH",
        body: { youtube: updatedYoutubeLinks },
        auth: true,
      })

      setSessions((prevSessions) =>
        prevSessions.map((s) =>
          s.id === sessionId ? { ...s, youtube: data?.session?.youtube ?? updatedYoutubeLinks } : s,
        ),
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to remove YouTube link")
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Presentation Materials</h2>
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2 text-red-800">
              <AlertCircle className="h-5 w-5" />
              <p>{error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {uploading && (
        <Card>
          <CardContent className="p-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Uploading files...</span>
                <span className="text-gray-600">{Math.round(uploadProgress)}%</span>
              </div>
              <Progress value={uploadProgress} className="h-2" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sessions with Materials */}
      <div className="space-y-6">
        {sessions.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No sessions found</h3>
              <p className="text-gray-600">You don't have any sessions assigned yet</p>
            </CardContent>
          </Card>
        ) : (
          sessions.map((session) => (
            <Card key={session.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{session.title}</CardTitle>
                    <p className="text-sm text-blue-600 font-medium">{session.event.name}</p>
                    {session.room && <p className="text-sm text-gray-600">Room: {session.room}</p>}
                  </div>
                  <div className="text-right">
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Calendar className="h-4 w-4" />
                      <span>Deadline: {new Date(session.deadline).toLocaleDateString()}</span>
                    </div>
                    {getDaysUntilDeadline(session.deadline) <= 7 && getDaysUntilDeadline(session.deadline) > 0 && (
                      <div className="flex items-center space-x-1 text-orange-600 mt-1">
                        <AlertCircle className="h-4 w-4" />
                        <span className="text-sm">{getDaysUntilDeadline(session.deadline)} days left</span>
                      </div>
                    )}
                    {getDaysUntilDeadline(session.deadline) <= 0 && (
                      <div className="flex items-center space-x-1 text-red-600 mt-1">
                        <AlertCircle className="h-4 w-4" />
                        <span className="text-sm font-semibold">Deadline passed</span>
                      </div>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {session.materials.length > 0 ? (
                  <div className="space-y-3">
                    {session.materials.map((file) => (
                      <div key={file.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-4">
                          {getFileIcon(file.fileType)}
                          <div>
                            <h4 className="font-medium text-gray-900">{file.fileName}</h4>
                            <div className="flex items-center space-x-4 text-sm text-gray-600">
                              <span>{formatFileSize(file.fileSize)}</span>
                              <span>Uploaded: {new Date(file.uploadedAt).toLocaleDateString()}</span>
                              <Badge className={getStatusColor(file.status)}>{file.status.toUpperCase()}</Badge>
                              <span>{file.downloadCount} downloads</span>
                              <span>{file.viewCount} views</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="flex items-center space-x-2">
                            <Label htmlFor={`download-${file.id}`} className="text-sm">
                              Allow Download
                            </Label>
                            <Switch
                              id={`download-${file.id}`}
                              checked={file.allowDownload}
                              onCheckedChange={() => handleToggleDownload(file.id, file.allowDownload)}
                            />
                          </div>
                          <Button variant="ghost" size="sm" onClick={() => handleView(file.id, file.fileUrl)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDownload(file.id, file.fileName)}
                            disabled={!file.allowDownload}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-700"
                            onClick={() => handleDelete(file.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                    <p>No materials uploaded yet</p>
                  </div>
                )}

                {/* YouTube Videos Section */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                      <Youtube className="h-5 w-5 text-red-600" />
                      YouTube Videos
                    </h3>
                  </div>

                  {/* Display existing YouTube videos */}
                  {session.youtube && session.youtube.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {session.youtube.map((url, index) => {
                        const videoId = getYoutubeVideoId(url)
                        return (
                          <div key={index} className="relative group">
                            {videoId ? (
                              <div className="relative">
                                <iframe
                                  className="w-full aspect-video rounded-lg"
                                  src={`https://www.youtube.com/embed/${videoId}`}
                                  title={`YouTube video ${index + 1}`}
                                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                  allowFullScreen
                                />
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                  onClick={() => handleRemoveYoutubeLink(session.id, url)}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            ) : (
                              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <a
                                  href={url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-sm text-blue-600 hover:underline truncate flex-1"
                                >
                                  {url}
                                </a>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-red-600 hover:text-red-700"
                                  onClick={() => handleRemoveYoutubeLink(session.id, url)}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )}

                  {/* Add new YouTube link */}
                  <div className="flex gap-2">
                    <Input
                      type="url"
                      placeholder="Paste YouTube video URL (e.g., https://youtube.com/watch?v=...)"
                      value={youtubeInput[session.id] || ""}
                      onChange={(e) => setYoutubeInput((prev) => ({ ...prev, [session.id]: e.target.value }))}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleAddYoutubeLink(session.id)
                        }
                      }}
                      className="flex-1"
                    />
                    <Button
                      onClick={() => handleAddYoutubeLink(session.id)}
                      disabled={!youtubeInput[session.id]?.trim() || addingYoutube === session.id}
                      size="sm"
                    >
                      {addingYoutube === session.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <Plus className="h-4 w-4 mr-1" />
                          Add Video
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                <div
                  className={`
                    border-2 border-dashed rounded-lg p-6 text-center transition-colors
                    ${dragActive ? "border-blue-500 bg-blue-50" : "border-gray-300"}
                  `}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={(e) => handleDrop(e, session.id)}
                >
                  <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 mb-2">Drag and drop files here</p>
                  <input
                    type="file"
                    id={`file-upload-${session.id}`}
                    className="hidden"
                    multiple
                    onChange={(e) => handleFileInputChange(e, session.id)}
                    accept=".ppt,.pptx,.pdf,.mp4,.mov,.doc,.docx,.jpg,.jpeg,.png"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-transparent"
                    onClick={() => document.getElementById(`file-upload-${session.id}`)?.click()}
                    disabled={uploading}
                  >
                    {uploading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    Choose Files
                  </Button>
                </div>

                {/* Progress Bar for Deadline */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Upload Progress</span>
                    <span className="text-gray-600">
                      {session.materials.length > 0 ? "Materials uploaded" : "No materials"}
                    </span>
                  </div>
                  <Progress value={session.materials.length > 0 ? 100 : 0} className="h-2" />
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>


      <div className="h-20">
        <h1>Youtube</h1>


      </div>
    </div>
  )
}
