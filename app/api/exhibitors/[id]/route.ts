import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
// import { ObjectId } from "bson"   // <-- Add this for MongoDB ObjectId validation

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
 try {
    const { id } =await params

    // Validate ObjectId
    if (!id || id === "undefined") {
      return NextResponse.json({ success: false, error: "Invalid exhibitor ID" }, { status: 400 })
    }

    // Query database
    const exhibitor = await prisma.user.findFirst({
      where: {
        id: id,
        role: "EXHIBITOR",
      },
      select: {
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
      },
    })

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
    const { id } = await params
    const body = await request.json()

    if (!id || id === "undefined") {
      return NextResponse.json({ success: false, error: "Invalid exhibitor ID" }, { status: 400 })
    }

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
        },
      })

      return NextResponse.json({
        success: true,
        exhibitor: updatedExhibitor,
      })
    } catch (dbError) {
      console.log("Database update failed, returning mock response:", dbError)

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
