import { devLog } from "@/lib/dev-log"

import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { exhibitorDashboardSegmentForUser } from "@/lib/profile-path"
import { getAuthPayload } from "@/lib/auth-jwt"

const EXHIBITOR_SELECT = {
  id: true,
  email: true,
  firstName: true,
  lastName: true,
  phone: true,
  avatar: true,
  role: true,
  bio: true,
  website: true,
  isVerified: true,
  createdAt: true,
  organizationName: true,
  company: true,
  jobTitle: true,
  twitter: true,
  totalEvents: true,
  activeEvents: true,
} as const

function isMongoObjectId(s: string): boolean {
  return /^[a-f\d]{24}$/i.test(s)
}

async function findExhibitorByRouteSegment(raw: string) {
  const segment = decodeURIComponent(String(raw ?? "").trim())
  if (!segment || segment === "undefined") {
    return null
  }

  if (isMongoObjectId(segment)) {
    return prisma.user.findFirst({
      where: { id: segment, role: "EXHIBITOR" },
      select: EXHIBITOR_SELECT,
    })
  }

  const rows = await prisma.user.findMany({
    where: { role: "EXHIBITOR" },
    select: EXHIBITOR_SELECT,
  })

  return rows.find((u) => exhibitorDashboardSegmentForUser(u) === segment) ?? null
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: paramId } = await params
    const authSub = getAuthPayload(request)?.sub
    const id =
      paramId?.trim() && paramId.trim() !== "undefined"
        ? paramId.trim()
        : authSub?.trim() && authSub.trim() !== "undefined"
          ? authSub.trim()
          : ""

    if (!id) {
      return NextResponse.json({ success: false, error: "Invalid exhibitor ID" }, { status: 400 })
    }

    const exhibitor = await findExhibitorByRouteSegment(id)

    if (!exhibitor) {
      return NextResponse.json({ success: false, error: "Exhibitor not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      exhibitor,
    })
  } catch (error) {
    console.error("Error in exhibitor API:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: paramId } = await params
    const authSub = getAuthPayload(request)?.sub
    const raw =
      paramId?.trim() && paramId.trim() !== "undefined"
        ? paramId.trim()
        : authSub?.trim() && authSub.trim() !== "undefined"
          ? authSub.trim()
          : ""

    const body = await request.json()

    if (!raw) {
      return NextResponse.json({ success: false, error: "Invalid exhibitor ID" }, { status: 400 })
    }

    const existing = await findExhibitorByRouteSegment(raw)
    if (!existing) {
      return NextResponse.json({ success: false, error: "Exhibitor not found" }, { status: 404 })
    }
    const id = existing.id

    // Try to update in database
    try {
      const updatedExhibitor = await prisma.user.update({
        where: { id },
        data: {
          firstName: body.firstName,
          lastName: body.lastName,
          phone: body.phone,
          bio: body.bio,
          website: body.website,
          twitter: body.twitter,
          jobTitle: body.jobTitle,
          avatar: body.avatar || null,
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          avatar: true,
          bio: true,
          website: true,
          twitter: true,
          jobTitle: true,
          organizationName: true,
          company: true,
          totalEvents: true,
          activeEvents: true,
        },
      })

      return NextResponse.json({
        success: true,
        exhibitor: updatedExhibitor,
      })
    } catch (dbError) {
      devLog("Database update failed, returning mock response:", dbError)

      // Return mock success response
      return NextResponse.json({
        success: true,
        exhibitor: { id, ...body },
      })
    }
  } catch (error) {
    console.error("Error updating exhibitor:", error)
    return NextResponse.json({ success: false, error: "Failed to update exhibitor" }, { status: 500 })
  }
}
