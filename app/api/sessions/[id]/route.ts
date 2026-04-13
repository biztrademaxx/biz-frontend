import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } =await params
    const body = await request.json()

    // Validate YouTube URL if provided
    if (body.youtube) {
      const youtubeUrls = Array.isArray(body.youtube) ? body.youtube : [body.youtube]
      const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/

      for (const url of youtubeUrls) {
        if (!youtubeRegex.test(url)) {
          return NextResponse.json({ error: `Invalid YouTube URL: ${url}` }, { status: 400 })
        }
      }
    }

    const session = await prisma.speakerSession.update({
      where: { id },
      data: {
        ...(body.youtube !== undefined && { youtube: body.youtube }),
        ...(body.title && { title: body.title }),
        ...(body.description && { description: body.description }),
        ...(body.abstract && { abstract: body.abstract }),
        ...(body.learningObjectives && { learningObjectives: body.learningObjectives }),
        ...(body.targetAudience && { targetAudience: body.targetAudience }),
      },
      include: {
        event: {
          select: {
            id: true,
            title: true,
          },
        },
        materials: true,
      },
    })

    return NextResponse.json({ session })
  } catch (error) {
    console.error("Error updating session:", error)
    return NextResponse.json({ error: "Failed to update session" }, { status: 500 })
  }
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } =await params

    const session = await prisma.speakerSession.findUnique({
      where: { id },
      include: {
        event: {
          select: {
            id: true,
            title : true
          },
        },
        materials: true,
      },
    })

    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 })
    }

    return NextResponse.json({ session })
  } catch (error) {
    console.error("Error fetching session:", error)
    return NextResponse.json({ error: "Failed to fetch session" }, { status: 500 })
  }
}
