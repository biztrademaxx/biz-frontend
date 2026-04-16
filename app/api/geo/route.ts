import { headers } from "next/headers"
import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

const emptyGeo = {
  city: null,
  region: null,
  countryCode: null,
  countryName: null,
} as const

/**
 * Approximate visitor location from request IP (Vercel / proxy forwards x-forwarded-for).
 * Used to prioritize cities in Browse by City. ipapi.co free tier — do not hammer in dev.
 */
// export async function GET() {
//   const h = await headers()
//   const forwarded = h.get("x-forwarded-for")?.split(",")[0]?.trim()
//   const ip =
//     forwarded && !forwarded.startsWith("127.") && forwarded !== "::1" && !forwarded.startsWith("192.168.")
//       ? forwarded
//       : null

//   try {
//     const url = ip ? `https://ipapi.co/${encodeURIComponent(ip)}/json/` : "https://ipapi.co/json/"
//     const r = await fetch(url, { cache: "no-store" })
//     if (!r.ok) {
//       return NextResponse.json(emptyGeo)
//     }
//     const d = (await r.json()) as Record<string, unknown>
//     if (d.error) {
//       return NextResponse.json(emptyGeo)
//     }
//     return NextResponse.json({
//       city: typeof d.city === "string" ? d.city : null,
//       region: typeof d.region === "string" ? d.region : null,
//       countryCode: typeof d.country_code === "string" ? d.country_code : null,
//       countryName: typeof d.country_name === "string" ? d.country_name : null,
//     })
//   } catch {
//     return NextResponse.json(emptyGeo)
//   }
// }
export async function GET() {
  const h = await headers()

  // ✅ Try Vercel first
  const countryCode = h.get("x-vercel-ip-country")

  if (countryCode) {
    return NextResponse.json({
      city: h.get("x-vercel-ip-city"),
      region: h.get("x-vercel-ip-country-region"),
      countryCode,
      countryName: countryCode,
    })
  }

  // 🔄 Fallback to ipapi (for local/dev)
  const forwarded = h.get("x-forwarded-for")?.split(",")[0]?.trim()

  function isPrivateIP(ip: string) {
    return (
      ip.startsWith("127.") ||
      ip.startsWith("192.168.") ||
      ip.startsWith("10.") ||
      ip.startsWith("172.") ||
      ip === "::1"
    )
  }

  const ip = forwarded && !isPrivateIP(forwarded) ? forwarded : null

  try {
    const url = ip
      ? `https://ipapi.co/${encodeURIComponent(ip)}/json/`
      : "https://ipapi.co/json/"

    const r = await fetch(url, { cache: "no-store" })
    if (!r.ok) return NextResponse.json(emptyGeo)

    const d = await r.json()

    return NextResponse.json({
      city: d.city ?? null,
      region: d.region ?? null,
      countryCode: d.country_code ?? null,
      countryName: d.country_name ?? null,
    })
  } catch {
    return NextResponse.json(emptyGeo)
  }
}