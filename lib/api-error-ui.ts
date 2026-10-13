import { getBackendApiBaseUrl } from "@/lib/api"

export type PublicApiErrorKind = "network" | "not_found" | "generic"

export function classifyPublicApiError(err: unknown): PublicApiErrorKind {
  if (err && typeof err === "object") {
    const e = err as { status?: number; message?: string; cause?: unknown }
    if (e.status === 404) return "not_found"
    const msg = String(e.message ?? "")
    if (/network error/i.test(msg) || /failed to fetch/i.test(msg)) return "network"
    if (e.cause instanceof TypeError) return "network"
  }
  if (err instanceof TypeError && /fetch/i.test(err.message)) return "network"
  return "generic"
}

export function publicApiErrorCopy(kind: PublicApiErrorKind): {
  title: string
  description: string
  hint?: string
} {
  const apiBase = getBackendApiBaseUrl()

  switch (kind) {
    case "network":
      return {
        title: "We can’t reach the server right now",
        description:
          "The app couldn’t connect to the API. Your internet may be fine — the backend service might be stopped or on a different port.",
        hint: `Expected API: ${apiBase}. Start it with npm run dev in biz-backend, then refresh this page.`,
      }
    case "not_found":
      return {
        title: "Organizer not found",
        description:
          "This profile doesn’t exist or isn’t available on the public directory yet.",
      }
    default:
      return {
        title: "Something went wrong",
        description: "We couldn’t load this page. Please try again in a moment.",
      }
  }
}
