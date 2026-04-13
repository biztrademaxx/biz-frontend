import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const exhibitorId = searchParams.get("exhibitorId")

    if (!exhibitorId) {
      return NextResponse.json({ error: "exhibitorId is required" }, { status: 400 })
    }

    // Fetch promotions for this exhibitor
    const promotions = await prisma.promotion.findMany({
      where: {
        exhibitorId,
      },
      include: {
        event: {
          select: {
            title: true,
            startDate: true,
            endDate: true,
          }
        }
      },
      orderBy: { createdAt: "desc" },
    })

    // Also fetch events for the promotion creation form
    const booths = await prisma.exhibitorBooth.findMany({
      where: { exhibitorId },
      include: { event: true },
      orderBy: { createdAt: "desc" },
    })

    const eventsMap = new Map<string, any>()
    booths.forEach((b) => {
      if (b.event?.id && !eventsMap.has(b.event.id)) {
        eventsMap.set(b.event.id, {
          id: b.event.id,
          title: b.event.title,
          date: b.event.startDate, // Use startDate for the date display
          location: b.event.venueId || "N/A",
          status: b.event.status || "Scheduled",
        })
      }
    })

    // Transform promotions data to match your frontend interface
    const formattedPromotions = promotions.map(promotion => ({
      id: promotion.id,
      eventId: promotion.eventId,
      eventName: promotion.event?.title || "Unknown Event",
      packageType: promotion.packageType,
      status: promotion.status,
      impressions: promotion.impressions || 0,
      clicks: promotion.clicks || 0,
      conversions: promotion.conversions || 0,
      startDate: promotion.startDate,
      endDate: promotion.endDate,
      amount: promotion.amount,
      duration: promotion.duration,
      targetCategories: promotion.targetCategories || [],
    }))

    return NextResponse.json({ 
      promotions: formattedPromotions,
      events: Array.from(eventsMap.values()) 
    }, { status: 200 })

  } catch (error) {
    console.error("Error fetching promotions:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      exhibitorId,
      eventId,
      packageType,
      targetCategories,
      amount,
      duration
    } = body

    console.log("[API] Creating promotion with data:", body)

    // Validate required fields
    if (!exhibitorId || !eventId || !packageType || !targetCategories) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Calculate start and end dates
    const startDate = new Date()
    const endDate = new Date()
    endDate.setDate(endDate.getDate() + duration)

    // Create the promotion
    const promotion = await prisma.promotion.create({
      data: {
        exhibitorId,
        eventId,
        packageType,
        targetCategories,
        amount,
        duration,
        status: "ACTIVE",
        startDate,
        endDate,
        impressions: 0,
        clicks: 0,
        conversions: 0,
      },
    })

    console.log("[API] Promotion created successfully:", promotion)

    return NextResponse.json({
      success: true,
      promotion
    }, { status: 201 })

  } catch (error) {
    console.error("[API] Error creating promotion:", error)
    return NextResponse.json(
      { error: "Failed to create promotion" },
      { status: 500 }
    )
  }
}