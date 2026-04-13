// API client functions for legal documents

export interface LegalDocument {
  id: string
  name: string
  type: string
  category: "standard" | "contract" | "compliance"
  status: string
  description?: string
  fileUrl: string
  fileName: string
  fileSize: number
  version?: string
  downloadCount?: number
  lastUpdated?: string
  // Contract specific
  eventName?: string
  organizer?: string
  contractType?: string
  signedDate?: string
  eventDate?: string
  value?: string
  // Compliance specific
  issueDate?: string
  expiryDate?: string
  issuingAuthority?: string
  certificateNumber?: string
  venueId?: string
  createdAt: string
  updatedAt: string
}

export interface DocumentStats {
  standardDocuments: number
  signedContracts: number
  expiringSoon: number
  expired: number
}

export async function fetchDocuments(params?: {
  category?: string
  type?: string
  status?: string
  venueId?: string
}): Promise<LegalDocument[]> {
  const searchParams = new URLSearchParams()
  if (params?.category) searchParams.append("category", params.category)
  if (params?.type) searchParams.append("type", params.type)
  if (params?.status) searchParams.append("status", params.status)
  if (params?.venueId) searchParams.append("venueId", params.venueId)

  const response = await fetch(`/api/legal-documents?${searchParams.toString()}`)
  if (!response.ok) throw new Error("Failed to fetch documents")
  const data = await response.json()
  return data.documents || []
}

export async function fetchDocumentStats(venueId: string): Promise<DocumentStats> {
  const response = await fetch(`/api/legal-documents/stats?venueId=${venueId}`)
  if (!response.ok) throw new Error("Failed to fetch stats")
  return response.json()
}

export async function uploadDocument(formData: FormData): Promise<LegalDocument> {
  const response = await fetch("/api/legal-documents", {
    method: "POST",
    body: formData,
  })
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "Failed to upload document")
  }
  const data = await response.json()
  return data.document
}

export async function downloadDocument(id: string): Promise<void> {
  const response = await fetch(`/api/legal-documents/${id}?download=true`)
  if (!response.ok) throw new Error("Failed to download document")

  const data = await response.json()
  // Open the file URL in a new tab
  window.open(data.fileUrl || data.document?.fileUrl, "_blank")
}

export async function updateDocument(id: string, data: Partial<LegalDocument>): Promise<LegalDocument> {
  const response = await fetch(`/api/legal-documents/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!response.ok) throw new Error("Failed to update document")
  const result = await response.json()
  return result.document
}

export async function deleteDocument(id: string): Promise<void> {
  const response = await fetch(`/api/legal-documents/${id}`, {
    method: "DELETE",
  })
  if (!response.ok) throw new Error("Failed to delete document")
}
