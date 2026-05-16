"use client"

import type React from "react"

import { OAuthBackendSessionBridge } from "@/components/oauth-backend-session-bridge"
import { ThemeProvider } from "@/components/theme-provider"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <OAuthBackendSessionBridge />
      {children}
    </ThemeProvider>
  )
}
