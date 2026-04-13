import { type NextRequest } from "next/server"
import { proxyJson } from "@/lib/backend-proxy"

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  if (!id || id === "undefined") {
    return proxyJson(
      new Request(req.url, { method: "GET" }),
      `/api/venues/invalid-id/events`,
      { method: "GET" },
    )
  }
  return proxyJson(req, `/api/venues/${id}/events`, { method: "GET" })
}