import { NextResponse } from "next/server"

import {
  OAUTH_INTENDED_ROLE_COOKIE,
  OAUTH_INTENDED_ROLES,
  type OAuthIntendedPrismaRole,
} from "@/lib/oauth-signup-intent"

/** Route must run per-request so Set-Cookie is not cached. */
export const dynamic = "force-dynamic"

function cookieBaseOptions() {
  const url = process.env.NEXTAUTH_URL ?? process.env.VERCEL_URL ?? ""
  const https =
    url.startsWith("https://") ||
    process.env.NODE_ENV === "production" ||
    process.env.VERCEL === "1"
  return {
    path: "/" as const,
    maxAge: 600,
    httpOnly: true as const,
    secure: https,
    sameSite: (https ? "none" : "lax") as "none" | "lax",
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => ({}))) as { role?: string }
    const upper = String(body.role ?? "")
      .trim()
      .toUpperCase()
    const safe: OAuthIntendedPrismaRole = (
      OAUTH_INTENDED_ROLES as readonly string[]
    ).includes(upper)
      ? (upper as OAuthIntendedPrismaRole)
      : "ATTENDEE"

    const res = NextResponse.json({ ok: true })
    res.cookies.set(OAUTH_INTENDED_ROLE_COOKIE, safe, cookieBaseOptions())
    return res
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}

export async function DELETE() {
  try {
    const res = NextResponse.json({ ok: true })
    res.cookies.delete(OAUTH_INTENDED_ROLE_COOKIE)
    return res
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
