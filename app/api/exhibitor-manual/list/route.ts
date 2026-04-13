import { NextResponse } from "next/server"

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const eventId = searchParams.get("eventId")

    if (!eventId) {
      return NextResponse.json({ error: "Event ID is required" }, { status: 400 })
    }

    const res = await fetch(`${API_BASE}/api/exhibitor-manuals?eventId=${encodeURIComponent(eventId)}`)
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      return NextResponse.json({ error: err.error ?? "Failed to fetch manuals" }, { status: res.status })
    }
    const json = await res.json()
    const list = json.data ?? []
    const mapped = list.map((doc: any) => ({
      ...doc,
      uploadedBy: doc.uploadedBy
        ? {
            ...doc.uploadedBy,
            name: [doc.uploadedBy.firstName, doc.uploadedBy.lastName].filter(Boolean).join(" ") || doc.uploadedBy.email,
          }
        : doc.uploadedBy,
    }))
    return NextResponse.json({ success: true, data: mapped })
  } catch (error) {
    console.error("Exhibitor manual list error:", error)
    return NextResponse.json(
      { error: "Failed to fetch manuals", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}
