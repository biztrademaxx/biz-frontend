"use client"

import { memo } from "react"

function FeaturedOrganizersSectionHeadingComponent() {
  return (
    <div className="border-b border-gray-200 py-6">
      <h2 className="home-tt-h2 mb-3">
        Featured Organizers
        <br />
        <span className="home-tt-sub">Worldwide Organizers</span>
      </h2>
    </div>
  )
}

export const FeaturedOrganizersSectionHeading = memo(FeaturedOrganizersSectionHeadingComponent)
