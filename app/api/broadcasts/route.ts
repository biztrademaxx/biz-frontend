import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { recipientIds, message, broadcastType, title } = body

    if (!recipientIds || recipientIds.length === 0) {
      return NextResponse.json({ error: "No recipients selected" }, { status: 400 })
    }

    if (!message || !message.trim()) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 })
    }

    // For hardcoded users, simulate broadcast sending
    if (["admin-1", "organizer-1", "superadmin-1"].includes(session.user.id)) {
      // Simulate processing time
      await new Promise((resolve) => setTimeout(resolve, 1000))

      return NextResponse.json({
        success: true,
        message: `Broadcast sent successfully to ${recipientIds.length} recipients via ${broadcastType}`,
        broadcastId: `broadcast-${Date.now()}`,
        recipientCount: recipientIds.length,
      })
    }

    // Create broadcast record
    const broadcast = await prisma.broadcast.create({
      data: {
        title: title || `Broadcast - ${new Date().toLocaleDateString()}`,
        content: message,
        type: broadcastType.toUpperCase(),
        senderId: session.user.id,
        status: "SENT",
        sentAt: new Date(),
        recipients: {
          create: recipientIds.map((recipientId: string) => ({
            userId: recipientId,
            status: "SENT",
            sentAt: new Date(),
          })),
        },
      },
      include: {
        recipients: true,
      },
    })

    // Here you would integrate with actual email/SMS/WhatsApp services
    // For now, we'll just mark as sent

    return NextResponse.json({
      success: true,
      message: `Broadcast sent successfully to ${recipientIds.length} recipients via ${broadcastType}`,
      broadcastId: broadcast.id,
      recipientCount: broadcast.recipients.length,
    })
  } catch (error) {
    console.error("Error sending broadcast:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "20")
    const skip = (page - 1) * limit

    const broadcasts = await prisma.broadcast.findMany({
      where: {
        senderId: session.user.id,
      },
      include: {
        recipients: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
      },
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    })

    const total = await prisma.broadcast.count({
      where: {
        senderId: session.user.id,
      },
    })

    return NextResponse.json({
      success: true,
      broadcasts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching broadcasts:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
