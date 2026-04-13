import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // For hardcoded users, return mock data
    if (["admin-1", "organizer-1", "superadmin-1"].includes(session.user.id)) {
      const mockOrganizers = [
        { id: "1", name: "Rajesh Kumar", company: "TechEvents India", event: "Global Tech Conference 2025" },
        { id: "2", name: "Dr. Priya Sharma", company: "MedTech Solutions", event: "Healthcare Innovation Summit" },
        { id: "3", name: "Amit Patel", company: "Corporate Solutions Ltd", event: "Annual Sales Meeting" },
        { id: "4", name: "Sneha Reddy", company: "Marketing Pro Events", event: "Digital Marketing Summit 2025" },
      ]

      return NextResponse.json({
        success: true,
        organizers: mockOrganizers,
      })
    }

    // Fetch organizers from database
    const organizers = await prisma.user.findMany({
      where: {
        role: "ORGANIZER",
        isActive: true,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        company: true,
        organizedEvents: {
          where: {
            status: { in: ["PUBLISHED", "DRAFT"] },
          },
          select: {
            title: true,
          },
          take: 1,
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    })

    const formattedOrganizers = organizers.map((org) => ({
      id: org.id,
      name: `${org.firstName} ${org.lastName}`,
      company: org.company || "No Company",
      event: org.organizedEvents[0]?.title || "No Active Events",
    }))

    return NextResponse.json({
      success: true,
      organizers: formattedOrganizers,
    })
  } catch (error) {
    console.error("Error fetching organizers:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
