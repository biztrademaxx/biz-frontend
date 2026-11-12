import { NextResponse } from "next/server"
import { proxyJson } from "@/lib/backend-proxy"

type Context = { params: Promise<{ id: string }> }

export async function GET(request: Request, { params }: Context) {
  const { id } = await params
  return proxyJson(request, `/api/organizers/${encodeURIComponent(id)}/events`, { method: "GET" })
}

export async function POST(request: Request, { params }: Context) {
  const { id } = await params
  return proxyJson(request, `/api/organizers/${encodeURIComponent(id)}/events`, { method: "POST" })
}

export async function PUT(request: Request, { params }: Context) {
  const { id } = await params
  const { eventId, ...body } = await request.json()
  if (typeof eventId !== "string" || !eventId.trim()) {
    return NextResponse.json({ error: "Event ID is required" }, { status: 400 })
  }
  return proxyJson(request, `/api/organizers/${encodeURIComponent(id)}/events/${encodeURIComponent(eventId)}`, {
    method: "PUT", body: JSON.stringify(body),
  })
}

export async function DELETE(request: Request, { params }: Context) {
  const { id } = await params
  const url = new URL(request.url)
  const body = await request.json().catch(() => ({}))
  const eventId = url.searchParams.get("eventId") ?? body.eventId
  if (typeof eventId !== "string" || !eventId.trim()) {
    return NextResponse.json({ error: "Event ID is required" }, { status: 400 })
  }
  return proxyJson(request, `/api/organizers/${encodeURIComponent(id)}/events/${encodeURIComponent(eventId)}`, { method: "DELETE" })
}
