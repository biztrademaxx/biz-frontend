"use client"

import { Button } from "@/components/ui/button"
import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime"

type VenueNotFoundProps = {
  error: string | null
  router: AppRouterInstance
}

export function VenueNotFound({ error, router }: VenueNotFoundProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="mb-2 text-2xl font-bold text-gray-900">Venue Not Found</h1>
        <p className="mb-4 text-gray-600">{error || "The venue you're looking for doesn't exist."}</p>
        <Button onClick={() => router.push("/venues")}>Back to Venues</Button>
      </div>
    </div>
  )
}
