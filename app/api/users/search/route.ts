import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth-options"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')

    if (!query) {
      return NextResponse.json({ users: [] })
    }

    // Search users by name, company, or job title
    const users = await prisma.user.findMany({
      where: {
        AND: [
          { id: { not: session.user.id } }, // Exclude current user
          {
            OR: [
              { firstName: { contains: query, mode: 'insensitive' } },
              { lastName: { contains: query, mode: 'insensitive' } },
              { company: { contains: query, mode: 'insensitive' } },
              { jobTitle: { contains: query, mode: 'insensitive' } }
            ]
          }
        ]
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        jobTitle: true,
        company: true,
        avatar: true
      },
      take: 20
    })

    return NextResponse.json({ users })
  } catch (error) {
    console.error("Error searching users:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}