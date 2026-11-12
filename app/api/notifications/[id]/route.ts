import { devLog } from "@/lib/dev-log"

import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma as legacyPrisma } from "@/lib/prisma"

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const prisma = legacyPrisma
  if (!prisma) return NextResponse.json({ error: "Database is not configured for this legacy endpoint" }, { status: 503 })

  try {
    const session = await getServerSession()

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()

    // Verify the notification belongs to the user
    const notification = await prisma.notification.findUnique({
      where: { id },
    })

    if (!notification || notification.userId !== session.user.id) {
      return NextResponse.json({ error: "Notification not found" }, { status: 404 })
    }

    // Update notification
    const updatedNotification = await prisma.notification.update({
      where: { id },
      data: {
        isRead: body.isRead ?? notification.isRead,
        readAt: body.isRead ? new Date() : notification.readAt,
      },
    })

    // For PushNotifications, we don't have per-user read tracking in the database
    // The frontend will handle read status using localStorage
    // if (notification.type === "PushNotification") {
    //   devLog("[v0] Marking notification as read:", id)
    //   return NextResponse.json({
    //     success: true,
    //     message: "Notification marked as read (client-side)",
    //   })
    // }

    return NextResponse.json({
      success: true,
      notification: updatedNotification,
    })
  } catch (error) {
    console.error("[v0] Error updating notification:", error)
    return NextResponse.json({ error: "Failed to update notification" }, { status: 500 })
  }
}
