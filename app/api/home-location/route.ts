import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { HOME_CITY_COOKIE } from "@/lib/home-location"

export const dynamic = "force-dynamic"

const COOKIE_MAX_AGE = 60 * 60 * 24 * 365

export async function GET() {
  const jar = await cookies()
  const city = jar.get(HOME_CITY_COOKIE)?.value?.trim() || null
  return NextResponse.json({ city })
}

export async function POST(req: Request) {
  let city = ""
  try {
    const body = (await req.json()) as { city?: string }
    city = String(body?.city ?? "").trim()
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 })
  }
  if (!city) {
    return NextResponse.json({ error: "city is required" }, { status: 400 })
  }

  const res = NextResponse.json({ ok: true, city })
  res.cookies.set(HOME_CITY_COOKIE, city, {
    path: "/",
    maxAge: COOKIE_MAX_AGE,
    sameSite: "lax",
  })
  return res
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true, city: null })
  res.cookies.set(HOME_CITY_COOKIE, "", {
    path: "/",
    maxAge: 0,
    sameSite: "lax",
  })
  return res
}
