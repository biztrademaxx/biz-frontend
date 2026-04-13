import { NextResponse } from "next/server"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"

// Proxy organizer details to the Express backend
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    const res = await fetch(`${API_BASE_URL}/api/organizers/${id}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    })

    const data = await res.json().catch(() => ({}))

    return NextResponse.json(data, { status: res.status })
  } catch (error) {
    console.error("Error proxying organizer GET:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

