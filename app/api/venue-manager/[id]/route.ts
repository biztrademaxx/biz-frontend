import { type NextRequest, NextResponse } from "next/server"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"

async function proxy(
  req: NextRequest,
  backendPath: string,
  method: "GET" | "PUT" | "POST",
) {
  try {
    const body =
      method === "GET"
        ? undefined
        : await req
            .json()
            .catch(() => undefined)

    const res = await fetch(`${API_BASE_URL}${backendPath}`, {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      body: body ? JSON.stringify(body) : undefined,
    })

    const data = await res.json().catch(() => ({}))
    return NextResponse.json(data, { status: res.status })
  } catch (error) {
    console.error(`Error proxying venue-manager ${method}:`, error)
    return NextResponse.json(
      { success: false, error: "Internal venue error" },
      { status: 500 },
    )
  }
}

// GET /api/venue-manager/[id]
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  if (!id || id === "undefined") {
    return NextResponse.json({ success: false, error: "Invalid venue manager ID" }, { status: 400 })
  }
  return proxy(req, `/api/venue-manager/${id}`, "GET")
}

// PUT /api/venue-manager/[id]
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  if (!id || id === "undefined") {
    return NextResponse.json({ success: false, error: "Invalid venue manager ID" }, { status: 400 })
  }
  return proxy(req, `/api/venue-manager/${id}`, "PUT")
}

// POST /api/venue-manager/[id] – create venue manager for organizer
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  if (!id || id === "undefined") {
    return NextResponse.json({ success: false, error: "Invalid organizer ID" }, { status: 400 })
  }
  return proxy(req, `/api/venue-manager/${id}`, "POST")
}
