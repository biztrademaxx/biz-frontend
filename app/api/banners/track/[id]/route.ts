import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

type ParamsMaybePromise = Promise<{ id: string }> | { id: string }

async function resolveId(params: ParamsMaybePromise): Promise<string | undefined> {
  const p = params instanceof Promise ? await params : params
  const id = typeof p?.id === "string" ? p.id.trim() : ""
  return id || undefined
}

/**
 * POST /api/banners/track/:id — increments click count when Prisma + Banner rows exist (legacy admin banners).
 * CMS banners from the Express API live only in Postgres on the backend; when DATABASE_URL is unset on Vercel,
 * we no-op so clicks don't return 4xx/5xx.
 */
export async function POST(_request: NextRequest, ctx: { params: ParamsMaybePromise }) {
  try {
    const bannerId = await resolveId(ctx.params)
    if (!bannerId) {
      return NextResponse.json({ error: "Missing banner id" }, { status: 400 })
    }
    if (!prisma) {
      return NextResponse.json({ success: true, skipped: true })
    }

    await prisma.banner.update({
      where: { id: bannerId },
      data: {
        clickCount: { increment: 1 },
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    // Unknown id / wrong DB — avoid failing UX when banners come from API-only CMS
    console.warn("[banners/track] click skipped:", error)
    return NextResponse.json({ success: true, skipped: true })
  }
}
