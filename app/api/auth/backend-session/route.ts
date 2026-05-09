import { getServerSession } from "next-auth"
import { NextResponse } from "next/server"

import { authOptions } from "@/lib/auth-options"
import { getBackendApiBaseUrl } from "@/lib/api"

/**
 * After NextAuth OAuth sign-in, the browser may have a session cookie but no backend JWT
 * in localStorage (used by apiFetch). This route verifies the NextAuth session and returns
 * backend tokens from the same oauth-sync path used at login.
 */
export async function POST() {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  const email = session.user.email?.trim()
  if (!email) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  const secret = process.env.OAUTH_SYNC_SECRET
  if (!secret) {
    return NextResponse.json(
      { message: "OAUTH_SYNC_SECRET is not configured" },
      { status: 503 }
    )
  }

  const origin = getBackendApiBaseUrl()
  const res = await fetch(`${origin}/api/auth/oauth-sync`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-OAuth-Sync-Secret": secret,
    },
    body: JSON.stringify({
      email,
      name: session.user.name,
      image: session.user.image,
      provider: "nextauth-session",
    }),
  })

  if (!res.ok) {
    const text = await res.text().catch(() => "")
    return NextResponse.json(
      { message: text || "Backend sync failed" },
      { status: res.status }
    )
  }

  const data = (await res.json()) as {
    accessToken: string
    refreshToken: string
    user: unknown
  }

  return NextResponse.json({
    accessToken: data.accessToken,
    refreshToken: data.refreshToken,
    user: data.user,
  })
}
