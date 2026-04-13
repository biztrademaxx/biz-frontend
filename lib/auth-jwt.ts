/**
 * Server-side only: verify backend JWT and return payload.
 * Use in API routes instead of getServerSession when using backend JWT auth.
 */
import { NextResponse } from "next/server"
import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || "dev-jwt-secret"

export type AuthPayload = {
  sub: string
  email?: string
  role?: string
  domain?: string
  permissions?: string[]
  firstName?: string
  lastName?: string
}

export function getAuthPayload(request: Request): AuthPayload | null {
  const auth = request.headers.get("authorization")
  if (!auth?.startsWith("Bearer ")) return null
  const token = auth.slice(7)
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthPayload
    return decoded
  } catch {
    return null
  }
}

/**
 * Returns 401 NextResponse if request has no valid Bearer token; otherwise returns null.
 */
export function requireAuth(request: Request): NextResponse | null {
  const payload = getAuthPayload(request)
  if (!payload?.sub) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  return null
}
