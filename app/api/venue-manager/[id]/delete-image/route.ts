import { type NextRequest, NextResponse } from "next/server"
import { Cloudinary } from "@/lib/cloudinary"

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const publicId = searchParams.get("publicId")

    if (!publicId) {
      return NextResponse.json({ success: false, error: "No public ID provided" }, { status: 400 })
    }

    // Delete from Cloudinary
    const result = await Cloudinary.uploader.destroy(publicId)

    return NextResponse.json({
      success: true,
      data: result,
    })
  } catch (error) {
    console.error("Error deleting image:", error)
    return NextResponse.json({ success: false, error: "Failed to delete image" }, { status: 500 })
  }
}
