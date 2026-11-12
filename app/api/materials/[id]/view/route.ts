import { type NextRequest, NextResponse } from "next/server"
import { prisma as legacyPrisma } from "@/lib/prisma"

// POST - Track material view
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const prisma = legacyPrisma
  if (!prisma) return NextResponse.json({ error: "Database is not configured for this legacy endpoint" }, { status: 503 })

  try {
    await prisma.material.update({
      where: { id: (await params).id },
      data: {
        viewCount: {
          increment: 1,
        },
      },
    })

    return NextResponse.json({ message: "View tracked successfully" }, { status: 200 })
  } catch (error) {
    console.error("Error tracking view:", error)
    return NextResponse.json({ error: "Failed to track view" }, { status: 500 })
  }
}
