import { NextResponse } from "next/server"
import{ prisma as legacyPrisma }from "@/lib/prisma"

export async function GET() {
  const prisma = legacyPrisma
  if (!prisma) return NextResponse.json({ error: "Database is not configured for this legacy endpoint" }, { status: 503 })

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
