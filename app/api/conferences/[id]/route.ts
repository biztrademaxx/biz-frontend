import { type NextRequest, NextResponse } from "next/server"
import { proxyJson } from "@/lib/backend-proxy"

type Params = Promise<{ id: string }>

// Proxy conference by ID to backend.
export async function GET(
  request: NextRequest,
  { params }: { params: Params },
) {
  try {
    const { id } = await params
    return await proxyJson(request as unknown as Request, `/api/conferences/${id}`)
  } catch (err) {
    console.error("Proxy GET /api/conferences/[id] failed:", err)
    return NextResponse.json(
      { error: "Failed to fetch conference" },
      { status: 500 },
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Params },
) {
  try {
    const { id } = await params
    return await proxyJson(request as unknown as Request, `/api/conferences/${id}`, {
      method: "PUT",
    })
  } catch (err) {
    console.error("Proxy PUT /api/conferences/[id] failed:", err)
    return NextResponse.json(
      { error: "Failed to update conference" },
      { status: 500 },
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Params },
) {
  try {
    const { id } = await params
    return await proxyJson(request as unknown as Request, `/api/conferences/${id}`, {
      method: "DELETE",
    })
  } catch (err) {
    console.error("Proxy DELETE /api/conferences/[id] failed:", err)
    return NextResponse.json(
      { error: "Failed to delete conference" },
      { status: 500 },
    )
  }
}
