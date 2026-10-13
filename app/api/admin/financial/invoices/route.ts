import { NextResponse } from "next/server"
import { proxyGetToBackend } from "@/lib/proxy-backend-request"

export const runtime = "nodejs"

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const upstream = await proxyGetToBackend(req, `/api/admin/financial/invoices${url.search}`)
    const text = await upstream.text()
    return new NextResponse(text, {
      status: upstream.status,
      headers: { "content-type": upstream.headers.get("content-type") || "application/json" },
    })
  } catch (error) {
    console.error("admin/financial/invoices proxy error:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch invoices" }, { status: 502 })
  }
}
