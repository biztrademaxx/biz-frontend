// /api/users/[userId]/saved-events/route.ts
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth-options"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    console.log("[v0] Raw params:", params)

    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const resolvedParams = await params
    const userId = resolvedParams.id

    console.log("[v0] Resolved params:", resolvedParams)
    console.log("[v0] Extracted userId:", userId)

    // User can see only their own saved events
    if (String(session.user.id) !== String(userId)) {
      console.log("[v0] Auth mismatch:", {
        sessionUserId: session.user.id,
        requestedUserId: userId,
        sessionUserIdType: typeof session.user.id,
        requestedUserIdType: typeof userId,
      })
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Check if user exists
    const userExists = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    })

    if (!userExists) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const savedEvents = await prisma.savedEvent.findMany({
      where: {
        userId,
      },
      include: {
        event: {
          include: {
            organizer: true,
            venue: true,
            ticketTypes: true,
          },
        },
      },
      orderBy: { savedAt: "desc" },
    })

    // Map the events to match your frontend expectations
    const events = savedEvents.map((saved) => {
      const event = saved.event

      return {
        id: event.id,
        title: event.title,
        description: event.description,
        shortDescription: event.shortDescription || "",
        startDate: event.startDate.toISOString(),
        endDate: event.endDate?.toISOString() || event.startDate.toISOString(),

        // Use venue information or fallback to event location fields
        location: event.venue?.venueName,
        city: event.venue?.venueCity,
        state: event.venue?.venueState,
        address: event.venue?.venueAddress,

        category: event.category?.[0] || "Event",
        categories: event.category || [],

        status: event.status,
        type: event.eventType?.[0] || "General",
        eventTypes: event.eventType || [],

        bannerImage: event.bannerImage || "",
        thumbnailImage: event.thumbnailImage || "",

        // expectedExhibitors: event.expectedExhibitors || 0,
        maxAttendees: event.maxAttendees || 0,

        organizer: event.organizer,
        venue: event.venue,
        ticketTypes: event.ticketTypes || [],

        savedAt: saved.savedAt.toISOString(),
      }
    })

    return NextResponse.json({ events })
  } catch (error) {
    console.error("Error fetching saved events:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
