import { NextResponse } from "next/server"
import { proxyJson } from "@/lib/backend-proxy"

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string; speakerId: string }> },
) {
  try {
    const { id, speakerId } = await params
    return await proxyJson(req, `/api/events/${id}/speakers/${speakerId}`, { method: "DELETE" })
  } catch (err) {
    console.error("Proxy DELETE /api/events/[id]/speakers/[speakerId] failed:", err)
    return NextResponse.json(
      { success: false, error: "Failed to delete speaker" },
      { status: 500 },
    )
  }
}
