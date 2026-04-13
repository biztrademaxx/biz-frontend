import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth-options"
import { prisma } from "@/lib/prisma"

export async function DELETE(
  request: NextRequest,
  context: any // <-- avoids the Promise typing issue
) {
  try {
    const { id, replyId } = context.params as { id: string; replyId: string }

    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const review = await prisma.review.findUnique({
      where: { id },
      include: {
        event: { select: { organizerId: true } },
      },
    })

    if (!review) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 })
    }

    const reply = await prisma.reviewReply.findUnique({
      where: { id: replyId },
    })

    if (!reply) {
      return NextResponse.json({ error: "Reply not found" }, { status: 404 })
    }

    if (
      review.event?.organizerId !== session.user.id &&
      reply.userId !== session.user.id
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await prisma.reviewReply.delete({
      where: { id: replyId },
    })

    return NextResponse.json({ message: "Reply deleted successfully" })
  } catch (error) {
    console.error("Error deleting reply:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

