// app/api/upload/route.ts
import { type NextRequest, NextResponse } from "next/server"
import { v2 as cloudinary } from "cloudinary"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const formData = await req.formData()
    const file = formData.get("file") as File
    const type = formData.get("type") as string // 'image', 'brochure', 'video'

    if (!file) {
      return NextResponse.json({ success: false, error: "No file provided" }, { status: 400 })
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Convert buffer to base64
    const base64File = `data:${file.type};base64,${buffer.toString("base64")}`

    // Upload to Cloudinary
    const uploadOptions: any = {
      folder: `products/${type}s`,
      resource_type: "auto",
      access_mode: "public", // CRITICAL: Makes the file publicly accessible
    }

    // Set specific options based on file type
    if (type === "image") {
      uploadOptions.transformation = [{ width: 1200, height: 1200, crop: "limit" }, { quality: "auto" }]
      uploadOptions.type = "upload" // Only set for images
    } else if (type === "brochure") {
      uploadOptions.resource_type = "raw"
      uploadOptions.format = "pdf"
      // Don't set type: "upload" for raw files - let Cloudinary use defaults
      // This ensures PDFs are delivered publicly without authentication
    }

    const result = await cloudinary.uploader.upload(base64File, uploadOptions)

    return NextResponse.json(
      {
        success: true,
        url: result.secure_url,
        publicId: result.public_id,
        type: type,
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("Error uploading file:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to upload file",
      },
      { status: 500 },
    )
  }
}

// DELETE - Remove file from Cloudinary
export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const { publicId, resourceType } = await req.json()

    if (!publicId) {
      return NextResponse.json({ success: false, error: "No public ID provided" }, { status: 400 })
    }

    // Delete from Cloudinary
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType || "image",
    })

    return NextResponse.json(
      {
        success: true,
        result: result,
        message: "File deleted successfully",
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("Error deleting file:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete file",
      },
      { status: 500 },
    )
  }
}
