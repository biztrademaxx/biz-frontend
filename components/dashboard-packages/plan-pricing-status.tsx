"use client"

import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"

export function PlanPricingStatus({ error, onRetry }: { error: string | null; onRetry: () => void }) {
  return (
    <div className="mx-auto flex min-h-64 max-w-xl flex-col items-center justify-center gap-4 px-6 py-12 text-center"
      role={error ? "alert" : "status"}>
      {error ? (
        <>
          <p className="text-sm text-red-700">{error}</p>
          <Button variant="outline" onClick={onRetry}>Try again</Button>
        </>
      ) : (
        <><Loader2 className="h-6 w-6 animate-spin text-[#004A96]" aria-hidden /><p>Loading plan prices…</p></>
      )}
    </div>
  )
}
