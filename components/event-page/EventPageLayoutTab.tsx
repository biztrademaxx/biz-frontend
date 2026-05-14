"use client"

import { ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getGoogleDocsViewerUrl } from "@/lib/utils"

type Props = {
  layoutPlanUrl: string
  isLayoutImage: boolean
  isLayoutPdf: boolean
  useGoogleLayoutViewer: boolean
}

export function EventPageLayoutTab({ layoutPlanUrl, isLayoutImage, isLayoutPdf, useGoogleLayoutViewer }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Layout Plan</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="bg-gray-100 h-96 rounded-lg flex items-center justify-center overflow-hidden">
          {layoutPlanUrl ? (
            isLayoutImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={layoutPlanUrl}
                alt="Event Layout Plan"
                className="h-full w-full object-contain rounded-lg"
                loading="lazy"
              />
            ) : isLayoutPdf ? (
              <iframe
                title="Event Layout Plan"
                src={useGoogleLayoutViewer ? getGoogleDocsViewerUrl(layoutPlanUrl) : layoutPlanUrl}
                className="h-full w-full border-0 bg-white"
                loading="lazy"
              />
            ) : (
              <div className="text-center">
                <p className="text-gray-500 mb-4">Layout plan available</p>
                <Button variant="outline" asChild>
                  <a href={layoutPlanUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4 shrink-0" />
                    Open Layout Plan
                  </a>
                </Button>
              </div>
            )
          ) : (
            <div className="text-center">
              <p className="text-gray-500 mb-4">Floor plan will be displayed here</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
