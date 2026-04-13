import { NextResponse } from "next/server"

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()

    // In a real app, update the security event in the database
    // For now, just return success
    return NextResponse.json({ success: true, id, ...body })
  } catch (error) {
    console.error("Error updating security event:", error)
    return NextResponse.json({ error: "Failed to update event" }, { status: 500 })
  }
}
