import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { sendBadgeEmail } from "@/lib/email-service"

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    // ✅ Await params before accessing (Next.js 15 requirement)
    const { id: eventId } = await params
    const body = await request.json()
    const { attendeeIds, badgeDataUrls } = body

    console.log("[v0] Processing bulk badge send for event:", eventId)
    console.log("[v0] Number of attendees:", attendeeIds?.length)

    if (!attendeeIds || !Array.isArray(attendeeIds) || attendeeIds.length === 0) {
      return NextResponse.json({ error: "attendeeIds array is required" }, { status: 400 })
    }

    if (!badgeDataUrls || typeof badgeDataUrls !== "object") {
      return NextResponse.json({ error: "badgeDataUrls object is required" }, { status: 400 })
    }

    const results = {
      success: [] as string[],
      failed: [] as { id: string; email: string; error: string }[],
    }

    // Process each attendee
    for (const attendeeId of attendeeIds) {
      try {
        console.log("[v0] Processing attendee:", attendeeId)

        // Fetch attendee lead with user and event data
        const attendeeLead = await prisma.eventLead.findUnique({
          where: { id: attendeeId },
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
            event: {
              select: {
                title: true,
              },
            },
          },
        })

        if (!attendeeLead || !attendeeLead.user) {
          console.log("[v0] Attendee lead not found for ID:", attendeeId)
          results.failed.push({
            id: attendeeId,
            email: "unknown",
            error: "Attendee not found",
          })
          continue
        }

        const attendee = attendeeLead.user
        const event = attendeeLead.event
        const attendeeName = `${attendee.firstName} ${attendee.lastName}`
        const attendeeEmail = attendee.email || ""
        const badgeDataUrl = badgeDataUrls[attendeeId]

        if (!badgeDataUrl) {
          console.log("[v0] Badge data URL not found for attendee:", attendeeId)
          results.failed.push({
            id: attendeeId,
            email: attendeeEmail,
            error: "Badge data not found",
          })
          continue
        }

        console.log("[v0] Found attendee:", attendeeName, "for event:", event.title)

        // Save badge to database
        const badgeSent = await prisma.badgeSent.create({
          data: {
            eventId,
            attendeeId: attendee.id,
            email: attendeeEmail,
            badgeUrl: badgeDataUrl,
            status: "SENT",
          },
        })

        console.log("[v0] Badge record saved to database:", badgeSent.id)

        // Send email
        try {
          await sendBadgeEmail(attendeeEmail, badgeDataUrl, attendeeName, event.title)

          console.log("[v0] Badge email sent successfully to:", attendeeEmail)
          results.success.push(attendeeId)
        } catch (emailError) {
          console.error("[v0] Failed to send badge email:", emailError)

          // Update badge status to FAILED
          await prisma.badgeSent.update({
            where: { id: badgeSent.id },
            data: { status: "FAILED" },
          })

          results.failed.push({
            id: attendeeId,
            email: attendeeEmail,
            error: "Email sending failed",
          })
        }
      } catch (attendeeError) {
        console.error("[v0] Error processing attendee:", attendeeId, attendeeError)
        results.failed.push({
          id: attendeeId,
          email: "unknown",
          error: attendeeError instanceof Error ? attendeeError.message : "Unknown error",
        })
      }
    }

    console.log("[v0] Bulk badge send complete. Success:", results.success.length, "Failed:", results.failed.length)

    // Return results
    return NextResponse.json({
      success: true,
      message: `Processed ${attendeeIds.length} attendees. ${results.success.length} succeeded, ${results.failed.length} failed.`,
      data: results,
    })
  } catch (error) {
    console.error("[v0] Error in bulk badge send:", error)
    return NextResponse.json({ error: "Error processing bulk badge send" }, { status: 500 })
  }
}
