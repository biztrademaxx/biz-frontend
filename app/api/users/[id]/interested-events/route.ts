import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth-options"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { userId } = await params

    // access check
    if (session.user.id !== userId && session.user.role !== "ATTENDEE") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

const eventLeads = await prisma.eventLead.findMany({
  where: {
    userId,
    status: { not: "REJECTED" }
  },
  distinct: ["eventId"],
  include: {
    event: {
      include: {
        organizer: true,
        venue: true,
        ticketTypes: true,
        _count: { select: { registrations: true }}
      }
    }
  },
  orderBy: [
    { createdAt: "desc" },
    { followUpDate: "asc" }
  ]
})


    // 🧨 MOST IMPORTANT FIX
    const interestedEvents = eventLeads
      .map((lead) => {
        if (!lead.event) return null
        const e = lead.event

        return {
          id: e.id,
          title: e.title,
          description: e.description,
          shortDescription: e.shortDescription,
          startDate: e.startDate.toISOString(),
          endDate: e.endDate.toISOString(),
          status: e.status,
          type: e.eventType?.[0] || "General",
          bannerImage: e.bannerImage,
          thumbnailImage: e.thumbnailImage,
          category: e.category,

          ticketTypes: e.ticketTypes,
          organizer: e.organizer,
          venue: e.venue,

          leadId: lead.id,
          leadStatus: lead.status,
          leadType: lead.type,
          contactedAt: lead.contactedAt?.toISOString(),
          followUpDate: lead.followUpDate?.toISOString(),
          leadNotes: lead.notes,

          currentRegistrations: e._count.registrations,
          maxAttendees: e.maxAttendees,
        }
      })
      .filter((e): e is NonNullable<typeof e> => e !== null)

    return NextResponse.json({
      events: interestedEvents,
      total: interestedEvents.length
    })

  } catch (error) {
    console.error("Error fetching interested events:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
