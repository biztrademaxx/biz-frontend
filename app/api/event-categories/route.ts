import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

/**
 * Public list of active event categories (for homepage, organizer forms, etc.).
 * No auth required — read-only.
 */
export async function GET() {
  try {
    const rows = await prisma.eventCategory.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        icon: true,
        color: true,
      },
    })

    return NextResponse.json({
      success: true,
      data: rows,
    })
  } catch (e) {
    console.error("[event-categories] GET:", e)
    return NextResponse.json(
      { success: false, error: "Failed to load categories", data: [] },
      { status: 500 },
    )
  }
}
