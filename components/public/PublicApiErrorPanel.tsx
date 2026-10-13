"use client"

import Link from "next/link"
import type { LucideIcon } from "lucide-react"
import { AlertCircle, RefreshCw, ServerCrash, UserX, WifiOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  classifyPublicApiError,
  publicApiErrorCopy,
  type PublicApiErrorKind,
} from "@/lib/api-error-ui"

const ICONS: Record<PublicApiErrorKind, LucideIcon> = {
  network: WifiOff,
  not_found: UserX,
  generic: AlertCircle,
}

type PublicApiErrorPanelProps = {
  error: unknown
  /** Override kind when you already know it (e.g. empty 404 body). */
  kind?: PublicApiErrorKind
  backHref?: string
  backLabel?: string
  onRetry?: () => void
  className?: string
}

export function PublicApiErrorPanel({
  error,
  kind: kindOverride,
  backHref = "/organizers",
  backLabel = "Back to organizers",
  onRetry,
  className = "",
}: PublicApiErrorPanelProps) {
  const kind = kindOverride ?? classifyPublicApiError(error)
  const copy = publicApiErrorCopy(kind)
  const Icon = kind === "network" ? ServerCrash : ICONS[kind]

  return (
    <div
      className={`mx-auto flex min-h-[min(70vh,520px)] max-w-lg flex-col items-center justify-center px-4 py-16 text-center ${className}`}
      role="alert"
    >
      <div
        className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-[#002C71]/10 ring-4 ring-[#002C71]/5"
        aria-hidden
      >
        <Icon className="h-8 w-8 text-[#002C71]" strokeWidth={1.75} />
      </div>
      <h1 className="text-xl font-semibold tracking-tight text-gray-900 sm:text-2xl">{copy.title}</h1>
      <p className="mt-3 text-sm leading-relaxed text-gray-600">{copy.description}</p>
      {copy.hint ? (
        <p className="mt-4 rounded-lg border border-amber-200/80 bg-amber-50/80 px-4 py-3 text-left text-xs leading-relaxed text-amber-950">
          {copy.hint}
        </p>
      ) : null}
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        {onRetry ? (
          <Button type="button" className="gap-2 bg-[#002C71] hover:bg-[#001f52]" onClick={onRetry}>
            <RefreshCw className="h-4 w-4" />
            Try again
          </Button>
        ) : null}
        <Button variant="outline" asChild>
          <Link href={backHref}>{backLabel}</Link>
        </Button>
      </div>
    </div>
  )
}
