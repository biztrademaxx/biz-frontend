import { NextResponse } from "next/server"
import {prisma} from "@/lib/prisma"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userType = searchParams.get("userType") // "EXHIBITOR" or "ORGANIZER"

    const where: any = {
      isActive: true,
    }

    // Filter by user type
    if (userType) {
      where.OR = [{ userType: "BOTH" }, { userType }]
    }

    const packages = await prisma.promotionPackage.findMany({
      where,
      orderBy: [{ recommended: "desc" }, { order: "asc" }, { price: "asc" }],
    })

    return NextResponse.json({ packages })
  } catch (error) {
    console.error("Error fetching promotion packages:", error)
    return NextResponse.json({ error: "Failed to fetch packages" }, { status: 500 })
  }
}
