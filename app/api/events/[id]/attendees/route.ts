import { type NextRequest, NextResponse } from "next/server"
import { proxyJson } from "@/lib/backend-proxy"

// All attendee lead logic now lives in the backend (Express + Postgres).
// This Next.js route only proxies requests.

export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> | { id: string } },
) {
  const { id } = await Promise.resolve(ctx.params)
  return proxyJson(req as unknown as Request, `/api/events/${id}/leads`, { method: "GET" })
}

export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> | { id: string } },
) {
  const { id } = await Promise.resolve(ctx.params)
  return proxyJson(req as unknown as Request, `/api/events/${id}/leads`, { method: "POST" })
}

export async function PUT(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> | { id: string } },
) {
  const { id } = await Promise.resolve(ctx.params)
  return proxyJson(req as unknown as Request, `/api/events/${id}/leads`, { method: "PUT" })
}
