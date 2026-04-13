import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"
import { ObjectId } from "mongodb"

export async function GET(request: NextRequest) {
  try {
    console.log("[v0] GET /api/events/exhibitors called")

    const { searchParams } = new URL(request.url)
    const eventId = searchParams.get("eventId")
    const organizerId = searchParams.get("organizerId")

    if (!eventId && !organizerId) {
      console.log("[v0] Missing eventId or organizerId in query params")
      return NextResponse.json(
        { error: "eventId or organizerId is required" },
        { status: 400 }
      )
    }

    console.log(
      "[v0] Fetching booths for:",
      eventId ? `eventId: ${eventId}` : `organizerId: ${organizerId}`
    )

  const booths = await prisma.exhibitorBooth.findMany({
  where: eventId
    ? { eventId }
    : organizerId
    ? {
        event: {
          organizerId: {
            equals: organizerId, // ✅ Explicit filter
          },
        },
      }
    : undefined, // ✅ If both missing, Prisma gets no condition
  include: {
    exhibitor: {
      select: {
        firstName: true,
        lastName: true,
        company: true,
        email: true,
      },
    },
    event: {
      select: {
        id: true,
        title: true,
        startDate: true,
        endDate: true,
        organizerId: true,
      },
    },
  },
  orderBy: {
    createdAt: "desc",
  },
})


    if (!booths || booths.length === 0) {
      return NextResponse.json(
        { message: "No exhibitor booths found", booths: [] },
        { status: 200 }
      )
    }

    return NextResponse.json({ booths }, { status: 200 })
  } catch (error) {
    console.error("[v0] Error fetching exhibitor booths:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
