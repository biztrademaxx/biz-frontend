import { type NextRequest, NextResponse } from "next/server"
import { uploadToCloudinary } from "@/lib/cloudinary"
import {prisma} from "@/lib/prisma"

// Mock Cloudinary upload function - Replace with actual Cloudinary SDK
// async function uploadToCloudinary(file: File, folder: string) {
//   // In production, use Cloudinary SDK:
//   // const formData = new FormData()
//   // formData.append('file', file)
//   // formData.append('upload_preset', 'your_preset')
//   // formData.append('folder', folder)
//   // const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
//   //   method: 'POST',
//   //   body: formData
//   // })
//   // return await response.json()

//   // Mock response for now
//   return {
//     secure_url: URL.createObjectURL(file),
//     public_id: `${folder}/${Date.now()}`,
//     width: 1920,
//     height: 600,
//   }
// }

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = searchParams.get("page") || "event-detail"
    const position = searchParams.get("position")

    if (!prisma?.banner) {
      return NextResponse.json([])
    }

    // Build query filter
    const where: any = {
      page,
      isActive: true
    }
    
    const banners = await prisma.banner.findMany({
      where,
      orderBy: [
        { order: 'asc' },
        { createdAt: 'desc' }
      ],
    })

    return NextResponse.json(banners)
  } catch (error) {
    console.error("Error fetching banners:", error)
    return NextResponse.json({ error: "Failed to fetch banners" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!prisma?.banner) {
      return NextResponse.json({ error: "Banners not available" }, { status: 503 })
    }
    const formData = await request.formData()
    const file = formData.get("file") as File
    const title = formData.get("title") as string
    const page = formData.get("page") as string
    const link = formData.get("link") as string | null
    const order = Number.parseInt(formData.get("order") as string) || 0

    if (!file || !title || !page) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const uploadResult = (await uploadToCloudinary(file, `banners/${page}`)) as any

    const banner = await prisma.banner.create({
      data: {
        title,
        imageUrl: uploadResult.secure_url,
        publicId: uploadResult.public_id,
        page,
        link: link || undefined,
        order,
        isActive: true,
      },
    })

    return NextResponse.json(banner)
  } catch (error) {
    console.error("Error uploading banner:", error)
    return NextResponse.json({ error: "Failed to upload banner" }, { status: 500 })
  }
}
