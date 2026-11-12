import { type NextRequest, NextResponse } from "next/server"
import { prisma as legacyPrisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  const prisma = legacyPrisma
  if (!prisma) return NextResponse.json({ error: "Database is not configured for this legacy endpoint" }, { status: 503 })

  try {
    // Fetch all exhibitors with their follower counts
    const exhibitors = await prisma.user.findMany({
      where: {
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
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    // Transform the data
    const exhibitorsData = exhibitors.map((exhibitor) => ({
      id: exhibitor.id,
      name: `${exhibitor.firstName} ${exhibitor.lastName}`,
      email: exhibitor.email || "",
      company: exhibitor.company || "N/A",
      avatar: exhibitor.avatar,
      totalFollowers: exhibitor.followers.length,
      totalEvents: exhibitor.totalEvents,
      activeEvents: exhibitor.activeEvents,
      joinedDate: exhibitor.createdAt.toISOString(),
    }))

    return NextResponse.json({
      success: true,
      exhibitors: exhibitorsData,
    })
  } catch (error) {
    console.error("Error fetching exhibitor followers:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch exhibitor followers" }, { status: 500 })
  }
}
