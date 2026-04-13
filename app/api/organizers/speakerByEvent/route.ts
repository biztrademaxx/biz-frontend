import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"

export async function GET(request: NextRequest) {
  try {
    console.log("[v0] GET /api/events/speaker-sessions called")

    const { searchParams } = new URL(request.url)
    const eventId = searchParams.get("eventId")
    const speakerId = searchParams.get("speakerId")
    const organizerId = searchParams.get("organizerId")

    // Require at least one filter
    if (!eventId && !speakerId && !organizerId) {
      return NextResponse.json(
        { success: false, error: "eventId, speakerId, or organizerId is required" },
        { status: 400 }
      )
    }

    const sessions = await prisma.speakerSession.findMany({
      where: {
        ...(eventId ? { eventId } : {}),
        ...(speakerId ? { speakerId } : {}),
        ...(organizerId
          ? {
              event: {
                organizerId: {
                  equals: organizerId,
                },
              },
            }
          : {}),
      },
      include: {
        speaker: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatar: true,
            company: true,
            jobTitle: true,
          },
        },
        event: {
          select: {
            id: true,
            title: true,
            startDate: true,
            endDate: true,
            organizerId: true,
          },
        },
      },
      orderBy: {
        startTime: "asc",
      },
    })

    if (!sessions || sessions.length === 0) {
      return NextResponse.json(
        { success: true, sessions: [], message: "No sessions found" },
        { status: 200 }
      )
    }

    return NextResponse.json({ success: true, sessions }, { status: 200 })
  } catch (error) {
    console.error("Error fetching speaker sessions:", error)
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const {
      eventId,
      speakerId,
      title,
      description,
      sessionType,
      duration,
      startTime,
      endTime,
      room,
      abstract,
      learningObjectives,
      targetAudience,
      materials,
    } = body

    if (!eventId || !speakerId || !title || !sessionType || !duration) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Check if user is organizer of the event
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: { organizerId: true },
    })

    if (!event || event.organizerId !== session.user.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized to modify this event" },
        { status: 403 }
      )
    }

    // Check if speaker exists
    const speaker = await prisma.user.findUnique({
      where: { id: speakerId, role: "SPEAKER" },
    })

    if (!speaker) {
      return NextResponse.json(
        { success: false, error: "Speaker not found" },
        { status: 404 }
      )
    }

    const speakerSession = await prisma.speakerSession.create({
      data: {
        eventId,
        speakerId,
        title,
        description,
        sessionType,
        duration: Number.parseInt(duration),
        startTime: startTime ? new Date(startTime) : new Date(),
        endTime: endTime ? new Date(endTime) : new Date(),
        room,
        abstract,
        learningObjectives: learningObjectives || [],
        targetAudience,
        materials: materials || [],
      },
      include: {
        speaker: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatar: true,
            company: true,
            jobTitle: true,
          },
        },
      },
    })

    return NextResponse.json({
      success: true,
      speakerSession,
      message: "Speaker added to event successfully",
    })
  } catch (error) {
    console.error("Error adding speaker to event:", error)
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    )
  }
}
