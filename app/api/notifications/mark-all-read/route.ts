import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import {prisma} from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id

    // Mark all notifications as read
    await prisma.notification.updateMany({
      where: {
        userId: userId,
        isRead: false,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    })

    // The read status will be tracked on the client side using localStorage
    console.log("[v0] Marking all notifications as read")

    // For PushNotifications, we don't have per-user read tracking in the database
    // The frontend will handle read status using localStorage
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error marking all notifications as read:", error)
    return NextResponse.json({ error: "Failed to mark notifications as read" }, { status: 500 })
  }
}
