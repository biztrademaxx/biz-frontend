import { devLog } from "@/lib/dev-log"

import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"

interface Params {
  exhibitorId: string
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<Params> } // 👈 params is a Promise
) {
  try {
    devLog("[v0] GET /api/exhibitors/[exhibitorId]/events called")

    const session = await getServerSession(authOptions)
    if (!session) {
      devLog("[v0] No session found")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { exhibitorId } = await params // 👈 await here
    devLog("[v0] Fetching events for exhibitorId:", exhibitorId)

    if (!exhibitorId) {
      return NextResponse.json(
        { error: "exhibitorId is required" },
        { status: 400 }
      )
    }

    const booths = await prisma.exhibitorBooth.findMany({
      where: { exhibitorId },
      include: {
        event: {
          select: {
            id: true,
            slug: true,
            title: true,
            description: true,
            bannerImage: true,
            thumbnailImage: true,
            images: true,
            startDate: true,
            endDate: true,
            venue: {
              select: {
                venueName: true,
                venueAddress: true,
                venueCity: true,
                venueState: true,
                venueCountry: true,
                venueZipCode: true,
                venuepostalCode: true,
              },
            },
            status: true,
            organizer: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                company: true,
              },
            },
          },
        },
        exhibitor: {
          select: {
            firstName: true,
            lastName: true,
            company: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    const events = booths.map((booth) => ({
      id: booth.id,
      eventId: booth.eventId,
      eventSlug: booth.event.slug ?? booth.event.id,
      eventName: booth.event.title,
      bannerImage: booth.event.bannerImage ?? booth.event.images?.[0] ?? null,
      thumbnailImage: booth.event.thumbnailImage ?? booth.event.images?.[0] ?? null,
      date: booth.event.startDate.toISOString().split("T")[0],
      endDate: booth.event.endDate.toISOString().split("T")[0],
      rawStartDate: booth.event.startDate.toISOString(),
      rawEndDate: booth.event.endDate.toISOString(),
      venue: booth.event.venue
        ? {
            venueName: booth.event.venue.venueName ?? "",
            venueAddress: booth.event.venue.venueAddress ?? "",
            venueCity: booth.event.venue.venueCity ?? "",
            venueState: booth.event.venue.venueState ?? "",
            venueCountry: booth.event.venue.venueCountry ?? "",
            venueZipCode: booth.event.venue.venueZipCode ?? booth.event.venue.venuepostalCode ?? "",
          }
        : null,
      boothSize: `${booth.spaceId}`,
      boothNumber: booth.boothNumber,
      paymentStatus: booth.status === "BOOKED" ? "PAID" : "PENDING",
      setupTime: "8:00 AM - 10:00 AM",
      dismantleTime: "6:00 PM - 8:00 PM",
      passes: 5,
      passesUsed: 0,
      invoiceAmount: booth.totalCost,
      status: booth.event.status,
      specialRequests: booth.specialRequests,
      organizer: booth.event.organizer,
    }))

    devLog("[v0] Found", events.length, "events for exhibitor")

    return NextResponse.json({ events }, { status: 200 })
  } catch (error) {
    console.error("[v0] Error fetching exhibitor events:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
