import { type NextRequest } from "next/server"
import { proxyJson } from "@/lib/backend-proxy"

// Exhibition space updates are handled by the backend.

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string; spaceId: string }> }
) {
  const { id: eventId, spaceId } = await context.params
  if (!eventId || !spaceId) {
    return Response.json({ error: "Event ID and space ID are required" }, { status: 400 })
  }
  return proxyJson(req as unknown as Request, `/api/events/${eventId}/exhibition-spaces/${spaceId}`, {
    method: "PUT",
  })
}
