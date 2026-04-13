import { NextResponse } from "next/server"
import { Cloudinary } from "@/lib/cloudinary"

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"

function extractPublicIdFromUrl(url: string): string | null {
  if (!url?.includes("cloudinary.com")) return null
  const parts = url.split("/")
  const uploadIdx = parts.indexOf("upload")
  if (uploadIdx === -1) return null
  const afterVersion = parts.slice(uploadIdx + 2).join("/")
  return afterVersion.replace(/\.[^.]+$/, "") || null
}

export async function DELETE(request: Request) {
  try {
    const { id } = await request.json()

    if (!id) {
      return NextResponse.json({ error: "Manual ID is required" }, { status: 400 })
    }

    const getRes = await fetch(`${API_BASE}/api/exhibitor-manuals/${id}`)
    if (!getRes.ok) {
      return NextResponse.json({ error: "Manual not found" }, { status: 404 })
    }
    const { data: manual } = await getRes.json()
    const fileUrl = manual?.fileUrl

    if (fileUrl) {
      const publicId = extractPublicIdFromUrl(fileUrl)
      if (publicId) {
        try {
          await Cloudinary.uploader.destroy(publicId, { resource_type: "raw" })
        } catch (e) {
          console.warn("Cloudinary delete failed (file may already be gone):", e)
        }
      }
    }

    const delRes = await fetch(`${API_BASE}/api/exhibitor-manuals/${id}`, { method: "DELETE" })
    if (!delRes.ok) {
      const err = await delRes.json().catch(() => ({}))
      return NextResponse.json({ error: err.error ?? "Delete failed" }, { status: delRes.status })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Exhibitor manual delete error:", error)
    return NextResponse.json(
      { error: "Delete failed", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}
