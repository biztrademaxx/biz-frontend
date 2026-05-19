"use client"

import { memo } from "react"

function FeaturedOrganizersSectionHeadingComponent({ homeCity }: { homeCity?: string | null }) {
  const subtitle = homeCity ? `Organizers in ${homeCity}` : "Worldwide Organizers"
  return (
    <div className="border-b border-gray-200 py-6">
      <h2 className="home-tt-h2 mb-3">
        Featured Organizers
        <br />
        <span className="home-tt-sub">{subtitle}</span>
      </h2>
    </div>
  )
}

export const FeaturedOrganizersSectionHeading = memo(FeaturedOrganizersSectionHeadingComponent)
