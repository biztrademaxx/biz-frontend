"use client"

import type React from "react"

import { useState } from "react"
import useSWR from "swr"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import {
  FileText,
  Upload,
  Download,
  Eye,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock,
  Building,
  Trash2,
  Loader2,
} from "lucide-react"
import {
  fetchDocuments,
  fetchDocumentStats,
  uploadDocument,
  downloadDocument,
  deleteDocument,
  type LegalDocument,
} from "@/lib/api/legal-documents"

interface LegalDocumentationProps {
  venueId: string
}

export default function LegalDocumentation({ venueId }: LegalDocumentationProps) {
  const { toast } = useToast()
  const [selectedDocument, setSelectedDocument] = useState<LegalDocument | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadCategory, setUploadCategory] = useState<"standard" | "contract" | "compliance">("standard")

  const [uploadForm, setUploadForm] = useState({
    name: "",
    type: "",
    description: "",
    category: "standard" as "standard" | "contract" | "compliance",
    // Contract fields
    eventName: "",
    organizer: "",
    contractType: "",
    eventDate: "",
    value: "",
    // Compliance fields
    issueDate: "",
    expiryDate: "",
    issuingAuthority: "",
    certificateNumber: "",
  })
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const { data: stats, mutate: mutateStats } = useSWR(venueId ? `legal-documents-stats-${venueId}` : null, () =>
    fetchDocumentStats(venueId),
  )
  const { data: standardDocuments = [], mutate: mutateStandard } = useSWR(
    venueId ? `legal-documents-standard-${venueId}` : null,
    () => fetchDocuments({ category: "standard", venueId }),
  )
  const { data: eventContracts = [], mutate: mutateContracts } = useSWR(
    venueId ? `legal-documents-contract-${venueId}` : null,
    () => fetchDocuments({ category: "contract", venueId }),
  )
  const { data: complianceDocuments = [], mutate: mutateCompliance } = useSWR(
    venueId ? `legal-documents-compliance-${venueId}` : null,
    () => fetchDocuments({ category: "compliance", venueId }),
  )

  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedFile) {
      toast({ title: "Error", description: "Please select a file", variant: "destructive" })
      return
    }

    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append("file", selectedFile)
      formData.append("name", uploadForm.name)
      formData.append("type", uploadForm.type)
      formData.append("category", uploadForm.category)
      formData.append("venueId", venueId)
      if (uploadForm.description) formData.append("description", uploadForm.description)

      // Add category-specific fields
      if (uploadForm.category === "contract") {
        if (uploadForm.eventName) formData.append("eventName", uploadForm.eventName)
        if (uploadForm.organizer) formData.append("organizer", uploadForm.organizer)
        if (uploadForm.contractType) formData.append("contractType", uploadForm.contractType)
        if (uploadForm.eventDate) formData.append("eventDate", uploadForm.eventDate)
        if (uploadForm.value) formData.append("value", uploadForm.value)
      } else if (uploadForm.category === "compliance") {
        if (uploadForm.issueDate) formData.append("issueDate", uploadForm.issueDate)
        if (uploadForm.expiryDate) formData.append("expiryDate", uploadForm.expiryDate)
        if (uploadForm.issuingAuthority) formData.append("issuingAuthority", uploadForm.issuingAuthority)
        if (uploadForm.certificateNumber) formData.append("certificateNumber", uploadForm.certificateNumber)
      }

      await uploadDocument(formData)

      // Refresh data
      mutateStandard()
      mutateContracts()
      mutateCompliance()
      mutateStats()

      toast({ title: "Success", description: "Document uploaded successfully" })

      // Reset form
      setUploadForm({
        name: "",
        type: "",
        description: "",
        category: "standard",
        eventName: "",
        organizer: "",
        contractType: "",
        eventDate: "",
        value: "",
        issueDate: "",
        expiryDate: "",
        issuingAuthority: "",
        certificateNumber: "",
      })
      setSelectedFile(null)
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to upload document",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  const handleDownload = async (id: string) => {
    try {
      await downloadDocument(id)
      // Refresh to update download count
      mutateStandard()
      mutateContracts()
      mutateCompliance()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to download document",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async (id: string, category: string) => {
    if (!confirm("Are you sure you want to delete this document?")) return

    try {
      await deleteDocument(id)

      // Refresh appropriate list
      if (category === "standard") mutateStandard()
      else if (category === "contract") mutateContracts()
      else mutateCompliance()
      mutateStats()

      toast({ title: "Success", description: "Document deleted successfully" })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete document",
        variant: "destructive",
      })
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
      case "Valid":
      case "Signed":
        return "bg-green-500"
      case "Pending Signature":
      case "Expiring Soon":
        return "bg-yellow-500"
      case "Expired":
      case "Inactive":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Active":
      case "Valid":
      case "Signed":
        return <CheckCircle className="w-4 h-4" />
      case "Pending Signature":
      case "Expiring Soon":
        return <Clock className="w-4 h-4" />
      case "Expired":
      case "Inactive":
        return <AlertTriangle className="w-4 h-4" />
      default:
        return <FileText className="w-4 h-4" />
    }
  }

  const DocumentCard = ({ document, type = "standard" }: { document: LegalDocument; type?: string }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold mb-2">{document.name || document.eventName}</h3>
            <div className="space-y-1 text-sm text-muted-foreground">
              {type === "standard" && (
                <>
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Type: {document.type}
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Last Updated: {document.lastUpdated || new Date(document.updatedAt).toLocaleDateString()}
                  </div>
                  {document.version && <div>Version: {document.version}</div>}
                  <div>Downloads: {document.downloadCount || 0}</div>
                </>
              )}
              {type === "contract" && (
                <>
                  <div className="flex items-center gap-2">
                    <Building className="w-4 h-4" />
                    Organizer: {document.organizer}
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Event Date: {document.eventDate}
                  </div>
                  {document.signedDate && <div>Signed: {document.signedDate}</div>}
                  {document.value && <div>Value: {document.value}</div>}
                </>
              )}
              {type === "compliance" && (
                <>
                  <div>Issuing Authority: {document.issuingAuthority}</div>
                  <div>Certificate No: {document.certificateNumber}</div>
                  <div>Issue Date: {document.issueDate}</div>
                  <div>Expiry Date: {document.expiryDate}</div>
                </>
              )}
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <Badge className={getStatusColor(document.status)}>
              {getStatusIcon(document.status)}
              <span className="ml-1">{document.status}</span>
            </Badge>
            {document.fileSize && <Badge variant="outline">{(document.fileSize / (1024 * 1024)).toFixed(2)} MB</Badge>}
          </div>
        </div>

        {document.description && <p className="text-sm text-muted-foreground mb-4">{document.description}</p>}

        <div className="flex items-center gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" onClick={() => setSelectedDocument(document)}>
                <Eye className="w-4 h-4 mr-2" />
                View
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{document.name || document.eventName}</DialogTitle>
              </DialogHeader>
              {selectedDocument && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Type</label>
                      <p className="text-muted-foreground">{selectedDocument.type || selectedDocument.contractType}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Status</label>
                      <p className="text-muted-foreground">{selectedDocument.status}</p>
                    </div>
                  </div>
                  {selectedDocument.description && (
                    <div>
                      <label className="text-sm font-medium">Description</label>
                      <p className="text-muted-foreground">{selectedDocument.description}</p>
                    </div>
                  )}
                  <div className="flex justify-end gap-3">
                    <Button variant="outline" onClick={() => handleDownload(selectedDocument.id)}>
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>

          <Button variant="outline" size="sm" onClick={() => handleDownload(document.id)}>
            <Download className="w-4 h-4 mr-2" />
            Download
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => handleDelete(document.id, document.category)}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Legal & Documentation</h1>
      </div>

      {/* Stats Cards */}
      {/* <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-blue-600">{stats?.standardDocuments || 0}</div>
            <div className="text-muted-foreground">Standard Documents</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-green-600">{stats?.signedContracts || 0}</div>
            <div className="text-muted-foreground">Signed Contracts</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-yellow-600">{stats?.expiringSoon || 0}</div>
            <div className="text-muted-foreground">Expiring Soon</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-red-600">{stats?.expired || 0}</div>
            <div className="text-muted-foreground">Expired</div>
          </CardContent>
        </Card>
      </div> */}

      <Tabs defaultValue="standard" className="space-y-6">
        {/* <TabsList>
          <TabsTrigger value="standard">Standard Documents</TabsTrigger>
          <TabsTrigger value="contracts">Event Contracts</TabsTrigger>
          <TabsTrigger value="compliance">Compliance & Certificates</TabsTrigger>
        </TabsList> */}

        <TabsContent value="standard" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Upload New Standard Document</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleFileUpload} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Document Name</Label>
                    <Input
                      id="name"
                      placeholder="Document Name"
                      value={uploadForm.name}
                      onChange={(e) => setUploadForm({ ...uploadForm, name: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="type">Document Type</Label>
                    <Input
                      id="type"
                      placeholder="Document Type"
                      value={uploadForm.type}
                      onChange={(e) => setUploadForm({ ...uploadForm, type: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Document Description"
                    rows={3}
                    value={uploadForm.description}
                    onChange={(e) => setUploadForm({ ...uploadForm, description: e.target.value })}
                  />
                </div>
                <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                  <input
                    type="file"
                    id="file-upload"
                    className="hidden"
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  />
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground">
                      {selectedFile ? selectedFile.name : "Click to upload or drag and drop"}
                    </p>
                    <p className="text-sm text-muted-foreground">PDF, DOC, DOCX up to 10MB</p>
                  </label>
                </div>
                <Button type="submit" className="w-full" disabled={isUploading}>
                  {isUploading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Document
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          <div className="space-y-4">
            {standardDocuments.map((document) => (
              <DocumentCard key={document.id} document={document} type="standard" />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="contracts" className="space-y-4">
          <div className="space-y-4">
            {eventContracts.map((contract) => (
              <DocumentCard key={contract.id} document={contract} type="contract" />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="compliance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-orange-500" />
                Compliance Status Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {complianceDocuments.filter((c: LegalDocument) => c.status === "Valid").length}
                  </div>
                  <div className="text-sm text-green-700 dark:text-green-400">Valid Certificates</div>
                </div>
                <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-950 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600">
                    {complianceDocuments.filter((c: LegalDocument) => c.status === "Expiring Soon").length}
                  </div>
                  <div className="text-sm text-yellow-700 dark:text-yellow-400">Expiring Soon</div>
                </div>
                <div className="text-center p-4 bg-red-50 dark:bg-red-950 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">
                    {complianceDocuments.filter((c: LegalDocument) => c.status === "Expired").length}
                  </div>
                  <div className="text-sm text-red-700 dark:text-red-400">Expired</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4">
            {complianceDocuments.map((document: LegalDocument) => (
              <DocumentCard key={document.id} document={document} type="compliance" />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
