import { devLog } from "@/lib/dev-log"

import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth-options"
import { ObjectId } from "mongodb"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"

// GET – Organizer's events (proxy to Express backend GET /api/organizers/:id/events)
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    if (!id || id === "undefined") {
      return NextResponse.json({ success: false, error: "Invalid organizer ID" }, { status: 400 })
    }

    const { searchParams } = new URL(request.url)
    const page = searchParams.get("page") || "1"
    const limit = searchParams.get("limit") || "50"

    const query = new URLSearchParams({ page, limit })
    const res = await fetch(
      `${API_BASE_URL}/api/organizers/${id}/events?${query.toString()}`,
      { method: "GET", headers: { "Content-Type": "application/json" } }
    )

    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      return NextResponse.json(
        body?.error ? body : { success: false, error: "Failed to fetch organizer events" },
        { status: res.status }
      )
    }

    const data = await res.json()
    return NextResponse.json({
      success: data.success !== false,
      events: Array.isArray(data.events) ? data.events : [],
      pagination: data.pagination ?? {
        page: 1,
        limit: 50,
        total: 0,
        totalPages: 0,
        hasNextPage: false,
        hasPreviousPage: false,
      },
    })
  } catch (error: any) {
    console.error("Error fetching organizer events:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch events", details: error.message },
      { status: 500 }
    )
  }
}

// ✅ POST Handler - Create event with PENDING_APPROVAL status
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions)
    const { id } = await params

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (!id || id === "undefined") {
      return NextResponse.json({ error: "Invalid organizer ID" }, { status: 400 })
    }

    // Verify the user is the organizer
    if (session.user?.id !== id && session.user?.role !== "ORGANIZER") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()
    devLog("Received event data:", body)
    
    // Parse categories
    const parseCategory = (category: any): string[] => {
      if (Array.isArray(category)) {
        return category.filter(Boolean)
      }
      if (typeof category === 'string') {
        return category.split(',').map((cat: string) => cat.trim()).filter(Boolean)
      }
      return []
    }

    // Convert edition to string
    const edition = body.edition ? String(body.edition) : null

    // Create the event with PENDING_APPROVAL status
    const newEvent = await prisma.event.create({
      data: {
        id: new ObjectId().toHexString(),
        title: body.title,
        description: body.description,
        shortDescription: body.shortDescription || null,
        slug: body.slug || body.title
          .toLowerCase()
          .replace(/\s+/g, "-")
          .replace(/[^a-z0-9-]/g, ""),
        status: "PENDING_APPROVAL", // Set to pending approval
        isPublic: false, // Not publicly visible until approved
        category: parseCategory(body.category),
        edition: edition, // Now a string
        tags: body.tags || [],
        eventType: body.eventType || [],
        startDate: new Date(body.startDate),
        endDate: new Date(body.endDate),
        registrationStart: new Date(body.registrationStart || body.startDate),
        registrationEnd: new Date(body.registrationEnd || body.endDate),
        timezone: body.timezone || "UTC",
        venueId: body.venue && ObjectId.isValid(body.venue) ? body.venue : null,
        isVirtual: body.isVirtual || false,
        virtualLink: body.virtualLink || null,
        maxAttendees: body.maxAttendees || null,
        currentAttendees: 0,
        currency: body.currency || "USD",
        images: Array.isArray(body.images) ? body.images : [],
        videos: Array.isArray(body.videos) ? body.videos : [],
        documents: Array.isArray(body.documents) ? body.documents : [],
        brochure: body.brochure || null,
        layoutPlan: body.layoutPlan || null,
        bannerImage: body.bannerImage || body.images?.[0] || null,
        thumbnailImage: body.thumbnailImage || body.images?.[0] || null,
        requiresApproval: body.requiresApproval || false,
        allowWaitlist: body.allowWaitlist || false,
        refundPolicy: body.refundPolicy || null,
        metaTitle: body.metaTitle || null,
        metaDescription: body.metaDescription || null,
        isFeatured: body.isFeatured || false,
        isVIP: body.isVIP || false,
        organizerId: id,
        
        // Create ticket types if provided
        ticketTypes: body.ticketTypes ? {
          create: body.ticketTypes.map((ticket: any) => ({
            name: ticket.name,
            description: ticket.description || null,
            price: ticket.price,
            quantity: ticket.quantity || 100,
            sold: 0,
            isActive: ticket.isActive !== false,
          }))
        } : undefined,
        
        // Create exhibition spaces if provided
        exhibitionSpaces: body.exhibitionSpaces ? {
          create: body.exhibitionSpaces.map((space: any) => ({
            spaceType: space.spaceType || "CUSTOM",
            name: space.name,
            description: space.description || null,
            dimensions: space.dimensions || null,
            area: space.area || 0,
            location: space.location || null,
            basePrice: space.basePrice || 0,
            pricePerSqm: space.pricePerSqm || null,
            minArea: space.minArea || null,
            unit: space.unit || null,
            pricePerUnit: space.pricePerUnit || null,
            isFixed: space.isFixed || false,
            isAvailable: space.isAvailable !== false,
            maxBooths: space.maxBooths || null,
            bookedBooths: 0,
            setupRequirements: space.setupRequirements || null,
            currency: space.currency || "USD",
            powerIncluded: space.powerIncluded || false,
            additionalPowerRate: space.additionalPowerRate || null,
            compressedAirRate: space.compressedAirRate || null,
          }))
        } : undefined,
      },
      include: {
        exhibitionSpaces: true,
        ticketTypes: true,
      },
    })

    // Update organizer's total events count
    await prisma.user.update({
      where: { id },
      data: {
        totalEvents: { increment: 1 },
      },
    })

    // Send notification to organizer about pending status
    await prisma.notification.create({
      data: {
        userId: id,
        type: "SYSTEM_UPDATE",
        title: "Event Submitted for Approval",
        message: `Your event "${newEvent.title}" has been submitted for admin approval. You will be notified once it's reviewed.`,
        channels: ["PUSH"],
        priority: "MEDIUM",
        metadata: JSON.stringify({
          eventId: newEvent.id,
          eventTitle: newEvent.title,
          submittedAt: new Date().toISOString()
        })
      }
    })

    // Notify admins about pending event
    await notifyAdminsAboutPendingEvent(newEvent)

    return NextResponse.json(
      {
        success: true,
        message: "Event created successfully and submitted for approval",
        event: newEvent,
      },
      { status: 201 },
    )

  } catch (error: any) {
    console.error("Error creating event:", error)
    
    // Handle specific Prisma errors
    if (error.code === 'P2002') {
      return NextResponse.json(
        {
          success: false,
          error: "An event with this slug already exists",
          details: "Please choose a different slug"
        },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create event",
        details: error.message,
      },
      { status: 500 },
    )
  }
}

