"use client"

import { createContext, useContext } from "react"

const VenueDashboardVenueUserIdContext = createContext<string | null>(null)

export function VenueDashboardVenueIdProvider({
  venueUserId,
  children,
}: {
  venueUserId: string | null
  children: React.ReactNode
}) {
  return (
    <VenueDashboardVenueUserIdContext.Provider value={venueUserId}>
      {children}
    </VenueDashboardVenueUserIdContext.Provider>
  )
}

export function useVenueDashboardVenueUserId(): string | null {
  return useContext(VenueDashboardVenueUserIdContext)
}
