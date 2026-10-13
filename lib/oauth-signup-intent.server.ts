import { cookies } from "next/headers"

import {
  OAUTH_INTENDED_ROLE_COOKIE,
  OAUTH_INTENDED_ROLES,
  type OAuthIntendedPrismaRole,
} from "@/lib/oauth-signup-intent"

export async function readOAuthIntendedRoleServer(): Promise<OAuthIntendedPrismaRole | undefined> {
  try {
    const raw = (await cookies()).get(OAUTH_INTENDED_ROLE_COOKIE)?.value
    if (!raw) return undefined
    const upper = decodeURIComponent(raw).toUpperCase()
    if ((OAUTH_INTENDED_ROLES as readonly string[]).includes(upper)) {
      return upper as OAuthIntendedPrismaRole
    }
    return undefined
  } catch {
    return undefined
  }
}
