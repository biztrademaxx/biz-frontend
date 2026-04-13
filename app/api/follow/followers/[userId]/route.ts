import { type NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function GET(request: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  try {
    const { userId } =await params

    const followers = await prisma.follow.findMany({
      where: { followingId: userId },
      include: {
        follower: {
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

    const formattedFollowers = followers.map((follow) => ({
      id: follow.follower.id,
      firstName: follow.follower.firstName,
      lastName: follow.follower.lastName,
      email: follow.follower.email,
      avatar: follow.follower.avatar,
      jobTitle: follow.follower.jobTitle,
      followedAt: follow.createdAt.toISOString(),
    }))

    return NextResponse.json({
      success: true,
      followers: formattedFollowers,
    })
  } catch (error) {
    console.error("Error fetching followers:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch followers" }, { status: 500 })
  }
}
