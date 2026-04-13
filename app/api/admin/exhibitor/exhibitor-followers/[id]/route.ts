import { type NextRequest, NextResponse } from "next/server"
import {prisma} from "@/lib/prisma"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params

    // Fetch exhibitor with followers
    const exhibitor = await prisma.user.findUnique({
      where: {
        id,
        role: "EXHIBITOR",
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        company: true,
        avatar: true,
        totalEvents: true,
        activeEvents: true,
        createdAt: true,
        followers: {
          select: {
            id: true,
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
      },
    })

    if (!exhibitor) {
      return NextResponse.json({ success: false, error: "Exhibitor not found" }, { status: 404 })
    }

    // Transform the data
    const exhibitorData = {
      id: exhibitor.id,
      name: `${exhibitor.firstName} ${exhibitor.lastName}`,
      email: exhibitor.email || "",
      company: exhibitor.company || "N/A",
      avatar: exhibitor.avatar,
      totalFollowers: exhibitor.followers.length,
      totalEvents: exhibitor.totalEvents,
      activeEvents: exhibitor.activeEvents,
      joinedDate: exhibitor.createdAt.toISOString(),
      followers: exhibitor.followers.map((follow) => ({
        id: follow.follower.id,
        name: `${follow.follower.firstName} ${follow.follower.lastName}`,
        email: follow.follower.email || "",
        avatar: follow.follower.avatar,
        role: follow.follower.role,
        followedAt: follow.createdAt.toISOString(),
      })),
    }

    return NextResponse.json(exhibitorData)
  } catch (error) {
    console.error("Error fetching exhibitor details:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch exhibitor details" }, { status: 500 })
  }
}
