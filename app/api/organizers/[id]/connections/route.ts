import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth-options"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions)
    const { id } = await params

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check authorization
    if (session.user.id !== id && session.user.role !== "admin" && session.user.role !== "superadmin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // For hardcoded organizers, return mock connections
    if (["admin-1", "organizer-1", "superadmin-1"].includes(id)) {
      const mockConnections = [
        {
          id: "user-1",
          firstName: "John",
          lastName: "Doe",
          email: "john.doe@example.com",
          avatar: "/placeholder.svg?height=40&width=40",
          role: "ATTENDEE",
          company: "Tech Corp",
          jobTitle: "Software Engineer",
          lastLogin: new Date(Date.now() - 3600000).toISOString(),
          isOnline: true,
        },
        {
          id: "user-2",
          firstName: "Jane",
          lastName: "Smith",
          email: "jane.smith@example.com",
          avatar: "/placeholder.svg?height=40&width=40",
          role: "SPEAKER",
          company: "Innovation Labs",
          jobTitle: "CTO",
          lastLogin: new Date(Date.now() - 7200000).toISOString(),
          isOnline: false,
        },
        {
          id: "user-3",
          firstName: "Mike",
          lastName: "Johnson",
          email: "mike.johnson@example.com",
          avatar: "/placeholder.svg?height=40&width=40",
          role: "EXHIBITOR",
          company: "Display Solutions",
          jobTitle: "Sales Manager",
          lastLogin: new Date(Date.now() - 86400000).toISOString(),
          isOnline: false,
        },
        {
          id: "user-4",
          firstName: "Sarah",
          lastName: "Wilson",
          email: "sarah.wilson@example.com",
          avatar: "/placeholder.svg?height=40&width=40",
          role: "ATTENDEE",
          company: "Marketing Plus",
          jobTitle: "Marketing Director",
          lastLogin: new Date(Date.now() - 172800000).toISOString(),
          isOnline: false,
        },
        {
          id: "user-5",
          firstName: "David",
          lastName: "Brown",
          email: "david.brown@example.com",
          avatar: "/placeholder.svg?height=40&width=40",
          role: "ORGANIZER",
          company: "Event Masters",
          jobTitle: "Event Coordinator",
          lastLogin: new Date(Date.now() - 1800000).toISOString(),
          isOnline: true,
        },
        {
          id: "user-6",
          firstName: "Emily",
          lastName: "Davis",
          email: "emily.davis@example.com",
          avatar: "/placeholder.svg?height=40&width=40",
          role: "VENUE_MANAGER",
          company: "Premium Venues",
          jobTitle: "Venue Manager",
          lastLogin: new Date(Date.now() - 5400000).toISOString(),
          isOnline: false,
        },
        {
          id: "user-7",
          firstName: "Alex",
          lastName: "Thompson",
          email: "alex.thompson@example.com",
          avatar: "/placeholder.svg?height=40&width=40",
          role: "ADMIN",
          company: "Platform Admin",
          jobTitle: "System Administrator",
          lastLogin: new Date(Date.now() - 900000).toISOString(),
          isOnline: true,
        },
      ]

      return NextResponse.json({ connections: mockConnections })
    }

    // For database users, get all users except self (they can connect to anyone)
    const connections = await prisma.user.findMany({
      where: {
        AND: [
          { id: { not: id } }, // Exclude self
          { isActive: true }, // Only active users
        ],
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        avatar: true,
        role: true,
        company: true,
        jobTitle: true,
        lastLogin: true,
        // Note: isOnline would need to be implemented with real-time presence
      },
      orderBy: [
        { lastLogin: "desc" }, // Most recently active first
        { firstName: "asc" }, // Then alphabetical
      ],
      take: 100, // Limit for performance
    })

    // Transform the data to match frontend expectations
    const transformedConnections = connections.map((user) => ({
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      avatar: user.avatar || "/placeholder.svg?height=40&width=40",
      role: user.role,
      company: user.company || "No Company",
      jobTitle: user.jobTitle || "No Title",
      lastLogin: user.lastLogin?.toISOString() || new Date().toISOString(),
      isOnline: false, // Would need real-time presence system
    }))

    return NextResponse.json({ connections: transformedConnections })
  } catch (error) {
    console.error("Error fetching connections:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
