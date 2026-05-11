/** Cookie set by signup UI before Google/LinkedIn redirect; read in NextAuth `signIn` (server). */
export const OAUTH_INTENDED_ROLE_COOKIE = "oauth_intended_role" as const

export const OAUTH_INTENDED_ROLES = [
  "ATTENDEE",
  "EXHIBITOR",
  "SPEAKER",
  "VENUE_MANAGER",
  "ORGANIZER",
] as const

export type OAuthIntendedPrismaRole = (typeof OAUTH_INTENDED_ROLES)[number]

export function mapSignupTabToPrismaRole(userType: string): OAuthIntendedPrismaRole {
  const m: Record<string, OAuthIntendedPrismaRole> = {
    visitor: "ATTENDEE",
    exhibitor: "EXHIBITOR",
    speaker: "SPEAKER",
    venue: "VENUE_MANAGER",
    organiser: "ORGANIZER",
  }
  return m[userType] ?? "ATTENDEE"
}

/** Call immediately before `signIn("google" | "linkedin", ...)`. */
export function setOAuthSignupIntentRole(role: string): void {
  if (typeof document === "undefined") return
  const upper = role.toUpperCase()
  const safe = (OAUTH_INTENDED_ROLES as readonly string[]).includes(upper)
    ? upper
    : "ATTENDEE"
  const secure = window.location.protocol === "https:" ? "; Secure" : ""
  document.cookie = `${OAUTH_INTENDED_ROLE_COOKIE}=${encodeURIComponent(safe)}; Path=/; Max-Age=600; SameSite=Lax${secure}`
}

/**
 * Sets HttpOnly + SameSite=None (on HTTPS) cookie via Route Handler so LinkedIn
 * OAuth return always sends the intended role (client-only cookies can be dropped).
 */
export async function postOAuthSignupIntentRole(role: string): Promise<void> {
  const upper = role.toUpperCase()
  const safe = (OAUTH_INTENDED_ROLES as readonly string[]).includes(upper)
    ? upper
    : "ATTENDEE"
  const res = await fetch("/api/auth/oauth-signup-intent", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ role: safe }),
    credentials: "same-origin",
    cache: "no-store",
  })
  if (!res.ok) {
    const text = await res.text().catch(() => "")
    throw new Error(
      text || `Could not save signup role before OAuth (${res.status}). Try again.`
    )
  }
}

export function clearOAuthSignupIntentRole(): void {
  if (typeof document === "undefined") return
  document.cookie = `${OAUTH_INTENDED_ROLE_COOKIE}=; Path=/; Max-Age=0`
}

/** Clears HttpOnly intent cookie (call from login page on mount). */
export async function clearOAuthSignupIntentRoleServer(): Promise<void> {
  await fetch("/api/auth/oauth-signup-intent", {
    method: "DELETE",
    credentials: "same-origin",
  })
}
