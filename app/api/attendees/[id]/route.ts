import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    console.log("Fetching attendee with ID:", id)

    // Find the event lead (attendee registration)
    const attendeeLead = await prisma.eventLead.findUnique({
      where: { id },
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
            images: true,
          },
        },
      },
    })

    if (!attendeeLead || !attendeeLead.user) {
      console.log("Attendee not found for ID:", id)
      return NextResponse.json({ error: "Attendee not found" }, { status: 404 })
    }

    console.log("Found attendee:", attendeeLead.user.firstName, attendeeLead.user.lastName)

    // Transform the data to match your frontend interface
    const attendee = {
      id: attendeeLead.id,
      firstName: attendeeLead.user.firstName,
      lastName: attendeeLead.user.lastName,
      email: attendeeLead.user.email,
      phone: attendeeLead.user.phone || undefined,
      company: attendeeLead.user.company || undefined,
      jobTitle: attendeeLead.user.jobTitle || undefined,
      avatar: attendeeLead.user.avatar || undefined,
      event: {
        id: attendeeLead.event.id,
        title: attendeeLead.event.title,
        startDate: attendeeLead.event.startDate.toISOString(),
        images: attendeeLead.event.images || [],
      },
      registration: {
        id: attendeeLead.id,
        status: attendeeLead.status,
        ticketType: attendeeLead.notes || "General Admission",
        quantity: 1,
        totalAmount: 0,
        registeredAt: attendeeLead.createdAt.toISOString(),
      },
    }

    return NextResponse.json({ success: true, attendee })
  } catch (error) {
    console.error("Error fetching attendee:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}