// ✅ PUT Handler - Update existing event
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions)
    const { id } = await params

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (!id || id === "undefined") {
      return NextResponse.json({ error: "Invalid organizer ID" }, { status: 400 })
    }

    if (session.user?.id !== id && session.user?.role !== "ORGANIZER") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()
    const { eventId, ...updateData } = body

    if (!eventId) {
      return NextResponse.json({ error: "Event ID is required" }, { status: 400 })
    }

    const existingEvent = await prisma.event.findFirst({
      where: {
        id: eventId,
        organizerId: id,
      },
    })

    if (!existingEvent) {
      return NextResponse.json({ error: "Event not found or access denied" }, { status: 404 })
    }

    // Parse categories
    const parseCategory = (category: any): string[] => {
      if (Array.isArray(category)) {
        return category.filter(Boolean)
      }
      if (typeof category === 'string') {
        return category.split(',').map((cat: string) => cat.trim()).filter(Boolean)
      }
      return []
    }

    // Convert edition to string if provided
    const edition = updateData.edition ? String(updateData.edition) : existingEvent.edition

    const eventUpdateData: any = {
      title: updateData.title,
      description: updateData.description,
      shortDescription: updateData.shortDescription || null,
      slug: updateData.slug || updateData.title
        ?.toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, ""),
      status: updateData.status || existingEvent.status,
      category: parseCategory(updateData.category),
      edition: edition,
      tags: updateData.tags || [],
      eventType: updateData.eventType || existingEvent.eventType,
      startDate: updateData.startDate ? new Date(updateData.startDate) : existingEvent.startDate,
      endDate: updateData.endDate ? new Date(updateData.endDate) : existingEvent.endDate,
      registrationStart: updateData.registrationStart
        ? new Date(updateData.registrationStart)
        : existingEvent.registrationStart,
      registrationEnd: updateData.registrationEnd
        ? new Date(updateData.registrationEnd)
        : existingEvent.registrationEnd,
      timezone: updateData.timezone || existingEvent.timezone,
      isVirtual: updateData.isVirtual ?? existingEvent.isVirtual,
      virtualLink: updateData.virtualLink || null,
      venueId: updateData.venue && ObjectId.isValid(updateData.venue) ? updateData.venue : null,
      maxAttendees: updateData.maxAttendees || null,
      currency: updateData.currency || existingEvent.currency,
      images: Array.isArray(updateData.images) ? updateData.images : existingEvent.images,
      videos: Array.isArray(updateData.videos) ? updateData.videos : existingEvent.videos,
      documents: Array.isArray(updateData.documents) ? updateData.documents : existingEvent.documents,
      bannerImage: updateData.bannerImage || existingEvent.bannerImage,
      thumbnailImage: updateData.thumbnailImage || existingEvent.thumbnailImage,
      isPublic: updateData.isPublic !== undefined ? updateData.isPublic : existingEvent.isPublic,
      requiresApproval: updateData.requiresApproval || false,
      allowWaitlist: updateData.allowWaitlist || false,
      refundPolicy: updateData.refundPolicy || null,
      metaTitle: updateData.metaTitle || null,
      metaDescription: updateData.metaDescription || null,
      isFeatured: updateData.isFeatured || false,
      isVIP: updateData.isVIP || false,
    }

    if (updateData.ticketTypes) {
      await prisma.ticketType.deleteMany({
        where: { eventId: eventId },
      })

      eventUpdateData.ticketTypes = {
        create: updateData.ticketTypes.map((ticket: any) => ({
          name: ticket.name,
          description: ticket.description || null,
          price: ticket.price,
          quantity: ticket.quantity || 100,
          sold: 0,
          isActive: ticket.isActive !== false,
        })),
      }
    }

    if (updateData.exhibitionSpaces) {
      await prisma.exhibitionSpace.deleteMany({
        where: { eventId: eventId },
      })

      eventUpdateData.exhibitionSpaces = {
        create: updateData.exhibitionSpaces.map((space: any) => ({
          spaceType: space.spaceType || "CUSTOM",
          name: space.name,
          description: space.description || null,
          dimensions: space.dimensions || null,
          area: space.area || 0,
          location: space.location || null,
          basePrice: space.basePrice || 0,
          pricePerSqm: space.pricePerSqm || null,
          minArea: space.minArea || null,
          unit: space.unit || null,
          pricePerUnit: space.pricePerUnit || null,
          isFixed: space.isFixed || false,
          isAvailable: space.isAvailable !== false,
          maxBooths: space.maxBooths || null,
          bookedBooths: 0,
          setupRequirements: space.setupRequirements || null,
          currency: space.currency || "USD",
          powerIncluded: space.powerIncluded || false,
          additionalPowerRate: space.additionalPowerRate || null,
          compressedAirRate: space.compressedAirRate || null,
        })),
      }
    }

    const updatedEvent = await prisma.event.update({
      where: { id: eventId },
      data: eventUpdateData,
      include: {
        exhibitionSpaces: true,
        ticketTypes: true,
        venue: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            location: true,
            venueCity: true,
            venueState: true,
            venueCountry: true,
          },
        },
      },
    })

    return NextResponse.json(
      {
        success: true,
        message: "Event updated successfully",
        event: updatedEvent,
      },
      { status: 200 },
    )
  } catch (error: any) {
    console.error("Error updating event:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update event",
        details: error.message,
      },
      { status: 500 },
    )
  }
}

