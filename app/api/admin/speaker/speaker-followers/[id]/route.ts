import { NextResponse } from "next/server"
import {prisma} from "@/lib/prisma"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params

    // Fetch speaker with followers
    const speaker = await prisma.user.findUnique({
      where: {
        id: id,
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
            followerId: true,
            createdAt: true,
            follower: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                avatar: true,
                role: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
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

    if (!speaker) {
      return NextResponse.json({ error: "Speaker not found" }, { status: 404 })
    }

    // Transform the data
    const totalSessions = speaker.speakerSessions.length
    const activeSessions = speaker.speakerSessions.filter(
      (session) => session.status === "SCHEDULED" || session.status === "IN_PROGRESS",
    ).length

    const transformedFollowers = speaker.followers.map((follow) => ({
      id: follow.id,
      userId: follow.follower.id,
      name: `${follow.follower.firstName} ${follow.follower.lastName}`,
      email: follow.follower.email || "",
      avatar: follow.follower.avatar,
      role: follow.follower.role,
      followedAt: follow.createdAt.toISOString(),
    }))

    const response = {
      id: speaker.id,
      name: `${speaker.firstName} ${speaker.lastName}`,
      email: speaker.email || "",
      avatar: speaker.avatar,
      totalFollowers: speaker.followers.length,
      totalSessions: totalSessions,
      activeSessions: activeSessions,
      followers: transformedFollowers,
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error("Error fetching speaker followers:", error)
    return NextResponse.json({ error: "Failed to fetch speaker followers" }, { status: 500 })
  }
}
