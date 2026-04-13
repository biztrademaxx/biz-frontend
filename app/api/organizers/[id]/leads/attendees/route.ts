// app/api/organizers/[id]/leads/attendees/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
// interface Params {
//   id: string
// }

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: organizerId } = await params  // 👈 await here
    const { searchParams } = new URL(req.url)
    const eventId = searchParams.get('eventId')
    const status = searchParams.get('status')
    
    // Build the query
    const whereClause: any = {
      type: 'ATTENDEE',
      event: {
        organizerId: organizerId
      }
    }
    
    // Filter by specific event if provided
    if (eventId) {
      whereClause.eventId = eventId
    }
    
    // Filter by lead status if provided
    if (status && status !== 'all') {
      whereClause.status = status
    }

    const attendeeLeads = await prisma.eventLead.findMany({
      where: whereClause,
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
            location: true,
            createdAt: true
          }
        },
        event: {
          select: {
            id: true,
            title: true,
            startDate: true,
            endDate: true,
            // location: true,
            status: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Get summary stats
    const stats = await prisma.eventLead.groupBy({
      by: ['status'],
      where: {
        type: 'ATTENDEE',
        event: {
          organizerId: organizerId
        }
      },
      _count: {
        status: true
      }
    })

    const totalLeads = attendeeLeads.length
    const statusCounts = stats.reduce((acc, stat) => {
      acc[stat.status] = stat._count.status
      return acc
    }, {} as Record<string, number>)

    return NextResponse.json({
      success: true,
      attendeeLeads,
      stats: {
        total: totalLeads,
        new: statusCounts.NEW || 0,
        contacted: statusCounts.CONTACTED || 0,
        qualified: statusCounts.QUALIFIED || 0,
        converted: statusCounts.CONVERTED || 0,
        followUp: statusCounts.FOLLOW_UP || 0,
        rejected: statusCounts.REJECTED || 0
      }
    })

  } catch (error) {
    console.error('Error fetching attendee leads:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch attendee leads' },
      { status: 500 }
    )
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise< { id: string }> }
) {
  try {
    const { id: organizerId } = await params  // 👈 await here
    const { eventId, userId, notes } = await req.json()

    // Verify the event belongs to this organizer
    const event = await prisma.event.findFirst({
      where: {
        id: eventId,
        organizerId: organizerId
      }
    })

    if (!event) {
      return NextResponse.json(
        { success: false, error: 'Event not found or not authorized' },
        { status: 404 }
      )
    }

    // Create or update the lead
    const lead = await prisma.eventLead.upsert({
      where: {
        eventId_userId_type: {
          eventId,
          userId,
          type: 'ATTENDEE'
        }
      },
      update: {
        notes,
        updatedAt: new Date()
      },
      create: {
        eventId,
        userId,
        type: 'ATTENDEE',
        status: 'NEW',
        notes
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
            avatar: true
          }
        },
        event: {
          select: {
            id: true,
            title: true,
            startDate: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      lead
    })

  } catch (error) {
    console.error('Error creating attendee lead:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create attendee lead' },
      { status: 500 }
    )
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise< { id: string } >}
) {
  try {
    const { id: organizerId } = await params  // 👈 await here
    const { leadId, status, notes, followUpDate, contactedAt } = await req.json()

    // Verify the lead belongs to this organizer's event
    const lead = await prisma.eventLead.findFirst({
      where: {
        id: leadId,
        event: {
          organizerId: organizerId
        }
      }
    })

    if (!lead) {
      return NextResponse.json(
        { success: false, error: 'Lead not found or not authorized' },
        { status: 404 }
      )
    }

    // Update the lead
    const updatedLead = await prisma.eventLead.update({
      where: { id: leadId },
      data: {
        ...(status && { status }),
        ...(notes !== undefined && { notes }),
        ...(followUpDate && { followUpDate: new Date(followUpDate) }),
        ...(contactedAt && { contactedAt: new Date(contactedAt) }),
        updatedAt: new Date()
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
            avatar: true
          }
        },
        event: {
          select: {
            id: true,
            title: true,
            startDate: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      lead: updatedLead
    })

  } catch (error) {
    console.error('Error updating attendee lead:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update attendee lead' },
      { status: 500 }
    )
  }
}