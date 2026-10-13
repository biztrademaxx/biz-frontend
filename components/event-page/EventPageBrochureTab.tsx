"use client"

import { Download, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { brochureFriendlyFilename, getGoogleDocsViewerUrl } from "@/lib/utils"

type Props = {
  event: any
  brochureUrl: string
  useGoogleViewer: boolean
  brochureDownloading: boolean
  onBrochureDownload: () => void
}

export function EventPageBrochureTab({
  event,
  brochureUrl,
  useGoogleViewer,
  brochureDownloading,
  onBrochureDownload,
}: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Brochure</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {event?.brochure ? (
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Preview (Google Docs Viewer). Use <span className="font-medium">Download</span> for a file with the
                correct extension.
              </p>
              <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
                <iframe
                  title="Event brochure"
                  src={useGoogleViewer ? getGoogleDocsViewerUrl(brochureUrl) : brochureUrl}
                  className="h-[min(70vh,640px)] w-full min-h-[480px] border-0"
                  loading="lazy"
                />
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <Button
                  type="button"
                  className="gap-2 bg-[#FF131C] hover:bg-red-700"
                  disabled={brochureDownloading}
                  onClick={onBrochureDownload}
                >
                  <Download className="h-4 w-4 shrink-0" />
                  {brochureDownloading ? "Downloading…" : "Download"}
                </Button>
                <Button variant="outline" asChild className="gap-2">
                  <a href={brochureUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4 shrink-0" />
                    Open file URL
                  </a>
                </Button>
              </div>
              <p
                className="truncate text-xs text-gray-500"
                title={brochureFriendlyFilename(brochureUrl, event.title ? `${event.title} brochure` : undefined)}
              >
                Save as: {brochureFriendlyFilename(brochureUrl, event.title ? `${event.title} brochure` : undefined)}
              </p>
            </div>
          ) : (
            <div className="bg-gray-100 h-96 rounded-lg flex flex-col items-center justify-center">
              <p className="text-gray-600 mb-4">No brochure available</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
