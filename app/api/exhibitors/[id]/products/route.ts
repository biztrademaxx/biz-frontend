import { NextResponse } from "next/server"
import { proxyJson } from "@/lib/backend-proxy"

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    return await proxyJson(req, `/api/exhibitors/${encodeURIComponent(id)}/products`)
  } catch (err) {
    console.error("Proxy GET /api/exhibitors/[id]/products failed:", err)
    return NextResponse.json(
      { error: "Failed to fetch products", products: [] },
      { status: 500 },
    )
  }
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    return await proxyJson(req, `/api/exhibitors/${encodeURIComponent(id)}/products`, { method: "POST" })
  } catch (err) {
    console.error("Proxy POST /api/exhibitors/[id]/products failed:", err)
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 })
  }
}
