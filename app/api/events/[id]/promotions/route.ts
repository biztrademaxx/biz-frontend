import { type NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

// GET /api/events/[id]/promotions - Fetch event and its promotions
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: eventId } = await params

    console.log("[v0] Fetching event with ID:", eventId)

    // Fetch event details
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: {
        id: true,
        title: true,
        startDate: true,
        // location: true,
        status: true,
        category: true,
        organizerId: true,
      },
    })

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 })
    }

    const formattedEvent = {
      ...event,
      date: event.startDate.toISOString().split("T")[0],
    }

    // Fetch promotions for this event
    const promotions = await prisma.promotion.findMany({
      where: { eventId },
      include: {
        event: {
          select: {
            id: true,
            title: true,
            startDate: true,
            // location: true,
            status: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json({
      event: formattedEvent,
      promotions,
    })
  } catch (error) {
    console.error("[v0] Error fetching promotion data:", error)
    return NextResponse.json({ error: "Failed to fetch promotion data" }, { status: 500 })
  }
}

// POST /api/events/[id]/promotions - Create a new promotion
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: eventId } = await params
    const body = await request.json()
    const { packageType, targetCategories, amount, duration } = body

    console.log("[v0] Creating promotion for event:", eventId)

    // Verify event exists and get organizer
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: { id: true, organizerId: true },
    })

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 })
    }

    // Calculate start and end dates
    const startDate = new Date()
    const endDate = new Date()
    endDate.setDate(endDate.getDate() + duration)

    // Create promotion
    const promotion = await prisma.promotion.create({
      data: {
        eventId,
        organizerId: event.organizerId,
        packageType,
        targetCategories,
        amount,
        duration,
        startDate,
        endDate,
        status: "ACTIVE",
      },
      include: {
        event: {
          select: {
            id: true,
            title: true,
            startDate: true,
            // location: true,
            status: true,
          },
        },
      },
    })

    console.log("[v0] Promotion created successfully:", promotion.id)

    return NextResponse.json(promotion, { status: 201 })
  } catch (error) {
    console.error("[v0] Error creating promotion:", error)
    return NextResponse.json({ error: "Failed to create promotion" }, { status: 500 })
  }
}
