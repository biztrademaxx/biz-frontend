import { NextResponse } from "next/server"
import {prisma} from "@/lib/prisma"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const pkg = await prisma.promotionPackage.findUnique({
      where: { id: params.id },
    })

    if (!pkg) {
      return NextResponse.json({ error: "Package not found" }, { status: 404 })
    }

    return NextResponse.json({ package: pkg })
  } catch (error) {
    console.error("Error fetching promotion package:", error)
    return NextResponse.json({ error: "Failed to fetch package" }, { status: 500 })
  }
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()

    const pkg = await prisma.promotionPackage.update({
      where: { id: params.id },
      data: {
        ...(body.name && { name: body.name }),
        ...(body.description && { description: body.description }),
        ...(body.price !== undefined && { price: body.price }),
        ...(body.features && { features: body.features }),
        ...(body.userCount !== undefined && { userCount: body.userCount }),
        ...(body.duration && { duration: body.duration }),
        ...(body.durationDays !== undefined && { durationDays: body.durationDays }),
        ...(body.categories && { categories: body.categories }),
        ...(body.recommended !== undefined && { recommended: body.recommended }),
        ...(body.isActive !== undefined && { isActive: body.isActive }),
        ...(body.userType && { userType: body.userType }),
        ...(body.order !== undefined && { order: body.order }),
      },
    })

    return NextResponse.json({ package: pkg })
  } catch (error) {
    console.error("Error updating promotion package:", error)
    return NextResponse.json({ error: "Failed to update package" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    await prisma.promotionPackage.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting promotion package:", error)
    return NextResponse.json({ error: "Failed to delete package" }, { status: 500 })
  }
}
