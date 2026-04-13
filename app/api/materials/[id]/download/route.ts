import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// GET - Track download and return file URL
export async function GET(request: NextRequest, { params }:{ params:  Promise<{ id: string }> }) {
  try {
    const material = await prisma.material.findUnique({
      where: { id: (await params).id },
    })

    if (!material) {
      return NextResponse.json({ error: "Material not found" }, { status: 404 })
    }

    if (!material.allowDownload) {
      return NextResponse.json({ error: "Download not allowed for this material" }, { status: 403 })
    }

    // Increment download count
    await prisma.material.update({
       where: { id: (await params).id },
      data: {
        downloadCount: {
          increment: 1,
        },
      },
    })

    return NextResponse.json(
      {
        fileUrl: material.fileUrl,
        fileName: material.fileName,
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("Error tracking download:", error)
    return NextResponse.json({ error: "Failed to process download" }, { status: 500 })
  }
}