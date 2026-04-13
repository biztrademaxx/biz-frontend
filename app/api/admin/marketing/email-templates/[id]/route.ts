import { NextResponse } from "next/server"
import {prisma} from "@/lib/prisma"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const template = await prisma.emailTemplate.findUnique({
      where: { id: params.id },
    })

    if (!template) {
      return NextResponse.json({ success: false, error: "Template not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: template })
  } catch (error) {
    console.error("[v0] Error fetching template:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch template" }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const template = await prisma.emailTemplate.update({
      where: { id: params.id },
      data: body,
    })

    return NextResponse.json({ success: true, data: template })
  } catch (error) {
    console.error("[v0] Error updating template:", error)
    return NextResponse.json({ success: false, error: "Failed to update template" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    await prisma.emailTemplate.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error deleting template:", error)
    return NextResponse.json({ success: false, error: "Failed to delete template" }, { status: 500 })
  }
}
