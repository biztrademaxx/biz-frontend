import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import {Cloudinary} from "@/lib/cloudinary"

// GET - Fetch materials (optionally filtered by sessionId or speakerId)
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const sessionId = searchParams.get("sessionId")
    const speakerId = searchParams.get("speakerId")

    const where: any = {}
    if (sessionId) where.sessionId = sessionId
    if (speakerId) where.speakerId = speakerId

    const materials = await prisma.material.findMany({
      where,
      include: {
        session: {
          select: {
            title: true,
            event: {
              select: {
                title: true,
              },
            },
          },
        },
        speaker: {
          select: {
            firstName: true,
            lastName: true,
            linkedin: true,
          },
        },
      },
      orderBy: {
        uploadedAt: "desc",
      },
    })

    return NextResponse.json({ materials }, { status: 200 })
  } catch (error) {
    console.error("Error fetching materials:", error)
    return NextResponse.json({ error: "Failed to fetch materials" }, { status: 500 })
  }
}

// POST - Upload new material to Cloudinary and save to database
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File
    const sessionId = formData.get("sessionId") as string
    const speakerId = formData.get("speakerId") as string
    const description = formData.get("description") as string | null
    const allowDownload = formData.get("allowDownload") === "true"
    const status = (formData.get("status") as "DRAFT" | "FINAL" | "ARCHIVED") || "DRAFT"

    if (!file || !sessionId || !speakerId) {
      return NextResponse.json({ error: "File, sessionId, and speakerId are required" }, { status: 400 })
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Determine file type based on MIME type
    let fileType: "PRESENTATION" | "DOCUMENT" | "VIDEO" | "IMAGE" | "OTHER" = "OTHER"
    if (file.type.includes("presentation") || file.type.includes("powerpoint")) {
      fileType = "PRESENTATION"
    } else if (file.type.includes("pdf") || file.type.includes("document")) {
      fileType = "DOCUMENT"
    } else if (file.type.includes("video")) {
      fileType = "VIDEO"
    } else if (file.type.includes("image")) {
      fileType = "IMAGE"
    }

    // Determine resource type for Cloudinary
    let resourceType: "image" | "video" | "raw" = "raw"
    if (file.type.startsWith("image/")) {
      resourceType = "image"
    } else if (file.type.startsWith("video/")) {
      resourceType = "video"
    }

    // Upload to Cloudinary
    const uploadResult = await new Promise<any>((resolve, reject) => {
      Cloudinary.uploader
        .upload_stream(
          {
            resource_type: resourceType,
            folder: `materials/${sessionId}`,
            use_filename: true,
            unique_filename: true,
          },
          (error, result) => {
            if (error) reject(error)
            else resolve(result)
          },
        )
        .end(buffer)
    })

    // Save to database
    const material = await prisma.material.create({
      data: {
        sessionId,
        speakerId,
        fileName: file.name,
        fileUrl: uploadResult.secure_url,
        publicId: uploadResult.public_id,
        fileSize: file.size,
        fileType,
        mimeType: file.type,
        status,
        allowDownload,
        description,
      },
      include: {
        session: {
          select: {
            title: true,
            event: {
              select: {
                title: true,
              },
            },
          },
        },
      },
    })

    return NextResponse.json({ material }, { status: 201 })
  } catch (error) {
    console.error("Error uploading material:", error)
    return NextResponse.json({ error: "Failed to upload material" }, { status: 500 })
  }
}
