import { NextResponse } from "next/server"
import { v2 as cloudinary } from "cloudinary"

// ✅ Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
})

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File
    const type = formData.get("type") as string | null

    if (!file) {
      return NextResponse.json({ error: "File is required" }, { status: 400 })
    }

    if (!type || !["image", "pdf"].includes(type)) {
      return NextResponse.json(
        { error: "Type must be either 'image' or 'pdf'" },
        { status: 400 }
      )
    }

    // ✅ Validate file type & size
    if (type === "image") {
      const allowedImageTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/webp",
        "image/gif",
      ]
      if (!allowedImageTypes.includes(file.type)) {
        return NextResponse.json(
          { error: "Only JPEG, JPG, PNG, WebP, and GIF files are allowed" },
          { status: 400 }
        )
      }

      if (file.size > 10 * 1024 * 1024) {
        return NextResponse.json(
          { error: "Image size must be less than 10MB" },
          { status: 400 }
        )
      }
    }

    if (type === "pdf") {
      if (file.type !== "application/pdf") {
        return NextResponse.json(
          { error: "Only PDF files are allowed" },
          { status: 400 }
        )
      }

      if (file.size > 25 * 1024 * 1024) {
        return NextResponse.json(
          { error: "PDF size must be less than 25MB" },
          { status: 400 }
        )
      }
    }

    // ✅ Convert file to buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // ✅ Upload to Cloudinary
    const uploadResult = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: type === "image" ? "image" : "raw",
          folder: type === "image" ? "exhibitor-products" : "exhibitor-brochures",
          public_id: `${type}_${Date.now()}`,
        },
        (error, result) => {
          if (error) reject(error)
          else resolve(result)
        }
      )
      uploadStream.end(buffer)
    })

    const result = uploadResult as { secure_url: string; public_id: string }

    // ✅ Success response
    return NextResponse.json({
      success: true,
      url: result.secure_url,
      publicId: result.public_id,
      fileName: file.name,
      fileSize: file.size,
      mimeType: file.type,
    })
  } catch (error) {
    console.error("File upload error:", error)
    return NextResponse.json(
      {
        error: "Upload failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}
