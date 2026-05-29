"use client"

import NextImage, { type ImageProps } from "next/image"
import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

/** Remote / absolute URLs use unoptimized to avoid optimizer host restrictions. */
export function isRemoteImageSrc(src: string | null | undefined): boolean {
  return /^https?:\/\//i.test(String(src ?? "").trim())
}

export type AppImageProps = Omit<ImageProps, "src" | "alt"> & {
  src: string | null | undefined
  alt: string
  /** Shown when the primary `src` fails to load */
  fallbackSrc?: string
}

/**
 * Next.js `Image` with optional fallback and automatic `unoptimized` for remote URLs.
 */
export function AppImage({
  src,
  alt,
  fallbackSrc,
  className,
  unoptimized,
  onError,
  ...props
}: AppImageProps) {
  const [currentSrc, setCurrentSrc] = useState(src)

  useEffect(() => {
    setCurrentSrc(src)
  }, [src])

  const safeSrc = String(currentSrc ?? "").trim()
  const resolvedUnoptimized = unoptimized ?? isRemoteImageSrc(safeSrc)

  if (!safeSrc) {
    const isFill = "fill" in props && props.fill
    return (
      <div
        className={cn(
          isFill && "absolute inset-0",
          "bg-gradient-to-br from-slate-100 to-slate-200",
          className,
        )}
        aria-label={alt}
        role="img"
      />
    )
  }

  return (
    <NextImage
      src={safeSrc}
      alt={alt}
      className={className}
      unoptimized={resolvedUnoptimized}
      onError={(e) => {
        if (fallbackSrc && currentSrc !== fallbackSrc) {
          setCurrentSrc(fallbackSrc)
        }
        onError?.(e)
      }}
      {...props}
    />
  )
}
