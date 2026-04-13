import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const eventId = searchParams.get("eventId")
    // No backend or DB for featured hotels yet; return empty list so UI doesn't 404
    return NextResponse.json([])
  } catch (error) {
    console.error("Error fetching featured hotels:", error)
    return NextResponse.json({ error: "Failed to fetch featured hotels" }, { status: 500 })
  }
}
