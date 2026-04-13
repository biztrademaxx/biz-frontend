import { type NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

// GET - Get follower and following counts for a user
export async function GET(request: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  try {
    const [followersCount, followingCount] = await Promise.all([
      prisma.follow.count({
        where: { followingId:(await params).userId },
      }),
      prisma.follow.count({
        where: { followerId: (await params).userId },
      }),
    ])

    return NextResponse.json({
      followers: followersCount,
      following: followingCount,
    })
  } catch (error) {
    console.error("[v0] Error fetching follow stats:", error)
    return NextResponse.json({ error: "Failed to fetch follow stats" }, { status: 500 })
  }
}
