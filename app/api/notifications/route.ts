import { type NextRequest, NextResponse } from "next/server"
import {prisma} from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    // Fetch push notifications that have been sent (status = 'sent')
    const pushNotifications = await prisma.pushNotification.findMany({
      where: {
        status: "sent",
      },
      orderBy: {
        sentAt: "desc",
      },
      take: 50,
    })

    console.log("[v0] Fetched push notifications:", pushNotifications.length)

    // For now, we'll treat all notifications as unread since PushNotification doesn't have per-user read status
    // In production, you might want to track read status per user in a separate table
    return NextResponse.json({
      notifications: pushNotifications.map((notif) => ({
        id: notif.id,
        type: "push",
        title: notif.title,
        message: notif.message,
        isRead: false, // Default to unread for now
        createdAt: (notif.sentAt || notif.createdAt).toISOString(),
        priority: notif.priority,
        imageUrl: notif.imageUrl,
        actionUrl: notif.actionUrl,
      })),
      unreadCount: pushNotifications.length, // All are unread for now
    })
  } catch (error) {
    console.error("[v0] Error fetching notifications:", error)
    return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 })
  }
}
