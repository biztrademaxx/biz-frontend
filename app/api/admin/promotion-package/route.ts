import { NextResponse } from "next/server"
import {prisma} from "@/lib/prisma"

export async function GET() {
  try {
    const packages = await prisma.promotionPackage.findMany({
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
    })

    return NextResponse.json({ packages })
  } catch (error) {
    console.error("Error fetching promotion packages:", error)
    return NextResponse.json({ error: "Failed to fetch packages" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const pkg = await prisma.promotionPackage.create({
      data: {
        name: body.name,
        description: body.description,
        price: body.price,
        features: body.features,
        userCount: body.userCount,
        duration: body.duration,
        durationDays: body.durationDays,
        categories: body.categories,
        recommended: body.recommended || false,
        isActive: body.isActive !== undefined ? body.isActive : true,
        userType: body.userType || "BOTH",
        order: body.order || 0,
      },
    })

    return NextResponse.json({ package: pkg }, { status: 201 })
  } catch (error) {
    console.error("Error creating promotion package:", error)
    return NextResponse.json({ error: "Failed to create package" }, { status: 500 })
  }
}
