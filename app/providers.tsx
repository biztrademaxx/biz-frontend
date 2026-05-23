"use client"

import type React from "react"

import { OAuthBackendSessionBridge } from "@/components/oauth-backend-session-bridge"
import { ThemeProvider } from "@/components/theme-provider"
import { HomeLocationProvider } from "@/contexts/home-location-context"
import type { HomeLocationClientSeed } from "@/lib/home-location-seed"

export function Providers({
  children,
  locationSeed,
}: {
  children: React.ReactNode
  locationSeed?: HomeLocationClientSeed
}) {
  return (
    <ThemeProvider>
      <HomeLocationProvider seed={locationSeed}>
        <OAuthBackendSessionBridge />
        {children}
      </HomeLocationProvider>
    </ThemeProvider>
  )
}
