import { type NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function GET(request: NextRequest, { params }: { params: Promise<{ eventId: string }> }) {
  try {
    const { eventId } = await params

    const exhibitorLeads = await prisma.eventLead.findMany({
      where: {
        eventId: eventId,
        type: "EXHIBITOR",
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            company: true,
            jobTitle: true,
            avatar: true,
          },
        },
        event: {
          select: {
            id: true,
            title: true,
            startDate: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json({
      attendeeLeads: exhibitorLeads,
      total: exhibitorLeads.length,
    })
  } catch (error) {
    console.error("Error fetching exhibitor leads:", error)
    return NextResponse.json({ error: "Failed to fetch exhibitor leads" }, { status: 500 })
  }
}
