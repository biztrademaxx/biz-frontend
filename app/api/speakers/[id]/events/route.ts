import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const sessions = await prisma.speakerSession.findMany({
      where: { speakerId: id },
      include: { 
        event: {
          include: {
            venue: true, // ✅ Include the venue data
          },
        },
      },
      orderBy: { startTime: 'desc' },
    })

    const now = new Date()
    const upcoming = sessions.filter(s => new Date(s.startTime) > now)
    const past = sessions.filter(s => new Date(s.startTime) <= now)

    const mapSessionToEvent = (session: any) => ({
      id: session.event.id,
      title: session.event.title,
      date: session.event.startDate.toISOString(),
      location: session.event.venue
        ? `${session.event.venue.venueName}, ${session.event.venue.venueCity}, ${session.event.venue.venueState}, ${session.event.venue.venueCountry}` 
        : "TBD",
      image: session.event.bannerImage || "/images/gpex.jpg",
      averageRating: session.event.averageRating || 0,
      currentAttendees: session.event.currentAttendees || 0,
    })

    return NextResponse.json({
      success: true,
      upcoming: upcoming.map(mapSessionToEvent),
      past: past.map(mapSessionToEvent),
    })
  } catch (error) {
    console.error("Error fetching speaker events:", error)
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    )
  }
}
