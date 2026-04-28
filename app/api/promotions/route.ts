import { type NextRequest, NextResponse } from "next/server"
import { proxyPostJsonToBackend } from "@/lib/proxy-backend-request"

/**
 * Exhibitor promotion creation runs on Express (Postgres). This route proxies so
 * Vercel does not need DATABASE_URL on the Next app.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const upstream = await proxyPostJsonToBackend(request, "/api/exhibitors/promotions", body)
    const text = await upstream.text()
    return new NextResponse(text, {
      status: upstream.status,
      headers: {
        "content-type": upstream.headers.get("content-type") || "application/json",
      },
    })
  } catch (error) {
    console.error("[PROMOTION_POST_PROXY]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 502 })
  }
}
