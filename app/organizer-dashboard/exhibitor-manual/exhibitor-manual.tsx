"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { getCurrentUserId } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { FileText, Download, Trash2, Eye, Loader2, Edit } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface PDFDocument {
  id: string
  fileName: string
  fileUrl: string
  fileSize: number
  description: string | null
  version: string
  createdAt: string
  uploadedBy: {
    id: string
    name: string | null
    email: string
  }
}

interface ExhibitorManualProps {
  eventId: string
  userId: string
}

export default function ExhibitorManual({ eventId, userId }: ExhibitorManualProps) {
  const [documents, setDocuments] = useState<PDFDocument[]>([])
  const [uploading, setUploading] = useState(false)
  const [loading, setLoading] = useState(true)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [editingDoc, setEditingDoc] = useState<PDFDocument | null>(null)
  const [editDescription, setEditDescription] = useState("")
  const [editVersion, setEditVersion] = useState("")
  const [description, setDescription] = useState("")
  const [viewingPdf, setViewingPdf] = useState<{ url: string; name: string } | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    fetchDocuments()
  }, [eventId])

  const fetchDocuments = async () => {
    try {
      const response = await fetch(`/api/exhibitor-manual/list?eventId=${eventId}`)
      if (!response.ok) throw new Error("Failed to fetch documents")

      const result = await response.json()
      setDocuments(result.data)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load documents. Please refresh the page.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (file.type !== "application/pdf") {
      toast({
        title: "Invalid file type",
        description: "Please upload a PDF file only.",
        variant: "destructive",
      })
      return
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload a file smaller than 10MB.",
        variant: "destructive",
      })
      return
    }

    const uploaderId = userId || getCurrentUserId()
    if (!uploaderId) {
      toast({
        title: "Sign in required",
        description: "Please sign in to upload documents.",
        variant: "destructive",
      })
      return
    }

    setUploading(true)

    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("eventId", eventId)
      formData.append("uploadedById", uploaderId)
      if (description) {
        formData.append("description", description)
      }

      const response = await fetch("/api/exhibitor-manual/upload", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const err = await response.json().catch(() => ({}))
        const msg = err.details || err.error || "Upload failed"
        throw new Error(msg)
      }

      const result = await response.json()
      setDocuments((prev) => [result.data, ...prev])

      toast({
        title: "Upload successful",
        description: `${file.name} has been uploaded successfully.`,
      })

      // Reset input
      event.target.value = ""
      setDescription("")
    } catch (error) {
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "There was an error uploading your file.",
        variant: "destructive",
      })
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch("/api/exhibitor-manual/delete", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      })

      if (!response.ok) {
        throw new Error("Delete failed")
      }

      setDocuments((prev) => prev.filter((doc) => doc.id !== id))

      toast({
        title: "Document deleted",
        description: "The document has been deleted successfully.",
      })
    } catch (error) {
      toast({
        title: "Delete failed",
        description: "There was an error deleting the document. Please try again.",
        variant: "destructive",
      })
    } finally {
      setDeleteId(null)
    }
  }

  const handleUpdate = async () => {
    if (!editingDoc) return

    try {
      const response = await fetch("/api/exhibitor-manual/update", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: editingDoc.id,
          description: editDescription,
          version: editVersion,
        }),
      })

      if (!response.ok) {
        throw new Error("Update failed")
      }

      const result = await response.json()
      setDocuments((prev) => prev.map((doc) => (doc.id === editingDoc.id ? result.data : doc)))

      toast({
        title: "Document updated",
        description: "The document has been updated successfully.",
      })

      setEditingDoc(null)
    } catch (error) {
      toast({
        title: "Update failed",
        description: "There was an error updating the document. Please try again.",
        variant: "destructive",
      })
    }
  }

 const handleView = (url: string, name: string) => {
  const proxyUrl = `/api/exhibitor-manual/view?url=${encodeURIComponent(url)}`
  setViewingPdf({ url: proxyUrl, name })
}

  const handleDownload = async (url: string, name: string) => {
    try {
      const response = await fetch(url)
      const blob = await response.blob()
      const downloadUrl = window.URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = downloadUrl
      link.download = name
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(downloadUrl)

      toast({
        title: "Download started",
        description: `Downloading ${name}...`,
      })
    } catch (error) {
      toast({
        title: "Download failed",
        description: "There was an error downloading the file. Please try again.",
        variant: "destructive",
      })
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i]
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Exhibitor Manual</h1>
        <p className="text-muted-foreground mt-2">Upload, view, download, and manage PDF documents for exhibitors</p>
      </div>

      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle>Upload PDF Document</CardTitle>
          <CardDescription>Upload exhibitor manual documents (PDF only, max 10MB)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid w-full items-center gap-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                placeholder="Enter a description for this document..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={uploading}
                rows={3}
              />
            </div>
            <div className="grid w-full items-center gap-2">
              <Label htmlFor="pdf-upload">Select PDF File</Label>
              <div className="flex items-center gap-4">
                <Input
                  id="pdf-upload"
                  type="file"
                  accept=".pdf,application/pdf"
                  onChange={handleFileUpload}
                  disabled={uploading}
                  className="cursor-pointer"
                />
                {uploading && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Uploading...
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Documents List */}
      <Card>
        <CardHeader>
          <CardTitle>Uploaded Documents</CardTitle>
          <CardDescription>
            {documents.length === 0
              ? "No documents uploaded yet"
              : `${documents.length} document${documents.length > 1 ? "s" : ""} available`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {documents.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-sm text-muted-foreground">
                No documents uploaded yet. Upload your first exhibitor manual above.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="flex flex-col gap-3 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="flex-shrink-0">
                        <FileText className="h-8 w-8 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{doc.fileName}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatFileSize(doc.fileSize)} • {formatDate(doc.createdAt)} • v{doc.version}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Uploaded by {doc.uploadedBy.name || doc.uploadedBy.email}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditingDoc(doc)
                          setEditDescription(doc.description || "")
                          setEditVersion(doc.version)
                        }}
                        title="Edit details"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleView(doc.fileUrl, doc.fileName)}
                        title="View PDF"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownload(doc.fileUrl, doc.fileName)}
                        title="Download PDF"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setDeleteId(doc.id)}
                        title="Delete PDF"
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  {doc.description && <p className="text-sm text-muted-foreground pl-11">{doc.description}</p>}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* PDF Viewer Modal */}
      <Dialog open={viewingPdf !== null} onOpenChange={() => setViewingPdf(null)}>
        <DialogContent className="max-w-6xl h-[90vh]">
          <DialogHeader>
            <DialogTitle>{viewingPdf?.name}</DialogTitle>
            <DialogDescription>View the PDF document below</DialogDescription>
          </DialogHeader>
          <div className="flex-1 w-full h-full min-h-0">
            {viewingPdf && (
              <iframe src={viewingPdf.url} className="w-full h-full border rounded-md" title={viewingPdf.name} />
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Document Dialog */}
      <Dialog open={editingDoc !== null} onOpenChange={() => setEditingDoc(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Document Details</DialogTitle>
            <DialogDescription>Update the description and version of this document.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-version">Version</Label>
              <Input
                id="edit-version"
                value={editVersion}
                onChange={(e) => setEditVersion(e.target.value)}
                placeholder="e.g., 1.0, 2.1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingDoc(null)}>
              Cancel
            </Button>
            <Button onClick={handleUpdate}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the document from the server.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && handleDelete(deleteId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
