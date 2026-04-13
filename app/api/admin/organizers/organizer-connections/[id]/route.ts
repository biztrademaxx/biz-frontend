import { NextResponse } from "next/server"
import {prisma} from "@/lib/prisma"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params

    // Fetch organizer with all followers
    const organizer = await prisma.user.findUnique({
      where: {
        id: id,
        role: "ORGANIZER",
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        avatar: true,
        organizationName: true,
        totalEvents: true,
        activeEvents: true,
        createdAt: true,
        followers: {
          select: {
            id: true,
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
            createdAt: true,
          },
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    })

    if (!organizer) {
      return NextResponse.json({ error: "Organizer not found" }, { status: 404 })
    }

    // Transform the data
    const result = {
      organizer: {
        id: organizer.id,
        firstName: organizer.firstName,
        lastName: organizer.lastName,
        email: organizer.email,
        avatar: organizer.avatar,
        organizationName: organizer.organizationName,
        totalFollowers: organizer.followers.length,
        totalEvents: organizer.totalEvents,
        activeEvents: organizer.activeEvents,
        createdAt: organizer.createdAt.toISOString(),
      },
      followers: organizer.followers.map((follow) => ({
        id: follow.follower.id,
        firstName: follow.follower.firstName,
        lastName: follow.follower.lastName,
        email: follow.follower.email,
        avatar: follow.follower.avatar,
        role: follow.follower.role,
        followedAt: follow.createdAt.toISOString(),
      })),
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error fetching organizer connection details:", error)
    return NextResponse.json({ error: "Failed to fetch connection details" }, { status: 500 })
  }
}
