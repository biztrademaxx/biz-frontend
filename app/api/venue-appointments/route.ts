import { type NextRequest, NextResponse } from "next/server"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"

function getAuthHeader(request: NextRequest): string | undefined {
  const auth = request.headers.get("authorization")
  return auth || undefined
}

// --------------------- CREATE APPOINTMENT (proxy) ---------------------
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const res = await fetch(`${API_BASE_URL}/api/venue-appointments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(getAuthHeader(request) ? { Authorization: getAuthHeader(request)! } : {}),
      },
      body: JSON.stringify(body),
    })

    const data = await res.json().catch(() => ({}))
    return NextResponse.json(data, { status: res.status })
  } catch (error) {
    console.error("Error proxying appointment create:", error)
    return NextResponse.json(
      { error: "Failed to create appointment" },
      { status: 500 },
    )
  }
}

// --------------------- GET APPOINTMENTS (proxy) ---------------------
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.toString()
    const targetUrl = `${API_BASE_URL}/api/venue-appointments${query ? `?${query}` : ""}`

    const res = await fetch(targetUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(getAuthHeader(request) ? { Authorization: getAuthHeader(request)! } : {}),
      },
    })

    const data = await res.json().catch(() => ({}))
    return NextResponse.json(data, { status: res.status })
  } catch (error) {
    console.error("Error proxying appointments GET:", error)
    return NextResponse.json(
      { error: "Failed to fetch appointments" },
      { status: 500 },
    )
  }
}

// --------------------- UPDATE APPOINTMENT STATUS (proxy) ---------------------
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()

    const res = await fetch(`${API_BASE_URL}/api/venue-appointments`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...(getAuthHeader(request) ? { Authorization: getAuthHeader(request)! } : {}),
      },
      body: JSON.stringify(body),
    })

    const data = await res.json().catch(() => ({}))
    return NextResponse.json(data, { status: res.status })
  } catch (error) {
    console.error("Error proxying appointment update:", error)
    return NextResponse.json(
      { error: "Failed to update appointment" },
      { status: 500 },
    )
  }
}

// For compatibility – forward PUT as PATCH to backend
export async function PUT(request: NextRequest) {
  return PATCH(request)
}