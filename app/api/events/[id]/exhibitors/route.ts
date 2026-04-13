import { type NextRequest } from "next/server"
import { proxyJson } from "@/lib/backend-proxy"

// All exhibitor logic runs on the backend. This route proxies to the Express API.

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: eventId } = await params
  if (!eventId) {
    return Response.json(
      { success: false, error: "Event ID is required" },
      { status: 400 }
    )
  }
  return proxyJson(req as unknown as Request, `/api/events/${eventId}/exhibitors`, {
    method: "GET",
  })
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: eventId } = await params
  if (!eventId) {
    return Response.json(
      { success: false, error: "Event ID is required" },
      { status: 400 }
    )
  }
  return proxyJson(req as unknown as Request, `/api/events/${eventId}/exhibitors`, {
    method: "POST",
  })
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: eventId } = await params
  if (!eventId) {
    return Response.json(
      { success: false, error: "Event ID is required" },
      { status: 400 }
    )
  }
  return proxyJson(req as unknown as Request, `/api/events/${eventId}/exhibitors`, {
    method: "PUT",
  })
}
