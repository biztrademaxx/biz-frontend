import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth-options"
import { proxyGetToBackend, proxyPostJsonToBackend } from "@/lib/proxy-backend-request"

interface Params {
  id: string
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<Params> },
) {
  try {
    const { id } = await params
    if (!id || id === "undefined") {
      return NextResponse.json({ error: "Invalid event ID" }, { status: 400 })
    }

    const upstream = await proxyGetToBackend(request, `/api/events/${id}/promotions`)
    const text = await upstream.text()
    return new NextResponse(text, {
      status: upstream.status,
      headers: {
        "content-type": upstream.headers.get("content-type") || "application/json",
      },
    })
  } catch (error) {
    console.error("Error proxying event promotions GET:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 502 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<Params> },
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    if (!id || id === "undefined") {
      return NextResponse.json({ error: "Invalid event ID" }, { status: 400 })
    }

    const body = await request.json()
    const upstream = await proxyPostJsonToBackend(request, `/api/events/${id}/promotions`, body)
    const text = await upstream.text()
    return new NextResponse(text, {
      status: upstream.status,
      headers: {
        "content-type": upstream.headers.get("content-type") || "application/json",
      },
    })
  } catch (error) {
    console.error("Error proxying event promotions POST:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 502 })
  }
}
