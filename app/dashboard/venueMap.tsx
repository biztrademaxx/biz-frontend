"use client"

import { ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"

interface VenueMapProps {
  title?: string
  mapUrl: string // Google Maps embed URL
  fullUrl?: string // Optional full view link
}

export default function VenueMap({ title = "Venue Map", mapUrl, fullUrl }: VenueMapProps) {
  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-lg font-semibold">{title}</h2>
        {fullUrl && (
          <Button
            asChild
            variant="outline" // ✅ makes it look like a proper button
            size="sm"
            className="flex items-center gap-1"
          >
            <a href={fullUrl} target="_blank" rel="noopener noreferrer">
              Full View <ExternalLink size={14} />
            </a>
          </Button>
        )}
      </div>

      {/* Map */}
      <div className="w-full h-[400px] border overflow-hidden rounded-lg shadow">
        <iframe
          src={mapUrl}
          width="100%"
          height="100%"
          style={{ border: 0 }}
          loading="lazy"
          allowFullScreen
          referrerPolicy="no-referrer-when-downgrade"
        ></iframe>
      </div>
    </div>
  )
}
