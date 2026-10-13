"use client"

import { useRef, useState } from "react"
import { format } from "date-fns"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { PromotionMarketingReportsPanel } from "@/components/promotion-plans/promotion-marketing-reports-panel"
import { resolvePromotionPackageLabel } from "@/lib/promotion-package-constants"
import { Loader2, Upload } from "lucide-react"
import { getBearerTokenForApi } from "@/lib/auth-helper"

interface PromotionMarketingReportsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  promotionId: string
  packageType: string
  eventTitle?: string
  accountName?: string
}

export function PromotionMarketingReportsDialog({
  open,
  onOpenChange,
  promotionId,
  packageType,
  eventTitle,
  accountName,
}: PromotionMarketingReportsDialogProps) {
  const { toast } = useToast()
  const fileRef = useRef<HTMLInputElement>(null)
  const [reportDate, setReportDate] = useState(() => format(new Date(), "yyyy-MM-dd"))
  const [notes, setNotes] = useState("")
  const [uploading, setUploading] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  const handleUpload = async () => {
    const file = fileRef.current?.files?.[0]
    if (!file) {
      toast({ title: "Select a file", variant: "destructive" })
      return
    }

    try {
      setUploading(true)
      const token = getBearerTokenForApi()
      if (!token) throw new Error("Please log in again to upload reports")

      const formData = new FormData()
      formData.append("file", file)
      formData.append("reportDate", reportDate)
      if (notes.trim()) formData.append("notes", notes.trim())
      formData.append("channel", "SOCIAL_MEDIA")

      const res = await fetch(`/api/admin/promotions/${promotionId}/marketing-reports`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      })

      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(data.error || "Upload failed")
      }

      toast({ title: "Report uploaded", description: `Lead report saved for ${reportDate}` })
      setNotes("")
      if (fileRef.current) fileRef.current.value = ""
      setRefreshKey((k) => k + 1)
    } catch (err) {
      toast({
        title: "Upload failed",
        description: err instanceof Error ? err.message : "Could not upload report",
        variant: "destructive",
      })
    } finally {
      setUploading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] max-w-3xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Marketing Lead Reports</DialogTitle>
          <DialogDescription>
            {accountName && <span className="font-medium">{accountName}</span>}
            {eventTitle && <> · {eventTitle}</>}
            {" · "}
            {resolvePromotionPackageLabel(packageType)}
          </DialogDescription>
        </DialogHeader>

        <section className="space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
          <h3 className="text-sm font-semibold text-slate-900">Upload daily report</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Report date</Label>
              <Input
                type="date"
                value={reportDate}
                max={format(new Date(), "yyyy-MM-dd")}
                onChange={(e) => setReportDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>File (PDF, DOC, DOCX)</Label>
              <Input ref={fileRef} type="file" accept=".pdf,.doc,.docx,.xls,.xlsx" />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Notes (optional)</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Instagram campaign leads, 24 responses"
              rows={2}
            />
          </div>
          <Button onClick={handleUpload} disabled={uploading} className="bg-[#004A96] hover:bg-[#003d7a]">
            {uploading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Upload className="mr-2 h-4 w-4" />
            )}
            Upload report
          </Button>
        </section>

        <PromotionMarketingReportsPanel
          key={refreshKey}
          promotionId={promotionId}
          apiBase="admin"
          readOnly={false}
        />
      </DialogContent>
    </Dialog>
  )
}
