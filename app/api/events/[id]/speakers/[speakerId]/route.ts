import { type NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

// DELETE - Remove speaker session
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string; speakerId: string }> }) {
  try {
    await prisma.speakerSession.delete({
      where: { id: (await params).speakerId },
    })

    return NextResponse.json({ message: "Speaker removed successfully" })
  } catch (error) {
    console.error("Error deleting speaker:", error)
    return NextResponse.json({ error: "Failed to delete speaker" }, { status: 500 })
  }
}
