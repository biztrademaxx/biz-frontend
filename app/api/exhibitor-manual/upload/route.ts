import { NextResponse } from "next/server"

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"

function getCloudinary() {
  const name = process.env.CLOUDINARY_CLOUD_NAME
  const key = process.env.CLOUDINARY_API_KEY
  const secret = process.env.CLOUDINARY_API_SECRET
  if (!name || !key || !secret) return null
  try {
    const { v2: cloudinary } = require("cloudinary")
    cloudinary.config({ cloud_name: name, api_key: key, api_secret: secret, secure: true })
    return cloudinary
  } catch {
    return null
  }
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File
    const eventId = (formData.get("eventId") as string)?.trim()
    const uploadedById = (formData.get("uploadedById") as string)?.trim()
    const description = (formData.get("description") as string)?.trim() || null

    if (!file) return NextResponse.json({ error: "File is required" }, { status: 400 })
    if (!eventId) return NextResponse.json({ error: "Event ID is required" }, { status: 400 })
    if (!uploadedById) return NextResponse.json({ error: "User ID is required" }, { status: 400 })

    if (file.type !== "application/pdf") {
      return NextResponse.json({ error: "Only PDF files are allowed" }, { status: 400 })
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "File size must be less than 10MB" }, { status: 400 })
    }

    const Cloudinary = getCloudinary()
    if (!Cloudinary) {
      return NextResponse.json(
        {
          error: "File upload is not configured",
          details: "Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in .env",
        },
        { status: 503 }
      )
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const uploadResult = await new Promise<{ secure_url?: string }>((resolve, reject) => {
      Cloudinary.uploader.upload_stream(
        {
          resource_type: "raw",
          folder: "exhibitor-manuals",
          public_id: `em_${eventId}_${Date.now()}`,
        },
        (error: Error | undefined, result: { secure_url?: string } | undefined) => {
          if (error) reject(error)
          else resolve(result ?? {})
        }
      ).end(buffer)
    })
    const fileUrl = uploadResult.secure_url ?? ""
    if (!fileUrl) {
      return NextResponse.json({ error: "Cloudinary upload did not return a URL" }, { status: 500 })
    }

    let backendRes: Response
    try {
      backendRes = await fetch(`${API_BASE}/api/exhibitor-manuals`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId,
          uploadedById,
          fileName: file.name,
          fileUrl,
          fileSize: file.size,
          mimeType: file.type,
          description: description || undefined,
        }),
      })
    } catch (fetchError) {
      console.error("Backend fetch error:", fetchError)
      return NextResponse.json(
        {
          error: "Backend unavailable",
          details: fetchError instanceof Error ? fetchError.message : "Is the API server running?",
        },
        { status: 502 }
      )
    }

    const errBody = await backendRes.json().catch(() => ({}))
    if (!backendRes.ok) {
      return NextResponse.json(
        { error: errBody.error ?? "Failed to save document" },
        { status: backendRes.status >= 400 ? backendRes.status : 500 }
      )
    }

    const data = errBody.data
    const mapped = data?.uploadedBy
      ? {
          ...data,
          uploadedBy: {
            ...data.uploadedBy,
            name: [data.uploadedBy.firstName, data.uploadedBy.lastName].filter(Boolean).join(" ") || data.uploadedBy.email,
          },
        }
      : data
    return NextResponse.json({ success: true, data: mapped })
  } catch (error) {
    console.error("Upload error:", error)
    const message = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json(
      { error: "Upload failed", details: message },
      { status: 500 }
    )
  }
}
