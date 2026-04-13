import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import {Cloudinary} from "@/lib/cloudinary"

// GET - Fetch single material
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const material = await prisma.material.findUnique({
      where: { id:(await params).id },
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
          },
        },
      },
    })

    if (!material) {
      return NextResponse.json({ error: "Material not found" }, { status: 404 })
    }

    return NextResponse.json({ material }, { status: 200 })
  } catch (error) {
    console.error("Error fetching material:", error)
    return NextResponse.json({ error: "Failed to fetch material" }, { status: 500 })
  }
}

// PATCH - Update material settings
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const body = await request.json()
    const { allowDownload, status, description, version } = body

    const updateData: any = {}
    if (typeof allowDownload === "boolean") updateData.allowDownload = allowDownload
    if (status) updateData.status = status
    if (description !== undefined) updateData.description = description
    if (version) updateData.version = version

    const material = await prisma.material.update({
      where: { id: (await params).id },
      data: updateData,
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

    return NextResponse.json({ material }, { status: 200 })
  } catch (error) {
    console.error("Error updating material:", error)
    return NextResponse.json({ error: "Failed to update material" }, { status: 500 })
  }
}

// DELETE - Delete material from Cloudinary and database
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    // First, get the material to retrieve the publicId
    const material = await prisma.material.findUnique({
      where: { id: (await params).id },
    })

    if (!material) {
      return NextResponse.json({ error: "Material not found" }, { status: 404 })
    }

    // Determine resource type for Cloudinary deletion
    let resourceType: "image" | "video" | "raw" = "raw"
    if (material.mimeType.startsWith("image/")) {
      resourceType = "image"
    } else if (material.mimeType.startsWith("video/")) {
      resourceType = "video"
    }

    // Delete from Cloudinary
    await Cloudinary.uploader.destroy(material.publicId, {
      resource_type: resourceType,
    })

    // Delete from database
    await prisma.material.delete({
       where: { id: (await params).id },
    })

    return NextResponse.json({ message: "Material deleted successfully" }, { status: 200 })
  } catch (error) {
    console.error("Error deleting material:", error)
    return NextResponse.json({ error: "Failed to delete material" }, { status: 500 })
  }
}