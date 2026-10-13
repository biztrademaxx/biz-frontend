import { NextResponse } from "next/server"
import { proxyGetToBackend } from "@/lib/proxy-backend-request"

export async function GET(request: Request) {
  try {
    const upstream = await proxyGetToBackend(request, "/api/promotion-packages/audience-stats")
    const text = await upstream.text()
    return new NextResponse(text, {
      status: upstream.status,
      headers: {
        "content-type": upstream.headers.get("content-type") || "application/json",
      },
    })
  } catch (error) {
    console.error("Error proxying promotion audience stats:", error)
    return NextResponse.json({ error: "Failed to fetch audience stats" }, { status: 502 })
  }
}
