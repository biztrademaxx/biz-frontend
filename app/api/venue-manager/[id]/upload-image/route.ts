import { type NextRequest, NextResponse } from "next/server"
import { Cloudinary } from "@/lib/cloudinary"
import { maybeCompressImageServer } from "@/lib/compress-image-server"

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const formData = await req.formData()
    const file = formData.get("file") as File
    const type = formData.get("type") as string // 'venue', 'floorplan', 'logo'

    if (!file) {
      return NextResponse.json({ success: false, error: "No file provided" }, { status: 400 })
    }

    let uploadFile = file
    try {
      uploadFile = await maybeCompressImageServer(file)
    } catch (compressErr) {
      const message = compressErr instanceof Error ? compressErr.message : "Image is too large"
      return NextResponse.json({ success: false, error: message }, { status: 413 })
    }

    const arrayBuffer = await uploadFile.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const result = await new Promise((resolve, reject) => {
      Cloudinary.uploader
        .upload_stream(
          {
            folder: `venues/${id}/${type || "images"}`,
            resource_type: "auto",
          },
          (error, result) => {
            if (error) reject(error)
            else resolve(result)
          },
        )
        .end(buffer)
    })

    return NextResponse.json({
      success: true,
      data: result,
    })
  } catch (error) {
    console.error("Error uploading image:", error)
    return NextResponse.json({ success: false, error: "Failed to upload image" }, { status: 500 })
  }
}
