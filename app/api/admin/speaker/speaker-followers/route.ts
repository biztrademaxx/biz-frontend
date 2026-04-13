import { NextResponse } from "next/server"
import {prisma} from "@/lib/prisma"

export async function GET() {
  try {
    // Fetch all speakers with their follower counts and session statistics
    const speakers = await prisma.user.findMany({
      where: {
        role: "SPEAKER",
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        avatar: true,
        followers: {
          select: {
            id: true,
          },
        },
        speakerSessions: {
          select: {
            id: true,
            status: true,
          },
        },
      },
    })

    // Transform the data
    const transformedSpeakers = speakers.map((speaker) => {
      const totalSessions = speaker.speakerSessions.length
      const activeSessions = speaker.speakerSessions.filter(
        (session) => session.status === "SCHEDULED" || session.status === "IN_PROGRESS",
      ).length

      return {
        id: speaker.id,
        name: `${speaker.firstName} ${speaker.lastName}`,
        email: speaker.email || "",
        avatar: speaker.avatar,
        totalFollowers: speaker.followers.length,
        totalSessions: totalSessions,
        activeSessions: activeSessions,
      }
    })

    // Sort by total followers (descending)
    transformedSpeakers.sort((a, b) => b.totalFollowers - a.totalFollowers)

    return NextResponse.json(transformedSpeakers)
  } catch (error) {
    console.error("Error fetching speakers:", error)
    return NextResponse.json({ error: "Failed to fetch speakers" }, { status: 500 })
  }
}
