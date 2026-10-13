"use client"

import { AppImage } from "@/components/app-image"
import { useCallback, useEffect, useState } from "react"
import type { Event } from "./listing-types"
import { verifiedBadgeSrc } from "./listing-utils"

/** Verified listing mark: custom badge URL or default `/images/VerifiedBadge.png`; text fallback if image fails. */
export function EventListingVerifiedBadge({
  event,
  className = "",
}: {
  event: Event
  className?: string
}) {
  const [imgFailed, setImgFailed] = useState(false)
  const src = verifiedBadgeSrc(event)

  useEffect(() => {
    setImgFailed(false)
  }, [event.id, src])

  const onImgError = useCallback(() => {
    setImgFailed(true)
  }, [])

  if (!event.isVerified) return null

  const showImg = src && !imgFailed

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md px-2 py-1 ${className}`}
      title="Verified event"
    >
      {showImg ? (
        <>
        <AppImage
          src={src}
          alt="Verified"
          width={80}
          height={24}
          className="h-6 max-h-6 w-auto max-w-[80px] object-contain object-left"
          onError={onImgError}
        />
        <span className="text-sm font-semibold text-emerald-700">verified</span>
        </>
      ) : (
        <span className="text-[11px] font-bold leading-none text-emerald-800 sm:text-xs">Verified</span>
      )}
    </span>
  )
}
