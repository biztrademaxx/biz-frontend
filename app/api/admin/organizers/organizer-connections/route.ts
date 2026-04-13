import { NextResponse } from "next/server"
import{ prisma }from "@/lib/prisma"

export async function GET() {
  try {
    // Fetch all organizers with their follower counts
    const organizers = await prisma.user.findMany({
      where: {
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
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    // Transform the data to include follower count
    const transformedOrganizers = organizers.map((organizer) => ({
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
    }))

    return NextResponse.json(transformedOrganizers)
  } catch (error) {
    console.error("Error fetching organizer connections:", error)
    return NextResponse.json({ error: "Failed to fetch organizer connections" }, { status: 500 })
  }
}
