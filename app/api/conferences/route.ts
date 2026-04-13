import { type NextRequest, NextResponse } from "next/server"
import { proxyJson } from "@/lib/backend-proxy"

// Conference agenda is stored on the backend (PostgreSQL).
// Proxy GET/POST to backend so eventId and conference IDs match.
export async function GET(request: NextRequest) {
  try {
    return await proxyJson(request as unknown as Request, "/api/conferences")
  } catch (err) {
    console.error("Proxy GET /api/conferences failed:", err)
    return NextResponse.json(
      { error: "Failed to fetch conferences" },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    return await proxyJson(request as unknown as Request, "/api/conferences", {
      method: "POST",
    })
  } catch (err) {
    console.error("Proxy POST /api/conferences failed:", err)
    return NextResponse.json(
      { error: "Failed to create conference" },
      { status: 500 },
    )
  }
}
