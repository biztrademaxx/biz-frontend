import { type NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function GET(request: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  try {
    const { userId } =await params

    const following = await prisma.follow.findMany({
      where: { followerId: userId },
      include: {
        following: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatar: true,
            jobTitle: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    const formattedFollowing = following.map((follow) => ({
      id: follow.following.id,
      firstName: follow.following.firstName,
      lastName: follow.following.lastName,
      email: follow.following.email,
      avatar: follow.following.avatar,
      jobTitle: follow.following.jobTitle,
      followedAt: follow.createdAt.toISOString(),
    }))

    return NextResponse.json({
      success: true,
      following: formattedFollowing,
    })
  } catch (error) {
    console.error("Error fetching following:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch following" }, { status: 500 })
  }
}
