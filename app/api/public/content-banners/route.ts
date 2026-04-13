import { NextRequest, NextResponse } from "next/server"

/**
 * Same-origin proxy for public banners so the browser never calls the backend directly
 * (avoids CORS / env mismatches on /event sidebar ads).
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const page = searchParams.get("page") ?? "events"
  const position = searchParams.get("position") ?? "sidebar"
  const backend = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000").replace(/\/$/, "")
  const qs = new URLSearchParams({ page, position })

  try {
    const res = await fetch(`${backend}/api/content/banners?${qs}`, {
      cache: "no-store",
      headers: { Accept: "application/json" },
    })
    if (!res.ok) {
      return NextResponse.json([])
    }
    const data = await res.json()
    return NextResponse.json(Array.isArray(data) ? data : [])
  } catch {
    return NextResponse.json([])
  }
}
