import { type NextRequest, NextResponse } from "next/server"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"

function backendHeaders(req: NextRequest): Record<string, string> {
  const auth = req.headers.get("authorization")
  return {
    "Content-Type": "application/json",
    ...(auth ? { Authorization: auth } : {}),
  }
}

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
      headers: backendHeaders(req),
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

function stripPublicVenueContact(payload: Record<string, unknown>): Record<string, unknown> {
  const data = payload.data
  if (!data || typeof data !== "object") return payload

  const venue = data as Record<string, unknown>
  const manager =
    venue.manager && typeof venue.manager === "object"
      ? { ...(venue.manager as Record<string, unknown>) }
      : null

  if (manager) {
    delete manager.email
    delete manager.phone
    venue.manager = manager
  }

  const contact =
    venue.contact && typeof venue.contact === "object"
      ? { ...(venue.contact as Record<string, unknown>) }
      : {}

  delete contact.phone
  delete contact.email
  if (contact.website) {
    venue.contact = { website: contact.website }
  } else {
    delete venue.contact
  }

  return { ...payload, data: venue }
}

// GET /api/venue-manager/[id]
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  if (!id || id === "undefined") {
    return NextResponse.json({ success: false, error: "Invalid venue manager ID" }, { status: 400 })
  }

  try {
    const auth = req.headers.get("authorization")
    const res = await fetch(`${API_BASE_URL}/api/venue-manager/${encodeURIComponent(id)}`, {
      method: "GET",
      headers: backendHeaders(req),
      cache: "no-store",
    })
    const data = await res.json().catch(() => ({}))
    const sanitized = auth
      ? data
      : stripPublicVenueContact(
          typeof data === "object" && data !== null ? (data as Record<string, unknown>) : {},
        )
    return NextResponse.json(sanitized, { status: res.status })
  } catch (error) {
    console.error("Error proxying venue-manager GET:", error)
    return NextResponse.json(
      { success: false, error: "Internal venue error" },
      { status: 500 },
    )
  }
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
