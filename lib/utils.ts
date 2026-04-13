import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * For Cloudinary raw PDF URLs, add fl_attachment so the file is delivered with
 * Content-Disposition: attachment. This can fix "Failed to load PDF" when the
 * account has restricted inline display. Returns the same URL if not Cloudinary raw.
 */
export function getBrochureDownloadUrl(url: string): string {
  if (!url || typeof url !== "string") return url
  try {
    const u = url.trim()
    const match = u.match(/^(https:\/\/res\.cloudinary\.com\/[^/]+\/raw\/upload)\/(v\d+\/.*)$/)
    if (match) {
      const [, base, path] = match
      return `${base}/fl_attachment/${path}`
    }
  } catch {
    // ignore
  }
  return url
}
