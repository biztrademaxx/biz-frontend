"use client"

import type React from "react"

// import { Analytics } from "@vercel/analytics/next"
import { Providers } from "./providers"
import { Suspense } from "react"
import AppSuspenseFallback from "@/components/AppSuspenseFallback"

export function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Suspense fallback={<AppSuspenseFallback />}>
        <Providers>{children}</Providers>
      </Suspense>
      {/* <Analytics /> */}
    </>
  )
}
