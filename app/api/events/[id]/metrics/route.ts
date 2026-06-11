import { NextRequest, NextResponse } from "next/server"
import { getBackendApiBaseUrl } from "@/lib/api"

interface Params {
  id: string
}

/** Public beacon — forwards click/impression to Express (no auth). */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<Params> },
) {
  try {
    const { id } = await params
    if (!id || id === "undefined") {
      return NextResponse.json({ error: "Invalid event ID" }, { status: 400 })
    }

    const body = await request.json()
    const url = `${getBackendApiBaseUrl()}/api/events/${encodeURIComponent(id)}/metrics`
    const upstream = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body ?? {}),
      cache: "no-store",
    })

    const text = await upstream.text()
    return new NextResponse(text, {
      status: upstream.status,
      headers: {
        "content-type": upstream.headers.get("content-type") || "application/json",
      },
    })
  } catch (error) {
    console.error("Error proxying event metrics POST:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 502 })
  }
}