// ✅ DELETE Handler - Delete existing event
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string; eventId: string }> }) {
  try {
    const session = await getServerSession(authOptions)
    const { id, eventId } = await params

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (!id || id === "undefined") {
      return NextResponse.json({ error: "Invalid organizer ID" }, { status: 400 })
    }

    if (!eventId) {
      return NextResponse.json({ error: "Event ID is required" }, { status: 400 })
    }

    if (session.user?.id !== id && session.user?.role !== "ORGANIZER") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Check if event exists and belongs to the organizer
    const existingEvent = await prisma.event.findFirst({
      where: {
        id: eventId,
        organizerId: id,
      },
    })

    if (!existingEvent) {
      return NextResponse.json({ error: "Event not found or access denied" }, { status: 404 })
    }

    // Delete related records first (due to foreign key constraints)
    await prisma.ticketType.deleteMany({
      where: { eventId: eventId },
    })

    await prisma.exhibitionSpace.deleteMany({
      where: { eventId: eventId },
    })

    // Delete the event
    await prisma.event.delete({
      where: { id: eventId },
    })

    // Update organizer's total events count
    await prisma.user.update({
      where: { id },
      data: {
        totalEvents: { decrement: 1 },
      },
    })

    return NextResponse.json(
      {
        success: true,
        message: "Event deleted successfully",
      },
      { status: 200 },
    )
  } catch (error: any) {
    console.error("Error deleting event:", error)
    return NextResponse.json({ 
      success: false,
      error: "Internal server error",
      details: error.message 
    }, { status: 500 })
  }
}

// Update this function in your existing file
async function notifyAdminsAboutPendingEvent(event: any) {
  try {
    // Get all super admins
    const superAdmins = await prisma.superAdmin.findMany({
      where: { isActive: true },
      select: { id: true, email: true, name: true }
    })

    // Get all sub-admins with event approval permission
    const subAdmins = await prisma.subAdmin.findMany({
      where: { 
        isActive: true,
        permissions: { has: "events" }
      },
      select: { id: true, email: true, name: true }
    })

    const allAdmins = [...superAdmins, ...subAdmins]

    // Create notifications for each admin
    for (const admin of allAdmins) {
      await prisma.notification.create({
        data: {
          userId: admin.id,
          type: "EVENT_PENDING",
          title: "New Event Pending Approval",
          message: `A new event "${event.title}" is waiting for admin approval.`,
          channels: ["PUSH"],
          priority: "HIGH",
          metadata: JSON.stringify({
            eventId: event.id,
            eventTitle: event.title,
            organizerId: event.organizerId,
            submittedAt: event.createdAt
          }),
          userRole: admin.id.startsWith('super') ? ["SUPER_ADMIN"] : ["SUB_ADMIN"]
        }
      })
    }

    devLog(`Pending event notifications sent to ${allAdmins.length} admins`)

  } catch (error) {
    console.error("Failed to notify admins:", error)
  }
}