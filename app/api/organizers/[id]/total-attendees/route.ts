import { type NextRequest, NextResponse } from "next/server"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: organizerId } = await params

    if (!organizerId) {
      return NextResponse.json(
        { success: false, error: "Organizer ID is required" },
        { status: 400 }
      )
    }

    const res = await fetch(
      `${API_BASE_URL}/api/organizers/${organizerId}/total-attendees`,
      { method: "GET", headers: { "Content-Type": "application/json" } }
    )

    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      return NextResponse.json(
        body?.error ? body : { success: false, error: "Failed to fetch total attendees" },
        { status: res.status }
      )
    }

    const data = await res.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching organizer total attendees:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch total attendees" },
      { status: 500 }
    )
  }
}
