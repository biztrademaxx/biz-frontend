import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; leadId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const resolvedParams = await params
    const { id: eventId, leadId } = resolvedParams
    const { status, notes } = await request.json()

    // Validate input
    if (!status) {
      return NextResponse.json({ error: "Status is required" }, { status: 400 })
    }

    // Check if lead exists and user has permission
    const lead = await prisma.eventLead.findUnique({
      where: { id: leadId },
      include: {
        event: {
          select: { organizerId: true },
        },
      },
    })

    if (!lead) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 })
    }

    // Only organizer can update leads
    if (lead.event.organizerId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Update the lead
    const updatedLead = await prisma.eventLead.update({
      where: { id: leadId },
      data: {
        status,
        notes,
        contactedAt: status === "CONTACTED" ? new Date() : lead.contactedAt,
      },
    })

    return NextResponse.json({
      success: true,
      message: "Lead updated successfully",
      lead: updatedLead,
    })
  } catch (error) {
    console.error("Error updating lead:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}