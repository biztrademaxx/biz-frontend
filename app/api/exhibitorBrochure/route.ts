import { NextResponse } from "next/server"
import { getBackendApiBaseUrl } from "@/lib/api"

/**
 * Legacy exhibitor product/brochure upload — proxies to Express (authenticated).
 * Prefer /api/upload/cloudinary (images) or /api/upload/brochure (PDFs).
 */
export async function POST(request: Request) {
  try {
    const auth = request.headers.get("authorization")
    if (!auth?.trim()) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await request.formData()
    const type = formData.get("type")
    const backendPath =
      type === "image" ? "/api/upload/cloudinary" : "/api/upload/brochure"

    const forward = new FormData()
    for (const [key, value] of formData.entries()) {
      if (key === "type") continue
      forward.append(key, value)
    }

    const upstream = await fetch(`${getBackendApiBaseUrl()}${backendPath}`, {
      method: "POST",
      headers: { Authorization: auth },
      body: forward,
      cache: "no-store",
    })

    const raw = await upstream.text()
    let data: Record<string, unknown> = {}
    if (raw.trim()) {
      try {
        data = JSON.parse(raw)
      } catch {
        data = { error: raw.trim().slice(0, 500) }
      }
    }

    if (!upstream.ok) {
      return NextResponse.json(
        {
          error: (data.message as string) || (data.error as string) || "Upload failed",
          ...data,
        },
        { status: upstream.status },
      )
    }

    return NextResponse.json({
      success: true,
      url: data.url,
      publicId: data.publicId,
    })
  } catch (error) {
    console.error("Exhibitor brochure upload proxy error:", error)
    return NextResponse.json(
      {
        error: "Upload failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
