import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// GET - Fetch all push notifications
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const limit = Number.parseInt(searchParams.get("limit") || "50")
    const offset = Number.parseInt(searchParams.get("offset") || "0")

    const where = status && status !== "all" ? { status } : {}

    const [notifications, total] = await Promise.all([
      prisma.pushNotification.findMany({
        where,
        take: limit,
        skip: offset,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          title: true,
          message: true,
          imageUrl: true,
          actionUrl: true,
          status: true,
          priority: true,
          targetAudiences: true,
          targetPlatforms: true,
          scheduledAt: true,
          sentAt: true,
          createdAt: true,
          totalRecipients: true,
          sent: true,
          delivered: true,
          opened: true,
          clicked: true,
          failed: true,
          deliveryRate: true,
          openRate: true,
          clickRate: true,
          failureRate: true,
        },
      }),
      prisma.pushNotification.count({ where }),
    ])

    // Format response to match frontend expectations
    const formattedNotifications = notifications.map((notification) => ({
      id: notification.id,
      title: notification.title,
      body: notification.message,
      imageUrl: notification.imageUrl,
      actionUrl: notification.actionUrl,
      status: notification.status,
      priority: notification.priority,
      targetAudiences: notification.targetAudiences,
      targetPlatforms: notification.targetPlatforms,
      scheduledAt: notification.scheduledAt?.toISOString(),
      sentAt: notification.sentAt?.toISOString(),
      createdAt: notification.createdAt.toISOString(),
      stats: {
        totalRecipients: notification.totalRecipients,
        sent: notification.sent,
        delivered: notification.delivered,
        opened: notification.opened,
        clicked: notification.clicked,
        failed: notification.failed,
      },
      engagement: {
        openRate: notification.openRate,
        clickRate: notification.clickRate,
        deliveryRate: notification.deliveryRate,
        failureRate: notification.failureRate,
      },
    }))

    return NextResponse.json({
      success: true,
      data: formattedNotifications,
      total,
    })
  } catch (error) {
    console.error("[v0] Error fetching push notifications:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch push notifications" }, { status: 500 })
  }
}

// POST - Create new push notification
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      title,
      bodyText,
      imageUrl,
      actionUrl,
      targetAudiences,
      targetPlatforms = ["ios", "android", "web"],
      priority = "medium",
      scheduledAt,
      sendImmediately = false,
    } = body

    // Validation
    if (!title || !bodyText) {
      return NextResponse.json({ success: false, error: "Title and body are required" }, { status: 400 })
    }

    const newNotification = await prisma.pushNotification.create({
      data: {
        title,
        message: bodyText,
        imageUrl,
        actionUrl,
        targetAudiences: targetAudiences || [],
        targetPlatforms,
        status: sendImmediately ? "sending" : "scheduled",
        priority,
        scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
        sentAt: sendImmediately ? new Date() : null,
      },
    })

    // Format response
    const formattedNotification = {
      id: newNotification.id,
      title: newNotification.title,
      body: newNotification.message,
      imageUrl: newNotification.imageUrl,
      actionUrl: newNotification.actionUrl,
      targetAudiences: newNotification.targetAudiences,
      targetPlatforms: newNotification.targetPlatforms,
      status: newNotification.status,
      priority: newNotification.priority,
      scheduledAt: newNotification.scheduledAt?.toISOString(),
      createdAt: newNotification.createdAt.toISOString(),
      stats: {
        totalRecipients: 0,
        sent: 0,
        delivered: 0,
        opened: 0,
        clicked: 0,
        failed: 0,
      },
      engagement: {
        openRate: 0,
        clickRate: 0,
        deliveryRate: 0,
        failureRate: 0,
      },
    }

    return NextResponse.json({
      success: true,
      data: formattedNotification,
      message: sendImmediately ? "Notification is being sent" : "Notification scheduled successfully",
    })
  } catch (error) {
    console.error("[v0] Error creating push notification:", error)
    return NextResponse.json({ success: false, error: "Failed to create push notification" }, { status: 500 })
  }
}