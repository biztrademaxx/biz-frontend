import { type NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

// DELETE - Remove exhibitor booth
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; exhibitorId: string }> },
) {
  const { exhibitorId } = await params

  try {
    await prisma.exhibitorBooth.delete({
      where: { id: exhibitorId },
    })

    return NextResponse.json({ message: "Exhibitor removed successfully" })
  } catch (error) {
    console.error("Error deleting exhibitor:", error)
    return NextResponse.json({ error: "Failed to delete exhibitor" }, { status: 500 })
  }
}
