import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth-options"
import { PrismaClient } from "@prisma/client"
import type { EventStatus } from "@prisma/client"
import { ObjectId } from "mongodb"

const prisma = new PrismaClient()

// ✅ PUT Handler - Update existing event
export async function PUT(request: Request, { params }: { params: Promise<{ id: string; eventId: string }> }) {
  try {
    console.log("[v0] PUT request received")
    const session = await getServerSession(authOptions)
    const { id, eventId } = await params

    console.log("[v0] Params:", { id, eventId })
    console.log("[v0] Session:", session ? "exists" : "null")

    if (!session) {
      console.log("[v0] No session found")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (!id || id === "undefined") {
      console.log("[v0] Invalid organizer ID")
      return NextResponse.json({ error: "Invalid organizer ID" }, { status: 400 })
    }

    if (!eventId) {
      console.log("[v0] No event ID provided")
      return NextResponse.json({ error: "Event ID is required" }, { status: 400 })
    }

    if (session.user?.id !== id && session.user?.role !== "ORGANIZER") {
      console.log("[v0] Access forbidden - user:", session.user?.id, "organizer:", id, "role:", session.user?.role)
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()
    console.log("[v0] Request body keys:", Object.keys(body))

    // Check if event exists and belongs to the organizer
    console.log("[v0] Checking if event exists...")
    const existingEvent = await prisma.event.findFirst({
      where: {
        id: eventId,
        organizerId: id,
      },
      include: {
        ticketTypes: true,
        exhibitionSpaces: true,
      },
    })

    console.log("[v0] Existing event found:", existingEvent ? "yes" : "no")

    if (!existingEvent) {
      console.log("[v0] Event not found or access denied")
      return NextResponse.json({ error: "Event not found or access denied" }, { status: 404 })
    }

    const eventUpdateData: any = {
      title: body.title,
      description: body.description,
      shortDescription: body.shortDescription || null,
      slug:
        body.slug ??
        body.title
          ?.toLowerCase()
          .replace(/\s+/g, "-")
          .replace(/[^a-z0-9-]/g, ""),
      status: (body.status?.toUpperCase() as EventStatus) || existingEvent.status,
      category: body.category || body.eventType || null,
      tags: body.tags || body.categories || [],
      startDate: body.startDate ? new Date(body.startDate) : existingEvent.startDate,
      endDate: body.endDate ? new Date(body.endDate) : existingEvent.endDate,
      registrationStart: body.registrationStart ? new Date(body.registrationStart) : existingEvent.registrationStart,
      registrationEnd: body.registrationEnd ? new Date(body.registrationEnd) : existingEvent.registrationEnd,
      timezone: body.timezone || existingEvent.timezone,
      isVirtual: body.isVirtual ?? existingEvent.isVirtual,
      virtualLink: body.virtualLink || null,
      address: body.address || null,
      location: body.location?.venue || body.location || null,
      city: body.city || body.location?.city || null,
      state: body.state || null,
      country: body.country || body.location?.country || null,
      zipCode: body.zipCode || null,
      venueId: body.venue && ObjectId.isValid(body.venue) ? body.venue : null,
      maxAttendees: body.maxAttendees || body.capacity || null,
      currency: body.currency || existingEvent.currency,
      bannerImage: body.bannerImage || body.images?.[0]?.url || null,
      thumbnailImage: body.thumbnailImage || null,
      isPublic: body.isPublic !== false,
      requiresApproval: body.requiresApproval || false,
      allowWaitlist: body.allowWaitlist || false,
      refundPolicy: body.refundPolicy || null,
      metaTitle: body.metaTitle || null,
      metaDescription: body.metaDescription || null,
      isFeatured: body.featured || false,
      isVIP: body.vip || false,
    }

    const ticketTypesToCreate = []

    if (body.generalPrice || body.pricing?.general) {
      ticketTypesToCreate.push({
        name: "General Admission",
        description: "General admission ticket",
        price: body.generalPrice || body.pricing?.general || 0,
        quantity: body.maxAttendees || body.capacity || 100,
        isActive: true,
      })
    }

    if (body.vipPrice) {
      ticketTypesToCreate.push({
        name: "VIP",
        description: "VIP ticket with premium access",
        price: body.vipPrice,
        quantity: Math.floor((body.maxAttendees || body.capacity || 100) * 0.1),
        isActive: true,
      })
    }

    if (body.premiumPrice) {
      ticketTypesToCreate.push({
        name: "Premium",
        description: "Premium ticket with enhanced experience",
        price: body.premiumPrice,
        quantity: Math.floor((body.maxAttendees || body.capacity || 100) * 0.2),
        isActive: true,
      })
    }

    if (ticketTypesToCreate.length > 0) {
      // Delete existing ticket types and create new ones
      await prisma.ticketType.deleteMany({
        where: { eventId: eventId },
      })

      eventUpdateData.ticketTypes = {
        create: ticketTypesToCreate,
      }
    }

    // Handle exhibition spaces update if provided
    if (body.exhibitionSpaces) {
      // Delete existing exhibition spaces and create new ones
      await prisma.exhibitionSpace.deleteMany({
        where: { eventId: eventId },
      })

      eventUpdateData.exhibitionSpaces = {
        create: body.exhibitionSpaces.map((space: any) => ({
          spaceType: space.spaceType || "CUSTOM",
          name: space.name,
          description: space.description,
          basePrice: space.basePrice,
          pricePerSqm: space.pricePerSqm,
          minArea: space.minArea,
          isFixed: space.isFixed ?? false,
          additionalPowerRate: space.additionalPowerRate,
          compressedAirRate: space.compressedAirRate,
          unit: space.unit,
          area: space.area || 0,
          isAvailable: space.isAvailable !== false,
          maxBooths: space.maxBooths || null,
        })),
      }
    }

    console.log("[v0] Updating event with data keys:", Object.keys(eventUpdateData))
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

    console.log("[v0] Event updated successfully")
    return NextResponse.json(
      {
        message: "Event updated successfully",
        event: updatedEvent,
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("[v0] Error updating event:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
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
        message: "Event deleted successfully",
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("Error deleting event:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
