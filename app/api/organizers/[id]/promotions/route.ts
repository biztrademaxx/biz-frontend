import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth-options"
import { prisma } from "@/lib/prisma"

// Type for route params
interface Params {
  id: string
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<Params> }
) {
  try {
    const session = await getServerSession(authOptions)
    const { id } = await params

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // ✅ Fetch promotions for the given id (either exhibitorId or organizerId)
    const promotions = await prisma.promotion.findMany({
      where: {
        OR: [ { organizerId: id }],
      },
      include: { event: true },
      orderBy: { createdAt: "desc" },
    })

    // ✅ Fetch all events for the given organizerId
    const events = await prisma.event.findMany({
      where: { organizerId: id, status: "PUBLISHED" },
      select: {
        id: true,
        title: true,
        startDate: true,
        // location: true,
        status: true,
        currentAttendees: true,
        maxAttendees: true,
        category: true,
      },
      orderBy: { startDate: "asc" },
    })

    const transformedEvents = events.map((event) => ({
      id: event.id,
      title: event.title,
      date: event.startDate.toISOString().split("T")[0],
      // location: event.location,
      status: event.status,
      attendees: event.currentAttendees || 0,
      maxAttendees: event.maxAttendees || 0,
      category: event.category,
      registrations: event.currentAttendees || 0,
      revenue: 0,
    }))

    return NextResponse.json({ promotions, events: transformedEvents })
  } catch (error) {
    console.error("Error fetching promotions:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<Params> }
) {
  try {
    const session = await getServerSession(authOptions)
    const { id } = await params

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { eventId, packageType, targetCategories, amount, duration } = body

    const startDate = new Date()
    const endDate = new Date(startDate.getTime() + duration * 24 * 60 * 60 * 1000)

    // ✅ Always allow both exhibitorId and organizerId to be set
    const promotion = await prisma.promotion.create({
      data: {
        eventId,
        packageType,
        targetCategories,
        amount,
        duration,
        startDate,
        endDate,
        status: "PENDING",
        // exhibitorId: id, // store under exhibitor
        organizerId: id, // also store under organizer (optional: depends on schema)
      },
      include: { event: true },
    })

    return NextResponse.json({
      message: "Promotion created successfully",
      promotion,
    })
  } catch (error) {
    console.error("Error creating promotion:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
