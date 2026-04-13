import { NextResponse } from "next/server"

// Cache this route for 60 seconds
export const revalidate = 60

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"

export async function GET() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/events/vip`, {
      // Always fetch fresh VIP events from the backend
      cache: "no-store",
    })

    if (!res.ok) {
      console.error("VIP events backend error:", res.status, await res.text())
      return NextResponse.json({ events: [] }, { status: 200 })
    }

    const data = await res.json()

    // Backend returns an array of events; wrap it to match legacy shape { events }
    const events = Array.isArray(data) ? data : data.events ?? []

    return NextResponse.json({ events }, { status: 200 })
  } catch (e) {
    console.error("VIP events error", e)
    return NextResponse.json({ events: [] }, { status: 200 })
  }
}
