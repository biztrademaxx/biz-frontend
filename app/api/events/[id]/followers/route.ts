import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"

/** Prefer Express backend (same DB as `GET /api/events`); fall back to Next Prisma when proxy fails. */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  if (!id?.trim()) {
    return NextResponse.json({ error: "Invalid event ID" }, { status: 400 })
  }

  const auth = request.headers.get("authorization") ?? undefined
  const target = `${API_BASE_URL}/api/events/${encodeURIComponent(id)}/followers`

  try {
    const res = await fetch(target, {
      headers: {
        "Content-Type": "application/json",
        ...(auth ? { Authorization: auth } : {}),
      },
      cache: "no-store",
    })
    if (res.ok) {
      const data = await res.json().catch(() => null)
      if (data && typeof data === "object") {
        return NextResponse.json(data)
      }
    }
  } catch {
    // use Prisma fallback below
  }

  if (!prisma?.savedEvent) {
    return NextResponse.json({ followers: [], total: 0 })
  }

  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id ?? "")
  const isObjectId = (id?.length ?? 0) === 24 && /^[0-9a-fA-F]{24}$/.test(id ?? "")
  if (!isUuid && !isObjectId) {
    return NextResponse.json({ error: "Invalid event ID" }, { status: 400 })
  }

  try {
    const savedEvents = await prisma.savedEvent.findMany({
      where: { eventId: id },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatar: true,
            role: true,
            company: true,
            jobTitle: true,
          },
        },
      },
      orderBy: { savedAt: "desc" },
    })

    return NextResponse.json({
      followers: savedEvents,
      total: savedEvents.length,
    })
  } catch (error) {
    console.error("Error fetching event followers (fallback):", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
