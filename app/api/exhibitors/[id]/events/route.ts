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
    console.log("[v0] GET /api/exhibitors/[exhibitorId]/events called")

    const session = await getServerSession(authOptions)
    if (!session) {
      console.log("[v0] No session found")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { exhibitorId } = await params // 👈 await here
    console.log("[v0] Fetching events for exhibitorId:", exhibitorId)

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
            title: true,
            description: true,
            startDate: true,
            endDate: true,
            venue: true,
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
      eventName: booth.event.title,
      date: booth.event.startDate.toISOString().split("T")[0],
      endDate: booth.event.endDate.toISOString().split("T")[0],
      venue: booth.event.venue || "TBD",
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

    console.log("[v0] Found", events.length, "events for exhibitor")

    return NextResponse.json({ events }, { status: 200 })
  } catch (error) {
    console.error("[v0] Error fetching exhibitor events:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
