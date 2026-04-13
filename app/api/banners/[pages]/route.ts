import { type NextRequest, NextResponse } from "next/server"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"

function isParamsPromise(
  p: Promise<{ pages: string }> | { pages: string },
): p is Promise<{ pages: string }> {
  return typeof (p as Promise<{ pages: string }>)?.then === "function"
}

/**
 * GET /api/banners/:pages → proxies to Express GET /api/content/banners?page=:pages
 * (e.g. /api/banners/events → public banners for hero on the events page).
 */
export async function GET(
  request: NextRequest,
  ctx: { params: Promise<{ pages: string }> | { pages: string } },
) {
  try {
    const params = isParamsPromise(ctx.params) ? await ctx.params : ctx.params
    const page = params.pages

    const q = new URL(request.url).searchParams
    const search = new URLSearchParams(q)
    if (page) search.set("page", page)

    const target = `${API_BASE_URL}/api/content/banners${search.toString() ? `?${search.toString()}` : ""}`

    const res = await fetch(target, {
      method: "GET",
      cache: "no-store",
    })

    const data = await res.json().catch(() => [])
    const list = Array.isArray(data) ? data : []
    return NextResponse.json(list, { status: res.ok ? 200 : res.status })
  } catch (error) {
    console.error("[banners] proxy error:", error)
    return NextResponse.json([], { status: 200 })
  }
}
