import { NextResponse } from "next/server"

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"

export async function PATCH(request: Request) {
  try {
    const body = await request.json()
    const { id, description, version } = body

    if (!id) {
      return NextResponse.json({ error: "Manual ID is required" }, { status: 400 })
    }

    const res = await fetch(`${API_BASE}/api/exhibitor-manuals/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ description, version }),
    })

    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      return NextResponse.json({ error: err.error ?? "Update failed" }, { status: res.status })
    }
    const json = await res.json()
    return NextResponse.json({ success: true, data: json.data })
  } catch (error) {
    console.error("Exhibitor manual update error:", error)
    return NextResponse.json(
      { error: "Update failed", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}
