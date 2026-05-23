"use client"

import NextImage, { type ImageProps } from "next/image"
import { useEffect, useState } from "react"

/** Remote / absolute URLs use unoptimized to avoid optimizer host restrictions. */
export function isRemoteImageSrc(src: string): boolean {
  return /^https?:\/\//i.test(src.trim())
}

export type AppImageProps = Omit<ImageProps, "src" | "alt"> & {
  src: string
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

  const resolvedUnoptimized = unoptimized ?? isRemoteImageSrc(currentSrc)

  return (
    <NextImage
      src={currentSrc}
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
