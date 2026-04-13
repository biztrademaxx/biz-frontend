import { NextResponse } from "next/server"
import {prisma} from "@/lib/prisma"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category")

    const templates = await prisma.emailTemplate.findMany({
      where: {
        isActive: true,
        ...(category && category !== "all" ? { category } : {}),
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json({ success: true, data: templates })
  } catch (error) {
    console.error("[v0] Error fetching email templates:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch templates" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, subject, content, htmlContent, category } = body

    const template = await prisma.emailTemplate.create({
      data: {
        name,
        subject,
        content,
        htmlContent,
        category,
        isActive: true,
      },
    })

    return NextResponse.json({ success: true, data: template })
  } catch (error) {
    console.error("[v0] Error creating email template:", error)
    return NextResponse.json({ success: false, error: "Failed to create template" }, { status: 500 })
  }
}
