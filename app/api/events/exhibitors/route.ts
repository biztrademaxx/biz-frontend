import { type NextRequest, NextResponse } from "next/server"
import { proxyJson } from "@/lib/backend-proxy"

// All exhibitor booth logic has moved to the backend.
// This route now simply proxies to the Express API.

export async function POST(request: NextRequest) {
  // Forward body and headers to backend POST /api/events/exhibitors
  return proxyJson(request as unknown as Request, "/api/events/exhibitors", {
    method: "POST",
  })
}

export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  const eventId = url.searchParams.get("eventId")
  const organizerId = url.searchParams.get("organizerId")

  if (!eventId && !organizerId) {
    return NextResponse.json({ error: "eventId or organizerId is required" }, { status: 400 })
  }

  // If eventId is provided, proxy to backend /api/events/:id/exhibitors
  if (eventId) {
    return proxyJson(request as unknown as Request, `/api/events/${eventId}/exhibitors`, {
      method: "GET",
    })
  }

  // If organizerId is provided and you later add a backend organizer exhibitors endpoint,
  // you can proxy to it here. For now, just return empty list instead of crashing.
  return NextResponse.json({ booths: [] }, { status: 200 })
}

