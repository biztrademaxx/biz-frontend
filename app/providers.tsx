"use client"

import type React from "react"

import { OAuthBackendSessionBridge } from "@/components/oauth-backend-session-bridge"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <>
      <OAuthBackendSessionBridge />
      {children}
    </>
  )
}
