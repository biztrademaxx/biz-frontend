import { type NextRequest, NextResponse } from "next/server"
import {prisma} from "@/lib/prisma"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const bannerId = params.id

    // Increment click count
    await prisma.banner.update({
      where: { id: bannerId },
      data: {
        clickCount: { increment: 1 },
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error tracking banner click:", error)
    return NextResponse.json({ error: "Failed to track click" }, { status: 500 })
  }
}
