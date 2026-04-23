import { NextRequest, NextResponse } from "next/server"

export const dynamic = "force-dynamic"

type NominatimRow = {
  address?: {
    postcode?: string
  }
}

export async function GET(req: NextRequest) {
  const city = req.nextUrl.searchParams.get("city")?.trim() || ""
  const state = req.nextUrl.searchParams.get("state")?.trim() || ""
  const country = req.nextUrl.searchParams.get("country")?.trim() || ""

  if (!city || !country) {
    return NextResponse.json(
      { success: false, error: "city and country are required" },
      { status: 400 },
    )
  }

  const q = [city, state, country].filter(Boolean).join(", ")
  const url = new URL("https://nominatim.openstreetmap.org/search")
  url.searchParams.set("q", q)
  url.searchParams.set("format", "jsonv2")
  url.searchParams.set("addressdetails", "1")
  url.searchParams.set("limit", "1")

  try {
    const r = await fetch(url.toString(), {
      headers: {
        "User-Agent": "biz-frontend/1.0 (location postal code lookup)",
      },
      cache: "no-store",
    })

    if (!r.ok) {
      return NextResponse.json({ success: true, data: { postalCode: null } })
    }

    const rows = (await r.json()) as NominatimRow[]
    const postalCode = rows?.[0]?.address?.postcode ?? null
    return NextResponse.json({ success: true, data: { postalCode } })
  } catch {
    return NextResponse.json({ success: true, data: { postalCode: null } })
  }
}
