"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import {
  format,
  parseISO,
  startOfMonth,
  endOfMonth,
  isSameDay,
} from "date-fns"
import { Calendar } from "@/components/ui/calendar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { getBearerTokenForApi } from "@/lib/auth-helper"
import { Download, FileText, Loader2, Share2 } from "lucide-react"

export interface MarketingReport {
  id: string
  reportDate: string
  fileUrl: string
  fileName: string
  fileSize: number
  mimeType: string
  notes?: string | null
  channel: string
}

interface PromotionMarketingReportsPanelProps {
  promotionId: string
  /** Admin uses /api/admin/promotions/... ; organizer uses /api/promotions/... */
  apiBase: "admin" | "organizer"
  readOnly?: boolean
  className?: string
}

export function PromotionMarketingReportsPanel({
  promotionId,
  apiBase,
  readOnly = true,
  className,
}: PromotionMarketingReportsPanelProps) {
  const [month, setMonth] = useState(() => new Date())
  const [reports, setReports] = useState<MarketingReport[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>()

  const listPath =
    apiBase === "admin"
      ? `/api/admin/promotions/${promotionId}/marketing-reports`
      : `/api/promotions/${promotionId}/marketing-reports`

  const loadReports = useCallback(async () => {
    try {
      setLoading(true)
      const year = month.getFullYear()
      const m = month.getMonth() + 1
      const token = getBearerTokenForApi()
      const headers: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {}
      const res = await fetch(`${listPath}?year=${year}&month=${m}`, {
        headers,
        cache: "no-store",
      })
      if (!res.ok) {
        setReports([])
        return
      }
      const data = (await res.json()) as { reports?: MarketingReport[] }
      setReports(data.reports ?? [])
    } catch {
      setReports([])
    } finally {
      setLoading(false)
    }
  }, [listPath, month])

  useEffect(() => {
    if (promotionId) loadReports()
  }, [promotionId, loadReports])

  const reportDates = useMemo(
    () => reports.map((r) => parseISO(r.reportDate)),
    [reports],
  )

  const selectedReport = useMemo(() => {
    if (!selectedDate) return null
    return (
      reports.find((r) => isSameDay(parseISO(r.reportDate), selectedDate)) ?? null
    )
  }, [reports, selectedDate])

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-sm font-medium text-slate-800">
          <Share2 className="h-4 w-4 text-[#004A96]" />
          Social Media Lead Reports
        </div>
        <Badge variant="outline" className="text-xs">
          {reports.length} this month
        </Badge>
      </div>
      <p className="text-xs text-slate-500">
        Daily lead reports from our marketing team (PDF / DOC). Website clicks and conversions are tracked automatically above.
      </p>

      {loading ? (
        <div className="flex h-32 items-center justify-center">
          <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
        </div>
      ) : (
        <div className="flex flex-col gap-4 lg:flex-row">
          <Calendar
            mode="single"
            month={month}
            onMonthChange={setMonth}
            selected={selectedDate}
            onSelect={setSelectedDate}
            modifiers={{ hasReport: reportDates }}
            modifiersClassNames={{
              hasReport:
                "relative after:absolute after:bottom-1 after:left-1/2 after:h-1 after:w-1 after:-translate-x-1/2 after:rounded-full after:bg-emerald-500",
            }}
            className="rounded-lg border bg-white p-2"
            disabled={(date) => date > new Date()}
          />

          <div className="min-w-0 flex-1 rounded-lg border bg-slate-50 p-4">
            {selectedReport ? (
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    {format(parseISO(selectedReport.reportDate), "EEEE, MMM d, yyyy")}
                  </p>
                  <p className="text-xs text-slate-500">{selectedReport.channel.replace(/_/g, " ")}</p>
                </div>
                <div className="flex items-start gap-3 rounded-md border bg-white p-3">
                  <FileText className="mt-0.5 h-5 w-5 shrink-0 text-[#004A96]" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{selectedReport.fileName}</p>
                    <p className="text-xs text-slate-500">{formatFileSize(selectedReport.fileSize)}</p>
                    {selectedReport.notes ? (
                      <p className="mt-2 text-xs text-slate-600">{selectedReport.notes}</p>
                    ) : null}
                  </div>
                </div>
                <Button asChild className="w-full bg-[#004A96] hover:bg-[#003d7a]">
                  <a href={selectedReport.fileUrl} target="_blank" rel="noopener noreferrer" download>
                    <Download className="mr-2 h-4 w-4" />
                    Download Report
                  </a>
                </Button>
              </div>
            ) : (
              <div className="flex h-full min-h-[120px] flex-col items-center justify-center text-center text-sm text-slate-500">
                {selectedDate ? (
                  <>
                    <p>No report for {format(selectedDate, "MMM d, yyyy")}</p>
                    {!readOnly && (
                      <p className="mt-1 text-xs">Upload a file for this date below.</p>
                    )}
                  </>
                ) : (
                  <p>Select a highlighted date to download the lead report.</p>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {reports.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-xs font-medium text-slate-600">Recent uploads</p>
          <ul className="max-h-28 space-y-1 overflow-y-auto text-xs">
            {[...reports].reverse().slice(0, 5).map((r) => (
              <li key={r.id}>
                <button
                  type="button"
                  className="flex w-full items-center justify-between rounded px-2 py-1 text-left hover:bg-slate-100"
                  onClick={() => setSelectedDate(parseISO(r.reportDate))}
                >
                  <span>{format(parseISO(r.reportDate), "MMM d")}</span>
                  <span className="truncate pl-2 text-slate-500">{r.fileName}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
