"use client"

import type React from "react"

import { OAuthBackendSessionBridge } from "@/components/oauth-backend-session-bridge"
import { ThemeProvider } from "@/components/theme-provider"
import { HomeLocationProvider } from "@/contexts/home-location-context"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <HomeLocationProvider>
        <OAuthBackendSessionBridge />
        {children}
      </HomeLocationProvider>
    </ThemeProvider>
  )
}
