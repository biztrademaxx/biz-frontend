import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth-options"
import { prisma } from "@/lib/prisma"

// In-memory storage for demo purposes
const messageStorage: { [conversationId: string]: any[] } = {}

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions)
    const { id } = await params
    const { searchParams } = new URL(request.url)
    const contactId = searchParams.get("contactId")

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (session.user.id !== id && session.user.role !== "admin" && session.user.role !== "superadmin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    if (!contactId) {
      // Return all conversations for this organizer
      if (["admin-1", "organizer-1", "superadmin-1"].includes(id)) {
        const conversations = Object.keys(messageStorage)
          .filter((key) => key.includes(id))
          .map((conversationId) => {
            const messages = messageStorage[conversationId] || []
            const lastMessage = messages[messages.length - 1]
            const otherUserId = conversationId.split("-").find((userId) => userId !== id)

            return {
              id: conversationId,
              contactId: otherUserId,
              lastMessage: lastMessage?.content || "",
              lastMessageTime: lastMessage?.createdAt || new Date().toISOString(),
              unreadCount: messages.filter((m) => !m.isRead && m.senderId !== id).length,
            }
          })
          .sort((a, b) => new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime())

        return NextResponse.json({ conversations })
      }

      const conversations = await prisma.message.findMany({
        where: {
          OR: [{ senderId: id }, { receiverId: id }],
          // Only include messages where both sender and receiver exist
          AND: [{ sender: { isNot: null } }, { receiver: { isNot: null } }],
        },
        select: {
          id: true,
          senderId: true,
          receiverId: true,
          content: true,
          createdAt: true,
          isRead: true,
          sender: {
            select: {
              firstName: true,
              lastName: true,
              avatar: true,
            },
          },
          receiver: {
            select: {
              firstName: true,
              lastName: true,
              avatar: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      })

      // Group by conversation and filter out messages with null sender/receiver
      const conversationMap = new Map()
      conversations
        .filter((message) => message.sender && message.receiver) // Additional safety check
        .forEach((message) => {
          const otherUserId = message.senderId === id ? message.receiverId : message.senderId
          const conversationId = [id, otherUserId].sort().join("-")

          if (!conversationMap.has(conversationId)) {
            conversationMap.set(conversationId, {
              id: conversationId,
              contactId: otherUserId,
              contact: message.senderId === id ? message.receiver : message.sender,
              lastMessage: message.content,
              lastMessageTime: message.createdAt.toISOString(),
              unreadCount: 0,
            })
          }
        })

      return NextResponse.json({ conversations: Array.from(conversationMap.values()) })
    }

    // Get messages for specific conversation
    const conversationId = [id, contactId].sort().join("-")

    if (["admin-1", "organizer-1", "superadmin-1"].includes(id)) {
      const messages = messageStorage[conversationId] || []
      return NextResponse.json({ messages })
    }

    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: id, receiverId: contactId },
          { senderId: contactId, receiverId: id },
        ],
        // Ensure both sender and receiver exist
        AND: [{ sender: { isNot: null } }, { receiver: { isNot: null } }],
      },
      select: {
        id: true,
        senderId: true,
        receiverId: true,
        content: true,
        createdAt: true,
        isRead: true,
        sender: {
          select: {
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
      },
      orderBy: {
        createdAt: "asc",
      },
    })

    return NextResponse.json({ messages: messages.filter((m) => m.sender) })
  } catch (error) {
    console.error("Error fetching messages:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions)
    const { id } = await params
    const { contactId, content } = await request.json()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (session.user.id !== id && session.user.role !== "admin" && session.user.role !== "superadmin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    if (!contactId || !content) {
      return NextResponse.json({ error: "Contact ID and content are required" }, { status: 400 })
    }

    const [sender, receiver] = await Promise.all([
      prisma.user.findUnique({ where: { id } }),
      prisma.user.findUnique({ where: { id: contactId } }),
    ])

    if (!sender || !receiver) {
      return NextResponse.json({ error: "Invalid sender or receiver" }, { status: 400 })
    }

    const conversationId = [id, contactId].sort().join("-")

    if (["admin-1", "organizer-1", "superadmin-1"].includes(id)) {
      // Store in memory for demo
      if (!messageStorage[conversationId]) {
        messageStorage[conversationId] = []
      }

      const newMessage = {
        id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        senderId: id,
        receiverId: contactId,
        content,
        createdAt: new Date().toISOString(),
        isRead: false,
        sender: {
          firstName: "Current",
          lastName: "User",
          avatar: "/placeholder.svg?height=40&width=40",
        },
      }

      messageStorage[conversationId].push(newMessage)
      return NextResponse.json({ message: newMessage })
    }

    // For database users, save to database
    const newMessage = await prisma.message.create({
      data: {
        senderId: id,
        receiverId: contactId,
        content,
      },
      include: {
        sender: {
          select: {
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
      },
    })

    return NextResponse.json({ message: newMessage })
  } catch (error) {
    console.error("Error sending message:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions)
    const { id } = await params
    const { searchParams } = new URL(request.url)
    const contactId = searchParams.get("contactId")

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (session.user.id !== id && session.user.role !== "admin" && session.user.role !== "superadmin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    if (!contactId) {
      return NextResponse.json({ error: "Contact ID is required" }, { status: 400 })
    }

    const conversationId = [id, contactId].sort().join("-")

    // Handle demo users with in-memory storage
    if (["admin-1", "organizer-1", "superadmin-1"].includes(id)) {
      if (messageStorage[conversationId]) {
        delete messageStorage[conversationId]
      }
      return NextResponse.json({ success: true, message: "Conversation deleted successfully" })
    }

    // For database users, delete all messages in the conversation
    const deleteResult = await prisma.message.deleteMany({
      where: {
        OR: [
          { senderId: id, receiverId: contactId },
          { senderId: contactId, receiverId: id },
        ],
      },
    })

    return NextResponse.json({
      success: true,
      message: "Conversation deleted successfully",
      deletedCount: deleteResult.count,
    })
  } catch (error) {
    console.error("Error deleting conversation:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}