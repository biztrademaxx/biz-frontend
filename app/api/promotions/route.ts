import { type NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const {
      exhibitorId,
      eventId,
      packageType,
      targetCategories,
      amount,
      duration, // in days
    } = body

    // Validate required fields
    if (!exhibitorId || !eventId || !packageType || !targetCategories || !amount || !duration) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Calculate start and end dates
    const startDate = new Date()
    const endDate = new Date()
    endDate.setDate(endDate.getDate() + duration)

    // Create promotion in database
    const promotion = await prisma.promotion.create({
      data: {
        exhibitorId,
        eventId,
        packageType,
        targetCategories,
        amount,
        duration,
        startDate,
        endDate,
        status: "PENDING",
        impressions: 0,
        clicks: 0,
        conversions: 0,
      },
    })

    return NextResponse.json(
      {
        success: true,
        message: "Promotion created successfully",
        promotion,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("[PROMOTION_POST_ERROR]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
