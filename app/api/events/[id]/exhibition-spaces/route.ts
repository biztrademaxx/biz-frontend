import { type NextRequest, NextResponse } from "next/server"
import { proxyJson } from "@/lib/backend-proxy"
import { prisma } from "@/lib/prisma"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"

// Try backend first; fall back to local create when backend returns 404 (endpoint not implemented).

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id: eventId } = await context.params
  if (!eventId) {
    return NextResponse.json({ error: "Event ID is required" }, { status: 400 })
  }
  let res: Response
  try {
    res = await fetch(`${API_BASE_URL}/api/events/${eventId}/exhibition-spaces`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    })
  } catch {
    res = { ok: false, status: 404 } as Response
  }
  if (res.ok) {
    const data = await res.json().catch(() => ({}))
    return NextResponse.json(data, { status: res.status })
  }
  if (res.status === 404 && prisma) {
    try {
      const spaces = await prisma.exhibitionSpace.findMany({
        where: { eventId },
        orderBy: { name: "asc" },
      })
      const list = spaces.map((s) => ({
        id: s.id,
        name: s.name,
        spaceType: s.spaceType,
        dimensions: s.dimensions,
        area: s.area,
        basePrice: s.basePrice,
        location: s.location,
        isAvailable: s.isAvailable && (s.bookedBooths ?? 0) < (s.maxBooths ?? 999),
        maxBooths: s.maxBooths,
        bookedBooths: s.bookedBooths ?? 0,
      }))
      return NextResponse.json({ exhibitionSpaces: list })
    } catch {
      // ignore
    }
  }
  const data = await res.json().catch(() => ({}))
  return NextResponse.json(data?.error ? data : { error: "Failed to fetch exhibition spaces" }, { status: res.status })
}

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id: eventId } = await context.params
  if (!eventId) {
    return NextResponse.json({ error: "Event ID is required" }, { status: 400 })
  }
  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }
  let res: Response
  try {
    res = await fetch(`${API_BASE_URL}/api/events/${eventId}/exhibition-spaces`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      cache: "no-store",
    })
  } catch {
    res = { ok: false, status: 404 } as Response
  }
  if (res.ok) {
    const data = await res.json().catch(() => ({}))
    return NextResponse.json(data, { status: res.status })
  }
  if (res.status === 404 && prisma) {
    const validTypes = [
      "SHELL_SPACE", "RAW_SPACE", "TWO_SIDE_OPEN", "THREE_SIDE_OPEN",
      "FOUR_SIDE_OPEN", "MEZZANINE", "ADDITIONAL_POWER", "COMPRESSED_AIR", "CUSTOM",
    ]
    const name = typeof body.name === "string" ? body.name.trim() : ""
    const basePrice = Number(body.basePrice) ?? 0
    if (!name) {
      return NextResponse.json({ error: "name is required" }, { status: 400 })
    }
    try {
      const space = await prisma.exhibitionSpace.create({
        data: {
          eventId,
          name,
          spaceType: validTypes.includes(body.spaceType as string) ? (body.spaceType as string) : "RAW_SPACE",
          description: (body.description as string) || name,
          dimensions: (body.dimensions as string) || null,
          area: Number(body.area) || 100,
          basePrice,
          minArea: body.minArea != null ? Number(body.minArea) : null,
          unit: (body.unit as string) || "sqm",
          pricePerSqm: body.pricePerSqm != null ? Number(body.pricePerSqm) : null,
          maxBooths: body.maxBooths != null ? Number(body.maxBooths) : null,
        },
      })
      return NextResponse.json({
        id: space.id,
        name: space.name,
        spaceType: space.spaceType,
        dimensions: space.dimensions,
        area: space.area,
        basePrice: space.basePrice,
        location: space.location,
        isAvailable: space.isAvailable,
        maxBooths: space.maxBooths,
        bookedBooths: space.bookedBooths ?? 0,
        description: space.description,
        minArea: space.minArea,
        unit: space.unit,
        pricePerSqm: space.pricePerSqm,
      }, { status: 201 })
    } catch (err) {
      console.error("Exhibition space create fallback error:", err)
      return NextResponse.json({ error: "Failed to create exhibition space" }, { status: 500 })
    }
  }
  const data = await res.json().catch(() => ({}))
  return NextResponse.json(data?.error ? data : { error: "Failed to create exhibition space" }, { status: res.status })
}
