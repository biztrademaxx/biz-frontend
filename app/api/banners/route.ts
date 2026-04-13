// app/api/banners/route.ts
import { type NextRequest, NextResponse } from "next/server"
import { uploadToCloudinary, deleteFromCloudinary } from "@/lib/cloudinary"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = searchParams.get("page") || "event-detail"
    const position = searchParams.get("position")
    const venueId = searchParams.get("venueId")

    // Build query filter
    const where: any = {
      page,
      isActive: true
    }
    
    // If venueId is provided, filter banners for specific venue
    if (venueId) {
      // For venue banners, we can store venueId in the link field or add a new field
      // Using JSON in link field to store multiple info
      where.OR = [
        { link: { contains: venueId } },
        { link: { contains: `venue:${venueId}` } },
        { link: null } // Also include banners without specific venue
      ]
    }
    
    const banners = await prisma.banner.findMany({
      where,
      orderBy: [
        { order: 'asc' },
        { createdAt: 'desc' }
      ],
    })

    return NextResponse.json(banners)
  } catch (error) {
    console.error("Error fetching banners:", error)
    return NextResponse.json({ error: "Failed to fetch banners" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File
    const title = formData.get("title") as string
    const page = formData.get("page") as string
    const link = formData.get("link") as string | null
    const order = Number.parseInt(formData.get("order") as string) || 0
    const targetVenueId = formData.get("targetVenueId") as string | null
    const isGlobal = formData.get("isGlobal") as string === "true"

    if (!file || !title || !page) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Create folder structure based on page and venue
    let folder = `banners/${page}`
    if (targetVenueId && !isGlobal) {
      folder = `banners/${page}/venues/${targetVenueId}`
    }

    const uploadResult = await uploadToCloudinary(file, folder)

    // Prepare link data
    let bannerLink = link || undefined
    if (targetVenueId && !isGlobal) {
      // Store venue info in link field
      bannerLink = JSON.stringify({
        venueId: targetVenueId,
        originalLink: link || null,
        type: 'venue'
      })
    }

    const banner = await prisma.banner.create({
      data: {
        title,
        imageUrl: uploadResult.secure_url,
        publicId: uploadResult.public_id,
        page,
        link: bannerLink,
        order,
        isActive: true,
      },
    })

    return NextResponse.json(banner)
  } catch (error) {
    console.error("Error uploading banner:", error)
    return NextResponse.json({ error: "Failed to upload banner" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")
    
    if (!id) {
      return NextResponse.json({ error: "Missing banner ID" }, { status: 400 })
    }

    const body = await request.json()

    const banner = await prisma.banner.update({
      where: { id },
      data: body,
    })

    return NextResponse.json(banner)
  } catch (error) {
    console.error("Error updating banner:", error)
    return NextResponse.json({ error: "Failed to update banner" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")
    
    if (!id) {
      return NextResponse.json({ error: "Missing banner ID" }, { status: 400 })
    }

    const banner = await prisma.banner.findUnique({
      where: { id },
    })

    if (!banner) {
      return NextResponse.json({ error: "Banner not found" }, { status: 404 })
    }

    // Delete from Cloudinary
    if (banner.publicId) {
      await deleteFromCloudinary(banner.publicId)
    }

    await prisma.banner.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting banner:", error)
    return NextResponse.json({ error: "Failed to delete banner" }, { status: 500 })
  }
}