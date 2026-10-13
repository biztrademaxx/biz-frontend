import { NextRequest, NextResponse } from "next/server"
import { proxyGetToBackend } from "@/lib/proxy-backend-request"

interface Params {
  promotionId: string
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<Params> },
) {
  try {
    const { promotionId } = await params
    const { searchParams } = new URL(request.url)
    const qs = searchParams.toString()
    const path = `/api/promotions/${promotionId}/marketing-reports${qs ? `?${qs}` : ""}`
    const upstream = await proxyGetToBackend(request, path)
    const text = await upstream.text()
    return new NextResponse(text, {
      status: upstream.status,
      headers: { "content-type": upstream.headers.get("content-type") || "application/json" },
    })
  } catch (error) {
    console.error("Proxy marketing reports GET:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 502 })
  }
}
