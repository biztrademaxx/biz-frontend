/** Fallback when an event has no banner / gallery image (listing, trending sidebar, etc.). */
export const DEFAULT_EVENT_IMAGE = "/logo/default-user.png"

export function eventImageOrDefault(url: string | null | undefined): string {
  const t = url?.trim()
  return t ? t : DEFAULT_EVENT_IMAGE
}
