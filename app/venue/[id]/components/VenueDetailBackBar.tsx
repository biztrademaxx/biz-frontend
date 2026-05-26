"use client"

import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime"

type VenueDetailBackBarProps = {
  router: AppRouterInstance
}

export function VenueDetailBackBar({ router }: VenueDetailBackBarProps) {
  return (
    <div className="border-b bg-white">
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/venues")}
          className="flex items-center gap-2 px-2 sm:px-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Venues
        </Button>
      </div>
    </div>
  )
}
