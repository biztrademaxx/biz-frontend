import { NextRequest, NextResponse } from "next/server"
import { proxyGetToBackend } from "@/lib/proxy-backend-request"
import { getBackendApiBaseUrl } from "@/lib/api"

interface Params {
  promotionId: string
}

function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<Params> },
) {
  try {
    const auth = request.headers.get("authorization")
    if (!auth?.trim()) return unauthorized()

    const { promotionId } = await params
    const { searchParams } = new URL(request.url)
    const qs = searchParams.toString()
    const path = `/api/admin/promotions/${promotionId}/marketing-reports${qs ? `?${qs}` : ""}`
    const upstream = await proxyGetToBackend(request, path)
    const text = await upstream.text()
    return new NextResponse(text, {
      status: upstream.status,
      headers: { "content-type": upstream.headers.get("content-type") || "application/json" },
    })
  } catch (error) {
    console.error("Proxy admin marketing reports GET:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 502 })
  }
}

/** Multipart proxy → Express (forwards Authorization + form fields). */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<Params> },
) {
  try {
    const auth = request.headers.get("authorization")
    if (!auth?.trim()) return unauthorized()

    const { promotionId } = await params
    const formData = await request.formData()
    const url = `${getBackendApiBaseUrl()}/api/admin/promotions/${promotionId}/marketing-reports`
    const upstream = await fetch(url, {
      method: "POST",
      headers: { Authorization: auth },
      body: formData,
      cache: "no-store",
    })

    const text = await upstream.text()
    return new NextResponse(text, {
      status: upstream.status,
      headers: { "content-type": upstream.headers.get("content-type") || "application/json" },
    })
  } catch (error) {
    console.error("Proxy admin marketing reports POST:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 502 })
  }
}
